"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ResponsivePhoto from "@/components/ui/ResponsivePhoto";
import { CATEGORIES } from "@/lib/constants";
import { ratioOf, type WorkItem } from "@/lib/work";

interface Props {
  items: readonly WorkItem[];
  openId: string | null;
  onChange: (id: string | null) => void;
}

/** Full-screen viewer.
 *
 * The frame is sized from the photo's own ratio and bounded by the viewport, so a portrait opens
 * as a portrait and a 3:2 opens as a landscape. The previous version looked the aspect up in a
 * hand-written table of three fake ratios and pinned it on the element, which cropped every
 * photograph that wasn't one of those three.
 */
export default function WorkLightbox({ items, openId, onChange }: Props) {
  const index = items.findIndex((i) => i.id === openId);
  const item = index >= 0 ? items[index] : null;

  const go = useCallback(
    (d: number) => {
      if (index < 0) return;
      onChange(items[(index + d + items.length) % items.length].id);
    },
    [index, items, onChange],
  );

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [item, go, onChange]);

  const cat = item ? CATEGORIES.find((c) => c.id === item.category) : undefined;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-bg/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onChange(null)}
          onPanEnd={(_, info) => {
            if (info.offset.x < -60) go(1);
            else if (info.offset.x > 60) go(-1);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            /* One viewport term and one ratio: whichever is tighter wins, so the whole frame is
               always visible and never needs cropping to fit. */
            style={{
              width: `min(92vw, calc(78svh * ${ratioOf(item)}))`,
              aspectRatio: ratioOf(item),
            }}
            className="relative overflow-hidden rounded-[3px]"
          >
            <ResponsivePhoto
              src={item.src}
              srcSet={item.srcSet}
              sizes="(min-width:1600px) 1600px, 92vw"
              alt={item.title}
              width={item.width}
              height={item.height}
              lqip={item.lqip}
              eager
              className="h-full w-full object-contain"
            />
          </div>

          <div className="text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="mt-1 text-xs tabular-nums text-mute">{index + 1} / {items.length}</p>
          </div>

          <button type="button" aria-label="Close" onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full border border-line text-lg hover:border-gold">×</button>
          <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line hover:border-gold md:flex">←</button>
          <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }}
            className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line hover:border-gold md:flex">→</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
