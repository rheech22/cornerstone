import { formatDistance } from "date-fns";

export const from = (date: Date) => {
  return formatDistance(date, new Date(), {
    addSuffix: true,
  });
};
