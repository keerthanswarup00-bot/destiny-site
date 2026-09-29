"use client";

import { useRef, useState } from "react";
import {
  motion, useMotionTemplate, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue,
} from "framer-motion";
import MediaBlock from "@/components/ui/MediaBlock";
import { MILESTONES, type Milestone } from "@/lib/about";

const N = MILESTONES.length;

const GRAIN_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>";
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`;

const SHADE =
  "absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,12,.3)_0%,rgba(11,11,12,.15)_35%,rgba(11,11,12,.9)_100%)] md:bg-[linear-gradient(90deg,rgba(11,11,12,.88)_0%,rgba(11,11,12,.4)_55%,rgba(11,11,12,.1)_100%)]";

function Copy({ m }: { m: Milestone }) {
  return (
    <div className="max-w-[44rem]">
      <p className="font-display text-[clamp(44px,11vw,104px)] font-normal italic leading-none text-gold">{m.tag}</p>
      <h2 className="mt-3 font-display text-[clamp(24px,5vw,40px)] font-normal italic leading-tight">{m.title}</h2>
      <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-paper/80 md:text-base">{m.body}</p>
    </div>
  );
}

/** The photo layer of one era. Each new era wipes up over the previous one like a curtain. */
function SceneImage({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const m = MILESTONES[i];
  const start = i / N;
  const end = (i + 1) / N;
  const first = i === 0;
  const clipPath = useTransform(
    progress,
    first ? [0, 1] : [start - 0.1, start],
    first ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"] : ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
  );
  const scale = useTransform(progress, [start - 0.1, end], [1, 1.12]);
  return (
    <motion.div style={{ clipPath }} className="absolute inset-0">
      <motion.div style={{ scale }} className="absolute inset-0">
        <MediaBlock src={m.image} alt={`${m.tag}: ${m.title}`} label={m.mediaHint} tone={m.tone} priority={first} sizes="100vw" className="h-full w-full" />
      </motion.div>
    </motion.div>
  );
}

function SceneText({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const m = MILESTONES[i];
  const start = i / N;
  const end = (i + 1) / N;
  const first = i === 0;
  const last = i === N - 1;
  const opacity = useTransform(
    progress,
    first ? [0, end - 0.1, end - 0.02] : last ? [start - 0.02, start + 0.06, 1] : [start - 0.02, start + 0.06, end - 0.1, end - 0.02],
    first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0],
  );
  const y = useTransform(progress, first ? [0, 0.001] : [start - 0.02, start + 0.08], first ? [0, 0] : [24, 0]);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex items-end md:items-center">
      <div className="mx-auto w-full max-w-[1320px] px-5 pb-[clamp(72px,14vh,120px)] pl-14 md:px-12 md:pb-0 md:pl-24">
        <Copy m={m} />
      </div>
    </motion.div>
  );
}

export default function AboutTimeline() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(N - 1, Math.max(0, Math.floor(v * N)))));

  // "Film developing": black & white + grain in 1972 → full colour, no grain by 2024.
  const gray = useTransform(scrollYProgress, [0, 0.2, 0.45, 0.7, 0.85], [1, 1, 0.55, 0.15, 0]);
  const sepia = useTransform(scrollYProgress, [0, 0.2, 0.45, 0.7, 0.85], [0.25, 0.45, 0.25, 0.05, 0]);
  const filter = useMotionTemplate`grayscale(${gray}) sepia(${sepia}) contrast(1.05)`;
  const grain = useTransform(scrollYProgress, [0, 0.45, 0.85], [0.5, 0.3, 0]);
  const bar = useTransform(scrollYProgress, [0.72, 0.9], ["0svh", "7svh"]); // cinematic letterbox closes in for 2024
  const railFill = useTransform(scrollYProgress, [0, (N - 1) / N], [0, 1]);
  const cue = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  if (reduce) {
    return (
      <section aria-label="Our history">
        <h1 className="sr-only">About: Swaroop Studios since 1972, and Destiny from 2024</h1>
        {MILESTONES.map((m) => (
          <div key={m.id} className="relative min-h-[70svh] overflow-hidden border-b border-line">
            <MediaBlock src={m.image} alt={m.title} label={m.mediaHint} tone={m.tone} className="absolute inset-0" />
            <div className={SHADE} />
            <div className="relative z-10 flex min-h-[70svh] items-end px-5 pb-14 md:items-center md:px-12 md:pb-0">
              <Copy m={m} />
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={ref} aria-label="Our history" style={{ height: `${N * 100}svh` }} className="relative">
      <h1 className="sr-only">About: Swaroop Studios since 1972, and Destiny from 2024</h1>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-bg">
        <motion.div style={{ filter }} className="absolute inset-0">
          {MILESTONES.map((m, i) => (
            <SceneImage key={m.id} i={i} progress={scrollYProgress} />
          ))}
        </motion.div>

        <div className={SHADE} />

        <motion.div
          aria-hidden
          style={{ opacity: grain, backgroundImage: GRAIN, mixBlendMode: "overlay" }}
          animate={{ x: [0, -8, 5, -4, 0], y: [0, 5, -7, 4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-[-10%] z-10"
        />

        <motion.div aria-hidden style={{ height: bar }} className="absolute inset-x-0 top-16 z-20 bg-black" />
        <motion.div aria-hidden style={{ height: bar }} className="absolute inset-x-0 bottom-0 z-20 bg-black" />

        <div className="absolute inset-0 z-30">
          {MILESTONES.map((m, i) => (
            <SceneText key={m.id} i={i} progress={scrollYProgress} />
          ))}
        </div>

        {/* Timeline rail: line fills as you move through time, one dot per era */}
        <div aria-hidden className="absolute bottom-24 left-5 top-24 z-40 w-px bg-paper/20 md:left-10">
          <motion.div style={{ scaleY: railFill, transformOrigin: "top" }} className="h-full w-full bg-gold" />
          {MILESTONES.map((m, i) => (
            <div key={m.id} className="absolute -translate-x-1/2" style={{ top: `${(i / (N - 1)) * 100}%`, left: "0.5px" }}>
              <span className={`block h-2.5 w-2.5 -translate-y-1/2 rounded-full border transition-colors duration-500 ${i <= active ? "border-gold bg-gold" : "border-paper/40 bg-bg"}`} />
              <span className={`absolute left-4 top-0 hidden -translate-y-1/2 whitespace-nowrap text-xs transition-colors duration-500 md:block ${i === active ? "text-gold" : "text-mute"}`}>{m.tag}</span>
            </div>
          ))}
        </div>

        <motion.p aria-hidden style={{ opacity: cue }} className="pointer-events-none absolute bottom-3 left-1/2 z-40 -translate-x-1/2 text-[10.5px] text-mute">
          Scroll ↓
        </motion.p>
      </div>
    </section>
  );
}
