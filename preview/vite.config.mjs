import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
const here = path => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  root: here('.'),
  build: { lib: { entry: here('index.ts'), name: 'MarkMusePreview', formats: ['es','iife'], fileName: format => format === 'es' ? 'preview.js' : 'preview.iife.js' } }
});


