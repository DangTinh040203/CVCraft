import { type Metadata } from 'next';

import { Env } from '@/configs/env.config';

/** One source for the SEO copy shared by metadata, the manifest and JSON-LD. */
export const SITE = {
  name: 'CraftCV',
  // `?? ` too: with SKIP_ENV_VALIDATION (CI, Docker build) the schema's
  // default isn't applied, so an unset var arrives as undefined
  url: (Env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(
    /\/+$/,
    '',
  ),
  title: 'CraftCV - AI Resume Builder with ATS-Friendly CV Templates',
  description:
    'Build a professional, ATS-friendly CV in minutes with CraftCV. Free resume templates, AI writing help, job description matching, ATS checks and voice mock interviews.',
  keywords: [
    'CV builder',
    'resume builder',
    'AI resume builder',
    'ATS-friendly resume',
    'ATS resume checker',
    'free CV templates',
    'resume templates',
    'CV maker',
    'job description match',
    'resume tailoring',
    'mock interview',
    'cover letter email',
  ],
  themeColor: '#6c23d7',
  locale: 'en_US',
} as const;

/** Absolute URL on this site, e.g. `absoluteUrl('/templates')`. */
export const absoluteUrl = (path = '/') =>
  `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Metadata for an indexable page: its canonical URL plus Open Graph and
 * Twitter cards. Next replaces (doesn't merge) `openGraph`/`twitter` per
 * page, so without this a page would share the home page's card.
 */
export const pageMetadata = ({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
    url: path,
    title: `${title} | ${SITE.name}`,
    description,
    // A page's own `openGraph` drops the inherited app/opengraph-image
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | ${SITE.name}`,
    description,
    images: [OG_IMAGE],
  },
});

const OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${SITE.name} - AI resume builder with ATS-friendly CV templates`,
};

/** For signed-in, transient or private screens. */
export const NO_INDEX: Metadata['robots'] = { index: false, follow: false };
