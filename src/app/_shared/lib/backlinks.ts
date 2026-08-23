import backlinkIndex from '@/shared/content/backlinks.json';
import type { DocType } from '@/shared/lib/explorer-types';

export type Backlink = {
  sourceType: DocType;
  sourceSlug: string;
  sourceTitle: string;
  excerpt: string;
};

type BacklinkTarget = {
  type: DocType;
  slug: string;
};

type GeneratedBacklink = Backlink & {
  draft?: boolean;
};

const backlinkKey = (target: BacklinkTarget): string => `${target.type}/${target.slug}`;
const backlinksByTarget = backlinkIndex as Record<string, GeneratedBacklink[]>;

export const getBacklinks = (target: BacklinkTarget): Backlink[] =>
  (backlinksByTarget[backlinkKey(target)] ?? [])
    .filter((backlink) => process.env.NODE_ENV !== 'production' || backlink.draft !== true)
    .filter((backlink) => backlink.sourceType !== target.type || backlink.sourceSlug !== target.slug)
    .map(({ excerpt, sourceSlug, sourceTitle, sourceType }) => ({
      excerpt,
      sourceSlug,
      sourceTitle,
      sourceType,
    }));
