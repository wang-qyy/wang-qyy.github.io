import MarkdownIt, { type Options as MarkdownItOptions } from 'markdown-it';

import type Renderer from 'markdown-it/lib/renderer.d.mts';
import type { RenderRule } from 'markdown-it/lib/renderer.d.mts';
import type StateCore from 'markdown-it/lib/rules_core/state_core.d.mts';
import type Token from 'markdown-it/lib/token.d.mts';

import type { HLJSApi, LanguageFn } from 'highlight.js';
import hljs from 'highlight.js';

import type { HighlightOptions } from './types';

// Allow registration of other languages.
function registerLangs(
  hljs: HLJSApi,
  register: { [lang: string]: LanguageFn }
): void {
  for (const [lang, fn] of Object.entries(register)) {
    hljs.registerLanguage(lang, fn);
  }
}

// Highlight with given language.
function highlight(
  md: MarkdownIt,
  hljs: HLJSApi,
  ignoreIllegals: boolean,
  code: string,
  lang: string
): string {
  try {
    return hljs.highlight(code, {
      language: lang !== '' ? lang : 'plaintext',
      ignoreIllegals
    }).value;
  } catch (e) {
    return md.utils.escapeHtml(code);
  }
}

// Highlight with given language or automatically.
function highlightAuto(
  md: MarkdownIt,
  hljs: HLJSApi,
  ignoreIllegals: boolean,
  code: string,
  lang: string
): string {
  if (lang !== '') {
    return highlight(md, hljs, ignoreIllegals, code, lang);
  }

  try {
    return hljs.highlightAuto(code).value;
  } catch (e) {
    return md.utils.escapeHtml(code);
  }
}

// Wrap a render function to add `hljs` class to code blocks.
function wrapCodeRenderer(
  renderer: RenderRule,
  _opts: HighlightOptions
): RenderRule {
  return function wrappedRenderer(...args) {
    let res = renderer(...args);

    const [tokens, idx] = args;
    const currToken = tokens[idx];

    if (currToken.tag !== 'code') {
      return res;
    }

    if (res.indexOf('<code class="hljs') === -1) {
      res = res
        .replace('<code class="', '<code class="hljs ')
        .replace('<code>', '<code class="hljs">');
    }

    if (currToken.type !== 'code_inline') {
      res = getCopyHtml(res);
    }

    return res;
  };
}

function getCopyHtml(res: string) {
  return `<div class="mycss-copycode-box cssprx-relative">${res}</div>`;
}

function inlineCodeLanguageRule(state: StateCore): void {
  for (const parentToken of state.tokens) {
    if (parentToken.type !== 'inline') {
      continue;
    }

    if (parentToken.children == null) {
      continue;
    }

    for (const [i, token] of parentToken.children.entries()) {
      if (token.type !== 'code_inline') {
        continue;
      }

      const next = parentToken.children[i + 1];

      if (next == null) {
        continue;
      }

      const match = /^{:?\.([^}]+)}/.exec(next.content);

      if (match == null) {
        continue;
      }

      const lang = match[1];

      // Remove the language specification from text following the code.
      next.content = next.content.slice(match[0].length);

      let className = token.attrGet('class') ?? '';

      className += `${state.md.options.langPrefix ?? 'language-'}${lang}`;

      token.attrSet('class', className);
      token.meta = { ...token.meta, highlightLanguage: lang };
    }
  }
}

function inlineCodeRenderer(
  tokens: Token[],
  idx: number,
  options: MarkdownItOptions,
  _env: any,
  slf: Renderer
): string {
  const token = tokens[idx];

  // Make TypeScript happy...
  if (options.highlight == null) {
    throw new Error(
      '`options.highlight` was null, this is not supposed to happen'
    );
  }

  const highlighted = options.highlight(
    token.content,
    token.meta?.highlightLanguage ?? '',
    ''
  );

  return `<code${slf.renderAttrs(
    token
  )} data-inline-code="">${highlighted}</code>`;
}

function core(md: MarkdownIt, opts?: HighlightOptions): void {
  const optsWithDefaults = { ...core.defaults, ...opts };

  if (optsWithDefaults.hljs == null) {
    throw new Error(
      'Please pass a highlight.js instance for the required `hljs` option.'
    );
  }

  if (optsWithDefaults.register != null) {
    registerLangs(optsWithDefaults.hljs, optsWithDefaults.register);
  }

  md.options.highlight = (
    optsWithDefaults.auto ? highlightAuto : highlight
  ).bind(null, md, optsWithDefaults.hljs, optsWithDefaults.ignoreIllegals);

  if (md.renderer.rules.fence != null) {
    md.renderer.rules.fence = wrapCodeRenderer(
      md.renderer.rules.fence,
      optsWithDefaults
    );
  }

  if (optsWithDefaults.code && md.renderer.rules.code_block != null) {
    md.renderer.rules.code_block = wrapCodeRenderer(
      md.renderer.rules.code_block,
      optsWithDefaults
    );
  }

  if (optsWithDefaults.inline) {
    md.core.ruler.before(
      'linkify',
      'inline_code_language',
      inlineCodeLanguageRule
    );

    md.renderer.rules.code_inline = wrapCodeRenderer(
      inlineCodeRenderer,
      optsWithDefaults
    );
  }
}

core.defaults = {
  auto: false,
  code: false,
  inline: false,
  ignoreIllegals: false
};

export default function highlightjs(
  md: MarkdownIt,
  opts?: HighlightOptions
): void {
  opts = { ...highlightjs.defaults, ...opts };

  if (opts.hljs == null) {
    opts.hljs = hljs;
  }

  return core(md, opts);
}

highlightjs.defaults = {
  auto: true,
  code: true,
  inline: false,
  ignoreIllegals: true
};
