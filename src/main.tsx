import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { initMathJax } from './utils/wechatExport';
import { needsMigration, migrateFromDexie } from './storage/migrateFromDexie';
import './index.css';

// 预加载 MathJax 以提高导出性能
initMathJax();

// 页面加载时自动检查并执行迁移（如果有需要）
window.addEventListener('load', async () => {
  // 延迟执行，确保 DOM 已加载
  setTimeout(async () => {
    try {
      if (await needsMigration()) {
        console.log('🔄 检测到需要从 Dexie 迁移到 OPFS');
        await migrateFromDexie();
      }
    } catch (error) {
      console.error('迁移检查失败:', error);
    }
  }, 100);
});

const router = createBrowserRouter([
  {
    path: '/*',
    element: <App />
  }
], {
  basename: '/markmuse'
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider 
        router={router}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        } as any}
      />
    </ThemeProvider>
  </React.StrictMode>
); 