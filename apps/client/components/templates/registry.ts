import { type ComponentType } from 'react';

import { type ResumeData } from '@/components/templates/resume.types';
import { Template01 } from '@/components/templates/template-01';
import { Template02 } from '@/components/templates/template-02';
import { Template03 } from '@/components/templates/template-03';
import { Template04 } from '@/components/templates/template-04';
import { Template05 } from '@/components/templates/template-05';
import { Template06 } from '@/components/templates/template-06';
import { Template07 } from '@/components/templates/template-07';
import { Template08 } from '@/components/templates/template-08';
import { Template09 } from '@/components/templates/template-09';
import { Template10 } from '@/components/templates/template-10';
import { Template11 } from '@/components/templates/template-11';
import { Template12 } from '@/components/templates/template-12';
import { Template13 } from '@/components/templates/template-13';

export interface TemplateMeta {
  key: string;
  slug: string;
  name: string;
  description: string;
  isPremium: boolean;
  component: ComponentType<{ resume: ResumeData }>;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    key: 'template-13',
    slug: 'green-network-13',
    name: 'Green Network',
    description: 'Green accents, photo beside a contact grid, dated entries.',
    isPremium: false,
    component: Template13,
  },
  {
    key: 'template-01',
    slug: 'minimalist-01',
    name: 'Minimalist',
    description: 'Clean single column, ATS-friendly, no color.',
    isPremium: false,
    component: Template01,
  },
  {
    key: 'template-02',
    slug: 'sidebar-modern-02',
    name: 'Sidebar Modern',
    description: 'Dark left sidebar for contact, skills and languages.',
    isPremium: false,
    component: Template02,
  },
  {
    key: 'template-03',
    slug: 'timeline-03',
    name: 'Timeline',
    description: 'Experience and education shown on a vertical timeline.',
    isPremium: true,
    component: Template03,
  },
  {
    key: 'template-04',
    slug: 'elegant-dark-04',
    name: 'Elegant Dark',
    description: 'Navy and gold sidebar with a refined serif display name.',
    isPremium: true,
    component: Template04,
  },
  {
    key: 'template-05',
    slug: 'corporate-blue-05',
    name: 'Corporate Blue',
    description: 'Framed page with full-width blue section bars.',
    isPremium: false,
    component: Template05,
  },
  {
    key: 'template-06',
    slug: 'bold-statement-06',
    name: 'Bold Statement',
    description: 'Oversized name with segmented skill-level bars.',
    isPremium: false,
    component: Template06,
  },
  {
    key: 'template-07',
    slug: 'icon-professional-07',
    name: 'Icon Professional',
    description: 'Centered photo sidebar with icon-led section headers.',
    isPremium: true,
    component: Template07,
  },
  {
    key: 'template-08',
    slug: 'executive-08',
    name: 'Executive',
    description: 'Photo inline with the name, slim graphite sidebar.',
    isPremium: false,
    component: Template08,
  },
  {
    key: 'template-09',
    slug: 'colorful-icons-09',
    name: 'Colorful Icons',
    description: 'Wine sidebar with circular language proficiency rings.',
    isPremium: true,
    component: Template09,
  },
  {
    key: 'template-10',
    slug: 'iconic-badges-10',
    name: 'Iconic Badges',
    description: 'Colored icon badges lead every section, table-style contact.',
    isPremium: false,
    component: Template10,
  },
  {
    key: 'template-11',
    slug: 'framed-centered-11',
    name: 'Framed Centered',
    description: 'Dotted frame around the page, centered header, plain headings.',
    isPremium: false,
    component: Template11,
  },
  {
    key: 'template-12',
    slug: 'two-column-icons-12',
    name: 'Two-Column Icons',
    description: 'Two-column body with icon-badged section headers.',
    isPremium: true,
    component: Template12,
  },
];

export function getTemplateBySlug(slug: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
