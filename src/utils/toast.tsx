import React from 'react';
import { createRoot } from 'react-dom/client';

interface ToastOptions {
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// 简单的 Toast 实现
export const showToast = (message: string, options: ToastOptions = {}) => {
  const { type = 'info', duration = 3000 } = options;

  // 创建容器
  const container = document.createElement('div');
  container.className = 'fixed top-4 right-4 z-[10000]';
  document.body.appendChild(container);

  const root = createRoot(container);

  // Toast 样式
  const typeStyles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  // 渲染 Toast
  root.render(
    <div
      className={`px-4 py-3 rounded-lg shadow-lg border flex items-center gap-2 min-w-[200px] max-w-[400px] animate-in slide-in-from-top-2 ${typeStyles[type]}`}
    >
      <span className="text-lg">{icons[type]}</span>
      <span className="text-sm font-medium flex-1">{message}</span>
    </div>
  );

  // 自动移除
  setTimeout(() => {
    root.unmount();
    document.body.removeChild(container);
  }, duration);
};

