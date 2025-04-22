"use client";

import { SquareLink } from "../components/square-link";
import { StaggerGridList } from "../components/stagger-grid-list";
import { shuffle } from "../lib/array";
import { useMounted } from "../lib/use-mounted";

interface Note {
  slug: string;
  title: string;
  excerpt: string;
}

type Props = {
  notes: Note[];
};

export const NoteList = ({ notes }: Props) => {
  const isMounted = useMounted();

  if (!isMounted) return null;

  return (
    <StaggerGridList count={notes.length}>
      {shuffle(notes).map(({ slug, title, excerpt }) => (
        <SquareLink
          key={slug}
          title={title}
          href={`/note/${slug}`}
          excerpt={excerpt}
        />
      ))}
    </StaggerGridList>
  );
};
