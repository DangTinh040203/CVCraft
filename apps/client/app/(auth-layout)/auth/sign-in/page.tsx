import { Suspense } from 'react';

import SignIn from '@/components/auth-screens/sign-in';

export default function SignInPage() {
  // SSO buttons read ?callbackUrl via useSearchParams
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
