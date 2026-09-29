import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

const SITE_URL = SITE.url;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: SITE_URL + "/work", changeFrequency: "weekly", priority: 0.9 },
    { url: SITE_URL + "/about", changeFrequency: "monthly", priority: 0.8 },
    { url: SITE_URL + "/contact", changeFrequency: "monthly", priority: 0.7 },
  ];
}
