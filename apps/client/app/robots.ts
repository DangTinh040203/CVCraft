import { type MetadataRoute } from 'next';

import { absoluteUrl, SITE } from '@/configs/site.config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Signed-in screens, auth flow, the PDF print route and links that
        // were shared, not published
        disallow: [
          '/builder',
          '/applications',
          '/interview',
          '/auth/',
          '/print',
          '/r/',
          '/api/',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE.url,
  };
}
