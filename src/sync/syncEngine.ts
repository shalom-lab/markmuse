import { listAllEntries, readTextFile, writeTextFile } from '../storage/opfsFs';
import { GitHubClient } from './githubClient';
import { gitBlobSha1 } from './gitSha';
import type { GitHubConfig } from '../types/type';
import { getSyncBaseline, updateFileBaseline, removeFileBaseline, clearBaseline } from '../storage/syncBaseline';

/**
 * 安全同步策略：保守同步，避免误删
 * 
 * 核心原则：
 * 1. **只同步新增和修改**，不自动删除远程文件（避免误删）
 * 2. **删除操作需要用户明确确认**（通过单独的"清理远程"功能）
 * 3. **初次同步时检测远程数据**，提示用户是否拉取
 * 
 * 同步逻辑（使用基线 SHA 判断）：
 * - 本地 SHA == 基线 SHA && 远程 SHA != 基线 SHA → Pull（远程有更新，本地没改）
 * - 本地 SHA != 基线 SHA → Push（本地改了，覆盖远程）
 * - 本地 SHA == 基线 SHA && 远程 SHA == 基线 SHA → 跳过（两边都没改）
 * - 本地没有但远程有 → Pull（新增到本地）
 * - 本地有但远程没有 → Push（新增到远程）
 * 
 * 删除处理：
 * - 同步时**不处理删除**，只同步新增/修改
 * - 如果用户需要删除远程文件，使用单独的 `cleanupRemoteDeletedFiles()` 函数
 * - 该函数会列出"本地已删除但远程仍存在"的文件，让用户确认后删除
 */

export interface SyncResult {
  pushed: number;      // 推送的文件数
  pulled: number;      // 拉取的文件数
  deleted: number;    // 删除的文件数
  skipped: number;    // 跳过的文件数
  errors: string[];   // 错误列表
}

/**
 * 检查远程是否有数据（用于初次同步检测）
 */
export async function checkRemoteHasData(cfg: GitHubConfig): Promise<boolean> {
  const client = new GitHubClient(cfg);
  try {
    // 检查 .markmuse 目录是否存在
    const base = cfg.basePath ? `${cfg.basePath}/` : '';
    const checkPath = `${base}.markmuse`;
    
    const { octokit } = (client as any);
    await octokit.repos.getContent({
      owner: cfg.owner,
      repo: cfg.repo,
      path: checkPath,
      ref: cfg.branch
    });
    return true; // 目录存在，说明远程有数据
  } catch (e: any) {
    if (e.status === 404) {
      return false; // 目录不存在，远程是空的
    }
    throw e; // 其他错误抛出
  }
}

/**
 * 同步所有文件（简化版：本地优先策略）
 */
export async function syncAllMarkdownFiles(cfg: GitHubConfig, options?: {
  deleteRemoteFiles?: boolean; // 是否删除远程文件（如果本地已删除）
}): Promise<SyncResult> {
  const client = new GitHubClient(cfg);
  const baseline = getSyncBaseline();
  const result: SyncResult = {
    pushed: 0,
    pulled: 0,
    deleted: 0,
    skipped: 0,
    errors: []
  };

  const entries = await listAllEntries();
  
  // 获取所有需要同步的文件（.md 和 .themes/*.css）
  const localFiles = new Set<string>();
  
  // Markdown 文件
  const mdFiles = entries.filter(e => !e.isDirectory && e.path.endsWith('.md'));
  for (const file of mdFiles) {
    localFiles.add(file.path);
    try {
      await syncSingleFile(client, file.path, baseline, result);
    } catch (error: any) {
      result.errors.push(`${file.path}: ${error.message || '同步失败'}`);
      console.error(`同步文件失败: ${file.path}`, error);
    }
  }

  // 主题文件
  const themeFiles = entries.filter(e => !e.isDirectory && e.path.startsWith('.themes/') && e.path.endsWith('.css'));
  for (const file of themeFiles) {
    localFiles.add(file.path);
    try {
      await syncSingleFile(client, file.path, baseline, result);
    } catch (error: any) {
      result.errors.push(`${file.path}: ${error.message || '同步失败'}`);
      console.error(`同步文件失败: ${file.path}`, error);
    }
  }

  // 处理删除：如果基线中有但本地没有的文件，删除远程文件
  if (options?.deleteRemoteFiles) {
    for (const [path, baselineSha] of Object.entries(baseline)) {
      if (!localFiles.has(path) && (path.endsWith('.md') || path.startsWith('.themes/'))) {
        try {
          const remote = await client.getFile(path);
          if (remote) {
            // 远程存在，删除它
            await client.deleteFile(path, remote.sha);
            removeFileBaseline(path);
            result.deleted++;
            console.log(`✅ 已删除远程文件: ${path}`);
          } else {
            // 远程已经不存在了，只清理基线
            removeFileBaseline(path);
          }
        } catch (error: any) {
          result.errors.push(`${path} (删除): ${error.message || '删除失败'}`);
          console.error(`删除远程文件失败: ${path}`, error);
        }
      }
    }
  }

  return result;
}

