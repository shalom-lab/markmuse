import { withSyncLock } from './syncCoordinator';
import { listAllEntries, readTextFile, writeTextFile, deleteFile } from '../storage/opfsFs';
import { GitHubClient } from './githubClient';
import { gitBlobSha1 } from './gitSha';
import type { GitHubConfig } from '../types/type';
import { toLogicalPath, toPhysicalPath } from '../storage/pathUtils';
import { getFileBaseline, updateFileBaseline, removeFileBaseline, clearBaseline } from '../storage/syncBaseline';

/** Local-first push: remote changes require explicit user resolution. */
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

/** Push only when the remote still matches our last successful sync. */
export function syncAllMarkdownFiles(cfg: GitHubConfig): Promise<SyncResult> {
  return withSyncLock(() => pushIncremental(cfg));
}

async function pushIncremental(cfg: GitHubConfig): Promise<SyncResult> {
  const client = new GitHubClient(cfg);
  const result: SyncResult = { pushed: 0, pulled: 0, deleted: 0, skipped: 0, errors: [] };
  try {
    const remoteFiles = await client.listMarkMuseFiles();
    const remote = new Map(remoteFiles.map(file => [file.localPath, file.sha]));
    const entries = await listAllEntries();
    for (const file of entries) {
      if (file.isDirectory || !(file.path.startsWith('files/') && file.path.endsWith('.md') || file.path.startsWith('.themes/') && file.path.endsWith('.css'))) continue;
      const path = toLogicalPath(file.path);
      try {
        const content = await readTextFile(file.path);
        if (content === null) throw new Error('无法读取本地文件，已停止推送此文件');
        const sha = await gitBlobSha1(content);
        const remoteSha = remote.get(path);
        const baseline = getFileBaseline(path, cfg);
        if (sha === remoteSha) {
          updateFileBaseline(path, sha, cfg);
          result.skipped++;
          continue;
        }
        if (remoteSha !== baseline) {
          throw new Error(remoteSha
            ? '远程存在未同步的版本，已保留两边内容，请先备份并处理差异'
            : '远程文件已删除，已暂停推送以免重新创建');
        }
        // Never retry a rejected write with a newer SHA: that would overwrite a concurrent edit.
        await client.putFile(path, content, remoteSha, 'Update ' + path);
        updateFileBaseline(path, sha, cfg);
        result.pushed++;
      } catch (error: any) {
        result.errors.push(path + ': ' + (error?.message || '推送失败'));
      }
    }
  } catch (error: any) {
    result.errors.push(error?.message || '推送失败');
  }
  return result;
}

/**
 * 覆盖本地：用远程数据强制覆盖本地所有文件
 * 1. 删除本地所有文件（.md 和 .themes/*.css）
 * 2. 清空基线
 * 3. 拉取远程所有文件
 * 4. 更新基线
 */
export function pullAllRemoteFiles(cfg: GitHubConfig): Promise<SyncResult> {
  return withSyncLock(() => pullAllRemoteFilesUnlocked(cfg), true);
}

