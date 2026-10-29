import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

// Run after building lib. Exercises the same bundled convertDefault used by
// the Node converter, offline; no mathematics is included in this fixture.
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.addScriptTag({ path: new URL('./dist/bundle.iife.js', import.meta.url).pathname.replace(/^\/(\w:)/, '$1') });
  const markdown = '中文正文包含 `inline_code` 和**粗体文字**，在手机窄屏中应保持正常间距。\n这是同一段中的软换行。';
  async function convert(css = '') {
    return page.evaluate(async ({ markdown, css }) => {
      document.body.innerHTML = await window.MarkMuse.convertDefault(markdown, css);
      const p = document.querySelector('#markmuse p');
      const style = getComputedStyle(p);
      return { align: style.textAlign, spacing: style.wordSpacing,
        code: p.querySelector('code')?.textContent,
        strong: p.querySelector('strong')?.textContent,
        breaks: p.querySelectorAll('br').length };
    }, { markdown, css });
  }
  for (const css of ['', readFileSync(new URL('../themes/clear-blue.css', import.meta.url), 'utf8')]) {
    const result = await convert(css);
    assert.equal(result.align, 'left');
    assert.equal(result.spacing, '0px');
    assert.equal(result.code, 'inline_code');
    assert.equal(result.strong, '粗体文字');
    assert.equal(result.breaks, 1, 'Existing breaks:true behavior must remain');
  }
  const custom = await convert('#markmuse p { text-align: justify; word-spacing: 0.1em; }');
  assert.equal(custom.align, 'justify');
  assert.notEqual(custom.spacing, '0px');
  console.log('Paragraph layout: default, clear-blue, custom override and soft breaks passed.');
} finally {
  await browser.close();
}
