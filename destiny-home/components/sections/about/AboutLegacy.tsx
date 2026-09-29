import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { LEGACY } from "@/lib/about";

/**
 * The father-and-son beat, told in type only.
 *
 * There is no 1972 photograph in the project, and inventing one would put a fake archive
 * document on a page whose entire argument is that the history is real. So the era names are
 * set as large type against a single rule instead of being shown as pictures, and the arrow
 * between the columns is the only graphic.
 */
export default function AboutLegacy() {
  return (
    <section aria-labelledby="legacy" className="border-t border-line py-11 md:py-[70px]">
      <Container>
        <Reveal>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            Father and son
          </p>
          <h2
            id="legacy"
            className="max-w-[16ch] font-display text-[clamp(30px,7.5vw,58px)] font-normal italic leading-[1.04]"
          >
            {LEGACY.title}
          </h2>
        </Reveal>

        <div className="mt-10 grid items-start gap-8 border-t border-line pt-9 md:mt-14 md:grid-cols-[1fr_auto_1fr] md:gap-10">
          <Reveal>
            <p className="font-display text-[clamp(30px,6vw,48px)] font-normal italic leading-none text-paper">
              {LEGACY.from}
            </p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-mute">
              {LEGACY.leftLabel}
            </p>
            <p className="mt-4 max-w-[44ch] text-[14.5px] leading-[1.75] text-mute">{LEGACY.leftBody}</p>
          </Reveal>

          <Reveal delay={0.12}>
            <span
              aria-hidden
              className="block font-display text-[clamp(34px,6vw,54px)] font-normal italic leading-none text-gold md:pt-1"
            >
              →
            </span>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="font-display text-[clamp(30px,6vw,48px)] font-normal italic leading-none text-paper">
              {LEGACY.to}
            </p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-mute">
              {LEGACY.rightLabel}
            </p>
            <p className="mt-4 max-w-[44ch] text-[14.5px] leading-[1.75] text-mute">{LEGACY.rightBody}</p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
