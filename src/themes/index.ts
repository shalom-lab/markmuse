// 主题配置
export interface Theme {
  id: string;
  name: string;
  css: string;
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: '默认主题',
    css: `/* 默认主题 - 优化微信推文风格 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  line-height: 1.8;
  color: #333333;
  background-color: #ffffff;
  padding: 0 1rem;
  max-width: 100%;
}

#markmuse h1 {
  font-size: 2em;
  margin: 2rem 0 1.2rem;
  padding: 1rem 0;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
  text-align: center;
  border-bottom: 3px solid #667eea;
  padding-bottom: 1rem;
}

#markmuse h2 {
  font-size: 1.5em;
  margin: 1.8rem 0 1rem;
  padding: 0.8rem 1.2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  line-height: 1.4;
}

#markmuse h3 {
  font-size: 1.25em;
  margin: 1.5rem 0 0.8rem;
  padding: 0.6rem 0 0.6rem 1.2rem;
  border-left: 5px solid #667eea;
  color: #2c3e50;
  font-weight: 600;
  background: linear-gradient(to right, rgba(102, 126, 234, 0.08), transparent);
  line-height: 1.5;
  border-radius: 0 4px 4px 0;
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
  background-color: transparent;
  padding: 0;
  font-size: 0.9em;
  color: #e8e8e8;
  font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

#markmuse blockquote {
  margin: 1rem 0;
  padding: 0.8rem 1rem;
  border-left: 4px solid #667eea;
  color: #555;
  background: linear-gradient(to right, rgba(102, 126, 234, 0.05), transparent);
  border-radius: 0 6px 6px 0;
  font-style: italic;
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
  color: #0969da;
  text-decoration: none;
}

#markmuse a:hover {
  text-decoration: underline;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
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
    name: '温暖主题',
    css: `/* 温暖主题 */
#markmuse {
  font-family: "Georgia", "Times New Roman", serif;
  line-height: 1.8;
  color: #3d2817;
  background-color: #fef9f3;
}

#markmuse h1 {
  font-size: 2.2em;
  margin: 2rem 0 1.2rem;
  padding: 1rem 0;
  font-weight: 700;
  color: #8b4513;
  line-height: 1.3;
  text-align: center;
  border-bottom: 3px solid #d4a574;
  padding-bottom: 1rem;
}

#markmuse h2 {
  font-size: 1.7em;
  margin: 1.8rem 0 1rem;
  padding: 0.8rem 1.2rem;
  background: linear-gradient(135deg, #daa520 0%, #cd853f 100%);
  color: #ffffff;
  font-weight: 700;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3);
  line-height: 1.4;
}

#markmuse h3 {
  font-size: 1.35em;
  margin: 1.5rem 0 0.8rem;
  padding: 0.6rem 0 0.6rem 1.2rem;
  border-left: 5px solid #cd853f;
  color: #a0522d;
  font-weight: 600;
  background: linear-gradient(to right, rgba(205, 133, 63, 0.1), transparent);
  line-height: 1.5;
  border-radius: 0 4px 4px 0;
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
  background-color: transparent;
  padding: 0;
  font-size: 0.9em;
  color: #f4e4c1;
  font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

#markmuse blockquote {
  margin: 1em 0;
  padding: 0 1em;
  border-left: 4px solid #daa520;
  color: #654321;
  background-color: #fff8dc;
  border-radius: 0 4px 4px 0;
  font-style: italic;
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
    name: '极简主题',
    css: `/* 极简主题 */
#markmuse {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  line-height: 1.8;
  color: #2c3e50;
  background-color: #ffffff;
  max-width: 800px;
  margin: 0 auto;
}

#markmuse h1 {
  font-size: 2.5em;
  margin: 2.5rem 0 1.5rem;
  font-weight: 300;
  color: #2c3e50;
  letter-spacing: -0.02em;
  line-height: 1.2;
  text-align: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #ecf0f1;
}

#markmuse h2 {
  font-size: 1.9em;
  margin: 2.2rem 0 1.2rem;
  font-weight: 300;
  color: #34495e;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

#markmuse h3 {
  font-size: 1.5em;
  margin: 1.8rem 0 1rem;
  font-weight: 400;
  color: #34495e;
  line-height: 1.4;
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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
  font-size: 0.85em;
  color: #e0e0e0;
  font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

#markmuse blockquote {
  margin: 1.5rem 0;
  padding: 0 1.5rem;
  border-left: 3px solid #bdc3c7;
  color: #7f8c8d;
  font-style: italic;
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
  border: 1px solid #ecf0f1;
  padding: 10px 15px;
  text-align: left;
}

#markmuse th {
  background-color: #f5f5f5;
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
    name: '前端之巅',
    css: `/* 前端之巅主题 - 参考 mdnice 设计 */
#markmuse {
  line-height: 1.6;
  letter-spacing: .034em;
  color: rgb(63, 63, 63);
  font-size: 16px;
  word-break: break-all;
}

#markmuse p {
  padding-top: 23px;
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
  border-bottom: 2px solid #3C7076;
}

/* 一级标题内容 */
#markmuse h1 .content {
  font-size: 20px;
  color: rgb(60, 112, 198);
  border-bottom: 2px solid #3C7076;
}


/* 二级标题 */
#markmuse h2 {
  display: block;
  text-align: center;
  background-image: url(https://s2.loli.net/2022/01/14/X3gJHmQsAeStUFW.png); 
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 63px;
  margin-top: 38px;
  margin-bottom: 10px;
}

/* 二级标题内容 */
#markmuse h2 .content {
  text-align: center;
  display: inline-block;
  height: 38px;
  line-height: 42px;
  color: rgb(60, 112, 198);
  background-size: 63px;
  margin-top: 38px;
  font-size: 18px;
  margin-bottom: 10px;
}

/* 三级标题 */
#markmuse h3 {
  font-size: 16px;
  font-weight: bold;
  color: rgb(60, 112, 198);
  margin: 1.2rem 0 0.6rem;
}

/* 列表内容 */
#markmuse ul, #markmuse ol {
  margin: 1em 0;
  padding-left: 2em;
}

#markmuse li {
  margin: 0.5em 0;
  line-height: 1.75em;
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
  }
];

export const defaultThemeId = 'default';

