import type { MDXComponents } from "mdx/types";
import type { ImageProps } from "next/image";

import { Blockquote } from "./app/components/blockquote";
import { Image } from "./app/components/image";
import { Code } from "./app/components/code";

export const useMDXComponents = (components: MDXComponents): MDXComponents => {
  return {
    pre: Code,
    blockquote: Blockquote,
    // eslint-disable-next-line jsx-a11y/alt-text
    img: (props) => <Image {...(props as ImageProps)} />,
    ...components,
  };
};
