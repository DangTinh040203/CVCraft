'use client';
import { useSignIn } from '@clerk/nextjs';
import { Button } from '@repo/ui/components/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { Env } from '@/configs/env.config';
import { handleClerkError } from '@/libs/clerk-toast';
import { buttonScaleVariants, formItemVariants } from '@/styles/animation';

const SSOButtons = () => {
  const { isLoaded, signIn } = useSignIn();
  const searchParams = useSearchParams();

  // Only same-site paths, so the param can't send users to another domain
  const callbackUrl = searchParams.get('callbackUrl');
  const redirectUrlComplete =
    callbackUrl?.startsWith('/') && !callbackUrl.startsWith('//')
      ? callbackUrl
      : '/';

  const signInWith = async (strategy: 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: Env.NEXT_PUBLIC_REDIRECT_URL,
        redirectUrlComplete,
      });
    } catch (err: unknown) {
      handleClerkError(err, {
        fallbackMessage: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <motion.div variants={formItemVariants} className='flex w-full gap-2'>
      <motion.div
        variants={buttonScaleVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className='flex-1'
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Button
          onClick={() => signInWith('oauth_google')}
          className='w-full'
          type='button'
          variant='outline'
        >
          <Image src='/icons/google.svg' alt='Google' width={20} height={20} />
          Google
        </Button>
      </motion.div>

      <motion.div
        variants={buttonScaleVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className='flex-1'
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Button
          onClick={() => signInWith('oauth_github')}
          className='w-full'
          type='button'
          variant='outline'
        >
          <Image src='/icons/github.svg' alt='Github' width={20} height={20} />
          Github
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SSOButtons;
