import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
try {
  const page = await browser.newPage();
  await page.addScriptTag({ path: require.resolve('mathjax/es5/tex-svg.js') });
  await page.waitForFunction(() => typeof window.MathJax?.tex2svg === 'function');
  await page.addScriptTag({ path: fileURLToPath(new URL('./dist/bundle.iife.js', import.meta.url)) });
  const results = await page.evaluate(async () => {
    const markdown = 'Inline $E=mc^2$.\n\n$$\n\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}\n$$';
    document.body.innerHTML = await window.MarkMuse.convertDefault(markdown);
    return Array.from(document.querySelectorAll('#markmuse svg'), svg =>
      Array.from(svg.querySelectorAll('use'), use => {
        const href = use.getAttribute('href') || use.getAttribute('xlink:href');
        const glyph = href?.startsWith('#') && svg.getElementById(href.slice(1));
        return Boolean(glyph?.getAttribute('d') && use.getBBox().width > 0);
      })
    );
  });
  assert.equal(results.length, 2, 'Both inline and display equations must be exported');
  for (const glyphs of results) {
    assert.ok(glyphs.length > 0, 'Exercise MathJax SVG font caching');
    assert.ok(glyphs.every(Boolean), 'Every glyph reference must resolve to a visible path in its own SVG');
  }
  console.log('Inline and display SVG glyphs passed.');
} finally {
  await browser.close();
}
