import { MdxLayout } from "@/app/components/mdx-layout";
import { NoteLayout } from "@/app/components/note-layout";
import { getPosts, getSlug } from "@/app/lib/get-posts";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const slug = (await params).slug;
  const { default: Post, frontmatter } = await import(
    `../../docs/blog/${slug}.mdx`
  );

  // TODO: blog layout 따로 만들기

  return (
    <MdxLayout>
      <NoteLayout frontmatter={frontmatter}>
        <Post />
      </NoteLayout>
    </MdxLayout>
  );
};

export default Page;

export const generateStaticParams = () => {
  return getPosts("blog").map((fileName) => ({ slug: getSlug(fileName) }));
};

export const dynamicParams = false;
