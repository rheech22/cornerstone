import Link from "next/link";
import { getPostData } from "../lib/get-posts";

const BlogPage = async () => {
  const data = getPostData("blog");

  return (
    <div className="mx-auto flex flex-col">
      <ul className="flex flex-col gap-2 m-12">
        {data.map(({ slug, metadata: { title } }) => {
          return (
            <li key={slug}>
              <Link
                href={`/blog/${slug}`}
                className="underline w-full text-start underline-offset-4"
              >
                {title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BlogPage;
