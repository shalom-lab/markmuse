import DOMPurify from 'dompurify';

export function sanitizePreview(html: string): DocumentFragment {
  return DOMPurify.sanitize(html, {
    RETURN_DOM_FRAGMENT: true,
    USE_PROFILES: { html: true, svg: true, mathMl: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'foreignObject'],
    SANITIZE_NAMED_PROPS: true,
  });
}
