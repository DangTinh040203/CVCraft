import { type Metadata } from 'next';

import { TemplatesGallery } from '@/components/templates/templates-gallery';
import { pageMetadata } from '@/configs/site.config';

export const metadata: Metadata = pageMetadata({
  title: 'Free ATS-Friendly Resume & CV Templates',
  description:
    'Browse free, ATS-friendly resume and CV templates. Preview each design with sample content, then customize fonts and colors and download a PDF.',
  path: '/templates',
});

export default function TemplatesPage() {
  return <TemplatesGallery />;
}
