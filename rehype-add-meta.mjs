import { visit } from "unist-util-visit";

export default function rehypeAddMeta() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "code" && node.data?.meta) {
        let { meta } = node.data;

        if (typeof meta === "string") {
          const m = {};
          const regex = /(\w+)="([^"]+)"/g;
          let match;

          while ((match = regex.exec(meta)) !== null) {
            m[match[1]] = match[2];
          }
          meta = m;
        }
        node.properties = node.properties || {};
        Object.keys(meta).forEach((key) => {
          node.properties[`data-${key}`] = meta[key];
        });
      }
    });
  };
}
