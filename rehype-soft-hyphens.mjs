const SKIP_TAGS = new Set(["code", "pre", "kbd", "samp", "script", "style", "svg", "math"]);
const SOFT_HYPHEN = "­";
const MIN_FRAGMENT = 3;

// camelCase 단어(WebKit, WKWebView 등)는 브라우저 하이픈 사전에 없어 줄 끝에서 끊기지 않으므로
// 대소문자 경계에 soft hyphen을 넣어 양끝 정렬 시 단어 간격이 벌어지지 않게 한다.
const hyphenateWord = (word) => {
  let result = "";
  let last = 0;

  for (let i = MIN_FRAGMENT; i <= word.length - MIN_FRAGMENT; i++) {
    const prev = word[i - 1];
    const current = word[i];
    const next = word[i + 1];
    const isBoundary =
      (/[a-z]/.test(prev) && /[A-Z]/.test(current)) ||
      (/[A-Z]/.test(prev) && /[A-Z]/.test(current) && /[a-z]/.test(next ?? ""));

    if (!isBoundary) continue;

    result += word.slice(last, i) + SOFT_HYPHEN;
    last = i;
  }

  return result + word.slice(last);
};

const walk = (node) => {
  if (node.type === "text") {
    node.value = node.value.replace(/[A-Za-z]{6,}/g, hyphenateWord);
    return;
  }

  if (node.type === "element" && SKIP_TAGS.has(node.tagName)) return;

  node.children?.forEach(walk);
};

export default function rehypeSoftHyphens() {
  return (tree) => walk(tree);
}
