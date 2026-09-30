import { type ComponentType } from 'react';

import { type ResumeData } from '@/components/templates/resume.types';
import { Template01 } from '@/components/templates/template-01';
import { Template02 } from '@/components/templates/template-02';
import { Template03 } from '@/components/templates/template-03';
import { Template04 } from '@/components/templates/template-04';

export interface TemplateMeta {
  key: string;
  name: string;
  description: string;
  isPremium: boolean;
  component: ComponentType<{ resume: ResumeData }>;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    key: 'template-01',
    name: 'Minimalist',
    description: 'Clean single column, ATS-friendly, no color.',
    isPremium: false,
    component: Template01,
  },
  {
    key: 'template-02',
    name: 'Sidebar Modern',
    description: 'Dark left sidebar for contact, skills and languages.',
    isPremium: false,
    component: Template02,
  },
  {
    key: 'template-03',
    name: 'Timeline',
    description: 'Experience and education shown on a vertical timeline.',
    isPremium: true,
    component: Template03,
  },
  {
    key: 'template-04',
    name: 'Elegant Dark',
    description: 'Navy and gold sidebar with a refined serif display name.',
    isPremium: true,
    component: Template04,
  },
];
