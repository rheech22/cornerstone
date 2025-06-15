import NextImage, { type ImageProps } from "next/image";

export const Image: React.FC<ImageProps> = (props) => {
  if (!(props.width && props.height)) {
    return (
      <figure>
        <NextImage {...props} width={1280} height={720} />
      </figure>
    );
  }
  return (
    <figure>
      <NextImage {...props} />
    </figure>
  );
};
