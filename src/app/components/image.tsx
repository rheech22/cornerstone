import NextImage, { type ImageProps } from "next/image";

import { cn } from "../lib/cn";
import { parseImageOptions } from "../lib/image";

type Props = ImageProps & {
  caption?: string;
  rounded: boolean;
  shadow: boolean;
};

export const Image: React.FC<Props> = ({
  caption,
  rounded,
  shadow,
  width,
  height,
  ...props
}) => {
  const widthProvided = width !== undefined;
  const heightProvided = height !== undefined;

  let finalWidth = width;
  let finalHeight = height;

  if (!widthProvided && !heightProvided) {
    finalWidth = 1280;
    finalHeight = 720;
  }

  const containerClasses = [
    'inline-block',
    rounded ? 'rounded-[var(--radius-media-outer)] border border-[var(--color-surface-line)] bg-[var(--color-surface-muted)] p-2' : '',
    shadow ? 'shadow-lg' : '',
    'overflow-hidden'
  ].filter(Boolean).join(' ').trim();
	
  const hasCustomSize = width !== undefined || height !== undefined;
  const nextImageHeight = heightProvided && height ? height : undefined;
  const nextImageWidth = widthProvided && width ? width : undefined;

  return (
    <figure 
      className={cn("text-center", hasCustomSize ? "image-base-size" : "image-wider")}
      style={hasCustomSize ? { 
        '--image-width': `${finalWidth}px`,
        width: `${finalWidth}px`,
        marginTop: '2.75em',
        marginBottom: '3.25em',
      } as React.CSSProperties : undefined}>
      <div 
        className={cn(containerClasses)}
        style={{ 
          width: hasCustomSize ? `${finalWidth}px` : '100%',
          maxWidth: '100%',
          height: 'auto',
        }}
      >
        <NextImage
          {...props}
				  className={cn("rounded-[var(--radius-media-inner)]")}
          width={nextImageWidth || finalWidth || 1280}
          height={nextImageHeight || finalHeight || 720}
        />
      </div>
      {caption && (
        <figcaption className={cn("mt-1 w-full text-left text-sm text-gray-500")}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

interface ImgProps {
  alt?: string;
  src: string;
  [key: string]: unknown;
}

export const Img: React.FC<ImgProps> = (props) => {
  if (typeof props.alt === 'string') {
    const { alt, caption, rounded, shadow, width, height } = parseImageOptions(props.alt);

    return (
      <Image
        {...props}
        alt={alt}
        caption={caption}
        rounded={rounded}
        shadow={shadow}
        width={width}
        height={height}
      />
    );
  }

  return <Image {...props} alt="" rounded={false} shadow={false} />;
};
