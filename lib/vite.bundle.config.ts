/**
 * Vite 配置 - 用于构建浏览器 bundle（CLI 使用）
 * 将所有依赖打包成一个文件，可以在浏览器中直接运行
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/bundle.ts'),
      name: 'MarkMuse',
      fileName: 'bundle',
      formats: ['iife'] // 使用 IIFE 格式，直接挂载到 window
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      // 不外部化依赖，全部打包进去（除了 MathJax，它需要在浏览器中通过 CDN 加载）
      external: ['mathjax'],
      output: {
        // IIFE 格式会自动挂载到 window.MarkMuse
        globals: {
          mathjax: 'MathJax'
        },
        // 确保所有依赖都打包进去
        inlineDynamicImports: true
      }
    },
    minify: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src')
    }
  }
});

