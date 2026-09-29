import type { Metadata } from "next";
import ChatCTA from "@/components/sections/ChatCTA";
import SignatureFilms from "@/components/sections/films/SignatureFilms";
import Reels from "@/components/sections/films/Reels";

export const metadata: Metadata = {
  title: "Films — Destiny",
  description: "Wedding and event films by Destiny — full signature films and short reels.",
};

export default function FilmsPage() {
  return (
    <>
      <div className="pt-16" />
      <SignatureFilms />
      <Reels />
      <ChatCTA />
    </>
  );
}
