import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MarkMuseWeChatHeadless',
      fileName: 'index',
      formats: ['es']
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      // 外部化依赖，不打包进库中
      external: [
        'juice',
        'markdown-it',
        'highlight.js',
        'katex',
        // 这些是运行时依赖，需要在浏览器环境中提供
        'mathjax'
      ],
      output: {
        // 保留文件结构，方便调试
        preserveModules: false
      }
    },
    minify: true
  },
  resolve: {
    // 解析路径，指向 src 目录
    alias: {
      '@': resolve(__dirname, '../src')
    }
  }
});
