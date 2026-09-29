import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { TEAM } from "@/lib/about";

/**
 * The team and what it can cover.
 *
 * Framed as one studio assembling a production, not as a services list with prices — so the
 * groups are separated by hairlines on a shared grid rather than boxed into cards, and there
 * are no icons. The closing line is the point of the section.
 */
export default function AboutTeam() {
  return (
    <section aria-labelledby="team" className="border-t border-line py-11 md:py-[70px]">
      <Container>
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <Reveal>
            <h2
              id="team"
              className="max-w-[14ch] font-display text-[clamp(26px,6vw,42px)] font-normal italic leading-[1.08]"
            >
              {TEAM.title}
            </h2>
            <p className="mt-5 max-w-[42ch] text-[15px] leading-[1.75] text-mute">{TEAM.body}</p>
            <p className="mt-6 max-w-[38ch] font-display text-[19px] font-normal italic leading-snug text-gold md:text-[21px]">
              Whatever the production needs, Destiny can bring the right people together to
              deliver it.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-x-10 sm:grid-cols-2">
              {TEAM.groups.map((g) => (
                <div key={g.id} className="border-t border-line py-6">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                    {g.label}
                  </h3>
                  <ul className="mt-3.5 space-y-1.5">
                    {g.items.map((item) => (
                      <li key={item} className="text-[13.5px] leading-relaxed text-paper/80">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
