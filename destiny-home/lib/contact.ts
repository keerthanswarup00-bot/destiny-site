export const EVENT_TYPES = [
  "Wedding",
  "Engagement",
  "Pre-wedding / Sangeet",
  "Reception",
  "Birthday",
  "Anniversary",
  "Baby shower / Naming ceremony",
  "Corporate event",
  "Product / Brand shoot",
  "Other",
] as const;

// TODO(owner): the WhatsApp number and email below are the real ones. The CALL number is still
// a placeholder — replace it with the line you actually want dialled, or delete phoneDisplay and
// phoneTel and the Call row disappears with them. A dead tel: link is worse than no Call row.
export const CONTACT = {
  phoneDisplay: "+91 98765 43210",
  phoneTel: "+919876543210",
  whatsappDisplay: "+91 91087 27795",
  whatsappNumber: "919108727795", // digits only, no + — used in wa.me links
  email: "destinyeventsandphotography@gmail.com",
  location: "Bengaluru · Available worldwide",
  hours: "Mon–Sat, 10am–7pm IST",
  responseTime: "We reply within one business day, usually sooner.",
};

export const VIP = {
  name: "Aman Swaroop",
  role: "Founder",
  line: "For VIP, confidential or high-profile events, speak directly with Aman.",
  // TODO(owner): confirm whether Aman's direct line differs from the general WhatsApp number above.
  whatsappNumber: CONTACT.whatsappNumber,
  prefill: "Hi Aman, I'd like to speak with you directly about a private / VIP event. ",
};

export const TRUST_POINTS = [
  { title: "Handled personally", body: "Every enquiry is read by our team, not a bot — nothing gets lost in a queue." },
  { title: "Kept confidential", body: "Your details and your event are never shared. Private galleries are password-protected." },
  { title: "No pressure, no spam", body: "One reply with real options. We won't chase you after that." },
];

export function whatsappSendUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildEnquiryMessage(fields: {
  name: string; phone: string; email?: string; eventType?: string; eventDate?: string; notes?: string;
}) {
  const line = (label: string, v?: string) => `${label}: ${v && v.trim() ? v.trim() : "—"}`;
  return [
    "Hi Destiny, I'd like to enquire about an event.",
    "",
    line("Name", fields.name),
    line("Phone", fields.phone),
    line("Email", fields.email),
    line("Event type", fields.eventType),
    line("Event date", fields.eventDate),
    line("Notes", fields.notes),
  ].join("\n");
}
