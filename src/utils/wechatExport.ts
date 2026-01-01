import juice from 'juice';

// 声明 MathJax 全局类型
declare global {
  interface Window {
    MathJax?: {
      tex?: {
        inlineMath?: string[][];
        displayMath?: string[][];
      };
      svg?: {
        fontCache?: 'none' | 'global' | 'local';
      };
      tex2svg: (tex: string, options?: any) => HTMLElement | Document;
      startup?: {
        ready: (callback: () => void) => void;
        document?: {
          state: (state: number) => void;
        };
      };
    };
  }
}

// MathJax 就绪状态缓存
let mathJaxReadyPromise: Promise<void> | null = null;
let isMathJaxReady = false;

// 初始化 MathJax（在应用启动时调用）
export function initMathJax(): Promise<void> {
  if (mathJaxReadyPromise) {
    return mathJaxReadyPromise;
  }
  
  mathJaxReadyPromise = new Promise((resolve) => {
    // 如果已经就绪，直接返回
    if (isMathJaxReady && window.MathJax && typeof window.MathJax.tex2svg === 'function') {
      resolve();
      return;
    }
    
    // 检查脚本是否已在 HTML 中加载
    if (document.querySelector('script[src*="mathjax"]')) {
      // 等待 MathJax 初始化
      const checkInterval = setInterval(() => {
        if (window.MathJax && typeof window.MathJax.tex2svg === 'function') {
          clearInterval(checkInterval);
          // 等待 startup.ready
          if (window.MathJax.startup?.ready) {
            window.MathJax.startup.ready(() => {
              isMathJaxReady = true;
              resolve();
            });
          } else {
            // 如果没有 startup.ready，等待一小段时间后标记为就绪
            setTimeout(() => {
              isMathJaxReady = true;
              resolve();
            }, 100);
          }
        }
      }, 50); // 减小检查间隔以提高响应速度
      
      setTimeout(() => {
        clearInterval(checkInterval);
        if (window.MathJax && typeof window.MathJax.tex2svg === 'function') {
          isMathJaxReady = true;
          resolve();
        } else {
          // 即使超时也标记为就绪，避免后续阻塞
          isMathJaxReady = true;
          resolve();
        }
      }, 5000);
    } else {
      // 如果 HTML 中没有脚本，等待一小段时间后标记为就绪（通常不会发生，因为已在 index.html 中加载）
      setTimeout(() => {
        isMathJaxReady = true;
        resolve();
      }, 100);
    }
  });
  
  return mathJaxReadyPromise;
}

// 等待 MathJax 准备好（快速版本，使用缓存）
async function waitForMathJax(): Promise<void> {
  if (isMathJaxReady && window.MathJax && typeof window.MathJax.tex2svg === 'function') {
    return;
  }
  
  if (mathJaxReadyPromise) {
    return mathJaxReadyPromise;
  }
  
  // 如果没有初始化过，进行初始化
  return initMathJax();
}

