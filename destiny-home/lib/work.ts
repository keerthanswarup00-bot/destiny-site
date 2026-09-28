import { CATEGORIES } from "@/lib/constants";

export type Size = "s" | "t" | "w"; // small 1x1 · tall 1x2 · wide 2x1

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
  // 16:9 at every size. `src720` would send phones a lighter cut of the same film;
  // it is not set, so phones get the master too.
  src: "/media/work-weddings.mp4",
  poster: "/media/work-weddings-poster.jpg",
  title: "S&S",
  caption: "Wedding film",
} as const;

// PLACEHOLDER DATA. Replace with a Supabase query later; keep the WorkItem shape.
// Order is interleaved so the "All" view mixes pillars.
const PATTERN: Size[] = ["w", "s", "t", "s", "s", "w", "s", "t"];

export interface WorkItem {
  id: string;
  category: CategoryId;
  title: string;
  size: Size;
  image?: string; // e.g. "/assets/work/wedding-01.jpg" — no image = labeled placeholder
}

export const WORK_ITEMS: WorkItem[] = Array.from({ length: PATTERN.length }).flatMap((_, n) =>
  PILLARS.map((c, ci) => ({
    id: `${c.id}-${n + 1}`,
    category: c.id,
    title: `${c.label} ${String(n + 1).padStart(2, "0")}`,
    size: PATTERN[(n + ci * 3) % PATTERN.length] as Size,
  })),
);
