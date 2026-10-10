import { type Metadata } from 'next';
import { Suspense } from 'react';

import BuilderScreenContainer from '@/components/builder-screens/builder-screen-container';

export const metadata: Metadata = {
  title: 'Builder',
  description: 'Build your CV from a template.',
};

export default async function BuilderPage() {
  // BuilderScreenContainer reads `?template=` via useSearchParams, which
  // requires a Suspense boundary for static prerendering.
  return (
    <Suspense>
      <BuilderScreenContainer />
    </Suspense>
  );
}
