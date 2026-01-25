import NextImage, { type ImageProps } from "next/image";
import { parseImageOptions } from "../lib/image";

type Props = ImageProps & {
  caption?: string;
  rounded?: boolean;
  shadow?: boolean;
};

export const Image: React.FC<Props> = ({
  caption,
  rounded = true,
  shadow = true,
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
    rounded ? 'rounded-xl' : '',
    shadow ? 'shadow-lg' : '',
    'overflow-hidden'
  ].filter(Boolean).join(' ').trim();


  const hasCustomSize = width !== undefined || height !== undefined;
  const nextImageHeight = heightProvided && height ? height : undefined;
  const nextImageWidth = widthProvided && width ? width : undefined;

  return (
    <figure className={`text-center ${hasCustomSize ? 'image-base-size' : ''}`} style={hasCustomSize ? { 
      '--image-width': `${finalWidth}px`,
      width: `${finalWidth}px`,
      marginTop: '2.75em',
      marginBottom: '3.25em',
    } as React.CSSProperties : undefined}>
      <div 
        className={containerClasses}
        style={{ 
          width: hasCustomSize ? `${finalWidth}px` : '100%',
          height: 'auto'
        }}
      >
        <NextImage
          {...props}
          width={nextImageWidth || finalWidth || 1280}
          height={nextImageHeight || finalHeight || 720}
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-gray-500 mt-1 text-left w-full">
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
  return <Image {...props} alt="" />;
};
