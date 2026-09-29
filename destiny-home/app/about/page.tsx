import type { Metadata } from "next";
import ChatCTA from "@/components/sections/ChatCTA";
import AboutTimeline from "@/components/sections/about/AboutTimeline";
import AboutDestiny from "@/components/sections/AboutDestiny";
import HeritageStrip from "@/components/sections/HeritageStrip";
import AboutCrew from "@/components/sections/about/AboutCrew";

export const metadata: Metadata = {
  title: "About — Destiny",
  description: "From Swaroop Studios in 1972 to Destiny in 2024: five decades of photography, now built for modern, cinematic film.",
};

export default function AboutPage() {
  return (
    <>
      <AboutTimeline />
      <AboutDestiny />
      <HeritageStrip />
      <AboutCrew />
      <ChatCTA />
    </>
  );
}
