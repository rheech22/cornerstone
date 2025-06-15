import Link from "next/link";
import { getPostData } from "../lib/get-posts";

const BlogPage = async () => {
  const data = getPostData("blog");

  return (
    <ul className="flex flex-col gap-2 items-center mt-12">
      {data.map(({ slug, metadata: { title } }) => {
        return (
          <li key={slug}>
            <Link
              href={`/blog/${slug}`}
              className="underline w-full text-start underline-offset-8 hover:text-blue-500 hover:no-underline hover:font-semibold"
            >
              {title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default BlogPage;