// 将 LaTeX 转换为 SVG（使用 CDN MathJax）
async function convertLatexToSVGAsync(latex: string, isDisplay: boolean): Promise<string> {
  try {
    // 快速检查，如果已经就绪则直接使用
    if (!isMathJaxReady) {
      await waitForMathJax();
    }
    
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
    
    // MathJax.tex2svg 返回的是 mjx-container 元素，需要从中提取 SVG
    let svgEl: SVGSVGElement | null = null;
    
    if (result instanceof Document) {
      svgEl = result.documentElement as unknown as SVGSVGElement;
    } else {
      const element = result as HTMLElement;
      svgEl = element.querySelector('svg') as SVGSVGElement;
      
      if (!svgEl) {
        console.error('在 mjx-container 中未找到 SVG');
        return '';
      }
    }
    
    if (!svgEl || svgEl.tagName !== 'svg') {
      console.error('未找到 SVG 元素');
      return '';
    }
    
    // 确保 SVG 有正确的样式属性
    const currentStyle = svgEl.getAttribute('style') || '';
    let newStyle = currentStyle.replace(/;;+/g, ';').replace(/^;|;$/g, '');
    
    if (!newStyle.includes('max-width')) {
      newStyle = newStyle ? `${newStyle}; max-width: 300% !important;` : 'max-width: 300% !important;';
    }
    
    svgEl.removeAttribute('color');
    svgEl.setAttribute('style', newStyle);
    
    const finalSVG = svgEl.outerHTML;
    const escapedLatex = latex.replace(/"/g, '&quot;');
    
    if (isDisplay) {
      return `<section class="block-equation" data-formula="${escapedLatex}" style="text-align: center; overflow-x: auto; overflow-y: auto; display: block;">${finalSVG}</section>`;
    } else {
      return `<span class="inline-equation" data-formula="${escapedLatex}">${finalSVG}</span>`;
    }
  } catch (e) {
    console.error('LaTeX 转 SVG 失败:', e);
    return '';
  }
}

// 获取 highlight.js 和 KaTeX 的样式
function getHighlightStyles(): string {
  // 尝试从页面中获取 highlight.js 和 KaTeX 的样式
  const styleSheets = Array.from(document.styleSheets);
  let highlightCss = '';
  let katexCss = '';
  
  for (const sheet of styleSheets) {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules || []);
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule) {
          const selector = rule.selectorText;
          // 匹配 highlight.js 相关的样式
          if (selector && (
            selector.includes('.hljs') || 
            selector.includes('hljs-') ||
            selector.startsWith('.hljs-')
          )) {
            highlightCss += rule.cssText + '\n';
          }
          // 匹配 KaTeX 相关的样式
          if (selector && (
            selector.includes('.katex') || 
            selector.includes('katex-') ||
            selector.startsWith('.katex-')
          )) {
            katexCss += rule.cssText + '\n';
          }
        }
      }
    } catch (e) {
      // 跨域样式表可能无法访问，忽略错误
      console.warn('无法访问样式表:', e);
    }
  }
  
  // 如果没有找到样式，使用默认的代码高亮样式
  if (!highlightCss) {
    highlightCss = `
.hljs {
  display: block;
  overflow-x: auto;
  padding: 0.5em;
  background: #1e1e1e;
  color: #d4d4d4;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.hljs-comment, .hljs-quote { color: #6a9955; }
.hljs-variable, .hljs-template-variable, .hljs-tag, .hljs-name, .hljs-selector-id, .hljs-selector-class, .hljs-regexp, .hljs-deletion { color: #f48771; }
.hljs-number, .hljs-built_in, .hljs-builtin-name, .hljs-literal, .hljs-type, .hljs-params, .hljs-meta, .hljs-link { color: #b5cea8; }
.hljs-attribute { color: #9cdcfe; }
.hljs-string, .hljs-symbol, .hljs-bullet, .hljs-addition { color: #ce9178; }
.hljs-title, .hljs-section { color: #dcdcaa; }
.hljs-keyword, .hljs-selector-tag { color: #569cd6; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: bold; }
    `.trim();
  }
  
  // 如果没有找到 KaTeX 样式，使用默认的 KaTeX 样式（简化版）
  if (!katexCss) {
    katexCss = `
.katex { font-size: 1.1em; }
.katex-display { display: block; margin: 1em 0; text-align: center; }
.katex-display > .katex { display: inline-block; text-align: initial; }
    `.trim();
  }
  
  return highlightCss + '\n' + katexCss;
}

