import type { MDXComponents } from "mdx/types";

import { Blockquote } from "./app/components/blockquote";
import { Code } from "./app/components/code";
import { Img } from "./app/components/image";

export const useMDXComponents = (components: MDXComponents): MDXComponents => {
  return {
    pre: Code,
    blockquote: Blockquote,
    img: Img,
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
