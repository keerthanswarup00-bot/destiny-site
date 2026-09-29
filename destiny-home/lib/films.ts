import type { Tone } from "@/lib/constants";

export interface Film {
  id: string;
  title: string;
  /** One short line: who/what, not a paragraph. */
  context: string;
  duration?: string; // "5:17"
  poster?: string; // /media/xyz-poster.jpg
  src?: string; // /media/xyz.mp4
  tone: Tone;
}

/**
 * Real files, not placeholders. Both are the 1080p landscape cuts already on the site — the same
 * two the Home film block and the Work page play — so nothing new was uploaded for this page.
 * Durations are measured from the files, not typed in by hand.
 *
 * TODO(owner): the titles below are working labels. Nothing in the repo records the real couple or
 * event names for these two, and inventing them would put fiction on a public page.
 */
export const SIGNATURE_FILMS: Film[] = [
  {
    id: "wedding-film",
    title: "Wedding Film",
    context: "The day, in full",
    duration: "1:04",
    poster: "/media/wedding-film-poster.jpg",
    src: "/media/wedding-film.mp4",
    tone: "gold",
  },
  {
    id: "work-weddings",
    title: "Weddings",
    context: "From the Work reel",
    duration: "2:08",
    poster: "/media/work-weddings-poster.jpg",
    src: "/media/work-weddings.mp4",
    tone: "plum",
  },
];

/**
 * The same six vertical clips the Home reel wall plays, pointed at the same files — one encode,
 * one place to swap a clip. reel-1 to reel-3 are 1080x1920, reel-4 to reel-6 are 720x1280; both
 * are 9:16 so the row is uniform either way.
 *
 * TODO(owner): titles and context lines are working labels, same as above.
 */
export const FILM_REELS: Film[] = [
  {
    id: "reel-1", title: "Reel 01", context: "Teaser", duration: "0:52",
    poster: "/media/reel-1-poster.jpg", src: "/media/reel-1.mp4", tone: "gold",
  },
  {
    id: "reel-2", title: "Reel 02", context: "First look", duration: "0:20",
    poster: "/media/reel-2-poster.jpg", src: "/media/reel-2.mp4", tone: "plum",
  },
  {
    id: "reel-3", title: "Reel 03", context: "Highlight", duration: "0:36",
    poster: "/media/reel-3-poster.jpg", src: "/media/reel-3.mp4", tone: "teal",
  },
  {
    id: "reel-4", title: "Reel 04", context: "Highlight", duration: "0:21",
    poster: "/media/reel-4-poster.jpg", src: "/media/reel-4.mp4", tone: "steel",
  },
  {
    id: "reel-5", title: "Reel 05", context: "Sangeet night", duration: "0:41",
    poster: "/media/reel-5-poster.jpg", src: "/media/reel-5.mp4", tone: "gold",
  },
  {
    id: "reel-6", title: "Reel 06", context: "Recap", duration: "0:30",
    poster: "/media/reel-6-poster.jpg", src: "/media/reel-6.mp4", tone: "steel",
  },
];
