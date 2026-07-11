export type DocType = 'blog' | 'note';

export type Scope = 'blog' | 'note';

export type DocEntry = {
  slug: string;
  type: DocType;
  title: string;
  tags: string[];
  updated: string;
  text: string;
};
