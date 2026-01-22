import { useState, useEffect, useRef } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';
import { buildFileTree, removeFile, removeFolder, createFile, createFolder, renameFileOrFolder, getFileContent } from '../storage/fileTreeService';
import type { FileTreeNode } from '../types/type';

interface Props {
    currentFilePath?: string | null;
    onSelectFile: (filePath: string) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

interface TreeNodeProps {
    node: FileTreeNode;
    level: number;
    currentFilePath?: string | null;
    expandedPaths: Set<string>;
    onToggle: (path: string) => void;
    onSelect: (path: string) => void;
    onDelete: (path: string, type: 'file' | 'folder', name: string) => void;
    onCreate: (type: 'file' | 'folder', parentPath: string | null) => Promise<void>;
    onRename: (oldPath: string, newName: string) => Promise<void>;
}

const TreeNode: React.FC<TreeNodeProps> = ({ 
    node, 
    level, 
    currentFilePath,
    expandedPaths,
    onToggle,
    onSelect,
    onDelete,
    onCreate,
    onRename
}) => {
    const isExpanded = expandedPaths.has(node.path);
    const isActive = node.type === 'file' && node.path === currentFilePath;
    const hasChildren = node.children && node.children.length > 0;
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(node.name);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleClick = () => {
        if (node.type === 'folder') {
            onToggle(node.path);
        } else {
            onSelect(node.path);
        }
    };

    const handleDoubleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditValue(node.type === 'file' ? node.name.replace(/\.md$/, '') : node.name);
    };

