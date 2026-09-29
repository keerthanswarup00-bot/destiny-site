import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import RevealImage from "@/components/ui/RevealImage";
import { AMAN } from "@/lib/about";
import { VIP } from "@/lib/contact";

/**
 * Aman Swaroop, laid out as a magazine profile rather than a bio block: a tall portrait against
 * an offset column of copy, with the list of what he brought into the studio set as a plain
 * editorial list instead of tags or cards.
 */
export default function AboutAman() {
  return (
    <section aria-labelledby="aman" className="border-t border-line py-11 md:py-[70px]">
      <Container>
        <div className="grid gap-9 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:items-start md:gap-14">
          <Reveal>
            <RevealImage
              src={AMAN.portrait}
              alt={AMAN.portraitAlt}
              label={AMAN.portraitLabel}
              tone="sand"
              sizes="(min-width:768px) 42vw, 100vw"
              className="aspect-[4/5] w-full"
            />
          </Reveal>

          <div className="md:pt-6">
            <Reveal delay={0.08}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                {VIP.name} · {VIP.role}
              </p>
              <h2
                id="aman"
                className="mt-3 max-w-[18ch] font-display text-[clamp(26px,6vw,42px)] font-normal italic leading-[1.08]"
              >
                {AMAN.title}
              </h2>
            </Reveal>

            {AMAN.body.map((p, i) => (
              <Reveal key={i} delay={0.14 + i * 0.06}>
                <p className="mt-5 max-w-[52ch] text-[15px] leading-[1.75] text-mute first-of-type:text-[16px] first-of-type:text-paper/90">
                  {p}
                </p>
              </Reveal>
            ))}

            <Reveal delay={0.26}>
              <h3 className="mt-9 text-[11px] font-semibold uppercase tracking-[0.22em] text-mute">
                What he brought
              </h3>
              <ul className="mt-4 grid max-w-[30rem] grid-cols-1 border-t border-line sm:grid-cols-2 sm:gap-x-8">
                {AMAN.brought.map((b) => (
                  <li
                    key={b}
                    className="border-b border-line py-2.5 text-[13.5px] text-paper/85 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
