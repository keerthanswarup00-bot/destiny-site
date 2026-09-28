# Destiny Events & Photography — website

Monorepo for the Destiny site. The live site is a Next.js app in `destiny-home/`;
everything else is reference material kept alongside it.

```
destiny-site/
├── destiny-home/          the site — Next.js app (this is what you deploy)
├── destiny-work/          archive: the work page as first delivered
├── legacy-static-site/    the original hand-written HTML/CSS/JS prototype
└── docs/screenshots/      dev screenshots
```

## Running the site

```bash
cd destiny-home
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint
```

Typecheck on its own: `npx tsc --noEmit`.

Stack: Next 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4,
Framer Motion. Three runtime dependencies only — `next`, `react`, `react-dom`,
plus `framer-motion` for motion. No other packages were added during the work-page
build; everything reuses existing components.

### Routes

| Route | Rendering | Notes |
| --- | --- | --- |
| `/` | static | Home. Hero, film block, coverflow categories, about, heritage, testimonials, reel carousel, chat CTA. |
| `/work` | dynamic | Portfolio. Reads `?cat=<id>` and scrolls straight to the filtered gallery when one is present. |

`/films`, `/studio` and `/contact` are linked in the nav but do not exist yet — they
were never built. The old static prototype has drafts of all three in
`legacy-static-site/`.

## The two pages in detail

Component-level notes live next to the code, and are the thing to read before editing:

- `destiny-home/components/sections/work/README.md` — the work page: the four pillars,
  how the Home's 11 categories map onto them, the weddings film block, the phone
  frame ratios, and the measurements behind each layout decision.
- `destiny-home/lib/work.ts` — `PILLAR_OF` is the single source of truth for
  category mapping. `WORK_FILM` points the weddings film at its footage.

Two things that are easy to break:

- **The film block is shared.** `CinematicFilm` renders the Home film *and* the work
  weddings film. It takes an optional `overlay` (the work page puts its title, copy
  and CTA on the picture) and an optional `frame` (`"tall"` gives phones a 4:3 frame
  instead of 16:9). Home passes `frame="tall"` and no overlay; the work page passes
  both. Changing a default here changes Home.
- **There is no scrim over the weddings film.** An earlier one was removed because it
  was dulling the video by up to 88% black and measured as unnecessary. The re-check
  data is in the work README. Do not add it back without re-measuring.

## Media

`destiny-home/public/media/` — **178MB across 6 videos plus posters.** These are
committed on purpose: the app needs them present to build and deploy, and a clone
without them ships broken video. `git-lfs` is not installed; the largest single file
is 61MB, under GitHub's 100MB per-file hard limit.

| File | Size | Used by |
| --- | --- | --- |
| `work-weddings.mp4` | 61M | Work page, weddings film (from `S&S.M4V`, 4K → 1080p) |
| `wedding-film.mp4` | 54M | Home, film block, 900px and up |
| `reel-1.mp4` | 21M | Home, reel carousel |
| `wedding-film-720.mp4` | 18M | Home, film block, below 900px |
| `reel-3.mp4` | 17M | Home, reel carousel |
| `reel-2.mp4` | 5.5M | Home, reel carousel |

All are H.264 with `+faststart` and AAC audio. The originals were transcoded, not
copied; re-encode commands are in the work README.

If this ever needs to get lighter, the move is `git-lfs` — **not** a `.gitignore` rule,
because excluding the files breaks deploys.

## Reference material, not deployed

- `legacy-static-site/` — the original 8-page static prototype. Open
  `legacy-static-site/index.html` directly or serve the folder. Its own README
  documents the theme tokens and the placeholder-media conventions. Superseded by the
  Next app, kept because it has drafts of the films/studio/contact pages.
- `destiny-work/` — the work page exactly as first delivered, including
  `WorkChapters.tsx` and a 4-category `lib/constants.ts`. Both were replaced in the
  app. Kept as a record of the starting point.
- `docs/screenshots/` — dev screenshots. Several predate the current layout, so treat
  them as history, not as documentation of the present state.

## Notes for agents

`destiny-home/AGENTS.md` carries a block that `next dev` rewrites on every run. It is
committed deliberately: deleting it just makes `next dev` recreate it as an
uncommitted change.
