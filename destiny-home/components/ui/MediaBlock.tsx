import Image from "next/image";
import type { ReactNode } from "react";
import type { Tone } from "@/lib/constants";

const TONES: Record<Tone, string> = {
  gold: "bg-[radial-gradient(circle_at_30%_30%,#3a2f1c,#0B0B0C_70%)]",
  steel: "bg-[radial-gradient(circle_at_70%_40%,#22262c,#0B0B0C_70%)]",
  plum: "bg-[radial-gradient(circle_at_40%_60%,#2c1a26,#0B0B0C_70%)]",
  teal: "bg-[radial-gradient(circle_at_60%_30%,#16292a,#0B0B0C_70%)]",
  ember: "bg-[radial-gradient(circle_at_35%_45%,#3d2213,#0B0B0C_70%)]",
  olive: "bg-[radial-gradient(circle_at_65%_35%,#222917,#0B0B0C_70%)]",
  indigo: "bg-[radial-gradient(circle_at_50%_55%,#1a1e3a,#0B0B0C_70%)]",
  sand: "bg-[radial-gradient(circle_at_55%_45%,#33291a,#0B0B0C_70%)]",
};

interface Props {
  src?: string;
  alt: string;
  /** Shown on the placeholder so you know exactly which asset belongs here. */
  label: string;
  tone?: Tone;
  priority?: boolean;
  sizes?: string;
  className?: string;
  children?: ReactNode;
}

/** Real image when `src` is set, otherwise a visibly-labeled placeholder. */
export default function MediaBlock({
  src, alt, label, tone = "gold", priority = false, sizes = "100vw", className = "", children,
}: Props) {
  return (
    <div className={`relative overflow-hidden bg-[#1a1a1c] ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <>
          <div className={`absolute inset-0 ${TONES[tone]}`} role="img" aria-label={alt} />
          <span className="absolute left-2 top-2 z-30 bg-black/55 px-2 py-1 text-[9px] text-[#D8D6D2]">
            {label}
          </span>
        </>
      )}
      {children}
    </div>
  );
}
