// 主题配置
import type { Theme } from '../types/type';

export const themes: Theme[] = [
  {
    id: 'default',
    name: '默认',
    css: `/* 默认 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  line-height: 1.8;
  color: #2c2c2c;
  background-color: #ffffff;
  padding: 0 1rem;
  max-width: 100%;
}

/* 荧光笔：预览用渐变；微信常丢掉 linear-gradient，浅实心底作兜底 */
#markmuse h1 {
  display: table;
  font-size: 1.65em;
  margin: 2rem auto 1.2rem;
  padding: 0.2rem 0.12rem 0.4rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.35;
  text-align: center;
  letter-spacing: 0.05em;
  border: none;
  background-color: rgba(31, 61, 77, 0.1);
  background-image: linear-gradient(180deg, transparent 65%, rgba(31, 61, 77, 0.28) 65%);
}

/* 二级 · 居中实心胶囊 */
#markmuse h2 {
  display: table;
  font-size: 1.1em;
  margin: 1.8rem auto 1rem;
  padding: 0.38rem 1.25rem;
  color: #ffffff;
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: 0.08em;
  background: #1f3d4d;
  border: none;
  border-radius: 4px;
  text-align: center;
}

/* 三级 · 斜切微标 */
#markmuse h3 {
  display: table;
  font-size: 1.02em;
  margin: 1.3rem 0 0.5rem;
  padding: 0.2rem 0.85rem;
  color: #ffffff;
  font-weight: 600;
  line-height: 1.45;
  text-align: left;
  border: none;
  background: #5a8a9a;
  border-radius: 10px 2px 10px 2px;
}

#markmuse p {
  margin: 0.8rem 0;
  line-height: 1.9;
  text-align: justify;
  word-spacing: 0.05em;
}

#markmuse code {
  font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  background-color: #f1f5f9;
  border-radius: 3px;
  color: #e83e8c;
}

#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background-color: #2d2d2d;
  border-radius: 8px;
  overflow-x: auto;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  white-space: pre-wrap;
  word-wrap: break-word;
}

#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}

#markmuse pre code {
  display: block;
  border: none;
  background-color: transparent;
  padding: 0;
  font-size: 0.9em;
  color: #e8e8e8;
  font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 引用 · 经典左边框 */
#markmuse blockquote {
  margin: 1.1rem 0;
  padding: 0.7rem 1rem;
  border-left: 3px solid #1f3d4d;
  color: #4a4a4a;
  background: #f8fafc;
  border-radius: 0 4px 4px 0;
  font-style: normal;
}

#markmuse strong {
  font-weight: 600;
  color: #1f2328;
}

#markmuse em {
  font-style: italic;
  color: #57606a;
}

#markmuse a {
  color: #2b6a7a;
  text-decoration: none;
  border-bottom: 1px solid rgba(43, 106, 122, 0.35);
}

#markmuse a:hover {
  border-bottom-color: #2b6a7a;
}

#markmuse pre a,
#markmuse pre span {
  text-decoration: none;
  border-bottom: none;
}

#markmuse ul, #markmuse ol {
  margin: 0.8rem 0;
  padding-left: 1.8rem;
}

#markmuse ul {
  list-style-type: disc;
}

#markmuse ol {
  list-style-type: decimal;
}

#markmuse li {
  margin: 0.4rem 0;
  display: list-item;
  line-height: 1.8;
}

#markmuse hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 2em 0;
}

#markmuse table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

#markmuse th, #markmuse td {
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1rem;
  text-align: left;
}

#markmuse th {
  background: #eef3f4;
  color: #1f3d4d;
  font-weight: 600;
}

#markmuse tr:last-child td {
  border-bottom: none;
}

#markmuse tr:hover {
  background-color: #f8f9fa;
}

#markmuse img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}`
  },
  {
    id: 'warm',
    name: '温暖',
    css: `/* 温暖 */
#markmuse {
  font-family: "Georgia", "Times New Roman", serif;
  line-height: 1.8;
  color: #3d2817;
  background-color: #fef9f3;
}

/* 一级 · 居中底边 */
#markmuse h1 {
  font-size: 1.75em;
  margin: 2rem 0 1.2rem;
  padding: 0 0 0.8rem;
  font-weight: 700;
  color: #8b4513;
  line-height: 1.3;
  text-align: center;
  letter-spacing: 0.05em;
  border: none;
  border-bottom: 3px solid #d4a574;
  background: none;
}

/* 二级 · 斜切圆角微标 */
#markmuse h2 {
  display: table;
  font-size: 1.1em;
  margin: 1.8rem auto 1rem;
  padding: 0.38rem 1.3rem;
  background: #cd853f;
  color: #ffffff;
  font-weight: 600;
  border: none;
  border-radius: 12px 2px 12px 2px;
  line-height: 1.45;
  letter-spacing: 0.08em;
  text-align: center;
}

/* 三级 · 小胶囊 */
#markmuse h3 {
  display: table;
  font-size: 1.02em;
  margin: 1.35rem 0 0.55rem;
  padding: 0.22rem 0.9rem;
  border: none;
  color: #ffffff;
  font-weight: 600;
  line-height: 1.45;
  text-align: left;
  background: #dba66a;
  border-radius: 4px;
}

#markmuse p {
  margin: 1rem 0;
  line-height: 1.9;
}

#markmuse code {
  font-family: "Courier New", Courier, monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  background-color: #fff8dc;
  border-radius: 3px;
  color: #b8860b;
  border: 1px solid #deb887;
}

#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background-color: #3d3428;
  border-radius: 6px;
  overflow-x: auto;
  position: relative;
  white-space: pre-wrap;
  word-wrap: break-word;
}

#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}

#markmuse pre code {
  display: block;
  border: none;
  background-color: transparent;
  padding: 0;
  font-size: 0.9em;
  color: #f4e4c1;
  font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 引用 · 宣纸信笺 */
#markmuse blockquote {
  margin: 1.2rem 0;
  padding: 0.8rem 1.1rem;
  border: 1px dashed rgba(139, 69, 19, 0.28);
  background: #fffdfa;
  color: #4a3e36;
  border-radius: 6px;
  font-style: normal;
}

#markmuse strong {
  font-weight: 700;
  color: #8b4513;
}

#markmuse em {
  font-style: italic;
  color: #a0522d;
}

#markmuse a {
  color: #b8860b;
  text-decoration: none;
}

#markmuse a:hover {
  text-decoration: underline;
  color: #daa520;
}

#markmuse ul, #markmuse ol {
  margin: 1em 0;
  padding-left: 2em;
}

#markmuse ul {
  list-style-type: disc;
}

#markmuse ol {
  list-style-type: decimal;
}

#markmuse li {
  margin: 0.5em 0;
  display: list-item;
}

#markmuse hr {
  border: none;
  border-top: 2px solid #deb887;
  margin: 2em 0;
}

#markmuse table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

#markmuse th, #markmuse td {
  border: 1px solid #deb887;
  padding: 8px 12px;
  text-align: left;
}

#markmuse th {
  background-color: #fff8dc;
  font-weight: 600;
}

#markmuse img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}`
  },
  {
    id: 'minimal',
    name: '极简',
    css: `/* 极简 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  line-height: 1.8;
  color: #2c3e50;
  background-color: #ffffff;
  max-width: 800px;
  margin: 0 auto;
}

#markmuse h1 {
  font-size: 2.4em;
  margin: 2.5rem 0 1.5rem;
  font-weight: 300;
  color: #2c3e50;
  letter-spacing: -0.02em;
  line-height: 1.2;
  text-align: center;
  padding: 0 0 1.2rem;
  border: none;
  border-bottom: 1px solid #ecf0f1;
  background: none;
}

/* 二级 · 横幅微渐变 */
#markmuse h2 {
  font-size: 1.2em;
  margin: 2.2rem 0 0.9rem;
  font-weight: 400;
  color: #34495e;
  letter-spacing: -0.01em;
  line-height: 1.3;
  padding: 0.35rem 0.8rem;
  background-color: #f4f6f7;
  background-image: linear-gradient(90deg, rgba(52, 73, 94, 0.12) 0%, rgba(52, 73, 94, 0.02) 100%);
  border: none;
  border-left: 4px solid #34495e;
  border-radius: 0 4px 4px 0;
  text-align: left;
}

/* 三级 · 荧光笔 */
#markmuse h3 {
  display: table;
  font-size: 1.08em;
  margin: 1.6rem 0 0.7rem;
  font-weight: 500;
  color: #7f8c8d;
  line-height: 1.4;
  padding: 0.08rem 0.12rem 0.26rem;
  border: none;
  text-align: left;
  background-color: rgba(52, 73, 94, 0.05);
  background-image: linear-gradient(180deg, transparent 68%, rgba(52, 73, 94, 0.1) 68%);
}

#markmuse p {
  margin: 1.2rem 0;
  line-height: 1.9;
}

#markmuse code {
  font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  font-size: 0.85em;
  padding: 0.15em 0.3em;
  background-color: #f5f5f5;
  border-radius: 2px;
  color: #e74c3c;
}

#markmuse pre {
  margin: 1.5rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background-color: #2c2c2c;
  border-radius: 6px;
  overflow-x: auto;
  position: relative;
  white-space: pre-wrap;
  word-wrap: break-word;
}

#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}

#markmuse pre code {
  display: block;
  background-color: transparent;
  padding: 0;
  font-size: 0.85em;
  color: #e0e0e0;
  font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

#markmuse blockquote {
  margin: 1.2rem 0;
  padding: 0.85rem 1.1rem;
  border: none;
  background: rgba(52, 73, 94, 0.07);
  color: #2d3748;
  border-radius: 6px;
  font-style: normal;
}

#markmuse strong {
  font-weight: 500;
  color: #2c3e50;
}

#markmuse em {
  font-style: italic;
  color: #7f8c8d;
}

#markmuse a {
  color: #3498db;
  text-decoration: none;
  border-bottom: 1px solid #3498db;
}

#markmuse a:hover {
  border-bottom: 2px solid #3498db;
}

#markmuse ul, #markmuse ol {
  margin: 1.2rem 0;
  padding-left: 2em;
}

#markmuse ul {
  list-style-type: disc;
}

#markmuse ol {
  list-style-type: decimal;
}

#markmuse li {
  margin: 0.6em 0;
  display: list-item;
}

#markmuse hr {
  border: none;
  border-top: 1px solid #ecf0f1;
  margin: 3rem 0;
}

#markmuse table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5rem 0;
}

#markmuse th, #markmuse td {
  border: none;
  border-bottom: 1px solid #ecf0f1;
  padding: 10px 15px;
  text-align: left;
}

#markmuse th {
  background-color: transparent;
  font-weight: 500;
}

#markmuse img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}`
  },
  {
    id: 'mdnice',
    name: '前端',
    css: `/* 前端 */
#markmuse {
  line-height: 1.6;
  letter-spacing: .034em;
  color: rgb(63, 63, 63);
  font-size: 16px;
  word-break: break-all;
}

#markmuse p {
  padding-top: 5px;
  color: rgb(74, 74, 74);
  line-height: 1.75em;
}

/* 一级标题 */
#markmuse h1 {
  text-align: center;
  background-image: url(https://s2.loli.net/2022/01/14/X3gJHmQsAeStUFW.png);
  background-position: center top;
  background-repeat: no-repeat;
  background-size: 95px;
  line-height: 95px;
  margin-top: 38px;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: bold;
  color: rgb(60, 112, 198);
}


/* 二级 · 居中实心胶囊 */
#markmuse h2 {
  display: table;
  font-size: 1.1em;
  margin: 1.8rem auto 1rem;
  padding: 0.38rem 1.25rem;
  color: #ffffff;
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: 0.08em;
  background: #3c70c6;
  border: none;
  border-radius: 4px;
  text-align: center;
}


/* 三级 · 横幅微渐变 */
#markmuse h3 {
  display: table;
  font-size: 15px;
  font-weight: bold;
  color: #7a9fd4;
  margin: 1.2rem 0 0.6rem;
  padding: 0.22rem 0.7rem;
  border: none;
  border-left: 3px solid #7a9fd4;
  border-radius: 0 4px 4px 0;
  text-align: left;
  background-color: #eef3fb;
  background-image: linear-gradient(90deg, rgba(60, 112, 198, 0.16) 0%, rgba(60, 112, 198, 0.02) 100%);
}

/* 列表内容 */
#markmuse ul, #markmuse ol {
  margin: 1em 0;
  padding-left: 2em;
  list-style-type: decimal;
}

#markmuse li {
  margin: 0.5em 0;
  line-height: 1.75em;
  list-style-type: disc;
}

/* 引用 */
#markmuse blockquote {
  padding: 15px 20px;
  line-height: 27px;
  background-color: rgb(239, 239, 239);
  border-left: 4px solid rgb(60, 112, 198);
  display: block;
  margin: 1em 0;
  border-radius: 0 4px 4px 0;
}

/* 引用文字 */
#markmuse blockquote p {
  padding: 0px;
  font-size: 15px;
  color: rgb(89, 89, 89);
  margin: 0;
}

/* 链接 */
#markmuse a {
  color: rgb(60, 112, 198);
  text-decoration: none;
  border-bottom: 1px solid rgb(60, 112, 198);
}

#markmuse a:hover {
  border-bottom: 2px solid rgb(60, 112, 198);
}

/* 加粗 */
#markmuse strong {
  line-height: 1.75em;
  color: rgb(74, 74, 74);
  font-weight: bold;
}

/* 斜体 */
#markmuse em {
  font-style: italic;
}

/* 加粗斜体 */
#markmuse em strong {
  color: rgb(248, 57, 41);
  letter-spacing: 0.3em;
}

/* 删除线 */
#markmuse del {
  text-decoration: line-through;
  color: #999;
}

/* 分割线 */
#markmuse hr {
  height: 1px;
  padding: 0;
  border: none;
  text-align: center;
  background-image: linear-gradient(to right, rgba(60, 122, 198, 0), rgba(60, 122, 198, 0.75), rgba(60, 122, 198, 0));
  margin: 2em 0;
}

/* 图片 */
#markmuse img {
  border-radius: 4px;
  margin-bottom: 25px;
  max-width: 100%;
  height: auto;
}

/* 图片描述文字 */
#markmuse figcaption {
  display: block;
  font-size: 12px;
  font-family: PingFangSC-Light, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #999;
  text-align: center;
  margin-top: -20px;
  margin-bottom: 25px;
}

/* 行内代码 */
#markmuse p code, #markmuse li code {
  color: rgb(60, 112, 198);
  background-color: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  font-size: 0.9em;
}

/* 代码块 */
#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background-color: #2f3539;
  border-radius: 6px;
  overflow-x: auto;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  white-space: pre-wrap;
  word-wrap: break-word;
}

#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}

#markmuse pre code {
  background-color: transparent;
  padding: 0;
  color: #e8e8e8;
  font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  font-size: 0.9em;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 表格 */
#markmuse table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

#markmuse table tr th,
#markmuse table tr td {
  font-size: 14px;
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  text-align: left;
}

#markmuse table tr th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: rgb(60, 112, 198);
}

#markmuse table tr:nth-child(even) {
  background-color: #f9f9f9;
}

#markmuse table tr:hover {
  background-color: #f0f8ff;
}

/* 脚注 */
#markmuse .footnotes {
  padding-top: 8px;
  margin-top: 2em;
  border-top: 1px solid #e2e8f0;
}

#markmuse .footnote-word {
  color: rgb(60, 112, 198);
}

#markmuse .footnote-ref {
  color: rgb(60, 112, 198);
  text-decoration: none;
}

#markmuse .footnote-item em {
  color: rgb(60, 112, 198);
  font-size: 13px;
  font-style: normal;
  border-bottom: 1px dashed rgb(60, 112, 198);
}

#markmuse .footnote-num {
  color: rgb(60, 112, 198);
}

#markmuse .footnote-item p {
  color: rgb(60, 112, 198);
  font-weight: bold;
  margin: 0.5em 0;
}

#markmuse .footnote-item a {
  color: rgb(60, 112, 198);
  text-decoration: none;
}

#markmuse .footnote-item p em {
  font-size: 14px;
  font-weight: normal;
  border-bottom: 1px dashed rgb(60, 112, 198);
}

/* 数学公式 */
#markmuse .block-equation svg {
  max-width: 100%;
  margin: 1em 0;
}

#markmuse .inline-equation svg {
  display: inline-block;
  vertical-align: middle;
}`
  },
  {
    id: 'qing',
    name: '青瓷',
    css: `/* 青瓷 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  line-height: 1.85;
  color: #2d3a35;
  background-color: #f7faf8;
  padding: 0 1rem;
}
#markmuse h1 {
  font-size: 1.7em;
  margin: 1.8rem 0 1.1rem;
  padding: 0.2rem 0 0.75rem;
  font-weight: 700;
  color: #1e3d34;
  text-align: center;
  letter-spacing: 0.12em;
  border: none;
  border-bottom: 3px double #7da89a;
  background: none;
}
/* 二级 · 双线开片框 */
#markmuse h2 {
  display: table;
  font-size: 1.1em;
  margin: 1.65rem auto 1rem;
  padding: 0.42rem 1.45rem;
  color: #1e3d34;
  font-weight: 600;
  background: #f7faf8;
  border: 2px double #3d7a6a;
  border-radius: 0;
  letter-spacing: 0.1em;
  text-align: center;
}
/* 三级 · 斜切微标 */
#markmuse h3 {
  display: table;
  font-size: 1.02em;
  margin: 1.3rem 0 0.5rem;
  color: #ffffff;
  font-weight: 600;
  text-align: left;
  padding: 0.2rem 0.85rem;
  border: none;
  background: #6a9d8e;
  border-radius: 10px 2px 10px 2px;
}
#markmuse p { margin: 0.85rem 0; line-height: 1.9; }
#markmuse code {
  font-family: "SF Mono", Consolas, Menlo, monospace;
  font-size: 0.88em;
  padding: 0.15em 0.4em;
  background: #e7f0ec;
  color: #2a5c4e;
  border-radius: 3px;
  border: 1px solid #c5d9d0;
}
#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background: #24332e;
  border-radius: 6px;
  overflow-x: auto;
  position: relative;
  white-space: pre-wrap;
  word-wrap: break-word;
}
#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}
#markmuse pre code {
  display: block;
  background: transparent;
  padding: 0;
  color: #e4eee8;
  border: none;
}
#markmuse pre a, #markmuse pre span { text-decoration: none; border-bottom: none; }
#markmuse blockquote {
  margin: 1.2rem 0;
  padding: 0.8rem 1.1rem;
  border: 1px dashed rgba(61, 122, 106, 0.3);
  background: #fffdfa;
  color: #3a4d46;
  border-radius: 6px;
  font-style: normal;
}
#markmuse a { color: #2a5c4e; text-decoration: none; border-bottom: 1px solid #7da89a; }
#markmuse strong { color: #1e3d34; }
#markmuse em { color: #3d7a6a; }
#markmuse ul, #markmuse ol { margin: 0.8rem 0; padding-left: 1.7rem; }
#markmuse li { margin: 0.35rem 0; display: list-item; }
#markmuse hr { border: none; border-top: 1px dashed #7da89a; margin: 2em 0; }
#markmuse table { border-collapse: collapse; width: 100%; margin: 1rem 0; border: 1px solid #c5d9d0; }
#markmuse th, #markmuse td { border: 1px solid #c5d9d0; padding: 0.5rem 0.8rem; }
#markmuse th { background: #e7f0ec; color: #1e3d34; }
#markmuse img { max-width: 100%; height: auto; border-radius: 6px; }
`
  },
  {
    id: 'ink',
    name: '墨韵',
    css: `/* 墨韵 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  line-height: 1.9;
  color: #1c1917;
  background-color: #f6f4ef;
  padding: 0 1.1rem;
}
#markmuse h1 {
  font-size: 1.7em;
  margin: 2rem 0 1.15rem;
  padding-bottom: 0.8rem;
  font-weight: 700;
  color: #161412;
  text-align: center;
  letter-spacing: 0.16em;
  border: none;
  border-bottom: 1px solid #d7d0c4;
  background: none;
}
/* 二级 · 荧光笔（居中） */
#markmuse h2 {
  display: table;
  font-size: 1.12em;
  margin: 1.7rem auto 1rem;
  padding: 0.08rem 0.12rem 0.28rem;
  color: #b8483a;
  font-weight: 700;
  letter-spacing: 0.08em;
  border: none;
  text-align: center;
  background-color: rgba(184, 72, 58, 0.1);
  background-image: linear-gradient(180deg, transparent 65%, rgba(184, 72, 58, 0.22) 65%);
}
/* 三级 · 横幅微渐变 */
#markmuse h3 {
  display: table;
  font-size: 1.05em;
  margin: 1.3rem 0 0.5rem;
  padding: 0.22rem 0.7rem;
  color: #c46b60;
  font-weight: 700;
  letter-spacing: 0.06em;
  border: none;
  border-left: 3px solid #c46b60;
  border-radius: 0 4px 4px 0;
  text-align: left;
  background-color: #efe8dc;
  background-image: linear-gradient(90deg, rgba(184, 72, 58, 0.1) 0%, rgba(184, 72, 58, 0.02) 100%);
}
#markmuse p { margin: 0.9rem 0; text-align: justify; }
#markmuse code {
  font-family: "SF Mono", Consolas, Menlo, monospace;
  font-size: 0.86em;
  padding: 0.12em 0.35em;
  background: #efe8dc;
  color: #8a3b32;
  border-radius: 2px;
}
#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background: #2a2623;
  border-radius: 6px;
  overflow-x: auto;
  position: relative;
  white-space: pre-wrap;
  word-wrap: break-word;
}
#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}
#markmuse pre, #markmuse pre code { font-family: "SF Mono", Consolas, Menlo, monospace; }
#markmuse pre code { display: block; background: transparent; padding: 0; color: #ede6da; border: none; }
#markmuse pre a, #markmuse pre span { text-decoration: none; border-bottom: none; }
#markmuse blockquote {
  margin: 1.1rem 0;
  padding: 0.7rem 1rem;
  border-left: 3px solid #b8483a;
  color: #4a433c;
  background: #efe8dc;
  border-radius: 0 4px 4px 0;
  font-style: italic;
}
#markmuse a { color: #b8483a; text-decoration: none; border-bottom: 1px solid #d7b0aa; }
#markmuse strong { color: #161412; }
#markmuse em { color: #5a3d38; }
#markmuse ul, #markmuse ol { margin: 0.8rem 0; padding-left: 1.6rem; }
#markmuse li { margin: 0.35rem 0; display: list-item; }
#markmuse hr { border: none; border-top: 1px solid #d7d0c4; margin: 2.2em 0; }
#markmuse table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
#markmuse th, #markmuse td { border: none; border-bottom: 1px solid #d7d0c4; padding: 0.5rem 0.2rem; }
#markmuse th { background: transparent; border-bottom: 2px solid #b8483a; }
#markmuse img { max-width: 100%; height: auto; }
`
  },
  {
    id: 'sand',
    name: '沙色',
    css: `/* 沙色 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  line-height: 1.85;
  color: #3b3228;
  background-color: #faf6f0;
  padding: 0 1rem;
}
#markmuse h1 {
  display: table;
  font-size: 1.65em;
  margin: 1.8rem auto 1.1rem;
  padding: 0.2rem 0.12rem 0.4rem;
  color: #5c3d24;
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.08em;
  border: none;
  background-color: rgba(196, 122, 58, 0.12);
  background-image: linear-gradient(180deg, transparent 65%, rgba(196, 122, 58, 0.3) 65%);
}
/* 二级 · 斜切圆角微标 */
#markmuse h2 {
  display: table;
  font-size: 1.1em;
  margin: 1.65rem auto 1rem;
  padding: 0.38rem 1.3rem;
  color: #fffaf4;
  font-weight: 600;
  letter-spacing: 0.08em;
  background: #c47a3a;
  border-radius: 12px 2px 12px 2px;
  border: none;
  text-align: center;
}
/* 三级 · 短下划线 */
#markmuse h3 {
  display: table;
  font-size: 1.02em;
  margin: 1.25rem 0 0.5rem;
  color: #8a5a32;
  font-weight: 600;
  text-align: left;
  padding: 0 0.1rem 0.26rem;
  border: none;
  border-bottom: 2px solid #d49a62;
  background: none;
}
#markmuse p { margin: 0.85rem 0; }
#markmuse code {
  font-family: "SF Mono", Consolas, Menlo, monospace;
  font-size: 0.88em;
  padding: 0.15em 0.4em;
  background: #f3e6d4;
  color: #8a4b1f;
  border-radius: 2px;
  border: 1px solid #e2d3c0;
}
#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background: #3d3428;
  border-radius: 4px;
  overflow-x: auto;
  position: relative;
  white-space: pre-wrap;
  word-wrap: break-word;
}
#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}
#markmuse pre.hljs {
  background: #3d3428;
}
#markmuse pre code.hljs {
  background: transparent;
  padding: 0;
}
#markmuse pre code { display: block; background: transparent; padding: 0; color: #f4e4c1; border: none; }
#markmuse pre a, #markmuse pre span { text-decoration: none; border-bottom: none; }
#markmuse blockquote {
  margin: 1.1rem 0;
  padding: 0.65rem 1rem;
  border-top: 1px solid #e2d3c0;
  border-bottom: 1px solid #e2d3c0;
  border-left: 3px solid #c47a3a;
  border-right: none;
  background: #f3e6d4;
  color: #5c4a38;
  border-radius: 0;
  font-style: normal;
}
#markmuse a { color: #a65b24; text-decoration: none; border-bottom: 1px solid #d9b48c; }
#markmuse strong { color: #5c3d24; }
#markmuse em { color: #8a5a32; }
#markmuse ul, #markmuse ol { margin: 0.8rem 0; padding-left: 1.7rem; }
#markmuse li { margin: 0.35rem 0; display: list-item; }
#markmuse hr { border: none; border-top: 2px solid #d9b48c; margin: 2em 0; }
#markmuse table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
#markmuse th, #markmuse td { border: 1px solid #e2d3c0; padding: 0.5rem 0.8rem; }
#markmuse th { background: #f3e6d4; color: #5c3d24; }
#markmuse img { max-width: 100%; height: auto; border-radius: 4px; }
`
  },
  {
    id: 'bamboo',
    name: '竹青',
    css: `/* 竹青 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  line-height: 1.85;
  color: #243028;
  background-color: #f4f7f2;
  padding: 0 1rem;
}
#markmuse h1 {
  font-size: 1.65em;
  margin: 1.8rem 0 1.1rem;
  padding: 0.55rem 0;
  color: #1c3324;
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.14em;
  border-top: 1px solid #5b7f5b;
  border-bottom: 1px solid #5b7f5b;
  background: none;
}
/* 二级 · 竹简左右线 */
#markmuse h2 {
  display: table;
  font-size: 1.12em;
  margin: 1.6rem auto 1rem;
  padding: 0.38rem 1.55rem;
  color: #1c3324;
  font-weight: 600;
  letter-spacing: 0.1em;
  border-left: 3px solid #5b7f5b;
  border-right: 3px solid #5b7f5b;
  background: #e8f0e4;
  border-radius: 0;
  text-align: center;
}
/* 三级 · 斜切微标 */
#markmuse h3 {
  display: table;
  font-size: 1.02em;
  margin: 1.25rem 0 0.5rem;
  color: #ffffff;
  font-weight: 600;
  background: #7a9d7a;
  text-align: left;
  padding: 0.2rem 0.85rem;
  border: none;
  border-radius: 10px 2px 10px 2px;
}
#markmuse p { margin: 0.85rem 0; }
#markmuse code {
  font-family: "SF Mono", Consolas, Menlo, monospace;
  font-size: 0.88em;
  padding: 0.15em 0.4em;
  background: #e4eee0;
  color: #2d4a36;
  border-radius: 3px;
}
#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background: #243028;
  border-radius: 6px;
  overflow-x: auto;
  position: relative;
  white-space: pre-wrap;
  word-wrap: break-word;
}
#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}
#markmuse pre code { display: block; background: transparent; padding: 0; color: #e6efe4; border: none; }
#markmuse pre a, #markmuse pre span { text-decoration: none; border-bottom: none; }
#markmuse blockquote {
  margin: 1.2rem 0;
  padding: 0.8rem 1.1rem;
  border: 1px dashed rgba(91, 127, 91, 0.32);
  background: #fffdfa;
  color: #3a4d3e;
  border-radius: 6px;
  font-style: normal;
}
#markmuse a { color: #3d6b45; text-decoration: none; border-bottom: 1px solid #a3bfa3; }
#markmuse strong { color: #1c3324; }
#markmuse em { color: #4a6b4a; }
#markmuse ul, #markmuse ol { margin: 0.8rem 0; padding-left: 1.7rem; }
#markmuse li { margin: 0.35rem 0; display: list-item; }
#markmuse hr { border: none; border-top: 1px dashed #5b7f5b; margin: 2em 0; }
#markmuse table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
#markmuse th, #markmuse td { border: none; border-bottom: 1px solid #c9d6c4; padding: 0.5rem 0.8rem; }
#markmuse th { background: #e4eee0; color: #1c3324; border-bottom: 2px solid #5b7f5b; }
#markmuse img { max-width: 100%; height: auto; border-radius: 6px; }
`
  },
  {
    id: 'slate',
    name: '岩灰',
    css: `/* 岩灰 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  line-height: 1.8;
  color: #1f2933;
  background-color: #f7f8fa;
  padding: 0 1rem;
}
#markmuse h1 {
  font-size: 1.65em;
  margin: 1.8rem 0 1.1rem;
  padding-bottom: 0.7rem;
  color: #1a2330;
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.06em;
  border: none;
  border-bottom: 2px solid #1a2330;
  background: none;
}
/* 二级 · 斜切微标（居中） */
#markmuse h2 {
  display: table;
  font-size: 1.12em;
  margin: 1.7rem auto 0.9rem;
  padding: 0.32rem 1.1rem;
  color: #ffffff;
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: 0.04em;
  border: none;
  background: #4b5d6b;
  border-radius: 12px 2px 12px 2px;
  text-align: center;
}
/* 三级 · 横幅微渐变（仅包文字，不拉满整行） */
#markmuse h3 {
  display: table;
  font-size: 1.02em;
  margin: 1.25rem 0 0.5rem;
  padding: 0.22rem 0.7rem;
  color: #7b8ea3;
  font-weight: 600;
  text-align: left;
  border: none;
  border-left: 3px solid #7b8ea3;
  border-radius: 0 4px 4px 0;
  background-color: #e8edf2;
  background-image: linear-gradient(90deg, rgba(26, 35, 48, 0.1) 0%, rgba(26, 35, 48, 0.02) 100%);
}
#markmuse p { margin: 0.85rem 0; }
#markmuse code {
  font-family: "SF Mono", Consolas, Menlo, monospace;
  font-size: 0.88em;
  padding: 0.15em 0.4em;
  background: #e8edf2;
  color: #334155;
  border-radius: 3px;
}
#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background: #252b33;
  border-radius: 6px;
  overflow-x: auto;
  position: relative;
  white-space: pre-wrap;
  word-wrap: break-word;
}
#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}
#markmuse pre code { display: block; background: transparent; padding: 0; color: #e8edf2; border: none; }
#markmuse pre a, #markmuse pre span { text-decoration: none; border-bottom: none; }
/* 引用 · 柔和彩调卡片 */
#markmuse blockquote {
  margin: 1.2rem 0;
  padding: 0.85rem 1.1rem;
  border: none;
  background: rgba(26, 35, 48, 0.08);
  color: #2d3748;
  border-radius: 6px;
  font-style: normal;
}
#markmuse a { color: #3d5a73; text-decoration: none; border-bottom: 1px solid #b7c4d1; }
#markmuse strong { color: #1a2330; }
#markmuse em { color: #4b5d6b; }
#markmuse ul, #markmuse ol { margin: 0.8rem 0; padding-left: 1.7rem; }
#markmuse li { margin: 0.35rem 0; display: list-item; }
#markmuse hr { border: none; border-top: 1px solid #d5dbe3; margin: 2em 0; }
#markmuse table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
#markmuse th, #markmuse td { border: none; border-bottom: 1px solid #d5dbe3; padding: 0.5rem 0.8rem; }
#markmuse th { background: #e8edf2; color: #1a2330; border-bottom: 2px solid #7b8ea3; }
#markmuse img { max-width: 100%; height: auto; border-radius: 6px; }
`
  },
  {
    id: 'wechat',
    name: '微信',
    css: `/* 微信 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  line-height: 1.8;
  color: #1f2328;
  background-color: #f7fbf8;
  padding: 0 1rem;
}
#markmuse h1 {
  display: table;
  font-size: 1.65em;
  margin: 2rem auto 1.2rem;
  padding: 0.2rem 0.12rem 0.4rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.35;
  text-align: center;
  letter-spacing: 0.05em;
  border: none;
  background-color: rgba(7, 193, 96, 0.1);
  background-image: linear-gradient(180deg, transparent 65%, rgba(7, 193, 96, 0.28) 65%);
}
/* 二级 · 居中实心胶囊 */
#markmuse h2 {
  display: table;
  font-size: 1.1em;
  margin: 1.8rem auto 1rem;
  padding: 0.38rem 1.25rem;
  color: #ffffff;
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: 0.08em;
  background: #07c160;
  border: none;
  border-radius: 4px;
  text-align: center;
}
/* 三级 · 横幅微渐变 */
#markmuse h3 {
  font-size: 1.05em;
  margin: 1.3rem 0 0.5rem;
  padding: 0.28rem 0.75rem;
  color: #3aa86a;
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: 0.04em;
  background-color: #e8f8ee;
  background-image: linear-gradient(90deg, rgba(7, 193, 96, 0.12) 0%, rgba(7, 193, 96, 0.02) 100%);
  border: none;
  border-left: 4px solid #5ad68a;
  border-radius: 0 4px 4px 0;
  text-align: left;
}
#markmuse p { margin: 0.85rem 0; line-height: 1.9; }
#markmuse code {
  font-family: "SF Mono", Consolas, Menlo, monospace;
  font-size: 0.88em;
  padding: 0.15em 0.4em;
  background: #e8f8ee;
  color: #067d3e;
  border-radius: 3px;
}
#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background: #1a2a22;
  border-radius: 6px;
  overflow-x: auto;
  position: relative;
  white-space: pre-wrap;
  word-wrap: break-word;
}
#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}
#markmuse pre code { display: block; background: transparent; padding: 0; color: #e6f6ea; border: none; }
#markmuse pre a, #markmuse pre span { text-decoration: none; border-bottom: none; }
#markmuse blockquote {
  margin: 1.2rem 0;
  padding: 0.85rem 1.1rem;
  border: none;
  background: rgba(7, 193, 96, 0.08);
  color: #2d3748;
  border-radius: 6px;
  font-style: normal;
}
#markmuse a { color: #07c160; text-decoration: none; border-bottom: 1px solid rgba(7, 193, 96, 0.4); }
#markmuse strong { color: #1a1a1a; }
#markmuse em { color: #067d3e; }
#markmuse ul, #markmuse ol { margin: 0.8rem 0; padding-left: 1.7rem; }
#markmuse li { margin: 0.35rem 0; display: list-item; }
#markmuse hr { border: none; border-top: 1px solid #d8eee0; margin: 2em 0; }
#markmuse table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
#markmuse th, #markmuse td { border: 1px solid #d8eee0; padding: 0.5rem 0.8rem; }
#markmuse th { background: #e8f8ee; color: #067d3e; }
#markmuse img { max-width: 100%; height: auto; border-radius: 6px; }
`
  },
  {
    id: 'violet',
    name: '罗兰',
    css: `/* 罗兰 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  line-height: 1.8;
  color: #2e2438;
  background-color: #faf8ff;
  padding: 0 1rem;
}
#markmuse h1 {
  display: table;
  font-size: 1.65em;
  margin: 2rem auto 1.2rem;
  padding: 0.2rem 0.12rem 0.4rem;
  font-weight: 700;
  color: #24183a;
  line-height: 1.35;
  text-align: center;
  letter-spacing: 0.05em;
  border: none;
  background-color: rgba(124, 58, 237, 0.1);
  background-image: linear-gradient(180deg, transparent 65%, rgba(124, 58, 237, 0.28) 65%);
}
/* 二级 · 斜切圆角微标 */
#markmuse h2 {
  display: table;
  font-size: 1.1em;
  margin: 1.8rem auto 1rem;
  padding: 0.38rem 1.3rem;
  color: #ffffff;
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: 0.08em;
  background: #7c3aed;
  border: none;
  border-radius: 12px 2px 12px 2px;
  text-align: center;
}
/* 三级 · 贴字虚线下划 */
#markmuse h3 {
  display: table;
  font-size: 1.02em;
  margin: 1.25rem 0 0.45rem;
  padding: 0 0.02rem 0.06rem;
  color: #9b6ef2;
  font-weight: 600;
  line-height: 1.3;
  text-align: left;
  border: none;
  border-bottom: 2px dashed #9b6ef2;
  background: none;
}
#markmuse p { margin: 0.85rem 0; line-height: 1.9; }
#markmuse code {
  font-family: "SF Mono", Consolas, Menlo, monospace;
  font-size: 0.88em;
  padding: 0.15em 0.4em;
  background: #efe8fc;
  color: #6d28d9;
  border-radius: 3px;
}
#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background: #2a2438;
  border-radius: 6px;
  overflow-x: auto;
  position: relative;
  white-space: pre-wrap;
  word-wrap: break-word;
}
#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}
#markmuse pre code { display: block; background: transparent; padding: 0; color: #ede6fa; border: none; }
#markmuse pre a, #markmuse pre span { text-decoration: none; border-bottom: none; }
#markmuse blockquote {
  margin: 1.2rem 0;
  padding: 0.8rem 1.1rem;
  border: 1px dashed rgba(124, 58, 237, 0.28);
  background: #fffdfa;
  color: #4a3e56;
  border-radius: 6px;
  font-style: normal;
}
#markmuse a { color: #7c3aed; text-decoration: none; border-bottom: 1px solid rgba(124, 58, 237, 0.35); }
#markmuse strong { color: #24183a; }
#markmuse em { color: #6d28d9; }
#markmuse ul, #markmuse ol { margin: 0.8rem 0; padding-left: 1.7rem; }
#markmuse li { margin: 0.35rem 0; display: list-item; }
#markmuse hr { border: none; border-top: 1px solid #e4d8f5; margin: 2em 0; }
#markmuse table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
#markmuse th, #markmuse td { border: 1px solid #e4d8f5; padding: 0.5rem 0.8rem; }
#markmuse th { background: #efe8fc; color: #6d28d9; }
#markmuse img { max-width: 100%; height: auto; border-radius: 6px; }
`
  },
  {
    id: 'rouge',
    name: '胭脂',
    css: `/* 胭脂 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  line-height: 1.8;
  color: #3a2430;
  background-color: #fff8fb;
  padding: 0 1rem;
}
#markmuse h1 {
  display: table;
  font-size: 1.65em;
  margin: 2rem auto 1.2rem;
  padding: 0.2rem 0.12rem 0.4rem;
  font-weight: 700;
  color: #3a1024;
  line-height: 1.35;
  text-align: center;
  letter-spacing: 0.05em;
  border: none;
  background-color: rgba(225, 29, 155, 0.1);
  background-image: linear-gradient(180deg, transparent 65%, rgba(225, 29, 155, 0.28) 65%);
}
/* 二级 · 短下划线 */
#markmuse h2 {
  display: table;
  font-size: 1.18em;
  margin: 1.8rem auto 1rem;
  padding: 0 0.1rem 0.28rem;
  color: #6b2048;
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: 0.04em;
  border: none;
  border-bottom: 2px solid #e88bc4;
  background: none;
  text-align: center;
}
/* 三级 · 荧光笔（再浅一档） */
#markmuse h3 {
  display: table;
  font-size: 1.05em;
  margin: 1.3rem 0 0.5rem;
  padding: 0.08rem 0.1rem 0.26rem;
  color: #8a3d62;
  font-weight: 600;
  line-height: 1.45;
  text-align: left;
  border: none;
  background-color: rgba(225, 29, 155, 0.05);
  background-image: linear-gradient(180deg, transparent 68%, rgba(225, 29, 155, 0.12) 68%);
}
#markmuse p { margin: 0.85rem 0; line-height: 1.9; }
#markmuse code {
  font-family: "SF Mono", Consolas, Menlo, monospace;
  font-size: 0.88em;
  padding: 0.15em 0.4em;
  background: #fce8f4;
  color: #be185d;
  border-radius: 3px;
}
#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background: #2a1822;
  border-radius: 6px;
  overflow-x: auto;
  position: relative;
  white-space: pre-wrap;
  word-wrap: break-word;
}
#markmuse pre::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}
#markmuse pre code { display: block; background: transparent; padding: 0; color: #f8e6f1; border: none; }
#markmuse pre a, #markmuse pre span { text-decoration: none; border-bottom: none; }
#markmuse blockquote {
  margin: 1.1rem 0;
  padding: 0.7rem 1rem;
  border-left: 3px solid #e11d9b;
  color: #4a4a4a;
  background: #fff5fa;
  border-radius: 0 4px 4px 0;
  font-style: normal;
}
#markmuse a { color: #e11d9b; text-decoration: none; border-bottom: 1px solid rgba(225, 29, 155, 0.35); }
#markmuse strong { color: #3a1024; }
#markmuse em { color: #be185d; }
#markmuse ul, #markmuse ol { margin: 0.8rem 0; padding-left: 1.7rem; }
#markmuse li { margin: 0.35rem 0; display: list-item; }
#markmuse hr { border: none; border-top: 1px solid #f5d0e6; margin: 2em 0; }
#markmuse table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
#markmuse th, #markmuse td { border: 1px solid #f5d0e6; padding: 0.5rem 0.8rem; }
#markmuse th { background: #fce8f4; color: #be185d; }
#markmuse img { max-width: 100%; height: auto; border-radius: 6px; }
`
  }
];

export const defaultThemeId = 'default';

