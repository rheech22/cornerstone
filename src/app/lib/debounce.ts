import { debounce as toolkitDebounce } from "es-toolkit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number,
) => {
  return toolkitDebounce(func, wait);
};
