/* Process inline math */
/*
参考 mdnice 项目的实现，自定义 markdown-it 数学公式插件
使用 KaTeX 进行公式渲染
*/

import katex from 'katex';
import MarkdownIt from 'markdown-it';

// 测试分隔符是否有效
// 假设在 state.src[pos] 位置有一个 "$"
function isValidDelim(state: any, pos: number) {
  let prevChar: number, nextChar: number;
  const max = state.posMax;
  let can_open = true;
  let can_close = true;

  prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
  nextChar = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1;

  // 检查非空白字符条件，以及关闭分隔符后不能跟数字
  if (
    prevChar === 0x20 /* " " */ ||
    prevChar === 0x09 /* \t */ ||
    (nextChar >= 0x30 /* "0" */ && nextChar <= 0x39) /* "9" */
  ) {
    can_close = false;
  }
  if (nextChar === 0x20 /* " " */ || nextChar === 0x09 /* \t */) {
    can_open = false;
  }

  return {
    can_open: can_open,
    can_close: can_close,
  };
}

function math_inline(state: any, silent: boolean) {
  let start: number, match: number, token: any, res: any, pos: number;

  if (state.src[state.pos] !== '$') {
    return false;
  }

  res = isValidDelim(state, state.pos);
  if (!res.can_open) {
    if (!silent) {
      state.pending += '$';
    }
    state.pos += 1;
    return true;
  }

  // 首先检查并绕过所有正确转义的分隔符
  start = state.pos + 1;
  match = start;
  while ((match = state.src.indexOf('$', match)) !== -1) {
    // 找到潜在的 $，查找转义符，pos 将指向第一个非转义符
    pos = match - 1;
    while (state.src[pos] === '\\') {
      pos -= 1;
    }

    // 偶数个转义符，找到潜在的关闭分隔符
    if ((match - pos) % 2 == 1) {
      break;
    }
    match += 1;
  }

  // 没有找到关闭分隔符。消耗 $ 并继续。
  if (match === -1) {
    if (!silent) {
      state.pending += '$';
    }
    state.pos = start;
    return true;
  }

  // 检查是否为空内容，即：$$。不解析。
  if (match - start === 0) {
    if (!silent) {
      state.pending += '$$';
    }
    state.pos = start + 1;
    return true;
  }

  // 检查有效的关闭分隔符
  res = isValidDelim(state, match);
  if (!res.can_close) {
    if (!silent) {
      state.pending += '$';
    }
    state.pos = start;
    return true;
  }

  if (!silent) {
    token = state.push('math_inline', 'math', 0);
    token.markup = '$';
    token.content = state.src.slice(start, match);
  }

  state.pos = match + 1;
  return true;
}

function math_block(state: any, start: number, end: number, silent: boolean) {
  let firstLine: string;
  let lastLine: string = '';
  let next: number;
  let lastPos: number;
  let found = false;
  let token: any;
  let pos = state.bMarks[start] + state.tShift[start];
  let max = state.eMarks[start];

  if (pos + 2 > max) {
    return false;
  }
  if (state.src.slice(pos, pos + 2) !== '$$') {
    return false;
  }

  pos += 2;
  firstLine = state.src.slice(pos, max);

  if (silent) {
    return true;
  }
  if (firstLine.trim().slice(-2) === '$$') {
    // 单行表达式
    firstLine = firstLine.trim().slice(0, -2);
    found = true;
  }

  for (next = start; !found; ) {
    next++;

    if (next >= end) {
      break;
    }

    pos = state.bMarks[next] + state.tShift[next];
    max = state.eMarks[next];

    if (pos < max && state.tShift[next] < state.blkIndent) {
      // 带负缩进的非空行应该停止列表：
      break;
    }

    if (
      state.src
        .slice(pos, max)
        .trim()
        .slice(-2) === '$$'
    ) {
      lastPos = state.src.slice(0, max).lastIndexOf('$$');
      lastLine = state.src.slice(pos, lastPos);
      found = true;
    }
  }

  state.line = next + 1;

  token = state.push('math_block', 'math', 0);
  token.block = true;
  token.content =
    (firstLine && firstLine.trim() ? firstLine + '\n' : '') +
    state.getLines(start + 1, next, state.tShift[start], true) +
    (lastLine && lastLine.trim() ? lastLine : '');
  token.map = [start, state.line];
  token.markup = '$$';
  return true;
}

export default function markdownItMath(md: MarkdownIt, options: any = {}) {
  // 默认选项
  const opts = {
    throwOnError: false,
    errorColor: '#cc0000',
    ...options,
  };

  // 设置 KaTeX 作为渲染器
  // 注意：添加 data-latex 属性保存原始 LaTeX 代码，用于导出时转换为 SVG
  const katexInline = function (latex: string) {
    try {
      const html = katex.renderToString(latex, {
        throwOnError: opts.throwOnError,
        errorColor: opts.errorColor,
        displayMode: false,
      });
      // 添加 data-latex 属性
      const escapedLatex = md.utils.escapeHtml(latex);
      return html.replace(/<span class="katex"/, `<span class="katex" data-latex="${escapedLatex}"`);
    } catch (error: any) {
      if (opts.throwOnError) {
        console.error('KaTeX 渲染错误:', error);
      }
      return `<span style="color: ${opts.errorColor}">${md.utils.escapeHtml(latex)}</span>`;
    }
  };

  const inlineRenderer = function (tokens: any[], idx: number) {
    return katexInline(tokens[idx].content);
  };

  const katexBlock = function (latex: string) {
    try {
      const html = katex.renderToString(latex, {
        throwOnError: opts.throwOnError,
        errorColor: opts.errorColor,
        displayMode: true,
      });
      // 添加 data-latex 属性（找到第一个 katex 或 katex-display 元素）
      const escapedLatex = md.utils.escapeHtml(latex);
      return html.replace(/<span class="(katex|katex-display)"/, `<span class="$1" data-latex="${escapedLatex}"`);
    } catch (error: any) {
      if (opts.throwOnError) {
        console.error('KaTeX 渲染错误:', error);
      }
      return `<div style="color: ${opts.errorColor}">${md.utils.escapeHtml(latex)}</div>`;
    }
  };

  const blockRenderer = function (tokens: any[], idx: number) {
    return katexBlock(tokens[idx].content) + '\n';
  };

  // 注册规则
  md.inline.ruler.after('escape', 'math_inline', math_inline);
  md.block.ruler.after('blockquote', 'math_block', math_block, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  });
  
  // 注册渲染器
  md.renderer.rules.math_inline = inlineRenderer;
  md.renderer.rules.math_block = blockRenderer;
}

