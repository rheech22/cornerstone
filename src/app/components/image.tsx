import NextImage, { type ImageProps } from "next/image";

export const Image: React.FC<ImageProps> = (props) => {
  if (!(props.width && props.height)) {
    return <NextImage {...props} width={1280} height={720} />;
  }
  return <NextImage {...props} />;
};
