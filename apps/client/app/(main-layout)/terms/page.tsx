import { type Metadata } from 'next';

import { LegalPage } from '@/components/legal/legal-page';
import { termsSections } from '@/components/legal/terms-content';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms and conditions for using CraftCV.',
};

export default function TermsPage() {
  return (
    <LegalPage
      title='Terms of Service'
      description='Please read these terms carefully before using CraftCV.'
      lastUpdated='September 30, 2026'
      sections={termsSections}
    />
  );
}
