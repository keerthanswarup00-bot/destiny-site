import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { TESTIMONIALS } from "@/lib/constants";

const isProd = process.env.NODE_ENV === "production";

/**
 * Placeholder testimonials are hidden in production builds, so a fake review can never ship.
 * Add real ones in lib/constants.ts (omit `placeholder`) and the section appears.
 */
export default function Testimonials() {
  const items = TESTIMONIALS.filter((t) => !(t.placeholder && isProd));
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="testimonials" className="border-t border-line py-11 md:py-[70px]">
      <Container>
        <Reveal>
          <SectionHead id="testimonials" title="In their words." />
        </Reveal>
        <ul className="-mx-5 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {items.map((t, i) => (
            <li key={i} className="w-[78vw] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none">
              <figure className="h-full rounded-[3px] border border-line p-[22px]">
                <blockquote className="mb-3.5 font-display text-base italic leading-normal">“{t.quote}”</blockquote>
                <figcaption className="text-[12.5px] font-semibold text-mute">
                  {t.name} — {t.context}
                </figcaption>
                {t.placeholder && <p className="mt-3 text-[9px] text-gold">PLACEHOLDER — dev only, hidden in production</p>}
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
