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
    import("@shikijs/themes/laserwave"),
    // ..
  ],
  langs: [
    import("@shikijs/langs/typescript"),
    import("@shikijs/langs/javascript"),
    import("@shikijs/langs/jsx"),
    import("@shikijs/langs/tsx"),
    import("@shikijs/langs/dart"),
    import("@shikijs/langs/python"),
    // ..
  ],
  engine: createJavaScriptRegexEngine(),
});

export async function highlightCode(code: string, lang: string) {
  const highlighter = await highlighterPromise;
  const html = highlighter.codeToHtml(code, {
    lang,
    theme: "laserwave",
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
