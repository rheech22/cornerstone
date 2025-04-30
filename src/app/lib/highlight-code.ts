import {
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerNotationDiff,
  transformerNotationFocus,
} from "@shikijs/transformers";

import MarkdownItAsync from "markdown-it-async";

import {
  type HighlighterGeneric,
  type BundledLanguage,
  type BundledTheme,
  createHighlighter,
} from "shiki";

const highlighter = await createHighlighter({
  themes: [
    "github-light-high-contrast",
    // ..
  ],
  langs: [
    "typescript",
    "javascript",
    "jsx",
    "tsx",
    "dart",
    "python",
    "lua",
    "shellscript",
    "html",
    "md",
    "json",
    "yaml",
    "xml",
    // ..
  ],
});

const highlightBy =
  (highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>) =>
  async (code: string, lang: string) => {
    return highlighter.codeToHtml(code, {
      lang,
      theme: "github-light-high-contrast",
      transformers: [
        transformerNotationHighlight({
          matchAlgorithm: "v3",
        }),
        transformerNotationWordHighlight({
          matchAlgorithm: "v3",
        }),
        transformerNotationDiff({
          matchAlgorithm: "v3",
        }),
        transformerNotationFocus({
          matchAlgorithm: "v3",
        }),
      ],
    });
  };

export const highlightCode = highlightBy(highlighter);

const md = MarkdownItAsync({
  highlight: highlightCode,
});

export const highlightMarkdown = async (code: string) => md.renderAsync(code);
