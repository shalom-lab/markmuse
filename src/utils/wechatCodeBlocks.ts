/**
 * Add WeChat-friendly code-window chrome after Markdown/CSS conversion.
 * Real inline elements survive copy/paste better than theme pseudo-elements.
 */
export function decorateWechatCodeBlocks(html: string): string {
  if (!html || typeof document === 'undefined') return html;

  const container = document.createElement('div');
  container.innerHTML = html;

  for (const pre of Array.from(container.querySelectorAll('pre'))) {
    const originalStyle = pre.style;
    const background = originalStyle.backgroundColor || '#282c34';
    const borderRadius = originalStyle.borderRadius || '8px';

    const frame = document.createElement('section');
    frame.setAttribute('style', [
      'margin:1em 0',
      `background-color:${background}`,
      `border-radius:${borderRadius}`,
      'overflow:hidden',
    ].join(';'));

    const header = document.createElement('section');
    header.setAttribute('style', 'padding:11px 14px 0;line-height:12px;font-size:0');

    for (const color of ['#ff5f56', '#ffbd2e', '#27c93f']) {
      const dot = document.createElement('span');
      dot.setAttribute('style', [
        'display:inline-block',
        'width:12px',
        'height:12px',
        'border-radius:6px',
        `background-color:${color}`,
        'margin-right:8px',
        'font-size:0',
        'line-height:0',
        'vertical-align:top',
      ].join(';'));
      dot.innerHTML = '&nbsp;';
      header.appendChild(dot);
    }

    const scrollArea = document.createElement('section');
    scrollArea.setAttribute('style', 'overflow-x:auto;-webkit-overflow-scrolling:touch;padding:8px 14px 14px');

    originalStyle.setProperty('margin', '0');
    originalStyle.setProperty('padding', '0');
    originalStyle.setProperty('background', 'transparent');
    originalStyle.setProperty('border-radius', '0');
    originalStyle.setProperty('overflow', 'visible');
    originalStyle.setProperty('white-space', 'pre');

    const parent = pre.parentNode;
    if (!parent) continue;
    parent.insertBefore(frame, pre);
    frame.append(header, scrollArea);
    scrollArea.appendChild(pre);
  }

  return container.innerHTML;
}
