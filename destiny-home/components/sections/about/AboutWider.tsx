import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import RevealImage from "@/components/ui/RevealImage";
import { WIDER } from "@/lib/about";

/**
 * Beyond weddings. The title sits on a full-bleed frame using the site's own scrim idiom, then
 * the argument and the fields run underneath — the fields read as a widening set of subjects
 * rather than a services list, because they are set as continuous type, not a list of items.
 */
export default function AboutWider() {
  return (
    <section aria-labelledby="wider" className="border-t border-line">
      <div className="relative w-full overflow-hidden">
        <RevealImage
          src="/media/work-weddings-poster.jpg"
          alt="A frame from the Destiny weddings film"
          label="DESTINY — weddings film still"
          tone="plum"
          sizes="100vw"
          className="aspect-[16/10] w-full md:aspect-[21/9]"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,12,.55)_0%,rgba(11,11,12,.25)_45%,rgba(11,11,12,.92)_100%)]" />

        <div className="absolute inset-x-0 bottom-0 z-10">
          <Container>
            <h2
              id="wider"
              className="max-w-[20ch] pb-8 pt-24 font-display text-[clamp(24px,5.5vw,40px)] font-normal italic leading-[1.1] md:pb-12"
            >
              {WIDER.title}
            </h2>
          </Container>
        </div>
      </div>

      <div className="py-11 md:py-[70px]">
        <Container>
          <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:gap-16">
            <Reveal>
              <p className="max-w-[50ch] text-[15.5px] leading-[1.75] text-paper/90 md:text-[16.5px]">
                {WIDER.body}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mute">
                The wider practice
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
                {WIDER.fields.map((f) => (
                  <li
                    key={f}
                    className="font-display text-[19px] font-normal italic leading-none text-gold md:text-[22px]"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </div>
    </section>
  );
}
