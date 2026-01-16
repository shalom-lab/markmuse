import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/markmuse/',
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React 相关库分离到单独的 chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 将 Markdown 解析库分离
          'markdown-vendor': ['markdown-it'],
          // 将代码高亮库单独分离（体积较大）
          'highlight-vendor': ['highlight.js'],
          // 将数学公式库分离
          'math-vendor': ['katex'],
          // 将代码编辑器分离
          'editor-vendor': ['@uiw/react-codemirror', '@codemirror/lang-css', '@codemirror/theme-one-dark'],
          // 将数据库相关分离
          'db-vendor': ['dexie', 'dexie-react-hooks'],
        }
      }
    },
    // 提高 chunk 大小警告阈值（因为我们已经手动分割了）
    chunkSizeWarningLimit: 1000
  }
}); 