import {
  Award,
  Briefcase,
  FileText,
  GraduationCap,
  IdCard,
  Layers,
} from 'lucide-react';

import {
  formatDateRange,
  type ResumeData,
  sortByOrder,
} from '@/components/templates/resume.types';

interface TemplateProps {
  resume: ResumeData;
}

function Badge({
  icon: Icon,
  color,
  children,
}: {
  icon: typeof FileText;
  color: string;
  children: string;
}) {
  return (
    <h2 className={`
      mb-2 flex items-center gap-2 text-[9.5pt] font-bold text-neutral-900
    `}>
      <span
        className={`
          flex size-5 items-center justify-center rounded-full text-white
        `}
        style={{ backgroundColor: color }}
      >
        <Icon className='size-3' />
      </span>
      {children}
    </h2>
  );
}

/**
 * Template 12 — "Two-Column Icons"
 * Name in a soft colored header pill, then a two-column body — contact +
 * experience on the left, overview/education/skills/projects on the
 * right — each section led by a small colored icon badge.
 */
export function Template12({ resume }: TemplateProps) {
  const information = sortByOrder(resume.information);
  const educations = sortByOrder(resume.educations);
  const workExperiences = sortByOrder(resume.workExperiences);
  const projects = sortByOrder(resume.projects);
  const skills = sortByOrder(resume.skills);
  const certifications = sortByOrder(resume.certifications);
  const languages = sortByOrder(resume.languages);

  return (
    <div className={`
      min-h-[297mm] w-[210mm] bg-white p-[12mm] text-[10pt] text-neutral-800
    `}>
      <header className='mb-6'>
        <div className='inline-block rounded-md bg-blue-50 px-4 py-2'>
          <h1 className='text-[18pt] font-bold text-blue-900'>
            {resume.title}
          </h1>
        </div>
        <p className='mt-2 text-[10pt] text-neutral-500'>
          {resume.subTitle}
        </p>
      </header>

      <div className='grid grid-cols-[0.85fr_1.15fr] gap-8'>
        <div className='space-y-5'>
          <section className='break-inside-avoid'>
            <Badge icon={IdCard} color='#0891b2'>
              Contact Information
            </Badge>
            <ul className='space-y-1 text-[8.5pt] text-neutral-700'>
              {information.map((info) => (
                <li key={info.id}>
                  <span className='font-semibold text-neutral-500'>
                    {info.label}:
                  </span>{' '}
                  {info.value}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <Badge icon={Briefcase} color='#7c3aed'>
              Work Experience
            </Badge>
            <div className='space-y-3.5'>
              {workExperiences.map((job) => (
                <div key={job.id} className='break-inside-avoid'>
                  <p className='text-[8.5pt] text-neutral-500'>
                    {formatDateRange(job.startDate, job.endDate)}
                  </p>
                  <p className='text-[9pt] font-semibold text-neutral-900'>
                    {job.position}
                  </p>
                  <p className='text-[8.5pt] text-neutral-600'>
                    {job.company}
                  </p>
                  <p className={`
                    mt-1 text-[8.5pt] whitespace-pre-line text-neutral-700
                  `}>
                    {job.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className='break-inside-avoid'>
            <Badge icon={Award} color='#4f46e5'>
              Certifications
            </Badge>
            <ul className='space-y-1 text-[8.5pt] text-neutral-700'>
              {certifications.map((cert) => (
                <li key={cert.id}>
                  {cert.name} — {cert.issuer}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className='space-y-5'>
          <section className='break-inside-avoid'>
            <Badge icon={FileText} color='#059669'>
              Overview
            </Badge>
            <p className='text-[9pt] leading-relaxed text-neutral-700'>
              {resume.overview}
            </p>
          </section>

          <section className='break-inside-avoid'>
            <Badge icon={GraduationCap} color='#d97706'>
              Education
            </Badge>
            <div className='space-y-2'>
              {educations.map((edu) => (
                <div key={edu.id}>
                  <p className='text-[9pt] font-semibold text-neutral-900'>
                    {edu.school}
                  </p>
                  <p className='text-[8.5pt] text-neutral-600'>
                    {edu.degree}, {edu.major}
                  </p>
                  <p className='text-[8pt] text-neutral-500'>
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className='break-inside-avoid'>
            <Badge icon={Layers} color='#2563eb'>
              Skills
            </Badge>
            <div className='flex flex-wrap gap-1.5'>
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className={`
                    rounded-full bg-neutral-100 px-2.5 py-1 text-[8pt]
                    text-neutral-700
                  `}
                >
                  {skill.label}
                </span>
              ))}
            </div>
          </section>

          <section className='break-inside-avoid'>
            <Badge icon={IdCard} color='#0d9488'>
              Languages
            </Badge>
            <ul className='space-y-1 text-[8.5pt] text-neutral-700'>
              {languages.map((lang) => (
                <li key={lang.id} className='flex justify-between'>
                  <span>{lang.name}</span>
                  <span className='text-neutral-500'>
                    {lang.description}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className='break-inside-avoid'>
            <Badge icon={FileText} color='#e11d48'>
              Projects
            </Badge>
            <div className='space-y-2'>
              {projects.map((project) => (
                <div key={project.id}>
                  <p className='text-[8.5pt] font-semibold text-neutral-900'>
                    {project.title}
                  </p>
                  <p className='text-[8pt] text-neutral-700'>
                    {project.details}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
