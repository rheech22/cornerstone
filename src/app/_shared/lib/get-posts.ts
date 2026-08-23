import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export type PostFrontmatter = {
  created: string;
  updated: string;
  title: string;
  tags: string[];
  draft?: boolean;
};

const getPostDir = (noteType: "blog" | "note") => {
  return join(process.cwd(), "src/app/_shared/content", noteType);
};

export const getPosts = (noteType: "blog" | "note") => {
  const fileNames = readdirSync(getPostDir(noteType)).filter((fileName) =>
    fileName.endsWith(".mdx"),
  );

  if (process.env.NODE_ENV !== "production") return fileNames;

  return fileNames.filter((fileName) =>
    shouldIncludePost(
      readFileSync(join(getPostDir(noteType), fileName), "utf8"),
      "production",
    ),
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
        getPostDir(noteType) + "/" + fileName,
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

export const getPostContent = (noteType: "blog" | "note", slug: string) => {
  const fileName = `${slug}.mdx`;

  if (!getPosts(noteType).includes(fileName)) return null;

  return parseFrontmatter(readFileSync(join(getPostDir(noteType), fileName), "utf8")).content;
};

export const parseFrontmatter = (
  fileContent: string,
): { metadata: PostFrontmatter; content: string } => {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);

  if (!match) {
    return { metadata: {} as PostFrontmatter, content: fileContent.trim() };
  }

  const frontMatterBlock = match[1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const frontMatterLines = frontMatterBlock.trim().split("\n");
  const metadata: Partial<PostFrontmatter> = {};

  frontMatterLines.forEach((line) => {
    const separator = line.indexOf(":");

    if (separator === -1) return;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();

    switch (key) {
      case "tags":
        const cutted = value.slice(1, -1);

        metadata.tags = cutted
          .split(",")
          .map((value) => trimQuotes(value.trim()).trim())
          .filter(Boolean);

        return;
      case "draft":
        const draftValue = trimQuotes(value);

        if (draftValue !== "true" && draftValue !== "false") {
          throw new Error(`Invalid draft frontmatter value: ${value}`);
        }

        metadata.draft = draftValue === "true";

        return;
      default:
        const stringified = JSON.stringify(trimQuotes(value));

        if (!stringified) return;
        metadata[key as keyof PostFrontmatter] = JSON.parse(stringified);

        return;
    }
  });

  return { metadata: metadata as PostFrontmatter, content };
};

export const shouldIncludePost = (
  fileContent: string,
  environment: string | undefined = process.env.NODE_ENV,
): boolean => environment !== "production" || parseFrontmatter(fileContent).metadata.draft !== true;

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
