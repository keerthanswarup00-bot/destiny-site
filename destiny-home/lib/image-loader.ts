type LoaderProps = { src: string; width: number; quality?: number };

export default function imageLoader({ src }: LoaderProps): string {
  return src.startsWith("http") ? src : `https://destiny-site-omega.vercel.app${src}`;
}
