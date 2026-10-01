import { Button } from '@repo/ui/components/button';
import { ArrowLeft } from 'lucide-react';
import { type Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getTemplateBySlug, TEMPLATES } from '@/components/templates/registry';
import { sampleResume } from '@/components/templates/sample-resume';
import { TemplateThumbnail } from '@/components/templates/template-thumbnail';

export const metadata: Metadata = {
  title: 'Builder',
  description: 'Build your CV from a template.',
};

// Placeholder until the real section editor lands (Phase 2) — for now it
// only resolves `?template=<slug>` and previews that template.
export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string | string[] }>;
}) {
  const { template: slug } = await searchParams;
  const template =
    typeof slug === 'string' ? getTemplateBySlug(slug) : TEMPLATES[0];
  if (!template) notFound();
  const TemplateComponent = template.component;

  return (
    <main className='container mx-auto px-4 pt-24 pb-20'>
      <div className='mx-auto mb-8 flex max-w-3xl items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>{template.name}</h1>
          <p className='text-muted-foreground text-sm'>
            {template.description}
          </p>
        </div>
        <Button asChild variant='outline' className='shrink-0 gap-1'>
          <Link href='/templates'>
            <ArrowLeft className='size-4' />
            Change template
          </Link>
        </Button>
      </div>

      <div className='mx-auto max-w-3xl shadow-xl'>
        <TemplateThumbnail>
          <TemplateComponent resume={sampleResume} />
        </TemplateThumbnail>
      </div>
    </main>
  );
}
