"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import ResponsivePhoto from "@/components/ui/ResponsivePhoto";
import SectionHead from "@/components/ui/SectionHead";
import {
  CATEGORY_COUNTS, PILLARS, imagesInCategory, ratioOf,
  type CategoryId, type WorkItem,
} from "@/lib/work";
import WorkLightbox from "./WorkLightbox";

export type Filter = CategoryId | "all";

/**
 * What each column is roughly this wide, so the browser can pick a rung from the generated
 * ladder instead of guessing. Derived from Container (max 1320px, 48px side padding) and the
 * column counts below: 4 columns from 1280px, 3 from 768px, 2 below that. Each value errs a
 * little wide, which is the safe direction — it costs a few KB rather than an upscaled frame.
 */
const GRID_SIZES = "(min-width:1280px) 300px, (min-width:768px) 34vw, 50vw";

const CHIPS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  ...PILLARS.map((c) => ({ id: c.id, label: c.label })),
];

/** How many frames to skip lazy-loading on. A multi-column grid puts the *top of every column*
 *  in the first viewport, and the browser loads in-viewport lazy images straight away, so this
 *  only needs to cover the opening of the first column; the rest arrives as the reader scrolls. */
const EAGER = 6;

/**
 * Editorial masonry.
 *
 * The previous grid gave every photo a fixed row height (`auto-rows-[15vw]`) and a hand-assigned
 * span from a repeating pattern, then cropped each one with `object-cover` to fit. That threw
 * away the composition of every photograph and made a 3:2 frame and a 2:3 frame look like the
 * same card. Here each item is sized by its own aspect ratio, so the browser lays the columns
 * out by real height and the page reads as a spread rather than a card grid.
 *
 * CSS multi-column does the balancing natively: no measuring in JS, no reflow on resize, and
 * no layout shift because every box is reserved before the image loads. `break-inside` keeps a
 * frame whole instead of letting the column break through it.
 */
export default function WorkGallery({ filter, onFilter }: { filter: Filter; onFilter: (f: Filter) => void }) {
  const reduce = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);
  const items = imagesInCategory(filter);
  const count = CATEGORY_COUNTS[filter];
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section aria-labelledby="gallery-title" className="pb-14 md:pb-20">
      <Container className="pt-14 md:pt-20">
        <SectionHead id="gallery-title" title="Frames from real days." intro="Tap any frame to open it. Full client galleries are shared privately." />
      </Container>

      <div className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-30 border-b border-line bg-bg/85 backdrop-blur-md">
        <Container>
          <div className="flex gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CHIPS.map((c) => {
              const active = filter === c.id;
              const n = CATEGORY_COUNTS[c.id];
              return (
                <button key={c.id} type="button" aria-pressed={active} onClick={() => onFilter(c.id)}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${active ? "text-gold" : "text-mute hover:text-paper"}`}>
                  {active && <motion.span layoutId="work-chip" className="absolute inset-0 rounded-full border border-gold" />}
                  <span className="relative">{c.label}</span>
                  {/* A pillar with no photographs yet still gets a chip — dropping it would hide
                      the fact that the category exists — but it says how empty it is. */}
                  <span className={`relative ml-1.5 text-[11px] tabular-nums ${active ? "text-gold/70" : "text-mute/60"}`}>
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
        </Container>
      </div>

      <Container className="pt-5 md:pt-8">
        {count === 0 ? (
          <EmptyState label={CHIPS.find((c) => c.id === filter)?.label ?? ""} />
        ) : (
          <ul
            className="[column-fill:balance] [column-count:2] [column-gap:0.5rem] md:[column-count:3] xl:[column-count:4] xl:[column-gap:0.75rem]"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((item, i) => (
                <Frame
                  key={item.id}
                  item={item}
                  index={i}
                  eager={i < EAGER}
                  reduce={!!reduce}
                  ease={ease}
                  onOpen={() => setOpenId(item.id)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
        <WorkLightbox items={items} openId={openId} onChange={setOpenId} />
      </Container>
    </section>
  );
}

/** One photograph, at its own aspect ratio. */
function Frame({
  item, index, eager, reduce, ease, onOpen,
}: {
  item: WorkItem;
  index: number;
  eager: boolean;
  reduce: boolean;
  ease: readonly [number, number, number, number];
  onOpen: () => void;
}) {
  return (
    <motion.li
      // A short, capped stagger: enough to read as a sequence, short enough that the last
      // frame in a 52-image spread isn't a second and a half behind the first.
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.55, ease, delay: Math.min(index, 11) * 0.035 }
      }
      // `mb` is the gutter inside a multi-column flow — a gap property does not apply between
      // items that the column engine has already separated.
      className="group relative mb-2 break-inside-avoid overflow-hidden rounded-[3px] xl:mb-3"
      style={{ aspectRatio: ratioOf(item) }}
    >
      <button type="button" onClick={onOpen} className="absolute inset-0 block h-full w-full text-left">
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]">
          <ResponsivePhoto
            src={item.src}
            srcSet={item.srcSet}
            sizes={GRID_SIZES}
            alt={item.title}
            width={item.width}
            height={item.height}
            lqip={item.lqip}
            eager={eager}
            priority={index === 0}
            /* `contain`, not `cover`. The box is already the photo's exact ratio, so the two are
               visually identical here — but `contain` makes it impossible to crop even if a box
               ever ends up a pixel off, which is the failure this whole rebuild exists to prevent. */
            className="h-full w-full object-contain"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_62%,rgba(11,11,12,.72)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <p className="absolute bottom-2.5 left-3 text-[12px] font-semibold opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:bottom-3">
          {item.title}
        </p>
      </button>
    </motion.li>
  );
}

/** Shown for a pillar that has no photographs yet. Honest, and still on-brand. */
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center md:py-28">
      <p className="font-display text-[clamp(20px,4vw,28px)] font-normal italic">{label}</p>
      <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-mute">
        This collection is being edited and goes live shortly. Meanwhile, the weddings and
        pre-wedding work is open under All.
      </p>
    </div>
  );
}
