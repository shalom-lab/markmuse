/**
 * MarkMuse WeChat 测试脚本
 * 
 * 测试 markmuse-wechat 包的各种功能
 */

import { readFileSync, writeFileSync } from 'fs';
import { getWeChatHtml } from 'markmuse-wechat/converter';

async function test() {
  console.log('🚀 开始测试 markmuse-wechat...\n');

  // 读取测试 Markdown 文件
  const markdown = readFileSync('./test.md', 'utf-8');
  console.log('✅ 已读取 test.md 文件');

  try {
    // 测试 1: 使用默认样式
    console.log('\n📝 测试 1: 使用默认样式转换...');
    const html1 = await getWeChatHtml(markdown);
    writeFileSync('./test-result-default.html', html1);
    console.log('✅ 已生成 test-result-default.html');

    // 测试 2: 使用自定义样式
    console.log('\n📝 测试 2: 使用自定义样式转换...');
    const customCss = `
      #markmuse {
        font-family: "Microsoft YaHei", Arial, sans-serif;
        color: #2c3e50;
        background-color: #f8f9fa;
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }
      
      #markmuse h1 {
        color: #e74c3c;
        border-bottom: 4px solid #e74c3c;
      }
      
      #markmuse h2 {
        color: #3498db;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 0.8rem 1.2rem;
        border-radius: 8px;
        color: white;
      }
      
      #markmuse code {
        background-color: #f1f5f9;
        color: #e83e8c;
        padding: 0.2em 0.4em;
        border-radius: 3px;
      }
      
      #markmuse pre {
        background-color: #2d2d2d;
        border-left: 4px solid #667eea;
      }
    `;
    
    const html2 = await getWeChatHtml(markdown, customCss);
    writeFileSync('./test-result-custom.html', html2);
    console.log('✅ 已生成 test-result-custom.html');

    // 测试 3: 批量转换
    console.log('\n📝 测试 3: 批量转换测试...');
    const { batchConvert } = await import('markmuse-wechat/converter');
    const results = await batchConvert([
      { markdown: '# 文章 1\n这是第一篇文章的内容。' },
      { markdown: '# 文章 2\n这是第二篇文章的内容。' },
      { markdown: '# 文章 3\n这是第三篇文章的内容。' }
    ]);
    console.log(`✅ 批量转换完成，共 ${results.length} 篇文章`);

    // 测试 4: 简单 Markdown
    console.log('\n📝 测试 4: 简单 Markdown 测试...');
    const simpleMd = `# 简单测试

这是一个**简单**的测试文档。

## 数学公式

行内公式：$E = mc^2$

块级公式：
$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$

## 代码

\`\`\`javascript
console.log('Hello, World!');
\`\`\``;
    
    const html3 = await getWeChatHtml(simpleMd);
    writeFileSync('./test-result-simple.html', html3);
    console.log('✅ 已生成 test-result-simple.html');

    console.log('\n✨ 所有测试完成！');
    console.log('\n📂 生成的文件：');
    console.log('  - test-result-default.html (默认样式)');
    console.log('  - test-result-custom.html (自定义样式)');
    console.log('  - test-result-simple.html (简单测试)');
    console.log('\n💡 提示：在浏览器中打开这些 HTML 文件查看效果');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

test();