// 处理微信公众号中的数学公式（参考 mdnice 的实现）
export async function solveWeChatMath(element: HTMLElement): Promise<void> {
  // 处理 MathJax 的 mjx-container 元素（如果已经存在）
  const mjxs = element.getElementsByTagName('mjx-container');
  for (let i = 0; i < mjxs.length; i++) {
    const mjx = mjxs[i] as HTMLElement;
    if (!mjx.hasAttribute('jax')) {
      break;
    }

    // 移除 MathJax 的属性
    mjx.removeAttribute('jax');
    mjx.removeAttribute('display');
    mjx.removeAttribute('tabindex');
    mjx.removeAttribute('ctxtmenu_counter');
    
    // 处理 SVG 元素
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
  
  // 处理 KaTeX 元素：转换为 SVG（并行处理以提高性能）
  const katexDisplays = element.querySelectorAll('.katex-display');
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
  
  // 并行转换所有块级公式
  const displayResults = await Promise.all(
    displayPromises.map(({ promise }) => promise.catch(() => ''))
  );
  
  // 应用转换结果
  displayPromises.forEach(({ el }, index) => {
    const svgHTML = displayResults[index];
    if (svgHTML) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgHTML;
      const newElement = tempDiv.firstElementChild;
      if (newElement && el.parentNode) {
        el.parentNode.replaceChild(newElement, el);
      }
    }
  });
  
  // 处理行内公式（并行处理）
  const katexElements = element.querySelectorAll('.katex:not(.katex-display):not(.katex-display .katex)');
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
  
  // 并行转换所有行内公式
  const inlineResults = await Promise.all(
    inlinePromises.map(({ promise }) => promise.catch(() => ''))
  );
  
  // 应用转换结果
  inlinePromises.forEach(({ el }, index) => {
    const svgHTML = inlineResults[index];
    if (svgHTML) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgHTML;
      const newElement = tempDiv.firstElementChild;
      if (newElement && el.parentNode) {
        el.parentNode.replaceChild(newElement, el);
      }
    }
  });
  
  // 处理已经存在的 block-equation 格式
  const blockEquations = element.querySelectorAll('.block-equation, section.block-equation');
  blockEquations.forEach((blockEl) => {
    const svgElements = blockEl.querySelectorAll('svg');
    svgElements.forEach((svg) => {
      const currentStyle = svg.getAttribute('style') || '';
      if (!currentStyle.includes('max-width')) {
        svg.setAttribute('style', `${currentStyle}; max-width: 300% !important;`.replace(/^; /, ''));
      }
    });
  });
}

