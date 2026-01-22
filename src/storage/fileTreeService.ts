// 基于 OPFS 的文件树服务

import { listAllEntries, readTextFile, writeTextFile, deleteFile, createDirectory, deleteDirectory, renameEntry } from './opfsFs';
import type { FileTreeNode } from '../types/type';

// 构建文件树结构
export async function buildFileTree(): Promise<FileTreeNode[]> {
  const entries = await listAllEntries();
  
  // 过滤掉 .themes 目录（主题单独管理，隐藏文件夹）
  const fileEntries = entries.filter(e => !(e.path === '.themes' || e.path.startsWith('.themes/')));
  
  // 构建树结构
  const nodeMap = new Map<string, FileTreeNode>();
  const rootNodes: FileTreeNode[] = [];
  
  // 先创建所有节点
  for (const entry of fileEntries) {
    const parts = entry.path.split('/').filter(Boolean);
    const name = parts[parts.length - 1] || '';
    
    nodeMap.set(entry.path, {
      path: entry.path,
      name,
      type: entry.isDirectory ? 'folder' : 'file',
      children: entry.isDirectory ? [] : undefined
    });
  }
  
  // 构建父子关系
  for (const entry of fileEntries) {
    const node = nodeMap.get(entry.path);
    if (!node) continue;
    
    const parts = entry.path.split('/').filter(Boolean);
    if (parts.length === 1) {
      // 根节点
      rootNodes.push(node);
    } else {
      // 查找父节点
      const parentPath = parts.slice(0, -1).join('/');
      const parent = nodeMap.get(parentPath);
      if (parent && parent.type === 'folder') {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        // 父节点不存在，作为根节点
        rootNodes.push(node);
      }
    }
  }
  
  // 排序：文件夹在前，文件在后，按名称排序
  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name, 'zh-CN');
    }).map(node => {
      if (node.children) {
        node.children = sortNodes(node.children);
      }
      return node;
    });
  };
  
  return sortNodes(rootNodes);
}

// 获取文件内容
export async function getFileContent(path: string): Promise<string | null> {
  return await readTextFile(path);
}

// 保存文件内容
export async function saveFileContent(path: string, content: string): Promise<void> {
  await writeTextFile(path, content);
}

// 创建新文件
export async function createFile(parentPath: string | null, fileName: string): Promise<string> {
  const fullPath = parentPath ? `${parentPath}/${fileName}.md` : `${fileName}.md`;
  
  // 检查文件是否已存在
  const existing = await readTextFile(fullPath);
  if (existing !== null) {
    throw new Error(`文件 "${fileName}.md" 已存在`);
  }
  
  // 确保父目录存在
  if (parentPath) {
    await createDirectory(parentPath);
  }
  
  // 创建空文件
  await writeTextFile(fullPath, '');
  
  return fullPath;
}

// 创建新文件夹
export async function createFolder(parentPath: string | null, folderName: string): Promise<string> {
  // 禁止在根目录创建名为 ".themes" 的文件夹（.themes 是系统保留的隐藏文件夹，用于存储主题）
  if (parentPath === null && folderName === '.themes') {
    throw new Error('不能创建名为 ".themes" 的文件夹，该名称已被系统保留用于主题管理');
  }
  
  const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
  
  // 检查文件夹是否已存在
  try {
    const root = await (await import('./opfsFs')).getAppRootDir();
    const parts = fullPath.split('/').filter(Boolean);
    let dir: FileSystemDirectoryHandle = root;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create: false });
    }
    throw new Error(`文件夹 "${folderName}" 已存在`);
  } catch (error: any) {
    if (error.message?.includes('已存在')) {
      throw error;
    }
    // 目录不存在，可以创建
  }
  
  // 确保父目录存在
  if (parentPath) {
    await createDirectory(parentPath);
  }
  
  // 创建新目录
  await createDirectory(fullPath);
  
  return fullPath;
}

// 删除文件
export async function removeFile(path: string): Promise<void> {
  await deleteFile(path);
}

// 删除文件夹（递归）
export async function removeFolder(path: string): Promise<void> {
  await deleteDirectory(path);
}

// 重命名文件或文件夹
export async function renameFileOrFolder(oldPath: string, newName: string): Promise<string> {
  const parts = oldPath.split('/').filter(Boolean);
  const parentPath = parts.length > 1 ? parts.slice(0, -1).join('/') : null;
  const newPath = parentPath ? `${parentPath}/${newName}` : newName;
  
  // 禁止将文件夹重命名为 ".themes"（如果是在根目录）
  if (parentPath === null && newName === '.themes') {
    throw new Error('不能将文件夹重命名为 ".themes"，该名称已被系统保留用于主题管理');
  }
  
  // 检查新名称是否已存在
  try {
    const existing = await readTextFile(newPath);
    if (existing !== null) {
      throw new Error(`"${newName}" 已存在`);
    }
  } catch (error: any) {
    if (!error.message?.includes('已存在')) {
      // 可能是目录，继续检查
      const root = await (await import('./opfsFs')).getAppRootDir();
      const newParts = newPath.split('/').filter(Boolean);
      let dir: FileSystemDirectoryHandle = root;
      for (const part of newParts) {
        dir = await dir.getDirectoryHandle(part, { create: false });
      }
      throw new Error(`"${newName}" 已存在`);
    } else {
      throw error;
    }
  }
  
  await renameEntry(oldPath, newPath);
  return newPath;
}


