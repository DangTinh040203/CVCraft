'use client';

import { cn } from '@repo/ui/lib/utils';
import { m } from 'framer-motion';
import { useMemo, useState } from 'react';

import { TEMPLATES } from '@/components/templates/registry';
import { TemplateCard } from '@/components/templates/template-card';
import { fadeInUp, staggerContainer } from '@/styles/animation';

type Filter = 'all' | 'free' | 'premium';

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Templates' },
  { key: 'free', label: 'Free' },
  { key: 'premium', label: 'Premium' },
];

export function TemplatesGallery() {
  const [filter, setFilter] = useState<Filter>('all');

  const visibleTemplates = useMemo(() => {
    if (filter === 'all') return TEMPLATES;
    return TEMPLATES.filter((t) =>
      filter === 'premium' ? t.isPremium : !t.isPremium,
    );
  }, [filter]);

  return (
    <section className='relative'>
      {/* Gradient wash + blobs behind the hero band. Fades from `background`
          back to `background` (not to a flat cutoff) so it blends into the
          header above AND the plain grid section below, with no visible
          seam at either edge — and lives in its own fixed-height, clipped
          wrapper so blob % positioning doesn't depend on the (very tall,
          grid-dependent) height of the whole section. */}
      <div className='absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden'>
        <div
          className={`
            from-background via-primary/8 to-background absolute inset-0
            bg-linear-to-b
          `}
        />
        <div
          className={`
            bg-primary/20 absolute top-[-10%] right-[-8%] h-[500px] w-[500px]
            rounded-full blur-[120px]
          `}
        />
        <div
          className={`
            bg-accent/20 absolute top-[10%] left-[-10%] h-[400px] w-[400px]
            rounded-full blur-[100px]
          `}
        />
      </div>

      {/* pt-24/pt-32 clears the now-fixed Header (h-16) plus breathing
          room — same values home-screen/hero.tsx uses for the same reason. */}
      <div className={`
        container mx-auto px-4 pt-24 pb-10
        md:px-6 md:pt-32
      `}>
        <m.div
          className='mx-auto mb-10 max-w-2xl text-center'
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <m.h1
            variants={fadeInUp}
            className={`
              font-display mb-4 text-3xl font-extrabold tracking-tight
              md:text-5xl
            `}
          >
            Choose a <span className='gradient-text'>Template</span>
          </m.h1>
          <m.p
            variants={fadeInUp}
            className={`
              text-muted-foreground text-base
              md:text-lg
            `}
          >
            Every template renders from the same content — preview any of
            them with sample data, pick one, switch anytime later.
          </m.p>
        </m.div>

        <m.div
          className='mb-10 flex flex-wrap justify-center gap-2'
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {filters.map((f) => (
            <m.button
              key={f.key}
              type='button'
              variants={fadeInUp}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={() => setFilter(f.key)}
              className={cn(
                `
                  cursor-pointer rounded-full px-5 py-2 text-sm font-bold
                  transition-colors
                `,
                filter === f.key
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : `
                    bg-background text-foreground border-border/80 border
                    shadow-sm
                    hover:border-primary/40 hover:bg-primary/5
                  `,
              )}
            >
              {f.label}
            </m.button>
          ))}
        </m.div>
      </div>

      <div className={`
        container mx-auto px-4 pb-20
        md:px-6
      `}>
        <m.div
          key={filter}
          className={`
            grid grid-cols-1 gap-6
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          `}
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
        >
          {visibleTemplates.map((template) => (
            <m.div key={template.key} variants={fadeInUp}>
              <TemplateCard templateKey={template.key} />
            </m.div>
          ))}
        </m.div>

        {visibleTemplates.length === 0 && (
          <p className='text-muted-foreground py-16 text-center'>
            No templates in this filter yet.
          </p>
        )}
      </div>
    </section>
  );
}
