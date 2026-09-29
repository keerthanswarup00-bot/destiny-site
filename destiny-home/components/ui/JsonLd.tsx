/**
 * Renders a JSON-LD block. Used by pages that contribute their own structured data on top of
 * the Organization / WebSite nodes in app/layout.tsx, rather than restating those.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Schema.org payloads are built here from typed constants, never from request input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
