import { type Metadata } from 'next';

import { TemplatesGallery } from '@/components/templates/templates-gallery';

export const metadata: Metadata = {
  title: 'Templates',
  description:
    'Browse resume templates, preview each one with sample content, and pick a starting point for your CV.',
};

export default function TemplatesPage() {
  return <TemplatesGallery />;
}
