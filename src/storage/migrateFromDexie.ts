// 从 Dexie (IndexedDB) 迁移到 OPFS
// 首次启动时，如果检测到 Dexie 中有数据，自动迁移到 OPFS

import { writeTextFile, createDirectory } from './opfsFs';

const MIGRATION_FLAG_KEY = 'markmuse-migrated-to-opfs';

/**
 * 检查是否需要迁移
 */
export async function needsMigration(): Promise<boolean> {
  // 如果已经迁移过，跳过
  if (localStorage.getItem(MIGRATION_FLAG_KEY) === 'true') {
    return false;
  }

  try {
    // 动态导入 db（避免在完全移除 Dexie 前报错）
    const { db } = await import('../db');
    // 检查 Dexie 中是否有文件或文件夹
    const files = await db.files.toArray();
    const folders = await db.folders.toArray();
    
    return files.length > 0 || folders.length > 0;
  } catch (error) {
    console.error('检查迁移状态失败:', error);
    return false;
  }
}

/**
 * 执行迁移：将 Dexie 中的数据迁移到 OPFS
 */
export async function migrateFromDexie(): Promise<void> {
  if (localStorage.getItem(MIGRATION_FLAG_KEY) === 'true') {
    console.log('✅ 已迁移，跳过');
    return;
  }

  try {
    console.log('🔄 开始从 Dexie 迁移到 OPFS...');
    
    // 动态导入 db
    const { db } = await import('../db');
    const files = await db.files.toArray();
    const folders = await db.folders.toArray();
    
    if (files.length === 0 && folders.length === 0) {
      console.log('📭 没有数据需要迁移');
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      return;
    }

    // 构建文件夹路径映射（id -> path）
    const folderPathMap = new Map<number | null, string>();
    folderPathMap.set(null, ''); // 根目录

    // 按层级构建文件夹路径
    const buildFolderPaths = (parentId: number | null, parentPath: string) => {
      const children = folders.filter(f => f.parentId === parentId);
      for (const folder of children) {
        if (folder.id === undefined) continue;
        const folderPath = parentPath ? `${parentPath}/${folder.name}` : folder.name;
        folderPathMap.set(folder.id, folderPath);
        buildFolderPaths(folder.id, folderPath);
      }
    };

    buildFolderPaths(null, '');

    // 创建所有文件夹
    for (const [id, path] of folderPathMap.entries()) {
      if (path && id !== null) {
        try {
          await createDirectory(path);
        } catch (error) {
          console.warn(`创建文件夹失败: ${path}`, error);
        }
      }
    }

    // 迁移所有文件
    let migratedCount = 0;
    for (const file of files) {
      if (file.id === undefined) continue;
      
      const folderPath = file.parentId !== null ? folderPathMap.get(file.parentId) || '' : '';
      const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
      
      try {
        await writeTextFile(filePath, file.content || '');
        migratedCount++;
      } catch (error) {
        console.error(`迁移文件失败: ${filePath}`, error);
      }
    }

    console.log(`✅ 迁移完成：${migratedCount} 个文件，${folders.length} 个文件夹`);
    
    // 标记已迁移
    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
  } catch (error) {
    console.error('迁移失败:', error);
    // 即使失败也标记，避免重复尝试
    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
  }
}

