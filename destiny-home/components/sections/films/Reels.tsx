"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import MediaBlock from "@/components/ui/MediaBlock";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { FILM_REELS } from "@/lib/films";
import FilmLightbox from "./FilmLightbox";

/** Short vertical clips. A swipeable row of phone-shaped cards — the one place a reel-native layout fits the content. */
export default function Reels() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section aria-labelledby="reels" className="border-t border-line py-14 md:py-20">
      <Container>
        <Reveal>
          <SectionHead id="reels" title="Reels." intro="Quick clips — teasers, first looks, highlights." />
        </Reveal>
      </Container>

      <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:px-12 [&::-webkit-scrollbar]:hidden">
        {FILM_REELS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setOpenId(f.id)}
            aria-label={`Play ${f.title}`}
            className="group relative aspect-[9/16] w-[42vw] max-w-[220px] shrink-0 overflow-hidden rounded-[3px] md:w-[200px]"
          >
            <div className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]">
              <MediaBlock src={f.poster} alt={f.title} label={`REEL — ${f.title}, portrait`} tone={f.tone} className="h-full w-full" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(11,11,12,.85)_100%)]" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/50 text-[11px] backdrop-blur-[2px]">▶</span>
            </span>
            <span className="absolute bottom-2.5 left-3 right-3 text-left">
              <span className="block text-[12.5px] font-semibold leading-tight">{f.title}</span>
              <span className="mt-0.5 block text-[10.5px] text-mute">{f.context}{f.duration ? ` · ${f.duration}` : ""}</span>
            </span>
          </button>
        ))}
      </div>

      <FilmLightbox items={FILM_REELS} openId={openId} onChange={setOpenId} orientation="vertical" />
    </section>
  );
}
