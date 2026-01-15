import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { initMathJax } from './utils/wechatExport';
import { restoreFromBookmark } from './services/settingsStorage';
import './index.css';

// 预加载 MathJax 以提高导出性能
initMathJax();

// 页面加载时自动检查并恢复配置（无感恢复）
window.addEventListener('load', () => {
  // 延迟执行，确保 DOM 已加载
  setTimeout(() => {
    restoreFromBookmark().then((success) => {
      if (success) {
        console.log('✅ 配置已从 URL 书签恢复');
      }
    });
  }, 100);
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  }
], {
  basename: '/markmuse'
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
); 