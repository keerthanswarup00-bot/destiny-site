import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Link from "next/link";
import { CHAT_CTA } from "@/lib/constants";

export default function ChatCTA() {
  return (
    <section id="contact" aria-labelledby="chat-cta" className="border-t border-line py-14 text-center md:py-[90px]">
      <Container>
        <Reveal>
          <h2 id="chat-cta" className="mx-auto mb-4 max-w-[16ch] font-display text-[clamp(26px,7vw,42px)] font-normal italic leading-[1.1]">
            {CHAT_CTA.title}
          </h2>
          <p className="mx-auto mb-6 max-w-[38ch] text-sm leading-relaxed text-mute">{CHAT_CTA.body}</p>
          <Link
            href={CHAT_CTA.href}
            className="inline-block bg-gold px-7 py-3.5 text-sm font-bold text-bg transition-opacity hover:opacity-90"
          >
            {CHAT_CTA.button} →
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
