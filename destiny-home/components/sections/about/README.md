# Destiny — About page (formerly the Studio page)

Verified: strict typecheck, `next build`, and `/about` server-renders (200) with all four eras. Not yet checked: how the scroll feels in a real browser or on a phone. Test on your phone first.

## Where it lives
```
app/about/page.tsx
components/sections/about/AboutTimeline.tsx
components/sections/about/AboutCrew.tsx
lib/about.ts
```
This replaced `/studio`, which was retired in favour of `/about`. The section components are reused as-is apart from the rename; the timeline's `aria-label` and screen-reader `<h1>` now say "Our history" / "About" instead of "Studio".

## The effect ("the film develops")
- Sticky full-screen stage, 100svh of scrolling per era.
- Photos start black & white with film grain (1972) and turn to full colour with no grain by 2024. It's one scroll-driven filter, so use the same treatment on every photo.
- Each new era wipes up over the last like a curtain.
- At 2024, cinematic letterbox bars close in.
- A gold timeline line fills on the left, with a dot per era.
- Reduced-motion users get a static stacked version.

## What you need to fill in (lib/about.ts)
1. **Real years** for "Press years" and "Studio years". Only 1972 and 2024 are confirmed, so the middle two are labelled by era instead of guessed. Change `tag` to a year when you know it.
2. **Photos.** Set `image` on each milestone. Ideal: scans of the real 1972 studio and press-era work (the grain + B&W treatment suits old prints), and a strong wide colour frame for 2024. Each placeholder's label says which photo belongs there.
3. **Crew photo** in `AboutCrew.tsx` (real people working, not posed).
4. Check the wording of each era's copy. It is based on the Swaroop Studios site, so adjust it if a detail isn't quite right.

## Notes
- The B&W-to-colour effect is applied to the whole photo layer. If your 2024 image is already black & white, it will stay that way.
- Letterbox bars sit below the nav on purpose so the nav stays clean.
