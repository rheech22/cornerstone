import { visit } from "unist-util-visit";

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

        let href, text;

        if (innerContent.includes("|")) {
          const parts = innerContent.split("|");

          href = `/note/${parts[0].trim()}`;
          text = parts[1].trim();
        } else {
          const slug = innerContent.trim();

          href = `/note/${slug}`;
          text = slug.split("/").pop().replaceAll("_", " ");
        }

        children.push({
          type: "element",
          tagName: "a",
          properties: { href, class: "wiki-link" },
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
