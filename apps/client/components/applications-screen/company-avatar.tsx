import { cn } from '@repo/ui/lib/utils';

const TONES = [
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
];

/** The company's initial, in a color that stays the same for that name. */
export function CompanyAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (
    <span
      aria-hidden
      className={cn(
        `
          flex size-10 shrink-0 items-center justify-center rounded-lg text-sm
          font-semibold uppercase
        `,
        TONES[hash % TONES.length],
        className,
      )}
    >
      {name.trim().charAt(0) || '?'}
    </span>
  );
}
