import { DraftSession } from '../storage/draftSession';
import { registerSyncPreparation } from '../sync/syncCoordinator';
import { useState, useEffect, useRef } from 'react';
import Toolbar from '../components/Toolbar';
import FileTree from '../components/FileTree';
import MarkdownEditor from '../components/MarkdownEditor';
import SettingsPanel from '../components/SettingsPanel';
import ThemeManagePanel from '../components/ThemeManagePanel';
import { getSettings } from '../services/settingsStorage';
import { showToast } from '../utils/toast';
import { saveFileContent, getFileContent } from '../storage/fileTreeService';

export default function EditorPage() {
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isMarkdownVisible, setIsMarkdownVisible] = useState(true);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isCssVisible, setIsCssVisible] = useState(true);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isThemeManageVisible, setIsThemeManageVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isSyncingRef = useRef(false);
  const [autoSave, setAutoSave] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draft = useRef(new DraftSession(saveFileContent));
  const transitioning = useRef(false);
  const [busy, setBusy] = useState(false);

  const cancelSaveTimer = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = null;
  };
  const flushDraft = async () => {
    cancelSaveTimer();
    await draft.current.flush();
  };
  const startTransition = () => {
    if (transitioning.current) throw new Error('正在保存或同步，请稍后重试');
    transitioning.current = true;
    setBusy(true);
  };
  const endTransition = () => {
    transitioning.current = false;
    setBusy(false);
  };
  const showDraft = (path: string | null, text = '') => {
    draft.current.open(path, text);
    setCurrentFilePath(path);
    setContent(text);
  };

  useEffect(() => {
    const unregister = registerSyncPreparation(async changesLocal => {
      startTransition();
      try { await flushDraft(); } catch (error) { endTransition(); throw error; }
      // Push reads saved snapshots; writing can continue while the network is busy.
      if (!changesLocal) { endTransition(); return; }
      return async () => {
        try {
          const path = draft.current.path;
          if (path) {
            const text = await getFileContent(path);
            showDraft(text === null ? null : path, text ?? '');
          }
          window.dispatchEvent(new Event('markmuse-files-changed'));
        } finally { endTransition(); }
      };
    });
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (draft.current.dirty) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => { unregister(); cancelSaveTimer(); window.removeEventListener('beforeunload', beforeUnload); };
  }, []);

  // 加载自动保存设置
  useEffect(() => {
    const loadAutoSaveSetting = async () => {
      const settings = await getSettings();
      setAutoSave(settings.autoSave !== false); // 默认为 true
    };
    loadAutoSaveSetting();
  }, [isSettingsVisible]); // 当设置页面打开/关闭时重新加载

  // 手动保存文件
  const handleManualSave = async () => {
    if (!currentFilePath) {
      showToast('没有打开的文件', { type: 'warning' });
      return;
    }
    
    try {
      await flushDraft();
      showToast('文件保存成功', { type: 'success' });
    } catch (error) {
      console.error('保存文件失败:', error);
      showToast('保存文件失败，请重试', { type: 'error' });
    }
  };

  // 添加 Ctrl+S 快捷键支持（仅在自动保存关闭时）
  useEffect(() => {
    if (autoSave) return; // 自动保存开启时不需要快捷键
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [autoSave, currentFilePath, content]);

  const handleContentChange = (newContent: string) => {
    if (transitioning.current) return;
    draft.current.edit(newContent);
    setContent(newContent);
    cancelSaveTimer();
    if (autoSave && draft.current.path) {
      saveTimeoutRef.current = setTimeout(() => {
        void flushDraft().catch(() => showToast('自动保存失败，稿件仍保留在编辑器中，请重试保存', { type: 'error' }));
      }, 500);
    }
  };

  const handleSelectFile = async (filePath: string) => {
    if (transitioning.current) return;
    startTransition();
    try {
      await flushDraft();
      const text = await getFileContent(filePath);
      if (text === null) throw new Error('文件不存在或无法读取');
      showDraft(filePath, text);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '打开失败，当前稿件已保留', { type: 'error' });
    } finally { endTransition(); }
  };

  const handleFileMutation = async (path: string, operation: () => Promise<string | null>) => {
    startTransition();
    try {
      await flushDraft();
      const nextPath = await operation();
      const current = draft.current.path;
      if (current && (current === path || current.startsWith(path + '/'))) {
        showDraft(nextPath === null ? null : nextPath + current.slice(path.length), nextPath === null ? '' : draft.current.content);
      }
    } finally { endTransition(); }
  };

  const handleFormatAction = (shortcut: string) => {
    // 通过全局函数触发格式操作
    if ((window as any).triggerMarkdownFormat) {
      (window as any).triggerMarkdownFormat(shortcut);
    }
  };

  // 处理打开帮助文档
  const handleOpenHelp = async () => {
    try {
      const { createFile, getFileContent } = await import('../storage/fileTreeService');
      
      // 查找是否已存在"帮助文档.md"（使用逻辑路径）
      let filePath = '帮助文档.md';
      let isExisting = false;
      try {
        await getFileContent(filePath);
        isExisting = true;
      } catch {
        // 文件不存在，继续创建
      }
      
      const helpContent = `# MarkMuse 帮助文档

欢迎使用 MarkMuse！这是一个功能强大的 Markdown 编辑器。

## 主要功能

### 1. 文件管理
- 在左侧文件树中创建、重命名、删除文件和文件夹
- 支持文件夹嵌套结构
- 所有文件自动保存到本地 OPFS（Origin Private File System）

### 2. Markdown 编辑
- 实时预览 Markdown 内容
- 支持代码高亮
- 支持数学公式（行内和块级）
- 支持 Emoji 表情

### 3. 格式工具栏
- 点击顶部"格式"菜单查看所有支持的格式
- 使用快捷键快速格式化文本
- 支持标题、列表、代码块、表格等

### 4. 主题管理
- 点击顶部"主题"菜单切换主题
- 在样式编辑器中自定义 CSS
- 保存为自定义主题或更新现有主题
- 在"主题管理"中管理所有自定义主题

### 5. 导出功能
- 复制到微信公众号格式
- 支持代码高亮和数学公式

## 快捷键

### 文本格式
- \`Ctrl+B\`: 加粗
- \`Ctrl+I\`: 倾斜
- \`Ctrl+U\`: 下划线
- \`Ctrl+E\`: 行内代码
- \`Ctrl+Alt+X\`: 删除线

### 标题
- \`Ctrl+1\` 到 \`Ctrl+6\`: 一级到六级标题

### 列表
- \`Ctrl+L\`: 无序列表
- \`Ctrl+O\`: 有序列表
- \`Ctrl+T\`: 任务列表

### 其他
- \`Ctrl+Q\`: 引用
- \`Ctrl+K\`: 代码块
- \`Ctrl+Shift+K\`: 链接
- \`Ctrl+Shift+I\`: 图片
- \`Ctrl+Shift+T\`: 表格
- \`Ctrl+Shift+H\`: 分割线
- \`Ctrl+Shift+M\`: 行内公式
- \`Ctrl+M\`: 块级公式

## 使用技巧

1. **快速命令**: 在编辑器中输入 \`/\` 可以打开快捷命令菜单
2. **Emoji**: 点击 Markdown 编辑区右上角的表情图标插入 Emoji
3. **自定义样式**: 在样式编辑器中修改 CSS，然后保存为自定义主题
4. **视图切换**: 在"视图"菜单中控制编辑区、预览区和样式区的显示

## 实例演示

### 行内公式

行内公式使用 \`$...$\` 语法，例如：爱因斯坦的质能方程 $E = mc^2$，或者勾股定理 $a^2 + b^2 = c^2$。

### 块级数学公式

块级公式使用 \`$$...$$\` 语法，例如：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

或者矩阵表示：

$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
\\begin{pmatrix}
x \\\\
y
\\end{pmatrix}
=
\\begin{pmatrix}
ax + by \\\\
cx + dy
\\end{pmatrix}
$$

### 引用

> 这是一段引用文字。
> 
> 可以包含多行内容，适合引用名言、重要提示等。
> 
> 引用块会自动应用特殊样式，让内容更加突出。

### 代码块

#### Python 示例

\`\`\`python
def fibonacci(n):
    """计算斐波那契数列的第 n 项"""
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# 使用示例
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

#### R 语言示例

\`\`\`r
# 数据可视化示例
library(ggplot2)

# 创建示例数据
data <- data.frame(
  x = 1:10,
  y = rnorm(10, mean = 5, sd = 2)
)

# 绘制散点图
ggplot(data, aes(x = x, y = y)) +
  geom_point(color = "steelblue", size = 3) +
  geom_smooth(method = "lm", se = TRUE) +
  labs(
    title = "散点图示例",
    x = "X 轴",
    y = "Y 轴"
  ) +
  theme_minimal()
\`\`\`

#### JavaScript 示例

\`\`\`javascript
// 异步函数示例
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取用户数据失败:', error);
    throw error;
  }
}

// 使用示例
fetchUserData(123)
  .then(user => console.log('用户信息:', user))
  .catch(error => console.error('错误:', error));
\`\`\`

### 组合示例

在实际写作中，你可以组合使用这些功能：

> **提示**: 在数据分析中，我们经常使用 $R^2$ 来评估模型的拟合度。当 $R^2$ 接近 1 时，说明模型拟合效果很好。

代码实现如下：

\`\`\`python
import numpy as np
from sklearn.metrics import r2_score

# 计算 R² 值
y_true = np.array([1, 2, 3, 4, 5])
y_pred = np.array([1.1, 2.2, 2.9, 4.1, 4.8])
r2 = r2_score(y_true, y_pred)
print(f"R² 值: {r2:.4f}")
\`\`\`

数学公式表示为：

$$
R^2 = 1 - \\frac{\\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2}{\\sum_{i=1}^{n}(y_i - \\bar{y})^2}
$$

## 常见问题

### Q: 如何创建新文件？
A: 在文件树中右键点击文件夹，选择"新建文件"，或直接在文件夹上点击新建文件按钮。

### Q: 如何删除文件？
A: 在文件树中悬停文件，点击删除按钮（🗑️）。

### Q: 如何自定义主题？
A: 在样式编辑器中修改 CSS，点击保存按钮，选择"更新主题"或"另存为新主题"。

### Q: 数据存储在哪里？
A: 所有数据存储在浏览器的 OPFS（Origin Private File System）中，无需担心数据丢失。

---

如有问题或建议，欢迎反馈！
`;

      if (isExisting) {
        // 如果文件已存在，更新内容
        await saveFileContent(filePath, helpContent);
        handleSelectFile(filePath);
        showToast('帮助文档已打开', { type: 'success' });
      } else {
        // 如果文件不存在，创建新文件
        filePath = await createFile('帮助文档');
        await saveFileContent(filePath, helpContent);
        handleSelectFile(filePath);
        showToast('帮助文档创建成功', { type: 'success' });
      }
      
      // 确保显示编辑页面（关闭设置、主题管理等）
      setIsSettingsVisible(false);
      setIsThemeManageVisible(false);
      setIsMarkdownVisible(true);
      setIsPreviewVisible(true);
      setIsCssVisible(true);
    } catch (error) {
      console.error('打开帮助文档失败:', error);
      showToast('打开帮助文档失败，请重试', { type: 'error' });
    }
  };

  // 定期自动增量推送（仅在页面激活时）
  useEffect(() => {
    let syncInterval: ReturnType<typeof setInterval> | null = null;

    const performSync = async () => {
      // 只在页面可见时执行
      if (document.hidden) {
        return;
      }

      const { getGitHubConfig } = await import('../services/settingsStorage');
      const config = getGitHubConfig();
      if (!config) {
        return;
      }

      // 防止重复同步
      if (isSyncingRef.current) {
        return;
      }

      try {
        isSyncingRef.current = true;
        const { syncAllMarkdownFiles } = await import('../sync/syncEngine');
        const result = await syncAllMarkdownFiles(config);
        if (result.errors.length) showToast(result.errors[0], { type: 'warning' });
        console.log('定期自动增量推送完成');
      } catch (error) {
        console.error('定期自动增量推送失败:', error);
        showToast(error instanceof Error ? error.message : '自动推送失败，请重试', { type: 'warning' });
      } finally {
        isSyncingRef.current = false;
      }
    };

    // 清除定时器
    const clearSyncInterval = () => {
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
    };

    // 设置定期同步（仅在页面可见时）
    const setupPeriodicSync = async () => {
      // 如果页面隐藏，不设置定时器
      if (document.hidden) {
        clearSyncInterval();
        return;
      }

      const settings = await getSettings();
      if (!settings.autoSyncInterval || settings.autoSyncInterval <= 0) {
        clearSyncInterval();
        return;
      }

      // 清除旧的定时器
      clearSyncInterval();

      // 设置新的定时器，从页面激活时开始计时
      syncInterval = setInterval(performSync, settings.autoSyncInterval * 60 * 1000);
      console.log(`定期自动增量推送已设置：每 ${settings.autoSyncInterval} 分钟同步一次（从页面激活时开始计时）`);
    };

    // 处理页面可见性变化
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // 页面激活时，重新设置定时器（从激活时开始计时）
        await setupPeriodicSync();
      } else {
        // 页面隐藏时，清除定时器
        clearSyncInterval();
      }
    };

    // 初始化：如果页面可见，设置定时器
    setupPeriodicSync();

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理
    return () => {
      clearSyncInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSettingsVisible]); // 当设置页面打开/关闭时重新加载

  return (
    <div className="h-screen flex flex-col" aria-busy={busy}
      onKeyDownCapture={event => { if (busy) { event.preventDefault(); event.stopPropagation(); } }}>
      {busy && <div className="fixed inset-0 z-[100] cursor-wait flex items-center justify-center bg-white/20" role="status">
        <span className="rounded bg-white px-4 py-2 shadow">正在保存或更新文件，请稍候…</span>
      </div>}
      <Toolbar
        isMarkdownVisible={isMarkdownVisible}
        isPreviewVisible={isPreviewVisible}
        isCssVisible={isCssVisible}
        isSettingsVisible={isSettingsVisible}
        onMarkdownToggle={setIsMarkdownVisible}
        onPreviewToggle={setIsPreviewVisible}
        onCssToggle={setIsCssVisible}
        onSettingsToggle={(visible) => {
          if (visible) {
            // 打开设置页面，关闭主题管理和其他视图
            setIsSettingsVisible(true);
            setIsThemeManageVisible(false);
            setIsMarkdownVisible(false);
            setIsPreviewVisible(false);
            setIsCssVisible(false);
          } else {
            // 关闭设置页面，恢复默认视图
            setIsSettingsVisible(false);
            setIsMarkdownVisible(true);
            setIsPreviewVisible(true);
            setIsCssVisible(true);
          }
        }}
        onFormatAction={handleFormatAction}
        onOpenThemeManage={() => {
          setIsThemeManageVisible(true);
          // 如果打开了主题管理，隐藏其他视图
          setIsMarkdownVisible(false);
          setIsPreviewVisible(false);
          setIsCssVisible(false);
          setIsSettingsVisible(false);
        }}
        onOpenHelp={handleOpenHelp}
      />
      <div className="flex-1 flex min-h-0">
        <div 
          className={`border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${
            isSidebarCollapsed ? 'w-12' : 'w-64'
          }`}
          style={{
            transitionProperty: 'width',
            transitionDuration: '300ms',
            transitionTimingFunction: 'ease-in-out',
            willChange: 'width'
          }}
        >
          <FileTree 
            currentFilePath={currentFilePath} 
            onSelectFile={handleSelectFile}
            onMutate={handleFileMutation}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>
        <div className="flex-1 min-w-0">
          {isThemeManageVisible ? (
            <ThemeManagePanel 
              onClose={() => {
                setIsThemeManageVisible(false);
                // 恢复默认视图
                setIsMarkdownVisible(true);
                setIsPreviewVisible(true);
                setIsCssVisible(true);
              }}
            />
          ) : isSettingsVisible ? (
            <SettingsPanel 
              onSave={() => {
                // 保存后关闭设置页面，恢复默认视图
                setIsSettingsVisible(false);
                setIsMarkdownVisible(true);
                setIsPreviewVisible(true);
                setIsCssVisible(true);
              }}
            />
          ) : currentFilePath ? (
            <MarkdownEditor 
              key={currentFilePath}
              content={content}
              readOnly={busy}
              onChange={handleContentChange}
              currentFilePath={currentFilePath}
              isMarkdownCollapsed={!isMarkdownVisible}
              autoSave={autoSave}
              onSave={handleManualSave}
              isPreviewCollapsed={!isPreviewVisible}
              isCssCollapsed={!isCssVisible}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              请选择或创建一个文件开始编辑
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 