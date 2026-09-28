# Work page

Route: `/work` — deep links `/work?cat=<id>`.

Files:
```
app/work/page.tsx                        route + metadata, resolves ?cat=
components/sections/work/WorkExperience  top section + filter state
components/sections/work/WorkGallery     sticky filter chips + bento grid
components/sections/work/WorkLightbox    full-screen viewer
lib/work.ts                              PILLARS, CHAPTER_COPY, WORK_ITEMS, WORK_FILM
```

No new npm packages — uses `framer-motion` and existing components.

## Structure

**Top section — Weddings only.** A single scene: the S&S film, with the "Weddings"
title, the copy and a "View the work" link sitting on the picture at the lower left,
arranged like the Home hero. The link filters the gallery to Weddings and scrolls to
it. There is no scroll-scrubbed chapter stage any more, and nothing sits above or
below the film except the gallery.

The film is rendered by the **Home page's own block**, `CinematicFilm`, which takes a
`film` prop and falls back to the `FILM` constant:

```tsx
<CinematicFilm film={WORK_FILM} label="Weddings film" overlay={<…title, copy, link… />} />
```

`overlay` is a `ReactNode` rendered inside the frame, above the media at `z-30`, and
the wrapper is `pointer-events-none` so only the caller's own links take clicks and the
full-size play button still works underneath. Passing it also suppresses the block's
built-in poster caption (`S&S` / `Wedding film`), which sits in the same corner and
would otherwise land on top of the overlay.

The overlay is a prop rather than an absolutely-positioned sibling in `WorkExperience`
on purpose: the film block owns its own `py-8 md:py-14` and `border-t`, so a sibling
would have to hard-code those offsets and would drift the moment the block's padding
changed. Inside the frame, the text is positioned against the picture itself.

Reusing it means the Work film gets the same scroll-linked open-from-inset, poster
fallback, mute control, iOS-safe autoplay and reduced-motion behaviour as Home — with
no second implementation to keep in sync. The optional `label` prop sets a different
`aria-label` on the wrapping `<section>`; `overlay` is likewise optional and Home
passes neither, so Home is unaffected.

**No scrim over the film.** An earlier version put the Home hero's bottom scrim
(`rgba(11,11,12,.15)` → `.88`) over the picture for legibility. It was dulling the
video badly — 88% black across the bottom third — and it was not needed. Sampling the
composited pixels with the overlay in place showed the film's lower-left band is
consistently dark on its own (median relative luminance 0.006–0.06), so the subheading
still measures 6.5:1 to 13:1 against it, above the 4.5:1 that 12px text needs. The
scrim was removed; do not add it back without re-measuring the same band.

### Phones needed their own treatment

A 16:9 frame on a 393px phone is 221px tall. A title, a two-line subheading and a link
came to 132px of that — 60% of the picture — which pushed the title up to 29% down the
frame, so it read as sitting at the top rather than the bottom-left. Two changes fixed
it, both scoped to below `md` so the tablet and desktop layout is untouched:

- `frame="tall"`: **4:3 on phones, 16:9 from `md` up**, on both this page and the Home
  page's film. A 4:3 window on a 16:9 source crops 12.5% off each side. That is the
  deliberate trade: it is the "a little vertical" phone frame, and it stops the film
  reading as a letterboxed slot. 3:4 portrait was rejected for this — it would crop
  28.9% per side, which is most of the shot.
- Smaller type and tighter gaps (title 20px, sub `text-xs`, `mt-1.5`/`mt-3`) and a
  14px bottom inset instead of `clamp(24px,6%,64px)`.

The block is now 101px of a 250–293px frame (34–40%) and the title starts 54–61% down
on phones, 75% on a laptop. The limit is arithmetic: a 250px-tall frame cannot hold
three lines of text and also have the first line look low. Going further means either
cropping the film harder or dropping the subheading from the overlay on phones.

`frame` defaults to `"wide"`, which is plain 16:9, so the Home page is unaffected.

## The film: S&S, landscape, at every size

| Source | Encoded to | Shown to | Size |
| --- | --- | --- | --- |
| `S&S.M4V` (4K, 3840x2160, 23.976fps, 303MB, 128s) | `work-weddings.mp4` 1920x1080 | **every device** | ~61MB |
| — | `work-weddings-poster.jpg` 1920x1080 | every device | ~199KB |

Both are faststart. The source is 4K, so it is transcoded rather than served as-is.

`CinematicFilm` has two modes, chosen by `film.vertical`. The weddings film uses the
default one, so there is a single `<source>` with no media queries and the frame is
16:9 at every width, phones included.

### The other mode, currently unused

`vertical: true` switches to a 9:16 reel: one `srcVertical` source, the 9:16 frame, and
`posterVertical`. Nothing sets it today. The width cap exists because a 9:16 frame at
1440px wide would be 2560px tall — taller than the page — so it becomes
`max-w-[420px] mx-auto`, a phone-shaped portrait block centred on the page. The fields
are kept because flipping back is one block in `lib/work.ts` rather than a re-encode.

| | sources | frame | poster |
| --- | --- | --- | --- |
| default (**weddings**) | `src720` below 900px if set, then `src` | `aspect-[16/9] w-full` | `poster` |
| `vertical: true` | `srcVertical`, then `src` as fallback | `aspect-[9/16] max-w-[420px] mx-auto` | `posterVertical` |

### Two things not set, on purpose

- `src720` is unset, so phones download the 61MB master rather than a lighter cut.
  Setting it gives phones a 720p encode below 900px, exactly as Home does. Worth
  adding if 61MB is too heavy on mobile data.
- `src` in the vertical mode is only a fallback, reached if `srcVertical` fails to
  load. There is no second `<source>` for the default mode's 404 case.

Re-encoding, if you ever need to redo it:
```bash
ffmpeg -i "S&S.M4V" -map 0:v:0 -map 0:a:0 -vf scale=1920:1080:flags=lanczos \
  -c:v libx264 -profile:v high -level 4.1 -preset slow -crf 25 -maxrate 5M -bufsize 10M \
  -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart work-weddings.mp4
```
