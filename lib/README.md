# markmuse-wechat

将 Markdown 转换为微信公众号格式的 HTML
## 安装

```bash
npm install markmuse-wechat
```

## 快速开始

### Node.js 环境（推荐）

```javascript
import { getWeChatHtml } from 'markmuse-wechat/converter';

// 使用默认样式
const html = await getWeChatHtml('# 标题\n这是内容 $E = mc^2$');

// 使用自定义样式
const html2 = await getWeChatHtml(markdown, customCss);
```

### 浏览器环境

#### ES 模块方式

```javascript
import { convertDefault } from 'markmuse-wechat';

// 确保 MathJax 已加载
// <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>

// 使用默认样式
const html = await convertDefault(markdown);

// 使用自定义样式（会与默认样式合并）
const html2 = await convertDefault(markdown, customCss);
```

#### CDN 方式

```html
<!-- 加载 MathJax -->
<script>
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$']],
      displayMath: [['$$', '$$']]
    },
    svg: {
      fontCache: 'none'
    }
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>

<!-- 加载 MarkMuse（通过 CDN） -->
<script src="https://cdn.jsdelivr.net/npm/markmuse-wechat/dist/bundle.iife.js"></script>

<script>
  // 使用默认样式
  const html = await window.MarkMuse.convertDefault(markdown);
  
  // 使用自定义样式
  const html2 = await window.MarkMuse.convertDefault(markdown, customCss);
</script>
```

## API

### Node.js API

#### `getWeChatHtml(markdown: string, customCss?: string): Promise<string>`

在 Node.js 环境中将 Markdown 转换为微信公众号格式的 HTML。

**示例：**
```javascript
import { getWeChatHtml } from 'markmuse-wechat/converter';

const html = await getWeChatHtml('# 标题\n内容');
```

#### `batchConvert(items: Array<{markdown: string, css?: string}>): Promise<string[]>`

批量转换多个 Markdown 内容。

**示例：**
```javascript
import { batchConvert } from 'markmuse-wechat/converter';

const results = await batchConvert([
  { markdown: '# 文章1' },
  { markdown: '# 文章2', css: customCss }
]);
```

### 浏览器 API

#### `convert(markdown: string, cssText: string): Promise<string>`

将 Markdown 转换为微信公众号格式的 HTML（完全由 CSS 控制样式）。

#### `convertDefault(markdown: string, customCss?: string): Promise<string>`

将 Markdown 转换为微信公众号格式的 HTML（带默认样式，开箱即用）。

## 功能特性

- ✅ 支持 Markdown 语法
- ✅ 支持数学公式（LaTeX，通过 MathJax）
- ✅ 支持代码高亮（highlight.js）
- ✅ 支持自定义 CSS 主题
- ✅ 自动处理微信公众号兼容性
- ✅ CSS 样式自动内联

## 依赖要求

- **Playwright**: Node.js 环境需要（会自动安装）
- **MathJax**: 浏览器环境需要（通过 CDN 加载）

## License

MIT
