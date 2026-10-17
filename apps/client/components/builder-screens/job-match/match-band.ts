/**
 * How a 0-100 score reads: its verdict and colors. Class names are written
 * out in full so Tailwind picks them up.
 */
export interface MatchBand {
  label: string;
  /** Number and ring stroke color. */
  text: string;
  /** Solid fill, for bars. */
  bar: string;
  /** Soft badge background + text. */
  badge: string;
}

const BANDS: Array<{ min: number } & MatchBand> = [
  {
    min: 80,
    label: 'Strong match',
    text: 'text-emerald-500',
    bar: 'bg-emerald-500',
    badge: `
      bg-emerald-50 text-emerald-700
      dark:bg-emerald-500/15 dark:text-emerald-300
    `,
  },
  {
    min: 65,
    label: 'Good match',
    text: 'text-violet-500',
    bar: 'bg-violet-500',
    badge: `
      bg-violet-50 text-violet-700
      dark:bg-violet-500/15 dark:text-violet-300
    `,
  },
  {
    min: 45,
    label: 'Partial match',
    text: 'text-amber-500',
    bar: 'bg-amber-500',
    badge: `
      bg-amber-50 text-amber-700
      dark:bg-amber-500/15 dark:text-amber-300
    `,
  },
  {
    min: 0,
    label: 'Weak match',
    text: 'text-rose-500',
    bar: 'bg-rose-500',
    badge: `
      bg-rose-50 text-rose-700
      dark:bg-rose-500/15 dark:text-rose-300
    `,
  },
];

export function matchBand(score: number): MatchBand {
  return BANDS.find((band) => score >= band.min) ?? BANDS.at(-1)!;
}
