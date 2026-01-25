export const parseImageOptions = (alt: string) => {
  const parts = alt.split('|').map(part => part.trim());
  const mainAlt = parts[0];
  const options: Record<string, string> = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const match = part.match(/(\w+)\s*=\s*(['"])(.*?)\2/);
    if (match) {
      options[match[1]] = match[3];
    }
  }

  let width: number | undefined;
  let height: number | undefined;

  if (options.size) {
    const sizeParts = options.size.split('x');
    width = parseInt(sizeParts[0], 10);
    if (!isNaN(width)) {
      if (sizeParts.length > 1) {
        height = parseInt(sizeParts[1], 10);
        if (isNaN(height)) height = undefined;
      }
    } else {
      width = undefined;
    }
  }

  const rounded = options.round === undefined ? true : options.round !== 'false';
  const shadow = options.shadow === undefined ? true : options.shadow !== 'false';

  const result = {
    alt: mainAlt,
    caption: options.caption,
    rounded,
    shadow,
    width,
    height,
  };

  return result;
};
