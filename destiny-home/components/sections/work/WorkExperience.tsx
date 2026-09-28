"use client";

import { useEffect, useState } from "react";
import CinematicFilm from "@/components/sections/CinematicFilm";
import ChatCTA from "@/components/sections/ChatCTA";
import { CHAPTER_COPY, WORK_FILM, type CategoryId } from "@/lib/work";
import WorkGallery, { type Filter } from "./WorkGallery";

const toGallery = (smooth: boolean) =>
  document.getElementById("gallery")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });

export default function WorkExperience({ initialCat }: { initialCat: Filter }) {
  const [filter, setFilter] = useState<Filter>(initialCat);

  // Arriving from a Home category card (/work?cat=weddings) skips the intro and lands on the gallery.
  useEffect(() => {
    if (initialCat !== "all") toGallery(false);
  }, [initialCat]);

  const choose = (id: CategoryId) => {
    setFilter(id);
    requestAnimationFrame(() => toGallery(true));
  };

  return (
    <>
      {/* Single top scene: the weddings film with the title, copy and link sitting on the
          picture, in the Home hero's arrangement. The overlay goes inside the frame
          rather than being positioned over the section, so it can't drift out of step
          with the block's own padding. */}
      <section aria-label="Weddings" className="pt-10 md:pt-14">
        <CinematicFilm
          film={WORK_FILM}
          label="Weddings film"
          frame="tall"
          overlay={
            <>
              <div className="absolute inset-x-0 bottom-[14px] px-5 md:bottom-[clamp(28px,6%,64px)] md:px-12">
                <div className="mx-auto w-full max-w-[1320px]">
                  <h2
                    id="weddings"
                    className="font-display text-[20px] font-normal italic leading-[1.15] text-paper md:text-[clamp(26px,5vw,44px)]"
                  >
                    Weddings
                  </h2>
                  <p className="mt-1.5 max-w-[42ch] text-xs leading-relaxed text-paper/70 md:mt-3 md:text-sm">
                    {CHAPTER_COPY.weddings}
                  </p>
                  <button
                    type="button"
                    onClick={() => choose("weddings")}
                    className="pointer-events-auto mt-3 border-b border-gold pb-1 text-xs font-semibold text-gold md:mt-5 md:text-sm"
                  >
                    View the work
                  </button>
                </div>
              </div>
            </>
          }
        />
      </section>

      <div id="gallery" className="scroll-mt-16">
        <WorkGallery filter={filter} onFilter={setFilter} />
      </div>
      <ChatCTA />
    </>
  );
}
