# MarkMuse

一个功能强大的 Markdown 编辑器，支持自定义主题、文件管理和微信公众号导出。

## ✨ 特性

- 📝 **Markdown 编辑** - 实时预览，支持代码高亮和数学公式
- 📁 **文件管理** - 文件和文件夹的创建、编辑、删除，支持嵌套结构
- 🎨 **主题系统** - 内置多个精美主题，支持自定义 CSS 主题
- 📱 **微信公众号导出** - 一键复制到微信公众号编辑器，完美适配
- 💾 **本地存储** - 使用 IndexedDB 持久化存储，数据安全可靠
- ⌨️ **快捷键支持** - 丰富的快捷键，提升编辑效率

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 预览

```bash
npm run preview
```

## 🛠️ 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Dexie.js** - IndexedDB 封装
- **MarkdownIt** - Markdown 解析
- **Highlight.js** - 代码高亮
- **KaTeX** - 数学公式渲染
- **Tailwind CSS** - 样式框架

## 📖 主要功能

### 文件管理
- 创建、重命名、删除文件和文件夹
- 支持文件夹嵌套
- 自动保存到本地

### Markdown 编辑
- 实时预览
- 代码高亮（支持多种语言）
- 数学公式（行内和块级）
- Emoji 支持
- 快捷命令菜单

### 主题管理
- 内置多个精美主题
- 自定义 CSS 主题
- 主题导入导出
- 默认主题设置

### 导出功能
- 复制到微信公众号（HTML 格式）
- 自动内联样式
- 代码高亮样式保留

## 📝 快捷键

- `Ctrl+B` - 加粗
- `Ctrl+I` - 倾斜
- `Ctrl+U` - 下划线
- `Ctrl+1~6` - 标题（1-6级）
- `Ctrl+K` - 链接
- `/` - 打开快捷命令菜单

更多快捷键请参考应用内的帮助文档。

## 🙏 致谢

本项目参考了以下优秀的开源项目：

- [mdnice/markdown-nice](https://github.com/mdnice/markdown-nice) - 支持主题设计的 Markdown 编辑器，在微信公众号导出功能上提供了重要参考

感谢所有开源贡献者的无私奉献！

## 📄 License

MIT

