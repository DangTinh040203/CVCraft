'use client';

import { Button } from '@repo/ui/components/button';
import { m } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  FileText,
  type LucideIcon,
  MessagesSquare,
  Mic,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import {
  INTERVIEW_DESCRIPTIONS,
  InterviewPanel,
} from '@/components/interview/interview-panel';
import { useInterview } from '@/hooks/use-interview';
import { fadeInUp, staggerContainer } from '@/styles/animation';

const STEPS: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: FileText,
    title: 'Add the job',
    text: 'Paste the posting or upload it as a PDF. The questions follow its responsibilities, skills and seniority.',
  },
  {
    icon: MessagesSquare,
    title: 'Talk it through',
    text: 'The interviewer asks one question at a time and waits for your answer, like a real call.',
  },
  {
    icon: BarChart3,
    title: 'Get scored feedback',
    text: 'A score for each answer, what was missing, and what a strong answer would cover.',
  },
];

/**
 * The mock interview outside the builder: there's no resume here, so the
 * interviewer works from the job description alone.
 */
export function InterviewScreen() {
  const interview = useInterview({ withResume: false });
  const { phase } = interview;
  const busy =
    phase === 'connecting' || phase === 'live' || phase === 'evaluating';

  // Reloading or closing the tab mid-interview ends it unscored: ask first
  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);

  return (
    <section className='relative'>
      {/* The home page's backdrop: a soft brand wash with two glows */}
      <div
        aria-hidden
        className='absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden'
      >
        <div
          className={`
            from-primary/8 via-primary/3 absolute inset-0 bg-linear-to-b
            to-transparent
          `}
        />
        <div
          className={`
            bg-primary/10 absolute top-[-20%] right-[-8%] h-[220px] w-[220px]
            rounded-full blur-[80px]
            md:bg-primary/15 md:h-[460px] md:w-[460px] md:blur-[120px]
          `}
        />
        <div
          className={`
            bg-accent/10 absolute top-[5%] left-[-10%] h-[180px] w-[180px]
            rounded-full blur-[70px]
            md:h-[360px] md:w-[360px] md:blur-[100px]
          `}
        />
      </div>

      <div
        className={`
          container mx-auto max-w-6xl px-4 pt-28 pb-20
          md:px-6 md:pt-26
        `}
      >
        <m.header
          className={`
            mb-10 max-w-2xl
            md:mb-12
          `}
          variants={staggerContainer}
          initial='hidden'
          animate='visible'
        >
          <m.span
            variants={fadeInUp}
            className={`
              text-primary bg-primary/10 mb-5 inline-block rounded-full px-4
              py-1.5 text-xs font-semibold tracking-wider uppercase
            `}
          >
            Mock interview
          </m.span>
          <m.h1
            variants={fadeInUp}
            className={`
              font-display text-4xl leading-[1.1] font-extrabold tracking-tight
              md:text-5xl
            `}
          >
            Practice for the <span className='gradient-text'>job</span> you want
          </m.h1>
          <m.p
            variants={fadeInUp}
            className={`
              text-muted-foreground mt-4 text-base leading-relaxed
              md:text-lg
            `}
          >
            Give us the job description and talk with an AI interviewer about
            it, out loud. No resume needed.
          </m.p>
        </m.header>

        <div
          className={`
            grid items-start gap-8
            lg:grid-cols-[minmax(0,1fr)_320px]
          `}
        >
          <m.div
            variants={fadeInUp}
            initial='hidden'
            animate='visible'
            className={`
              bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm
            `}
          >
            <div className='flex items-center gap-3 border-b px-6 pt-6 pb-5'>
              <div
                className={`
                  from-primary to-primary/70 flex size-10 shrink-0 items-center
                  justify-center rounded-xl bg-linear-to-br shadow-sm
                `}
              >
                <Mic className='text-primary-foreground size-5' />
              </div>
              <div className='min-w-0'>
                <h2 className='text-lg font-semibold'>Your interview</h2>
                <p className='text-muted-foreground text-sm'>
                  {INTERVIEW_DESCRIPTIONS[phase]}
                </p>
              </div>
            </div>

            <InterviewPanel interview={interview} withResume={false} active />
          </m.div>

          <m.aside
            variants={staggerContainer}
            initial='hidden'
            animate='visible'
            className='space-y-6'
          >
            <m.div
              variants={fadeInUp}
              className='bg-card rounded-2xl border p-6 shadow-sm'
            >
              <h2 className='mb-5 text-sm font-semibold'>How it works</h2>
              <ol className='space-y-5'>
                {STEPS.map(({ icon: Icon, title, text }) => (
                  <li key={title} className='flex gap-3'>
                    <div
                      className={`
                        bg-primary/10 text-primary flex size-8 shrink-0
                        items-center justify-center rounded-lg
                      `}
                    >
                      <Icon className='size-4' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>{title}</p>
                      <p
                        className={`
                          text-muted-foreground mt-0.5 text-xs leading-relaxed
                        `}
                      >
                        {text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </m.div>

            <m.div
              variants={fadeInUp}
              className={`border-primary/20 bg-primary/5 rounded-2xl border p-6`}
            >
              <h2 className='text-sm font-semibold'>
                Want questions on your resume too?
              </h2>
              <p
                className={`
                  text-muted-foreground mt-1.5 text-xs leading-relaxed
                `}
              >
                From the builder, the interviewer also reads your resume and
                asks about your own experience.
              </p>
              <Button
                asChild
                variant='outline'
                size='sm'
                className={`
                  group mt-4 gap-1.5 rounded-full
                  hover:bg-background hover:text-foreground
                `}
              >
                <Link href='/builder?interview=1'>
                  Practice with my resume
                  <ArrowRight
                    className={`
                      size-3.5 transition-transform
                      group-hover:translate-x-0.5
                    `}
                  />
                </Link>
              </Button>
            </m.div>
          </m.aside>
        </div>
      </div>
    </section>
  );
}
