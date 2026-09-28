# Destiny — Home page components (Next.js App Router · Tailwind · Framer Motion)

Verified: typechecks strict, and `next build` (Next 16, Tailwind v4) prerenders `/` successfully.

## What's in here
```
app/page.tsx                          Home = the 7 sections, in order
components/layout/Nav.tsx             Logo left · menu centre · CTA right (slide-in menu on mobile)
components/layout/Footer.tsx
components/sections/HeroMedia.tsx     Full-bleed image/video + 2 lines, no CTA
components/sections/CinematicFilm.tsx Film block, opens from inset to full-bleed on scroll, click-to-play
components/sections/CoverflowScroller.tsx  Sideways scroller: small → big in the middle → small
components/sections/AboutDestiny.tsx
components/sections/HeritageStrip.tsx 1972 / Swaroop Studios trust strip
components/sections/Testimonials.tsx  Placeholders are HIDDEN in production builds
components/sections/ChatCTA.tsx       WhatsApp chat with prefilled message
components/ui/                        MediaBlock (image or labeled placeholder), Reveal, Container, SectionHead
lib/constants.ts                      ALL copy, nav, categories, contact info — edit here, not in components
snippets/                             layout example, Tailwind v4 tokens, Tailwind v3 config (use whichever matches your repo)
```

## Install into your repo (5 steps)
1. `npm i framer-motion`
2. Copy `components/`, `lib/constants.ts`, `app/page.tsx` into your repo (merge `lib/` if it exists; don't overwrite your Supabase files).
3. Tokens: Tailwind v4 → paste `snippets/globals.tailwind-v4.css` into `app/globals.css`. Tailwind v3 → merge `snippets/tailwind.config.v3.ts` into your config. (Check `package.json` for the version.)
4. Fonts + Nav/Footer: mirror `snippets/layout.example.tsx` in `app/layout.tsx` (Fraunces + Manrope via `next/font`, Nav and Footer rendered once here).
5. Path alias `@/` must exist in `tsconfig.json` (default in create-next-app).

## Swap placeholders for real media (all in `lib/constants.ts`)
- `HERO.image` → `"/assets/hero-couple.jpg"` (optional `HERO.video` = short muted loop, under ~5MB)
- `FILM.src` / `FILM.poster` → your cinematic film + poster frame
- `CATEGORIES[i].image` → one image per category card
- Testimonials: replace with real quotes and delete `placeholder: true`. Until then the section does not render in production.
Put files in `public/assets/`. Any block without `src` shows a visible label so nothing ships silently empty.

## Decisions worth knowing
- One load-time motion (hero settle + headline stagger), one scroll motion (film block opens up), one interaction motion (coverflow). Everything else is still. Don't add more.
- `Reveal` fade-up is used on section headings/blocks only. Don't wrap every element in it.
- Coverflow: swipe on touch, arrow buttons on desktop, keyboard focusable. Tapping a side card centres it; tapping the centred card opens its `/work?cat=...` page. Mouse-drag is not implemented.
- Reduced-motion users get no scale/fade/parallax.
- Home's hero sits under the fixed nav. Every other page needs `pt-16` on its content.

## Prompt to give OpenCode
> Integrate the components in this folder into the repo per README.md. Do not change colors, fonts, copy, or motion. Keep all copy in lib/constants.ts. After integrating, run `npm run build` and `npm run lint`, fix any errors without altering design, and tell me what you changed.

## Still yours to do
- Real hero photo and film (the page lives or dies on these)
- Real testimonials
- `/work`, `/films`, `/studio`, `/services`, `/contact` routes (nav links point at them)
- Test on an actual phone, on a mobile connection
