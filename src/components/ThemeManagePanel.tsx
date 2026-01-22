import { useState, useEffect } from 'react';
import { listThemes, deleteTheme } from '../storage/themeStorage';
import type { StoredTheme } from '../types/type';
import { useTheme } from '../contexts/ThemeContext';
import { Dialog } from './Dialog';
import { showToast } from '../utils/toast';
import { themes as builtInThemes } from '../themes';

interface Props {
  onClose: () => void;
}

// 内置主题 ID 集合，这些主题不允许在管理面板中删除
const BUILT_IN_THEME_IDS = new Set(builtInThemes.map(t => t.id));

export default function ThemeManagePanel({ onClose }: Props) {
  const { setTheme, currentTheme, refreshThemes } = useTheme();
  const [themes, setThemes] = useState<StoredTheme[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载主题列表
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const allThemes = await listThemes();
        setThemes(allThemes);
      } catch (error) {
        console.error('加载主题列表失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemes();
  }, []);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    confirmText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const handleDelete = async (theme: StoredTheme) => {
    // 所有内置主题（themes/index.ts 中定义的）不允许删除
    if (BUILT_IN_THEME_IDS.has(theme.id)) {
      showToast('内置主题不能删除，如需修改请在样式编辑器中另存为新主题后再编辑', { type: 'warning' });
      return;
    }

    setDialog({
      isOpen: true,
      title: '确认删除',
      message: `确定要删除主题 "${theme.name}" 吗？此操作不可恢复。`,
      type: 'warning',
      confirmText: '删除',
      onConfirm: async () => {
        setDeletingId(theme.id);
        try {
          await deleteTheme(theme.id);
          
          // 如果删除的是当前主题，切换到默认主题
          if (currentTheme.id === theme.id || currentTheme.name === theme.name) {
            setTheme('default');
          }
          
          // 刷新主题列表
          await refreshThemes();
          const updatedThemes = await listThemes();
          setThemes(updatedThemes);
          
          setDialog({ isOpen: false, title: '', message: '' });
          showToast('主题已删除', { type: 'success' });
        } catch (error) {
          console.error('删除主题失败:', error);
          setDialog({ isOpen: false, title: '', message: '' });
          showToast('删除主题失败，请重试', { type: 'error' });
        } finally {
          setDeletingId(null);
        }
      },
      onCancel: () => {
        setDialog({ isOpen: false, title: '', message: '' });
      },
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-none p-2 bg-gray-50 border-b text-sm font-medium">
        主题管理
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">主题管理</h2>
          
          {isLoading ? (
            <div className="text-center text-gray-400 py-12">
              <p>加载中...</p>
            </div>
          ) : themes.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p>暂无主题</p>
              <p className="text-sm mt-2">您可以在样式编辑器中创建自定义主题</p>
            </div>
          ) : (
            <div className="space-y-3">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{theme.name}</span>
                      {(currentTheme.id === theme.id || currentTheme.name === theme.name) && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                          当前使用
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      创建于: {theme.createdAt ? new Date(theme.createdAt).toLocaleString('zh-CN') : '-'}
                      {theme.updatedAt && theme.updatedAt !== theme.createdAt && (
                        <span className="ml-3">
                          更新于: {new Date(theme.updatedAt).toLocaleString('zh-CN')}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* 内置主题不显示删除按钮，其它主题可以删除 */}
                  {!BUILT_IN_THEME_IDS.has(theme.id) && (
                    <button
                      onClick={() => handleDelete(theme)}
                      disabled={deletingId === theme.id}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === theme.id ? '删除中...' : '删除'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 关闭按钮（右下角对齐，与设置页面风格一致） */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      {/* 对话框 */}
      <Dialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
      />
    </div>
  );
}


