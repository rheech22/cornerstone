import { isValidElement, ReactElement } from "react";
import NextImage from "next/image";

import { cn } from "../lib/cn";

interface Props {
	r?: number,
	c?: number;
	children: unknown;
}

// NOTE: only one column is not recommended
export const ImageGrid = ({children, r, c}: Props) => {
  if(!validate(children)) return null;

  const elements = Array.isArray(children) ? [...children]: [children]
  const imageProps = elements.map(extractImageProps).filter((props) => props !== undefined);

  if(!imageProps) return null;

  const rows = r ?? 1;
  const columns = c ?? imageProps.length;

  return (
    <figure 
		 		className={cn("image-wider")}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: '.5rem',
        alignItems: 'start',
        justifyItems: 'center',
      }}>
		  {imageProps.map((props, i) => {
        return (
          <div
            key={props.alt + i}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
            }}
          >
            <NextImage
              alt={props.alt}
              fill
              src={props.src}
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )
      })}
    </figure>
  );

}

const validate = (input: unknown): input is ReactElement | ReactElement[] => {
  if(Array.isArray(input)) {
    return input.every((child)=> {
      return isValidElement(child);
    })
  }

  return isValidElement(input);
}
 
const extractImageProps = (element: ReactElement): { src: string; alt: string; width?: number; height?: number } | undefined => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const child = (element as any).props?.children;

    if (!child?.props) return;
  
    const { src, alt } = child.props;
  
    if (typeof src === 'object' && src !== null) {
      return {
        src: src.src as string,
        alt: alt as string,
        width: src.width as number,
        height: src.height as number,
      };
    }
  
    return {
      src: src as string,
      alt: alt as string,
    };
  } catch(e) {
    console.error(e)
  }
};
