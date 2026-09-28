import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { ABOUT } from "@/lib/constants";

export default function AboutDestiny() {
  return (
    <section aria-labelledby="about-destiny" className="border-t border-line py-11 md:py-[70px]">
      <Container>
        <Reveal>
          <SectionHead id="about-destiny" title={ABOUT.title} />
          <p className="max-w-[56ch] text-[15.5px] leading-[1.75] text-mute">{ABOUT.body}</p>
        </Reveal>
      </Container>
    </section>
  );
}
