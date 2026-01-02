import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../services/settingsStorage';
import { GitHubSync } from '../services/githubSync';
import { db } from '../db';
import { Dialog } from './Dialog';
import { showToast } from '../utils/toast';
import { useTheme } from '../contexts/ThemeContext';
import { useLiveQuery } from 'dexie-react-hooks';

interface Settings {
  githubRepo?: string;
  githubToken?: string;
  autoSave?: boolean;
  enableSync?: boolean;
  autoSyncInterval?: number;
  syncOnDeactivate?: boolean;
  syncBasePath?: string;
  defaultTheme?: string;
}

interface Props {
  onSave?: () => void;
}

export default function SettingsPanel({ onSave }: Props) {
  const { themes: builtInThemes, applyDefaultTheme } = useTheme();
  const customThemes = useLiveQuery(() => db.themes.filter(theme => theme.isCustom === true).toArray());
  
  const [settings, setSettings] = useState<Settings>({
    githubRepo: '',
    githubToken: '',
    autoSave: true,
    enableSync: false,
    autoSyncInterval: 30,
    syncOnDeactivate: false,
    syncBasePath: '', // 默认为空，使用仓库根目录
  });
  const [savedSettings, setSavedSettings] = useState<Settings | null>(null); // 已保存的设置
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
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

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await getSettings();
        // 如果没有设置过默认主题，使用内置的默认主题 'default'
        const settingsWithDefault = {
          ...loadedSettings,
          defaultTheme: loadedSettings.defaultTheme || 'default',
        };
        setSettings(settingsWithDefault);
        // 保存已保存的设置副本，用于比较是否有未保存的更改
        setSavedSettings(JSON.parse(JSON.stringify(settingsWithDefault)));
        
        // 加载上次同步时间
        const metadata = await db.syncMetadata.toCollection().first();
        if (metadata?.lastSyncTime) {
          setLastSyncTime(new Date(metadata.lastSyncTime));
        }
      } catch (e) {
        console.error('加载设置失败:', e);
      }
    };
    loadSettings();
  }, []);

  // 检查是否有未保存的更改
  const hasUnsavedChanges = (): boolean => {
    if (!savedSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(savedSettings);
  };

  // 保存设置
  const handleSave = async () => {
    try {
      await saveSettings(settings);
      // 更新已保存的设置副本
      setSavedSettings(JSON.parse(JSON.stringify(settings)));
      // 应用默认主题
      await applyDefaultTheme();
      showToast('设置已保存', { type: 'success' });
      // 调用回调函数，关闭设置页面并恢复默认视图
      if (onSave) {
        onSave();
      }
    } catch (e) {
      console.error('保存设置失败:', e);
      showToast('保存设置失败，请重试', { type: 'error' });
    }
  };

  // 手动同步
  const handleSync = async () => {
    // 检查是否有未保存的更改
    if (hasUnsavedChanges()) {
      setSyncStatus({
        message: '检测到未保存的设置更改，请先点击"保存设置"按钮保存更改后再同步',
        type: 'error',
      });
      showToast('请先保存设置更改', { type: 'warning' });
      return;
    }

    // 从存储中重新读取最新设置，确保使用最新的仓库配置
    const latestSettings = await getSettings();
    
    if (!latestSettings.githubRepo || !latestSettings.githubToken) {
      setSyncStatus({
        message: '请先配置 GitHub 仓库地址和 Token',
        type: 'error',
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus({ message: '正在同步...', type: 'info' });

    try {
      const sync = new GitHubSync(
        latestSettings.githubToken, 
        latestSettings.githubRepo,
        latestSettings.syncBasePath || ''
      );
      const result = await sync.sync();

      if (result.success) {
        setSyncStatus({
          message: result.message + (result.stats
            ? ` (文件: +${result.stats.filesAdded} ↑${result.stats.filesUpdated}, 主题: +${result.stats.themesAdded} ↑${result.stats.themesUpdated})`
            : ''),
          type: 'success',
        });
        setLastSyncTime(new Date());
        
        // 更新本地同步元数据
        const metadata = await db.syncMetadata.toCollection().first();
        if (metadata) {
          await db.syncMetadata.update(metadata.id!, {
            lastSyncTime: new Date(),
            lastSyncHash: Date.now().toString(),
            isSyncing: false,
            syncError: null,
            updatedAt: new Date(),
          });
        } else {
          await db.syncMetadata.add({
            lastSyncTime: new Date(),
            lastSyncHash: Date.now().toString(),
            isSyncing: false,
            syncError: null,
            updatedAt: new Date(),
          });
        }
      } else {
        setSyncStatus({
          message: result.message,
          type: 'error',
        });
      }
    } catch (error) {
      setSyncStatus({
        message: error instanceof Error ? error.message : '同步失败',
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-none p-2 bg-gray-50 border-b text-sm font-medium">
        设置
      </div>
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-semibold mb-4">应用设置</h2>
          
          {/* 默认主题设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">默认主题</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                默认主题
              </label>
              <select
                value={settings.defaultTheme || 'default'}
                onChange={(e) => setSettings({ ...settings, defaultTheme: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="内置主题">
                  {builtInThemes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </optgroup>
                {customThemes && customThemes.length > 0 && (
                  <optgroup label="自定义主题">
                    {customThemes.map((theme) => (
                      <option key={theme.name} value={theme.name}>
                        {theme.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                设置应用启动时的默认主题
              </p>
            </div>
          </div>

          {/* 自动保存设置 */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">自动保存</h3>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoSave !== false}
                  onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">启用自动保存</span>
              </label>
              <div className="mt-1 ml-6">
                {settings.autoSave !== false ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800">
                    <p className="font-medium mb-1">✓ 已开启：编辑内容会自动保存到本地数据库</p>
                    <p>开启自动保存可确保数据实时持久化（500ms 防抖，减少频繁写入），建议保持开启状态</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
                    <p className="font-medium mb-1">✗ 已关闭：内容不会自动保存</p>
                    <p>关闭后编辑的内容仅保存在内存中，仅在切换文件时自动保存以避免数据丢失</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GitHub 同步设置 */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">GitHub 同步</h3>
            
            {/* GitHub 仓库地址 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            
            {/* 启用同步 */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enableSync === true}
                  onChange={(e) => setSettings({ ...settings, enableSync: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">启用 GitHub 同步</span>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                启用后可以将数据同步到 GitHub 仓库，实现跨设备共享
              </p>
            </div>

            {/* 定期自动同步 */}
            {settings.enableSync && (
              <>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(settings.autoSyncInterval || 0) > 0}
                      onChange={(e) => setSettings({
                        ...settings,
                        autoSyncInterval: e.target.checked ? 30 : 0,
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">定期自动同步</span>
                  </label>
                  {(settings.autoSyncInterval || 0) > 0 && (
                    <div className="ml-6 mt-2">
                      <input
                        type="number"
                        min="5"
                        max="1440"
                        value={settings.autoSyncInterval || 30}
                        onChange={(e) => setSettings({
                          ...settings,
                          autoSyncInterval: parseInt(e.target.value) || 30,
                        })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="ml-2 text-sm text-gray-600">分钟</span>
                    </div>
                  )}
                </div>

                {/* 页面失活时同步 */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.syncOnDeactivate === true}
                      onChange={(e) => setSettings({ ...settings, syncOnDeactivate: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">页面失活时自动同步</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500 ml-6">
                    切换标签页或关闭浏览器时自动同步
                  </p>
                </div>

                {/* 同步路径配置 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    同步路径
                  </label>
                  <input
                    type="text"
                    value={settings.syncBasePath || ''}
                    onChange={(e) => setSettings({ ...settings, syncBasePath: e.target.value.trim() })}
                    placeholder="留空则使用仓库根目录"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    所有数据将同步到 <code className="bg-gray-100 px-1 rounded">{settings.syncBasePath || '仓库根目录'}/.markmuse/</code> 文件夹下
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    • 文件存放在 <code className="bg-gray-100 px-1 rounded">.markmuse/files/</code><br/>
                    • 主题存放在 <code className="bg-gray-100 px-1 rounded">.markmuse/themes/</code><br/>
                    • 元数据存放在 <code className="bg-gray-100 px-1 rounded">.markmuse/metadata.json</code>
                  </p>
                  <details className="mt-2 text-xs text-gray-400">
                    <summary className="cursor-pointer hover:text-gray-600">元数据说明</summary>
                    <div className="mt-2 pl-4 space-y-1">
                      <p>元数据文件用于记录同步状态信息：</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li><code className="bg-gray-100 px-1 rounded">lastSyncTime</code> - 上次同步时间</li>
                        <li><code className="bg-gray-100 px-1 rounded">lastSyncHash</code> - 上次同步的哈希值（用于检测变更）</li>
                        <li><code className="bg-gray-100 px-1 rounded">isSyncing</code> - 是否正在同步中</li>
                        <li><code className="bg-gray-100 px-1 rounded">syncError</code> - 同步错误信息（如有）</li>
                      </ul>
                      <p className="mt-1 text-gray-500">这些信息有助于跟踪同步历史和排查问题。</p>
                    </div>
                  </details>
                </div>

                {/* 同步状态 */}
                <div className="space-y-2">
                  {lastSyncTime && (
                    <p className="text-sm text-gray-600">
                      上次同步时间: {lastSyncTime.toLocaleString('zh-CN')}
                    </p>
                  )}
                  
                  {syncStatus && (
                    <div
                      className={`p-2 rounded text-sm ${
                        syncStatus.type === 'success'
                          ? 'bg-green-50 text-green-700'
                          : syncStatus.type === 'error'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {syncStatus.message}
                    </div>
                  )}

                  {/* 立即同步按钮 */}
                  <button
                    onClick={handleSync}
                    disabled={isSyncing || !settings.enableSync || hasUnsavedChanges()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={hasUnsavedChanges() ? '请先保存设置更改' : ''}
                  >
                    {isSyncing ? '同步中...' : '立即同步'}
                  </button>
                  {hasUnsavedChanges() && (
                    <p className="mt-1 text-xs text-yellow-600">
                      ⚠️ 请先保存设置更改后再同步
                    </p>
                  )}
                </div>
              </>
            )}

            {/* 安全提示 */}
            {settings.enableSync && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
                <p className="font-medium mb-1">安全提示：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>GitHub Token 存储在浏览器本地，请妥善保管</li>
                  <li>建议使用最小权限的 Personal Access Token</li>
                  <li>定期更换 Token 以提高安全性</li>
                </ul>
              </div>
            )}
          </div>

          {/* 数据管理 */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">数据管理</h3>
            
            {/* 清空文件数据 */}
            <div>
              <button
                onClick={() => {
                  setDialog({
                    isOpen: true,
                    title: '警告',
                    message: '此操作将清空所有文件和文件夹数据，此操作不可恢复！\n\n清空范围：\n• 所有 Markdown 文件\n• 所有文件夹\n\n保留内容：\n• 应用设置（GitHub 配置、自动保存等）\n• 自定义主题\n• 同步元数据\n\n确定要继续吗？',
                    type: 'warning',
                    confirmText: '确定清空',
                    onConfirm: async () => {
                      try {
                        // 只清空文件和文件夹
                        await db.files.clear();
                        await db.folders.clear();
                        
                        setDialog({ isOpen: false, title: '', message: '' });
                        showToast('文件和文件夹已清空', { type: 'success' });
                        // 延迟刷新页面，让用户看到提示
                        setTimeout(() => {
                          window.location.reload();
                        }, 1000);
                      } catch (error) {
                        console.error('清空数据失败:', error);
                        setDialog({ isOpen: false, title: '', message: '' });
                        showToast('清空数据失败，请重试', { type: 'error' });
                      }
                    },
                    onCancel: () => {
                      setDialog({ isOpen: false, title: '', message: '' });
                    },
                  });
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                清空文件数据
              </button>
              <p className="mt-2 text-xs text-gray-500">
                清空所有文件和文件夹数据。此操作不可恢复，请谨慎使用。
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                <p className="font-medium text-gray-700 mb-2">清空范围：</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mb-3">
                  <li>所有 Markdown 文件（.md）</li>
                  <li>所有文件夹及其结构</li>
                </ul>
                <p className="font-medium text-gray-700 mb-2">保留内容：</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>应用设置（GitHub 仓库地址、Token、自动保存等）</li>
                  <li>自定义主题（可在主题管理中手动删除）</li>
                  <li>同步元数据（同步历史记录）</li>
                </ul>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                提示：清空数据后，您可以重新配置同步路径，从 GitHub 仓库拉取数据到不同的路径。
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 固定在底部的保存栏 */}
      <div className={`flex-none border-t bg-white shadow-lg transition-all ${
        hasUnsavedChanges() ? 'border-orange-300' : 'border-gray-200'
      }`}>
        <div className="max-w-2xl mx-auto p-4">
          {/* 未保存提示 */}
          {hasUnsavedChanges() && (
            <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-sm text-yellow-800 mb-3 transition-opacity duration-300">
              <p className="font-medium mb-1">⚠️ 检测到未保存的设置更改</p>
              <p>您已修改了设置，但尚未保存。请点击下方的"保存设置"按钮保存更改，否则修改不会生效。</p>
            </div>
          )}

          {/* 保存按钮 */}
          <div className="flex items-center justify-end">
            <button
              onClick={handleSave}
              className={`px-6 py-2.5 rounded transition-all font-medium ${
                hasUnsavedChanges()
                  ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg transform hover:scale-105'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {hasUnsavedChanges() ? '💾 保存设置（有未保存的更改）' : '保存设置'}
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
        confirmText={dialog.confirmText}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
      />
    </div>
  );
}

