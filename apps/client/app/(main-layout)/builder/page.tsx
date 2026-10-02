import { type Metadata } from 'next';

import BuilderScreenContainer from '@/components/builder-screens/builder-screen-container';

export const metadata: Metadata = {
  title: 'Builder',
  description: 'Build your CV from a template.',
};

export default async function BuilderPage() {
  return <BuilderScreenContainer />;
}
