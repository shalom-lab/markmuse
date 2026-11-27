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
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== 'NotFoundError') throw error;
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
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== 'NotFoundError') throw error;
    // 删除不存在的条目视为成功
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
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== 'NotFoundError') throw error;
    // 删除不存在的条目视为成功
  }
}

type Entry = FileSystemDirectoryHandle | FileSystemFileHandle;

async function copyEntry(source: Entry, parent: FileSystemDirectoryHandle, name: string): Promise<void> {
  if (source.kind === 'directory') {
    const target = await parent.getDirectoryHandle(name, { create: true });
    for await (const [childName, child] of (source as any).entries()) {
      await copyEntry(child, target, childName);
    }
    return;
  }

  const file = await source.getFile();
  const target = await parent.getFileHandle(name, { create: true });
  const writable = await target.createWritable();
  try {
    await writable.write(file);
    await writable.close();
  } catch (error) {
    await writable.abort().catch(() => {});
    throw error;
  }
}

// Rename within one parent. Keep the complete source until the copy succeeds.
export async function renameEntry(oldPath: string, newPath: string): Promise<void> {
  const oldParts = oldPath.split('/');
  const newParts = newPath.split('/');
  const oldName = oldParts.pop();
  const newName = newParts.pop();
  if (!oldName || !newName || oldParts.join('/') !== newParts.join('/')) {
    throw new Error('重命名需要同一目录下的有效文件名');
  }
  if (oldName === newName) return;

  await navigator.locks.request('markmuse:rename', async () => {
    let parent = await getAppRootDir();
    for (const part of oldParts) parent = await parent.getDirectoryHandle(part);
    let source: Entry | undefined;
    for await (const [name, entry] of (parent as any).entries()) {
      if (name === newName) throw new Error(`"${newName}" 已存在`);
      if (name === oldName) source = entry;
    }
    if (!source) throw new Error(`"${oldName}" 不存在`);

    try {
      await copyEntry(source, parent, newName);
    } catch (error) {
      try {
        await parent.removeEntry(newName, { recursive: true });
      } catch (cleanupError) {
        if (!(cleanupError instanceof DOMException && cleanupError.name === 'NotFoundError')) {
          throw new Error(`复制失败，原件已保留。清理目标失败：${cleanupError}`);
        }
      }
      throw error;
    }
    await parent.removeEntry(oldName, { recursive: source.kind === 'directory' });
  });
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


