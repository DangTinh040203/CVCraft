import { cn } from '@repo/ui/lib/utils';

/** A monogram for the company (initials of its first two words). */
export function CompanyAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials =
    name
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('') || '?';

  return (
    <span
      aria-hidden
      className={cn(
        `
          from-primary/12 to-primary/4 text-primary ring-primary/15 font-display
          flex size-11 shrink-0 items-center justify-center rounded-xl
          bg-linear-to-br text-sm font-bold uppercase ring-1 ring-inset
        `,
        className,
      )}
    >
      {initials}
    </span>
  );
}
