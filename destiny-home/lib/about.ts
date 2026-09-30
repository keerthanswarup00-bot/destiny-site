import type { Tone } from "@/lib/constants";

/**
 * About page content. Single source of truth — every section on /about reads from here.
 *
 * FACTS RULE: only numbers and claims the owner has confirmed. 300+ weddings, 20+ films and
 * music albums, a 30+ member team and 1972 are the owner's figures. No award, client name,
 * celebrity or year-of-experience appears anywhere on this page, because none is documented.
 * `TODO(owner)` marks the one thing that cannot be finished without a photograph.
 */

export const ABOUT_HERO = {
  eyebrow: "Destiny Events and Photography",
  lines: ["Built on memories.", "Made for what comes next."],
  body:
    "A creative studio shaped by decades of stories, now making photographs, films and visual experiences for the moments that matter.",
  image: "/media/hero.jpg",
  alt: "A wedding couple at their ceremony",
} as const;

/**
 * The scale of the work, set as editorial display type rather than a card grid — a grid of
 * three rounded boxes is the "About Us template" tell this page is trying not to be.
 */
export const STATS = [
  { value: "300+", label: "Weddings captured", tone: "gold" as Tone },
  { value: "20+", label: "Films and music albums", tone: "steel" as Tone },
  { value: "30+", label: "Creative team members", tone: "plum" as Tone },
  { value: "1972", label: "The year it started", tone: "teal" as Tone },
] as const;

export const WHAT_WE_ARE = {
  title: "What Destiny is.",
  lead:
    "Destiny is a full production studio, not a photographer with a second camera. Thirty-plus people work together on every kind of event: photographers, cinematographers, editors, producers, stylists, makeup artists and designers, plus the crews who make a set look like somewhere.",
  body:
    "Weddings are the spine of the work — three hundred of them, shot by people who have done it enough times to be boring about the logistics and never about the light. Around that sit corporate productions, launches, concerts, product and fashion shoots, and music projects. Same studio, same standard, different brief.",
} as const;

export const AMAN = {
  // Name and role are not repeated here: VIP in lib/contact.ts is the single source for who
  // Aman is, and the contact page's direct line already uses it.
  title: "The next chapter of a story that started in 1972.",
  body: [
    "Aman grew up inside the business. Photography was not something he came across later and decided to try — it was the room he grew up in, the weddings he was taken to, the families he watched come back year after year.",
    "He was clear about what he wanted to change, and careful about what he did not. The craft his father built on — showing up, noticing, staying longer than everyone else — was worth keeping. What needed a new language was the way it was made: cinematic storytelling instead of coverage, deliberate visual direction instead of a record of events, a real production around the camera rather than a photographer and a bag.",
  ],
  brought: [
    "Cinematic storytelling",
    "Modern photography",
    "Contemporary filmmaking",
    "Stronger visual direction",
    "Full production",
    "Fashion and editorial influence",
  ],
  /** No photograph of Aman ships yet. MediaBlock renders a labelled placeholder until one is set. */
  portrait: undefined as string | undefined,
  portraitAlt: "Portrait of Aman Swaroop, founder and creative director",
  portraitLabel: "PORTRAIT — Aman Swaroop, founder",
} as const;

export const TEAM = {
  title: "Thirty-plus people. One production.",
  body:
    "A wedding needs two photographers, three films, an edit suite and someone calm holding the schedule. A campaign needs the same plus styling, makeup, a set and a producer. The same team carries the brief end to end, so the work never has to be split across three companies and hope the seams hold.",
  groups: [
    {
      id: "weddings",
      label: "Weddings",
      items: [
        "Complete wedding photography",
        "Wedding films",
        "Candid and traditional coverage",
        "Cinematic films",
        "Ceremonies and receptions",
        "Pre-wedding shoots",
      ],
    },
    {
      id: "events",
      label: "Events and celebrations",
      items: [
        "Event photography",
        "Event films",
        "Corporate events",
        "Celebrations and milestone nights",
        "Concerts and live coverage",
        "Multi-cam production",
      ],
    },
    {
      id: "commercial",
      label: "Commercial and brand",
      items: [
        "Product shoots",
        "Model and fashion shoots",
        "Creative campaigns",
        "Branded video",
        "Social media content",
        "Studio and on-location",
      ],
    },
    {
      id: "production",
      label: "Creative production",
      items: [
        "Makeup artists",
        "Fashion designers",
        "Styling",
        "Photography",
        "Video production",
        "Editing and creative direction",
      ],
    },
  ],
} as const;

/** The father/son beat. Typographic on purpose — no 1972 photograph exists to show. */
export const LEGACY = {
  title: "One legacy. A new language.",
  from: "1972",
  to: "Today",
  leftLabel: "Swaroop Studio",
  leftBody:
    "Opened in 1972 by Aman's father, and built on one idea: be present when something happens, and notice the people and moments that would otherwise disappear. Weddings, families, celebrations, the ordinary Tuesdays nobody stages.",
  rightLabel: "Destiny",
  rightBody:
    "The next generation, taking that foundation into a cinematic era. The same attention to people, shot with a modern language and a modern production around it.",
} as const;

export const CTA = {
  title: "Have a story worth creating?",
  body: "Tell us the date and the kind of event. We'll come back with a plan for it.",
  primary: { label: "Start a conversation", href: "/contact" },
  secondary: { label: "View our work", href: "/work" },
} as const;

export interface Milestone {
  id: string;
  /** Big label. Only use a real year where you're certain of it. */
  tag: string;
  title: string;
  body: string;
  image?: string; // /media/about/1972.jpg — no image = labelled placeholder
  tone: Tone;
  /** Tells you which photo belongs here while it is still a placeholder. */
  mediaHint: string;
}

/**
 * The four eras of the history timeline. 1972 and Destiny are the two the owner has confirmed;
 * the two in between are labelled by era rather than given invented dates.
 */
export const MILESTONES: Milestone[] = [
  {
    id: "1972",
    tag: "1972",
    title: "Swaroop Studio opens its doors.",
    body:
      "Aman's father opens a photography studio in 1972 with one idea: be present when something happens, and notice the people and moments that would otherwise disappear.",
    tone: "steel",
    mediaHint: "ARCHIVE 1972 — earliest studio photo (scan)",
  },
  {
    id: "decades",
    tag: "Decades",
    title: "Every kind of occasion.",
    body:
      "Weddings, families, celebrations, milestones. The work widens over the years, and the same attention to people holds at every scale — from a studio portrait to a full wedding day.",
    tone: "teal",
    mediaHint: "ARCHIVE — wedding or portrait work from the studio years",
  },
  {
    id: "aman",
    tag: "Aman",
    title: "The next generation steps in.",
    body:
      "Aman Swaroop grows up around the craft and decides the foundation is worth keeping, but the visual language is not. He brings cinematic storytelling, modern photography and real production to a studio that had never needed them.",
    tone: "plum",
    mediaHint: "AMAN — founder at work, not posed",
  },
  {
    id: "destiny",
    tag: "Destiny",
    title: "The studio, rebuilt for film.",
    body:
      "Destiny opens as the modern chapter of Swaroop Studio. Thirty-plus people, one production, and a way of filming that treats a wedding like it might be a film and a film like it might be a record worth keeping.",
    tone: "gold",
    mediaHint: "DESTINY — crew on a cinematic shoot (colour, wide)",
  },
];
