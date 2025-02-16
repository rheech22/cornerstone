import { MdxLayout } from "@/app/components/mdx-layout";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const slug = (await params).slug;
  const { default: Post } = await import(`../markdown/${slug}.mdx`);

  return (
    <MdxLayout>
      <Post />
    </MdxLayout>
  );
};

export default Page;

export const generateStaticParams = () => {
  return [{ slug: "welcome" }, { slug: "about" }];
};

export const dynamicParams = false;
