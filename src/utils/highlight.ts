import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
// 导入 Prism R 语言支持（这会注册 Prism.languages.r 到全局）
import './prismr';
import rPrismCss from '../themes/r-prism.css';

// 声明 Prism 全局类型
declare global {
  interface Window {
    Prism?: any;
  }
  var Prism: any;
}

// 获取 Prism 实例
function getPrism() {
  // 优先从 window 获取
  if (typeof window !== 'undefined' && (window as any).Prism) {
    return (window as any).Prism;
  }
  // 尝试从全局获取（Node.js 环境）
  if (typeof globalThis !== 'undefined' && (globalThis as any).Prism) {
    return (globalThis as any).Prism;
  }
  // 尝试直接访问全局 Prism（prismr.ts 会注册到全局）
  try {
    // @ts-ignore - prismr.ts 会在全局注册 Prism
    if (typeof Prism !== 'undefined') {
      // @ts-ignore
      return Prism;
    }
  } catch {
    // 忽略错误
  }
  return null;
}

/**
 * 使用 Prism 高亮 R 语言代码
 */
function highlightWithPrism(code: string): string {
  const Prism = getPrism();
  if (!Prism || !Prism.languages || !Prism.languages.r) {
    // 如果 Prism 不可用，返回原代码（用于后续判断）
    return code;
  }
  
  try {
    const highlighted = Prism.highlight(code, Prism.languages.r, 'r');
    // 返回与 highlight.js 兼容的格式，但使用 language-r class 以便 Prism 样式生效
    // 同时保留 hljs class 以兼容现有样式
    return '<pre class="hljs"><code class="language-r">' + highlighted + '</code></pre>';
  } catch (__) {
    // 如果高亮失败，返回原代码
    return code;
  }
}

/**
 * 创建 markdown-it 的 highlight 函数
 * 用于代码高亮处理
 * R 语言使用 Prism，其他语言使用 highlight.js
 */
export function createHighlightFunction(md?: MarkdownIt) {
  return function (str: string, lang: string): string {
    // 检测 R 语言（支持 'r' 和 'R'）
    const normalizedLang = lang ? lang.toLowerCase() : '';
    if (normalizedLang === 'r') {
      const highlighted = highlightWithPrism(str);
      // 如果 Prism 高亮成功，返回结果；否则继续使用 highlight.js 或转义
      if (highlighted !== str) {
        return highlighted;
      }
      // 如果 Prism 失败，fallback 到转义
    }
    
    // 其他语言使用 highlight.js
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {
        // 如果高亮失败，返回转义的代码
      }
    }
    // 使用传入的 md 实例，如果没有则创建临时实例用于转义
    const mdInstance = md || new MarkdownIt();
    return '<pre class="hljs"><code>' + mdInstance.utils.escapeHtml(str) + '</code></pre>';
  };
}

/**
 * 获取 highlight.js 的默认样式
 * 当无法从 document.styleSheets 获取样式时使用
 * 再额外拼上 R 语言 Prism token 样式（从 r-prism.css 统一维护）
 */
export function getDefaultHighlightStyles(): string {
  const baseHljsCss = `
.hljs {
  display: block;
  overflow-x: auto;
  padding: 0.5em;
  background: #1e1e1e;
  color: #d4d4d4;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.hljs-comment, .hljs-quote { color: #6a9955; }
.hljs-variable, .hljs-template-variable, .hljs-tag, .hljs-name, .hljs-selector-id, .hljs-selector-class, .hljs-regexp, .hljs-deletion { color: #f48771; }
.hljs-number, .hljs-built_in, .hljs-builtin-name, .hljs-literal, .hljs-type, .hljs-params, .hljs-meta, .hljs-link { color: #b5cea8; }
.hljs-attribute { color: #9cdcfe; }
.hljs-string, .hljs-symbol, .hljs-bullet, .hljs-addition { color: #ce9178; }
.hljs-title, .hljs-section { color: #dcdcaa; }
.hljs-keyword, .hljs-selector-tag { color: #569cd6; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: bold; }
`.trim();

  // 拼上统一维护的 R 语言 Prism 样式
  return baseHljsCss + '\n' + rPrismCss;
}

