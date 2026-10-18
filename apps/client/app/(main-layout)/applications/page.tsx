import { type Metadata } from 'next';
import { Suspense } from 'react';

import { ApplicationsScreen } from '@/components/applications-screen/applications-screen';

export const metadata: Metadata = {
  title: 'My applications',
  description:
    'The jobs you applied to from CraftCV, and where each one stands.',
  robots: { index: false },
};

export default function ApplicationsPage() {
  // The screen reads its filter and page from the URL
  return (
    <Suspense>
      <ApplicationsScreen />
    </Suspense>
  );
}
