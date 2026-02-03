/**
 * 本地测试脚本 - 验证 Node.js 转换器功能
 * 
 * 测试目标：
 * 1. 验证 getWeChatHtml 函数能否正常工作
 * 2. 验证浏览器自动化链路是否通畅
 * 3. 验证转换结果是否正确
 * 
 * 使用方法：
 * node test-local.js
 */

import { getWeChatHtml } from './dist/converter.js';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 测试用的 Markdown 内容
const testMarkdown = `
# 测试标题

这是一段包含**数学公式**的内容：$E = mc^2$

还有行内公式：$\\alpha + \\beta = \\gamma$

块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 代码块测试

\`\`\`javascript
function hello() {
  console.log("Hello MarkMuse!");
  return "测试成功";
}
\`\`\`

## 列表测试

- 第一项
- 第二项
  - 嵌套项
- 第三项

## 引用测试

> 这是一个引用块
> 可以包含多行内容
> 用于强调重要信息

## 表格测试

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |

## 链接和图片

[MarkMuse 官网](https://example.com)

---

**测试完成！** 如果你能看到这段内容，说明转换成功了。
`;

async function runTest() {
  console.log('🚀 开始 Node.js 转换器测试...');
  console.log('📝 测试内容：包含公式、代码、列表、表格等完整 Markdown 语法\n');

  const start = Date.now();

  try {
    // 执行转换
    console.log('⏳ 正在转换 Markdown...');
    const html = await getWeChatHtml(testMarkdown);

    const duration = Date.now() - start;

    // 创建完整的 HTML 文件（包含样式，方便查看效果）
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MarkMuse 转换测试结果</title>
  <style>
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .info {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .info h3 {
      margin-top: 0;
      color: #1976d2;
    }
    .info code {
      background: rgba(0,0,0,0.1);
      padding: 2px 6px;
      border-radius: 3px;
    }
      /* 确保公式容器和 SVG 可见 */
.block-equation,
.inline-equation {
    color: #333333 !important;
}

.block-equation svg,
.inline-equation svg {
    display: inline-block;
    vertical-align: middle;
    color: inherit;
    fill: currentColor;
    max-width: 100%;
    height: auto;
    min-width: 1px;
    min-height: 1px;
}

/* 确保所有 SVG 元素都有颜色 */
section[data-formula] svg,
span[data-formula] svg {
    fill: currentColor;
    color: inherit;
}
  </style>
</head>
<body>
  <div class="info">
    <h3>✅ 测试成功！</h3>
    <p><strong>转换耗时：</strong><code>${duration}ms</code></p>
    <p><strong>测试时间：</strong><code>${new Date().toLocaleString('zh-CN')}</code></p>
    <p><strong>说明：</strong>如果下方内容显示正常（公式、代码高亮、样式等），说明转换功能正常。</p>
  </div>
  
  ${html}
</body>
</html>`;

    // 将结果写入文件
    const outputPath = resolve(__dirname, 'test-result.html');
    writeFileSync(outputPath, fullHtml, 'utf-8');

    // 输出成功信息
    console.log('✅ 转换成功！');
    console.log(`⏱️  耗时: ${duration}ms`);
    console.log(`📂 结果已保存至: ${outputPath}`);
    console.log('💡 请用浏览器打开该文件，检查以下内容：');
    console.log('   - 数学公式是否正确渲染（SVG 格式）');
    console.log('   - 代码块是否有语法高亮');
    console.log('   - 样式是否美观（标题、列表、表格等）');
    console.log('   - 整体布局是否符合微信公众号格式');
    console.log('\n🎉 如果以上内容都正常，说明 Node.js 转换器测试通过！');

  } catch (error) {
    console.error('\n❌ 测试失败！');
    console.error('错误信息:', error.message);
    console.error('\n可能的原因：');
    console.error('1. 未安装 Playwright 浏览器：运行 npx playwright install chromium');
    console.error('2. 未构建 bundle.js：运行 npm run build');
    console.error('3. 网络问题：MathJax CDN 加载失败');
    console.error('\n详细错误：');
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runTest();

