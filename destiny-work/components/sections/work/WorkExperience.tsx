"use client";

import { useEffect, useState } from "react";
import ChatCTA from "@/components/sections/ChatCTA";
import type { CategoryId } from "@/lib/work";
import WorkChapters from "./WorkChapters";
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
      <WorkChapters onSelect={choose} />
      <div id="gallery" className="scroll-mt-16">
        <WorkGallery filter={filter} onFilter={setFilter} />
      </div>
      <ChatCTA />
    </>
  );
}
