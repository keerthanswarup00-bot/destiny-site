"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS, SITE, CHAT_CTA, whatsappUrl } from "@/lib/constants";

/** Logo left · menu centre · CTA right. Menu collapses to a slide-in panel on mobile. */
export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto grid h-16 w-full max-w-[1320px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 md:px-12">
          <Link href="/" className="justify-self-start font-display text-lg font-semibold" onClick={() => setOpen(false)}>
            {SITE.name}
          </Link>

          <nav aria-label="Primary" className="hidden justify-self-center gap-7 text-[13.5px] font-medium text-[#D8D6D2] md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-gold">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="col-start-3 flex items-center gap-4 justify-self-end md:col-start-auto">
            <a
              href={whatsappUrl(CHAT_CTA.prefill)}
              className="whitespace-nowrap border border-gold px-3.5 py-2 text-xs font-semibold text-gold transition-colors hover:bg-gold hover:text-bg"
            >
              {CHAT_CTA.button}
            </a>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
              className="relative h-4 w-6 md:hidden"
            >
              <motion.span className="absolute left-0 right-0 h-px bg-paper" animate={open ? { top: 7, rotate: 45 } : { top: 0, rotate: 0 }} />
              <motion.span className="absolute left-0 right-0 top-[7px] h-px bg-paper" animate={{ opacity: open ? 0 : 1 }} />
              <motion.span className="absolute left-0 right-0 h-px bg-paper" animate={open ? { top: 7, rotate: -45 } : { top: 14, rotate: 0 }} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col gap-5 bg-bg px-5 py-7 md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-line pb-3 text-[19px]">
                {l.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
