"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Film } from "@/lib/films";

interface Props {
  items: Film[];
  openId: string | null;
  onChange: (id: string | null) => void;
  orientation: "horizontal" | "vertical";
}

/**
 * Full-screen player, shared by Signature Films (16:9) and Reels (9:16).
 * Native <video controls>, no autoplay — the person presses play themselves.
 */
export default function FilmLightbox({ items, openId, onChange, orientation }: Props) {
  const index = items.findIndex((i) => i.id === openId);
  const item = index >= 0 ? items[index] : null;
  const vertical = orientation === "vertical";

  const go = useCallback((d: number) => {
    if (index < 0) return;
    onChange(items[(index + d + items.length) % items.length].id);
  }, [index, items, onChange]);

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
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [item, go, onChange]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          role="dialog" aria-modal="true" aria-label={item.title}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-bg/95 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => onChange(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ aspectRatio: vertical ? "9/16" : "16/9", width: vertical ? "min(88vw, calc(80svh * 9 / 16))" : "min(92vw, 1100px)" }}
            className="relative overflow-hidden rounded-[3px] bg-black"
          >
            {item.src ? (
              <video key={item.id} className="h-full w-full" src={item.src} poster={item.poster} controls playsInline />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#1a1a1c] text-center text-mute">
                <span className="text-[11px]">FILM FILE — {item.title}</span>
                <span className="text-[10px] opacity-70">{vertical ? "portrait 9:16" : "landscape 16:9"} video goes here</span>
              </div>
            )}
          </div>

          <div className="text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="mt-1 text-xs text-mute">{item.context}{item.duration ? ` · ${item.duration}` : ""}</p>
          </div>

          <button type="button" aria-label="Close" onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full border border-line text-lg hover:border-gold">×</button>
          {items.length > 1 && (
            <>
              <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }}
                className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line hover:border-gold md:flex">←</button>
              <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }}
                className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line hover:border-gold md:flex">→</button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
