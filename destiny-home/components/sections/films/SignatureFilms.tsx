"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import MediaBlock from "@/components/ui/MediaBlock";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { SIGNATURE_FILMS } from "@/lib/films";
import FilmLightbox from "./FilmLightbox";

/** One big cinematic frame at a time, stacked. This is where someone should stop scrolling and watch. */
export default function SignatureFilms() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section aria-labelledby="signature-films" className="py-14 md:py-20">
      <Container>
        <Reveal>
          <SectionHead id="signature-films" title="Signature Films." intro="Full films, the way each day actually unfolded." />
        </Reveal>
      </Container>

      <Container className="flex flex-col gap-4 md:gap-6">
        {SIGNATURE_FILMS.map((f) => (
          <Reveal key={f.id}>
            <button
              type="button"
              onClick={() => setOpenId(f.id)}
              aria-label={`Play ${f.title}`}
              className="group relative block aspect-[16/10] w-full overflow-hidden rounded-[3px] md:aspect-[21/9]"
            >
              <div className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]">
                <MediaBlock src={f.poster} alt={f.title} label={`SIGNATURE FILM — ${f.title}, landscape`} tone={f.tone} className="h-full w-full" />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(11,11,12,.85)_100%)]" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-paper/50 text-[13px] backdrop-blur-[2px] transition-transform duration-300 group-hover:scale-110">▶</span>
              </span>
              <span className="absolute bottom-4 left-5 text-left md:bottom-6 md:left-8">
                <span className="block text-base font-semibold md:text-lg">{f.title}</span>
                <span className="mt-0.5 block text-xs text-mute md:text-sm">{f.context}{f.duration ? ` · ${f.duration}` : ""}</span>
              </span>
            </button>
          </Reveal>
        ))}
      </Container>

      <FilmLightbox items={SIGNATURE_FILMS} openId={openId} onChange={setOpenId} orientation="horizontal" />
    </section>
  );
}
