'use client';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { m } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { fadeInUp, staggerContainer } from '@/styles/animation';


const statMeta = [
  { color: 'bg-green-500', count: '50k+', label: 'Professionals' },
  { color: 'bg-yellow-500', count: '120k+', label: 'Connections' },
  { color: 'bg-blue-500', count: '15k+', label: 'Job listings' },
  { color: 'bg-purple-500', count: '200k+', label: 'Applications' },
];

const HeroSection = () => {
  return (
    <section
      className={`
        from-background via-primary/5 to-accent/5 relative flex min-h-screen
        items-center overflow-hidden bg-linear-to-br px-2 pt-24 pb-24
        md:to-accent/10 md:px-4 md:pt-32
      `}
    >
      <div className='absolute inset-0 overflow-hidden'>
        <div
          className={`
            bg-primary/10 absolute top-[-10%] right-[-5%] h-[220px] w-[220px]
            rounded-full blur-[80px]
            md:bg-primary/20 md:h-[500px] md:w-[500px] md:blur-[120px]
          `}
        />
        <div
          className={`
            bg-accent/10 absolute bottom-[-10%] left-[-5%] h-[180px] w-[180px]
            rounded-full blur-[70px]
            md:bg-accent/20 md:h-[400px] md:w-[400px] md:blur-[100px]
          `}
        />
      </div>

      {/* Floating resume-preview card (decorative, large screens only) */}
      <m.div
        className={`
          bg-card border-border/60 absolute top-28 right-8 z-10 hidden w-56
          rotate-6 rounded-2xl border p-4 shadow-2xl backdrop-blur-sm
          xl:block
        `}
        initial={{ opacity: 0, scale: 0.8, rotate: 12 }}
        animate={{ opacity: 1, scale: 1, rotate: 6, y: [0, -12, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 0.6 },
          scale: { duration: 0.6, delay: 0.6 },
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 },
        }}
      >
        <div className='mb-3 flex items-center gap-3'>
          <div
            className={`
              from-primary to-accent h-10 w-10 rounded-full bg-linear-to-br
            `}
          />
          <div className='flex-1 space-y-1.5'>
            <div className='bg-foreground/15 h-2 w-3/4 rounded-full' />
            <div className='bg-muted-foreground/10 h-2 w-1/2 rounded-full' />
          </div>
        </div>
        <div className='space-y-1.5'>
          <div className='bg-muted h-1.5 w-full rounded-full' />
          <div className='bg-muted h-1.5 w-full rounded-full' />
          <div className='bg-muted h-1.5 w-2/3 rounded-full' />
        </div>
        <div
          className={`
            border-border/60 mt-3 flex items-center gap-1.5 border-t pt-3
          `}
        >
          <CheckCircle2 className='text-primary h-3.5 w-3.5' />
          <span className='text-primary text-xs font-bold'>
            98% ATS Match
          </span>
        </div>
      </m.div>

      {/* Floating AI-suggestion card (decorative, large screens only) */}
      <m.div
        className={`
          bg-card border-border/60 absolute bottom-40 left-10 z-10 hidden w-52
          -rotate-6 rounded-2xl border p-4 shadow-2xl backdrop-blur-sm
          xl:block
        `}
        initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
        animate={{ opacity: 1, scale: 1, rotate: -6, y: [0, 12, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 0.8 },
          scale: { duration: 0.6, delay: 0.8 },
          y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 },
        }}
      >
        <div className='mb-2 flex items-center gap-1.5'>
          <Sparkles className='text-primary h-3.5 w-3.5' />
          <span className='text-xs font-bold'>AI Suggestion</span>
        </div>
        <p className='text-muted-foreground text-xs leading-relaxed'>
          &quot;Led a team of 5 engineers&quot; → try adding a measurable
          impact.
        </p>
      </m.div>

      <div className='relative z-10 container mx-auto'>
        <div className='mx-auto max-w-4xl text-center'>
          <m.div
            className={`
              bg-primary/10 border-primary/20 mb-8 inline-flex items-center
              gap-2 rounded-full border px-4 py-2 backdrop-blur-sm
            `}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
          >
            <Sparkles className='text-primary h-4 w-4' />
            <span className='text-sm font-medium'>
              AI-Powered CV Builder
            </span>
            <Badge
              className={`bg-primary/20 text-primary border-none text-[10px]`}
            >
              NEW
            </Badge>
          </m.div>

          <div className='overflow-hidden'>
            <m.h1
              className={`
                font-display text-foreground text-4xl leading-[1.1]
                font-extrabold tracking-tight
                md:text-6xl
                lg:mb-2 lg:text-7xl
              `}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Discover, connect,
            </m.h1>
            <m.h1
              className={`
                font-display gradient-text mb-6 py-2 text-4xl leading-[1.1]
                font-extrabold tracking-tight
                md:text-6xl
                lg:text-7xl
              `}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              grow.
            </m.h1>
          </div>

          <m.p
            className={`
              text-muted-foreground mx-auto mb-10 max-w-2xl text-base
              leading-relaxed
              md:text-xl
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Welcome to CVCraft, the largest professional CV building
            platform.
            <br className={`
              hidden
              md:block
            `} />
            Craft stunning, ATS-friendly resumes in minutes with AI.
          </m.p>

          <m.div
            className={`
              flex flex-col justify-center gap-4
              sm:flex-row
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <Link href='/builder'>
              <Button
                size='xl'
                className={`
                  group shadow-primary/20 relative h-14 w-full overflow-hidden
                  rounded-full px-8 text-base shadow-xl transition-transform
                  hover:scale-105
                  sm:w-auto
                  lg:text-lg
                `}
              >
                <span className='relative flex items-center gap-2'>
                  Build your profile
                  <ArrowRight
                    className={`
                      h-5 w-5 transition-transform duration-300
                      group-hover:translate-x-1
                    `}
                  />
                </span>
              </Button>
            </Link>
            <Link href='/templates'>
              <Button
                variant='outline'
                size='xl'
                className={`
                  h-14 w-full rounded-full border-2 px-8 text-base
                  backdrop-blur-sm transition-transform
                  hover:scale-105
                  sm:w-auto
                  lg:text-lg
                `}
              >
                View Templates
              </Button>
            </Link>
          </m.div>

          <m.div
            className={`
              mt-20 grid grid-cols-2 gap-4
              md:grid-cols-4
            `}
            variants={staggerContainer}
            initial='hidden'
            animate='visible'
          >
            {statMeta.map((item, idx) => (
              <m.div
                key={idx}
                className={`
                  bg-card/50 border-border/50 group relative cursor-pointer
                  overflow-hidden rounded-2xl border p-4 backdrop-blur-md
                  transition-all duration-500
                  hover:border-primary/30 hover:shadow-primary/10
                  hover:-translate-y-2 hover:shadow-2xl
                `}
                variants={fadeInUp}
              >
                <div className='mb-2 flex items-center gap-2'>
                  <div
                    className={`
                      h-2 w-2 rounded-full
                      ${item.color}
                    `}
                  />
                  <span
                    className={`
                      text-muted-foreground text-xs font-medium tracking-wider
                      uppercase
                    `}
                  >
                    {item.label}
                  </span>
                </div>
                <div className='text-2xl font-bold'>{item.count}</div>
              </m.div>
            ))}
          </m.div>

          <div
            className='animate-fade-in mt-20 flex flex-col items-center gap-3'
            style={{ animationDelay: '1.5s' }}
          >
            <span
              className={`
                text-muted-foreground text-xs font-medium tracking-[0.2em]
                uppercase
              `}
            >
              Scroll to explore
            </span>
            <div
              className={`
                border-primary/30 flex h-10 w-6 justify-center rounded-full
                border-2 p-1
              `}
            >
              <div className='bg-primary h-2 w-1 rounded-full' />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