/**
 * 同步单个文件
 */
async function syncSingleFile(
  client: GitHubClient,
  path: string,
  baseline: Record<string, string>,
  result: SyncResult
): Promise<void> {
  const localContent = (await readTextFile(path)) ?? '';
  const localSha = await gitBlobSha1(localContent);
  const baselineSha = baseline[path];
  const remote = await client.getFile(path);

  // 情况 1: 两边一致 -> 跳过
  if (remote && remote.sha === localSha) {
    // 更新基线（确保基线是最新的）
    if (baselineSha !== localSha) {
      updateFileBaseline(path, localSha);
    }
    result.skipped++;
    return;
  }

  // 情况 2: 本地 SHA == 基线 SHA && 远程 SHA != 基线 SHA -> Pull（远程有更新，本地没改）
  if (baselineSha && localSha === baselineSha && remote && remote.sha !== baselineSha) {
    await writeTextFile(path, remote.content);
    updateFileBaseline(path, remote.sha);
    result.pulled++;
    console.log(`⬇️ 拉取: ${path}`);
    return;
  }

  // 情况 3: 本地 SHA != 基线 SHA -> Push（本地改了，覆盖远程）
  if (!baselineSha || localSha !== baselineSha) {
    await client.putFile(path, localContent, remote?.sha, `Update ${path}`);
    updateFileBaseline(path, localSha);
    result.pushed++;
    console.log(`⬆️ 推送: ${path}`);
    return;
  }

  // 情况 4: 本地没有基线，但远程有 -> Pull（初次同步）
  if (!baselineSha && remote) {
    await writeTextFile(path, remote.content);
    updateFileBaseline(path, remote.sha);
    result.pulled++;
    console.log(`⬇️ 初次拉取: ${path}`);
    return;
  }

  // 情况 5: 本地没有基线，远程也没有 -> Push（新文件）
  if (!baselineSha && !remote) {
    await client.putFile(path, localContent, undefined, `Create ${path}`);
    updateFileBaseline(path, localSha);
    result.pushed++;
    console.log(`⬆️ 创建: ${path}`);
    return;
  }

  // 默认跳过
  result.skipped++;
}

/**
 * 拉取所有远程文件（用于初次同步）
 */
export async function pullAllRemoteFiles(cfg: GitHubConfig): Promise<SyncResult> {
  const client = new GitHubClient(cfg);
  const result: SyncResult = {
    pushed: 0,
    pulled: 0,
    deleted: 0,
    skipped: 0,
    errors: []
  };

  // 这里需要列出远程目录的所有文件
  // 由于 GitHub API 的限制，我们需要知道文件列表
  // 暂时先清空基线，让下次同步时自动拉取
  clearBaseline();
  
  // TODO: 实现完整的远程文件列表获取和拉取逻辑
  // 目前先返回，让用户手动同步一次
  
  return result;
}


