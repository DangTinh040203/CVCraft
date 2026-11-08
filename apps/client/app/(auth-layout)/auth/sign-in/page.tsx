import { type Metadata } from 'next';
import { Suspense } from 'react';

import SignIn from '@/components/auth-screens/sign-in';
import { NO_INDEX } from '@/configs/site.config';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to CraftCV with Google or GitHub to build your CV.',
  robots: NO_INDEX,
};

export default function SignInPage() {
  // SSO buttons read ?callbackUrl via useSearchParams
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
