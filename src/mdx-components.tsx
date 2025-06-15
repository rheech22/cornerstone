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
    p: ({ children, ...props }) => {
      console.log(children);
      if (
        Array.isArray(children) &&
        children.length > 0 &&
        children[0]?.props?.src &&
        children[0]?.props?.alt
      ) {
        const imgProps = children[0]?.props;
        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image {...(imgProps as ImageProps)} />;
      }

      if (
        typeof children === "object" &&
        children.props?.src &&
        children.props?.alt
      ) {
        const imgProps = children.props;
        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image {...(imgProps as ImageProps)} />;
      }

      return <p {...props}>{children}</p>;
    },
    ...components,
  };
};
