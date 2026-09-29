import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { VIP, whatsappSendUrl } from "@/lib/contact";

/** Kept visually quieter than the main form — a door for the right person, not a second CTA competing for attention. */
export default function VipSection() {
  return (
    <section aria-labelledby="vip" className="border-t border-line py-11 md:py-[70px]">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start gap-5 rounded-[3px] border border-gold/30 bg-[linear-gradient(180deg,rgba(201,161,90,.06),transparent)] p-6 md:flex-row md:items-center md:justify-between md:p-9">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.05em] text-gold">Private &amp; VIP engagements</p>
              <h2 id="vip" className="mt-2 max-w-[28ch] font-display text-2xl font-normal italic leading-snug md:text-[28px]">
                {VIP.line}
              </h2>
              <p className="mt-2 text-sm text-mute">{VIP.name} · {VIP.role}</p>
            </div>
            <a
              href={whatsappSendUrl(VIP.whatsappNumber, VIP.prefill)}
              className="shrink-0 whitespace-nowrap border border-gold px-6 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-bg"
            >
              Message {VIP.name.split(" ")[0]} →
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
