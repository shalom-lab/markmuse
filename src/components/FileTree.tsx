import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, IFile } from '../db';
import { TreeView } from './TreeView';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';

interface Props {
    currentFileId?: number | null;
    onSelectFile: (file: IFile) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export default function FileTree({ currentFileId, onSelectFile, isCollapsed = false, onToggleCollapse }: Props) {
    const files = useLiveQuery(() => db.files.toArray());
    const folders = useLiveQuery(() => db.folders.toArray());
    const [deleteConfirm, setDeleteConfirm] = useState<{
        id: number;
        type: 'file' | 'folder';
        name: string;
    } | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        type: 'info' | 'error';
    } | null>(null);

    const handleFileCreated = (file: IFile) => {
        onSelectFile(file);
    };

    const handleDelete = async (id: number, type: 'file' | 'folder') => {
        const item = type === 'file'
            ? files?.find(f => f.id === id)
            : folders?.find(f => f.id === id);

        if (!item) return;

        setDeleteConfirm({
            id,
            type,
            name: item.name
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            const { id, type } = deleteConfirm;
            if (type === 'file') {
                await db.files.delete(id);
            } else {
                // 先获取所有文件夹，用于递归查找
                const allFolders = await db.folders.toArray();
                
                // 递归获取所有子文件夹的 ID
                const getAllSubFolderIds = (parentId: number): number[] => {
                    const result: number[] = [];
                    // 从所有文件夹中查找直接子文件夹
                    const directChildren = allFolders.filter(f => f.parentId === parentId);
                    
                    for (const folder of directChildren) {
                        if (folder.id !== undefined) {
                            result.push(folder.id);
                            // 递归获取子文件夹的子文件夹
                            result.push(...getAllSubFolderIds(folder.id));
                        }
                    }
                    
                    return result;
                };

                // 获取所有需要删除的文件夹 ID（包括自身和所有子文件夹）
                const allFolderIds = [id, ...getAllSubFolderIds(id)];

                // 删除所有相关文件和文件夹
                await Promise.all([
                    // 删除所有文件夹内的文件
                    ...allFolderIds.map(folderId =>
                        db.files.where('parentId').equals(folderId).delete()
                    ),
                    // 删除所有文件夹
                    ...allFolderIds.map(folderId =>
                        db.folders.delete(folderId)
                    )
                ]);
            }
            setDeleteConfirm(null);
            setToast({ message: '删除成功', type: 'info' });
        } catch (error) {
            console.error('删除失败:', error);
            setToast({ message: '删除失败，请重试', type: 'error' });
        }
    };

    return (
        <div className="h-full flex flex-col relative overflow-hidden">
            {/* 文件树列表 */}
            {!isCollapsed && (
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 min-w-0">
                    {files && folders && (
                        <div className="min-w-[240px]">
                            <TreeView
                                files={files}
                                folders={folders}
                                currentFileId={currentFileId}
                                onSelectFile={onSelectFile}
                                onDelete={handleDelete}
                                onFileCreated={handleFileCreated}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* 折叠状态下只显示图标和展开按钮 */}
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
                    ? `确定要删除${deleteConfirm.type === 'file' ? '文件' : '文件夹'}"${deleteConfirm.name
                    }"？`
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

            {/* 底部按钮区域 */}
            {!isCollapsed && (
                <div className="flex-none border-t border-gray-200">
                    {/* 折叠按钮 - 在文件列表和设置按钮之间 */}
                    {onToggleCollapse && (
                        <div className="p-2">
                            <button
                                onClick={onToggleCollapse}
                                className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center gap-2 transition-colors"
                                title={isCollapsed ? '展开目录' : '折叠目录'}
                            >
                                <svg
                                    className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>折叠目录</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 