import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { getWeChatHtml, batchConvert } from './dist/converter.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const options = { channel: process.env.PLAYWRIGHT_CHANNEL || undefined };
const server = await createServer({
  root, configFile: false, logLevel: 'error',
  server: { host: '127.0.0.1', port: 0 },
  plugins: [{
    name: 'test-page',
    configureServer(server) {
      server.middlewares.use('/test-page', (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.end('<!doctype html><title>MarkMuse regression</title>');
      });
    },
  }],
});
try {
  await server.listen();
  const browser = await chromium.launch(options);
  try {
    const page = await browser.newPage();
    await page.goto(server.resolvedUrls.local[0] + 'test-page');
    const result = await page.evaluate(async () => {
      const { createPreviewRenderer } = await import('/src/utils/preview.ts');
      const { sanitizePreview } = await import('/src/utils/sanitizePreview.ts');
      const md = createPreviewRenderer();
      const preview = sanitizePreview(md.render('$$\nx=1\n\n## Next\n\nBody'));
      const clean = sanitizePreview(md.render('<form><button>Click</button></form>\n\n**bold** and $x^2$'));
      return {
        title: preview.querySelector('h2')?.textContent,
        literal: preview.textContent.includes('$$') && preview.textContent.includes('Body'),
        controls: clean.querySelectorAll('form,button').length,
        bold: clean.querySelector('strong')?.textContent,
        math: clean.querySelector('.katex')?.getAttribute('data-latex'),
      };
    });
    assert.deepEqual(result, { title: 'Next', literal: true, controls: 0, bold: 'bold', math: 'x^2' });

    const rename = await page.evaluate(async () => {
      const fs = await import('/src/storage/opfsFs.ts');
      await fs.writeTextFile('src/child/a.md', 'A');
      await fs.writeTextFile('src/b.md', 'B');
      const original = FileSystemFileHandle.prototype.createWritable;
      let writes = 0;
      FileSystemFileHandle.prototype.createWritable = function (...args) {
        if (++writes === 2) throw Error('simulated write failure');
        return original.apply(this, args);
      };
      let failed = false;
      try { await fs.renameEntry('src', 'dest'); }
      catch (error) { failed = error.message === 'simulated write failure'; }
      finally { FileSystemFileHandle.prototype.createWritable = original; }
      const beforeRetry = await fs.listAllEntries();
      const a = await fs.readTextFile('src/child/a.md');
      const b = await fs.readTextFile('src/b.md');
      await fs.renameEntry('src', 'dest');
      return { failed, a, b, partial: beforeRetry.some(e => e.path.startsWith('dest')),
        old: await fs.readTextFile('src/child/a.md'), newA: await fs.readTextFile('dest/child/a.md'),
        newB: await fs.readTextFile('dest/b.md') };
    });
    assert.deepEqual(rename, { failed: true, a: 'A', b: 'B', partial: false, old: null, newA: 'A', newB: 'B' });
  } finally { await browser.close(); }
} finally { await server.close(); }

// Exercise both public Node APIs with every new page offline.
const launch = chromium.launch.bind(chromium);
chromium.launch = async params => {
  const browser = await launch({ ...params, ...options });
  const newPage = browser.newPage.bind(browser);
  browser.newPage = async params => newPage({ ...params, offline: true });
  return browser;
};
try {
  assert.match(await getWeChatHtml('Offline text'), /Offline text/);
  const batch = await batchConvert([{ markdown: '$E=mc^2$' }, { markdown: 'Second document' }]);
  assert.match(batch[0], /<path\b/);
  assert.match(batch[1], /Second document/);
} finally { chromium.launch = launch; }
console.log('Preview, unclosed math, interrupted OPFS rename and offline Node conversion passed.');
