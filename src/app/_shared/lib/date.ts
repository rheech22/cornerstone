import { differenceInCalendarDays, format, formatDistance } from "date-fns";

export const from = (date: Date) => {
  return formatDistance(date, new Date(), {
    addSuffix: true,
  });
};

export const formatUpdatedAt = (value: string, recentDays = 30): string | null => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = new Date();
  const daysDiff = Math.abs(differenceInCalendarDays(now, date));

  if (daysDiff <= recentDays) {
    return from(date);
  }

  return format(date, "yyyy-MM-dd");
};
