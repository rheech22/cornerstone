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

  if(imageProps.length === 0) return null;

  const rows = r;
  const columns = c ?? imageProps.length;

  return (
    <figure 
		 	className={cn("image-wider")}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: rows ? `repeat(${rows}, auto)` : undefined,
        gap: '.5rem',
        alignItems: 'start',
        justifyItems: 'stretch',
      }}>
		  {imageProps.map((props, i) => {
        return (
          <div
            key={props.alt + i}
            className={cn("w-full")}
          >
            <NextImage
              alt={props.alt}
              src={props.src}
              width={props.width ?? 1200}
              height={props.height ?? 800}
              className={cn("h-auto w-full")}
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
