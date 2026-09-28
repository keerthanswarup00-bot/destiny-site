# Destiny — Work page (add-on for destiny-home)

Verified: strict typecheck passes, `next build` passes, `/work?cat=weddings` server-renders (200) with 4 chapters and the filtered gallery.
Not yet checked: how the motion feels in a real browser or on a phone. Test the scroll on your phone first.

## Add to your repo
Copy these over the `destiny-home` files (no new npm packages needed):
```
app/work/page.tsx
components/sections/work/   (WorkExperience, WorkChapters, WorkGallery, WorkLightbox)
lib/work.ts                 (placeholder items + chapter copy)
lib/constants.ts            (only 2 changes: NAV_LINKS = Work · Films · Collections · Studio, CTA button = "Plan your day". Merge, don't blindly overwrite if you've edited it.)
```

## What the page does
1. **Chapter stage.** A sticky full-screen scene per category (Weddings → Corporate → Celebrations → Product). As you scroll, scenes dissolve into each other while the image slowly pushes in and drifts. All scrubbed by scroll, so it feels physical, not triggered.
2. **Gallery.** Bento layout (small / tall / wide tiles). Filter chips slide a gold outline between them and the tiles glide to their new positions. Chips stay pinned under the nav.
3. **Viewer.** Tap a frame and it expands out of the grid to full screen. Swipe, arrow keys or arrows to move, Esc or tap outside to close.
4. **Links from Home** (`/work?cat=weddings`) skip the stage and land on that filter.
5. "View the work" on a chapter filters the gallery and scrolls to it. Reduced-motion users get a static stacked version.

## Replace placeholders
- Chapter backgrounds: `CATEGORIES[i].image` in `lib/constants.ts` (also used by Home). Use wide landscape, high quality.
- Gallery frames: `lib/work.ts`. Each item's `image` field. Later: swap `WORK_ITEMS` for a Supabase query with the same shape.
- Tile size (`s` / `t` / `w`) controls the layout rhythm. Put your strongest images in `w` and `t`.

## Known limits
- Gallery items are static placeholders (8 per category), not yet connected to your admin uploads.
- Viewer swaps frames without a shared-element animation between neighbours (only the open/close expands).
- Chapter scroll length is 100svh per category. Change `N * 100` in `WorkChapters.tsx` if it feels long or short.
