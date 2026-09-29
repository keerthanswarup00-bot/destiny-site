import { TRUST_POINTS, CONTACT } from "@/lib/contact";

export default function TrustRow() {
  return (
    <div className="mt-8 grid gap-5 border-t border-line pt-8 sm:grid-cols-3">
      {TRUST_POINTS.map((t) => (
        <div key={t.title}>
          <p className="text-[13px] font-semibold text-gold">{t.title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-mute">{t.body}</p>
        </div>
      ))}
      <p className="sm:col-span-3 text-[12.5px] text-mute">{CONTACT.responseTime}</p>
    </div>
  );
}
