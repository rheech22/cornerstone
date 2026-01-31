import type { MDXComponents } from "mdx/types";

import { Blockquote } from "./app/components/blockquote";
import { Callout } from "./app/components/callout";
import { Code } from "./app/components/code";
import { Fonts } from "./app/components/fonts";
import { Img } from "./app/components/image";
import { ImageGrid } from "./app/components/image-grid";

export const useMDXComponents = (components: MDXComponents): MDXComponents => {
  return {
    pre: Code,
    blockquote: Blockquote,
    img: Img,
    Callout,
    Fonts,
    Blockquote,
    ImageGrid,
    p: ({ children, ...props }) => {
      if (
        Array.isArray(children) &&
        children.length > 0 &&
        children[0]?.props?.src &&
        children[0]?.props?.alt
      ) {
        return <Img {...children[0]?.props} />;
      }
      if (
        typeof children === "object" &&
        children.props?.src &&
        children.props?.alt
      ) {
        return <Img {...children.props} />;
      }

      return <p {...props}>{children}</p>;
    },
    ...components,
  };
};
