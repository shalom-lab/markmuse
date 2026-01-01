import { useState, useEffect } from 'react';

interface Settings {
  githubRepo?: string;
  githubToken?: string;
  autoSave?: boolean;
  [key: string]: any;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: Props) {
  const [settings, setSettings] = useState<Settings>({
    githubRepo: '',
    githubToken: '',
    autoSave: true
  });

  // 加载设置
  useEffect(() => {
    if (isOpen) {
      const savedSettings = localStorage.getItem('markmuse-settings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('加载设置失败:', e);
        }
      }
    }
  }, [isOpen]);

  // 保存设置
  const handleSave = () => {
    try {
      localStorage.setItem('markmuse-settings', JSON.stringify(settings));
      onClose();
    } catch (e) {
      console.error('保存设置失败:', e);
      // 注意：SettingsDialog 可能不再使用，但保留以防万一
      alert('保存设置失败，请重试');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">设置</h3>
            
            <div className="space-y-4">
              {/* GitHub 仓库地址 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub 仓库地址
                </label>
                <input
                  type="text"
                  value={settings.githubRepo || ''}
                  onChange={(e) => setSettings({ ...settings, githubRepo: e.target.value })}
                  placeholder="例如: username/repository"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  格式: owner/repository
                </p>
              </div>

              {/* GitHub Token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub Token
                </label>
                <input
                  type="password"
                  value={settings.githubToken || ''}
                  onChange={(e) => setSettings({ ...settings, githubToken: e.target.value })}
                  placeholder="输入 GitHub Personal Access Token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  用于访问私有仓库或提高 API 限制
                </p>
              </div>

              {/* 自动保存 */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoSave !== false}
                    onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">自动保存</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

