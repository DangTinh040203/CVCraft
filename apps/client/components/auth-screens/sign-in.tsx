'use client';
import { motion } from 'framer-motion';
import React from 'react';

import SSOButtons from '@/components/auth-screens/sso-buttons';
import { formContainerVariants } from '@/styles/animation';

// NOTE: Password-based sign-in is disabled to match the source design.
// OAuth (Google/Github) only, and those buttons are currently placeholders
// (see sso-buttons.tsx) until a real auth provider is wired up.
const SignIn = () => {
  return (
    <motion.div
      variants={formContainerVariants}
      initial='hidden'
      animate='visible'
      className='space-y-6'
    >
      <SSOButtons />
    </motion.div>
  );
};

export default SignIn;
