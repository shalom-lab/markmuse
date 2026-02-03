/**
 * MarkMuse WeChat Headless Converter
 * 
 * 将 Markdown 转换为微信公众号格式的 HTML
 * 
 * ⚠️ 注意：此包需要在浏览器环境中使用
 * 
 * 推荐使用方式：
 * - Node.js 环境：使用 `markmuse-wechat/converter` 中的 `getWeChatHtml` 函数
 * - 浏览器环境：直接导入并使用 `convert` 或 `convertDefault` 函数
 * 
 * @example
 * ```javascript
 * // 在浏览器环境中使用
 * import { convert, convertDefault } from 'markmuse-wechat';
 * 
 * // 方式 1：完全控制样式
 * const html = await convert(markdown, css);
 * 
 * // 方式 2：使用默认样式（推荐）
 * const html = await convertDefault(markdown);
 * const html2 = await convertDefault(markdown, customCss);  // 自定义样式覆盖默认样式
 * ```
 */

// 直接引用现有代码，不复制
import { convertToWeChatHTMLHeadless } from '../../src/utils/wechatExportHeadless';

// 导出时使用短名称（仅 npm 包使用，不影响主项目）
export { convertToWeChatHTMLHeadless as convert };

// 默认主题样式（用于 npm 包，提供开箱即用的体验）
const DEFAULT_THEME_CSS = `
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  line-height: 1.8;
  color: #333333;
  background-color: #ffffff;
  padding: 0 1rem;
  max-width: 100%;
}

#markmuse h1 {
  font-size: 2em;
  margin: 2rem 0 1.2rem;
  padding: 1rem 0;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
  text-align: center;
  border-bottom: 3px solid #667eea;
  padding-bottom: 1rem;
}

#markmuse h2 {
  font-size: 1.5em;
  margin: 1.8rem 0 1rem;
  padding: 0.8rem 1.2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  line-height: 1.4;
}

#markmuse h3 {
  font-size: 1.25em;
  margin: 1.5rem 0 0.8rem;
  padding: 0.6rem 0 0.6rem 1.2rem;
  border-left: 5px solid #667eea;
  color: #2c3e50;
  font-weight: 600;
  background: linear-gradient(to right, rgba(102, 126, 234, 0.08), transparent);
  line-height: 1.5;
  border-radius: 0 4px 4px 0;
}

#markmuse p {
  margin: 0.8rem 0;
  line-height: 1.9;
  text-align: justify;
  word-spacing: 0.05em;
}

#markmuse code {
  font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  background-color: #f1f5f9;
  border-radius: 3px;
  color: #e83e8c;
}

#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background-color: #2d2d2d;
  border-radius: 8px;
  overflow-x: auto;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  white-space: pre-wrap;
  word-wrap: break-word;
}

#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}

#markmuse pre code {
  background-color: transparent;
  padding: 0;
  font-size: 0.9em;
  color: #e8e8e8;
  font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

#markmuse blockquote {
  margin: 1rem 0;
  padding: 0.8rem 1rem;
  border-left: 4px solid #667eea;
  color: #555;
  background: linear-gradient(to right, rgba(102, 126, 234, 0.05), transparent);
  border-radius: 0 6px 6px 0;
  font-style: italic;
}

#markmuse strong {
  font-weight: 600;
  color: #1f2328;
}

#markmuse em {
  font-style: italic;
  color: #57606a;
}

#markmuse a {
  color: #0969da;
  text-decoration: none;
}

#markmuse a:hover {
  text-decoration: underline;
}

#markmuse ul, #markmuse ol {
  margin: 0.8rem 0;
  padding-left: 1.8rem;
}

#markmuse ul {
  list-style-type: disc;
}

#markmuse ol {
  list-style-type: decimal;
}

#markmuse li {
  margin: 0.4rem 0;
  display: list-item;
  line-height: 1.8;
}

#markmuse hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 2em 0;
}

#markmuse table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

#markmuse th, #markmuse td {
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1rem;
  text-align: left;
}

#markmuse th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-weight: 600;
}

#markmuse tr:last-child td {
  border-bottom: none;
}

#markmuse tr:hover {
  background-color: #f8f9fa;
}

#markmuse img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
`.trim();

/**
 * 带默认样式的转换函数（npm 包专用，提供开箱即用的体验）
 * 
 * @param markdown - Markdown 内容
 * @param customCss - 可选的自定义 CSS，如果提供会与默认样式合并
 * @returns 转换后的 HTML
 * 
 * @example
 * ```javascript
 * // 使用默认样式
 * const html = await convertDefault(markdown);
 * 
 * // 使用自定义样式（会与默认样式合并）
 * const html = await convertDefault(markdown, myCustomCss);
 * ```
 */
export async function convertDefault(
  markdown: string,
  customCss?: string
): Promise<string> {
  // 如果提供了自定义 CSS，与默认样式合并；否则只使用默认样式
  // 自定义 CSS 放在后面，优先级更高，可以覆盖默认样式
  const finalCss = customCss ? DEFAULT_THEME_CSS + '\n' + customCss : DEFAULT_THEME_CSS;
  return convertToWeChatHTMLHeadless(markdown, finalCss);
}

