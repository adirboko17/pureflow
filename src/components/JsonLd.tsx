/**
 * Renders JSON-LD in the document body so it is present in the SSR HTML
 * and survives TanStack head hydration (known issue with empty/duplicated
 * application/ld+json script tags in <head>).
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // SSR + client must share the same string; no client-only injection.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
