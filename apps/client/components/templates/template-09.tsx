import { Briefcase, GraduationCap, Languages, Sparkles, User } from 'lucide-react';
import Image from 'next/image';

import {
  formatDateRange,
  type ResumeData,
  sortByOrder,
} from '@/components/templates/resume.types';

interface TemplateProps {
  resume: ResumeData;
}

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function proficiencyPercent(value: string) {
  if (value === 'Native') return 100;
  if (value === 'Fluent') return 85;
  if (value === 'Intermediate') return 60;
  return 40;
}

function LanguageRing({ name, level }: { name: string; level: string }) {
  const percent = proficiencyPercent(level);
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className='flex flex-col items-center gap-1'>
      <svg width='48' height='48' viewBox='0 0 48 48' className='-rotate-90'>
        <circle
          cx='24'
          cy='24'
          r={RADIUS}
          fill='none'
          stroke='rgba(255,255,255,0.2)'
          strokeWidth='4'
        />
        <circle
          cx='24'
          cy='24'
          r={RADIUS}
          fill='none'
          stroke='white'
          strokeWidth='4'
          strokeLinecap='round'
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <p className='-mt-8 text-[8pt] font-bold text-white'>{percent}%</p>
      <p className='mt-4 text-[7.5pt] text-rose-100'>{name}</p>
    </div>
  );
}

/**
 * Template 09 — "Colorful Icons"
 * Wine-colored right sidebar with icon-led headers and circular language
 * proficiency rings, pill-style skills — a warmer, more expressive style.
 */
export function Template09({ resume }: TemplateProps) {
  const information = sortByOrder(resume.information);
  const educations = sortByOrder(resume.educations);
  const workExperiences = sortByOrder(resume.workExperiences);
  const skills = sortByOrder(resume.skills);
  const certifications = sortByOrder(resume.certifications);
  const languages = sortByOrder(resume.languages);

  return (
    <div className={`
      flex min-h-[297mm] w-[210mm] bg-white text-[10pt] text-neutral-800
    `}>
      <main className='flex-1 p-[9mm]'>
        <header className='mb-6'>
          <h1 className='text-[19pt] font-bold text-neutral-900'>
            {resume.title}
          </h1>
          <p className='text-[10pt] font-medium text-rose-700'>
            {resume.subTitle}
          </p>
        </header>

        <section className='mb-5 break-inside-avoid'>
          <h2 className={`
            mb-1.5 flex items-center gap-2 text-[10pt] font-bold
            text-neutral-900
          `}>
            <User className='size-3.5 text-rose-700' />
            Professional Summary
          </h2>
          <p className='text-[9.5pt] leading-relaxed text-neutral-700'>
            {resume.overview}
          </p>
        </section>

        <section className='mb-5'>
          <h2 className={`
            mb-2 flex items-center gap-2 text-[10pt] font-bold text-neutral-900
          `}>
            <Briefcase className='size-3.5 text-rose-700' />
            Work Experience
          </h2>
          <div className='space-y-4'>
            {workExperiences.map((job) => (
              <div key={job.id} className='break-inside-avoid'>
                <div className='flex items-baseline justify-between'>
                  <h3 className='text-[10pt] font-semibold text-neutral-900'>
                    {job.position}
                  </h3>
                  <span className='text-[8.5pt] text-neutral-500'>
                    {formatDateRange(job.startDate, job.endDate)}
                  </span>
                </div>
                <p className='text-[9pt] font-medium text-neutral-500'>
                  {job.company}
                </p>
                <p className={`
                  mt-1 text-[9pt] whitespace-pre-line text-neutral-700
                `}>
                  {job.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className='break-inside-avoid'>
          <h2 className={`
            mb-2 flex items-center gap-2 text-[10pt] font-bold text-neutral-900
          `}>
            <GraduationCap className='size-3.5 text-rose-700' />
            Education
          </h2>
          <div className='space-y-2'>
            {educations.map((edu) => (
              <div key={edu.id} className='flex items-baseline justify-between'>
                <h3 className='text-[9.5pt] font-semibold text-neutral-900'>
                  {edu.degree}, {edu.major} — {edu.school}
                </h3>
                <span className='text-[8.5pt] text-neutral-500'>
                  {formatDateRange(edu.startDate, edu.endDate)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <aside className='w-[62mm] shrink-0 bg-rose-950 p-[8mm] text-white'>
        {resume.avatar && (
          <div className={`
            mx-auto mb-4 h-[24mm] w-[24mm] overflow-hidden rounded-full ring-2
            ring-white/40
          `}>
            <Image
              src={resume.avatar}
              alt={resume.title}
              width={96}
              height={96}
              className='h-full w-full object-cover'
            />
          </div>
        )}

        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-rose-200
            uppercase
          `}>
            Contact
          </h2>
          <ul className='space-y-1.5 text-[8pt] text-rose-100'>
            {information.map((info) => (
              <li key={info.id}>{info.value}</li>
            ))}
          </ul>
        </div>

        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 flex items-center gap-1.5 text-[8.5pt] font-bold
            tracking-[0.15em] text-rose-200 uppercase
          `}>
            <Sparkles className='size-3' />
            Skills
          </h2>
          <div className='flex flex-wrap gap-1.5'>
            {skills.map((skill) => (
              <span
                key={skill.id}
                className={`
                  rounded-full bg-white/10 px-2.5 py-1 text-[7.5pt] text-white
                `}
              >
                {skill.label}
              </span>
            ))}
          </div>
        </div>

        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-rose-200
            uppercase
          `}>
            Certifications
          </h2>
          <ul className='space-y-1 text-[8pt] text-rose-100'>
            {certifications.map((cert) => (
              <li key={cert.id}>{cert.name}</li>
            ))}
          </ul>
        </div>

        <div className='break-inside-avoid'>
          <h2 className={`
            mb-4 flex items-center gap-1.5 text-[8.5pt] font-bold
            tracking-[0.15em] text-rose-200 uppercase
          `}>
            <Languages className='size-3' />
            Languages
          </h2>
          <div className='flex flex-wrap justify-center gap-3'>
            {languages.map((lang) => (
              <LanguageRing
                key={lang.id}
                name={lang.name}
                level={lang.description}
              />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
