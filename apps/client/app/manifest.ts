import { type MetadataRoute } from 'next';

import { SITE } from '@/configs/site.config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.title,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: SITE.themeColor,
    categories: ['productivity', 'business'],
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
      { src: '/craftcv-favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
