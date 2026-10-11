'use client';
import { motion } from 'framer-motion';
import React from 'react';

import SSOButtons from '@/components/auth-screens/sso-buttons';
import { formContainerVariants } from '@/styles/animation';

// Password sign-in, sign-up and OTP stay disabled, as in v1: OAuth only.
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
