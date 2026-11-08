import { Inter, Lato, Lobster_Two, Open_Sans, Roboto } from 'next/font/google';

import { TEMPLATE_DEFAULT } from '@/stores/features/template.slice';

// preload: false on all of these: they are only for resumes (builder, preview,
// print), and preloading them on every page delayed the site's own font
// and LCP. A page that renders a resume still loads them, just not eagerly.
const inter = Inter({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-resume-inter',
  display: 'swap',
  preload: false,
});

const roboto = Roboto({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '700'],
  variable: '--font-resume-roboto',
  display: 'swap',
  preload: false,
});

const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-resume-open-sans',
  display: 'swap',
  preload: false,
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-resume-lato',
  display: 'swap',
  preload: false,
});

const lobsterTwo = Lobster_Two({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-resume-lobster-two',
  display: 'swap',
  preload: false,
});

/** Put on any ancestor of a resume so the font variables below resolve. */
export const resumeFontVariables = [
  inter.variable,
  roboto.variable,
  openSans.variable,
  lato.variable,
  lobsterTwo.variable,
].join(' ');

export interface FontOption {
  value: string;
  label: string;
  /** CSS font-family value; undefined keeps the template's own font. */
  fontFamily?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { value: TEMPLATE_DEFAULT, label: 'Template default' },
  {
    value: 'Inter',
    label: 'Inter',
    fontFamily: 'var(--font-resume-inter), sans-serif',
  },
  {
    value: 'Roboto',
    label: 'Roboto',
    fontFamily: 'var(--font-resume-roboto), sans-serif',
  },
  {
    value: 'Open Sans',
    label: 'Open Sans',
    fontFamily: 'var(--font-resume-open-sans), sans-serif',
  },
  {
    value: 'Lato',
    label: 'Lato',
    fontFamily: 'var(--font-resume-lato), sans-serif',
  },
  {
    value: 'Lobster Two',
    label: 'Lobster Two',
    fontFamily: 'var(--font-resume-lobster-two), cursive',
  },
];

export function getFontFamily(value: string): string | undefined {
  return FONT_OPTIONS.find((option) => option.value === value)?.fontFamily;
}