// 从预览区域获取HTML内容（参考mdnice的实现）
export async function convertToWeChatHTML(previewElement: HTMLElement | null, cssText: string): Promise<string> {
  if (!previewElement) {
    console.error('预览元素为空');
    return '';
  }

  // 获取预览区域的HTML内容
  let htmlContent = previewElement.innerHTML;
  
  // 如果预览区域为空，尝试从子元素获取
  if (!htmlContent || htmlContent.trim() === '') {
    console.warn('预览内容为空，尝试查找子元素');
    const children = Array.from(previewElement.children);
    if (children.length > 0) {
      htmlContent = Array.from(children).map(child => child.outerHTML).join('');
    }
  }
  
  if (!htmlContent || htmlContent.trim() === '') {
    console.error('无法获取预览内容');
    return '';
  }
  
  // 创建一个临时容器
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // 不再添加 data-tool 属性（用户不需要）
  
  // 为代码块添加 macOS 风格的三个彩色圆点（微信公众号不支持伪元素）
  const preElements = tempDiv.querySelectorAll('pre');
  preElements.forEach((pre) => {
    const preEl = pre as HTMLElement;
    // 检查是否已经有圆点元素
    if (!preEl.querySelector('.mac-dots')) {
      // 创建圆点容器
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'mac-dots';
      dotsContainer.setAttribute('style', 'position: absolute; top: 12px; left: 12px; display: flex; gap: 8px; z-index: 1;');
      
      // 创建三个彩色圆点
      const dot1 = document.createElement('span');
      dot1.setAttribute('style', 'width: 12px; height: 12px; border-radius: 50%; background-color: #ff5f56; display: inline-block;');
      
      const dot2 = document.createElement('span');
      dot2.setAttribute('style', 'width: 12px; height: 12px; border-radius: 50%; background-color: #ffbd2e; display: inline-block;');
      
      const dot3 = document.createElement('span');
      dot3.setAttribute('style', 'width: 12px; height: 12px; border-radius: 50%; background-color: #27c93f; display: inline-block;');
      
      dotsContainer.appendChild(dot1);
      dotsContainer.appendChild(dot2);
      dotsContainer.appendChild(dot3);
      
      // 确保 pre 元素有 position: relative
      const currentStyle = preEl.getAttribute('style') || '';
      if (!currentStyle.includes('position')) {
        preEl.setAttribute('style', `position: relative; ${currentStyle}`);
      }
      
      // 将圆点插入到 pre 元素的开头
      preEl.insertBefore(dotsContainer, preEl.firstChild);
    }
  });
  
  // 处理数学公式（在移除脚本之前处理）
  await solveWeChatMath(tempDiv);
  
  // 移除script标签和其他不支持的元素
  const scripts = tempDiv.querySelectorAll('script, style, iframe, embed, object');
  scripts.forEach(el => el.remove());
  
  // 创建一个包装 div，添加 markmuse id，这样 juice 才能匹配 CSS 选择器
  const wrapperDiv = document.createElement('div');
  wrapperDiv.id = 'markmuse';
  wrapperDiv.className = 'markdown-preview'; // 保留类名以兼容
  
  // 将内容移动到包装 div 中
  while (tempDiv.firstChild) {
    wrapperDiv.appendChild(tempDiv.firstChild);
  }
  
  // 如果包装 div 没有内容，直接返回空
  if (!wrapperDiv.innerHTML || wrapperDiv.innerHTML.trim() === '') {
    console.error('内容为空');
    return '';
  }
  
  // 确保代码块中的空格被保留（在 juice 处理前）
  // 将代码块中的普通空格转换为 &nbsp; 以确保微信中正确显示
  const codeElements = wrapperDiv.querySelectorAll('pre code, code.hljs');
  codeElements.forEach((codeEl) => {
    const htmlEl = codeEl as HTMLElement;
    // 确保 white-space 样式被设置
    if (!htmlEl.getAttribute('style') || !htmlEl.getAttribute('style')?.includes('white-space')) {
      const currentStyle = htmlEl.getAttribute('style') || '';
      htmlEl.setAttribute('style', `${currentStyle}; white-space: pre-wrap; word-wrap: break-word;`.replace(/^; /, ''));
    }
    
    // 遍历所有文本节点，将普通空格转换为 &nbsp;
    // 这样可以确保在微信中空格被正确保留
    const walker = document.createTreeWalker(
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
      // 将普通空格（U+0020）转换为 &nbsp;，但保留换行符和制表符
      // 注意：只替换单个空格，连续的多个空格保留第一个为普通空格以支持换行
      let text = textNode.textContent || '';
      // 将单个空格转换为 &nbsp;，但不在行首和行尾
      // 更简单的方法：将所有空格都转换为 &nbsp;
      text = text.replace(/ /g, '\u00A0'); // \u00A0 是 &nbsp; 的 Unicode 码点
      if (text !== textNode.textContent) {
        textNode.textContent = text;
      }
    });
  });
  
  // 确保 pre 元素也有 white-space 样式
  const preElementsForSpace = wrapperDiv.querySelectorAll('pre');
  preElementsForSpace.forEach((preEl) => {
    const htmlEl = preEl as HTMLElement;
    const currentStyle = htmlEl.getAttribute('style') || '';
    if (!currentStyle.includes('white-space')) {
      htmlEl.setAttribute('style', `${currentStyle}; white-space: pre-wrap; word-wrap: break-word;`.replace(/^; /, ''));
    }
  });
  
  await solveWeChatMath(wrapperDiv);
  
  // 获取 highlight.js 的样式并合并到 CSS 中
  const highlightStyles = getHighlightStyles();
  const fullCss = cssText + '\n' + highlightStyles + '\n' + `
pre, pre code, code.hljs, .hljs {
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
}
.katex {
  font-size: 1.1em !important;
}
.katex-display {
  display: block !important;
  margin: 1em 0 !important;
  text-align: center !important;
}
.katex-display > .katex {
  display: inline-block !important;
  text-align: initial !important;
}
.katex svg {
  display: inline-block !important;
  vertical-align: middle !important;
  max-width: 100% !important;
  height: auto !important;
}
  `.trim();
  
  // 使用 juice 内联 CSS 样式（在包装 div 上）
  let html = wrapperDiv.outerHTML;
  try {
    html = juice.inlineContent(html, fullCss, {
      inlinePseudoElements: true,
      preserveImportant: true,
      removeStyleTags: true,
    });
  } catch (e) {
    console.error('CSS 内联失败:', e);
    // 即使内联失败，也返回HTML
  }
  
  // 现在创建 section 元素作为最外层容器
  const tempSectionContainer = document.createElement('div');
  tempSectionContainer.innerHTML = html;
  
  // 获取内联样式后的内容（去掉包装 div）
  const innerContent = tempSectionContainer.querySelector('#markmuse') || tempSectionContainer.querySelector('.markdown-preview');
  if (!innerContent) {
    console.error('无法找到内联后的内容');
    return '';
  }
  
  // 创建section元素作为最外层容器
  const section = document.createElement('section');
  section.setAttribute('id', 'nice');
  
  // 将内联样式后的内容移动到 section 中（保留内联样式）
  while (innerContent.firstChild) {
    section.appendChild(innerContent.firstChild);
  }
  
  // 将 .markdown-preview 的样式应用到 section
  const computedStyle = window.getComputedStyle(previewElement);
  let sectionStyle: string[] = [];
  
  // 提取 .markdown-preview 的样式并应用到 section
  const styleProps = ['font-family', 'font-size', 'line-height', 'color', 'background-color', 
    'margin', 'padding', 'text-align', 'word-break', 'overflow-wrap', 'letter-spacing', 'word-spacing'];
  
  styleProps.forEach(prop => {
    const value = computedStyle.getPropertyValue(prop);
    if (value) {
      sectionStyle.push(`${prop}: ${value}`);
    }
  });
  
  // 确保 color 是黑色（SVG 的 currentColor 需要明确的颜色值）
  const hasColor = sectionStyle.some(s => s.startsWith('color:'));
  if (!hasColor) {
    sectionStyle.push('color: rgb(0, 0, 0)');
  } else {
    // 如果已有 color，确保是黑色（替换为黑色以保证 SVG 显示）
    sectionStyle = sectionStyle.map(s => s.startsWith('color:') ? 'color: rgb(0, 0, 0)' : s);
  }
  
  // 添加默认样式以确保兼容性
  if (sectionStyle.length === 0) {
    sectionStyle.push(
      'margin-top: 0px',
      'margin-bottom: 0px',
      'margin-left: 0px',
      'margin-right: 0px',
      'padding-top: 0px',
      'padding-bottom: 0px',
      'padding-left: 10px',
      'padding-right: 10px',
      'background-attachment: scroll',
      'background-clip: padding-box',
      'background-color: rgba(255, 255, 255, 0)',
      'background-image: none',
      'background-origin: padding-box',
      'background-position-x: 0%',
      'background-position-y: 0%',
      'background-repeat: no-repeat',
      'background-size: auto',
      'width: auto',
      'font-family: Optima, "Microsoft YaHei", PingFangSC-regular, serif',
      'font-size: 16px',
      'color: rgb(0, 0, 0)',
      'line-height: 1.5em',
      'word-spacing: 0em',
      'letter-spacing: 0em',
      'word-break: break-word',
      'overflow-wrap: break-word',
      'text-align: left'
    );
  }
  
  section.setAttribute('style', sectionStyle.join('; '));
  
  html = section.outerHTML;
  
  // 清理所有class和id属性（除了section的id和katex相关的class）
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = html;
  const finalElements = tempContainer.querySelectorAll('*');
  finalElements.forEach(el => {
    const classAttr = el.getAttribute('class');
    // 保留 katex 相关的 class，移除其他 class
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
    if (id && id !== 'nice') {
      el.removeAttribute('id');
    }
  });
  
  await solveWeChatMath(tempContainer);
  
  // 确保代码块中的空格样式被保留
  const finalCodeElements = tempContainer.querySelectorAll('pre, code');
  finalCodeElements.forEach((codeEl) => {
    const htmlEl = codeEl as HTMLElement;
    const currentStyle = htmlEl.getAttribute('style') || '';
    if (!currentStyle.includes('white-space')) {
      htmlEl.setAttribute('style', `${currentStyle}; white-space: pre-wrap; word-wrap: break-word;`.replace(/^; /, ''));
    } else if (!currentStyle.includes('pre-wrap')) {
      htmlEl.setAttribute('style', currentStyle.replace(/white-space:\s*[^;]+/gi, 'white-space: pre-wrap') + '; word-wrap: break-word;');
    }
  });
  
  // 移除所有 data-tool 和 data-website 属性
  const allElementsWithDataTool = tempContainer.querySelectorAll('[data-tool]');
  allElementsWithDataTool.forEach((el) => {
    el.removeAttribute('data-tool');
  });
  const allElementsWithDataWebsite = tempContainer.querySelectorAll('[data-website]');
  allElementsWithDataWebsite.forEach((el) => {
    el.removeAttribute('data-website');
  });
  
  // 确保section有id
  const finalSection = tempContainer.querySelector('section');
  if (finalSection) {
    finalSection.setAttribute('id', 'nice');
  }
  
  return tempContainer.innerHTML;
}

