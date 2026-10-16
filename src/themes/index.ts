// 主题配置
import type { Theme } from '../types/type';

export const defaultThemeCss = `/* 默认 */
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
  padding: 0.2rem 0.55em 0.4rem;
  max-width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
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
}`;

export const themes: Theme[] = [
  {
    id: 'default',
    name: '默认',
    css: defaultThemeCss
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
    css: `/* 极简 · 纸上编辑部 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #393936;
  background-color: #fdfcf9;
  line-height: 1.9;
  padding: 0 1.2rem;
  max-width: 800px;
  margin: 0 auto;
}
#markmuse h1 {
  font-family: "Noto Serif SC", "Songti SC", SimSun, serif;
  font-size: 1.95em;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.06em;
  text-align: left;
  color: #232522;
  margin: 2rem 0 1.6rem;
  padding: 0 0 0.8em;
  border: none;
  border-bottom: 2px solid #353b35;
  background: none;
}
/* 章节标题：小幅深色签条，取代通栏渐变 */
#markmuse h2 {
  display: table;
  max-width: 100%;
  box-sizing: border-box;
  font-size: 1.12em;
  font-weight: 600;
  line-height: 1.6;
  letter-spacing: 0.06em;
  margin: 2.2em 0 1em;
  padding: 0.35em 0.9em;
  color: #fdfcf9;
  background-color: #353b35;
  border: none;
  border-radius: 2px;
  text-align: left;
}
/* 小节以字重和留白建立层级 */
#markmuse h3 {
  font-size: 1.06em;
  font-weight: 700;
  line-height: 1.65;
  color: #30362f;
  margin: 1.8em 0 0.65em;
  padding: 0 0 0.5em;
  border: none;
  border-bottom: 1px solid #e1e2da;
  background: none;
  text-align: left;
}
#markmuse h4, #markmuse h5, #markmuse h6 { font-size: 1em; color: #51574d; line-height: 1.7; margin: 1.4em 0 0.6em; font-weight: 600; }
#markmuse p { margin: 1em 0; line-height: 1.95; }
#markmuse strong { color: #242a23; font-weight: 700; }
#markmuse em { color: #646b5b; }
#markmuse a { color: #4f6755; text-decoration: none; border-bottom: 1px solid #a4b09f; }
#markmuse code { font-family: "SF Mono", Consolas, monospace; font-size: 0.88em; padding: 0.16em 0.4em; color: #545d48; background-color: #eeeee6; border-radius: 3px; }
#markmuse pre { margin: 1.3em 0; padding: 1.2em; background-color: #292d29; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
#markmuse pre code { display: block; padding: 0; color: #eeeee5; background: transparent; border: none; line-height: 1.75; }
#markmuse pre a, #markmuse pre span { border-bottom: none; text-decoration: none; }
#markmuse blockquote { margin: 1.5em 0; padding: 0.65em 1.15em; background-color: #f1f1e9; border: none; border-left: 2px solid #a3aa94; color: #606555; font-style: normal; }
#markmuse blockquote p { margin: 0.6em 0; }
#markmuse ul, #markmuse ol { margin: 0.9em 0; padding-left: 1.6em; }
#markmuse li { display: list-item; margin: 0.45em 0; }
#markmuse hr { border: none; border-top: 1px solid #d9dcd1; margin: 2.5em 0; }
#markmuse table { width: 100%; border-collapse: collapse; margin: 1.3em 0; }
#markmuse th, #markmuse td { padding: 0.7em 0.8em; border: none; border-bottom: 1px solid #dddfd5; text-align: left; }
#markmuse th { color: #343b30; background-color: #eeeee6; font-weight: 600; }
#markmuse img { max-width: 100%; height: auto; border-radius: 3px; }
`
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
  padding: 0.25em 0.65em 0.35em;
  max-width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
  line-height: 1.5;
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
  padding: 0.2rem 0.55em 0.4rem;
  max-width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
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
    css: `/* 微信 · 松风 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  line-height: 1.8;
  color: #35433e;
  background-color: #fafbf7;
  padding: 0 1rem;
}
#markmuse h1 {
  display: table;
  font-size: 1.65em;
  margin: 2rem auto 1.2rem;
  padding: 0.2rem 0.55em 0.4rem;
  max-width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
  font-weight: 700;
  color: #24483e;
  line-height: 1.35;
  text-align: center;
  letter-spacing: 0.05em;
  border: none;
  background-color: rgba(60, 105, 86, 0.1);
  background-image: linear-gradient(180deg, transparent 65%, rgba(60, 105, 86, 0.28) 65%);
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
  background: #3c6956;
  border: none;
  border-radius: 4px;
  text-align: center;
}
/* 三级 · 浅鼠尾草绿横幅 */
#markmuse h3 {
  font-size: 1.05em;
  margin: 1.3rem 0 0.5rem;
  padding: 0.28rem 0.75rem;
  color: #365f4f;
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: 0.04em;
  background-color: #edf2e9;
  border: none;
  border-left: 4px solid #92aa8b;
  border-radius: 0 4px 4px 0;
  text-align: left;
}
#markmuse p { margin: 0.85rem 0; line-height: 1.9; }
#markmuse code {
  font-family: "SF Mono", Consolas, Menlo, monospace;
  font-size: 0.88em;
  padding: 0.15em 0.4em;
  background: #edf2e9;
  color: #41634e;
  border-radius: 3px;
}
#markmuse pre {
  margin: 1rem 0;
  padding: 2.5rem 1rem 1rem 1rem;
  background: #253b32;
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
#markmuse pre code { display: block; background: transparent; padding: 0; color: #edf2e8; border: none; }
#markmuse pre a, #markmuse pre span { text-decoration: none; border-bottom: none; }
#markmuse blockquote {
  margin: 1.2rem 0;
  padding: 0.85rem 1.1rem;
  border: none;
  background: rgba(60, 105, 86, 0.08);
  color: #526456;
  border-radius: 6px;
  font-style: normal;
}
#markmuse a { color: #3c6956; text-decoration: none; border-bottom: 1px solid rgba(60, 105, 86, 0.4); }
#markmuse strong { color: #24483e; }
#markmuse em { color: #41634e; }
#markmuse ul, #markmuse ol { margin: 0.8rem 0; padding-left: 1.7rem; }
#markmuse li { margin: 0.35rem 0; display: list-item; }
#markmuse hr { border: none; border-top: 1px solid #d8e1d2; margin: 2em 0; }
#markmuse table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
#markmuse th, #markmuse td { border: 1px solid #d8e1d2; padding: 0.5rem 0.8rem; }
#markmuse th { background: #edf2e9; color: #41634e; }
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
  padding: 0.2rem 0.55em 0.4rem;
  max-width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
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
/* 三级 · 浅紫底与细实线，使用可内联的基础样式 */
#markmuse h3 {
  display: block;
  font-size: 1.05em;
  margin: 1.6em 0 0.75em;
  padding: 0.55em 0.85em;
  color: #593586;
  font-weight: 600;
  line-height: 1.65;
  text-align: left;
  border: none;
  border-left: 3px solid #a78bca;
  background-color: #f0eaf8;
  overflow-wrap: break-word;
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
  padding: 0.2rem 0.55em 0.4rem;
  max-width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
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
  },
  {
    id: 'clear-sky',
    name: '晴空',
    css: `/* 晴空 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #243840; background-color: #ffffff; padding: 0 1.1rem; line-height: 1.95;
}
#markmuse h1 {
  display: table; max-width: 100%; box-sizing: border-box;
  font-size: 1.75em; font-weight: 700; line-height: 1.5;
  color: #008ca8; text-align: center; letter-spacing: 0.04em;
  margin: 1.8em auto 1.3em; padding: 0.2em 0.5em 0.6em;
  border: none; border-bottom: 3px solid #f3c623; background: none;
  overflow-wrap: break-word;
}
#markmuse h2 {
  display: table; max-width: 100%; box-sizing: border-box;
  font-size: 1.2em; font-weight: 700; line-height: 1.6;
  color: #008ca8; text-align: center; letter-spacing: 0.04em;
  margin: 2.1em auto 1.2em; background: none;
  border: none; border-bottom: 5px solid #f3c623; padding: 0.12em 0.4em 0.22em;
  overflow-wrap: break-word;
}
#markmuse h3 {
  font-size: 1.06em; font-weight: 700; line-height: 1.65;
  margin: 1.7em 0 0.8em; padding: 0.08em 0 0.08em 0.7em;
  color: #008ca8; background: none; border: none; border-left: 4px solid #f3c623; text-align: left;
}
#markmuse h4, #markmuse h5, #markmuse h6 { color: #008ca8; font-size: 1em; font-weight: 600; line-height: 1.7; margin: 1.3em 0 0.6em; }
#markmuse p { margin: 1.1em 0; line-height: 1.95; }
#markmuse strong { color: #008ca8; font-weight: 700; }
#markmuse em { color: #008ca8; }
#markmuse a { color: #008ca8; text-decoration: none; border-bottom: 1px solid #f3c623; }
#markmuse blockquote { margin: 1.5em 0; padding: 0.7em 1em; color: #243840; background-color: #edf8fa; border: none; border-left: 3px solid #008ca8; font-style: normal; }
#markmuse blockquote p { margin: 0.55em 0; }
#markmuse ul, #markmuse ol { margin: 1em 0; padding-left: 1.65em; }
#markmuse li { display: list-item; margin: 0.45em 0; }
#markmuse code { font-family: "SF Mono", Consolas, monospace; font-size: 0.88em; color: #008ca8; background-color: #edf8fa; padding: 0.18em 0.4em; border-radius: 3px; }
#markmuse pre { margin: 1.4em 0; padding: 2.5rem 1rem 1rem; position: relative; background-color: #242c34; border: none; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
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
#markmuse pre code { display: block; color: #edf1f5; background: transparent; padding: 0; border: none; line-height: 1.75; }
#markmuse pre a, #markmuse pre span { border-bottom: none; text-decoration: none; }
#markmuse hr { border: none; border-top: 1px solid #f3c623; margin: 2.2em 0; }
#markmuse table { width: 100%; border-collapse: collapse; margin: 1.3em 0; }
#markmuse th, #markmuse td { padding: 0.65em 0.8em; border: 1px solid #edf8fa; border-bottom: 1px solid #f3c623; text-align: left; }
#markmuse th { color: #008ca8; background-color: #edf8fa; font-weight: 600; }
#markmuse img { max-width: 100%; height: auto; border-radius: 4px; }
`
  },
  {
    id: 'sea-route',
    name: '航线',
    css: `/* 航线 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #303b45; background-color: #fcfcfa; padding: 0 1.1rem; line-height: 1.95;
}
#markmuse h1 {
  display: table; max-width: 100%; box-sizing: border-box;
  font-size: 1.75em; font-weight: 700; line-height: 1.5;
  color: #244660; text-align: center; letter-spacing: 0.04em;
  margin: 1.8em auto 1.3em; padding: 0.2em 0.5em 0.6em;
  border: none; border-bottom: 3px solid #c5a15d; background: none;
  overflow-wrap: break-word;
}
#markmuse h2 {
  display: table; max-width: 100%; box-sizing: border-box;
  font-size: 1.2em; font-weight: 700; line-height: 1.6;
  color: #244660; text-align: center; letter-spacing: 0.04em;
  margin: 2.1em auto 1.2em; background: none;
  border: 1px solid #244660; border-top: 3px solid #c5a15d; padding: 0.5em 1.1em;
  overflow-wrap: break-word;
}
#markmuse h3 {
  font-size: 1.06em; font-weight: 700; line-height: 1.65;
  margin: 1.7em 0 0.8em; padding: 0.08em 0 0.08em 0.7em;
  color: #244660; background: none; border: none; border-left: 4px solid #c5a15d; text-align: left;
}
#markmuse h4, #markmuse h5, #markmuse h6 { color: #244660; font-size: 1em; font-weight: 600; line-height: 1.7; margin: 1.3em 0 0.6em; }
#markmuse p { margin: 1.1em 0; line-height: 1.95; }
#markmuse strong { color: #244660; font-weight: 700; }
#markmuse em { color: #244660; }
#markmuse a { color: #244660; text-decoration: none; border-bottom: 1px solid #c5a15d; }
#markmuse blockquote { margin: 1.5em 0; padding: 0.7em 1em; color: #303b45; background-color: #edf2f5; border: none; border-left: 3px solid #244660; font-style: normal; }
#markmuse blockquote p { margin: 0.55em 0; }
#markmuse ul, #markmuse ol { margin: 1em 0; padding-left: 1.65em; }
#markmuse li { display: list-item; margin: 0.45em 0; }
#markmuse code { font-family: "SF Mono", Consolas, monospace; font-size: 0.88em; color: #244660; background-color: #edf2f5; padding: 0.18em 0.4em; border-radius: 3px; }
#markmuse pre { margin: 1.4em 0; padding: 2.5rem 1rem 1rem; position: relative; background-color: #242c34; border: none; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
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
#markmuse pre code { display: block; color: #edf1f5; background: transparent; padding: 0; border: none; line-height: 1.75; }
#markmuse pre a, #markmuse pre span { border-bottom: none; text-decoration: none; }
#markmuse hr { border: none; border-top: 1px solid #c5a15d; margin: 2.2em 0; }
#markmuse table { width: 100%; border-collapse: collapse; margin: 1.3em 0; }
#markmuse th, #markmuse td { padding: 0.65em 0.8em; border: 1px solid #edf2f5; border-bottom: 1px solid #c5a15d; text-align: left; }
#markmuse th { color: #244660; background-color: #edf2f5; font-weight: 600; }
#markmuse img { max-width: 100%; height: auto; border-radius: 4px; }
`
  },
  {
    id: 'clay-paper',
    name: '陶笺',
    css: `/* 陶笺 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #463b34; background-color: #fffdf8; padding: 0 1.1rem; line-height: 1.95;
}
#markmuse h1 {
  display: table; max-width: 100%; box-sizing: border-box;
  font-size: 1.75em; font-weight: 700; line-height: 1.5;
  color: #a54f3d; text-align: center; letter-spacing: 0.04em;
  margin: 1.8em auto 1.3em; padding: 0.2em 0.5em 0.6em;
  border: none; border-bottom: 3px solid #caa16a; background: none;
  overflow-wrap: break-word;
}
#markmuse h2 {
  display: table; max-width: 100%; box-sizing: border-box;
  font-size: 1.2em; font-weight: 700; line-height: 1.6;
  color: #a54f3d; text-align: center; letter-spacing: 0.04em;
  margin: 2.1em auto 1.2em; background: none;
  border: none; border-left: 4px solid #caa16a; background-color: #f8eee5; padding: 0.4em 0.9em;
  overflow-wrap: break-word;
}
#markmuse h3 {
  font-size: 1.06em; font-weight: 700; line-height: 1.65;
  margin: 1.7em 0 0.8em; padding: 0.08em 0 0.08em 0.7em;
  color: #a54f3d; background: none; border: none; border-left: 4px solid #caa16a; text-align: left;
}
#markmuse h4, #markmuse h5, #markmuse h6 { color: #a54f3d; font-size: 1em; font-weight: 600; line-height: 1.7; margin: 1.3em 0 0.6em; }
#markmuse p { margin: 1.1em 0; line-height: 1.95; }
#markmuse strong { color: #a54f3d; font-weight: 700; }
#markmuse em { color: #a54f3d; }
#markmuse a { color: #a54f3d; text-decoration: none; border-bottom: 1px solid #caa16a; }
#markmuse blockquote { margin: 1.5em 0; padding: 0.7em 1em; color: #463b34; background-color: #f8eee5; border: none; border-left: 3px solid #a54f3d; font-style: normal; }
#markmuse blockquote p { margin: 0.55em 0; }
#markmuse ul, #markmuse ol { margin: 1em 0; padding-left: 1.65em; }
#markmuse li { display: list-item; margin: 0.45em 0; }
#markmuse code { font-family: "SF Mono", Consolas, monospace; font-size: 0.88em; color: #a54f3d; background-color: #f8eee5; padding: 0.18em 0.4em; border-radius: 3px; }
#markmuse pre { margin: 1.4em 0; padding: 2.5rem 1rem 1rem; position: relative; background-color: #242c34; border: none; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
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
#markmuse pre code { display: block; color: #edf1f5; background: transparent; padding: 0; border: none; line-height: 1.75; }
#markmuse pre a, #markmuse pre span { border-bottom: none; text-decoration: none; }
#markmuse hr { border: none; border-top: 1px solid #caa16a; margin: 2.2em 0; }
#markmuse table { width: 100%; border-collapse: collapse; margin: 1.3em 0; }
#markmuse th, #markmuse td { padding: 0.65em 0.8em; border: 1px solid #f8eee5; border-bottom: 1px solid #caa16a; text-align: left; }
#markmuse th { color: #a54f3d; background-color: #f8eee5; font-weight: 600; }
#markmuse img { max-width: 100%; height: auto; border-radius: 4px; }
`
  },
  {
    id: 'clear-blue',
    name: '澄蓝',
    css: `/* 澄蓝 · 左侧线卡片 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #304457; background-color: #ffffff; padding: 0 1.1rem; line-height: 1.95;
}
#markmuse h1 {
  display: table; max-width: 100%; box-sizing: border-box;
  font-size: 1.75em; font-weight: 700; line-height: 1.5;
  color: #245b85; text-align: center; letter-spacing: 0.04em;
  margin: 1.8em auto 1.3em; padding: 0.2em 0.5em 0.6em;
  border: none; border-bottom: 3px solid #2997ff; background: none;
  overflow-wrap: break-word;
}
#markmuse h2 {
  display: block; max-width: 100%; box-sizing: border-box;
  font-size: 1.17em; font-weight: 700; line-height: 1.65;
  color: #254c6b; text-align: left; letter-spacing: 0.03em;
  margin: 2em 0 1.1em; padding: 0.3em 0.95em;
  background-color: #e3f2ff;
  border: none; border-left: 3px solid #2997ff;
  border-radius: 6px;
  overflow-wrap: break-word;
}
#markmuse h3 {
  font-size: 1.05em; font-weight: 600; line-height: 1.7;
  margin: 1.6em 0 0.75em; padding: 0.15em 0 0.15em 0.75em;
  color: #30638c; background: none;
  border: none; border-left: 2px solid #9acaf4;
  text-align: left;
}
#markmuse h4, #markmuse h5, #markmuse h6 { color: #245b85; font-size: 1em; font-weight: 600; line-height: 1.7; margin: 1.3em 0 0.6em; }
#markmuse p { margin: 1.1em 0; line-height: 1.95; }
#markmuse strong { color: #245b85; font-weight: 700; }
#markmuse em { color: #245b85; }
#markmuse a { color: #245b85; text-decoration: none; border-bottom: 1px solid #2997ff; }
#markmuse blockquote { margin: 1.5em 0; padding: 0.75em 1.1em; color: #526b80; background-color: #eef7ff; border: none; border-left: 3px solid #2997ff; border-radius: 6px; font-style: normal; }
#markmuse blockquote p { margin: 0.55em 0; }
#markmuse ul, #markmuse ol { margin: 1em 0; padding-left: 1.65em; }
#markmuse li { display: list-item; margin: 0.45em 0; }
#markmuse code { font-family: "SF Mono", Consolas, monospace; font-size: 0.88em; color: #245b85; background-color: #eaf5ff; padding: 0.18em 0.4em; border-radius: 3px; }
#markmuse pre { margin: 1.4em 0; padding: 2.5rem 1rem 1rem; position: relative; background-color: #242c34; border: none; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
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
#markmuse pre code { display: block; color: #edf1f5; background: transparent; padding: 0; border: none; line-height: 1.75; }
#markmuse pre a, #markmuse pre span { border-bottom: none; text-decoration: none; }
#markmuse hr { border: none; border-top: 1px solid #2997ff; margin: 2.2em 0; }
#markmuse table { width: 100%; border-collapse: collapse; margin: 1.3em 0; }
#markmuse th, #markmuse td { padding: 0.65em 0.8em; border: 1px solid #eaf5ff; border-bottom: 1px solid #2997ff; text-align: left; }
#markmuse th { color: #245b85; background-color: #eaf5ff; font-weight: 600; }
#markmuse img { max-width: 100%; height: auto; border-radius: 4px; }
`
  }
];

export const defaultThemeId = 'default';

