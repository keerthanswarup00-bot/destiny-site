import { CATEGORIES } from "@/lib/constants";
import { GALLERY_IMAGES } from "@/lib/work-gallery.generated";

/** The four pillars the work archive is organised around, in display order.
 *  Home showcases more categories than the archive carries — see PILLAR_OF. */
export const CATEGORY_IDS = ["weddings", "pre-wedding", "celebrations", "corporate"] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

/** Home still links to all of its categories. The ones the archive doesn't keep as a
 *  pillar fold into the nearest one, so every home card lands on a real filter. */
const PILLAR_OF: Record<string, CategoryId> = {
  birthday: "celebrations",
  "naming-ceremonies": "celebrations",
  inauguration: "celebrations",
  concerts: "celebrations",
  "car-delivery": "celebrations",
  conferences: "corporate",
  product: "corporate",
  fashion: "corporate",
  commercial: "corporate",
  // Films is the one that isn't a clean fit: Destiny cuts most of them for the
  // wedding and event days, so it lands on the pillar its footage comes from.
  films: "weddings",
};

/** The pillars, carrying over label, blurb, tone and image from CATEGORIES so a
 *  category keeps one source of truth for its presentation. */
export const PILLARS = CATEGORY_IDS.map((id) => {
  const c = CATEGORIES.find((x) => x.id === id);
  if (!c) throw new Error(`[work] CATEGORY_IDS has "${id}", which is not in CATEGORIES`);
  return { id: c.id as CategoryId, label: c.label, blurb: c.blurb, tone: c.tone, image: c.image };
});

/** One line per chapter. Typed as a full Record, so a new pillar is a compile error
 *  until it has copy here. */
export const CHAPTER_COPY: Record<CategoryId, string> = {
  weddings: "Full-day and multi-event coverage, shot the way it actually felt.",
  "pre-wedding": "Engagement stories and pre-wedding shoots, done somewhere better than a studio car park.",
  celebrations: "Birthdays, milestones, launches and live nights, covered without losing anyone in the crowd.",
  corporate: "Offsites, conclaves and VIP rooms, handled without a fuss.",
};

export function isCategoryId(v: unknown): v is CategoryId {
  return typeof v === "string" && (CATEGORY_IDS as readonly string[]).includes(v);
}

/** Accepts any category id a home card can produce — pillars pass through, the rest fold
 *  into their pillar, and anything unrecognised falls back to the unfiltered archive. */
export function resolveCategory(v: unknown): CategoryId | "all" {
  if (typeof v !== "string") return "all";
  if (isCategoryId(v)) return v;
  return PILLAR_OF[v] ?? "all";
}

if (process.env.NODE_ENV === "development") {
  const strs: readonly string[] = CATEGORY_IDS;
  const orphans = CATEGORIES.map((c) => c.id).filter((id) => !strs.includes(id) && !(id in PILLAR_OF));
  if (orphans.length) {
    console.warn("[work] CATEGORIES entries with neither a pillar nor a PILLAR_OF mapping: " + orphans.join(", "));
  }
}

/** The weddings reel shown in the single top section. Reuses the Home page's film
 *  block (components/sections/CinematicFilm.tsx), so the 720p cut, poster fallback,
 *  mute control and iOS autoplay rules all behave identically there. */
export const WORK_FILM = {
  // The S&S wedding film, 4K source transcoded to 1080p. Landscape, so the frame is
  // 16:9 at every size. `src720` is a 720p cut of this same film: without it phones
  // pull the ~64MB master, which is far more than the frame justifies on a phone.
  src: "/media/work-weddings.mp4",
  src720: "/media/work-weddings-720.mp4",
  poster: "/media/work-weddings-poster.jpg",
  title: "S&S",
  caption: "Wedding film",
} as const;

/** One photograph in the gallery.
 *
 * `width`/`height` are the ORIGINAL photo's pixel dimensions, not the size of any generated
 * variant. That is the whole point: the layout reserves a box at the true aspect ratio before
 * any bytes arrive, so a portrait stays portrait and nothing shifts while loading.
 */
export interface GalleryImage {
  id: string;
  category: CategoryId;
  title: string;
  /** Widest generated WebP — the fallback for a browser with no srcset support. */
  src: string;
  /** Every generated width, as `url 400w` pairs. */
  srcSet: string;
  width: number;
  height: number;
}

/* Assigned, not cast: this is a real structural check of every field in the manifest, so a
   change to the generator that drops or renames something fails the build here. */
export const WORK_ITEMS: readonly GalleryImage[] = GALLERY_IMAGES;

/** The photos for one filter chip, in manifest order. */
export function imagesInCategory(cat: CategoryId | "all"): readonly GalleryImage[] {
  return cat === "all" ? WORK_ITEMS : WORK_ITEMS.filter((i) => i.category === cat);
}

/** How many photos each pillar holds — the chips show this, and an empty pillar says so plainly
 *  rather than rendering a blank grid under a working filter. */
export const CATEGORY_COUNTS: Record<CategoryId | "all", number> = {
  all: WORK_ITEMS.length,
  ...CATEGORY_IDS.reduce(
    (acc, id) => ({ ...acc, [id]: WORK_ITEMS.filter((i) => i.category === id).length }),
    {} as Record<CategoryId, number>,
  ),
};

/** Width/height → the decimal the CSS `aspect-ratio` property wants. */
export const ratioOf = (i: { width: number; height: number }) => i.width / i.height;
