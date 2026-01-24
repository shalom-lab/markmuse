import { useState, useEffect } from 'react';
import { getSettings, saveSettings, getGitHubConfig, saveGitHubConfig, verifyGitHubAccess } from '../services/settingsStorage';
import { clearAllFiles } from '../storage/fileTreeService';
import { pullAllRemoteFiles, pushToRemote } from '../sync/syncEngine';
import { Dialog } from './Dialog';
import { showToast } from '../utils/toast';
import { useTheme } from '../contexts/ThemeContext';
import { Download, Upload, Trash2, Loader2 } from 'lucide-react';
import { themes as builtInThemes } from '../themes';

interface Settings {
  autoSave?: boolean;
  autoSyncInterval?: number;
  defaultTheme?: string;
}

interface Props {
  onSave?: () => void;
}

export default function SettingsPanel({ onSave }: Props) {
  const { themes, applyDefaultTheme } = useTheme();
  
  const [settings, setSettings] = useState<Settings>({
    autoSave: true,
    autoSyncInterval: 30,
  });
  const [savedSettings, setSavedSettings] = useState<Settings | null>(null);
  
  // GitHub 配置状态
  const [githubRepo, setGitHubRepo] = useState('');
  const [githubToken, setGitHubToken] = useState('');
  const [githubPath, setGitHubPath] = useState('');
  const [githubBranch, setGitHubBranch] = useState('main');
  const [savedGitHubConfig, setSavedGitHubConfig] = useState<{ repo: string; token: string; path: string; branch: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // 同步状态
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  
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
        const settingsWithDefault = {
          ...loadedSettings,
          defaultTheme: loadedSettings.defaultTheme || 'default',
        };
        setSettings(settingsWithDefault);
        setSavedSettings(JSON.parse(JSON.stringify(settingsWithDefault)));
        
        // 加载 GitHub 配置
        const githubConfig = getGitHubConfig();
        if (githubConfig) {
          setGitHubRepo(`${githubConfig.owner}/${githubConfig.repo}`);
          setGitHubToken(githubConfig.token);
          setGitHubPath(githubConfig.basePath);
          setGitHubBranch(githubConfig.branch);
          setSavedGitHubConfig({
            repo: `${githubConfig.owner}/${githubConfig.repo}`,
            token: githubConfig.token,
            path: githubConfig.basePath,
            branch: githubConfig.branch,
          });
          
          // 静默验证配置是否仍然有效（不显示错误，只在控制台记录）
          verifyGitHubAccess(`${githubConfig.owner}/${githubConfig.repo}`, githubConfig.token)
            .then(({ defaultBranch }) => {
              // 如果检测到的默认分支与保存的分支不一致，自动更新分支
              if (defaultBranch !== githubConfig.branch) {
                console.warn(`⚠️ 检测到默认分支已变更：${githubConfig.branch} -> ${defaultBranch}，自动更新分支配置`);
                setGitHubBranch(defaultBranch);
                // 自动更新保存的分支，确保同步时使用正确的分支
                saveGitHubConfig({
                  repo: `${githubConfig.owner}/${githubConfig.repo}`,
                  token: githubConfig.token,
                  basePath: githubConfig.basePath,
                  branch: defaultBranch,
                });
                // 更新保存的配置状态
                setSavedGitHubConfig({
                  repo: `${githubConfig.owner}/${githubConfig.repo}`,
                  token: githubConfig.token,
                  path: githubConfig.basePath,
                  branch: defaultBranch,
                });
              } else {
                console.log('✅ GitHub 配置验证通过，分支:', defaultBranch);
              }
            })
            .catch((error) => {
              console.warn('⚠️ GitHub 配置验证失败（可能 Token 已过期或权限变更）:', error.message);
              // 不显示错误提示，让用户在使用时发现
            });
        }
      } catch (e) {
        console.error('加载设置失败:', e);
      }
    };
    loadSettings();
  }, []);

  // 检查设置是否有未保存的更改
  const hasUnsavedSettingsChanges = (): boolean => {
    if (!savedSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(savedSettings);
  };

  // 检查 GitHub 配置是否有未保存的更改
  const hasUnsavedGitHubChanges = (): boolean => {
    if (!savedGitHubConfig) {
      return !!(githubRepo || githubToken || githubPath);
    }
    return (
      githubRepo !== savedGitHubConfig.repo ||
      githubToken !== savedGitHubConfig.token ||
      githubPath !== savedGitHubConfig.path
    );
  };

  // 保存设置
  const handleSaveSettings = async () => {
    try {
      await saveSettings(settings);
      setSavedSettings(JSON.parse(JSON.stringify(settings)));
      await applyDefaultTheme();
      showToast('设置已保存', { type: 'success' });
      if (onSave) {
        onSave();
      }
    } catch (e) {
      console.error('保存设置失败:', e);
      showToast('保存设置失败，请重试', { type: 'error' });
    }
  };

  // 保存 GitHub 配置
  const handleSaveGitHubConfig = async () => {
    if (!githubRepo || !githubToken) {
      showToast('请填写仓库地址和 Token', { type: 'error' });
      return;
    }

    setIsVerifying(true);
    try {
      // 验证仓库和 Token
      const { defaultBranch } = await verifyGitHubAccess(githubRepo, githubToken);
      
      // 保存配置（使用检测到的分支）
      saveGitHubConfig({
        repo: githubRepo,
        token: githubToken,
        basePath: githubPath,
        branch: defaultBranch,
      });
      
      setGitHubBranch(defaultBranch);
      setSavedGitHubConfig({
        repo: githubRepo,
        token: githubToken,
        path: githubPath,
        branch: defaultBranch,
      });
      
      showToast('GitHub 配置已保存', { type: 'success' });
    } catch (error: any) {
      console.error('验证失败:', error);
      showToast(error.message || '验证失败，请检查仓库地址和 Token', { type: 'error' });
    } finally {
      setIsVerifying(false);
    }
  };


  // 覆盖本地
  const handleOverwriteLocal = () => {
    setDialog({
      isOpen: true,
      title: '警告',
      message: '此操作将用远程数据强制覆盖本地所有文件，会删除本地未推送的修改。\n\n确定要继续吗？',
      type: 'warning',
      confirmText: '确定覆盖',
      onConfirm: async () => {
        // 立即关闭对话框
        setDialog({ isOpen: false, title: '', message: '' });
        
        const githubConfig = getGitHubConfig();
        if (!githubConfig || !githubConfig.repo || !githubConfig.token) {
          showToast('请先配置 GitHub 仓库和 Token', { type: 'warning' });
          return;
        }

        setIsPulling(true);
        try {
          const config = {
            token: githubConfig.token,
            owner: githubConfig.owner!,
            repo: githubConfig.repo,
            branch: githubConfig.branch || 'main',
            basePath: githubConfig.basePath || ''
          };
          
          showToast('正在覆盖本地文件...', { type: 'info' });
          const result = await pullAllRemoteFiles(config);
          
          if (result.errors.length > 0) {
            showToast(`覆盖完成，但有 ${result.errors.length} 个错误`, { type: 'warning' });
            console.error('覆盖本地错误:', result.errors);
          } else {
            showToast(`覆盖成功：拉取 ${result.pulled} 个文件，删除 ${result.deleted} 个文件`, { type: 'success' });
          }
        } catch (error: any) {
          showToast(`覆盖失败：${error.message || '未知错误'}`, { type: 'error' });
          console.error('覆盖本地失败:', error);
        } finally {
          setIsPulling(false);
        }
      },
      onCancel: () => {
        setDialog({ isOpen: false, title: '', message: '' });
      },
    });
  };

  // 覆盖远程
  const handleOverwriteRemote = () => {
    setDialog({
      isOpen: true,
      title: '警告',
      message: '此操作将用本地数据强制覆盖远程所有文件，会删除远程已有数据。\n\n确定要继续吗？',
      type: 'warning',
      confirmText: '确定覆盖',
      onConfirm: async () => {
        // 立即关闭对话框
        setDialog({ isOpen: false, title: '', message: '' });
        
        const githubConfig = getGitHubConfig();
        if (!githubConfig || !githubConfig.repo || !githubConfig.token) {
          showToast('请先配置 GitHub 仓库和 Token', { type: 'warning' });
          return;
        }

        setIsPushing(true);
        try {
          const config = {
            token: githubConfig.token,
            owner: githubConfig.owner!,
            repo: githubConfig.repo,
            branch: githubConfig.branch || 'main',
            basePath: githubConfig.basePath || ''
          };
          
          showToast('正在覆盖远程文件...', { type: 'info' });
          const result = await pushToRemote(config);
          
          if (result.errors.length > 0) {
            showToast(`覆盖完成，但有 ${result.errors.length} 个错误`, { type: 'warning' });
            console.error('覆盖远程错误:', result.errors);
          } else {
            showToast(`覆盖成功：推送 ${result.pushed} 个文件，删除 ${result.deleted} 个文件`, { type: 'success' });
          }
        } catch (error: any) {
          showToast(`覆盖失败：${error.message || '未知错误'}`, { type: 'error' });
          console.error('覆盖远程失败:', error);
        } finally {
          setIsPushing(false);
        }
      },
      onCancel: () => {
        setDialog({ isOpen: false, title: '', message: '' });
      },
    });
  };

  // 清空本地数据
  const handleClearLocalData = () => {
    setDialog({
      isOpen: true,
      title: '警告',
      message: '此操作将清空所有本地文件数据，此操作不可恢复！\n\n确定要继续吗？',
      type: 'warning',
      confirmText: '确定清空',
      onConfirm: async () => {
        try {
          await clearAllFiles();
          setDialog({ isOpen: false, title: '', message: '' });
          showToast('本地数据已清空', { type: 'success' });
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
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-none p-2 bg-gray-50 border-b text-sm font-medium">
        设置
      </div>
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-semibold mb-4">应用设置</h2>
          
          {/* 1. 默认主题 */}
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
                {(() => {
                  const builtInThemeIds = new Set(builtInThemes.map(t => t.id));
                  const builtInThemesList = themes.filter(t => builtInThemeIds.has(t.id));
                  const customThemes = themes.filter(t => !builtInThemeIds.has(t.id));
                  
                  return (
                    <>
                      {builtInThemesList.length > 0 && (
                        <optgroup label="系统主题">
                          {builtInThemesList.map((theme) => (
                            <option key={theme.id} value={theme.id}>
                              {theme.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {customThemes.length > 0 && (
                        <optgroup label="自定义主题">
                          {customThemes.map((theme) => (
                            <option key={theme.id} value={theme.id}>
                              {theme.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </>
                  );
                })()}
              </select>
            </div>
          </div>

          {/* 2. GitHub 同步配置 */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">GitHub 同步配置</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                仓库地址
              </label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGitHubRepo(e.target.value)}
                placeholder="例如: username/repository"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGitHubToken(e.target.value)}
                placeholder="输入 GitHub Personal Access Token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                同步路径
              </label>
              <input
                type="text"
                value={githubPath}
                onChange={(e) => setGitHubPath(e.target.value.trim())}
                placeholder="留空则使用仓库根目录"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分支名称
              </label>
              <input
                type="text"
                value={githubBranch}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                保存配置时会自动检测仓库默认分支
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveGitHubConfig}
                disabled={isVerifying || !hasUnsavedGitHubChanges()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? '验证中...' : '保存 GitHub 配置'}
              </button>
            </div>

            {/* 安全提示 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
              <ul className="list-disc list-inside space-y-1">
                <li>GitHub Token 存储在浏览器本地，请妥善保管</li>
                <li>
                  Fine-grained token（推荐）：选择特定仓库，设置 Contents 权限为 Read and write
                  <a
                    href="https://github.com/settings/personal-access-tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    如何获取
                  </a>
                </li>
                <li>
                  数据存储结构：所有数据将同步到 <code className="bg-yellow-100 px-1 rounded">同步路径/.markmuse/</code> 文件夹下
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                    <li>文件存放在 <code className="bg-yellow-100 px-1 rounded">.markmuse/files/</code></li>
                    <li>主题存放在 <code className="bg-yellow-100 px-1 rounded">.markmuse/.themes/</code></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. 保存和同步 */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">保存和同步</h3>
            
            {/* 本地自动保存 */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoSave !== false}
                  onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">本地自动保存</span>
              </label>
            </div>

            {/* 定时自动增量推送 */}
            <div className="flex items-center gap-2">
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
                <span className="text-sm font-medium text-gray-700">定时自动增量推送</span>
              </label>
              {(settings.autoSyncInterval || 0) > 0 && (
                <>
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
                  <span className="text-sm text-gray-600">分钟</span>
                </>
              )}
            </div>

            {/* 危险操作 */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">危险操作</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleOverwriteLocal}
                  disabled={isPulling || isPushing}
                  className="px-4 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isPulling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{isPulling ? '覆盖中...' : '覆盖本地'}</span>
                </button>
                <button
                  onClick={handleOverwriteRemote}
                  disabled={isPulling || isPushing}
                  className="px-4 py-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isPushing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{isPushing ? '覆盖中...' : '覆盖远程'}</span>
                </button>
                <button
                  onClick={handleClearLocalData}
                  className="px-4 py-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>清空本地数据</span>
                </button>
              </div>
            </div>

            {/* 功能说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-xs text-blue-800">
              <p className="font-medium mb-2">功能说明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>本地自动保存</strong>：编辑内容时，停止输入 500ms 后自动保存到本地数据库（防抖机制，避免频繁写入）
                </li>
                <li>
                  <strong>增量推送</strong>：手动触发增量推送，只推送新增/修改的文件，不覆盖远程已有文件
                </li>
                <li>
                  <strong>定时自动增量推送</strong>：每 N 分钟自动执行一次增量推送（仅在页面激活/可见时）
                </li>
                <li>
                  <strong>覆盖本地</strong>：用远程数据强制覆盖本地所有文件（会删除本地未推送的修改）
                </li>
                <li>
                  <strong>覆盖远程</strong>：用本地数据强制覆盖远程所有文件（会删除远程已有数据）
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* 固定在底部的保存栏 */}
      <div className={`flex-none border-t bg-white shadow-lg transition-all ${
        hasUnsavedSettingsChanges() ? 'border-orange-300' : 'border-gray-200'
      }`}>
        <div className="max-w-2xl mx-auto p-4">
          {hasUnsavedSettingsChanges() && (
            <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-sm text-yellow-800 mb-3">
              <p className="font-medium mb-1">⚠️ 检测到未保存的设置更改</p>
              <p>您已修改了设置，但尚未保存。请点击下方的"保存设置"按钮保存更改，否则修改不会生效。</p>
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              onClick={handleSaveSettings}
              className={`px-6 py-2.5 rounded transition-all font-medium ${
                hasUnsavedSettingsChanges()
                  ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg transform hover:scale-105'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {hasUnsavedSettingsChanges() ? '💾 保存设置（有未保存的更改）' : '保存设置'}
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
