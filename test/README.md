# MarkMuse WeChat 测试

这个文件夹用于测试 `markmuse-wechat` 包的功能。

## 文件说明

- `test.md` - 包含各种 Markdown 元素的测试文档
- `test.js` - Node.js 环境测试脚本
- `test-browser-cdn.html` - 浏览器 CDN 方式测试页面
- `package.json` - 测试项目配置

## 使用方法

### Node.js 环境测试

#### 1. 安装依赖

```bash
npm install
```

#### 2. 运行测试

```bash
npm test
```

#### 3. 查看结果

测试完成后会生成以下 HTML 文件：

- `test-result-default.html` - 使用默认样式
- `test-result-custom.html` - 使用自定义样式
- `test-result-simple.html` - 简单测试

在浏览器中打开这些文件查看转换效果。

### 浏览器 CDN 方式测试

#### 直接打开测试页面

在浏览器中打开 `test-browser-cdn.html` 文件即可。

#### 功能说明

- ✅ **实时转换**：输入 Markdown，点击"转换"按钮查看效果
- ✅ **加载示例**：一键加载示例 Markdown 内容
- ✅ **复制到微信公众号**：一键复制转换后的 HTML
- ✅ **快捷键支持**：`Ctrl+Enter` 快速转换
- ✅ **状态提示**：显示加载状态和转换结果

#### 特点

- 🌐 **无需安装**：直接通过 CDN 加载，无需 npm install
- 🚀 **即开即用**：打开 HTML 文件即可使用
- 📱 **响应式设计**：支持桌面和移动端
- 🎨 **美观界面**：现代化的 UI 设计

## 测试内容

`test.md` 包含以下 Markdown 元素：

- ✅ 多级标题（H1-H5）
- ✅ 文本格式（粗体、斜体、删除线、行内代码）
- ✅ 行内数学公式（$E = mc^2$）
- ✅ 块级数学公式（多行公式、矩阵）
- ✅ 代码块（JavaScript、Python、TypeScript、CSS）
- ✅ 列表（有序、无序、嵌套）
- ✅ 引用
- ✅ 表格（简单表格、包含公式的表格）
- ✅ 链接
- ✅ 水平线
- ✅ 混合内容（代码+公式+文本）

## 自定义测试

你可以修改 `test.md` 添加更多测试内容，然后运行 `npm test` 查看效果。

