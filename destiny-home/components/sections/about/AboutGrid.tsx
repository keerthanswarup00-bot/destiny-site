import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import RevealImage from "@/components/ui/RevealImage";

/**
 * An editorial spread of the studio's own frames, not a gallery.
 *
 * Only real files from public/media are used — nothing here is a stand-in. The composition is
 * deliberately uneven: one wide establishing frame, a tall vertical holding two rows, and two
 * smaller landscapes stepped against it. Motion is the clip wipe only; the page already has a
 * scroll-driven timeline and two video blocks, and a third scroll effect would be noise.
 */
export default function AboutGrid() {
  return (
    <section aria-labelledby="the-work" className="border-t border-line">
      <Container>
        <Reveal>
          <p className="mb-3 pt-11 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold md:pt-[70px]">
            The work
          </p>
          <h2
            id="the-work"
            className="max-w-[18ch] font-display text-[clamp(26px,6vw,42px)] font-normal italic leading-[1.08]"
          >
            What the studio looks like from the inside.
          </h2>
        </Reveal>
      </Container>

      <div className="mt-9 w-full overflow-hidden md:mt-12">
        <RevealImage
          src="/media/work-weddings-poster.jpg"
          alt="A frame from the Destiny weddings film"
          label="DESTINY — weddings film still"
          tone="plum"
          sizes="100vw"
          className="aspect-[16/10] w-full md:aspect-[21/9]"
        />
      </div>

      <Container>
        <div className="grid gap-4 py-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-5 md:py-5">
          <RevealImage
            src="/media/reel-1-poster.jpg"
            alt="A vertical frame from a Destiny teaser reel"
            label="DESTINY — teaser reel frame"
            tone="gold"
            sizes="(min-width:768px) 36vw, 100vw"
            className="aspect-[9/16] w-full md:aspect-[3/4]"
            delay={0.05}
          />

          <div className="grid gap-4 md:gap-5">
            <RevealImage
              src="/media/hero.jpg"
              alt="A wedding couple at their ceremony"
              label="HERO — wedding couple, ceremony"
              tone="steel"
              sizes="(min-width:768px) 56vw, 100vw"
              className="aspect-[4/3] w-full md:aspect-[16/10]"
              delay={0.1}
            />
            <RevealImage
              src="/media/wedding-film-poster.jpg"
              alt="A still from the Destiny wedding film"
              label="DESTINY — wedding film still"
              tone="teal"
              sizes="(min-width:768px) 56vw, 100vw"
              className="aspect-[16/9] w-full"
              delay={0.16}
            />
          </div>
        </div>
      </Container>

      <Container>
        <Reveal>
          <p className="max-w-[56ch] pb-11 pt-2 text-[15px] leading-[1.75] text-mute md:pb-[70px]">
            The same crew that shoots a wedding also shoots the product table and the music
            video. That is not a coincidence of the roster — it is the reason the studio can hold
            a whole day, or a whole campaign, without changing who is making the decisions.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
