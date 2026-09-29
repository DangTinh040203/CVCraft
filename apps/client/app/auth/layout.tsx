'use client';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, Sparkles, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import React, { type PropsWithChildren } from 'react';

import FloatingElements from '@/components/auth-screens/floating-elements';

const features = [
  { icon: FileText, delay: 0, text: 'Professional, recruiter-ready templates' },
  { icon: Sparkles, delay: 0.1, text: 'AI-powered content suggestions' },
  { icon: Target, delay: 0.2, text: 'Tailored to every job description' },
  { icon: Zap, delay: 0.3, text: 'Ready in minutes, not hours' },
];

const stats = [
  { value: '50K+', label: 'CVs Created' },
  { value: '10K+', label: 'Users Hired' },
  { value: '95%', label: 'Success Rate' },
];

const AuthLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className='bg-background flex min-h-screen'>
      <div className={`
        relative hidden overflow-hidden
        lg:flex lg:w-1/2
      `}>
        {/* Gradient background */}
        <div
          className={`
            from-primary via-primary/90 to-primary absolute inset-0
            bg-gradient-to-br
          `}
        />

        {/* Animated mesh gradient overlay */}
        <motion.div
          className='absolute inset-0 opacity-30'
          style={{
            background:
              'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
          animate={{
            background: [
              'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Floating elements */}
        <FloatingElements />

        {/* Glowing orbs */}
        <motion.div
          className={`
            absolute -top-20 -right-20 h-96 w-96 rounded-full bg-white/10
            blur-3xl
          `}
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          className={`
            bg-accent/20 absolute -bottom-20 -left-20 h-80 w-80 rounded-full
            blur-3xl
          `}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.1, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        {/* Content */}
        <div
          className={`
            relative z-10 flex flex-col justify-center p-12 text-white
            lg:p-16
          `}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href='/' className='mb-10 flex items-center gap-3'>
              <motion.div
                className={`
                  flex h-12 w-12 items-center justify-center rounded-xl border
                  border-white/20 bg-white/10 backdrop-blur-sm
                `}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <FileText className='h-6 w-6 text-white' />
              </motion.div>
              <span className='font-display text-2xl font-bold'>CVCraft</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1
              className={`
                font-display mb-6 text-4xl leading-tight font-bold
                lg:text-5xl
              `}
            >
              Build a CV that
              <br />
              <motion.span
                className='text-white/90'
                animate={{ opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                gets you hired.
              </motion.span>
            </h1>
            <p className='mb-12 max-w-md text-lg leading-relaxed text-white/70'>
              Create stunning, ATS-friendly resumes with the help of AI. Land
              more interviews and accelerate your career in minutes.
            </p>
          </motion.div>

          <div className='space-y-4'>
            {features.map((feature) => (
              <motion.div
                key={feature.text}
                className='group flex items-center gap-4'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + feature.delay }}
              >
                <motion.div
                  className={`
                    flex h-12 w-12 items-center justify-center rounded-xl border
                    border-white/10 bg-white/10 backdrop-blur-sm
                    transition-colors
                    group-hover:bg-white/20
                  `}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <feature.icon className='h-5 w-5 text-white' />
                </motion.div>
                <span className='font-medium text-white/90'>
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            className='mt-16 flex gap-8 border-t border-white/10 pt-8'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
              >
                <div className='font-display text-2xl font-bold text-white'>
                  {stat.value}
                </div>
                <div className='text-sm text-white/60'>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className={`
        relative flex flex-1 items-center justify-center overflow-hidden px-4
        lg:p-8
      `}>
        <div
          className={`
            bg-primary/5 absolute top-[-10%] right-[-10%] h-80 w-80 rounded-full
            blur-3xl
          `}
        />
        <div
          className={`
            bg-accent/5 absolute bottom-[-10%] left-[-10%] h-96 w-96
            rounded-full blur-3xl
          `}
        />

        <motion.div
          className='relative w-full max-w-md'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile Logo */}
          <Link
            href='/'
            className={`
              mb-8 flex items-center justify-center gap-2
              lg:hidden lg:justify-start
            `}
          >
            <div
              className={`
                gradient-bg flex h-10 w-10 items-center justify-center
                rounded-lg shadow-md
              `}
            >
              <FileText className='text-primary-foreground h-5 w-5' />
            </div>
            <span className='font-display text-xl font-bold'>
              CV<span className='gradient-text'>Craft</span>
            </span>
          </Link>

          <motion.div
            className='mb-8 text-center'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className='font-display mb-2 text-3xl font-bold'>
              Welcome to CVCraft
            </h2>
            <p className='text-muted-foreground'>
              Build your standout CV in minutes
            </p>
          </motion.div>

          {children}

          <motion.p
            className='text-muted-foreground mt-8 text-center text-xs'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            By continuing, you agree to our <br />
            <span className={`
              text-primary cursor-pointer
              hover:underline
            `}>
              Terms of Service
            </span>{' '}
            and{' '}
            <span className={`
              text-primary cursor-pointer
              hover:underline
            `}>
              Privacy Policy
            </span>
          </motion.p>

          <motion.div
            className={`
              text-muted-foreground mt-6 flex items-center justify-center gap-2
              text-xs
            `}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <ShieldCheck className='h-4 w-4' />
            Your data is encrypted and never shared
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
