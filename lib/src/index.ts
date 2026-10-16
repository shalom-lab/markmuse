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
import { defaultThemeCss } from '../../src/themes';

// 导出时使用短名称（仅 npm 包使用，不影响主项目）
export { convertToWeChatHTMLHeadless as convert };

// 复用网页应用的默认主题，避免 npm 包和网页样式分叉。
const DEFAULT_THEME_CSS = defaultThemeCss;

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

