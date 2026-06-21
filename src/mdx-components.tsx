import type { MDXComponents } from "mdx/types";

import { Blockquote } from "@/shared/components/mdx/blockquote";
import { Callout } from "@/shared/components/mdx/callout";
import { Code } from "@/shared/components/mdx/code";
import { Fonts } from "@/shared/components/mdx/fonts";
import { Img } from "@/shared/components/mdx/image";
import { ImageGrid } from "@/shared/components/mdx/image-grid";

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
