import type { Tone } from "@/lib/constants";

export interface Milestone {
  id: string;
  /** Big label. Only use a real year where you're certain of it. */
  tag: string;
  title: string;
  body: string;
  image?: string; // /assets/studio/1972.jpg — no image = labeled placeholder
  tone: Tone;
  /** Tells you which photo belongs here while it is still a placeholder. */
  mediaHint: string;
}

// TODO(owner): replace "Press years" / "Studio years" with exact years once confirmed.
// Facts come from swaroop-studios.vercel.app; 2024 is the Destiny launch year.
export const MILESTONES: Milestone[] = [
  {
    id: "1972",
    tag: "1972",
    title: "Swaroop Studios opens its doors.",
    body: "A photography studio begins with one idea: be present when something happens, and notice the people and moments that would otherwise disappear.",
    tone: "steel",
    mediaHint: "ARCHIVE 1972 — earliest studio photo (scan)",
  },
  {
    id: "press",
    tag: "Press years",
    title: "Learning to see fast.",
    body: "Studio portraits and press assignments. The work taught the studio to observe quickly, hold steady under pressure and catch moments no one had staged.",
    tone: "teal",
    mediaHint: "ARCHIVE — press assignment photo",
  },
  {
    id: "studio",
    tag: "Studio years",
    title: "Every kind of occasion.",
    body: "The work widens into weddings, celebrations, corporate photography, portraits and family photographs — the same attention to people, at every scale.",
    tone: "plum",
    mediaHint: "ARCHIVE — wedding / portrait work",
  },
  {
    id: "2024",
    tag: "2024",
    title: "Destiny is born.",
    body: "Destiny Events + Photography opens as the studio's next generation, built for modern, cinematic filmmaking. Five decades of care, told in a new visual language.",
    tone: "gold",
    mediaHint: "2024 — Destiny team on a cinematic shoot (colour, wide)",
  },
];

export const CREW = {
  title: "Twenty-plus people. One standard.",
  body: "Photographers, cinematographers, drone operators, editors and a production team. Every shoot still runs on one rule: a lead who has walked your venue and knows your day, not a rotating crew assigned the morning of.",
  capabilities: ["Photography", "Cinematography", "Drone & aerial", "Product studio", "Event production", "Post-production"],
};
