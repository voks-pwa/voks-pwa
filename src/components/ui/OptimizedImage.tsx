import { type ComponentPropsWithoutRef, memo } from "react";

interface Props extends ComponentPropsWithoutRef<"img"> {
  src: string;
  alt: string;
  lazy?: boolean;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  lazy = true,
  ...rest
}: Props) {
  return (
    <picture>
      {src.endsWith('.svg') ? null : (
        <>
          <source srcSet={src} type="image/webp" />
          <source srcSet={src} type="image/avif" />
        </>
      )}
      <img
        {...rest}
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={lazy ? "lazy" : "eager"}
        decoding="async"
      />
    </picture>
  );
});
