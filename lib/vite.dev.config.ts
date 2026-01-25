import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: __dirname,
  server: {
    port: 5175,
    open: '/test.html'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src')
    }
  }
});

