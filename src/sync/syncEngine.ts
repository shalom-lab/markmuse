import { listAllEntries, readTextFile, writeTextFile, deleteFile } from '../storage/opfsFs';
import { GitHubClient } from './githubClient';
import { gitBlobSha1 } from './gitSha';
import type { GitHubConfig } from '../types/type';
import { toLogicalPath, toPhysicalPath } from '../storage/pathUtils';
import { updateFileBaseline, removeFileBaseline, clearBaseline } from '../storage/syncBaseline';

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
 * 增量推送：本地 → 远程（只增不删）
 * 
 * 策略：
 * 1. 同步前批量获取远程 SHA 映射（1次API调用）
 * 2. 遍历本地文件，计算本地 SHA
 * 3. 比较本地 SHA 和远程 SHA：
 *    - 如果相同 → 跳过（文件没变）
 *    - 如果不同 → PUT（带远程 SHA 更新或创建）
 */
export async function syncAllMarkdownFiles(cfg: GitHubConfig): Promise<SyncResult> {
  const client = new GitHubClient(cfg);
  const result: SyncResult = {
    pushed: 0,
    pulled: 0,
    deleted: 0,
    skipped: 0,
    errors: []
  };

  try {
    // 1. 批量获取远程 SHA 映射（1次API调用）
    console.log('📥 获取远程文件列表...');
    const remoteFiles = await client.listMarkMuseFiles();
    const remoteShaMap = new Map<string, string>();
    for (const remoteFile of remoteFiles) {
      remoteShaMap.set(remoteFile.localPath, remoteFile.sha);
    }
    console.log(`📥 获取到 ${remoteFiles.length} 个远程文件`);

    // 2. 获取所有本地文件
    const entries = await listAllEntries();
    
    // Markdown 文件
    const mdFiles = entries.filter(e => !e.isDirectory && e.path.endsWith('.md'));
    
    // 主题文件
    const themeFiles = entries.filter(e => !e.isDirectory && e.path.startsWith('.themes/') && e.path.endsWith('.css'));
    
    const allLocalFiles = [...mdFiles, ...themeFiles];
    console.log(`📤 发现 ${allLocalFiles.length} 个本地文件需要同步`);

    // 3. 遍历本地文件，计算 SHA 并比较
    for (const file of allLocalFiles) {
      try {
        // 转换为逻辑路径（用于与远程映射比较）
        const logicalPath = toLogicalPath(file.path);
        
        // 读取本地文件内容
        const localContent = await readTextFile(file.path);
        if (localContent === null) {
          console.warn(`⚠️ 无法读取本地文件: ${file.path}`);
          continue;
        }

        // 计算本地 SHA
        const localSha = await gitBlobSha1(localContent);
        
        // 获取远程 SHA（从映射中查找）
        const remoteSha = remoteShaMap.get(logicalPath);

        // 判断是否需要推送
        if (remoteSha && localSha === remoteSha) {
          // ✅ 文件未变化，跳过
          result.skipped++;
          continue;
        }

        // ❌ 需要推送（文件被修改或新文件）
        try {
          if (remoteSha) {
            // 更新（带远程 SHA）
            await client.putFile(logicalPath, localContent, remoteSha, `Update ${logicalPath}`);
            console.log(`⬆️ 更新: ${logicalPath}`);
          } else {
            // 创建（不带 SHA）
            await client.putFile(logicalPath, localContent, undefined, `Create ${logicalPath}`);
            console.log(`⬆️ 创建: ${logicalPath}`);
          }
          result.pushed++;
        } catch (putError: any) {
          // 422 错误：文件已存在，需要 SHA（可能远程映射不完整）
          if (putError.status === 422 && putError.message?.includes('sha')) {
            console.log(`⚠️ 文件已存在但映射中无 SHA，重新获取: ${logicalPath}`);
            // 重新获取该文件的 SHA
            const retryRemote = await client.getFile(logicalPath);
            if (retryRemote) {
              // 使用重新获取的 SHA 更新
              await client.putFile(logicalPath, localContent, retryRemote.sha, `Update ${logicalPath}`);
              console.log(`⬆️ 更新: ${logicalPath} (重试)`);
              result.pushed++;
            } else {
              throw new Error(`无法获取文件 ${logicalPath} 的 SHA`);
            }
          } else {
            throw putError;
          }
        }
      } catch (error: any) {
        const errorMsg = error?.message || '同步失败';
        result.errors.push(`${file.path}: ${errorMsg}`);
        console.error(`❌ 同步文件失败: ${file.path}`, error);
      }
    }

    console.log(`✅ 增量推送完成: 推送 ${result.pushed} 个，跳过 ${result.skipped} 个`);
    if (result.errors.length > 0) {
      console.warn(`⚠️ 有 ${result.errors.length} 个错误`);
    }

  } catch (error: any) {
    const errorMsg = error?.message || '同步失败';
    result.errors.push(`同步过程失败: ${errorMsg}`);
    console.error('❌ 同步过程失败:', error);
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
export async function pullAllRemoteFiles(cfg: GitHubConfig): Promise<SyncResult> {
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
        removeFileBaseline(filePath);
        result.deleted++;
        console.log(`🗑️ 删除本地文件: ${filePath}`);
      } catch (error: any) {
        result.errors.push(`${filePath} (删除): ${error.message || '删除失败'}`);
        console.error(`删除本地文件失败: ${filePath}`, error);
      }
    }

    // 2. 清空基线（确保基线干净）
    clearBaseline();

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
        updateFileBaseline(remoteFile.localPath, localSha);
        
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
export async function pushToRemote(cfg: GitHubConfig): Promise<SyncResult> {
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
        removeFileBaseline(localPath);
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
        updateFileBaseline(localFile.path, localSha);
        
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


