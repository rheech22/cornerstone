import { visit } from "unist-util-visit";

const parseWikiTarget = (value) => {
  const trimmed = value.trim();
  const match = trimmed.match(/^(blog|note):(.*)$/);

  if (match) return { type: match[1], slug: match[2].trim() };

  const normalized = trimmed.replace(/^\.\//, "");
  const routeMatch = normalized.match(/^(?:\.\.\/)?(blog|note)\/(.*)$/);

  if (routeMatch) return { type: routeMatch[1], slug: routeMatch[2].trim() };

  return { type: "note", slug: normalized };
};

export default function rehypeVimwikiLinks() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent) return;

      if (parent.tagName === "a") return;

      const matches = node.value.match(/\[\[(.*?)\]\]/g);

      if (!matches) return;

      let lastIndex = 0;
      const children = [];

      matches.forEach((match) => {
        const startIndex = node.value.indexOf(match, lastIndex);

        if (startIndex > lastIndex) {
          children.push({
            type: "text",
            value: node.value.slice(lastIndex, startIndex),
          });
        }

        const innerContent = match.slice(2, -2);

        let target, text;

        if (innerContent.includes("|")) {
          const parts = innerContent.split("|");

          target = parseWikiTarget(parts[0]);
          text = parts[1].trim();
        } else {
          target = parseWikiTarget(innerContent);

          text = target.slug.split("/").pop().replaceAll("_", " ");
        }

        const href = `/${target.type}/${target.slug}`;

        children.push({
          type: "element",
          tagName: "a",
          properties: {
            href,
            class: "wiki-link",
            "data-wiki-type": target.type,
            "data-wiki-slug": target.slug,
          },
          children: [{ type: "text", value: text }],
        });

        lastIndex = startIndex + match.length;
      });

      if (lastIndex < node.value.length) {
        children.push({ type: "text", value: node.value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...children);
    });
  };
}
