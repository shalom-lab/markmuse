import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import ts from 'typescript';
import MarkdownIt from 'markdown-it';

const root = process.cwd();
const bundled = path.join(root, 'node_modules/.cache/markmuse-demo-renderer.cjs');
await build({stdin:{contents:`export { themes } from './src/themes'; export { default as math } from './src/utils/markdown-it-math'; export { createHighlightFunction } from './src/utils/highlight';`,resolveDir:root},bundle:true,platform:'node',format:'cjs',outfile:bundled,plugins:[{name:'raw-css',setup(b){b.onLoad({filter:/prismr\.js$/},args=>({contents:fs.readFileSync(args.path,'utf8').replace('module.exports = Prism;', 'globalThis.Prism = Prism;'),loader:'js'}));b.onLoad({filter:/\.css\?raw$/},args=>({contents:fs.readFileSync(args.path.replace(/\?raw$/,''),'utf8'),loader:'text'}));}}]});
const { themes, math, createHighlightFunction } = createRequire(import.meta.url)(bundled);
const source=ts.createSourceFile('EditorPage.tsx',fs.readFileSync('src/pages/EditorPage.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let help;
function visit(n){if(ts.isVariableDeclaration(n)&&n.name.getText(source)==='helpContent'&&n.initializer&&ts.isNoSubstitutionTemplateLiteral(n.initializer)) help=n.initializer.text;ts.forEachChild(n,visit);}
visit(source);
if(!help?.startsWith('# MarkMuse 帮助文档')) throw new Error('Help document not found');
const md=new MarkdownIt({html:true,linkify:true,typographer:true,breaks:true});
md.set({highlight:createHighlightFunction(md)});
md.use(math,{throwOnError:false,errorColor:'#cc0000'});
const rendered=md.render(help);
if(!rendered.includes('katex')||!rendered.includes('language-r')||!rendered.includes('常见问题')) throw new Error('Incomplete document rendering');
const output='public/demos';
fs.mkdirSync(`${output}/assets`,{recursive:true});
fs.copyFileSync('node_modules/katex/dist/katex.min.css',`${output}/assets/katex.min.css`);
fs.cpSync('node_modules/katex/dist/fonts',`${output}/assets/fonts`,{recursive:true});
fs.copyFileSync('node_modules/highlight.js/styles/github-dark.css',`${output}/assets/highlight.css`);
const chrome=`*{box-sizing:border-box}body{margin:0;background:#eae8ed;color:#38323e;font-family:system-ui,sans-serif}.demo-nav{position:sticky;top:0;z-index:10;background:#ffffffed;border-bottom:1px solid #ddd7e3;padding:12px 20px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;font-size:14px}.demo-nav a{color:#655078}.demo-nav select,.demo-nav button{padding:7px 10px;border:1px solid #d9d2df;border-radius:6px;background:#fff;color:#42384d}.demo-nav button{cursor:pointer}.demo-paper{max-width:760px;margin:28px auto;background:white;padding:24px 16px 40px}.demo-paper.phone{max-width:375px}.demo-paper>section{padding-top:1px!important;padding-bottom:16px!important;overflow-wrap:break-word}.katex-display{overflow-x:auto;overflow-y:hidden}@media(max-width:600px){.demo-paper{margin:12px auto;padding:12px 4px}.demo-nav{padding:10px}}`;
const head=(title)=>`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="stylesheet" href="assets/katex.min.css"><link rel="stylesheet" href="assets/highlight.css"><style>${chrome}</style>`;
for(let i=0;i<themes.length;i++){
 const t=themes[i];
 const options=themes.map(x=>`<option value="${x.id}.html" ${x.id===t.id?'selected':''}>${x.name}</option>`).join('');
 const html=`${head(`${t.name} · 完整帮助文档演示`)}<style>${t.css}</style></head><body><nav class="demo-nav"><a href="index.html">全部主题</a><strong>${t.name}</strong><label>切换主题 <select aria-label="切换主题" onchange="location.href=this.value">${options}</select></label><button id="width" aria-pressed="false">手机宽度</button><a href="${themes[(i+1)%themes.length].id}.html">下一主题 →</a></nav><main class="demo-paper" id="paper"><section id="markmuse">${rendered}</section></main><script>document.getElementById('width').onclick=function(){const phone=document.getElementById('paper').classList.toggle('phone');this.setAttribute('aria-pressed',String(phone));this.textContent=phone?'恢复宽屏':'手机宽度';};</script></body></html>`;
 fs.writeFileSync(`${output}/${t.id}.html`,html);
}
const cards=themes.map(t=>`<a class="card" href="${t.id}.html"><strong>${t.name}</strong><span>完整帮助文档 · 标题、正文、引用、代码与公式</span><b>查看主题 →</b></a>`).join('');
fs.writeFileSync(`${output}/index.html`,`${head('MarkMuse · 全部主题演示')}<style>.hub{max-width:1060px;margin:48px auto;padding:0 24px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.card{display:flex;flex-direction:column;gap:18px;background:white;padding:26px;border:1px solid #ddd7e3;border-radius:12px;text-decoration:none;color:#473850}.card strong{font-size:24px}.card span{font-size:14px;line-height:1.8;color:#82718b}.card b{font-size:14px}.intro{line-height:1.9;margin-bottom:28px;color:#786a80}</style></head><body><main class="hub"><h1>每个主题，都完整看一遍</h1><p class="intro">共 ${themes.length} 款主题，全部使用 MarkMuse 内置帮助文档原文。进入后可切换主题或手机宽度；告诉我主题名和需要调整的标题、正文或代码块即可。</p><section class="grid">${cards}</section></main></body></html>`);
fs.writeFileSync(`${output}/help.md`,help);
console.log(`Generated ${themes.length} complete demos: ${themes.map(t=>t.name).join('、')}. Help: ${help.length} characters; math and code verified.`);
