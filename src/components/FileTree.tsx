import { useState, useEffect, useRef } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';
import { buildFileTree, removeFile, removeFolder, createFile, createFolder, renameFileOrFolder } from '../storage/fileTreeService';
import { getGitHubConfig } from '../services/settingsStorage';
import { syncAllMarkdownFiles } from '../sync/syncEngine';
import { showToast } from '../utils/toast';
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
    onCreate: (type: 'file' | 'folder', parentPath: string | null) => void;
    onRename: (oldPath: string, newName: string) => Promise<void>;
    creatingNode?: CreatingNode | null;
    creatingName?: string;
    setCreatingName?: (name: string) => void;
    creatingInputRef?: React.RefObject<HTMLInputElement>;
    onCreateSave?: () => void;
    onCreateCancel?: () => void;
    onCreateKeyDown?: (e: React.KeyboardEvent) => void;
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
    onRename,
    creatingNode,
    creatingName = '',
    setCreatingName,
    creatingInputRef,
    onCreateSave,
    onCreateCancel,
    onCreateKeyDown
}) => {
    const isExpanded = expandedPaths.has(node.path);
    const isActive = node.type === 'file' && node.path === currentFilePath;
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
        console.log('handleSave 被调用', { editValue, nodeType: node.type, nodePath: node.path, nodeName: node.name });
        
        if (!editValue.trim()) {
            setIsEditing(false);
            setEditValue(node.name);
            return;
        }
        
        const newName = node.type === 'file' 
            ? editValue.trim().replace(/\.md$/, '') + '.md'
            : editValue.trim();
        
        console.log('计算的新名称:', newName);
        
        // 校验：如果名称没有变化，提示并退出编辑模式
        const currentName = node.type === 'file' ? node.name.replace(/\.md$/, '') : node.name;
        if (newName === currentName) {
            console.log('名称未变化，提示并退出编辑模式');
            showToast('名称未变化，未执行任何操作', { type: 'info' });
            setIsEditing(false);
            return;
        }
        
        // 名称不同，执行重命名
        try {
            console.log('调用 onRename', { path: node.path, newName });
            await onRename(node.path, newName);
            console.log('重命名成功');
            // 成功时 UI 会自动更新（通过 onRename 回调），这里只需要退出编辑模式
            setIsEditing(false);
        } catch (error: any) {
            // handleRename 内部已经显示了 toast，这里只需要恢复编辑状态
            // 不输出错误到控制台，避免重复显示（handleRename 已经处理了错误提示）
            setIsEditing(false);
            setEditValue(node.name);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValue(node.name);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
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
                    <div className="flex-1 flex items-center gap-1 min-w-0">
                        <input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => {
                                const value = node.type === 'file' 
                                    ? e.target.value.replace(/\.md$/i, '')
                                    : e.target.value;
                                setEditValue(value);
                            }}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 min-w-0 px-1 py-0.5 border border-blue-500 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                            placeholder={node.type === 'file' ? '输入文件名' : '输入文件夹名'}
                        />
                        {node.type === 'file' && (
                            <span className="text-sm text-gray-500 whitespace-nowrap">.md</span>
                        )}
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                await handleSave();
                            }}
                            className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors whitespace-nowrap"
                            title="确定"
                            type="button"
                        >
                            确定
                        </button>
                    </div>
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
            {node.type === 'folder' && isExpanded && (
                <div>
                    {/* 正在此文件夹下创建的新节点 */}
                    {creatingNode && creatingNode.parentPath === node.path && (
                        <div className="flex items-center px-2 py-1 hover:bg-gray-100 rounded" style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}>
                            <span className="mr-1 text-sm">
                                {creatingNode.type === 'folder' ? '📁' : '📄'}
                            </span>
                            <div className="flex-1 min-w-0 flex items-center gap-1">
                                <input
                                    ref={creatingInputRef}
                                    type="text"
                                    value={creatingName}
                                    onChange={(e) => {
                                        const value = creatingNode.type === 'file' 
                                            ? e.target.value.replace(/\.md$/i, '')
                                            : e.target.value;
                                        setCreatingName?.(value);
                                    }}
                                    onKeyDown={onCreateKeyDown}
                                    className="flex-1 min-w-0 px-1 py-0.5 border border-blue-400 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    placeholder={creatingNode.type === 'file' ? '输入文件名' : '输入文件夹名'}
                                />
                                {creatingNode.type === 'file' && (
                                    <span className="text-sm text-gray-500 whitespace-nowrap">.md</span>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onCreateSave) onCreateSave();
                                    }}
                                    className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors whitespace-nowrap"
                                    title="确定"
                                >
                                    确定
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* 子节点 */}
                    {node.children && node.children.map((child) => (
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
                            creatingNode={creatingNode}
                            creatingName={creatingName}
                            setCreatingName={setCreatingName}
                            creatingInputRef={creatingInputRef}
                            onCreateSave={onCreateSave}
                            onCreateCancel={onCreateCancel}
                            onCreateKeyDown={onCreateKeyDown}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

interface CreatingNode {
    type: 'file' | 'folder';
    parentPath: string | null;
    tempId: string;
}

export default function FileTree({ currentFilePath, onSelectFile, isCollapsed = false, onToggleCollapse }: Props) {
    const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
    const [creatingNode, setCreatingNode] = useState<CreatingNode | null>(null);
    const [creatingName, setCreatingName] = useState('');
    const creatingInputRef = useRef<HTMLInputElement | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        path: string;
        type: 'file' | 'folder';
        name: string;
    } | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        type: 'info' | 'error';
    } | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

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
            const { path, type, name } = deleteConfirm;
            if (type === 'file') {
                await removeFile(path);
            } else {
                await removeFolder(path);
            }
            setDeleteConfirm(null);
            showToast(`${type === 'file' ? '文件' : '文件夹'} "${name}" 删除成功`, { type: 'success' });
            await loadFileTree();
        } catch (error) {
            console.error('删除失败:', error);
            showToast('删除失败，请重试', { type: 'error' });
        }
    };

    const handleStartCreate = (type: 'file' | 'folder', parentPath: string | null) => {
        // 确保父文件夹已展开
        if (parentPath !== null) {
            setExpandedPaths(prev => {
                const newSet = new Set(prev);
                newSet.add(parentPath);
                return newSet;
            });
        }
        
        setCreatingNode({
            type,
            parentPath,
            tempId: `temp-${Date.now()}`
        });
        setCreatingName('');
    };

    useEffect(() => {
        if (creatingNode && creatingInputRef.current) {
            creatingInputRef.current.focus();
        }
    }, [creatingNode]);

    const handleCreateSave = async () => {
        if (!creatingNode || !creatingName.trim()) {
            setCreatingNode(null);
            setCreatingName('');
            return;
        }

        try {
            const name = creatingName.trim();
            if (creatingNode.type === 'file') {
                // 构建完整逻辑路径
                const fileName = name.replace(/\.md$/, '');
                const fullPath = creatingNode.parentPath 
                    ? `${creatingNode.parentPath}/${fileName}.md`
                    : `${fileName}.md`;
                const newPath = await createFile(fullPath);
                await loadFileTree();
                setCreatingNode(null);
                setCreatingName('');
                onSelectFile(newPath);
            } else {
                // 构建完整逻辑路径
                const fullPath = creatingNode.parentPath 
                    ? `${creatingNode.parentPath}/${name}`
                    : name;
                await createFolder(fullPath);
                await loadFileTree();
                setCreatingNode(null);
                setCreatingName('');
            }
        } catch (error: any) {
            console.error('创建失败:', error);
            const errorMsg = error.message?.includes('已存在') 
                ? error.message 
                : '创建失败，请重试';
            setToast({ message: errorMsg, type: 'error' });
            // 创建失败时不关闭输入框，让用户修改后重试
        }
    };

    const handleCreateCancel = () => {
        setCreatingNode(null);
        setCreatingName('');
    };

    const handleCreateKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreateSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCreateCancel();
        }
    };

    const handleRename = async (oldPath: string, newName: string): Promise<void> => {
        try {
            console.log('重命名:', { oldPath, newName });
            // renameFileOrFolder 接收的是新名称（不是完整路径），它会自动从 oldPath 提取父路径
            // 如果是文件，确保 .md 后缀
            const isFile = oldPath.endsWith('.md');
            const finalNewName = isFile && !newName.endsWith('.md') 
                ? `${newName}.md` 
                : newName;
            
            const resultPath = await renameFileOrFolder(oldPath, finalNewName);
            console.log('重命名成功，新路径:', resultPath);
            await loadFileTree();
            if (oldPath === currentFilePath) {
                onSelectFile(resultPath);
            }
        } catch (error: any) {
            // 显示错误提示（不输出到控制台，避免重复显示）
            const errorMessage = error?.message || '重命名失败，请重试';
            showToast(errorMessage, { type: 'error' });
            // 不重新抛出错误，避免错误堆栈显示在控制台
            // 调用方通过返回值或状态来判断操作是否成功
        }
    };

    // 增量推送
    const handleSync = async () => {
        const githubConfig = getGitHubConfig();
        if (!githubConfig || !githubConfig.repo || !githubConfig.token) {
            showToast('请先在设置中配置 GitHub 仓库地址和 Token', { type: 'warning' });
            return;
        }

        if (isSyncing) {
            return;
        }

        setIsSyncing(true);
        try {
            // getGitHubConfig() 已经返回了解析后的 owner 和 repo，不需要再次 split
            if (!githubConfig.owner || !githubConfig.repo) {
                showToast('GitHub 仓库配置无效，请重新配置', { type: 'error' });
                return;
            }
            const config = {
                token: githubConfig.token,
                owner: githubConfig.owner,
                repo: githubConfig.repo,
                branch: githubConfig.branch || 'main',
                basePath: githubConfig.basePath || ''
            };
            console.log('🚀 开始增量推送，配置:', { owner: config.owner, repo: config.repo, basePath: config.basePath, branch: config.branch });
            const syncResult = await syncAllMarkdownFiles(config);
            console.log('📊 同步结果:', syncResult);
            if (syncResult.errors.length > 0) {
                console.error('❌ 同步错误:', syncResult.errors);
                // 检查是否有权限错误
                const hasPermissionError = syncResult.errors.some(e => e.includes('权限不足') || e.includes('403'));
                if (hasPermissionError) {
                    showToast('Token 权限不足，请检查 Token 是否有写入权限', { type: 'error' });
                } else {
                    showToast(`增量推送完成，但有 ${syncResult.errors.length} 个错误`, { type: 'warning' });
                }
            } else if (syncResult.pushed === 0 && syncResult.skipped > 0) {
                showToast('所有文件已是最新，无需同步', { type: 'info' });
            } else {
                showToast(`增量推送成功：推送 ${syncResult.pushed} 个文件`, { type: 'success' });
            }
        } catch (error: any) {
            console.error('增量推送失败:', error);
            // 检查是否是权限或分支错误
            const errorMsg = error.message || '请重试';
            if (errorMsg.includes('权限不足') || errorMsg.includes('403')) {
                showToast('Token 权限不足，请检查 Token 是否有 "Contents" 的 "Read and write" 权限', { type: 'error' });
            } else if (errorMsg.includes('分支') || errorMsg.includes('404')) {
                showToast(`分支或仓库配置错误：${errorMsg}`, { type: 'error' });
            } else {
                showToast(`增量推送失败：${errorMsg}`, { type: 'error' });
            }
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="h-full flex flex-col relative overflow-hidden">
            {/* 工具栏 - 始终显示 */}
            <div className="flex-none flex items-center justify-end px-2 py-2 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center space-x-1">
                    {!isCollapsed && (
                        <>
                            <button
                                onClick={() => handleStartCreate('file', null)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                                title="新建文件"
                            >
                                <span className="text-sm">📄</span>
                            </button>
                            <button
                                onClick={() => handleStartCreate('folder', null)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                                title="新建文件夹"
                            >
                                <span className="text-sm">📁</span>
                            </button>
                        </>
                    )}
                    {onToggleCollapse && (
                        <button
                            onClick={onToggleCollapse}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors ml-1"
                            title={isCollapsed ? "展开目录" : "折叠目录"}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isCollapsed ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                )}
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            
            {!isCollapsed && (
                <>
                    
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 min-w-0">
                        <div className="min-w-[240px]">
                            {fileTree.length === 0 && !creatingNode ? (
                                <div className="text-center text-gray-400 text-sm py-8">
                                    暂无文件，点击上方按钮创建
                                </div>
                            ) : (
                                <>
                                    {/* 正在创建的新节点 */}
                                    {creatingNode && creatingNode.parentPath === null && (
                                        <div className="flex items-center px-2 py-1 hover:bg-gray-100 rounded" style={{ paddingLeft: '8px' }}>
                                            <span className="mr-1 text-sm">
                                                {creatingNode.type === 'folder' ? '📁' : '📄'}
                                            </span>
                                            <div className="flex-1 min-w-0 flex items-center gap-1">
                                                <input
                                                    ref={creatingInputRef}
                                                    type="text"
                                                    value={creatingName}
                                                    onChange={(e) => {
                                                        const value = creatingNode.type === 'file' 
                                                            ? e.target.value.replace(/\.md$/i, '')
                                                            : e.target.value;
                                                        setCreatingName?.(value);
                                                    }}
                                                    onKeyDown={handleCreateKeyDown}
                                                    className="flex-1 min-w-0 px-1 py-0.5 border border-blue-400 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                    placeholder={creatingNode.type === 'file' ? '输入文件名' : '输入文件夹名'}
                                                />
                                                {creatingNode.type === 'file' && (
                                                    <span className="text-sm text-gray-500 whitespace-nowrap">.md</span>
                                                )}
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        await handleCreateSave();
                                                    }}
                                                    className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors whitespace-nowrap"
                                                    title="确定"
                                                    type="button"
                                                >
                                                    确定
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* 文件树节点 */}
                                    {fileTree.map((node) => (
                                        <TreeNode
                                            key={node.path}
                                            node={node}
                                            level={0}
                                            currentFilePath={currentFilePath}
                                            expandedPaths={expandedPaths}
                                            onToggle={handleToggle}
                                            onSelect={onSelectFile}
                                            onDelete={handleDelete}
                                            onCreate={handleStartCreate}
                                            onRename={handleRename}
                                            creatingNode={creatingNode}
                                            creatingName={creatingName}
                                            setCreatingName={setCreatingName}
                                            creatingInputRef={creatingInputRef}
                                            onCreateSave={handleCreateSave}
                                            onCreateCancel={handleCreateCancel}
                                            onCreateKeyDown={handleCreateKeyDown}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            {isCollapsed && (
                <div className="flex-1 border-r border-gray-200">
                </div>
            )}

            {/* 底部增量推送按钮 */}
            <div className="flex-none bg-white">
                {isCollapsed ? (
                    <div className="flex items-center justify-end px-2 py-2">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors ${
                                isSyncing ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                            title="增量推送"
                        >
                            {isSyncing ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="px-2 py-2">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded transition-all duration-300 ease-in-out border ${
                                isSyncing
                                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100'
                            } text-base font-medium`}
                        >
                            {isSyncing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="whitespace-nowrap">推送中...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="whitespace-nowrap">增量推送</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

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
