import type { Metadata } from "next";
import JsonLd from "@/components/ui/JsonLd";
import AboutHero from "@/components/sections/about/AboutHero";
import AboutIntro from "@/components/sections/about/AboutIntro";
import AboutAman from "@/components/sections/about/AboutAman";
import AboutTeam from "@/components/sections/about/AboutTeam";
import AboutLegacy from "@/components/sections/about/AboutLegacy";
import AboutCta from "@/components/sections/about/AboutCta";
import { AMAN } from "@/lib/about";
import { VIP } from "@/lib/contact";
import { SITE } from "@/lib/constants";

const TITLE = "About Destiny";
const DESCRIPTION =
  "The story behind Destiny Events & Photography — a creative studio built on the legacy of Swaroop Studio since 1972, with 300+ weddings, 20+ films and music albums, and a 30+ member creative team.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: "/about",
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
  },
};

/**
 * Contributes the two nodes this page uniquely owns. Organization and WebSite already live in
 * app/layout.tsx and are referenced by @id rather than restated, so nothing is duplicated.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE.url}/about#aman`,
      name: VIP.name,
      jobTitle: VIP.role,
      description: AMAN.title,
      worksFor: { "@id": `${SITE.url}/#organization` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE.url}/about#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: TITLE, item: `${SITE.url}/about` },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <AboutHero />
      <AboutIntro />
      <AboutAman />
      <AboutTeam />
      <AboutLegacy />
      <AboutCta />
    </>
  );
}
