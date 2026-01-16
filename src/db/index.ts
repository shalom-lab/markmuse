import Dexie, { Table } from 'dexie';

export interface IFile {
  id?: number;
  name: string;
  content: string;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFolder {
  id?: number;
  name: string;
  parentId: number | null;
  createdAt: Date;
}

export interface ITheme {
  id?: number;
  name: string;
  css: string;
  isCustom: boolean; // 是否为自定义主题
  createdAt: Date;
  updatedAt: Date;
}

export interface ISyncMetadata {
  id?: number;
  lastSyncTime: Date | null;
  lastSyncHash: string;
  isSyncing: boolean;
  syncError: string | null;
  updatedAt: Date;
}

export interface ISettings {
  id?: number;
  defaultTheme?: string;
  updatedAt: Date;
}

export class MarkdownEditorDB extends Dexie {
  files!: Table<IFile>;
  folders!: Table<IFolder>;
  themes!: Table<ITheme>;
  syncMetadata!: Table<ISyncMetadata>;
  settings!: Table<ISettings>;

  constructor() {
    super('MarkdownEditorDB');
    
    // 定义数据库结构
    this.version(1).stores({
      files: '++id, name, parentId, createdAt, updatedAt',
      folders: '++id, name, parentId, createdAt'
    });

    // 版本 2：添加 themes 表
    this.version(2).stores({
      files: '++id, name, parentId, createdAt, updatedAt',
      folders: '++id, name, parentId, createdAt',
      themes: '++id, name, isCustom, createdAt, updatedAt'
    });

    // 版本 3：添加 syncMetadata 表
    this.version(3).stores({
      files: '++id, name, parentId, createdAt, updatedAt',
      folders: '++id, name, parentId, createdAt',
      themes: '++id, name, isCustom, createdAt, updatedAt',
      syncMetadata: '++id, updatedAt'
    });

    // 版本 4：添加 settings 表
    this.version(4).stores({
      files: '++id, name, parentId, createdAt, updatedAt',
      folders: '++id, name, parentId, createdAt',
      themes: '++id, name, isCustom, createdAt, updatedAt',
      syncMetadata: '++id, updatedAt',
      settings: '++id, updatedAt'
    });

    // 类型转换
    this.files.hook('reading', (file) => {
      if (file.createdAt) file.createdAt = new Date(file.createdAt);
      if (file.updatedAt) file.updatedAt = new Date(file.updatedAt);
      return file;
    });

    this.folders.hook('reading', (folder) => {
      if (folder.createdAt) folder.createdAt = new Date(folder.createdAt);
      return folder;
    });

    this.themes.hook('reading', (theme) => {
      if (theme.createdAt) theme.createdAt = new Date(theme.createdAt);
      if (theme.updatedAt) theme.updatedAt = new Date(theme.updatedAt);
      return theme;
    });

    this.syncMetadata.hook('reading', (metadata) => {
      if (metadata.lastSyncTime) metadata.lastSyncTime = new Date(metadata.lastSyncTime);
      if (metadata.updatedAt) metadata.updatedAt = new Date(metadata.updatedAt);
      return metadata;
    });

    this.settings.hook('reading', (settings) => {
      if (settings.updatedAt) settings.updatedAt = new Date(settings.updatedAt);
      return settings;
    });
  }
}

export const db = new MarkdownEditorDB();

// 数据库就绪状态
let dbReady = false;
let dbReadyPromise: Promise<void> | null = null;

/**
 * 确保数据库已就绪（带重试逻辑）
 */
export async function ensureDbReady(maxRetries = 5, delay = 100): Promise<void> {
  if (dbReady) {
    return;
  }

  if (dbReadyPromise) {
    return dbReadyPromise;
  }

  dbReadyPromise = (async () => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        // 检查数据库是否已打开
        if (db.isOpen()) {
          dbReady = true;
          return;
        }

        // 尝试打开数据库
        await db.open();
        dbReady = true;
        return;
      } catch (error: any) {
        const errorName = error?.name || '';
        const errorMessage = error?.message || '';

        // 如果是 DatabaseClosedError 或 UnknownError，等待后重试
        if (
          errorName === 'DatabaseClosedError' ||
          errorName === 'UnknownError' ||
          errorMessage.includes('backing store') ||
          errorMessage.includes('UnknownError')
        ) {
          if (i < maxRetries - 1) {
            console.warn(`数据库打开失败，${delay}ms 后重试 (${i + 1}/${maxRetries}):`, errorName);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // 指数退避
            continue;
          }
        }

        // 其他错误或重试次数用完，抛出错误
        console.error('数据库打开失败:', error);
        throw error;
      }
    }
  })();

  return dbReadyPromise;
}

