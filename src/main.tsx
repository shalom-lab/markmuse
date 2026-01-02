import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { initMathJax } from './utils/wechatExport';
import './index.css';

// 预加载 MathJax 以提高导出性能
initMathJax();

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