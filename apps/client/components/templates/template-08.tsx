import Image from 'next/image';

import {
  formatDateRange,
  type ResumeData,
  sortByOrder,
} from '@/components/templates/resume.types';

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Template 08 — "Executive"
 * Photo sits inline with the name in the main column (not the sidebar) —
 * a slim graphite sidebar on the right holds only contact details and
 * skills, keeping the main column the visual focus.
 */
export function Template08({ resume }: TemplateProps) {
  const information = sortByOrder(resume.information);
  const educations = sortByOrder(resume.educations);
  const workExperiences = sortByOrder(resume.workExperiences);
  const projects = sortByOrder(resume.projects);
  const skills = sortByOrder(resume.skills);
  const certifications = sortByOrder(resume.certifications);
  const languages = sortByOrder(resume.languages);

  return (
    <div className={`
      flex min-h-[297mm] w-[210mm] bg-white text-[10pt] text-neutral-800
    `}>
      <main className='flex-1 p-[10mm]'>
        <header className='mb-6 flex items-center gap-4'>
          {resume.avatar && (
            <div className={`
              h-[20mm] w-[20mm] shrink-0 overflow-hidden rounded-full
            `}>
              <Image
                src={resume.avatar}
                alt={resume.title}
                width={80}
                height={80}
                className='h-full w-full object-cover'
              />
            </div>
          )}
          <div>
            <h1 className='text-[19pt] font-bold text-neutral-900'>
              {resume.title}
            </h1>
            <p className='text-[10pt] font-medium text-neutral-500'>
              {resume.subTitle}
            </p>
          </div>
        </header>

        <section className='mb-5 break-inside-avoid'>
          <h2 className={`
            mb-1.5 text-[10pt] font-bold text-neutral-900 uppercase
          `}>
            Profile
          </h2>
          <p className='text-[9.5pt] leading-relaxed text-neutral-700'>
            {resume.overview}
          </p>
        </section>

        <section className='mb-5'>
          <h2 className='mb-2 text-[10pt] font-bold text-neutral-900 uppercase'>
            Employment History
          </h2>
          <div className='space-y-4'>
            {workExperiences.map((job) => (
              <div key={job.id} className='break-inside-avoid'>
                <div className='flex items-baseline justify-between'>
                  <h3 className='text-[10pt] font-semibold text-neutral-900'>
                    {job.position}, {job.company}
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

        <section className='break-inside-avoid'>
          <h2 className='mb-2 text-[10pt] font-bold text-neutral-900 uppercase'>
            Projects
          </h2>
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
      </main>

      <aside className={`
        w-[56mm] shrink-0 bg-neutral-800 p-[8mm] text-neutral-100
      `}>
        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-neutral-400
            uppercase
          `}>
            Details
          </h2>
          <ul className='space-y-1.5 text-[8pt] text-neutral-200'>
            {information.map((info) => (
              <li key={info.id}>{info.value}</li>
            ))}
          </ul>
        </div>

        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-neutral-400
            uppercase
          `}>
            Skills
          </h2>
          <ul className='space-y-1 text-[8pt] text-neutral-200'>
            {skills.map((skill) => (
              <li key={skill.id}>{skill.label}</li>
            ))}
          </ul>
        </div>

        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-neutral-400
            uppercase
          `}>
            Education
          </h2>
          <div className='space-y-2 text-[8pt] text-neutral-200'>
            {educations.map((edu) => (
              <div key={edu.id}>
                <p className='font-semibold text-white'>{edu.school}</p>
                <p>
                  {edu.degree}, {edu.major}
                </p>
                <p className='text-neutral-400'>
                  {formatDateRange(edu.startDate, edu.endDate)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-neutral-400
            uppercase
          `}>
            Certifications
          </h2>
          <ul className='space-y-1 text-[8pt] text-neutral-200'>
            {certifications.map((cert) => (
              <li key={cert.id}>{cert.name}</li>
            ))}
          </ul>
        </div>

        <div className='break-inside-avoid'>
          <h2 className={`
            mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-neutral-400
            uppercase
          `}>
            Languages
          </h2>
          <ul className='space-y-1 text-[8pt] text-neutral-200'>
            {languages.map((lang) => (
              <li key={lang.id} className='flex justify-between'>
                <span>{lang.name}</span>
                <span className='text-neutral-400'>{lang.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
