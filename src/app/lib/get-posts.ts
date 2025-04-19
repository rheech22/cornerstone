import { readdirSync, readFileSync } from "fs";

type Metadata = {
  created: string;
  updated: string;
  title: string;
  tags: string[];
};

export const getPosts = (noteType: "blog" | "note") => {
  return readdirSync(`./src/app/docs/${noteType}`).filter((fileName) =>
    fileName.endsWith(".mdx"),
  );
};

export const getSlug = (fileName: string) => {
  return fileName.replace(".mdx", "");
};

export const getPostData = (noteType: "blog" | "note") => {
  const files = getPosts(noteType);

  return files
    .filter((fileName) => fileName !== "index.mdx")
    .map((fileName) => {
      const fileContent = readFileSync(
        `./src/app/docs/${noteType}/${fileName}`,
        "utf8",
      );
      const { metadata, content } = parseFrontmatter(fileContent);
      return {
        slug: getSlug(fileName),
        metadata,
        content,
      };
    });
};

const parseFrontmatter = (
  fileContent: string,
): { metadata: Metadata; content: string } => {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);
  const frontMatterBlock = match![1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const frontMatterLines = frontMatterBlock.trim().split("\n");
  const metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    const [key, value] = line.split(": ");
    switch (key) {
      case "tags":
        const cutted = value.slice(1, -1);
        metadata.tags = cutted.split(",").map((value) => trimQuotes(value));
        return;
      default:
        const stringified = JSON.stringify(trimQuotes(value));
        if (!stringified) return;
        metadata[key.trim() as keyof Metadata] = JSON.parse(stringified);
        return;
    }
  });
  return { metadata: metadata as Metadata, content };
};

const trimQuotes = (str: string) => {
  return str.replace(/^['"](.*)['"]$/, "$1");
};

export const getExcerpt = (content: string): string => {
  const split = content
    .split("\n")
    .map((l) => {
      const line = l.trim();
      if (line.length === 0) return "";
      if (line.match(/^!\[.*]\(.*\)/)) return "";
      if (line.match(/^import(.*)["']@\/app\/components\/(.*)["'];$/)) {
        return "";
      }
      if (line.match(/^<\/?Callout>$/)) return "";
      if (line.match(/^<\/?Blockquote>$/)) return "";
      return l.replace(/\[\[(.*?)\]\]/g, (_, g1) => {
        if (g1.includes("|")) {
          return g1.split("|")[1];
        } else {
          return g1;
        }
      });
    })
    .join("\n");

  return split;
};
