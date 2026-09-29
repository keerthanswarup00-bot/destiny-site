"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import RevealImage from "@/components/ui/RevealImage";
import { ABOUT_HERO } from "@/lib/about";

const line: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * About-page hero. Deliberately the same construction as the Home hero — full-bleed frame,
 * slow settle, staggered display lines sitting in the lower third — so landing here feels like
 * moving deeper into the same film rather than arriving on a different site.
 */
export default function AboutHero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <RevealImage
          src={ABOUT_HERO.image}
          alt={ABOUT_HERO.alt}
          label="HERO — grand wedding couple, full-bleed image"
          tone="gold"
          priority
          sizes="100vw"
          className="h-full w-full"
        />
      </motion.div>

      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(11,11,12,.3)_0%,rgba(11,11,12,.1)_40%,rgba(11,11,12,.94)_100%)]" />

      <div className="absolute inset-x-0 bottom-[clamp(32px,8vh,72px)] z-20">
        <div className="mx-auto w-full max-w-[1320px] px-5 md:px-12">
          <motion.p
            className="mb-4 text-[10px] font-medium uppercase tracking-[0.28em] text-paper/80 md:text-xs"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            {ABOUT_HERO.eyebrow}
          </motion.p>

          <motion.h1
            className="max-w-[16ch] font-display text-[clamp(30px,8vw,62px)] font-normal italic leading-[1.06] md:max-w-[20ch]"
            initial={reduce ? "show" : "hidden"}
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.3, delayChildren: 0.35 } } }}
          >
            {ABOUT_HERO.lines.map((l) => (
              <motion.span key={l} variants={line} className="block">
                {l}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-[52ch] text-[14px] leading-relaxed text-paper/75 md:text-[15px]"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95 }}
          >
            {ABOUT_HERO.body}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
