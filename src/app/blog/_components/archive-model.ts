export type BlogArchiveRow = {
  slug: string;
  title: string;
  year: string;
  month: string;
  day: string;
  date: number;
  showYear: boolean;
  showMonth: boolean;
  borderStart: 'full' | 'year' | 'month';
};

export const getArchiveBorderClassName = (row: BlogArchiveRow) => {
  if (row.borderStart === 'full') return 'after:left-0';
  if (row.borderStart === 'year') return 'after:left-[4.25rem] sm:after:left-[5rem]';

  return 'after:left-[8rem] sm:after:left-[9.25rem]';
};
