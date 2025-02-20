import { readdirSync } from "fs";

export const getPosts = () => {
  return readdirSync("./src/app/blog/markdown").filter((fileName) =>
    fileName.endsWith(".mdx"),
  );
};

export const getSlug = (fileName: string) => {
  return fileName.replace(".mdx", "");
};
