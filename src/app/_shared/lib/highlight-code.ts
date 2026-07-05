import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import MarkdownItAsync from "markdown-it-async";
import {
  type BundledLanguage,
  type BundledTheme,
  createHighlighter,
  type HighlighterGeneric,
} from "shiki";

const highlighter = await createHighlighter({
  themes: [
    "github-light-high-contrast",
    "github-dark-high-contrast",
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
      const base = (lang ?? "").trim().match(/^[a-zA-Z0-9_-]+/)?.[0] ?? "";

      const options = (resolved: string) => ({
        lang: resolved,
        themes: {
          light: "github-light-high-contrast",
          dark: "github-dark-high-contrast",
        },
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

      try {
        return highlighter.codeToHtml(code, options(base || "text"));
      } catch {
        return highlighter.codeToHtml(code, options("text"));
      }
    };

export const highlightCode = highlightBy(highlighter);

const md = MarkdownItAsync({
  highlight: highlightCode,
});

export const highlightMarkdown = async (code: string) => md.renderAsync(code);
