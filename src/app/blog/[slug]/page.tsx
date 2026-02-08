import { MdxLayout } from "@/app/components/mdx-layout";
import { PostLayout } from "@/app/components/post-layout";
import { getPosts, getSlug } from "@/app/lib/get-posts";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const slug = (await params).slug;
  const { default: Post, frontmatter } = await import(
    `../../docs/blog/${slug}.mdx`
  );

  return (
    <MdxLayout>
      <PostLayout frontmatter={frontmatter}>
        <Post />
      </PostLayout>
    </MdxLayout>
  );
};

export default Page;

export const generateStaticParams = () => {
  return getPosts("blog").map((fileName) => ({ slug: getSlug(fileName) }));
};

export const dynamicParams = false;
