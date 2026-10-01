"use client";

import { useId, useMemo, useState } from "react";
import { EVENT_TYPES, CONTACT, buildEnquiryMessage, whatsappSendUrl } from "@/lib/contact";

// `min-w-0 max-w-full` alongside `w-full`: a form control's default intrinsic width is its
// min-content width, and the select's longest option ("Baby shower / Naming ceremony") is
// wider than a 360px viewport. `w-full` alone cannot shrink it, so the field overflows its
// column and drags the page into a horizontal scroll. These let the control actually shrink.
const inputCls =
  "w-full min-w-0 max-w-full border-b border-line bg-transparent py-2.5 text-[15px] text-paper outline-none transition-colors placeholder:text-mute/70 focus:border-gold";
const labelCls = "mb-1.5 block text-[12px] font-semibold text-mute";

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block min-w-0 max-w-full">
      <span className={labelCls}>
        {label} {optional && <span className="font-normal text-mute/60">(optional)</span>}
      </span>
      {children}
    </label>
  );
}

/**
 * Collects the enquiry, then hands off to WhatsApp.
 *
 * `noValidate` is deliberate. The browser's own bubbles fire on submit and stop the event before
 * `onSubmit` runs, so an empty form would never reach the code that sets `touched` — the person
 * would get a native tooltip for a blank form and the designed error for a half-filled one.
 * Turning native validation off makes this component's message the only one that appears.
 * Nothing is sent anywhere until the person taps "Send via WhatsApp", and the note under the button
 * says so in as many words.
 */
export default function EnquiryForm() {
  const formId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);

  const phoneValid = /^[+\d][\d\s-]{6,15}$/.test(phone.trim());
  const nameValid = name.trim().length >= 2;
  const canSend = nameValid && phoneValid;

  const message = useMemo(
    () => buildEnquiryMessage({ name, phone, email, eventType, eventDate, notes }),
    [name, phone, email, eventType, eventDate, notes],
  );
  const href = whatsappSendUrl(CONTACT.whatsappNumber, message);

  return (
    <form
      noValidate
      aria-describedby={`${formId}-note`}
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!canSend) return;
        window.open(href, "_blank", "noopener,noreferrer");
      }}
      className="grid gap-7 md:grid-cols-2 md:gap-x-10 md:gap-y-8"
    >
      <Field label="Name">
        <input
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
          placeholder="Your name"
          autoComplete="name"
          aria-invalid={touched && !nameValid}
        />
      </Field>

      <Field label="Phone number">
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputCls}
          placeholder="+91 98765 43210"
          autoComplete="tel"
          inputMode="tel"
          aria-invalid={touched && !phoneValid}
          aria-describedby={`${formId}-note`}
        />
      </Field>

      <Field label="Email" optional>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@email.com" autoComplete="email" />
      </Field>

      <Field label="Event date" optional>
        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
      </Field>

      <div className="min-w-0 md:col-span-2">
        <Field label="Event type" optional>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)} className={`${inputCls} appearance-none bg-[right_2px_center] bg-no-repeat`}>
            <option value="" className="bg-bg">Select an event type</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t} className="bg-bg">{t}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="min-w-0 md:col-span-2">
        <Field label="Anything else" optional>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Guest count, venue, anything that helps us plan" />
        </Field>
      </div>

      <div className="min-w-0 md:col-span-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-gold px-7 py-3.5 text-sm font-bold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send via WhatsApp →
        </button>
        <p id={`${formId}-note`} className="mt-3 text-xs text-mute">
          {touched && !canSend
            ? "Add your name and a valid phone number to continue."
            : "Opens WhatsApp with this message pre-filled — you send it, nothing goes anywhere until you do."}
        </p>
      </div>
    </form>
  );
}
