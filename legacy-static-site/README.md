# Destiny Studio — Website

Mobile-first, 6-page static site. Open `index.html` in a browser, or use VS Code's
Live Server extension to preview with routing. From a terminal:
`python3 -m http.server 8080` then http://localhost:8080/

All styling lives in `css/style.css` and all behavior in `js/main.js` — pages are
markup only, no inline `<style>`/`<script>`.

## Structure
```
destiny-site/
├── index.html      Home — hero, full-width film, coverflow categories, about, heritage, testimonials, chat CTA
├── work.html        Portfolio — tabs (currently static links) + masonry gallery
├── films.html        Video reel grid
├── studio.html        Team / capabilities
├── services.html       Packages by client type
├── contact.html         Inquiry form + direct contact info
├── css/style.css        Shared theme (mobile-first, breakpoints at 768px / 900px / 1100px)
├── js/main.js            Mobile nav toggle + scroll-reveal + coverflow scaling
└── assets/                 Put real photos/videos here
```

## Navigation markup (every page)
Each page repeats the same two blocks — don't drop one:
- `.navlinks` inside `nav` — the desktop link row
- `#mobilemenu` right after `</nav>` — the full-screen mobile drawer

`js/main.js` toggles `.open` on both `#burger` and `#mobilemenu`. `.mobilemenu` is
`display:none` at ≥900px, so the pair never shows at the same time. The grid columns
are assigned explicitly (`.brand` → col 1, `.navlinks`/`.navcta` → col 2,
`.navcta`/`.burger` → col 3) to stop items wrapping into a second row.

## Theme tokens (css/style.css :root)
- `--bg` #0B0B0C — canvas
- `--paper` #F3F1EC — text
- `--gold` #C9A15A — accent / CTAs
- Fonts: Fraunces (italic serif, headings) + Manrope (sans, everything else)

## Placeholder media — what to replace
Every gradient block is a `<div class="ph" data-label="...">` — the label tells you what
belongs there. Two ways to swap in real media:

**Photo:**
```html
<div class="ph" style="background-image:url('assets/wedding-01.jpg'); background-size:cover; background-position:center;">
```

**Video (autoplay hero/background):**
```html
<video class="ph" autoplay muted loop playsinline poster="assets/wedding-01.jpg">
  <source src="assets/wedding-reel.mp4" type="video/mp4">
</video>
```
Keep hero/background videos short (6–15s loops) and compressed (~2–5MB) — this is a
mobile-first site and long files will hurt load time on phones.

**Video (click-to-play in Films/gallery):** wrap the `.ph` block in a link or button
that swaps it for an embedded player / lightbox on click. Not wired up yet — the `.play`
button is currently decorative.

## What's NOT done yet (by design — you asked for structure first)
- Work page category tabs are links, not filtered with JS — currently just navigate to
  `work.html?cat=...`. Add a small script to read the query param and show/hide
  `.masonry` items with a matching `data-cat` attribute if you want real filtering
  without separate pages.
- Contact form has no backend — wire `action=""` to Formspree, Netlify Forms, or your
  own endpoint.
- No real images/videos — all `.ph` blocks are placeholders as described above.
- No lightbox/video player wired to the `.play` buttons.

## Notes on the design decisions
- Weddings gets the largest visual real estate on Home (hero + first/largest category
  card) per your direction — corporate/celebrations/product are one tap away, not buried.
- Dark cinematic canvas was chosen because it's the only palette that makes photo/video
  content look premium instead of competing with UI chrome — the site is a frame for
  your media, not a design piece in its own right.
- Voice: Home stays intimate/boutique ("we spend it making sure none of it disappears");
  Studio page owns the 20-person scale directly. That split was your call — keep it
  consistent if you add more pages.
