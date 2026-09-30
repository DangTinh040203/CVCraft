import { type Metadata } from 'next';

import { LegalPage } from '@/components/legal/legal-page';
import { privacySections } from '@/components/legal/privacy-content';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How CraftCV collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title='Privacy Policy'
      description='How we collect, use, and protect your information.'
      lastUpdated='September 30, 2026'
      sections={privacySections}
    />
  );
}