/**
 * 安全执行数据库操作（带错误处理和重试）
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback?: T,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await ensureDbReady();
      return await operation();
    } catch (error: any) {
      const errorName = error?.name || '';
      const errorMessage = error?.message || '';

      // 如果是数据库关闭错误，尝试重新打开
      if (
        errorName === 'DatabaseClosedError' ||
        errorName === 'UnknownError' ||
        errorMessage.includes('backing store') ||
        errorMessage.includes('UnknownError')
      ) {
        if (i < maxRetries - 1) {
          dbReady = false;
          dbReadyPromise = null;
          await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
          continue;
        }
      }

      // 如果提供了降级值，返回降级值
      if (fallback !== undefined) {
        console.warn('数据库操作失败，使用降级值:', errorName);
        return fallback;
      }

      // 否则抛出错误
      throw error;
    }
  }

  // 如果所有重试都失败且没有降级值，抛出最后一个错误
  throw new Error('数据库操作失败，已重试多次');
}

// 注意：Dexie 3.x 不支持 on('error') 事件监听器
// 错误处理通过以下方式完成：
// 1. safeDbOperation 函数自动处理错误和重试
// 2. 各个数据库操作都使用 try-catch 处理错误
// 3. ensureDbReady 函数在数据库打开失败时会自动重试

// 清理示例数据的函数（供外部调用）
export async function clearExampleData() {
  try {
    // 查找并删除所有示例文件夹和文件
    const exampleFolders = await db.folders.where('name').equals('示例文件夹').toArray();
    const exampleFiles = await db.files.where('name').equals('欢迎使用.md').toArray();
    
    // 删除示例文件夹及其所有子文件夹和文件
    for (const folder of exampleFolders) {
      if (folder.id !== undefined) {
        const allFolders = await db.folders.toArray();
        const getAllSubFolderIds = (parentId: number): number[] => {
          const result: number[] = [];
          const directChildren = allFolders.filter(f => f.parentId === parentId);
          for (const child of directChildren) {
            if (child.id !== undefined) {
              result.push(child.id);
              result.push(...getAllSubFolderIds(child.id));
            }
          }
          return result;
        };
        
        const allFolderIds = [folder.id, ...getAllSubFolderIds(folder.id)];
        await Promise.all([
          ...allFolderIds.map(folderId =>
            db.files.where('parentId').equals(folderId).delete()
          ),
          ...allFolderIds.map(folderId =>
            db.folders.delete(folderId)
          )
        ]);
      }
    }
    
    // 删除独立的示例文件
    for (const file of exampleFiles) {
      if (file.id !== undefined) {
        await db.files.delete(file.id);
      }
    }
    
    console.log('示例数据已清理');
    return true;
  } catch (error) {
    console.error('清理示例数据失败:', error);
    return false;
  }
}

// 初始化数据库
db.on('ready', async () => {
  console.log('数据库已就绪');
  dbReady = true;
  
  // 自动清理可能存在的示例数据（如果用户已经删除过，不应该再出现）
  // 检查是否有示例文件夹，如果有则清理
  try {
    const exampleFolders = await db.folders.where('name').equals('示例文件夹').toArray();
    if (exampleFolders.length > 0) {
      console.log('检测到示例数据，正在清理...');
      await clearExampleData();
    }
  } catch (error) {
    console.error('初始化时清理示例数据失败:', error);
  }
  
  // 不再自动创建示例数据，让用户自己管理
}); 