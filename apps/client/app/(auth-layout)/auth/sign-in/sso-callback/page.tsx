import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { Loader } from 'lucide-react';
import { type Metadata } from 'next';

import { NO_INDEX } from '@/configs/site.config';

export const metadata: Metadata = { title: 'Signing in', robots: NO_INDEX };

export default function SSOCallback() {
  return (
    <>
      <AuthenticateWithRedirectCallback />

      <div className='flex w-full items-center justify-center gap-2'>
        <Loader className='text-primary h-5 w-5 animate-spin' />
        <span className='text-primary'>Almost there, signing you in...</span>
      </div>
      {/* Required for sign-up flows
      Clerk's bot sign-up protection is enabled by default */}
      <div id='clerk-captcha' />
    </>
  );
}
