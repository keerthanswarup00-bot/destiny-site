"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import MediaBlock from "@/components/ui/MediaBlock";
import { HERO } from "@/lib/constants";

const line: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Full-bleed hero. Image (or muted loop video) + two lines of text. No CTA by design.
 * The single load-time motion: slow settle of the image + staggered headline.
 */
export default function HeroMedia() {
  const reduce = useReducedMotion();

  return (
    <section className="relative h-[100svh] min-h-[520px] w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <MediaBlock
          src={HERO.image}
          alt={HERO.alt}
          label="HERO — grand wedding couple, full-bleed image"
          tone="gold"
          priority
          sizes="100vw"
          className="h-full w-full"
        />
        {HERO.video && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={HERO.video}
            poster={HERO.image}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
      </motion.div>

      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(11,11,12,.25)_0%,rgba(11,11,12,.05)_45%,rgba(11,11,12,.9)_100%)]" />

      <div className="absolute inset-x-0 bottom-[clamp(30px,7vh,64px)] z-20">
        <div className="mx-auto w-full max-w-[1320px] px-5 md:px-12">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.28em] text-paper/80 md:text-xs">
            Destiny Events and Photography
          </p>
          <motion.h1
            className="max-w-[20ch] font-display text-[clamp(26px,7vw,46px)] font-normal italic leading-[1.18] md:max-w-[26ch]"
            initial={reduce ? "show" : "hidden"}
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.35, delayChildren: 0.4 } } }}
          >
            <motion.span variants={line} className="block">{HERO.lines[0]}</motion.span>
            <motion.span variants={line} className="block">{HERO.lines[1]}</motion.span>
          </motion.h1>
        </div>
      </div>

      <motion.div
        aria-hidden
        className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 text-[10.5px] text-mute"
        animate={reduce ? undefined : { y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
      >
        Scroll ↓
      </motion.div>
    </section>
  );
}
