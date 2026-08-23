import { describe, expect, it } from 'vitest';

import { parseFrontmatter, shouldIncludePost } from '../src/app/_shared/lib/get-posts';

const post = (draft?: string): string => `---
title: Draft test
created: 2026-08-23
updated: 2026-08-23
tags: [test]
${draft === undefined ? '' : `draft: ${draft}`}
---

Content`;

describe('draft frontmatter', () => {
  it('parses boolean draft values', () => {
    expect(parseFrontmatter(post('true')).metadata.draft).toBe(true);
    expect(parseFrontmatter(post('"true"')).metadata.draft).toBe(true);
    expect(parseFrontmatter(post('false')).metadata.draft).toBe(false);
  });

  it('includes drafts in development and excludes them in production', () => {
    expect(shouldIncludePost(post('true'), 'development')).toBe(true);
    expect(shouldIncludePost(post('true'), 'production')).toBe(false);
    expect(shouldIncludePost(post('false'), 'production')).toBe(true);
    expect(shouldIncludePost(post(), 'production')).toBe(true);
  });

  it('rejects non-boolean draft values in production', () => {
    expect(() => shouldIncludePost(post('yes'), 'production')).toThrow(
      'Invalid draft frontmatter value: yes',
    );
  });

  it('supports content without frontmatter', () => {
    expect(parseFrontmatter('Index content')).toEqual({
      metadata: {},
      content: 'Index content',
    });
  });
});
