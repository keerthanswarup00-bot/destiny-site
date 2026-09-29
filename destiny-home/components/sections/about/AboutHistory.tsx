import Container from "@/components/ui/Container";

/**
 * History.
 *
 * This was previously a 400svh sticky stage that drove four eras off scroll position: images
 * wiping up like a curtain, a timeline rail, and a film-developing filter running from
 * black-and-white in 1972 to colour. It was removed on request — the page reads as a steady
 * narrative without it, and the eras it carried are summarised in the copy below and expanded
 * in AboutLegacy. The `MILESTONES` data is still in lib/about.ts if the eras are ever wanted
 * back as a static list.
 */
export default function AboutHistory() {
  return (
    <section aria-labelledby="history" className="border-t border-line py-11 md:py-[70px]">
      <Container>
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:gap-16">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              History
            </p>
            <h2
              id="history"
              className="max-w-[18ch] font-display text-[clamp(26px,6vw,42px)] font-normal italic leading-[1.08]"
            >
              A story that started in 1972.
            </h2>
          </div>
          <p className="max-w-[50ch] self-end text-[15px] leading-[1.75] text-mute">
            A father opened a studio. Decades of weddings and family photographs went through
            it. His son looked at what it had become and what it could still be, and rebuilt it
            as Destiny. The foundation never changed — the language did.
          </p>
        </div>
      </Container>
    </section>
  );
}
