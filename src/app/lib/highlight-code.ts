import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import {
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerNotationDiff,
  transformerNotationFocus,
} from "@shikijs/transformers";

const highlighterPromise = createHighlighterCore({
  themes: [
    import("@shikijs/themes/github-light-high-contrast"),
    // ..
  ],
  langs: [
    import("@shikijs/langs/typescript"),
    import("@shikijs/langs/javascript"),
    import("@shikijs/langs/jsx"),
    import("@shikijs/langs/tsx"),
    import("@shikijs/langs/dart"),
    import("@shikijs/langs/python"),
    import("@shikijs/langs/lua"),
    // ..
  ],
  engine: createJavaScriptRegexEngine(),
});

export async function highlightCode(code: string, lang: string) {
  const highlighter = await highlighterPromise;
  const html = highlighter.codeToHtml(code, {
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
  return html;
}
