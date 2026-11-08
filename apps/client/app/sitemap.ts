import { type MetadataRoute } from 'next';

import { absoluteUrl } from '@/configs/site.config';

/** Public, indexable pages only (see robots.ts for what is kept out). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/templates', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ].map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    changeFrequency: changeFrequency as 'weekly' | 'yearly',
    priority,
  }));
}
