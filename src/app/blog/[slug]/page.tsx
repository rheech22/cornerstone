import { MdxLayout } from "@/shared/components/mdx-layout";
import { PostLayout } from "@/shared/components/post-layout";
import { getBacklinks } from "@/shared/lib/backlinks";
import { getPosts, getSlug } from "@/shared/lib/get-posts";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const slug = (await params).slug;
  const { default: Post, frontmatter } = await import(
    `../../_shared/content/blog/${slug}.mdx`
  );
  const backlinks = getBacklinks({ type: "blog", slug });

  return (
    <MdxLayout>
      <PostLayout backlinks={backlinks} frontmatter={frontmatter}>
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
