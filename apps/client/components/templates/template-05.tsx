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
 * Template 05 — "Corporate Blue"
 * Centered header with a photo, full-width colored section-header bars,
 * a thin frame around the whole page — classic corporate/finance style.
 */
export function Template05({ resume }: TemplateProps) {
  const information = sortByOrder(resume.information);
  const educations = sortByOrder(resume.educations);
  const workExperiences = sortByOrder(resume.workExperiences);
  const projects = sortByOrder(resume.projects);
  const skills = sortByOrder(resume.skills);
  const certifications = sortByOrder(resume.certifications);
  const languages = sortByOrder(resume.languages);

  const sectionBar = 'mb-2 bg-blue-50 px-3 py-1.5 text-[9pt] font-bold tracking-[0.1em] text-blue-900 uppercase';

  return (
    <div className={`
      min-h-[297mm] w-[210mm] bg-white p-[10mm] text-[10pt] text-neutral-800
    `}>
      <div className='h-full border border-neutral-300 p-[10mm]'>
        <header className='mb-6 flex items-start justify-between gap-6'>
          <div>
            <h1 className='text-[22pt] font-bold tracking-tight text-blue-900'>
              {resume.title}
            </h1>
            <p className={`
              mt-1 text-[11pt] font-semibold text-neutral-700 uppercase
            `}>
              {resume.subTitle}
            </p>
            <p className='mt-2 text-[8.5pt] text-neutral-500'>
              {information.map((info) => info.value).join(' | ')}
            </p>
          </div>
          {resume.avatar && (
            <div className={`
              h-[26mm] w-[26mm] shrink-0 overflow-hidden rounded-sm border
              border-neutral-300
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
        </header>

        <section className='mb-5 break-inside-avoid'>
          <h2 className={sectionBar}>Summary</h2>
          <p className='text-[9.5pt] leading-relaxed text-neutral-700'>
            {resume.overview}
          </p>
        </section>

        <section className='mb-5'>
          <h2 className={sectionBar}>Professional Experience</h2>
          <div className='space-y-4'>
            {workExperiences.map((job) => (
              <div key={job.id} className='break-inside-avoid'>
                <div className='flex items-baseline justify-between'>
                  <h3 className='text-[10pt] font-bold text-neutral-900'>
                    {job.company}
                  </h3>
                  <span className='text-[8.5pt] text-neutral-500'>
                    {formatDateRange(job.startDate, job.endDate)}
                  </span>
                </div>
                <p className='text-[9pt] font-semibold text-blue-800'>
                  {job.position}
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

        <section className='mb-5'>
          <h2 className={sectionBar}>Education</h2>
          <div className='space-y-2'>
            {educations.map((edu) => (
              <div
                key={edu.id}
                className={`
                  flex break-inside-avoid items-baseline justify-between
                `}
              >
                <h3 className='text-[9.5pt] font-bold text-neutral-900'>
                  {edu.degree} in {edu.major}
                </h3>
                <span className='text-[8.5pt] text-neutral-500'>
                  {formatDateRange(edu.startDate, edu.endDate)}
                </span>
              </div>
            ))}
            {educations.map((edu) => (
              <p
                key={`${edu.id}-school`}
                className='-mt-1.5 text-[8.5pt] text-neutral-600'
              >
                {edu.school}
              </p>
            ))}
          </div>
        </section>

        <section className='mb-5'>
          <h2 className={sectionBar}>Selected Projects</h2>
          <div className='space-y-2.5'>
            {projects.map((project) => (
              <div key={project.id} className='break-inside-avoid'>
                <h3 className='text-[9.5pt] font-bold text-neutral-900'>
                  {project.title}
                </h3>
                <p className='text-[9pt] text-neutral-700'>
                  {project.details}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className='mb-5 break-inside-avoid'>
          <h2 className={sectionBar}>Technical Skills</h2>
          <div className={`
            grid grid-cols-3 gap-x-4 gap-y-1 text-[9pt] text-neutral-700
          `}>
            {skills.map((skill) => (
              <span key={skill.id}>{skill.label}</span>
            ))}
          </div>
        </section>

        <section className='break-inside-avoid'>
          <h2 className={sectionBar}>Additional Information</h2>
          <ul className='space-y-1 text-[9pt] text-neutral-700'>
            <li>
              <span className='font-bold'>Languages: </span>
              {languages.map((lang) => lang.name).join(', ')}
            </li>
            <li>
              <span className='font-bold'>Certificates: </span>
              {certifications.map((cert) => cert.name).join(', ')}
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
