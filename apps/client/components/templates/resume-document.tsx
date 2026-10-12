import { type CSSProperties } from 'react';

import { TEMPLATES } from '@/components/templates/registry';
import { type ResumeData } from '@/components/templates/resume.types';
import { getFontFamily, resumeFontVariables } from '@/configs/font.config';
import {
  defaultFormat,
  type FontWeight,
  type Format,
  normalizeFormat,
  TEMPLATE_DEFAULT,
} from '@/stores/features/template.slice';

// How much of the accent each palette step keeps (rest is white below 500,
// black above it), so a single picked color yields a full Tailwind scale.
const SHADES: Array<[step: number, mixWith: 'white' | 'black', pct: number]> = [
  [50, 'white', 10],
  [100, 'white', 20],
  [200, 'white', 35],
  [300, 'white', 55],
  [400, 'white', 78],
  [500, 'white', 100],
  [600, 'black', 100],
  [700, 'black', 82],
  [800, 'black', 66],
  [900, 'black', 52],
  [950, 'black', 38],
];

type NumericFormatKey =
  | 'fontSize'
  | 'titleSize'
  | 'sectionTitleSize'
  | 'subTitleSize'
  | 'lineHeight'
  | 'sectionSpacing'
  | 'margin';

const FORMAT_VARS: Array<
  [key: NumericFormatKey, cssVar: string, unit: string]
> = [
  ['fontSize', '--resume-font-size', 'pt'],
  ['titleSize', '--resume-title-size', 'pt'],
  ['sectionTitleSize', '--resume-section-title-size', 'pt'],
  ['subTitleSize', '--resume-subtitle-size', 'pt'],
  ['lineHeight', '--resume-line-height', ''],
  ['sectionSpacing', '--resume-section-spacing', 'pt'],
  ['margin', '--resume-margin', 'mm'],
];

const FONT_WEIGHTS: Record<FontWeight, string> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

function formatStyle(
  format: Partial<Format>,
  accentPalette?: string,
): CSSProperties {
  // Keep line breaks from multi-line fields (summary bullets, descriptions) in
  // every template, including ones that render them in a plain <p>, and wrap
  // long URLs and other unbroken strings instead of running off the page.
  const style: Record<string, string> = {
    whiteSpace: 'pre-line',
    overflowWrap: 'anywhere',
  };

  const fontFamily = getFontFamily(format.fontFamily ?? TEMPLATE_DEFAULT);
  if (fontFamily) {
    style.fontFamily = fontFamily;
    style['--font-sans'] = fontFamily;
    style['--font-serif'] = fontFamily;
  }

  // Each slider only kicks in once it moves off its default, so an untouched
  // panel keeps the template's own sizes. Templates read these as
  // `var(--resume-*, <own value>)`.
  for (const [key, cssVar, unit] of FORMAT_VARS) {
    const value = format[key];
    if (value !== undefined && value !== defaultFormat[key]) {
      style[cssVar] = `${value}${unit}`;
    }
  }

  // These inherit, so they work in every template without markup changes
  if (format.letterSpacing !== undefined && format.letterSpacing !== 0) {
    style.letterSpacing = `${format.letterSpacing}pt`;
  }
  if (format.fontWeight && format.fontWeight !== defaultFormat.fontWeight) {
    style.fontWeight = FONT_WEIGHTS[format.fontWeight];
  }

  const color = format.color;
  if (color && color !== TEMPLATE_DEFAULT) {
    style['--resume-accent'] = color;
    // Tailwind v4 utilities read --color-<palette>-<step>, so overriding them
    // here recolors the template's accent without touching its markup.
    if (accentPalette) {
      for (const [step, mixWith, pct] of SHADES) {
        style[`--color-${accentPalette}-${step}`] =
          pct === 100
            ? color
            : `color-mix(in oklab, ${color} ${pct}%, ${mixWith})`;
      }
    }
  }

  return style as CSSProperties;
}

interface ResumeDocumentProps {
  templateKey: string | null | undefined;
  resume: ResumeData;
  format?: Partial<Format> | null;
}

/**
 * Renders a registry template with the Customize panel's font and accent
 * color applied. Shared by the builder preview and the /print route that the
 * backend turns into a PDF, so both always match.
 */
export function ResumeDocument({
  templateKey,
  resume,
  format,
}: ResumeDocumentProps) {
  const template =
    TEMPLATES.find((t) => t.key === templateKey) ?? TEMPLATES[0]!;
  const Template = template.component;

  return (
    <div
      className={resumeFontVariables}
      style={formatStyle(normalizeFormat(format), template.accentPalette)}
    >
      <Template resume={resume} />
    </div>
  );
}
