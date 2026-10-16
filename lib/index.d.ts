/** Convert Markdown to WeChat HTML using custom CSS (browser environment). */
export declare function convert(markdown: string, cssText: string): Promise<string>;

/** Convert Markdown to WeChat HTML using the built-in theme (browser environment). */
export declare function convertDefault(markdown: string, customCss?: string): Promise<string>;
