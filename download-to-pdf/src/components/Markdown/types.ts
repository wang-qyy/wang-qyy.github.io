import type { HLJSApi, LanguageFn } from 'highlight.js';
import type {
  Options as MarkdownItOptions,
  PluginWithParams
} from 'markdown-it';

export interface MarkdownProps {
  code: string;

  options?: MarkdownItOptions;
  highlight?: HighlightOptions;

  plugins?: [PluginWithParams, ...params: any[]][];
}

export interface HighlightOptions {
  /**
   * Whether to automatically detect language if not specified.
   */
  auto?: boolean;

  /**
   * Whether to add the `hljs` class to raw code blocks (not fenced blocks).
   */
  code?: boolean;

  /**
   * Register other languages which are not included in the standard pack.
   */
  register?: {
    [lang: string]: LanguageFn;
  };

  /**
   * Whether to highlight inline code.
   */
  inline?: boolean;

  /**
   * Provide the instance of highlight.js to use for highlighting
   */
  hljs?: HLJSApi;

  /**
   * Forces highlighting to finish even in case of detecting illegal syntax for
   * the language instead of throwing an exception.
   */
  ignoreIllegals?: boolean;
}