    const handleRenameClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditValue(node.type === 'file' ? node.name.replace(/\.md$/, '') : node.name);
    };

    const handleCreateFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCreate('file', node.path);
    };

    const handleCreateFolder = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCreate('folder', node.path);
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (!editValue.trim()) {
            setIsEditing(false);
            setEditValue(node.name);
            return;
        }
        try {
            const newName = node.type === 'file' 
                ? editValue.trim().replace(/\.md$/, '') + '.md'
                : editValue.trim();
            await onRename(node.path, newName);
            setIsEditing(false);
        } catch (error) {
            console.error('重命名失败:', error);
            setIsEditing(false);
            setEditValue(node.name);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditValue(node.name);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(node.path, node.type, node.name);
    };

    return (
        <div>
            <div
                className={`group flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer rounded ${isActive ? 'bg-blue-50' : ''}`}
                style={{ paddingLeft: `${level * 20 + 8}px` }}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
            >
                {node.type === 'folder' && (
                    <span className="mr-1 text-sm">
                        {isExpanded ? '📂' : '📁'}
                    </span>
                )}
                {node.type === 'file' && (
                    <span className="mr-1 text-sm">📄</span>
                )}
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-1 border border-blue-500 rounded text-sm"
                    />
                ) : (
                    <span className="flex-1 text-sm truncate">{node.name}</span>
                )}
                
                {/* 操作按钮 - 悬停时显示 */}
                {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 ml-2">
                        {node.type === 'folder' && (
                            <>
                                <button
                                    onClick={handleCreateFile}
                                    className="p-1 hover:bg-gray-200 rounded text-xs"
                                    title="新建文件"
                                >
                                    📄
                                </button>
                                <button
                                    onClick={handleCreateFolder}
                                    className="p-1 hover:bg-gray-200 rounded text-xs"
                                    title="新建文件夹"
                                >
                                    📁
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleRenameClick}
                            className="p-1 hover:bg-gray-200 rounded text-xs"
                            title="重命名"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-1 hover:bg-red-100 rounded text-red-500 text-xs"
                            title="删除"
                        >
                            🗑️
                        </button>
                    </div>
                )}
            </div>
            {node.type === 'folder' && isExpanded && node.children && (
                <div>
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.path}
                            node={child}
                            level={level + 1}
                            currentFilePath={currentFilePath}
                            expandedPaths={expandedPaths}
                            onToggle={onToggle}
                            onSelect={onSelect}
                            onDelete={onDelete}
                            onCreate={onCreate}
                            onRename={onRename}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function FileTree({ currentFilePath, onSelectFile, isCollapsed = false, onToggleCollapse }: Props) {
    const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
    const [deleteConfirm, setDeleteConfirm] = useState<{
        path: string;
        type: 'file' | 'folder';
        name: string;
    } | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        type: 'info' | 'error';
    } | null>(null);

    // 加载文件树
    const loadFileTree = async () => {
        try {
            const tree = await buildFileTree();
            setFileTree(tree);
        } catch (error) {
            console.error('加载文件树失败:', error);
        }
    };

    useEffect(() => {
        loadFileTree();
        const interval = setInterval(loadFileTree, 2000);
        return () => clearInterval(interval);
    }, []);

    // 自动展开包含当前文件的文件夹
    useEffect(() => {
        if (currentFilePath) {
            const parts = currentFilePath.split('/').filter(Boolean);
            const pathsToExpand = new Set<string>();
            let currentPath = '';
            for (const part of parts.slice(0, -1)) {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                pathsToExpand.add(currentPath);
            }
            setExpandedPaths(pathsToExpand);
        }
    }, [currentFilePath]);

    const handleToggle = (path: string) => {
        const newExpanded = new Set(expandedPaths);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedPaths(newExpanded);
    };

    const handleDelete = (path: string, type: 'file' | 'folder', name: string) => {
        setDeleteConfirm({ path, type, name });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            const { path, type } = deleteConfirm;
            if (type === 'file') {
                await removeFile(path);
            } else {
                await removeFolder(path);
            }
            setDeleteConfirm(null);
            setToast({ message: '删除成功', type: 'info' });
            await loadFileTree();
        } catch (error) {
            console.error('删除失败:', error);
            setToast({ message: '删除失败，请重试', type: 'error' });
        }
    };

    const handleCreate = async (type: 'file' | 'folder', parentPath: string | null) => {
        try {
            // 确保父文件夹已展开
            if (parentPath !== null) {
                setExpandedPaths(prev => {
                    const newSet = new Set(prev);
                    newSet.add(parentPath);
                    return newSet;
                });
            }
            
            const name = prompt(`请输入${type === 'file' ? '文件' : '文件夹'}名称:`);
            if (!name || !name.trim()) return;
            
            if (type === 'file') {
                const newPath = await createFile(parentPath, name.trim().replace(/\.md$/, ''));
                await loadFileTree();
                onSelectFile(newPath);
            } else {
                await createFolder(parentPath, name.trim());
                await loadFileTree();
            }
        } catch (error: any) {
            console.error('创建失败:', error);
            const errorMsg = error.message?.includes('已存在') 
                ? error.message 
                : '创建失败，请重试';
            setToast({ message: errorMsg, type: 'error' });
        }
    };

    const handleRename = async (oldPath: string, newName: string) => {
        try {
            const newPath = await renameFileOrFolder(oldPath, newName);
            await loadFileTree();
            if (oldPath === currentFilePath) {
                onSelectFile(newPath);
            }
        } catch (error) {
            console.error('重命名失败:', error);
            throw error;
        }
    };

    return (
        <div className="h-full flex flex-col relative overflow-hidden">
            {!isCollapsed && (
                <>
                    {/* 工具栏 */}
                    <div className="flex-none flex items-center justify-between px-2 py-2 border-b sticky top-0 bg-white z-10">
                        <div className="text-sm font-medium text-gray-700">目录</div>
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => handleCreate('file', null)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-600"
                                title="新建文件"
                            >
                                <span className="text-sm">📄</span>
                            </button>
                            <button
                                onClick={() => handleCreate('folder', null)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-600"
                                title="新建文件夹"
                            >
                                <span className="text-sm">📁</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 min-w-0">
                        <div className="min-w-[240px]">
                            {fileTree.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm py-8">
                                    暂无文件，点击上方按钮创建
                                </div>
                            ) : (
                                fileTree.map((node) => (
                                    <TreeNode
                                        key={node.path}
                                        node={node}
                                        level={0}
                                        currentFilePath={currentFilePath}
                                        expandedPaths={expandedPaths}
                                        onToggle={handleToggle}
                                        onSelect={onSelectFile}
                                        onDelete={handleDelete}
                                        onCreate={handleCreate}
                                        onRename={handleRename}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                    <div className="flex-none border-t border-gray-200 p-2">
                        {onToggleCollapse && (
                            <button
                                onClick={onToggleCollapse}
                                className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>折叠目录</span>
                            </button>
                        )}
                    </div>
                </>
            )}

            {isCollapsed && (
                <div className="flex-1 flex flex-col items-center justify-center h-full">
                    {onToggleCollapse && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleCollapse();
                            }}
                            className="p-3 hover:bg-gray-100 rounded transition-colors cursor-pointer w-full flex items-center justify-center"
                            title="展开目录"
                            type="button"
                        >
                            <div className="text-2xl">📁</div>
                        </button>
                    )}
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteConfirm}
                title="确认删除"
                message={deleteConfirm
                    ? `确定要删除${deleteConfirm.type === 'file' ? '文件' : '文件夹'}"${deleteConfirm.name}"？`
                    : ''}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirm(null)}
            />

            <Toast
                isOpen={!!toast}
                message={toast?.message || ''}
                type={toast?.type || 'info'}
                onClose={() => setToast(null)}
            />
        </div>
    );
}
