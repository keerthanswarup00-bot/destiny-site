import Link from "next/link";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { HERITAGE } from "@/lib/constants";

/** Small trust strip. The full timeline belongs on /about, not here. */
export default function HeritageStrip() {
  return (
    <section aria-label="Our heritage" className="border-t border-line py-11 md:py-[70px]">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-4 rounded-[3px] border border-line p-5 md:flex-row md:items-center md:gap-8 md:p-7">
            <span className="font-display text-[clamp(32px,8vw,48px)] leading-none text-gold">{HERITAGE.year}</span>
            <p className="flex-1 text-[13.5px] leading-relaxed text-mute md:text-sm">{HERITAGE.text}</p>
            <Link href={HERITAGE.href} className="whitespace-nowrap text-[13px] font-semibold text-gold">
              Our story →
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
