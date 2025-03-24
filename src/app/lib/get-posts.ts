import { readdirSync } from "fs";

export const getPosts = (note: "blog" | "note") => {
  return readdirSync(`./src/app/docs/${note}`).filter((fileName) =>
    fileName.endsWith(".mdx"),
  );
};

export const getSlug = (fileName: string) => {
  return fileName.replace(".mdx", "");
};
