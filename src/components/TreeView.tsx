import { useState, useMemo, useEffect, useRef } from 'react';
import { showToast } from '../utils/toast';
import type { IFile, IFolder } from '../types/type';
import { createFile, createFolder, renameFileOrFolder, pathToIFileWithContent, getIdPath } from '../storage/fileTreeService';

interface TreeNode {
  id: number;
  name: string;
  type: 'file' | 'folder';
  parentId: number | null;
  children?: TreeNode[];
  fileData?: IFile; // 如果是文件，保存完整的文件数据
}

interface EditingState {
  type: 'create' | 'rename';
  nodeId: number | string; // 创建时使用 tempId，重命名时使用真实 id
  nodeType: 'file' | 'folder';
  parentId: number | null;
  initialName: string;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  isExpanded: boolean;
  expandedFolders: Set<number>;
  currentFileId?: number | null;
  editingState: EditingState | null;
  onToggle: (id: number) => void;
  onSelect?: (file: IFile) => void;
  onDelete: (id: number, type: 'file' | 'folder') => void;
  onStartCreate: (type: 'file' | 'folder', parentId: number | null) => void;
  onStartRename: (id: number, type: 'file' | 'folder', name: string) => void;
  onSaveEdit: (state: EditingState, newName: string) => Promise<void>;
  onCancelEdit: () => void;
}

