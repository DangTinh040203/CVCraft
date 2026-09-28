'use client';
import { Button } from '@repo/ui/components/button';
import { m } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { fadeInUp, scaleIn, staggerContainer } from '@/styles/animation';

const categories = [
  {
    key: 'professional',
    label: 'Professional',
    count: 4,
    color: 'bg-primary/10 text-primary',
  },
  {
    key: 'modern',
    label: 'Modern',
    count: 2,
    color: 'bg-secondary/10 text-primary',
  },
  {
    key: 'creative',
    label: 'Creative',
    count: 2,
    color: 'bg-destructive/10 text-destructive',
  },
  {
    key: 'minimal',
    label: 'Minimal',
    count: 2,
    color: 'bg-muted text-muted-foreground',
  },
];

const TemplatePreviewSection = () => {
  return (
    <section
      className={`
        bg-background relative overflow-hidden px-2 py-8
        md:px-4 md:py-24
      `}
    >
      <div className='container mx-auto'>
        <div className={`
          grid items-center gap-16
          lg:grid-cols-2
        `}>
          <m.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <m.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`
                text-primary bg-primary/10 mb-6 inline-block rounded-full px-4
                py-1.5 text-sm font-semibold tracking-wider uppercase
              `}
            >
              Premium Designs
            </m.div>
            <h2
              className={`
                font-display mb-8 text-3xl font-extrabold tracking-tight
                md:text-5xl
              `}
            >
              Choose from{' '}
              <span className='gradient-text'>10+ Professional</span>{' '}
              Templates
            </h2>
            <p
              className={`
                text-muted-foreground mb-10 text-base leading-relaxed
                md:text-xl
              `}
            >
              Our collection of high-performance templates is meticulously
              crafted to meet the standards of top-tier companies and
              recruitment agencies.
            </p>

            <m.div
              className='mb-12 flex flex-wrap gap-3'
              variants={staggerContainer}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true }}
            >
              {categories.map((cat) => (
                <m.span
                  key={cat.key}
                  className={`
                    cursor-pointer rounded-xl px-5 py-2.5 text-sm font-bold
                    tracking-tight shadow-sm transition-all duration-300
                    hover:shadow-md
                    ${cat.color}
                  `}
                  variants={scaleIn}
                  whileHover={{
                    scale: 1.05,
                    y: -2,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {cat.label}
                  <span className='ml-2 text-xs font-medium opacity-60'>
                    ({cat.count})
                  </span>
                </m.span>
              ))}
            </m.div>

            <Link href='/templates'>
              <m.div
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size='xl'
                  className={`
                    group shadow-primary/10 h-14 rounded-full px-10 text-base
                    shadow-xl
                    lg:text-lg
                  `}
                >
                  Explore All Templates
                  <ChevronRight
                    className={`
                      ml-2 h-5 w-5 transition-transform duration-300
                      group-hover:translate-x-1
                    `}
                  />
                </Button>
              </m.div>
            </Link>
          </m.div>

          <m.div
            className='relative'
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div
              className={`
                from-primary/10 to-accent/10 absolute -inset-10 -z-10
                rounded-full bg-linear-to-tr blur-3xl
              `}
            />

            <m.div
              className={`
                grid grid-cols-1 gap-6
                sm:grid-cols-2
              `}
              variants={staggerContainer}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true }}
            >
              {[1, 2, 3, 4].map((i) => (
                <m.div
                  key={i}
                  className={`
                    bg-card border-border/60 group relative aspect-square
                    overflow-hidden rounded-[24px] border p-5 shadow-xl
                    transition-all duration-500
                    hover:border-primary/30 hover:shadow-2xl
                  `}
                  variants={fadeInUp}
                >
                  <div
                    className={`
                      from-primary/5 absolute inset-0 bg-linear-to-br
                      to-transparent opacity-0 transition-opacity
                      group-hover:opacity-100
                    `}
                  />

                  <div
                    className={`
                      relative z-10 flex h-full flex-col justify-between
                      space-y-4
                    `}
                  >
                    <div className='flex items-center gap-4'>
                      <div
                        className={`
                          bg-primary/10 text-primary flex h-12 w-12 items-center
                          justify-center rounded-xl font-bold shadow-inner
                        `}
                      >
                        {i}
                      </div>
                      <div className='flex-1'>
                        <div
                          className={`
                            bg-foreground/15 h-2.5 w-3/4 rounded-full
                            transition-colors
                            group-hover:bg-primary/20
                          `}
                        />
                        <div
                          className={`
                            bg-muted-foreground/10 mt-2 h-2 w-1/2 rounded-full
                          `}
                        />
                      </div>
                    </div>

                    <div className='border-border/60 space-y-3 border-t pt-4'>
                      <m.div
                        className='bg-muted/60 h-2 rounded-full'
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                      />
                      <m.div
                        className='bg-muted/60 h-2 rounded-full'
                        initial={{ width: 0 }}
                        whileInView={{ width: '85%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1 + 0.4 }}
                      />
                      {i === 1 && (
                        <m.div
                          className='bg-muted/60 h-2 rounded-full'
                          initial={{ width: 0 }}
                          whileInView={{ width: '92%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      )}
                    </div>

                    <div
                      className={`
                        flex translate-y-2 transform justify-end opacity-0
                        transition-opacity duration-300
                        group-hover:translate-y-0 group-hover:opacity-100
                      `}
                    >
                      <div
                        className={`
                          text-primary text-xs font-black tracking-widest
                          uppercase
                        `}
                      >
                        Preview Design
                      </div>
                    </div>
                  </div>
                </m.div>
              ))}
            </m.div>
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default TemplatePreviewSection;
