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

export class MarkdownEditorDB extends Dexie {
  files!: Table<IFile>;
  folders!: Table<IFolder>;
  themes!: Table<ITheme>;
  syncMetadata!: Table<ISyncMetadata>;

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
  }
}

export const db = new MarkdownEditorDB();

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
  
  // 自动清理可能存在的示例数据（如果用户已经删除过，不应该再出现）
  // 检查是否有示例文件夹，如果有则清理
  const exampleFolders = await db.folders.where('name').equals('示例文件夹').toArray();
  if (exampleFolders.length > 0) {
    console.log('检测到示例数据，正在清理...');
    await clearExampleData();
  }
  
  // 不再自动创建示例数据，让用户自己管理
}); 