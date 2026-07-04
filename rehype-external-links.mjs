import { visit } from "unist-util-visit";

const toClassList = (value) => {
  if (Array.isArray(value)) return value.flatMap((item) => String(item).split(/\s+/));
  if (typeof value === "string") return value.split(/\s+/);
  return [];
};

export default function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;

      const href = node.properties?.href;

      if (typeof href !== "string") return;
      if (!/^https?:\/\//.test(href)) return;

      const classList = new Set([
        ...toClassList(node.properties.class),
        ...toClassList(node.properties.className),
        "external-link",
      ]);

      node.properties.className = Array.from(classList).filter(Boolean);
      node.properties.target = "_blank";
      node.properties.rel = "noopener noreferrer";
      delete node.properties.class;
    });
  };
}
