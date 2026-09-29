import Link from "next/link";
import { SITE, NAV_LINKS, whatsappUrl } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-line py-7 text-xs text-mute">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-3 px-5 md:flex-row md:justify-between md:px-12">
        <div>© {new Date().getFullYear()} {SITE.name} {SITE.tagline}</div>
        <div className="flex flex-wrap gap-4">
          {NAV_LINKS.slice(0, 3).map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-paper">{l.label}</Link>
          ))}
          <a href={`mailto:${SITE.email}`} className="hover:text-paper">Email</a>
          <a href={whatsappUrl()} className="hover:text-paper">WhatsApp</a>
          <a href={SITE.instagram} className="hover:text-paper">Instagram</a>
          <a
            href="https://aryansswaroop.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-paper"
          >
            Created by aryansswaroop.com
          </a>
        </div>
      </div>
    </footer>
  );
}