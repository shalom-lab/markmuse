import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'MarkMuseWeChatHeadless',
      fileName: 'index',
      formats: ['es']
    },
    outDir: 'dist',
    // 生成 source map（Vite 5 推荐方式）
    sourcemap: true,
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
    // 不压缩，让用户自己决定
    minify: false
  },
  resolve: {
    // 解析路径，指向 src 目录
    alias: {
      '@': resolve(__dirname, '../src')
    }
  }
});
