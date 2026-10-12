import { cn } from '@repo/ui/lib/utils';
import DOMPurify from 'dompurify';

const HTML_PATTERN = /<[a-z][\s\S]*>/i;

/** True when rich text has something visible, not just empty paragraphs. */
export function hasRichText(value: string | null | undefined) {
  if (!value) return false;
  return value.replace(/<[^>]+>|&nbsp;/g, '').trim().length > 0;
}

/**
 * Renders a resume's rich-text field (summary, job description, project
 * details) exactly as the Quill editor saved it (`editor.root.innerHTML`).
 * Nothing is rewritten; DOMPurify only drops scripts and event handlers.
 *
 * `prose` (Tailwind Typography) brings back the element defaults that
 * preflight resets (paragraphs, lists, bold, links). The rest makes it match
 * the editor: Quill's whitespace handling, no gaps between paragraphs, the
 * template's own font size and colors, and Quill's list markup, where every
 * list is an <ol> and each <li data-list="bullet|ordered"> says how to render
 * (bullets don't advance the numbering, as in Quill's own CSS).
 */
export function RichText({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const classes = cn(
    `
      prose max-w-none leading-[inherit] whitespace-pre-wrap text-current
      prose-p:my-0
      prose-ol:my-0 prose-ol:pl-[1.25em]
      prose-ul:my-0 prose-ul:pl-[1.25em]
      prose-li:my-0
      text-[length:inherit]
      [--tw-prose-body:currentColor]
      [--tw-prose-bold:currentColor]
      [--tw-prose-bullets:currentColor]
      [--tw-prose-counters:currentColor]
      [--tw-prose-links:currentColor]
      [&_li[data-list=bullet]]:list-disc
      [&_li[data-list=bullet]]:[counter-increment:list-item_0]
      [&_li[data-list=ordered]]:list-decimal
      [&_p:empty]:min-h-[1lh]
    `,
    className,
  );

  // Plain text (sample data, resumes saved before the editor) renders as
  // typed; pre-wrap keeps its line breaks.
  if (!HTML_PATTERN.test(value)) {
    return <div className={classes}>{value}</div>;
  }

  // Editor HTML only exists in the browser (builder preview, /print). If it
  // ever renders on the server, show its text rather than unsanitized markup.
  if (typeof window === 'undefined') {
    return <div className={classes}>{value.replace(/<[^>]+>/g, ' ')}</div>;
  }

  return (
    <div
      className={classes}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }}
    />
  );
}
