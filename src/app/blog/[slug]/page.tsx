import { MdxLayout } from "@/app/components/mdx-layout";
import { highlightCode } from "@/app/lib/highlight-code";

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

const Pre = async ({ children }: { children: PreElementWithProps }) => {
  const pre = parsePre(children);
  const html = await highlightCode(pre.code, pre.lang);
  return (
    <div className="code-block">
      {pre.title && <div className="code-block__title">{pre.title}</div>}
      <code dangerouslySetInnerHTML={{ __html: html }} />
      {pre.caption && <div className="code-block__caption">{pre.caption}</div>}
    </div>
  );
};

const components = {
  pre: Pre,
};

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const slug = (await params).slug;
  const { default: Post } = await import(`../markdown/${slug}.mdx`);

  return (
    <MdxLayout>
      <Post components={components} />
    </MdxLayout>
  );
};

export default Page;

export const generateStaticParams = () => {
  return [{ slug: "welcome" }, { slug: "about" }];
};

export const dynamicParams = false;
