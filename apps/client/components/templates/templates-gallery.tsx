'use client';

import { useUser } from '@clerk/nextjs';
import { ToggleGroup, ToggleGroupItem } from '@repo/ui/components/toggle-group';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { TEMPLATES } from '@/components/templates/registry';
import { TemplateCard } from '@/components/templates/template-card';
import { TemplateSelectionDialog } from '@/components/templates/template-selection-dialog';
import { useImportResume } from '@/hooks/use-import-resume';
import { fadeInUp, staggerContainer } from '@/styles/animation';

type Filter = 'all' | 'free' | 'premium';

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Templates' },
  { key: 'free', label: 'Free' },
  { key: 'premium', label: 'Premium' },
];

export function TemplatesGallery() {
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { isSignedIn } = useUser();
  const router = useRouter();
  const { importResume, isImporting } = useImportResume();

  const handleUse = (slug: string) => {
    // Signed out, the builder's auth redirect brings them back to it
    if (!isSignedIn) {
      router.push(`/builder?template=${slug}`);
      return;
    }
    setSelectedSlug(slug);
  };

  const handleSelect = async (type: 'upload' | 'scratch', file?: File) => {
    if (!selectedSlug) return;
    if (type === 'upload') {
      if (!file || !(await importResume(file))) return;
    }
    router.push(`/builder?template=${selectedSlug}`);
  };

  const visibleTemplates = useMemo(() => {
    if (filter === 'all') return TEMPLATES;
    return TEMPLATES.filter((t) =>
      filter === 'premium' ? t.isPremium : !t.isPremium,
    );
  }, [filter]);

  return (
    <section className='relative'>
      <div className='absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden'>
        <div
          className={`
            from-background via-primary/8 to-background absolute inset-0
            bg-linear-to-b
          `}
        />
        <div
          className={`
            bg-primary/10 absolute top-[-10%] right-[-8%] h-[220px] w-[220px]
            rounded-full blur-[80px]
            md:bg-primary/20 md:h-[500px] md:w-[500px] md:blur-[120px]
          `}
        />
        <div
          className={`
            bg-accent/10 absolute top-[10%] left-[-10%] h-[180px] w-[180px]
            rounded-full blur-[70px]
            md:bg-accent/20 md:h-[400px] md:w-[400px] md:blur-[100px]
          `}
        />
      </div>

      {/* pt-24/pt-32 clears the now-fixed Header (h-16) plus breathing
          room — same values home-screen/hero.tsx uses for the same reason. */}
      <div
        className={`
          container mx-auto px-4 pt-24 pb-10
          md:px-6 md:pt-32
        `}
      >
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
            Every template renders from the same content — preview any of them
            with sample data, pick one, switch anytime later.
          </m.p>
        </m.div>

        <m.div
          className='mb-10 flex justify-center'
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <ToggleGroup
            type='single'
            spacing={2}
            aria-label='Filter templates'
            value={filter}
            // Always one filter: clicking the active one doesn't clear it
            onValueChange={(value) => value && setFilter(value as Filter)}
            className='flex-wrap justify-center'
          >
            {filters.map((f) => (
              <ToggleGroupItem
                key={f.key}
                value={f.key}
                className={`
                  bg-background border-border/80 h-10 cursor-pointer
                  rounded-full border px-5 font-bold shadow-sm transition-all
                  hover:border-primary/40 hover:bg-primary/5
                  hover:text-foreground
                  data-[state=on]:bg-primary
                  data-[state=on]:text-primary-foreground
                  data-[state=on]:border-primary data-[state=on]:shadow-md
                `}
              >
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </m.div>
      </div>

      <div
        className={`
          container mx-auto px-4 pb-20
          md:px-6
        `}
      >
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
              <TemplateCard templateKey={template.key} onUse={handleUse} />
            </m.div>
          ))}
        </m.div>

        {visibleTemplates.length === 0 && (
          <p className='text-muted-foreground py-16 text-center'>
            No templates in this filter yet.
          </p>
        )}
      </div>

      <TemplateSelectionDialog
        isOpen={!!selectedSlug}
        isLoading={isImporting}
        onOpenChange={(open) => {
          if (!open && !isImporting) setSelectedSlug(null);
        }}
        onSelect={handleSelect}
      />
    </section>
  );
}
