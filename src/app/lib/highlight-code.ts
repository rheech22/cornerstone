import {
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerNotationDiff,
  transformerNotationFocus,
} from "@shikijs/transformers";

import {
  type HighlighterGeneric,
  type BundledLanguage,
  type BundledTheme,
  createHighlighter,
} from "shiki";

const highlighterPromise = createHighlighter({
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

export const highlightCode = highlightBy(await highlighterPromise);