const TreeItem: React.FC<TreeItemProps> = ({ 
  node, 
  level, 
  isExpanded,
  expandedFolders,
  currentFileId,
  editingState,
  onToggle, 
  onSelect, 
  onDelete,
  onStartCreate,
  onStartRename,
  onSaveEdit,
  onCancelEdit
}) => {
  const indent = level * 20;
  const hasChildren = node.children && node.children.length > 0;
  const isFolder = node.type === 'folder';
  const isActive = !isFolder && node.id === currentFileId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [editValue, setEditValue] = useState('');
  
  // 判断是否正在编辑此节点
  const isEditing = editingState && (
    (editingState.type === 'create' && node.id < 0) ||
    (editingState.type === 'rename' && editingState.nodeId === node.id)
  );

  // 当进入编辑模式时，聚焦输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      setEditValue(editingState!.initialName);
    }
  }, [isEditing, editingState]);

  const handleClick = () => {
    if (isEditing) return;
    if (isFolder) {
      // 点击文件夹时切换展开/折叠
      onToggle(node.id);
    } else if (onSelect && node.fileData) {
      // 点击文件时选择文件
      onSelect(node.fileData);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    // 双击进入重命名模式
    onStartRename(node.id, node.type, node.name);
  };

  const handleSave = async () => {
    if (!editingState || !editValue.trim()) return;
    await onSaveEdit(editingState, editValue.trim());
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancelEdit();
    }
  };

  const handleBlur = async () => {
    // 延迟执行，以便点击保存按钮时能先触发
    setTimeout(async () => {
      if (isEditing && editValue.trim()) {
        await handleSave();
      } else if (isEditing) {
        onCancelEdit();
      }
    }, 200);
  };

  return (
    <div className="min-w-0">
      <div
        className={`group flex items-center py-1 px-2 rounded cursor-pointer select-none min-w-0 ${
          isActive 
            ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium' 
            : 'hover:bg-gray-100'
        } ${isEditing ? 'bg-yellow-50' : ''}`}
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* 展开/折叠图标 */}
        <div className="w-4 h-4 mr-1 flex items-center justify-center">
          {isFolder ? (
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <span className="w-3 h-3"></span>
          )}
        </div>

        {/* 文件夹/文件图标 */}
        <span className="mr-2 text-base">
          {isFolder ? (isExpanded ? '📂' : '📁') : '📄'}
        </span>

        {/* 名称或输入框 */}
        {isEditing ? (
          <div className="flex-1 min-w-0 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => {
                // 如果是文件，不允许输入.md后缀
                if (editingState?.nodeType === 'file') {
                  const value = e.target.value.replace(/\.md$/i, '');
                  setEditValue(value);
                } else {
                  setEditValue(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="flex-1 min-w-0 px-1 py-0.5 border border-blue-400 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              onClick={(e) => e.stopPropagation()}
              placeholder={editingState?.nodeType === 'file' ? '输入文件名' : '输入文件夹名'}
            />
            {editingState?.nodeType === 'file' && (
              <span className="ml-1 text-sm text-gray-500">.md</span>
            )}
          </div>
        ) : (
          <span className="flex-1 min-w-0 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{node.name}</span>
        )}

        {/* 操作按钮 */}
        {!isEditing && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            {isFolder && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCreate('file', node.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-xs"
                  title="新建文件"
                >
                  📄
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCreate('folder', node.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-xs"
                  title="新建文件夹"
                >
                  📁
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartRename(node.id, node.type, node.name);
              }}
              className="p-1 hover:bg-gray-200 rounded text-xs"
              title="重命名"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id, node.type);
              }}
              className="p-1 hover:bg-red-100 rounded text-red-500 text-xs"
              title="删除"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* 子节点 */}
      {isFolder && isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={expandedFolders.has(child.id)}
              expandedFolders={expandedFolders}
              currentFileId={currentFileId}
              editingState={editingState}
              onToggle={onToggle}
              onSelect={onSelect}
              onDelete={onDelete}
              onStartCreate={onStartCreate}
              onStartRename={onStartRename}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TreeViewProps {
  files: IFile[];
  folders: IFolder[];
  currentFileId?: number | null;
  onSelectFile: (file: IFile) => void;
  onDelete: (id: number, type: 'file' | 'folder') => void;
  onFileCreated?: (file: IFile) => void;
  onRefresh?: () => void;
}

export const TreeView: React.FC<TreeViewProps> = ({ 
  files, 
  folders,
  currentFileId,
  onSelectFile, 
  onDelete,
  onFileCreated,
  onRefresh
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [tempIdCounter, setTempIdCounter] = useState(0);
  
  // 自动展开包含当前文件的文件夹
  useEffect(() => {
    if (currentFileId) {
      const currentFile = files.find(f => f.id === currentFileId);
      if (currentFile && currentFile.parentId !== null) {
        // 递归展开所有父文件夹
        const expandParents = (folderId: number | null) => {
          if (folderId === null) return;
          setExpandedFolders(prev => {
            const newSet = new Set(prev);
            newSet.add(folderId);
            return newSet;
          });
          const folder = folders.find(f => f.id === folderId);
          if (folder && folder.parentId !== null) {
            expandParents(folder.parentId);
          }
        };
        expandParents(currentFile.parentId);
      }
    }
  }, [currentFileId, files, folders]);

  // 构建树结构，包含正在创建的项目
  const treeData = useMemo(() => {
    // 确保 folders 和 files 是数组
    const foldersList = Array.isArray(folders) ? folders : [];
    const filesList = Array.isArray(files) ? files : [];
    
    const nodeMap = new Map<number, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // 创建所有节点
    foldersList.forEach(folder => {
      if (folder.id !== undefined) {
        nodeMap.set(folder.id, {
          id: folder.id,
          name: folder.name,
          type: 'folder',
          parentId: folder.parentId,
          children: []
        });
      }
    });

    filesList.forEach(file => {
      if (file.id !== undefined) {
        nodeMap.set(file.id, {
          id: file.id,
          name: file.name,
          type: 'file',
          parentId: file.parentId,
          fileData: file
        });
      }
    });

    // 添加正在创建的项目
    if (editingState && editingState.type === 'create') {
      // 从 nodeId 中提取临时 ID（格式：temp-负数）
      const match = editingState.nodeId.toString().match(/temp-(-?\d+)/);
      if (match) {
        const tempId = parseInt(match[1]);
        const newNode: TreeNode = {
          id: tempId,
          name: '',
          type: editingState.nodeType,
          parentId: editingState.parentId
        };
        nodeMap.set(tempId, newNode);
      }
    }

    // 构建树结构
    // 第一遍：处理所有节点，确保所有文件夹都被正确添加到树中
    nodeMap.forEach((node) => {
      if (node.parentId === null) {
        // 根节点直接添加到 rootNodes
        rootNodes.push(node);
      } else {
        // 查找父节点
        const parent = nodeMap.get(node.parentId);
        if (parent && parent.type === 'folder') {
          // 父节点存在且是文件夹，添加到父节点的 children
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        } else {
          // 父节点不存在或不是文件夹，说明数据不一致
          // 为了容错，将此类节点也添加到根节点（避免丢失数据）
          console.warn(`文件夹 ${node.name} (ID: ${node.id}) 的父文件夹 (ID: ${node.parentId}) 不存在，已添加到根节点`);
          rootNodes.push(node);
        }
      }
    });

    // 排序：文件夹在前，文件在后，按名称排序
    const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.sort((a, b) => {
        // 正在创建的项目排在最前面
        if (editingState && editingState.type === 'create') {
          const match = editingState.nodeId.toString().match(/temp-(-?\d+)/);
          if (match) {
            const tempId = parseInt(match[1]);
            if (a.id === tempId) return -1;
            if (b.id === tempId) return 1;
          }
        }
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
  }, [files, folders, editingState, tempIdCounter]);

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleStartCreate = (type: 'file' | 'folder', parentId: number | null) => {
    // 确保父文件夹已展开
    if (parentId !== null) {
      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        newSet.add(parentId);
        return newSet;
      });
    }
    setTempIdCounter(prev => {
      const newCounter = prev + 1;
      setEditingState({
        type: 'create',
        nodeId: `temp-${-newCounter}`,
        nodeType: type,
        parentId,
        initialName: ''
      });
      return newCounter;
    });
  };

  const handleStartRename = (id: number, type: 'file' | 'folder', name: string) => {
    setEditingState({
      type: 'rename',
      nodeId: id,
      nodeType: type,
      parentId: null, // 重命名时不需要 parentId
      initialName: type === 'file' ? name.replace(/\.md$/, '') : name
    });
  };

  // 根据 id 找到对应的路径
  const findPathById = (id: number, type: 'file' | 'folder'): string | null => {
    // 先从映射中查找
    const path = getIdPath(id);
    if (path) return path;
    
    // 如果映射中没有，从 files/folders 中查找（需要递归构建完整路径）
    if (type === 'file') {
      const file = files.find(f => f.id === id);
      if (file) {
        // 构建完整路径（需要从根目录开始）
        const buildPath = (file: IFile): string => {
          if (file.parentId === null) {
            return file.name;
          }
          const parentFolder = folders.find(f => f.id === file.parentId);
          if (parentFolder) {
            // 递归查找父文件夹路径
            const parentPath = findPathById(file.parentId, 'folder');
            return parentPath ? `${parentPath}/${file.name}` : file.name;
          }
          return file.name;
        };
        return buildPath(file);
      }
    } else {
      const folder = folders.find(f => f.id === id);
      if (folder) {
        const buildPath = (folder: IFolder): string => {
          if (folder.parentId === null) {
            return folder.name;
          }
          const parentFolder = folders.find(f => f.id === folder.parentId);
          if (parentFolder) {
            const parentPath = buildPath(parentFolder);
            return `${parentPath}/${folder.name}`;
          }
          return folder.name;
        };
        return buildPath(folder);
      }
    }
    return null;
  };

  const handleSaveEdit = async (state: EditingState, newName: string) => {
    // 清理文件名，移除可能的.md后缀
    const cleanName = newName.trim().replace(/\.md$/i, '');
    if (!cleanName) {
      setEditingState(null);
      return;
    }

    try {
      if (state.type === 'create') {
        if (state.nodeType === 'file') {
          // 找到父路径
          const parentPath = state.parentId !== null ? findPathById(state.parentId, 'folder') : null;
          
          try {
            const newPath = await createFile(parentPath, cleanName);
            const createdFile = await pathToIFileWithContent(newPath);
            
            // 确保父文件夹已展开
            if (state.parentId !== null) {
              setExpandedFolders(prev => {
                const newSet = new Set(prev);
                newSet.add(state.parentId!);
                return newSet;
              });
            }
            
            // 清除编辑状态
            setEditingState(null);
            
            if (onFileCreated) {
              onFileCreated(createdFile);
            }
            
            // 刷新文件树
            if (onRefresh) {
              onRefresh();
            }
          } catch (error: any) {
            if (error.message?.includes('已存在') || error.message?.includes('.themes')) {
              showToast(error.message, { type: 'warning' });
              setEditingState(null);
              return;
            }
            showToast(error.message || '创建文件失败', { type: 'error' });
            setEditingState(null);
          }
        } else {
          // 找到父路径
          const parentPath = state.parentId !== null ? findPathById(state.parentId, 'folder') : null;
          
          try {
            const newPath = await createFolder(parentPath, cleanName);
            const folderId = newPath.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
            
            // 确保父文件夹已展开，并展开新创建的文件夹
            if (state.parentId !== null) {
              setExpandedFolders(prev => {
                const newSet = new Set(prev);
                newSet.add(state.parentId!);
                return newSet;
              });
            }
            // 展开新创建的文件夹
            setExpandedFolders(prev => {
              const newSet = new Set(prev);
              newSet.add(folderId);
              return newSet;
            });
            
            // 清除编辑状态
            setEditingState(null);
            
            // 刷新文件树
            if (onRefresh) {
              onRefresh();
            }
          } catch (error: any) {
            if (error.message?.includes('已存在') || error.message?.includes('.themes')) {
              showToast(error.message, { type: 'warning' });
              setEditingState(null);
              return;
            }
            showToast(error.message || '创建文件夹失败', { type: 'error' });
            setEditingState(null);
          }
        }
      } else if (state.type === 'rename') {
        const nodeId = typeof state.nodeId === 'number' ? state.nodeId : parseInt(state.nodeId.toString());
        const oldPath = findPathById(nodeId, state.nodeType);
        if (!oldPath) {
          showToast('找不到要重命名的项目', { type: 'error' });
          return;
        }
        
        try {
          const newNameWithExt = state.nodeType === 'file' ? `${cleanName}.md` : cleanName;
          const newPath = await renameFileOrFolder(oldPath, newNameWithExt);
          
          // 如果重命名的是当前文件，需要更新
          if (currentFileId === state.nodeId && state.nodeType === 'file' && onFileCreated) {
            const updatedFile = await pathToIFileWithContent(newPath);
            onFileCreated(updatedFile);
          }
          
          // 清除编辑状态
          setEditingState(null);
          
          // 刷新文件树
          if (onRefresh) {
            onRefresh();
          }
        } catch (error: any) {
          if (error.message?.includes('已存在') || error.message?.includes('themes')) {
            showToast(error.message, { type: 'warning' });
            setEditingState(null);
            return;
          }
          showToast(error.message || '重命名失败', { type: 'error' });
          setEditingState(null);
        }
      }
    } catch (error) {
      console.error('保存失败:', error);
      showToast('保存失败，请重试', { type: 'error' });
      // 出错时也清除编辑状态
      setEditingState(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingState(null);
  };

  return (
    <div className="space-y-1">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-2 py-2 border-b sticky top-0 bg-white z-10">
        <div className="text-sm font-medium text-gray-700">目录</div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleStartCreate('file', null)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="新建文件"
          >
            <span className="text-sm">📄</span>
          </button>
          <button
            onClick={() => handleStartCreate('folder', null)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="新建文件夹"
          >
            <span className="text-sm">📁</span>
          </button>
        </div>
      </div>

      {/* 树节点 */}
      <div className="py-1">
        {treeData.length === 0 && !editingState ? (
          <div className="text-center text-gray-400 text-sm py-8">
            暂无文件，点击上方按钮创建
          </div>
        ) : (
          treeData.map((node) => (
            <TreeItem
              key={node.id}
              node={node}
              level={0}
              isExpanded={expandedFolders.has(node.id)}
              expandedFolders={expandedFolders}
              currentFileId={currentFileId}
              editingState={editingState}
              onToggle={toggleFolder}
              onSelect={onSelectFile}
              onDelete={onDelete}
              onStartCreate={handleStartCreate}
              onStartRename={handleStartRename}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};
