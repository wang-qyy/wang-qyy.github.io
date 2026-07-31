import Markdownit from 'markdown-it';

import type { MarkdownProps } from './types.ts';
import highlightPlugin from './highlight.ts';
function fixTableSeparator(content: string) {
  const regex = /\|[-]+\|\|\n/g;
  return content.replace(regex, '|---|----|\n');
}
export function markdownInstance(config: Partial<MarkdownProps>) {
  const md = new Markdownit();

  md.use(highlightPlugin, config.highlight);

  if (config.options) {
    md.set(config.options);
  }

  if (config.plugins?.length) {
    config.plugins.forEach(([plugin, ...args]) => {
      md.use(plugin, ...args);
    });
  }

  return {
    instance: md,
    toHtml(content: string) {
      return md.render(fixTableSeparator(content));
    }
  };
}
