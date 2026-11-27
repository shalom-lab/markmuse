import MarkdownIt from 'markdown-it';
import markdownItMath from './markdown-it-math';
import { createHighlightFunction } from './highlight';

export function createPreviewRenderer() {
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: true });
  md.set({ highlight: createHighlightFunction(md) });
  return md.use(markdownItMath, { throwOnError: false, errorColor: '#cc0000' });
}
