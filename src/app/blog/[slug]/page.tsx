import { MdxLayout } from "@/app/components/mdx-layout";
import { codeToHtml } from "shiki";

type PreElementWithProps = React.ReactElement<{
  children?: string;
  className?: string;
}>;

const parsePre = (pre: PreElementWithProps) => {
  const code = pre.props.children ?? "";
  const className = pre.props.className ?? "";
  const match = className.match(/language-(\w+)/);
  return {
    lang: match ? match[1] : "",
    code,
  };
};

const Pre = async ({ children }: { children: PreElementWithProps }) => {
  const pre = parsePre(children);
  const html = await codeToHtml(pre.code, {
    lang: pre.lang,
    theme: "laserwave",
  });
  return <code dangerouslySetInnerHTML={{ __html: html }} />;
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
