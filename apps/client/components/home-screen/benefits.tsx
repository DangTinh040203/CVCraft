'use client';
import { Button } from '@repo/ui/components/button';
import { m } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import BlurText from '@/components/common/blur-text';
import ShinyText from '@/components/common/shiny-text';
import { fadeInLeft, staggerContainer } from '@/styles/animation';

const benefits = [
  'ATS-optimized formatting',
  'Real-time preview',
  'Export to PDF & Word',
  'Job-specific tailoring',
  'Grammar & spelling check',
  'Unlimited revisions',
];

const BenefitsSection = () => {
  return (
    <section
      className={`
        to-primary/5 bg-linear-to-b from-transparent px-2 py-8
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
              <ShinyText
                text='Built for Success'
                speed={3}
                className='text-sm font-semibold tracking-wider uppercase'
              />
            </m.div>
            <BlurText
              text='Stand Out from the Massive Competition'
              delay={80}
              animateBy='words'
              direction='top'
              className={`
                font-display mb-8 flex-wrap text-3xl font-extrabold
                tracking-tight
                md:text-5xl
              `}
            />
            <p
              className={`
                text-muted-foreground mb-10 text-base leading-relaxed
                md:text-xl
              `}
            >
              Our CV builder is designed by industry experts to ensure your
              profile gets the attention it deserves from modern hiring
              systems.
            </p>

            <m.div
              className={`
                grid gap-6
                sm:grid-cols-2
              `}
              variants={staggerContainer}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true }}
            >
              {benefits.map((benefit, index) => (
                <m.div
                  key={benefit}
                  className='group flex items-center gap-4'
                  variants={fadeInLeft}
                >
                  <m.div
                    initial={{ scale: 0, rotate: -45 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 200,
                      damping: 12,
                    }}
                    className={`
                      bg-primary/10 rounded-lg p-2 transition-colors
                      group-hover:bg-primary/20
                    `}
                  >
                    <CheckCircle2 className='text-primary h-6 w-6 shrink-0' />
                  </m.div>
                  <span
                    className={`
                      text-foreground text-base font-medium
                      md:text-lg
                    `}
                  >
                    {benefit}
                  </span>
                </m.div>
              ))}
            </m.div>

            <Link href='/builder' className='mt-12 inline-block'>
              <m.div
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size='xl'
                  className={`
                    shadow-primary/20 h-14 rounded-full px-10 text-base
                    shadow-lg
                    lg:text-lg
                  `}
                >
                  Get Started Now for Free
                  <ArrowRight className='ml-3 h-5 w-5' />
                </Button>
              </m.div>
            </Link>
          </m.div>

          <m.div
            className='relative'
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          >
            <div
              className={`
                from-primary to-accent absolute -inset-4 rounded-[32px]
                bg-linear-to-r opacity-10 blur-2xl
              `}
            />

            <m.div
              className={`
                bg-card border-border/50 relative overflow-hidden rounded-[32px]
                border p-6 shadow-2xl backdrop-blur-sm
                md:p-10
              `}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className={`
                  bg-primary/5 absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32
                  rounded-full blur-3xl
                `}
              />

              <div className='space-y-8'>
                <div className='flex items-center gap-6'>
                  <div
                    className={`
                      from-primary to-accent text-primary-foreground
                      shadow-primary/30 flex h-16 w-16 items-center
                      justify-center rounded-2xl bg-linear-to-br text-xl
                      font-bold shadow-lg
                      md:h-20 md:w-20 md:text-2xl
                    `}
                  >
                    JA
                  </div>
                  <div>
                    <div
                      className={`
                        font-display text-xl font-bold
                        md:text-2xl
                      `}
                    >
                      John Anderson
                    </div>
                    <div className='text-primary font-medium tracking-wide'>
                      Senior Software Engineer
                    </div>
                  </div>
                </div>

                <div className='border-border/60 space-y-6 border-t pt-6'>
                  {[100, 85, 95, 75].map((width, i) => (
                    <div key={i} className='space-y-2'>
                      <div
                        className={`
                          text-muted-foreground flex justify-between text-sm
                          font-medium
                        `}
                      >
                        <span>
                          {
                            [
                              'Technical Skills',
                              'Experience',
                              'Education',
                              'Projects',
                            ][i]
                          }
                        </span>
                        <span>{width}% Match</span>
                      </div>
                      <div className='bg-muted h-3 overflow-hidden rounded-full'>
                        <m.div
                          className={`
                            bg-primary h-full rounded-full
                            shadow-[0_0_10px_rgba(108,35,215,0.4)]
                          `}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${width}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1.5,
                            delay: 0.5 + i * 0.2,
                            ease: 'easeOut',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className='flex gap-4 pt-4'>
                  <div
                    className={`
                      bg-primary/5 border-primary/10 text-primary rounded-full
                      border px-4 py-2 text-xs font-bold
                    `}
                  >
                    ATS PASSED
                  </div>
                  <div
                    className={`
                      bg-accent/5 border-accent/10 text-accent rounded-full
                      border px-4 py-2 text-xs font-bold
                    `}
                  >
                    RECRUITER READY
                  </div>
                </div>
              </div>
            </m.div>

            <div
              className={`
                gradient-bg absolute -bottom-10 -left-10 -z-10 h-48 w-48
                rounded-full opacity-30 blur-3xl
              `}
            />
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
