import { type Metadata } from 'next';

import { ApplicationsScreen } from '@/components/applications-screen/applications-screen';

export const metadata: Metadata = {
  title: 'My applications',
  description:
    'The jobs you applied to from CraftCV, and where each one stands.',
  robots: { index: false },
};

export default function ApplicationsPage() {
  return <ApplicationsScreen />;
}
