import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import EnquiryForm from "@/components/sections/contact/EnquiryForm";
import DirectContact from "@/components/sections/contact/DirectContact";
import TrustRow from "@/components/sections/contact/TrustRow";
import VipSection from "@/components/sections/contact/VipSection";

export const metadata: Metadata = {
  title: "Contact — Destiny",
  description: "Tell us your event date and type — we'll reply within one business day. For VIP or confidential events, speak directly with the founder.",
};

export default function ContactPage() {
  return (
    <>
      <section className="pb-10 pt-28 md:pb-14 md:pt-36">
        <Container>
          {/* `min-w-0` on both columns. A grid item's automatic minimum size is its
              min-content width, and the form's widest control (the event-type select,
              whose longest option is "Baby shower / Naming ceremony") sets that floor.
              Without this the track refuses to shrink below the select and the whole page
              scrolls sideways on phones narrower than ~430px. */}
          <div className="grid gap-12 md:grid-cols-[1.3fr_1fr] md:gap-16">
            <div className="min-w-0">
              <h1 className="max-w-[14ch] font-display text-[clamp(34px,7vw,56px)] font-normal italic leading-[1.05]">
                Tell us what you&rsquo;re planning.
              </h1>
              <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-mute">
                Fill in what you know — even just your name and number is enough to start. We&rsquo;ll reply with the right next step.
              </p>
              <div className="mt-10">
                <EnquiryForm />
              </div>
            </div>
            <div className="min-w-0 md:pt-2">
              <DirectContact />
              <TrustRow />
            </div>
          </div>
        </Container>
      </section>

      <VipSection />
    </>
  );
}
