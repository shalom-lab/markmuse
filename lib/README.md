# @yourname/markmuse-wechat-headless

将 Markdown 转换为微信公众号格式的 HTML（无头版本）

## ⚠️ 重要提示

**此包需要在浏览器环境中使用**（如 Playwright、Puppeteer），不能直接在 Node.js 中运行。

## 安装

```bash
npm install @yourname/markmuse-wechat-headless
```

## 依赖要求

- **MathJax**: 需要在浏览器环境中加载 MathJax（通过 CDN 或本地文件）
- **浏览器环境**: 需要完整的 DOM API（DOMParser、document 等）

## 使用方法

### 方式 1：在浏览器环境中直接使用

```javascript
// 方式 1a：完全控制样式
import { convert } from '@yourname/markmuse-wechat-headless';

// 确保 MathJax 已加载
// <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>

const markdown = `
# 标题

这是内容 $E = mc^2$

\`\`\`javascript
console.log('hello');
\`\`\`
`;

const css = `
#markmuse {
  font-family: Arial, sans-serif;
  line-height: 1.8;
}
`;

const html = await convert(markdown, css);
console.log(html);
```

```javascript
// 方式 1b：使用默认样式（推荐）
import { convertDefault } from '@yourname/markmuse-wechat-headless';

// 使用默认样式
const html = await convertDefault(markdown);

// 或自定义样式（会覆盖默认样式）
const html2 = await convertDefault(markdown, customCss);
```

### 方式 2：在 Playwright 中使用（推荐）

```javascript
import { chromium } from 'playwright';
import { convertDefault } from '@yourname/markmuse-wechat-headless';
import { readFileSync } from 'fs';

async function convert(markdownPath, cssPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 加载包含 MathJax 的页面
  // 可以是你的应用页面，或者一个简单的 HTML 页面
  await page.goto('http://localhost:5173'); // 或使用 file:// 协议
  
  // 等待 MathJax 加载完成
  await page.waitForFunction(
    () => window.MathJax && typeof window.MathJax.tex2svg === 'function',
    { timeout: 10000 }
  );
  
  // 读取文件
  const markdown = readFileSync(markdownPath, 'utf-8');
  const css = cssPath ? readFileSync(cssPath, 'utf-8') : undefined;
  
  // 在浏览器中执行转换
  const html = await page.evaluate(async (md, cssText) => {
    // 动态导入（需要确保模块已加载）
    const { convertDefault } = await import(
      '@yourname/markmuse-wechat-headless'
    );
    return await convertDefault(md, cssText);
  }, markdown, css);
  
  await browser.close();
  return html;
}

// 使用默认样式
const html = await convert('./input.md');

// 或使用自定义样式
const html2 = await convert('./input.md', './theme.css');
console.log(html);
```

### 方式 3：在 Puppeteer 中使用

```javascript
import puppeteer from 'puppeteer';
import { convertDefault } from '@yourname/markmuse-wechat-headless';

// 类似 Playwright 的使用方式
const browser = await puppeteer.launch();
const page = await browser.newPage();
// ... 后续步骤相同
```

## API

### `convert(markdown: string, cssText: string): Promise<string>`

将 Markdown 转换为微信公众号格式的 HTML（完全由 CSS 控制样式）。

**参数：**
- `markdown` (string): Markdown 文本
- `cssText` (string): CSS 样式文本（必需）

**返回：**
- `Promise<string>`: 转换后的 HTML 字符串

**示例：**
```javascript
const html = await convert('# 标题', 'body { color: #333; }');
```

### `convertDefault(markdown: string, customCss?: string): Promise<string>`

将 Markdown 转换为微信公众号格式的 HTML（带默认样式，开箱即用）。

**参数：**
- `markdown` (string): Markdown 文本
- `customCss` (string, 可选): 自定义 CSS 样式文本（会覆盖默认样式）

**返回：**
- `Promise<string>`: 转换后的 HTML 字符串

**示例：**
```javascript
// 使用默认样式
const html = await convertDefault('# 标题');

// 使用自定义样式（覆盖默认样式）
const html2 = await convertDefault('# 标题', 'body { color: #333; }');
```

## 功能特性

- ✅ 支持 Markdown 语法
- ✅ 支持数学公式（LaTeX）
- ✅ 支持代码高亮（highlight.js）
- ✅ 支持自定义 CSS 主题
- ✅ 自动处理微信公众号兼容性
- ✅ 内联 CSS 样式

## 注意事项

1. **浏览器环境必需**：此包依赖浏览器 API（window、document、DOMParser 等）
2. **MathJax 必需**：需要确保 MathJax 已加载并初始化
3. **异步操作**：所有函数都是异步的，需要使用 `await`

## 开发

```bash
# 构建
npm run build

# 类型检查
npm run type-check
```

## License

MIT

