'use client';
import { Button } from '@repo/ui/components/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const NotFound = () => {
  return (
    <section
      className={`
        from-background via-primary/5 to-accent/10 relative flex min-h-screen
        items-center justify-center overflow-hidden bg-linear-to-br p-4
      `}
    >
      {/* Ambient gradient blobs (matches Hero aesthetic) */}
      <div className='absolute inset-0 overflow-hidden'>
        <div
          className={`
            bg-primary/20 absolute top-[-10%] right-[-5%] h-[500px] w-[500px]
            rounded-full blur-[120px]
          `}
        />
        <div
          className={`
            bg-accent/20 absolute bottom-[-10%] left-[-5%] h-[400px] w-[400px]
            rounded-full blur-[100px]
          `}
        />
      </div>

      <div className='relative z-10 mx-auto max-w-md text-center'>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <h1
            className={`
              font-display gradient-text text-8xl leading-none font-extrabold
              tracking-tight
              md:text-9xl
            `}
          >
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className='text-foreground mt-4 mb-2 text-2xl font-semibold'>
            Page not found
          </h2>
          <p className='text-muted-foreground mb-8'>
            The page you are looking for does not exist or has been moved.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={`
            flex flex-col justify-center gap-3
            sm:flex-row
          `}
        >
          <Button
            variant='outline'
            className={`
              rounded-full border-2 backdrop-blur-sm transition-transform
              hover:scale-105
            `}
            onClick={() => window.history.back()}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
          <Button
            asChild
            className={`
              shadow-primary/20 rounded-full shadow-lg transition-transform
              hover:scale-105
            `}
          >
            <Link href='/'>
              <Home className='mr-2 h-4 w-4' />
              Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default NotFound;
