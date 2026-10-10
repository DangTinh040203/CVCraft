'use client';

import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Dialog, DialogContent, DialogTitle } from '@repo/ui/components/dialog';
import { ArrowRight, Lock, ZoomIn } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { TEMPLATES } from '@/components/templates/registry';
import { sampleResume } from '@/components/templates/sample-resume';
import { TemplateThumbnail } from '@/components/templates/template-thumbnail';

export function TemplateCard({ templateKey }: { templateKey: string }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const template = TEMPLATES.find((t) => t.key === templateKey);
  if (!template) return null;
  const TemplateComponent = template.component;

  return (
    <div
      className={`
        group border-border/60 bg-card relative overflow-hidden rounded-2xl
        border shadow-sm transition-all duration-300
        hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl
      `}
    >
      <button
        type='button'
        onClick={() => setPreviewOpen(true)}
        className='relative block w-full cursor-zoom-in'
        aria-label={`Preview ${template.name}`}
      >
        <TemplateThumbnail>
          <TemplateComponent resume={sampleResume} />
        </TemplateThumbnail>
        <div
          className={`
            pointer-events-none absolute inset-0 bg-neutral-900/0
            transition-colors duration-300
            group-hover:bg-neutral-900/10
          `}
        />
        <span
          className={`
            bg-background/90 text-foreground absolute bottom-2 left-2
            inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px]
            font-semibold shadow-sm transition-transform duration-300
            group-hover:scale-105
          `}
        >
          <ZoomIn className='size-3' />
          Preview
        </span>
      </button>

      {template.isPremium && (
        <Badge
          variant='default'
          className={`
            absolute top-3 right-3 gap-1 bg-amber-500 text-white shadow-sm
          `}
        >
          <Lock className='size-3' />
          Premium
        </Badge>
      )}

      <div
        className={`
          bg-card border-border/60 flex items-center justify-between gap-3
          border-t p-4
        `}
      >
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <h3 className='truncate text-base font-bold'>{template.name}</h3>
            {!template.isPremium && (
              <span
                className={`
                  shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px]
                  font-bold text-emerald-700
                `}
              >
                Free
              </span>
            )}
          </div>
        </div>
        <Button asChild className='min-w-20 shrink-0 gap-1'>
          <Link href={`/builder?template=${template.slug}`}>
            Use
            <ArrowRight className='size-3.5' />
          </Link>
        </Button>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen} modal>
        <DialogContent className={`
          max-h-[90vh] max-w-2xl scrollbar-none overflow-y-auto p-0
        `}>
          <DialogTitle className='sr-only'>{template.name} preview</DialogTitle>
          <div className='bg-neutral-100 p-6'>
            <div className='mx-auto max-w-[480px] shadow-xl'>
              <TemplateThumbnail>
                <TemplateComponent resume={sampleResume} />
              </TemplateThumbnail>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
