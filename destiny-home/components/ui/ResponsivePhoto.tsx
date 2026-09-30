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
 * Every frame carries its true width and height, so the box is reserved at the real aspect ratio
 * before a byte of image data arrives and nothing shifts. Callers pair that with `object-contain`:
 * because the box already has the photo's own ratio the two are visually identical, but it means
 * an image can never be cropped to fit — not even by a subpixel if a box is ever a rounding off.
 */
export default function ResponsivePhoto({
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  lqip,
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
  /** 16px WebP data URI of the same frame, shown until the real one lands. */
  lqip?: string;
  /** Skip lazy-loading. For the first screenful only — everything below stays lazy. */
  eager?: boolean;
  /** `fetchPriority="high"`. Reserved for the single LCP candidate. */
  priority?: boolean;
  className?: string;
}) {
  return (
    <>
      {lqip && (
        <div
          aria-hidden
          className="absolute inset-0 scale-110 bg-cover bg-center blur-xl"
          style={{ backgroundImage: `url(${lqip})` }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- the responsive WebP ladder is
          pre-generated; next/image takes srcSet out of its props and would re-encode it. */}
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
    </>
  );
}