async function pullAllRemoteFilesUnlocked(cfg: GitHubConfig): Promise<SyncResult> {
  const client = new GitHubClient(cfg);
  const result: SyncResult = {
    pushed: 0,
    pulled: 0,
    deleted: 0,
    skipped: 0,
    errors: []
  };

  try {
    // 1. 删除本地所有文件（.md 和 .themes/*.css）
    const localEntries = await listAllEntries();
    const filesToDelete: string[] = [];
    
    for (const entry of localEntries) {
      if (!entry.isDirectory && (entry.path.endsWith('.md') || entry.path.startsWith('.themes/'))) {
        filesToDelete.push(entry.path);
      }
    }
    
    console.log(`🗑️ 发现 ${filesToDelete.length} 个本地文件需要删除`);
    
    for (const filePath of filesToDelete) {
      try {
        await deleteFile(filePath);
        removeFileBaseline(toLogicalPath(filePath), cfg);
        result.deleted++;
        console.log(`🗑️ 删除本地文件: ${filePath}`);
      } catch (error: any) {
        result.errors.push(`${filePath} (删除): ${error.message || '删除失败'}`);
        console.error(`删除本地文件失败: ${filePath}`, error);
      }
    }

    // 2. 清空基线（确保基线干净）
    clearBaseline(cfg);

    // 3. 列出远程所有文件
    const remoteFiles = await client.listMarkMuseFiles();
    console.log(`📥 发现 ${remoteFiles.length} 个远程文件`);

    // 4. 拉取远程所有文件
    for (const remoteFile of remoteFiles) {
      try {
        // 只处理 .md 和 .themes/*.css 文件
        if (!remoteFile.localPath.endsWith('.md') && !remoteFile.localPath.startsWith('.themes/')) {
          continue;
        }

        // 直接使用 repoPath（远程完整路径）获取文件内容，避免路径转换问题
        let fileData: { sha: string; content: string } | null = null;
        
        // 先尝试使用 localPath 获取（正常情况）
        fileData = await client.getFile(remoteFile.localPath);
        
        // 如果使用 localPath 失败，直接使用 GitHub API 获取 repoPath
        if (!fileData) {
          try {
            // 直接使用 repoPath 调用 GitHub API
            const octokit = (client as any).octokit;
            const res = await octokit.repos.getContent({
              owner: cfg.owner,
              repo: cfg.repo,
              path: remoteFile.repoPath,
              ref: cfg.branch
            });

            if (Array.isArray(res.data)) {
              console.warn(`远程路径是目录，不是文件: ${remoteFile.repoPath}`);
              continue;
            }

            // 检查 content 字段
            if (!('content' in res.data)) {
              console.warn(`远程文件没有 content 字段: ${remoteFile.repoPath}`, res.data);
              continue;
            }

            // 即使 content 为空字符串，也继续处理（空文件也是有效文件）
            const rawContent = res.data.content;
            if (rawContent === null || rawContent === undefined) {
              console.warn(`远程文件 content 为 null/undefined: ${remoteFile.repoPath}`);
              continue;
            }

            // 处理 base64 内容（GitHub API 返回的 content 是 base64 编码的）
            let content = '';
            if (typeof rawContent === 'string' && rawContent.length > 0) {
              try {
                const base64Content = rawContent.replace(/\s/g, '');
                const binaryString = atob(base64Content);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                content = new TextDecoder('utf-8').decode(bytes);
              } catch (decodeError) {
                console.error(`解码 base64 内容失败: ${remoteFile.repoPath}`, decodeError);
                result.errors.push(`${remoteFile.localPath}: 解码文件内容失败`);
                continue;
              }
            }
            // 注意：content 为空字符串也是有效的（空文件）

            fileData = {
              sha: res.data.sha || '',
              content
            };
            console.log(`✅ 使用 repoPath 成功获取: ${remoteFile.localPath} (repoPath: ${remoteFile.repoPath}, 内容长度: ${content.length})`);
          } catch (error: any) {
            result.errors.push(`${remoteFile.localPath}: ${error.message || '无法获取远程文件内容'}`);
            console.error(`无法获取远程文件内容: ${remoteFile.localPath} (repoPath: ${remoteFile.repoPath})`, error);
            continue;
          }
        }

        // 将逻辑路径转换为物理路径（localPath 可能是逻辑路径，需要转换为物理路径）
        // .md 文件需要加上 files/ 前缀，.themes/ 文件保持不变
        const physicalPath = toPhysicalPath(remoteFile.localPath);
        
        // 写入本地（使用物理路径）
        await writeTextFile(physicalPath, fileData.content);
        
        // 更新基线（使用逻辑路径，因为基线存储的是逻辑路径）
        const localSha = await gitBlobSha1(fileData.content);
        updateFileBaseline(remoteFile.localPath, localSha, cfg);
        
        result.pulled++;
        console.log(`⬇️ 拉取文件: ${remoteFile.localPath}`);
      } catch (error: any) {
        result.errors.push(`${remoteFile.localPath}: ${error.message || '拉取失败'}`);
        console.error(`拉取文件失败: ${remoteFile.localPath}`, error);
      }
    }

    console.log(`✅ 覆盖本地完成: 拉取 ${result.pulled} 个，删除 ${result.deleted} 个`);
  } catch (error: any) {
    result.errors.push(`覆盖本地失败: ${error.message || '未知错误'}`);
    console.error('覆盖本地失败:', error);
  }

  return result;
}

/**
 * 覆盖远程：用本地数据强制覆盖远程所有文件
 * 1. 获取所有远程文件的 SHA
 * 2. 删除所有远程文件
 * 3. 推送所有本地文件
 * 4. 更新基线
 */
export function pushToRemote(cfg: GitHubConfig): Promise<SyncResult> {
  return withSyncLock(() => pushToRemoteUnlocked(cfg));
}

