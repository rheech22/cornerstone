import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

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
    decorations: [
      {
        start: 0,
        end: 24,
        properties: { class: "highlighted-word" },
      },
      {
        start: 0,
        end: 24,
        properties: { class: "highlighted-word" },
      },
      {
        start: 0,
        end: 24,
        properties: { class: "highlighted-word" },
      },
    ],
  });
  return html;
}
