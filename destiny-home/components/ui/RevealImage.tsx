"use client";

import { motion, useReducedMotion } from "framer-motion";
import MediaBlock from "@/components/ui/MediaBlock";
import type { Tone } from "@/lib/constants";

interface Props {
  src?: string;
  alt: string;
  /** Shown on the placeholder so it is never a silent empty box. */
  label: string;
  tone?: Tone;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Seconds the clip takes to open. 0 skips the reveal entirely. */
  delay?: number;
}

/**
 * Image that opens with a clip-path wipe as it arrives, then settles.
 *
 * Built on MediaBlock rather than next/image directly, so a missing file still produces the
 * site's labelled placeholder instead of a broken frame — and so every image on the site goes
 * through one component. Reduced motion gets the frame at rest, with no wipe and no scale.
 */
export default function RevealImage({
  src, alt, label, tone = "gold", priority = false, sizes = "100vw", className = "", delay = 0,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={reduce ? false : { clipPath: "inset(0% 0% 100% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <MediaBlock src={src} alt={alt} label={label} tone={tone} priority={priority} sizes={sizes} className="h-full w-full" />
    </motion.div>
  );
}
