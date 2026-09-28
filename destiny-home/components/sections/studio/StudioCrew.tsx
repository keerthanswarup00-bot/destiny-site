import Container from "@/components/ui/Container";
import MediaBlock from "@/components/ui/MediaBlock";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { CREW } from "@/lib/studio";

export default function StudioCrew() {
  return (
    <section aria-labelledby="crew" className="border-t border-line py-11 md:py-[70px]">
      <Container>
        <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14">
          <Reveal>
            <MediaBlock
              alt="The Destiny crew on location"
              label="TEAM — real crew photo, working (not posed)"
              tone="gold"
              sizes="(min-width:768px) 50vw, 100vw"
              className="aspect-[4/3] rounded-[3px]"
            />
          </Reveal>
          <Reveal>
            <SectionHead id="crew" title={CREW.title} />
            <p className="max-w-[46ch] text-[15px] leading-[1.75] text-mute">{CREW.body}</p>
            <ul className="mt-6 grid grid-cols-2 gap-2">
              {CREW.capabilities.map((c) => (
                <li key={c} className="rounded-[3px] border border-line px-4 py-3 text-[13px] font-semibold">{c}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
