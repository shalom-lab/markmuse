/**
 * MarkMuse Node.js 转换器
 * 在 Node.js 环境中调用浏览器环境中的转换函数
 * 
 * @example
 * ```javascript
 * import { getWeChatHtml } from 'markmuse-wechat/converter';
 * 
 * const html = await getWeChatHtml('# 标题\n内容');
 * console.log(html);
 * ```
 */

import { chromium, Page } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 声明全局类型（用于 Playwright 页面环境）
declare global {
  interface Window {
    MathJax?: {
      tex2svg: (latex: string, options?: any) => any;
    };
    MarkMuse?: {
      convertDefault: (markdown: string, css?: string) => Promise<string>;
    };
  }
}

// MathJax CDN URL
const MATHJAX_CDN = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';

// Bundle 路径缓存
const BUNDLE_PATH = resolve(__dirname, '../dist/bundle.iife.js');

/**
 * 初始化页面环境（加载 MathJax 和 Bundle）
 * 
 * @param page - Playwright 页面对象
 */
async function setupPageEnvironment(page: Page) {
  // 1. 创建包含 MathJax 的 HTML 页面
  // 配置 MathJax：生成完整的 path，不使用 use 引用
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$']],
        displayMath: [['$$', '$$']]
      },
      svg: {
        fontCache: 'none'  // 关键：生成完整的 path，不使用 use 引用
      }
    };
  </script>
  <script src="${MATHJAX_CDN}"></script>
</head>
<body>
</body>
</html>
`;
  await page.setContent(htmlContent);

  // 2. 等待 MathJax 加载完成
  await page.waitForFunction(
    () => window.MathJax && typeof window.MathJax.tex2svg === 'function',
    { timeout: 30000 }
  );

  // 3. 加载 bundle.js
  await page.addScriptTag({ path: BUNDLE_PATH });

  // 4. 等待 MarkMuse 函数加载完成
  await page.waitForFunction(
    () => window.MarkMuse && typeof window.MarkMuse.convertDefault === 'function',
    { timeout: 10000 }
  );
}

/**
 * 在已初始化的页面中执行转换
 * 
 * @param page - Playwright 页面对象
 * @param markdown - Markdown 内容
 * @param customCss - 自定义 CSS 样式
 * @returns 转换后的 HTML
 */
async function performConversion(page: Page, markdown: string, customCss: string = '') {
  return await page.evaluate(async ({ md, css }) => {
    if (!window.MarkMuse) {
      throw new Error('MarkMuse 未加载');
    }
    return await window.MarkMuse.convertDefault(md, css || '');
  }, { md: markdown, css: customCss });
}

/**
 * 将 Markdown 转换为微信公众号格式的 HTML
 * 
 * 这是一个纯正的 Node.js 函数，内部使用 Playwright 在浏览器环境中执行转换
 * 
 * @param markdown - Markdown 内容
 * @param customCss - 可选的自定义 CSS 样式（会与默认样式合并）
 * @returns 转换后的 HTML 字符串
 * 
 * @example
 * ```javascript
 * // 使用默认样式
 * const html = await getWeChatHtml('# 标题\n这是内容');
 * 
 * // 使用自定义样式
 * const html = await getWeChatHtml(markdown, customCss);
 * ```
 */
export async function getWeChatHtml(markdown: string, customCss: string = ''): Promise<string> {
  if (!markdown || typeof markdown !== 'string') {
    throw new Error('markdown 参数必须是字符串');
  }

  let browser = null;

  try {
    // 1. 启动无头浏览器
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // 2. 初始化页面环境
    await setupPageEnvironment(page);

    // 3. 执行转换
    const html = await performConversion(page, markdown, customCss);

    // 4. 关闭浏览器
    await browser.close();
    browser = null;

    // 5. 返回转换后的 HTML 字符串
    return html;

  } catch (error: any) {
    // 确保浏览器被关闭
    if (browser) {
      await browser.close().catch(() => {});
    }
    throw new Error(`转换失败: ${error.message}`);
  }
}

/**
 * 批量转换多个 Markdown 内容
 * 
 * 优化版本：共享同一个浏览器实例，避免重复启动和关闭浏览器，大幅提升性能
 * 
 * @param items - 要转换的项目数组
 * @returns 转换后的 HTML 数组
 * 
 * @example
 * ```javascript
 * const results = await batchConvert([
 *   { markdown: '# 文章1' },
 *   { markdown: '# 文章2', css: customCss }
 * ]);
 * ```
 */
export async function batchConvert(
  items: Array<{ markdown: string; css?: string }>
): Promise<string[]> {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  let browser = null;

  try {
    // 1. 启动浏览器（只启动一次）
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // 2. 初始化页面环境（只初始化一次）
    await setupPageEnvironment(page);

    // 3. 批量转换（复用同一个页面实例）
    const results: string[] = [];
    for (const item of items) {
      const html = await performConversion(page, item.markdown, item.css || '');
      results.push(html);
    }

    // 4. 关闭浏览器
    await browser.close();
    browser = null;

    return results;

  } catch (error: any) {
    // 确保浏览器被关闭
    if (browser) {
      await browser.close().catch(() => {});
    }
    throw new Error(`批量转换失败: ${error.message}`);
  }
}

