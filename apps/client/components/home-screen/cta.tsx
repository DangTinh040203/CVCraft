'use client';
import { Button } from '@repo/ui/components/button';
import { m } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import BlurText from '@/components/common/blur-text';

const CTASection = () => {
  return (
    <section className='px-4 py-24 pb-32'>
      <div className='container mx-auto'>
        <m.div
          className={`
            from-primary to-primary/50 shadow-primary/20 relative
            overflow-hidden rounded-[48px] bg-linear-to-br p-8 text-center
            shadow-2xl
            md:p-12
            lg:p-24
          `}
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, type: 'spring', bounce: 0.3 }}
        >
          <div
            className={`
              absolute top-0 left-0 h-64 w-64 rounded-full bg-white/10 blur-3xl
            `}
            style={{
              animation: 'cta-blob-1 10s ease-in-out infinite',
              willChange: 'transform',
            }}
          />
          <div
            className={`
              absolute right-0 bottom-0 h-96 w-96 rounded-full bg-black/10
              blur-3xl
            `}
            style={{
              animation: 'cta-blob-2 12s ease-in-out infinite',
              willChange: 'transform',
            }}
          />

          <div className='relative z-10'>
            <m.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className={`
                text-primary-foreground mb-8 inline-block rounded-full
                bg-white/20 px-6 py-2 text-sm font-black tracking-[0.2em]
                uppercase backdrop-blur-md
              `}
            >
              Take the next step
            </m.div>
            <BlurText
              text='Ready to Land Your Dream Job?'
              delay={100}
              animateBy='words'
              direction='top'
              className={`
                font-display text-primary-foreground mb-8 flex-wrap
                justify-center text-3xl font-black tracking-tighter
                md:text-6xl
                lg:text-7xl
              `}
            />
            <m.p
              className={`
                text-primary-foreground/80 mx-auto mb-12 max-w-2xl text-base
                leading-relaxed font-medium
                md:text-xl
              `}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Join 10,000+ professionals who have already transformed their
              careers with our AI-powered toolkit.
            </m.p>
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className={`
                flex flex-col items-center justify-center gap-6
                sm:flex-row
              `}
            >
              <Link href='/templates'>
                <m.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size='xl'
                    className={`
                      text-primary h-16 rounded-full bg-white px-12 text-base
                      font-black shadow-2xl transition-all duration-300
                      hover:bg-white/90
                      md:text-xl
                    `}
                  >
                    Get Started Free
                    <ArrowRight className='ml-3 h-6 w-6' />
                  </Button>
                </m.div>
              </Link>
            </m.div>
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default CTASection;
