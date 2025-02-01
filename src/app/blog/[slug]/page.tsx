import { MdxLayout } from "@/app/components/mdx-layout";

const CustomH1 = ({ children }: { children: React.ReactNode }) => {
  return <h1 style={{ color: "red", fontSize: "100px" }}>{children}</h1>;
};

const overrideComponents = {
  h1: CustomH1,
};

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const slug = (await params).slug;
  const { default: Post } = await import(`@/content/${slug}.mdx`);

  return (
    <MdxLayout>
      <Post components={overrideComponents} />;
    </MdxLayout>
  );
};

export default Page;

export const generateStaticParams = () => {
  return [{ slug: "welcome" }, { slug: "about" }];
};

export const dynamicParams = false;
