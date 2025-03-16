import { MdxLayout } from "@/app/components/mdx-layout";
import { NoteLayout } from "@/app/components/note-layout";
import { getPosts, getSlug } from "@/app/lib/get-posts";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const slug = (await params).slug;
  const { default: Post, frontmatter } = await import(
    `../../docs/fleeting-notes/${slug}.mdx`
  );

  console.log(frontmatter);

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
  return getPosts("fleeting-notes").map((fileName) => ({
    slug: getSlug(fileName),
  }));
};

export const dynamicParams = false;
