'use client';
import { Button } from '@repo/ui/components/button';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { buttonScaleVariants, formItemVariants } from '@/styles/animation';

// TODO: wire up real OAuth (e.g. Clerk `useSignIn().authenticateWithRedirect`)
// once an auth provider is configured for this app. Buttons are visual only.
const SSOButtons = () => {
  const signInWith = (provider: 'google' | 'github') => {
    // eslint-disable-next-line no-console -- placeholder until OAuth is wired
    console.log(`TODO: wire up ${provider} OAuth sign-in`);
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
          onClick={() => signInWith('google')}
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
          onClick={() => signInWith('github')}
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
