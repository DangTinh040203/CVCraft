import { Briefcase, FolderKanban, GraduationCap, User } from 'lucide-react';
import Image from 'next/image';

import {
  formatDateRange,
  type ResumeData,
  sortByOrder,
} from '@/components/templates/resume.types';

interface TemplateProps {
  resume: ResumeData;
}

function SidebarLabel({ children }: { children: string }) {
  return (
    <p className={`
      mb-3 flex items-center gap-2 text-[8.5pt] font-bold tracking-[0.2em]
      text-neutral-500 uppercase
    `}>
      <span className='h-px flex-1 bg-neutral-300' />
      {children}
      <span className='h-px flex-1 bg-neutral-300' />
    </p>
  );
}

function MainHeading({
  icon: Icon,
  children,
}: {
  icon: typeof User;
  children: string;
}) {
  return (
    <h2 className={`
      mb-2 flex items-center gap-2 text-[10.5pt] font-bold text-teal-800
      uppercase
    `}>
      <Icon className='size-3.5' />
      {children}
    </h2>
  );
}

/**
 * Template 07 — "Icon Professional"
 * Centered photo atop a left sidebar with "• LABEL •" dividers, icon-led
 * section headers in the main column.
 */
export function Template07({ resume }: TemplateProps) {
  const information = sortByOrder(resume.information);
  const educations = sortByOrder(resume.educations);
  const workExperiences = sortByOrder(resume.workExperiences);
  const projects = sortByOrder(resume.projects);
  const skills = sortByOrder(resume.skills);
  const languages = sortByOrder(resume.languages);

  return (
    <div className={`
      flex min-h-[297mm] w-[210mm] bg-white text-[10pt] text-neutral-800
    `}>
      <aside className='w-[62mm] shrink-0 bg-neutral-50 p-[8mm] text-center'>
        {resume.avatar && (
          <div className={`
            mx-auto mb-4 h-[26mm] w-[26mm] overflow-hidden rounded-full border-4
            border-white shadow-md
          `}>
            <Image
              src={resume.avatar}
              alt={resume.title}
              width={104}
              height={104}
              className='h-full w-full object-cover'
            />
          </div>
        )}
        <h1 className='text-[13pt] font-bold text-neutral-900'>
          {resume.title}
        </h1>
        <p className='mt-1 text-[9pt] text-teal-700'>{resume.subTitle}</p>

        <div className='mt-6 break-inside-avoid text-left'>
          <SidebarLabel>Details</SidebarLabel>
          <ul className='space-y-1.5 text-[8pt] text-neutral-600'>
            {information.map((info) => (
              <li key={info.id}>{info.value}</li>
            ))}
          </ul>
        </div>

        <div className='mt-6 break-inside-avoid text-left'>
          <SidebarLabel>Skills</SidebarLabel>
          <div className='space-y-2'>
            {skills.map((skill) => (
              <div key={skill.id}>
                <p className='mb-1 text-[8pt] text-neutral-700'>
                  {skill.label}
                </p>
                <div className='h-1 rounded-full bg-neutral-200'>
                  <div
                    className='h-1 rounded-full bg-teal-600'
                    style={{
                      width:
                        skill.value === 'Expert'
                          ? '95%'
                          : skill.value === 'Advanced'
                            ? '78%'
                            : '58%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-6 break-inside-avoid text-left'>
          <SidebarLabel>Languages</SidebarLabel>
          <ul className='space-y-1 text-[8pt] text-neutral-600'>
            {languages.map((lang) => (
              <li key={lang.id}>
                {lang.name} — {lang.description}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className='flex-1 p-[9mm]'>
        <section className='mb-5 break-inside-avoid'>
          <MainHeading icon={User}>Profile</MainHeading>
          <p className='text-[9.5pt] leading-relaxed text-neutral-700'>
            {resume.overview}
          </p>
        </section>

        <section className='mb-5'>
          <MainHeading icon={Briefcase}>Work Experience</MainHeading>
          <div className='space-y-4'>
            {workExperiences.map((job) => (
              <div key={job.id} className='break-inside-avoid'>
                <div className='flex items-baseline justify-between'>
                  <h3 className='text-[10pt] font-semibold text-neutral-900'>
                    {job.position} — {job.company}
                  </h3>
                  <span className='text-[8.5pt] text-neutral-500'>
                    {formatDateRange(job.startDate, job.endDate)}
                  </span>
                </div>
                <p className={`
                  mt-1 text-[9pt] whitespace-pre-line text-neutral-700
                `}>
                  {job.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className='mb-5'>
          <MainHeading icon={FolderKanban}>Projects</MainHeading>
          <div className='space-y-2.5'>
            {projects.map((project) => (
              <div key={project.id} className='break-inside-avoid'>
                <h3 className='text-[9.5pt] font-semibold text-neutral-900'>
                  {project.title}
                </h3>
                <p className='text-[9pt] text-neutral-700'>
                  {project.details}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className='break-inside-avoid'>
          <MainHeading icon={GraduationCap}>Education</MainHeading>
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
    </div>
  );
}
