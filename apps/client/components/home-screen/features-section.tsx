'use client';
import { m } from 'framer-motion';
import { FileText, MessageSquare, Sparkles } from 'lucide-react';
import React from 'react';

import BlurText from '@/components/common/blur-text';
import ShinyText from '@/components/common/shiny-text';
import SpotlightCard from '@/components/common/spotlight-card';
import { fadeInUp, staggerContainer } from '@/styles/animation';

const features = [
  {
    icon: FileText,
    title: '10 Professional Templates',
    description:
      "Choose from beautifully designed templates that catch recruiters' attention.",
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Writing',
    description:
      'Generate and refine your CV content with AI. Just paste a job description.',
  },
  {
    icon: MessageSquare,
    title: 'Mock Interviews',
    description:
      'Practice with AI interviews tailored to your target role and industry.',
  },
];

const FeaturesSection = () => {
  return (
    <section className={`
      relative overflow-hidden px-2 py-8
      md:px-4 md:py-24
    `}>
      <div className='container mx-auto'>
        <m.div
          className='mb-20 text-center'
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <m.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`
              text-primary bg-primary/10 mb-6 inline-block rounded-full px-4
              py-1.5 text-sm font-semibold tracking-wider uppercase
            `}
          >
            <ShinyText
              text='Powerful Features'
              speed={3}
              className='text-sm font-semibold tracking-wider uppercase'
            />
          </m.div>
          <BlurText
            text='Everything You Need to Build a Winning Career'
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
            From professional templates to AI-powered content generation and
            mock interviews, CVCraft provides the end-to-end toolkit for your
            job search.
          </p>
        </m.div>

        <m.div
          className={`
            grid gap-8
            md:grid-cols-3
          `}
          variants={staggerContainer}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-50px' }}
        >
          {features.map((feature) => (
            <m.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{
                y: -12,
                transition: { duration: 0.4, ease: 'easeOut' },
              }}
            >
              <SpotlightCard
                className={`
                  group bg-card border-border/50 shadow-card relative h-full
                  rounded-3xl border p-10 transition-all duration-500
                  hover:border-primary/20 hover:shadow-2xl
                `}
                spotlightColor='rgba(var(--primary-rgb, 124 58 237) / 0.15)'
              >
                <div
                  className={`
                    absolute top-0 right-0 p-8 opacity-[0.03] transition-opacity
                    group-hover:opacity-[0.08]
                  `}
                >
                  <feature.icon size={120} />
                </div>
                <div className='relative z-10'>
                  <div
                    className={`bg-primary/10 mb-6 inline-flex rounded-2xl p-4`}
                  >
                    <feature.icon className='text-primary h-8 w-8' />
                  </div>
                  <h3
                    className={`
                      font-display mb-4 text-xl font-bold
                      md:text-2xl
                    `}
                  >
                    {feature.title}
                  </h3>
                  <p className='text-muted-foreground leading-relaxed'>
                    {feature.description}
                  </p>
                </div>
              </SpotlightCard>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
