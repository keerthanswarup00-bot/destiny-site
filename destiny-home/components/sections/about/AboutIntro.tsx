import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { STATS, WHAT_WE_ARE } from "@/lib/about";

/**
 * What Destiny is, and the scale of it.
 *
 * The numbers are set as display type on a hairline grid rather than as three rounded cards —
 * a card row is the stock "About Us" layout, and the point of this section is scale, not
 * features. Dividers are borders, not boxes, so nothing looks like a UI component.
 */
export default function AboutIntro() {
  return (
    <section aria-labelledby="what-we-are" className="border-t border-line py-11 md:py-[70px]">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.35fr_1fr] md:gap-16">
          <Reveal>
            <h2
              id="what-we-are"
              className="mb-6 max-w-[16ch] font-display text-[clamp(26px,6vw,42px)] font-normal italic leading-[1.08]"
            >
              {WHAT_WE_ARE.title}
            </h2>
            <p className="max-w-[54ch] text-[16px] leading-[1.75] text-paper/90 md:text-[17px]">
              {WHAT_WE_ARE.lead}
            </p>
            <p className="mt-5 max-w-[54ch] text-[15px] leading-[1.75] text-mute">{WHAT_WE_ARE.body}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-mute">
              By the numbers
            </p>
            <dl className="grid grid-cols-2 gap-y-7 border-t border-line pt-6 md:grid-cols-1 md:gap-y-0">
              {STATS.map((s, i) => (
                <div
                  key={s.value}
                  className={`flex flex-col justify-center border-line md:flex-row md:items-baseline md:gap-5 md:py-4 ${
                    i % 2 === 0 ? "border-r pr-5" : "pl-5"
                  } md:border-r-0 md:pr-0 ${i < 2 ? "md:border-t" : ""} ${i > 0 ? "border-t md:border-t" : ""}`}
                >
                  <dt className="order-2 text-[12.5px] leading-snug text-mute md:order-1 md:w-[46%]">{s.label}</dt>
                  <dd className="order-1 font-display text-[clamp(34px,7vw,52px)] font-normal italic leading-none text-gold md:order-2">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
