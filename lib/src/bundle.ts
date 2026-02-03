/**
 * Bundle 入口文件 - 用于 Node.js 转换器
 * 将函数挂载到 window.MarkMuse，供 Playwright 在浏览器环境中调用
 */

import { convert, convertDefault } from './index';

// 声明全局类型
declare global {
  interface Window {
    MarkMuse: {
      convert: typeof convert;
      convertDefault: typeof convertDefault;
    };
  }
}

// 挂载到 window 对象
window.MarkMuse = {
  convert,
  convertDefault
};

