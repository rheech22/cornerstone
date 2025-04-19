import { shuffle as esToolkitShuffle } from "es-toolkit";

export const shuffle = <T>(array: T[]) => {
  return esToolkitShuffle(array);
};
