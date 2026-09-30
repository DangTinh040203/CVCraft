'use client';
import { CardContent } from '@repo/ui/components/card';
import { m } from 'framer-motion';
import { Award, Clock, Shield, Target, TrendingUp, Zap } from 'lucide-react';
import React from 'react';

import BlurText from '@/components/common/blur-text';
import ShinyText from '@/components/common/shiny-text';
import SpotlightCard from '@/components/common/spotlight-card';
import { fadeInUp, staggerContainer } from '@/styles/animation';

const reasons = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Create a professional CV in under 10 minutes with our intuitive builder.',
  },
  {
    icon: Shield,
    title: 'ATS-Friendly',
    description:
      'All templates are optimized to pass Applicant Tracking Systems.',
  },
  {
    icon: Clock,
    title: 'Save Time',
    description:
      'AI writes compelling content so you can focus on what matters.',
  },
  {
    icon: Target,
    title: 'Job-Targeted',
    description:
      'Tailor your CV to specific job descriptions for higher success rates.',
  },
  {
    icon: Award,
    title: 'Expert Approved',
    description:
      'Templates designed by hiring managers and career coaches.',
  },
  {
    icon: TrendingUp,
    title: 'Proven Results',
    description: '95% of users report getting more interview callbacks.',
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className={`
      relative overflow-hidden px-2 py-8
      md:px-4 md:py-24
    `}>
      <div
        className={`
          via-primary/20 absolute top-0 left-0 h-px w-full bg-linear-to-r
          from-transparent to-transparent
        `}
      />
      <div
        className={`
          via-primary/20 absolute bottom-0 left-0 h-px w-full bg-linear-to-r
          from-transparent to-transparent
        `}
      />

      <div className='container mx-auto'>
        <m.div
          className={`
            mb-10 text-center
            lg:mb-20
          `}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
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
              text='The CraftCV Edge'
              speed={3}
              className='text-sm font-semibold tracking-wider uppercase'
            />
          </m.div>
          <BlurText
            text='Why Choose CraftCV?'
            delay={80}
            animateBy='words'
            direction='top'
            className={`
              font-display mb-6 flex-wrap justify-center text-3xl font-extrabold
              tracking-tight
              md:text-5xl
            `}
          />
          <p
            className={`
              text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed
              md:text-lg
            `}
          >
            We combined recruitment expertise with cutting-edge AI to build
            the ultimate career growth toolkit.
          </p>
        </m.div>

        <m.div
          className={`
            grid gap-2
            sm:grid-cols-2
            lg:grid-cols-3 lg:gap-8
          `}
          variants={staggerContainer}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          {reasons.map((reason) => (
            <m.div key={reason.title} variants={fadeInUp}>
              <SpotlightCard
                className={`
                  border-border/50 group bg-card/40 h-full rounded-3xl
                  backdrop-blur-sm transition-all duration-500
                  hover:border-primary/20 hover:shadow-2xl
                `}
                spotlightColor='rgba(var(--primary-rgb, 124 58 237) / 0.12)'
              >
                <CardContent
                  className={`
                    relative flex flex-col items-center p-8 text-center
                  `}
                >
                  <m.div
                    className={`
                      from-primary/5 absolute inset-0 bg-linear-to-br
                      to-transparent opacity-0 transition-opacity duration-500
                      group-hover:opacity-100
                    `}
                  />
                  <m.div
                    className={`
                      bg-primary/10 text-primary relative z-10 mb-8 flex h-16
                      w-16 items-center justify-center rounded-2xl shadow-inner
                      transition-transform duration-500
                      group-hover:scale-110 group-hover:rotate-3
                    `}
                    whileHover={{ scale: 1.15 }}
                  >
                    <reason.icon className='h-8 w-8' />
                  </m.div>
                  <h3
                    className={`
                      font-display relative z-10 mb-4 text-lg font-bold
                      md:text-xl
                    `}
                  >
                    {reason.title}
                  </h3>
                  <p
                    className={`
                      text-muted-foreground relative z-10 text-base
                      leading-relaxed
                    `}
                  >
                    {reason.description}
                  </p>
                </CardContent>
              </SpotlightCard>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
