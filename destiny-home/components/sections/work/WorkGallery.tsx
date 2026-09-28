"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import MediaBlock from "@/components/ui/MediaBlock";
import SectionHead from "@/components/ui/SectionHead";
import { PILLARS, WORK_ITEMS, type CategoryId, type Size } from "@/lib/work";
import WorkLightbox from "./WorkLightbox";

export type Filter = CategoryId | "all";

const SPAN: Record<Size, string> = { s: "", t: "row-span-2", w: "col-span-2" };
const CHIPS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  ...PILLARS.map((c) => ({ id: c.id, label: c.label })),
];

export default function WorkGallery({ filter, onFilter }: { filter: Filter; onFilter: (f: Filter) => void }) {
  const reduce = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);
  const items = filter === "all" ? WORK_ITEMS : WORK_ITEMS.filter((i) => i.category === filter);
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section aria-labelledby="gallery-title" className="pb-14 md:pb-20">
      <Container className="pt-14 md:pt-20">
        <SectionHead id="gallery-title" title="Frames from real days." intro="Tap any frame to open it. Full client galleries are shared privately." />
      </Container>

      <div className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-30 border-b border-line bg-bg/85 backdrop-blur-md">
        <Container>
          <div className="flex gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CHIPS.map((c) => {
              const active = filter === c.id;
              return (
                <button key={c.id} type="button" aria-pressed={active} onClick={() => onFilter(c.id)}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${active ? "text-gold" : "text-mute hover:text-paper"}`}>
                  {active && <motion.span layoutId="work-chip" className="absolute inset-0 rounded-full border border-gold" />}
                  <span className="relative">{c.label}</span>
                </button>
              );
            })}
          </div>
        </Container>
      </div>

      <Container className="pt-5 md:pt-8">
        <LayoutGroup id="work">
          <ul className="relative grid auto-rows-[42vw] grid-flow-dense grid-cols-2 gap-2 md:auto-rows-[15vw] md:grid-cols-4 md:gap-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item) => {
                const tone = PILLARS.find((p) => p.id === item.category)?.tone ?? "gold";
                return (
                  <motion.li
                    key={item.id}
                    layoutId={`work-${item.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={reduce ? { duration: 0 } : { layout: { duration: 0.6, ease }, opacity: { duration: 0.4 } }}
                    className={`${SPAN[item.size]} group relative overflow-hidden rounded-[3px]`}
                  >
                    <button type="button" aria-label={`Open ${item.title}`} onClick={() => setOpenId(item.id)} className="absolute inset-0 block h-full w-full text-left">
                      <div className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]">
                        <MediaBlock src={item.image} alt={item.title} label={item.title} tone={tone} sizes="(min-width:768px) 25vw, 50vw" className="h-full w-full" />
                      </div>
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(11,11,12,.75)_100%)]" />
                      <p className="absolute bottom-2.5 left-3 text-[12px] font-semibold">{item.title}</p>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          <WorkLightbox items={items} openId={openId} onChange={setOpenId} />
        </LayoutGroup>
      </Container>
    </section>
  );
}
