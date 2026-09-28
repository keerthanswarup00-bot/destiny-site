import HeroMedia from "@/components/sections/HeroMedia";
import CinematicFilm from "@/components/sections/CinematicFilm";
import CoverflowScroller from "@/components/sections/CoverflowScroller";
import AboutDestiny from "@/components/sections/AboutDestiny";
import HeritageStrip from "@/components/sections/HeritageStrip";
import Testimonials from "@/components/sections/Testimonials";
import CinematicReelCarousel from "@/components/sections/CinematicReelCarousel";
import ChatCTA from "@/components/sections/ChatCTA";

// Nav + Footer live in app/layout.tsx (see snippets/layout.example.tsx), not here.
export default function HomePage() {
  return (
    <>
      <HeroMedia />
      <CinematicFilm frame="tall" />
      <CoverflowScroller />
      <AboutDestiny />
      <HeritageStrip />
      <Testimonials />
      <CinematicReelCarousel />
      <ChatCTA />
    </>
  );
}
