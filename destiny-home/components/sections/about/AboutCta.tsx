import Link from "next/link";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { CTA } from "@/lib/about";

/**
 * Closing CTA. Same two button styles the site already uses — one filled gold, one outline —
 * so there is a single obvious action on the screen. Both destinations are existing routes.
 */
export default function AboutCta() {
  return (
    <section aria-labelledby="about-cta" className="border-t border-line py-14 text-center md:py-[90px]">
      <Container>
        <Reveal>
          <h2
            id="about-cta"
            className="mx-auto mb-4 max-w-[18ch] font-display text-[clamp(28px,7vw,46px)] font-normal italic leading-[1.06]"
          >
            {CTA.title}
          </h2>
          <p className="mx-auto mb-8 max-w-[40ch] text-sm leading-relaxed text-mute">{CTA.body}</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={CTA.primary.href}
              className="inline-block w-full bg-gold px-7 py-3.5 text-sm font-bold text-bg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:w-auto"
            >
              {CTA.primary.label} →
            </Link>
            <Link
              href={CTA.secondary.href}
              className="inline-block w-full border border-gold px-7 py-3.5 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:w-auto"
            >
              {CTA.secondary.label}
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
