import Link from "next/link";
import { SITE, NAV_LINKS, whatsappUrl } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-line py-12 text-xs text-mute">
      <div className="mx-auto w-full max-w-[1320px] px-5 md:px-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr] md:gap-16">
          <div className="max-w-md">
            <div className="text-lg tracking-tight text-paper">{SITE.name}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.18em]">{SITE.tagline}</div>
            <p className="mt-5 max-w-sm leading-6">
              A Bengaluru-based creative studio documenting weddings, events and stories with
              photography and film.
            </p>
            <p className="mt-2 max-w-sm leading-6">
              A 30+ member team bringing photography, filmmaking, drones, editing and production
              together for your creative needs — across India.
            </p>
          </div>

          <div>
            <div className="mb-4 text-[10px] uppercase tracking-[0.18em] text-paper">Explore</div>
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-paper">
                  {l.label}
                </Link>
              ))}
              <a href={whatsappUrl()} className="hover:text-paper">WhatsApp</a>
              <a href={`mailto:${SITE.email}`} className="hover:text-paper">Email</a>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-paper">
                Instagram
              </a>
            </div>
          </div>

          <div>
            <div className="mb-4 text-[10px] uppercase tracking-[0.18em] text-paper">Based in</div>
            <p className="leading-6">Bengaluru, Karnataka</p>
            <p className="mt-1 leading-6">Working across India</p>
            <p className="mt-4 leading-6">{SITE.email}</p>
            <a href={whatsappUrl()} className="mt-1 block leading-6 hover:text-paper">
              +91 91087 27795
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-5 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</div>
          <a href="https://aryanswaroop.com" target="_blank" rel="noopener noreferrer" className="hover:text-paper">
            Created by aryanswaroop.com
          </a>
        </div>
      </div>
    </footer>
  );
}
