// 基于 OPFS 的文件树服务

import { listAllEntries, readTextFile, writeTextFile, deleteFile, createDirectory, deleteDirectory, renameEntry } from './opfsFs';
import type { FileTreeNode } from '../types/type';
import { FILES_DIR, THEMES_DIR } from '../types/type';
import { toPhysicalPath, toLogicalPath } from './pathUtils';
import { getFileBaseline, updateFileBaseline, removeFileBaseline } from './syncBaseline';

// 构建文件树结构（只处理 files/ 目录下的文件）
export async function buildFileTree(): Promise<FileTreeNode[]> {
  const entries = await listAllEntries();
  
  // 只处理 files/ 目录下的文件，过滤掉 .themes 目录
  const fileEntries = entries.filter(e => {
    const path = e.path;
    // 排除主题目录
    if (path === THEMES_DIR || path.startsWith(`${THEMES_DIR}/`)) {
      return false;
    }
    // 只处理 files/ 目录下的文件
    return path.startsWith(`${FILES_DIR}/`) || path === FILES_DIR;
  });
  
  // 构建树结构
  const nodeMap = new Map<string, FileTreeNode>();
  const rootNodes: FileTreeNode[] = [];
  
  // 先创建所有节点（使用逻辑路径）
  for (const entry of fileEntries) {
    // 跳过 files 目录本身
    if (entry.path === FILES_DIR) continue;
    
    // 转换为逻辑路径
    const logicalPath = toLogicalPath(entry.path);
    const parts = logicalPath.split('/').filter(Boolean);
    const name = parts[parts.length - 1] || '';
    
    nodeMap.set(logicalPath, {
      path: logicalPath,
      name,
      type: entry.isDirectory ? 'folder' : 'file',
      children: entry.isDirectory ? [] : undefined
    });
  }
  
  // 构建父子关系
  for (const [logicalPath, node] of nodeMap.entries()) {
    const parts = logicalPath.split('/').filter(Boolean);
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

// 获取文件内容（接收逻辑路径）
export async function getFileContent(logicalPath: string): Promise<string | null> {
  const physicalPath = toPhysicalPath(logicalPath);
  return await readTextFile(physicalPath);
}

// 保存文件内容（接收逻辑路径）
export async function saveFileContent(logicalPath: string, content: string): Promise<void> {
  const physicalPath = toPhysicalPath(logicalPath);
  await writeTextFile(physicalPath, content);
}

// 创建新文件（接收完整逻辑路径，如 "foo/bar.md"）
export async function createFile(fullPath: string): Promise<string> {
  // 确保是 .md 文件
  if (!fullPath.endsWith('.md')) {
    fullPath = `${fullPath}.md`;
  }
  
  const physicalPath = toPhysicalPath(fullPath);
  
  // 检查文件是否已存在
  const existing = await readTextFile(physicalPath);
  if (existing !== null) {
    throw new Error(`文件 "${fullPath}" 已存在`);
  }
  
  // 确保父目录存在
  const parts = fullPath.split('/').filter(Boolean);
  if (parts.length > 1) {
    const parentLogicalPath = parts.slice(0, -1).join('/');
    const parentPhysicalPath = toPhysicalPath(parentLogicalPath);
    await createDirectory(parentPhysicalPath);
  } else {
    // 确保 files 目录存在
    await createDirectory(FILES_DIR);
  }
  
  // 创建空文件
  await writeTextFile(physicalPath, '');
  
  return fullPath;
}

// 创建新文件夹（接收完整逻辑路径，如 "foo/bar"）
export async function createFolder(fullPath: string): Promise<string> {
  const physicalPath = toPhysicalPath(fullPath);
  
  // 检查文件夹是否已存在
  try {
    const root = await (await import('./opfsFs')).getAppRootDir();
    const parts = physicalPath.split('/').filter(Boolean);
    let dir: FileSystemDirectoryHandle = root;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create: false });
    }
    throw new Error(`文件夹 "${fullPath}" 已存在`);
  } catch (error: any) {
    if (error.message?.includes('已存在')) {
      throw error;
    }
    // 目录不存在，可以创建
  }
  
  // 确保父目录存在
  const parts = fullPath.split('/').filter(Boolean);
  if (parts.length > 1) {
    const parentLogicalPath = parts.slice(0, -1).join('/');
    const parentPhysicalPath = toPhysicalPath(parentLogicalPath);
    await createDirectory(parentPhysicalPath);
  } else {
    // 确保 files 目录存在
    await createDirectory(FILES_DIR);
  }
  
  // 创建新目录
  await createDirectory(physicalPath);
  
  return fullPath;
}

