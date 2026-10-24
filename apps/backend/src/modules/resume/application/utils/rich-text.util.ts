const decode = (value: string) =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

/**
 * Rich text (the editor's HTML) as its lines: one per list item, paragraph
 * or line break, without markup or bullet characters. Plain text (sample
 * data, older resumes) splits on its line breaks.
 */
export function richTextLines(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return decode(
    value
      .replace(/<\/(p|li|div|h[1-6])>|<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s*[-•*–]\s*/, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean);
}

export const wordCount = (text: string) =>
  text.split(/\s+/).filter(Boolean).length;
