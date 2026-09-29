// Single source of truth for copy, nav, categories. Change wording HERE, not in components.

export type Tone = "gold" | "steel" | "plum" | "teal" | "ember" | "olive" | "indigo" | "sand";

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
  { label: "Studio", href: "/studio" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
] as const;

export const HERO: {
  image?: string; // e.g. "/assets/hero-couple.jpg"  (leave undefined = labeled placeholder)
  video?: string; // optional muted loop, e.g. "/assets/hero-loop.mp4" (keep < 5MB)
  alt: string;
  lines: [string, string];
} = {
  image: "/media/hero.jpg",
  video: undefined,
  alt: "A wedding couple at their ceremony",
  lines: [
    "Every wedding has one day.",
    "We spend it making sure none of it disappears.",
  ],
};

export const FILM: {
  src?: string; // e.g. "/assets/signature-film.mp4"
  src720?: string; // lighter cut, served to phones
  poster?: string;
  title: string;
  caption: string;
} = {
  src: "/media/wedding-film.mp4",
  src720: "/media/wedding-film-720.mp4", // lighter cut for small screens
  poster: "/media/wedding-film-poster.jpg",
  title: "Wedding Film",
  caption: "Shot in 4K and cut to the sound of the room",
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
  { id: "pre-wedding", label: "Pre Wedding", blurb: "Engagement & story shoots", href: "/work?cat=pre-wedding", tone: "plum" },
  { id: "corporate", label: "Corporate & Brand", blurb: "Launches, offsites, VIP events", href: "/work?cat=corporate", tone: "steel" },
  { id: "conferences", label: "Conferences", blurb: "Conclaves & summits", href: "/work?cat=conferences", tone: "indigo" },
  { id: "celebrations", label: "Events & Celebrations", blurb: "Milestones, openings & live nights", href: "/work?cat=celebrations", tone: "teal" },
  { id: "birthday", label: "Birthday", blurb: "Candles, cake & the loud room", href: "/work?cat=birthday", tone: "ember" },
  { id: "naming-ceremonies", label: "Naming Ceremonies", blurb: "Baby showers & cradles", href: "/work?cat=naming-ceremonies", tone: "sand" },
  { id: "inauguration", label: "Inauguration", blurb: "Ribbons, crowds & speeches", href: "/work?cat=inauguration", tone: "olive" },
  { id: "concerts", label: "Concerts & Live Events", blurb: "Multi-cam & stage coverage", href: "/work?cat=concerts", tone: "plum" },
  { id: "product", label: "Product & Commercial", blurb: "Studio & on-location", href: "/work?cat=product", tone: "steel" },
  { id: "car-delivery", label: "Car Delivery", blurb: "The moment it rolls out", href: "/work?cat=car-delivery", tone: "gold" },
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

export interface Reel {
  id: string;
  src: string;
  poster: string;
  title: string;
}

/**
 * Vertical reels for the cinematic carousel. 9:16 H.264 + AAC, faststart, one file per
 * reel — a reel is small enough on screen that a lighter cut is not worth the encode.
 * Posters are frame 0 of each file, so the still → video handover is invisible.
 */
export const REELS: Reel[] = [
  { id: "reel-1", src: "/media/reel-1.mp4", poster: "/media/reel-1-poster.jpg", title: "Reel 01" },
  { id: "reel-2", src: "/media/reel-2.mp4", poster: "/media/reel-2-poster.jpg", title: "Reel 02" },
  { id: "reel-3", src: "/media/reel-3.mp4", poster: "/media/reel-3-poster.jpg", title: "Reel 03" },
];

export const REEL_SECTION = {
  title: "In motion.",
};

export const CHAT_CTA = {
  title: "Let's plan your day, your way.",
  body: "Tell us the date and the kind of event, and we'll come back with a personalised plan or a custom cinematic film — no fixed packages, just your day.",
  button: "Plan your day",
  href: "/contact",
};
