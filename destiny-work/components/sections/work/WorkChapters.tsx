"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import MediaBlock from "@/components/ui/MediaBlock";
import { CATEGORIES } from "@/lib/constants";
import { CHAPTER_COPY, type CategoryId } from "@/lib/work";

const N = CATEGORIES.length;
const pad = (n: number) => String(n).padStart(2, "0");

function ChapterText({ i, onSelect }: { i: number; onSelect: (id: CategoryId) => void }) {
  const c = CATEGORIES[i];
  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 pb-[clamp(72px,14vh,130px)] md:px-12">
      <span className="font-display text-lg text-gold">{pad(i + 1)}</span>
      <h2 className="mt-1 font-display text-[clamp(46px,13vw,132px)] font-normal italic leading-[0.95]">{c.label}</h2>
      <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-mute md:text-base">{CHAPTER_COPY[c.id as CategoryId]}</p>
      <button type="button" onClick={() => onSelect(c.id as CategoryId)} className="mt-6 border-b border-gold pb-1 text-sm font-semibold text-gold">
        View the work ↓
      </button>
    </div>
  );
}

const SHADE = "absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,12,.3)_0%,rgba(11,11,12,.05)_40%,rgba(11,11,12,.85)_100%)]";

/** One category "scene". Crossfades with its neighbours, slowly pushes in, parallaxes. All scrubbed by scroll. */
function Chapter({ i, progress, onSelect }: { i: number; progress: MotionValue<number>; onSelect: (id: CategoryId) => void }) {
  const c = CATEGORIES[i];
  const start = i / N;
  const end = (i + 1) / N;
  const first = i === 0;
  const last = i === N - 1;

  const opacity = useTransform(
    progress,
    first ? [0, end - 0.02, end + 0.08] : last ? [start - 0.08, start + 0.02, 1] : [start - 0.08, start + 0.02, end - 0.02, end + 0.08],
    first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0],
  );
  const scale = useTransform(progress, [start - 0.08, end + 0.08], [1.02, 1.16]);
  const imgY = useTransform(progress, [start - 0.08, end + 0.08], ["-3%", "3%"]);
  const textY = useTransform(progress, first ? [0, 0.001] : [start - 0.08, start + 0.04], first ? [0, 0] : [28, 0]);
  const pointerEvents = useTransform(opacity, (v) => (v > 0.5 ? ("auto" as const) : ("none" as const)));

  return (
    <motion.div style={{ opacity, pointerEvents }} className="absolute inset-0">
      <motion.div style={{ scale, y: imgY }} className="absolute inset-[-4%]">
        <MediaBlock src={c.image} alt={`${c.label} — ${c.blurb}`} label={`CHAPTER ${pad(i + 1)} — ${c.label}`} tone={c.tone} priority={first} sizes="100vw" className="h-full w-full" />
      </motion.div>
      <div className={SHADE} />
      <motion.div style={{ y: textY }} className="absolute inset-x-0 bottom-0">
        <ChapterText i={i} onSelect={onSelect} />
      </motion.div>
    </motion.div>
  );
}

export default function WorkChapters({ onSelect }: { onSelect: (id: CategoryId) => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(N - 1, Math.max(0, Math.floor(v * N)))));
  const cue = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  if (reduce) {
    return (
      <section aria-label="Work by category">
        {CATEGORIES.map((c, i) => (
          <div key={c.id} className="relative h-[75svh] overflow-hidden border-b border-line">
            <MediaBlock src={c.image} alt={c.label} label={c.label} tone={c.tone} className="absolute inset-0" />
            <div className={SHADE} />
            <div className="absolute inset-x-0 bottom-0"><ChapterText i={i} onSelect={onSelect} /></div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={ref} aria-label="Work by category" style={{ height: `${N * 100}svh` }} className="relative">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {CATEGORIES.map((c, i) => (
          <Chapter key={c.id} i={i} progress={scrollYProgress} onSelect={onSelect} />
        ))}

        <ol aria-hidden className="pointer-events-none absolute right-8 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 md:flex">
          {CATEGORIES.map((c, i) => (
            <li key={c.id} className={`text-xs tabular-nums transition-all duration-500 ${i === active ? "scale-125 text-gold" : "text-mute/60"}`}>{pad(i + 1)}</li>
          ))}
        </ol>
        <p aria-hidden className="pointer-events-none absolute bottom-6 right-5 z-30 text-xs tabular-nums text-mute md:hidden">
          {pad(active + 1)} / {pad(N)}
        </p>
        <motion.p aria-hidden style={{ opacity: cue }} className="pointer-events-none absolute bottom-3 left-1/2 z-30 -translate-x-1/2 text-[10.5px] text-mute">
          Scroll ↓
        </motion.p>
      </div>
    </section>
  );
}
