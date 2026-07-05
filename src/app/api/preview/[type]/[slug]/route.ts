import { NextResponse } from 'next/server';

import type { DocType } from '@/shared/components/cabinet/types';
import { getDocContent, preparePreviewMarkdown } from '@/shared/lib/explorer';
import { getPosts, getSlug } from '@/shared/lib/get-posts';
import { highlightMarkdown } from '@/shared/lib/highlight-code';

export const dynamic = 'force-static';
export const dynamicParams = false;

const TYPES: DocType[] = ['blog', 'note'];

export const generateStaticParams = () =>
  TYPES.flatMap((type) =>
    getPosts(type)
      .filter((file) => file !== 'index.mdx')
      .map((file) => ({ type, slug: getSlug(file) })),
  );

type Params = { params: Promise<{ type: string; slug: string }> };

export const GET = async (_request: Request, { params }: Params) => {
  const { type, slug } = await params;

  if (type !== 'blog' && type !== 'note') {
    return NextResponse.json({ error: 'invalid type' }, { status: 400 });
  }

  const content = getDocContent(type, slug);

  if (content === null) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const html = await highlightMarkdown(preparePreviewMarkdown(content));

  return NextResponse.json({ html });
};
