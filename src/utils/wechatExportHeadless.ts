import juice from 'juice';
import MarkdownIt from 'markdown-it';
import markdownItMath from './markdown-it-math';
import { initMathJax } from './wechatExport';
import { createHighlightFunction, getDefaultHighlightStyles } from './highlight';

// MathJax 类型已在 wechatExport.ts 中声明，这里不需要重复声明

// MathJax 就绪状态缓存（用于无头版本）
let mathJaxReadyPromiseHeadless: Promise<void> | null = null;
let isMathJaxReadyHeadless = false;

// 等待 MathJax 准备好（无头版本）
async function waitForMathJax(): Promise<void> {
  if (isMathJaxReadyHeadless && window.MathJax && typeof window.MathJax.tex2svg === 'function') {
    return;
  }
  
  if (mathJaxReadyPromiseHeadless) {
    return mathJaxReadyPromiseHeadless;
  }
  
  // 如果没有初始化过，进行初始化
  return initMathJax().then(() => {
    isMathJaxReadyHeadless = true;
  });
}

// 将 LaTeX 转换为 SVG（复用现有逻辑）
async function convertLatexToSVGAsync(latex: string, isDisplay: boolean): Promise<string> {
  try {
    await waitForMathJax();
    
    if (!window.MathJax || typeof window.MathJax.tex2svg !== 'function') {
      console.error('MathJax 未正确加载');
      return '';
    }
    
    const result = window.MathJax.tex2svg(latex, {
      display: isDisplay,
      em: 16,
      ex: 8,
      containerWidth: 800
    });
    
    let svgEl: SVGSVGElement | null = null;
    let containerEl: HTMLElement | null = null;
    
    if (result instanceof Document) {
      svgEl = result.documentElement as unknown as SVGSVGElement;
    } else {
      containerEl = result as HTMLElement;
      svgEl = containerEl.querySelector('svg') as SVGSVGElement;
      
      if (!svgEl) {
        console.error('在 mjx-container 中未找到 SVG');
        return '';
      }
    }
    
    if (!svgEl || svgEl.tagName !== 'svg') {
      console.error('未找到 SVG 元素');
      return '';
    }
    
    // 如果容器中有多个 SVG（可能包含符号定义），尝试合并
    if (containerEl) {
      const allSvgs = containerEl.querySelectorAll('svg');
      if (allSvgs.length > 1) {
        // 找到主 SVG（包含内容的）
        const mainSvg = Array.from(allSvgs).find(svg => 
          svg.querySelector('g[data-mml-node]') || svg.querySelector('use')
        ) || svgEl;
        
        // 合并所有 SVG 的 defs
        const allDefs = Array.from(allSvgs).flatMap(svg => 
          Array.from(svg.querySelectorAll('defs'))
        );
        
        if (allDefs.length > 0) {
          const mainDefs = mainSvg.querySelector('defs') || mainSvg.ownerDocument!.createElementNS('http://www.w3.org/2000/svg', 'defs');
          if (!mainSvg.querySelector('defs')) {
            mainSvg.insertBefore(mainDefs, mainSvg.firstChild);
          }
          
          // 合并所有 defs 的内容
          allDefs.forEach(defs => {
            Array.from(defs.children).forEach(child => {
              if (!mainDefs.querySelector(`#${child.id}`)) {
                mainDefs.appendChild(child.cloneNode(true));
              }
            });
          });
          
          svgEl = mainSvg;
        }
      }
    }
    
    // 移除 color 属性（如果存在）
    svgEl.removeAttribute('color');
    
    // 确保 SVG 有正确的命名空间
    if (!svgEl.hasAttribute('xmlns')) {
      svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    if (!svgEl.hasAttribute('xmlns:xlink')) {
      svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    }
    
    // 确保 SVG 有正确的 fill 颜色（使用 currentColor 以继承文本颜色）
    // 如果 SVG 内部没有 fill 属性，设置默认的 fill
    const hasFill = svgEl.querySelector('[fill]') || svgEl.hasAttribute('fill');
    if (!hasFill) {
      // 检查所有子元素是否有 fill
      const allElements = svgEl.querySelectorAll('*');
      let hasAnyFill = false;
      for (const el of Array.from(allElements)) {
        if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
          hasAnyFill = true;
          break;
        }
      }
      // 如果没有找到任何 fill，为 SVG 根元素设置 fill="currentColor"
      if (!hasAnyFill) {
        svgEl.setAttribute('fill', 'currentColor');
      }
    }
    
    // 确保 SVG 有正确的样式属性，使其能够正确显示
    // 注意：颜色由外层容器统一控制，这里只设置必要的排版属性
    const existingStyle = svgEl.getAttribute('style') || '';
    const styleParts = existingStyle ? [existingStyle] : [];
    
    // 垂直对齐：确保行内公式与文字基线对齐
    if (!existingStyle.includes('vertical-align')) {
      styleParts.push('vertical-align: middle;');
    }
    // 最小尺寸：防止在某些布局下 SVG 被压缩为 0
    if (!existingStyle.includes('min-width')) {
      styleParts.push('min-width: 1px;');
    }
    if (!existingStyle.includes('min-height')) {
      styleParts.push('min-height: 1px;');
    }
    
    if (styleParts.length > 0) {
      svgEl.setAttribute('style', styleParts.join(' '));
    }
    
    const finalSVG = svgEl.outerHTML;
    const escapedLatex = latex.replace(/"/g, '&quot;');
    
    // 返回包装后的 HTML，统一在外层容器控制颜色
    // 这样 SVG 的 fill="currentColor" 可以自动继承外层容器的颜色
    if (isDisplay) {
      // 块级公式：居中显示，设置默认颜色供 currentColor 继承
      return `<section class="block-equation" data-formula="${escapedLatex}" style="text-align: center; overflow-x: auto; overflow-y: auto; display: block; color: #353535;">${finalSVG}</section>`;
    } else {
      // 行内公式：inline-block 才能正确显示 SVG，设置默认颜色供 currentColor 继承
      return `<span class="inline-equation" data-formula="${escapedLatex}" style="display: inline-block; vertical-align: middle; color: #353535;">${finalSVG}</span>`;
    }
  } catch (e) {
    console.error('LaTeX 转 SVG 失败:', e);
    return '';
  }
}

// 检查 CSS 中是否已定义代码块样式，如果没有则添加默认样式

// 处理数学公式（使用 DOMParser 解析的文档）
async function solveWeChatMathHeadless(doc: Document): Promise<void> {
  // 处理 MathJax 的 mjx-container 元素（如果已经存在）
  const mjxs = doc.getElementsByTagName('mjx-container');
  for (let i = 0; i < mjxs.length; i++) {
    const mjx = mjxs[i] as HTMLElement;
    if (!mjx.hasAttribute('jax')) {
      break;
    }

    mjx.removeAttribute('jax');
    mjx.removeAttribute('display');
    mjx.removeAttribute('tabindex');
    mjx.removeAttribute('ctxtmenu_counter');
    
    const svg = mjx.firstElementChild as SVGElement;
    if (svg && svg.tagName === 'svg') {
      const width = svg.getAttribute('width');
      const height = svg.getAttribute('height');
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      if (width) {
        svg.style.width = width;
      }
      if (height) {
        svg.style.height = height;
      }
    }
  }
  
  // 处理 KaTeX 块级公式
  const katexDisplays = doc.querySelectorAll('.katex-display');
  const displayPromises: Array<{ el: HTMLElement; promise: Promise<string> }> = [];
  
  for (const katexDisplay of Array.from(katexDisplays)) {
    const katexDisplayEl = katexDisplay as HTMLElement;
    const latex = katexDisplayEl.getAttribute('data-latex');
    
    if (latex) {
      displayPromises.push({
        el: katexDisplayEl,
        promise: convertLatexToSVGAsync(latex.trim(), true)
      });
    }
  }
  
  const displayResults = await Promise.all(
    displayPromises.map(({ promise }) => promise.catch(() => ''))
  );
  
  displayPromises.forEach(({ el }, index) => {
    const svgHTML = displayResults[index];
    if (svgHTML) {
      const tempDiv = doc.createElement('div');
      tempDiv.innerHTML = svgHTML;
      const newElement = tempDiv.firstElementChild;
      if (newElement && el.parentNode) {
        el.parentNode.replaceChild(newElement, el);
      }
    }
  });
  
  // 处理行内公式
  const katexElements = doc.querySelectorAll('.katex:not(.katex-display):not(.katex-display .katex)');
  const inlinePromises: Array<{ el: HTMLElement; promise: Promise<string> }> = [];
  
  for (const katexEl of Array.from(katexElements)) {
    const katexHtmlEl = katexEl as HTMLElement;
    const latex = katexHtmlEl.getAttribute('data-latex');
    if (latex) {
      inlinePromises.push({
        el: katexHtmlEl,
        promise: convertLatexToSVGAsync(latex, false)
      });
    }
  }
  
  const inlineResults = await Promise.all(
    inlinePromises.map(({ promise }) => promise.catch(() => ''))
  );
  
  inlinePromises.forEach(({ el }, index) => {
    const svgHTML = inlineResults[index];
    if (svgHTML) {
      const tempDiv = doc.createElement('div');
      tempDiv.innerHTML = svgHTML;
      const newElement = tempDiv.firstElementChild;
      if (newElement && el.parentNode) {
        el.parentNode.replaceChild(newElement, el);
      }
    }
  });
  
  // 处理已经存在的 block-equation 格式（不添加任何样式，完全由传入的 CSS 决定）
  // 这里只做结构处理，不修改样式
}

// 无头版本的微信HTML转换函数
export async function convertToWeChatHTMLHeadless(markdown: string, cssText: string): Promise<string> {
  if (!markdown || markdown.trim() === '') {
    console.error('Markdown 内容为空');
    return '';
  }

  // 初始化 MathJax（如果需要）
  await initMathJax();

  // 创建 markdown-it 实例（与 MarkdownEditor 中的配置保持一致）
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
  });
  // 设置 highlight 函数
  md.set({ highlight: createHighlightFunction(md) });
  md.use(markdownItMath, {
    throwOnError: false,
    errorColor: '#cc0000'
  });

  // 将 markdown 渲染为 HTML
  const htmlContent = md.render(markdown);
  
  if (!htmlContent || htmlContent.trim() === '') {
    console.error('渲染后的 HTML 为空');
    return '';
  }

  // 使用 DOMParser 解析 HTML（不依赖预览区 DOM）
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // 获取 body 内容（DOMParser 会创建完整的文档结构）
  let bodyContent = doc.body.innerHTML;
  
  // 如果 body 为空，尝试直接使用 htmlContent
  if (!bodyContent || bodyContent.trim() === '') {
    // 创建一个临时容器来解析
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    bodyContent = tempDiv.innerHTML;
  }

  // 重新解析为文档以便操作
  const workingDoc = parser.parseFromString(`<div id="markmuse" class="markdown-preview">${bodyContent}</div>`, 'text/html');
  const wrapperDiv = workingDoc.getElementById('markmuse') || workingDoc.querySelector('.markdown-preview');
  
  if (!wrapperDiv) {
    console.error('无法创建包装容器');
    return '';
  }

  // 代码块样式由主题 CSS 统一管理，不再通过 DOM 操作添加圆点

  // 处理数学公式
  await solveWeChatMathHeadless(workingDoc);

  // 移除 script 标签和其他不支持的元素
  const scripts = workingDoc.querySelectorAll('script, style, iframe, embed, object');
  scripts.forEach(el => el.remove());

  // 代码块的样式完全由传入的 CSS 决定，不添加任何硬编码样式
  // 将代码块中的普通空格转换为 &nbsp;（这是内容处理，不是样式）
  const codeElements = workingDoc.querySelectorAll('pre code, code.hljs');
  codeElements.forEach((codeEl) => {
    const htmlEl = codeEl as HTMLElement;
    
    // 将代码块中的普通空格转换为 &nbsp;
    const walker = workingDoc.createTreeWalker(
      htmlEl,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }
    
    textNodes.forEach(textNode => {
      let text = textNode.textContent || '';
      text = text.replace(/ /g, '\u00A0');
      if (text !== textNode.textContent) {
        textNode.textContent = text;
      }
    });
  });

  // 再次处理数学公式（确保所有公式都已转换）
  await solveWeChatMathHeadless(workingDoc);

  // 获取 highlight.js 的默认样式（用于代码高亮）
  // 在无头环境中，无法从 document.styleSheets 获取，使用默认样式
  const highlightJsStyles = getDefaultHighlightStyles();
  
  // 合并传入的 CSS 和 highlight.js 样式
  const fullCss = cssText + '\n' + highlightJsStyles;
  
  // 使用 juice 内联 CSS 样式
  let html = wrapperDiv.outerHTML;
  try {
    html = juice.inlineContent(html, fullCss, {
      inlinePseudoElements: true,
      preserveImportant: true,
      removeStyleTags: true,
    });
  } catch (e) {
    console.error('CSS 内联失败:', e);
  }
  
  // 创建 section 元素作为最外层容器
  const tempSectionContainer = document.createElement('div');
  tempSectionContainer.innerHTML = html;
  
  const innerContent = tempSectionContainer.querySelector('#markmuse') || tempSectionContainer.querySelector('.markdown-preview');
  if (!innerContent) {
    console.error('无法找到内联后的内容');
    return '';
  }
  
  const section = document.createElement('section');
  section.setAttribute('id', 'markmuse');
  // section 的样式完全由传入的 CSS 决定，不设置任何内联样式
  
  while (innerContent.firstChild) {
    section.appendChild(innerContent.firstChild);
  }
  
  html = section.outerHTML;
  
  // 清理所有 class 和 id 属性（除了 section 的 id 和 katex/hljs 相关的 class）
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = html;
  const finalElements = tempContainer.querySelectorAll('*');
  finalElements.forEach(el => {
    const classAttr = el.getAttribute('class');
    if (classAttr) {
      const classes = classAttr.split(' ').filter(cls => 
        cls.includes('katex') || cls.includes('hljs')
      );
      if (classes.length > 0) {
        el.setAttribute('class', classes.join(' '));
      } else {
        el.removeAttribute('class');
      }
    }
    const id = el.getAttribute('id');
    if (id && id !== 'markmuse') {
      el.removeAttribute('id');
    }
  });
  
  // 再次处理数学公式
  const finalDoc = parser.parseFromString(tempContainer.innerHTML, 'text/html');
  await solveWeChatMathHeadless(finalDoc);
  tempContainer.innerHTML = finalDoc.body.innerHTML;
  
  // 代码块样式完全由传入的 CSS 决定，不添加任何硬编码样式
  
  // 移除所有 data-tool 和 data-website 属性
  const allElementsWithDataTool = tempContainer.querySelectorAll('[data-tool]');
  allElementsWithDataTool.forEach((el) => {
    el.removeAttribute('data-tool');
  });
  const allElementsWithDataWebsite = tempContainer.querySelectorAll('[data-website]');
  allElementsWithDataWebsite.forEach((el) => {
    el.removeAttribute('data-website');
  });
  
  // 确保 section 有 id
  const finalSection = tempContainer.querySelector('section');
  if (finalSection) {
    finalSection.setAttribute('id', 'markmuse');
  }
  
  return tempContainer.innerHTML;
}

