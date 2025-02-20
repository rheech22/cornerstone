import { highlightCode } from "@/app/lib/highlight-code";
import { CopyButton } from "./copy-button";

type PreElementWithProps = React.ReactElement<{
  children?: string;
  className?: string;
  "data-title"?: string;
  "data-caption"?: string;
}>;

const parsePre = (pre: PreElementWithProps) => {
  const title = pre.props["data-title"] ?? "";
  const caption = pre.props["data-caption"] ?? "";
  const code = pre.props.children ?? "";
  const className = pre.props.className ?? "";
  const match = className.match(/language-(\w+)/);
  return {
    lang: match ? match[1] : "",
    code,
    title,
    caption,
  };
};

export const Code = async ({ children }: { children: PreElementWithProps }) => {
  const pre = parsePre(children);
  const html = await highlightCode(pre.code, pre.lang);
  return (
    <div className="code-block">
      <CopyButton text={pre.code} />
      {pre.title && <div className="code-block__title">{pre.title}</div>}
      <code dangerouslySetInnerHTML={{ __html: html }} />
      {pre.caption && <div className="code-block__caption">{pre.caption}</div>}
    </div>
  );
};