async function pushToRemoteUnlocked(cfg: GitHubConfig): Promise<SyncResult> {
  const client = new GitHubClient(cfg);
  const result: SyncResult = {
    pushed: 0,
    pulled: 0,
    deleted: 0,
    skipped: 0,
    errors: []
  };

  try {
    // 1. 获取远程 .markmuse 文件夹下的所有文件的 SHA（用于删除）
    const remoteFiles = await client.listMarkMuseFiles();
    const remoteFilesToDelete: Array<{ repoPath: string; sha: string }> = [];
    
    for (const remoteFile of remoteFiles) {
      // 只处理 .md 和 .themes/*.css 文件
      if (remoteFile.localPath.endsWith('.md') || remoteFile.localPath.startsWith('.themes/')) {
        // 只保存 repoPath（远程完整路径）和 sha，删除时直接使用 repoPath
        remoteFilesToDelete.push({ 
          repoPath: remoteFile.repoPath, 
          sha: remoteFile.sha 
        });
      }
    }
    console.log(`🗑️ 发现 ${remoteFilesToDelete.length} 个远程文件需要删除`);

    // 2. 删除所有远程文件（直接使用 repoPath，不涉及本地路径）
    for (const remoteFile of remoteFilesToDelete) {
      try {
        // 直接使用 repoPath 删除（不需要路径转换）
        const octokit = (client as any).octokit;
        await octokit.repos.deleteFile({
          owner: cfg.owner,
          repo: cfg.repo,
          branch: cfg.branch,
          path: remoteFile.repoPath,
          message: `覆盖远程: 删除 ${remoteFile.repoPath}`,
          sha: remoteFile.sha
        });
        // 删除基线（需要将 repoPath 转换为 localPath）
        // 从 repoPath 提取 localPath：去掉 basePath/.markmuse/ 前缀，然后去掉 files/ 前缀
        let localPath = remoteFile.repoPath;
        const base = cfg.basePath ? `${cfg.basePath}/` : '';
        if (localPath.startsWith(base + '.markmuse/')) {
          localPath = localPath.slice((base + '.markmuse/').length);
        }
        if (localPath.startsWith('files/')) {
          localPath = localPath.slice(6);
        }
        removeFileBaseline(localPath, cfg);
        result.deleted++;
        console.log(`🗑️ 删除远程文件: ${remoteFile.repoPath}`);
      } catch (error: any) {
        result.errors.push(`${remoteFile.repoPath} (删除): ${error.message || '删除失败'}`);
        console.error(`删除远程文件失败: ${remoteFile.repoPath}`, error);
      }
    }

    // 注意：GitHub API 的删除操作可能需要一些时间才能完全生效
    // 不等待，直接推送。如果文件还存在（遇到 422 错误），推送时会自动获取 sha 并更新

    // 3. 获取所有本地文件
    const localEntries = await listAllEntries();
    const localFiles: Array<{ path: string; content: string }> = [];
    
    for (const entry of localEntries) {
      if (!entry.isDirectory && (entry.path.endsWith('.md') || entry.path.startsWith('.themes/'))) {
        const content = await readTextFile(entry.path);
        if (content !== null) {
          localFiles.push({ path: entry.path, content });
        }
      }
    }
    console.log(`📤 发现 ${localFiles.length} 个本地文件需要推送`);

    // 4. 推送所有本地文件
    // 注意：即使删除了所有远程文件，由于 GitHub API 的异步性，可能文件还存在
    // 如果推送时遇到 422 错误（需要 sha），说明文件还存在，先获取 sha 再更新
    for (const localFile of localFiles) {
      try {
        // 计算本地 SHA
        const localSha = await gitBlobSha1(localFile.content);
        
        // 先尝试作为新文件创建（不传 sha）
        try {
          await client.putFile(
            localFile.path,
            localFile.content,
            undefined,
            `覆盖远程: ${localFile.path}`
          );
        } catch (createError: any) {
          // 如果创建失败（422 错误，需要 sha），说明文件还存在，先获取 sha 再更新
          if (createError.status === 422 && createError.message?.includes('sha')) {
            console.log(`文件已存在，获取 sha 后更新: ${localFile.path}`);
            const remote = await client.getFile(localFile.path);
            if (remote) {
              // 使用 sha 更新文件
              await client.putFile(
                localFile.path,
                localFile.content,
                remote.sha,
                `覆盖远程: ${localFile.path}`
              );
            } else {
              // 无法获取 sha，抛出错误
              throw new Error(`无法获取文件 ${localFile.path} 的 SHA`);
            }
          } else {
            // 其他错误，直接抛出
            throw createError;
          }
        }
        
        // 更新基线
        updateFileBaseline(toLogicalPath(localFile.path), localSha, cfg);
        
        result.pushed++;
        console.log(`⬆️ 推送文件: ${localFile.path}`);
      } catch (error: any) {
        result.errors.push(`${localFile.path}: ${error.message || '推送失败'}`);
        console.error(`推送文件失败: ${localFile.path}`, error);
      }
    }

    console.log(`✅ 覆盖远程完成: 推送 ${result.pushed} 个，删除 ${result.deleted} 个`);
  } catch (error: any) {
    result.errors.push(`覆盖远程失败: ${error.message || '未知错误'}`);
    console.error('覆盖远程失败:', error);
  }

  return result;
}


