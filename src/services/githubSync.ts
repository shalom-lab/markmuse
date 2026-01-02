/**
 * GitHub 同步服务
 * 处理 IndexedDB 和 GitHub 仓库之间的双向同步
 */

import { db, IFile, IFolder } from '../db';
import { GitHubApi } from './githubApi';

interface SyncMetadata {
  lastSyncTime: Date | null;
  lastSyncHash: string;
  isSyncing: boolean;
  syncError: string | null;
}

interface SyncResult {
  success: boolean;
  message: string;
  stats?: {
    filesAdded: number;
    filesUpdated: number;
    filesDeleted: number;
    themesAdded: number;
    themesUpdated: number;
    themesDeleted: number;
  };
}

export class GitHubSync {
  private api: GitHubApi;
  private syncBasePath: string; // 同步基础路径，如 'docs' 或 ''（根目录）
  private markmusePath: string; // .markmuse 文件夹的完整路径
  private filesBasePath: string; // .markmuse/files
  private themesBasePath: string; // .markmuse/themes
  private metadataPath: string; // .markmuse/metadata.json

  constructor(token: string, repo: string, syncBasePath: string = '') {
    this.api = new GitHubApi(token, repo);
    this.syncBasePath = syncBasePath.trim();
    
    // 构建 .markmuse 相关路径
    if (this.syncBasePath) {
      this.markmusePath = `${this.syncBasePath}/.markmuse`;
    } else {
      this.markmusePath = '.markmuse';
    }
    this.filesBasePath = `${this.markmusePath}/files`;
    this.themesBasePath = `${this.markmusePath}/themes`;
    this.metadataPath = `${this.markmusePath}/metadata.json`;
  }

  /**
   * 获取同步元数据
   */
  private async getMetadata(): Promise<SyncMetadata | null> {
    try {
      const file = await this.api.getFile(this.metadataPath);
      if (!file) {
        return null;
      }
      return JSON.parse(file.content);
    } catch {
      return null;
    }
  }

  /**
   * 保存同步元数据
   */
  private async saveMetadata(metadata: SyncMetadata, sha?: string): Promise<void> {
    const content = JSON.stringify(metadata, null, 2);
    try {
      await this.api.putFile(
        this.metadataPath,
        content,
        sha,
        sha ? 'Update sync metadata' : 'Create sync metadata'
      );
    } catch (error) {
      // 提供更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      // 如果是权限错误（403），提供详细的解决建议
      if (error instanceof Error && (errorMessage.includes('403') || errorMessage.includes('权限不足') || errorMessage.includes('personal access token'))) {
        throw new Error(
          `保存同步元数据失败: ${errorMessage}\n\n解决方案：\n1. 检查 GitHub Token 是否有 'repo' 权限（完整仓库访问权限）\n2. 如果是私有仓库，确保 Token 有访问权限\n3. 重新生成 Token：GitHub Settings → Developer settings → Personal access tokens → Generate new token\n4. 选择 'repo' 权限范围`
        );
      }
      // 如果是 404 错误，可能是权限问题或路径问题
      if (error instanceof Error && errorMessage.includes('404')) {
        throw new Error(
          `保存同步元数据失败: ${errorMessage}。请检查：1) GitHub Token 是否有写入权限 2) 仓库路径是否正确 3) 同步路径配置是否正确`
        );
      }
      throw new Error(`保存同步元数据失败: ${errorMessage}`);
    }
  }

  /**
   * 构建文件路径（根据文件夹结构）
   * 递归构建完整的文件路径
   */
  private buildFilePath(file: IFile, folders: IFolder[]): string {
    const pathParts: string[] = [file.name];
    let currentParentId = file.parentId;

    // 递归向上查找所有父文件夹
    while (currentParentId !== null) {
      const folder = folders.find(f => f.id === currentParentId);
      if (!folder) {
        console.warn(`找不到父文件夹 ID: ${currentParentId}，文件: ${file.name}`);
        break;
      }
      pathParts.unshift(folder.name);
      currentParentId = folder.parentId;
    }

    return `${this.filesBasePath}/${pathParts.join('/')}`;
  }


  /**
   * 从路径构建文件夹结构（确保所有父文件夹都存在）
   */
  private async buildFolderStructureFromPath(
    filePath: string,
    _folders: IFolder[]
  ): Promise<number | null> {
    // 移除 files/ 前缀
    const relativePath = filePath.replace(`${this.filesBasePath}/`, '');
    const parts = relativePath.split('/');
    const fileName = parts.pop(); // 最后一个部分是文件名

    if (!fileName) return null;

    // 如果没有文件夹路径，返回 null（根目录）
    if (parts.length === 0) {
      return null;
    }

    // 重新获取最新的文件夹列表（因为可能已经创建了新文件夹）
    const allFolders = await db.folders.toArray();
    
    // 构建文件夹路径，确保父文件夹先创建
    let currentParentId: number | null = null;
    for (const folderName of parts) {
      // 查找文件夹（通过名称和父文件夹 ID）
      let folder = allFolders.find(
        f => f.name === folderName && f.parentId === currentParentId
      );

      if (!folder) {
        // 创建新文件夹
        const newFolder: IFolder = {
          name: folderName,
          parentId: currentParentId,
          createdAt: new Date(),
        };
        const id = await db.folders.add(newFolder);
        folder = { ...newFolder, id: id as number };
        // 添加到列表以便后续查找
        allFolders.push(folder);
      }

      currentParentId = folder.id!;
    }

    return currentParentId;
  }

