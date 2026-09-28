import { CATEGORIES } from "@/lib/constants";

export type CategoryId = "weddings" | "corporate" | "celebrations" | "product";
export type Size = "s" | "t" | "w"; // small 1x1 · tall 1x2 · wide 2x1

export interface WorkItem {
  id: string;
  category: CategoryId;
  title: string;
  size: Size;
  image?: string; // e.g. "/assets/work/wedding-01.jpg" — no image = labeled placeholder
}

export const CHAPTER_COPY: Record<CategoryId, string> = {
  weddings: "Full-day and multi-event coverage, shot the way it actually felt.",
  corporate: "Launches, offsites and VIP rooms, handled without a fuss.",
  celebrations: "Birthdays and milestones with the people who matter most.",
  product: "Studio and on-location work that makes things look worth buying.",
};

export function isCategoryId(v: unknown): v is CategoryId {
  return typeof v === "string" && CATEGORIES.some((c) => c.id === v);
}

// PLACEHOLDER DATA. Replace with a Supabase query later; keep the WorkItem shape.
// Order is interleaved so the "All" view mixes categories.
const PATTERN: Size[] = ["w", "s", "t", "s", "s", "w", "s", "t"];

export const WORK_ITEMS: WorkItem[] = Array.from({ length: PATTERN.length }).flatMap((_, n) =>
  CATEGORIES.map((c, ci) => ({
    id: `${c.id}-${n + 1}`,
    category: c.id as CategoryId,
    title: `${c.label} ${String(n + 1).padStart(2, "0")}`,
    size: PATTERN[(n + ci * 3) % PATTERN.length],
  })),
);
