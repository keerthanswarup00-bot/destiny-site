/**
 * Builds the Work gallery's real images.
 *
 * The source photographs are camera originals — up to 9504px wide, tens of megabytes. Shipping
 * those straight into public/ is not an option, and letting a fixed-height card crop them to
 * one ratio throws away the composition. So this does the honest version of both:
 *
 *   1. every source is converted to WebP at a ladder of widths, capped at its own width so a
 *      small photo is never upscaled;
 *   2. each step keeps the source aspect ratio exactly and is never cropped;
 *   3. EXIF/IPTC/XMP are dropped and the pixels are converted to sRGB, which is what the
 *      browser assumes anyway;
 *   4. a tiny WebP data URI is embedded per image, so the gallery has a real blur-up and a
 *      known box before any bytes arrive;
 *   5. a manifest is written with the true pixel dimensions, so the layout can reserve the
 *      right space and nothing shifts while loading.
 *
 * Re-run after adding photographs:  npm run build:work-gallery
 *
 * The originals are never copied into the app; they stay where they were imported from.
 */
import sharp from "sharp";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(ROOT, "public/media/work");

/** Where the originals live. Configured in one place so a future drop can move. */
const SOURCES = [
  { dir: "/Users/aryan/Downloads/website /img 01/Wedding", slug: "wedding", category: "weddings" },
  { dir: "/Users/aryan/Downloads/website /img 01/portraits", slug: "pre-wedding", category: "pre-wedding" },
];

/** Widths the browser picks between. 400 covers a 2-up phone column at 2x, 1600 the lightbox. */
const WIDTHS = [400, 800, 1200, 1600];

/** 82 sits in the brief's 80–85 band: visually clean for photography, a long way under JPEG. */
const QUALITY = 82;

const EXTS = new Set([".jpg", ".jpeg", ".png"]);

/**
 * Digit-aware compare, so 2.png sorts before 10.png and the WhatsApp timestamps
 * (…22.17.58.jpeg, …22.17.58 (1).jpeg, …22.17.58 (2).jpeg) keep their natural order
 * instead of the byte order the filesystem hands back.
 */
const natural = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const byName = (a, b) => natural.compare(a, b);

const pad = (n) => String(n).padStart(3, "0");

/** The rungs actually on disk for one image, as a srcset. */
function srcset(base, url, naturalWidth) {
  return WIDTHS.filter((w) => w <= naturalWidth)
    .map((w) => `${url}/${base}-${w}.webp ${w}w`)
    .join(", ");
}

async function build() {
  await rm(OUT, { recursive: true, force: true });
  const items = [];
  const report = [];

  for (const { dir, slug, category } of SOURCES) {
    const names = (await readdir(dir)).filter((f) => EXTS.has(path.extname(f).toLowerCase())).sort(byName);
    await mkdir(path.join(OUT, category), { recursive: true });
    const url = `/media/work/${category}`;

    for (const [i, name] of names.entries()) {
      const src = path.join(dir, name);
      const base = `${slug}-${pad(i + 1)}`;
      const input = sharp(src, { failOn: "none" }).rotate(); // honour EXIF orientation, then drop EXIF
      const meta = await input.metadata();
      const w = meta.width;
      const h = meta.height;
      if (!w || !h) throw new Error(`${name}: no dimensions`);

      let bytes = 0;
      for (const step of WIDTHS) {
        if (step > w) continue; // never upscale a small original
        const buf = await sharp(src, { failOn: "none" })
          .rotate()
          .resize({ width: step, withoutEnlargement: true })
          .toColorspace("srgb")
          .webp({ quality: QUALITY, effort: 5 })
          .toBuffer();
        await writeFile(path.join(OUT, category, `${base}-${step}.webp`), buf);
        bytes += buf.length;
      }

      // The widest rung actually written is the fallback `src` and the size the browser falls
      // back to when it has no srcset support, so it must be the largest — never the smallest.
      const widest = Math.max(...WIDTHS.filter((s) => s <= w));

      items.push({
        id: `${category}-${base}`,
        category,
        title: `${category === "weddings" ? "Weddings" : "Pre Wedding"} ${pad(i + 1)}`,
        src: `${url}/${base}-${widest}.webp`,
        srcSet: srcset(base, url, w),
        width: w,
        height: h,
        source: name,
      });
      report.push({ base, name, w, h, ratio: w / h, bytes });
    }
  }

  // `category` is pinned to a literal type. Without this it widens to `string` and the
  // structural assignment to GalleryImage[] in lib/work.ts fails — which is the point of
  // doing a real assignment there instead of a cast.
  const json = JSON.stringify(
    items.map(({ source: _source, ...rest }) => rest),
    null,
    2,
  ).replace(/"category": "([^"]+)"/g, '"category": "$1" as const');

  const body = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: npm run build:work-gallery
 * Source: ${SOURCES.map((s) => path.basename(path.dirname(s.dir)) + "/" + path.basename(s.dir)).join(", ")}
 *
 * \`width\`/\`height\` are the original photo's real pixel dimensions, not the size of any
 * generated variant, so the browser can reserve the true aspect-ratio box before a byte of
 * image data arrives.
 *
 * Deliberately untyped here so this file can land on its own, before anything reads it.
 * lib/work.ts assigns it to \`GalleryImage[]\`, which is a real structural check rather
 * than a cast — so this shape and the type cannot drift apart unnoticed.
 */
export const GALLERY_IMAGES = ${json};

/** Original filenames, keyed by image id, so a photo can be traced back to its source. */
export const SOURCE_NAMES: Record<string, string> = ${JSON.stringify(
    Object.fromEntries(items.map((i) => [i.id, i.source])),
    null,
    2,
  )};
`;


  await writeFile(path.join(ROOT, "lib/work-gallery.generated.ts"), body);

  // ---- audit -------------------------------------------------------------
  const totalBytes = report.reduce((a, r) => a + r.bytes, 0);
  const counts = SOURCES.map(({ category, dir }) => ({ category, onDisk: report.filter((r) => r.base.startsWith(category === "weddings" ? "wedding-" : "pre-wedding-")).length }));
  console.log(`\n${report.length} images converted to WebP q${QUALITY}`);
  for (const c of counts) console.log(`  ${c.category.padEnd(12)} ${c.onDisk} in manifest`);
  console.log(`  total WebP   ${(totalBytes / 1024 / 1024).toFixed(1)} MB across the ladder`);
  const landscape = report.filter((r) => r.ratio > 1).length;
  console.log(`  portrait ${report.length - landscape} · landscape ${landscape}`);
  for (const r of report.filter((x) => x.ratio > 1)) console.log(`    landscape ${r.base} ${r.w}x${r.h} r=${r.ratio.toFixed(2)}`);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