// 删除文件（接收逻辑路径）
export async function removeFile(logicalPath: string): Promise<void> {
  const physicalPath = toPhysicalPath(logicalPath);
  await deleteFile(physicalPath);
}

// 删除文件夹（递归，接收逻辑路径）
export async function removeFolder(logicalPath: string): Promise<void> {
  const physicalPath = toPhysicalPath(logicalPath);
  await deleteDirectory(physicalPath);
}

// 重命名文件或文件夹（接收逻辑路径）
export async function renameFileOrFolder(oldLogicalPath: string, newName: string): Promise<string> {
  const parts = oldLogicalPath.split('/').filter(Boolean);
  const parentPath = parts.length > 1 ? parts.slice(0, -1).join('/') : null;
  const newLogicalPath = parentPath ? `${parentPath}/${newName}` : newName;
  
  const oldPhysicalPath = toPhysicalPath(oldLogicalPath);
  const newPhysicalPath = toPhysicalPath(newLogicalPath);
  
  // 检查新名称是否已存在
  try {
    const existing = await readTextFile(newPhysicalPath);
    if (existing !== null) {
      throw new Error(`"${newName}" 已存在`);
    }
  } catch (error: any) {
    if (!error.message?.includes('已存在')) {
      // 可能是目录，继续检查
      const root = await (await import('./opfsFs')).getAppRootDir();
      const newParts = newPhysicalPath.split('/').filter(Boolean);
      let dir: FileSystemDirectoryHandle = root;
      for (const part of newParts) {
        dir = await dir.getDirectoryHandle(part, { create: false });
      }
      throw new Error(`"${newName}" 已存在`);
    } else {
      throw error;
    }
  }
  
  await renameEntry(oldPhysicalPath, newPhysicalPath);
  
  // 更新同步基线：将旧路径的基线迁移到新路径
  const oldBaselineSha = getFileBaseline(oldLogicalPath);
  if (oldBaselineSha) {
    // 迁移基线到新路径
    updateFileBaseline(newLogicalPath, oldBaselineSha);
    // 删除旧路径的基线
    removeFileBaseline(oldLogicalPath);
  }
  
  return newLogicalPath;
}

// 清空所有文件（只清空 files/ 目录）
export async function clearAllFiles(): Promise<void> {
  const entries = await listAllEntries();
  
  // 找出所有 files/ 目录下的文件和目录
  const filesToDelete = entries.filter(e => {
    const path = e.path;
    // 只处理 files/ 目录下的内容
    return path.startsWith(`${FILES_DIR}/`) || path === FILES_DIR;
  });
  
  // 删除所有文件和目录（从最深层的开始）
  const sortedEntries = filesToDelete.sort((a, b) => {
    const depthA = a.path.split('/').length;
    const depthB = b.path.split('/').length;
    return depthB - depthA; // 深度大的先删除
  });
  
  for (const entry of sortedEntries) {
    try {
      if (entry.isDirectory) {
        await deleteDirectory(entry.path);
      } else {
        await deleteFile(entry.path);
      }
    } catch (error) {
      console.error(`删除失败: ${entry.path}`, error);
    }
  }
  
  // 最后删除 files 目录本身（如果存在）
  try {
    await deleteDirectory(FILES_DIR);
  } catch (error) {
    // 忽略错误，可能目录不存在或不为空
  }
}