// 复制HTML到剪贴板（参考mdnice的copySafari方法）
export function copySafari(html: string): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;
    
    // 获取或创建 input 元素
    let input = document.getElementById('copy-input') as HTMLInputElement;
    if (!input) {
      input = document.createElement('input');
      input.id = 'copy-input';
      input.style.position = 'absolute';
      input.style.left = '-1000px';
      input.style.zIndex = '-1000';
      document.body.appendChild(input);
    }
    
    // 让 input 选中一个字符
    input.value = 'NOTHING';
    input.setSelectionRange(0, 1);
    input.focus();
    
    // 复制触发
    const copyHandler = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/html', html);
        e.clipboardData.setData('text/plain', html);
      }
      document.removeEventListener('copy', copyHandler);
      if (!resolved) {
        resolved = true;
        resolve(true);
      }
    };
    
    document.addEventListener('copy', copyHandler);
    
    try {
      const success = document.execCommand('copy');
      if (!success && !resolved) {
        // 如果 execCommand 失败，等待一下再尝试 Clipboard API
        setTimeout(() => {
          if (navigator.clipboard && !resolved) {
            // 使用 Clipboard API 作为备选方案
            const textArea = document.createElement('textarea');
            textArea.value = html;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
              document.execCommand('copy');
              document.body.removeChild(textArea);
              if (!resolved) {
                resolved = true;
                resolve(true);
              }
            } catch (err) {
              document.body.removeChild(textArea);
              if (!resolved) {
                resolved = true;
                resolve(false);
              }
            }
          } else if (!resolved) {
            resolved = true;
            resolve(false);
          }
        }, 100);
      }
    } catch (err) {
      console.error('复制失败:', err);
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }
  });
}

// 复制到剪贴板（兼容方法）
export async function copyToClipboard(html: string): Promise<boolean> {
  // 优先使用 copySafari 方法（支持富文本）
  try {
    return await copySafari(html);
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
}

