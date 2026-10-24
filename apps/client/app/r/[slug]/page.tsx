import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { SharedResume } from '@/components/shared-resume/shared-resume';
import { Env } from '@/configs/env.config';
import { type PublicResume } from '@/types/resume.type';

interface SharedResumePageProps {
  params: Promise<{ slug: string }>;
}

/** Shared by link, not published: kept out of search results. */
const NO_INDEX = { index: false, follow: false };

// Deduped between generateMetadata and the page within one request
const getSharedResume = cache(
  async (slug: string): Promise<PublicResume | null> => {
    const response = await fetch(
      `${Env.NEXT_PUBLIC_API_URL}/public/resumes/${encodeURIComponent(slug)}`,
      // Edits show up as soon as the owner saves them
      { cache: 'no-store' },
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Loading shared resume failed: ${response.status}`);
    }
    return (await response.json()) as PublicResume;
  },
);

export async function generateMetadata({
  params,
}: SharedResumePageProps): Promise<Metadata> {
  const resume = await getSharedResume((await params).slug);
  if (!resume) return { title: 'Resume not found', robots: NO_INDEX };
  return {
    title:
      [resume.title, resume.subTitle].filter(Boolean).join(' – ') || 'Resume',
    description: `${resume.title || 'A'} resume, made with CraftCV.`,
    robots: NO_INDEX,
  };
}

/** A resume its owner shared by link: read-only, no account needed. */
export default async function SharedResumePage({
  params,
}: SharedResumePageProps) {
  const resume = await getSharedResume((await params).slug);
  if (!resume) notFound();
  return <SharedResume resume={resume} />;
}
