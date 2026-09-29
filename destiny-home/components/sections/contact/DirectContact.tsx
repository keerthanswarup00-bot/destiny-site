"use client";

import { useState } from "react";
import { CONTACT, whatsappSendUrl } from "@/lib/contact";

function CopyableRow({ label, value, href }: { label: string; value: string; href: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the link below still works */
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line py-4 first:border-t-0">
      <div>
        <p className="text-[11.5px] font-semibold text-mute">{label}</p>
        <a href={href} className="text-[15px] font-medium hover:text-gold">{value}</a>
      </div>
      <button type="button" onClick={copy} className="shrink-0 text-xs font-semibold text-gold">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export default function DirectContact() {
  return (
    <div className="rounded-[3px] border border-line p-6 md:p-7">
      <h3 className="font-display text-xl font-normal italic">Prefer to reach us directly?</h3>
      <div className="mt-2">
        <CopyableRow label="Call" value={CONTACT.phoneDisplay} href={`tel:${CONTACT.phoneTel}`} />
        <CopyableRow label="WhatsApp" value={CONTACT.whatsappDisplay} href={whatsappSendUrl(CONTACT.whatsappNumber, "Hi Destiny, ")} />
        <CopyableRow label="Email" value={CONTACT.email} href={`mailto:${CONTACT.email}`} />
      </div>
      <p className="mt-4 text-xs leading-relaxed text-mute">
        {CONTACT.location} · {CONTACT.hours}
      </p>
    </div>
  );
}
