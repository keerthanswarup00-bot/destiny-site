// Single source of truth for copy, nav, categories. Change wording HERE, not in components.

export type Tone = "gold" | "steel" | "plum" | "teal";

export const SITE = {
  name: "Destiny",
  tagline: "Events + Photography",
  whatsapp: "919108727795",
  email: "destinyeventsandphotography@gmail.com",
  instagram: "https://www.instagram.com/destinyeventsandphotography/",
} as const;

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const NAV_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Films", href: "/films" },
  { label: "Collections", href: "/collections" },
  { label: "Studio", href: "/studio" },
] as const;

export const HERO: {
  image?: string; // e.g. "/assets/hero-couple.jpg"  (leave undefined = labeled placeholder)
  video?: string; // optional muted loop, e.g. "/assets/hero-loop.mp4" (keep < 5MB)
  alt: string;
  lines: [string, string];
} = {
  image: undefined,
  video: undefined,
  alt: "A wedding couple at their ceremony",
  lines: [
    "Every wedding has one day.",
    "We spend it making sure none of it disappears.",
  ],
};

export const FILM: {
  src?: string; // e.g. "/assets/signature-film.mp4"
  poster?: string;
  title: string;
  caption: string;
} = {
  src: undefined,
  poster: undefined,
  title: "Varshitha & Varun",
  caption: "Reception, shot in 4K and cut to the sound of the room",
};

export interface Category {
  id: string;
  label: string;
  blurb: string;
  href: string;
  image?: string;
  tone: Tone;
}

export const CATEGORIES: Category[] = [
  { id: "weddings", label: "Weddings", blurb: "Full-day & multi-event", href: "/work?cat=weddings", tone: "gold" },
  { id: "corporate", label: "Corporate & Brand", blurb: "Launches, offsites, VIP events", href: "/work?cat=corporate", tone: "steel" },
  { id: "celebrations", label: "Celebrations", blurb: "Birthdays, anniversaries, milestones", href: "/work?cat=celebrations", tone: "plum" },
  { id: "product", label: "Product & Commercial", blurb: "Studio & on-location", href: "/work?cat=product", tone: "teal" },
];

export const ABOUT = {
  title: "A team built around one day at a time.",
  body:
    "Destiny is a full studio — photographers, cinematographers, drone operators, editors and a production team — but every shoot still runs on one rule: a lead who has walked your venue and knows your day, not a rotating crew assigned the morning of. From an intimate 40-guest wedding to a corporate launch for 500 people, the same eye is behind the camera.",
};

export const HERITAGE = {
  year: "1972",
  text: "Destiny carries forward Swaroop Studios — documenting weddings, press and portraits since 1972. The same care for people and moments, told for a new generation.",
  href: "/studio",
};

export interface Testimonial {
  quote: string;
  name: string;
  context: string;
  placeholder?: boolean; // placeholders NEVER render in production builds
}

export const TESTIMONIALS: Testimonial[] = [
  { quote: "They disappeared into the day — we forgot they were there until we saw the photos.", name: "Couple name", context: "Wedding, City", placeholder: true },
  { quote: "On time, professional, and the team handled our VIP guests without one awkward moment.", name: "Client name", context: "Corporate event", placeholder: true },
  { quote: "We didn't just get photos, we got a film we still watch every anniversary.", name: "Couple name", context: "Wedding, City", placeholder: true },
];

export const CHAT_CTA = {
  title: "Let's plan your day, your way.",
  body: "Chat with us directly for a personalised event plan or a custom cinematic film — no fixed packages, just your day.",
  button: "Plan your day",
  prefill: "Hi Destiny, I'd like to plan an event / film. Here are my details: ",
};
