import type { Metadata } from "next";
import WorkExperience from "@/components/sections/work/WorkExperience";
import { resolveCategory } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work — Destiny",
  description: "Weddings, corporate events, celebrations and product shoots by Destiny, the next generation of Swaroop Studios.",
};

export default async function WorkPage({ searchParams }: { searchParams: Promise<{ cat?: string | string[] }> }) {
  const { cat } = await searchParams;
  const c = Array.isArray(cat) ? cat[0] : cat;
  return <WorkExperience initialCat={resolveCategory(c)} />;
}