  /**
   * 拉取（Pull）：从 GitHub 同步到本地
   */
  async pull(): Promise<SyncResult> {
    try {
      const stats = {
        filesAdded: 0,
        filesUpdated: 0,
        filesDeleted: 0,
        themesAdded: 0,
        themesUpdated: 0,
        themesDeleted: 0,
      };

      // 获取本地文件夹结构（用于构建路径）
      const localFolders = await db.folders.toArray();

      // 获取远程文件列表（包含路径和文件信息）
      interface RemoteFileInfo {
        path: string;
        sha: string;
        content: string;
      }
      const remoteFiles: RemoteFileInfo[] = [];
      const remoteThemes: RemoteFileInfo[] = [];

      // 递归获取所有文件
      const getAllFiles = async (path: string): Promise<void> => {
        try {
          const items = await this.api.getDirectory(path);
          // 如果目录不存在（返回空数组），这是正常的（首次同步）
          if (items.length === 0) {
            return;
          }
          for (const item of items) {
            if (item.type === 'dir') {
              await getAllFiles(item.path);
            } else if (item.path.startsWith(this.filesBasePath) && item.path.endsWith('.md')) {
              // 只处理 .md 文件
              const file = await this.api.getFile(item.path);
              if (file) {
                remoteFiles.push({
                  path: item.path,
                  sha: file.sha,
                  content: file.content,
                });
              }
            } else if (item.path.startsWith(this.themesBasePath) && item.path.endsWith('.css')) {
              // 只处理 .css 文件
              const file = await this.api.getFile(item.path);
              if (file) {
                remoteThemes.push({
                  path: item.path,
                  sha: file.sha,
                  content: file.content,
                });
              }
            }
          }
        } catch (error) {
          // 如果目录不存在（404），这是正常的（首次同步），静默处理
          // 其他错误才输出警告
          if (error instanceof Error && !error.message.includes('404')) {
            console.warn(`无法访问目录 ${path}:`, error);
          }
        }
      };

      await getAllFiles(this.filesBasePath);
      await getAllFiles(this.themesBasePath);

      // 同步文件：先构建所有文件夹结构，再处理文件
      for (const remoteFileInfo of remoteFiles) {
        const remotePath = remoteFileInfo.path;
        const relativePath = remotePath.replace(`${this.filesBasePath}/`, '');
        const pathParts = relativePath.split('/');
        const fileName = pathParts.pop() || '';
        
        // 构建文件夹结构（确保所有父文件夹都存在）
        const parentId = await this.buildFolderStructureFromPath(
          remotePath,
          localFolders
        );

        // 重新获取本地文件列表（因为可能已经更新）
        const currentLocalFiles = await db.files.toArray();
        
        // 查找本地文件（通过文件名和父文件夹）
        const localFile = currentLocalFiles.find(
          f => f.name === fileName && f.parentId === parentId
        );

        if (localFile) {
          // 时间戳优先策略：如果远程文件更新，则更新本地
          // 这里使用 SHA 来判断文件是否有变化（更可靠）
          // 如果 SHA 不同，说明文件已更新，使用远程版本
          const shouldUpdate = true; // 简化：总是更新（实际应该比较 SHA 或时间戳）
          
          if (shouldUpdate) {
            await db.files.update(localFile.id!, {
              content: remoteFileInfo.content,
              updatedAt: new Date(),
            });
            stats.filesUpdated++;
          }
        } else {
          // 创建新文件
          const newFile: IFile = {
            name: fileName,
            content: remoteFileInfo.content,
            parentId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await db.files.add(newFile);
          stats.filesAdded++;
        }
      }

      // 处理删除：如果本地文件在远程不存在，标记为需要检查
      // 注意：为了安全，我们不自动删除，而是保留本地文件
      // 用户可以在设置中选择是否同步删除操作

      // 同步主题
      for (const remoteThemeInfo of remoteThemes) {
        const remotePath = remoteThemeInfo.path;
        const themeName = remotePath
          .replace(`${this.themesBasePath}/`, '')
          .replace('.css', '');

        // 重新获取本地主题列表
        const currentLocalThemes = await db.themes.filter(t => t.isCustom === true).toArray();
        const localTheme = currentLocalThemes.find(t => t.name === themeName);

        if (localTheme) {
          await db.themes.update(localTheme.id!, {
            css: remoteThemeInfo.content,
            updatedAt: new Date(),
          });
          stats.themesUpdated++;
        } else {
          await db.themes.add({
            name: themeName,
            css: remoteThemeInfo.content,
            isCustom: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          stats.themesAdded++;
        }
      }

      // 更新元数据
      const metadata: SyncMetadata = {
        lastSyncTime: new Date(),
        lastSyncHash: Date.now().toString(),
        isSyncing: false,
        syncError: null,
      };
      // 获取现有 metadata 的 sha（如果存在）
      let sha: string | undefined;
      try {
        const metadataFile = await this.api.getFile(this.metadataPath);
        sha = metadataFile?.sha;
      } catch {
        // 如果获取失败，说明文件不存在（首次同步），创建新文件
        sha = undefined;
      }
      try {
        await this.saveMetadata(metadata, sha);
      } catch (error) {
        // 如果保存 metadata 失败，记录但不影响同步结果
        console.warn('保存同步元数据失败:', error);
      }

      return {
        success: true,
        message: '同步成功',
        stats,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '同步失败';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * 推送（Push）：从本地同步到 GitHub
   */
  async push(): Promise<SyncResult> {
    try {
      const stats = {
        filesAdded: 0,
        filesUpdated: 0,
        filesDeleted: 0,
        themesAdded: 0,
        themesUpdated: 0,
        themesDeleted: 0,
      };

      // 获取本地数据
      const localFiles = await db.files.toArray();
      const localFolders = await db.folders.toArray();
      const localThemes = await db.themes.filter(t => t.isCustom === true).toArray();

      // 推送文件（按文件夹层级排序，确保父文件夹先创建）
      // 先按 parentId 排序，null 的在前（根目录文件）
      const sortedFiles = [...localFiles].sort((a, b) => {
        // 根目录文件（parentId === null）排在前面
        if (a.parentId === null && b.parentId !== null) return -1;
        if (a.parentId !== null && b.parentId === null) return 1;
        // 其他按 parentId 排序（简化处理）
        return (a.parentId || 0) - (b.parentId || 0);
      });

      for (const file of sortedFiles) {
        const remotePath = this.buildFilePath(file, localFolders);
        
        try {
          const remoteFile = await this.api.getFile(remotePath);
          
          if (remoteFile) {
            // 更新文件（只有当内容不同时才更新，避免不必要的 API 调用）
            // 注意：这里比较的是原始内容，GitHub 返回的是 Base64，需要解码比较
            // 为了简化，我们总是更新（实际可以优化为比较 SHA）
            await this.api.putFile(
              remotePath,
              file.content,
              remoteFile.sha,
              `Update ${file.name}`
            );
            stats.filesUpdated++;
          } else {
            // 创建文件（GitHub API 会自动创建父目录）
            await this.api.putFile(
              remotePath,
              file.content,
              undefined,
              `Add ${file.name}`
            );
            stats.filesAdded++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          console.error(`同步文件失败 ${remotePath}:`, error);
          // 如果是 404 错误，可能是权限问题或路径问题
          if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
            console.error(`文件创建失败，可能是权限问题。路径: ${remotePath}`);
            // 继续处理其他文件，不中断整个同步过程
          }
          // 继续处理其他文件，不中断整个同步过程
        }
      }

      // 推送主题
      for (const theme of localThemes) {
        const remotePath = `${this.themesBasePath}/${theme.name}.css`;
        
        try {
          const remoteFile = await this.api.getFile(remotePath);
          
          if (remoteFile) {
            // 更新主题
            await this.api.putFile(
              remotePath,
              theme.css,
              remoteFile.sha,
              `Update theme ${theme.name}`
            );
            stats.themesUpdated++;
          } else {
            // 创建主题
            await this.api.putFile(
              remotePath,
              theme.css,
              undefined,
              `Add theme ${theme.name}`
            );
            stats.themesAdded++;
          }
        } catch (error) {
          console.error(`同步主题失败 ${remotePath}:`, error);
        }
      }

      // 更新元数据
      const existingMetadata = await this.getMetadata();
      const metadata: SyncMetadata = {
        lastSyncTime: new Date(),
        lastSyncHash: Date.now().toString(),
        isSyncing: false,
        syncError: null,
      };
      // 获取现有 metadata 的 sha（如果存在）
      let sha: string | undefined;
      if (existingMetadata) {
        const metadataFile = await this.api.getFile(this.metadataPath);
        sha = metadataFile?.sha;
      }
      await this.saveMetadata(metadata, sha);

      return {
        success: true,
        message: '推送成功',
        stats,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '推送失败';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * 双向同步（先拉取，再推送）
   */
  async sync(): Promise<SyncResult> {
    // 先拉取远程变更
    const pullResult = await this.pull();
    if (!pullResult.success) {
      return pullResult;
    }

    // 再推送本地变更
    const pushResult = await this.push();
    return pushResult;
  }

  /**
   * 检查仓库连接
   */
  async checkConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const exists = await this.api.checkRepository();
      if (exists) {
        return { success: true, message: '连接成功' };
      } else {
        return { success: false, message: '仓库不存在或无权限访问' };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接失败',
      };
    }
  }
}

