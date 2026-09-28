import type { Metadata } from "next";
import ChatCTA from "@/components/sections/ChatCTA";
import StudioTimeline from "@/components/sections/studio/StudioTimeline";
import StudioCrew from "@/components/sections/studio/StudioCrew";

export const metadata: Metadata = {
  title: "Studio — Destiny",
  description: "From Swaroop Studios in 1972 to Destiny in 2024: five decades of photography, now built for modern, cinematic film.",
};

export default function StudioPage() {
  return (
    <>
      <StudioTimeline />
      <StudioCrew />
      <ChatCTA />
    </>
  );
}
