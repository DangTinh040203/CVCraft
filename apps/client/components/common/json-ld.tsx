/** Structured data for search engines (schema.org), rendered server-side. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type='application/ld+json'
      // `<` is escaped so text in the data can't close the script tag
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
