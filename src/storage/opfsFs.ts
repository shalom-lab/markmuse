// OPFS 文件系统封装（异步 API）
// 目前主要用于 Markdown 文件的本地存储和同步

import type { FsEntry } from '../types/type';

// 获取应用根目录：<origin>/markmuse
export async function getAppRootDir(): Promise<FileSystemDirectoryHandle> {
  const root = await (navigator.storage as any).getDirectory();
  const appDir = await root.getDirectoryHandle('markmuse', { create: true });
  return appDir;
}

// 列出整个文件树（递归）
export async function listAllEntries(): Promise<FsEntry[]> {
  const root = await getAppRootDir();
  const result: FsEntry[] = [];

  async function walk(dir: FileSystemDirectoryHandle, prefix: string) {
    for await (const [name, handle] of (dir as any).entries()) {
      const fullPath = prefix ? `${prefix}/${name}` : name;
      if (handle.kind === 'directory') {
        result.push({ path: fullPath, isDirectory: true });
        await walk(handle as FileSystemDirectoryHandle, fullPath);
      } else {
        result.push({ path: fullPath, isDirectory: false });
      }
    }
  }

  await walk(root, '');
  return result;
}

// 读取文本文件内容，不存在时返回 null
export async function readTextFile(path: string): Promise<string | null> {
  try {
    const root = await getAppRootDir();
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return null;

    let dir: FileSystemDirectoryHandle = root;
    for (let i = 0; i < parts.length - 1; i++) {
      dir = await dir.getDirectoryHandle(parts[i], { create: false });
    }

    const fileHandle = await dir.getFileHandle(parts[parts.length - 1], { create: false });
    const file = await fileHandle.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

// 写入文本文件（自动创建中间目录）
export async function writeTextFile(path: string, content: string): Promise<void> {
  const root = await getAppRootDir();
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return;

  let dir: FileSystemDirectoryHandle = root;
  for (let i = 0; i < parts.length - 1; i++) {
    dir = await dir.getDirectoryHandle(parts[i], { create: true });
  }

  const fileHandle = await dir.getFileHandle(parts[parts.length - 1], { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

// 删除文件（如果存在）
export async function deleteFile(path: string): Promise<void> {
  const root = await getAppRootDir();
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return;

  let dir: FileSystemDirectoryHandle = root;
  for (let i = 0; i < parts.length - 1; i++) {
    dir = await dir.getDirectoryHandle(parts[i], { create: false });
  }

  try {
    await dir.removeEntry(parts[parts.length - 1], { recursive: false });
  } catch {
    // 忽略不存在等错误
  }
}

// 创建目录（自动创建中间目录）
export async function createDirectory(path: string): Promise<void> {
  const root = await getAppRootDir();
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return;

  let dir: FileSystemDirectoryHandle = root;
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part, { create: true });
  }
}

// 删除目录（递归删除）
export async function deleteDirectory(path: string): Promise<void> {
  const root = await getAppRootDir();
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return;

  let dir: FileSystemDirectoryHandle = root;
  for (let i = 0; i < parts.length - 1; i++) {
    dir = await dir.getDirectoryHandle(parts[i], { create: false });
  }

  try {
    await dir.removeEntry(parts[parts.length - 1], { recursive: true });
  } catch {
    // 忽略不存在等错误
  }
}

// 重命名文件或目录
export async function renameEntry(oldPath: string, newPath: string): Promise<void> {
  // OPFS 不支持直接重命名，需要复制后删除
  const root = await getAppRootDir();
  
  // 读取旧文件/目录
  const oldParts = oldPath.split('/').filter(Boolean);
  const newParts = newPath.split('/').filter(Boolean);
  
  if (oldParts.length === 0 || newParts.length === 0) return;
  
  // 检查是文件还是目录
  let oldDir: FileSystemDirectoryHandle = root;
  for (let i = 0; i < oldParts.length - 1; i++) {
    oldDir = await oldDir.getDirectoryHandle(oldParts[i], { create: false });
  }
  
  const oldName = oldParts[oldParts.length - 1];
  
  try {
    // 尝试作为文件处理
    const oldFileHandle = await oldDir.getFileHandle(oldName, { create: false });
    const file = await oldFileHandle.getFile();
    const content = await file.text();
    
    // 写入新路径
    await writeTextFile(newPath, content);
    
    // 删除旧文件
    await deleteFile(oldPath);
  } catch {
    // 如果是目录，需要递归复制
    try {
      const oldDirHandle = await oldDir.getDirectoryHandle(oldName, { create: false });
      
      // 创建新目录
      await createDirectory(newPath);
      
      // 递归复制目录内容
      const newDir = await getAppRootDir();
      let newDirHandle: FileSystemDirectoryHandle = newDir;
      for (const part of newParts) {
        newDirHandle = await newDirHandle.getDirectoryHandle(part, { create: true });
      }
      
      // 遍历旧目录并复制所有内容
      for await (const [name, handle] of (oldDirHandle as any).entries()) {
        const childOldPath = `${oldPath}/${name}`;
        const childNewPath = `${newPath}/${name}`;
        
        if (handle.kind === 'file') {
          const file = await (handle as FileSystemFileHandle).getFile();
          const content = await file.text();
          await writeTextFile(childNewPath, content);
        } else {
          await renameEntry(childOldPath, childNewPath);
        }
      }
      
      // 删除旧目录
      await deleteDirectory(oldPath);
    } catch (error) {
      console.error('重命名失败:', error);
      throw error;
    }
  }
}

// 列出指定目录下的直接子项（不递归）
export async function listDirectory(path: string): Promise<FsEntry[]> {
  const root = await getAppRootDir();
  const parts = path.split('/').filter(Boolean);
  
  let dir: FileSystemDirectoryHandle = root;
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part, { create: false });
  }
  
  const result: FsEntry[] = [];
  for await (const [name, handle] of (dir as any).entries()) {
    const fullPath = path ? `${path}/${name}` : name;
    result.push({
      path: fullPath,
      isDirectory: handle.kind === 'directory'
    });
  }
  
  return result;
}


