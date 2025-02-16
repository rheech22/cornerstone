import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";

import { Code } from "./app/components/code";
import { Blockquote } from "./app/components/blockquote";

export const useMDXComponents = (components: MDXComponents): MDXComponents => {
  return {
    pre: Code,
    blockquote: Blockquote,
    img: (props) => (
      console.log(props),
      (
        <Image
          {...(props as ImageProps)}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          alt={props.alt}
        />
      )
    ),
    ...components,
  };
};
