/**
 * A photograph served from a pre-generated responsive WebP ladder.
 *
 * This is a plain <img> rather than next/image on purpose. In Next's App Router the props that
 * drive the responsive ladder are not the caller's to set: <Image> generates `srcSet` itself from
 * `deviceSizes` + `sizes`, and it deliberately drops a `srcSet` you pass in (it is listed under
 * "Other Props ... with the exception of" in the bundled docs), so handing it a ladder that was
 * already generated is not possible. scripts/build-work-gallery.mjs has already turned the camera
 * JPEGs (up to 9504px wide) into WebP at 400/800/1200/1600 on a fixed ladder, so the only thing
 * left is for the browser to pick a rung — which is exactly what srcSet and sizes are for.
 *
 * There is deliberately no blur-up placeholder here. One existed, and it put a 16px WebP behind
 * `blur-xl` so that it painted on top of the photograph (an absolutely-positioned element paints
 * after a static one) and, having no `onLoad` to dismiss it, left every frame permanently blurred.
 * Beyond that, a blur-up makes every image flash into a blurred state by design. Layout stability
 * does not need it: every frame below carries its true width and height, so the box is already
 * reserved at the real aspect ratio before a byte of image data arrives.
 */
export default function ResponsivePhoto({
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  eager = false,
  priority = false,
  className = "",
}: {
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
  /** Original pixel dimensions, used for the aspect-ratio box. */
  width: number;
  height: number;
  /** Skip lazy-loading. For the first screenful only — everything below stays lazy. */
  eager?: boolean;
  /** `fetchPriority="high"`. Reserved for the single LCP candidate. */
  priority?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-generated WebP ladder; next/image owns srcSet.
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={eager ? "sync" : "async"}
      className={className}
    />
  );
}
