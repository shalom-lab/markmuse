import { useState, useEffect, useRef } from 'react';
import Toolbar from '../components/Toolbar';
import FileTree from '../components/FileTree';
import MarkdownEditor from '../components/MarkdownEditor';
import { db, IFile } from '../db';
import SettingsPanel from '../components/SettingsPanel';
import ThemeManagePanel from '../components/ThemeManagePanel';
import { getSettings } from '../services/settingsStorage';
import { GitHubSync } from '../services/githubSync';
import { showToast } from '../utils/toast';

export default function EditorPage() {
  const [currentFile, setCurrentFile] = useState<IFile | null>(null);
  const [content, setContent] = useState('');
  const [isMarkdownVisible, setIsMarkdownVisible] = useState(true);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isCssVisible, setIsCssVisible] = useState(true);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isThemeManageVisible, setIsThemeManageVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);
  const [autoSave, setAutoSave] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 加载自动保存设置
  useEffect(() => {
    const loadAutoSaveSetting = async () => {
      const settings = await getSettings();
      setAutoSave(settings.autoSave !== false); // 默认为 true
    };
    loadAutoSaveSetting();
  }, [isSettingsVisible]); // 当设置页面打开/关闭时重新加载

  const handleContentChange = async (newContent: string) => {
    setContent(newContent);
    
    // 如果自动保存开启，立即保存
    if (autoSave && currentFile?.id) {
      // 清除之前的定时器
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // 使用防抖，避免频繁保存（500ms 内只保存一次）
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await db.files.update(currentFile.id, {
            content: newContent,
            updatedAt: new Date()
          });
        } catch (error) {
          console.error('自动保存失败:', error);
        }
      }, 500);
    }
    // 如果自动保存关闭，不保存（内容只在内存中，切换文件时会丢失）
  };

  const handleSelectFile = async (file: IFile) => {
    // 如果自动保存关闭，在切换文件前保存当前文件的修改
    if (!autoSave && currentFile?.id && content !== currentFile.content) {
      try {
        await db.files.update(currentFile.id, {
          content: content,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('保存文件失败:', error);
      }
    }
    
    // 清除保存定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    console.log('选择文件:', file);
    setCurrentFile(file);
    setContent(file.content);
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
      // 查找是否已存在"帮助文档.md"
      const existingFile = await db.files.where('name').equals('帮助文档.md').and(f => f.parentId === null).first();
      
      const helpContent = `# MarkMuse 帮助文档

欢迎使用 MarkMuse！这是一个功能强大的 Markdown 编辑器。

## 主要功能

### 1. 文件管理
- 在左侧文件树中创建、重命名、删除文件和文件夹
- 支持文件夹嵌套结构
- 所有文件自动保存到本地 IndexedDB

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
A: 所有数据存储在浏览器的 IndexedDB 中，无需担心数据丢失。

---

如有问题或建议，欢迎反馈！
`;

      if (existingFile && existingFile.id) {
        // 如果文件已存在，更新内容
        await db.files.update(existingFile.id, {
          content: helpContent,
          updatedAt: new Date()
        });
        // 打开已存在的文件
        const updatedFile = await db.files.get(existingFile.id);
        if (updatedFile) {
          handleSelectFile(updatedFile);
        }
      } else {
        // 如果文件不存在，创建新文件
        const newFile = {
          name: '帮助文档.md',
          content: helpContent,
          parentId: null, // 根目录
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const id = await db.files.add(newFile);
        const createdFile: IFile = { ...newFile, id: id as number };
        handleSelectFile(createdFile);
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

  // 定期同步和页面失活同步
  useEffect(() => {
    let syncInterval: NodeJS.Timeout | null = null;

    const performSync = async () => {
      const settings = await getSettings();
      if (!settings.enableSync || !settings.githubRepo || !settings.githubToken) {
        return;
      }

      // 防止重复同步
      if (isSyncingRef.current) {
        return;
      }

      try {
        isSyncingRef.current = true;
        const { GitHubSync } = await import('../services/githubSync');
        const sync = new GitHubSync(
          settings.githubToken,
          settings.githubRepo,
          settings.syncBasePath || ''
        );
        await sync.sync();
        console.log('自动同步完成');
      } catch (error) {
        console.error('自动同步失败:', error);
      } finally {
        isSyncingRef.current = false;
      }
    };

    // 设置定期同步
    const setupPeriodicSync = async () => {
      const settings = await getSettings();
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }

      if (settings.enableSync && settings.autoSyncInterval && settings.autoSyncInterval > 0) {
        syncInterval = setInterval(performSync, settings.autoSyncInterval * 60 * 1000);
        console.log(`定期同步已设置：每 ${settings.autoSyncInterval} 分钟同步一次`);
      }
    };

    // 页面失活时同步
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        const settings = await getSettings();
        if (settings.enableSync && settings.syncOnDeactivate) {
          await performSync();
        }
      }
    };

    // 关闭浏览器前同步（注意：beforeunload 中只能使用同步操作，异步可能无法完成）
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      const settings = await getSettings();
      if (settings.enableSync && settings.syncOnDeactivate) {
        // 使用 sendBeacon 或 navigator.sendBeacon 进行最后的同步尝试
        // 但 GitHub API 调用可能无法在 beforeunload 中完成
        // 所以主要依赖 visibilitychange 事件
        console.log('页面即将关闭，尝试同步...');
      }
    };

    // 初始化
    setupPeriodicSync();

    // 监听事件
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 清理
    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // 只在组件挂载时设置一次

  return (
    <div className="h-screen flex flex-col">
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
            currentFileId={currentFile?.id} 
            onSelectFile={handleSelectFile}
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
          ) : currentFile ? (
            <MarkdownEditor 
              key={currentFile.id}
              content={content} 
              onChange={handleContentChange}
              currentFile={currentFile}
              isMarkdownCollapsed={!isMarkdownVisible}
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