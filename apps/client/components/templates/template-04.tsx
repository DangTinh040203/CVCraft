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
 * Template 04 — "Elegant Dark"
 * Navy + gold sidebar on the RIGHT (mirrors Template 02's left sidebar),
 * serif display name, understated luxury feel.
 */
export function Template04({ resume }: TemplateProps) {
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
      <main className='flex-1 p-[12mm]'>
        <header className='mb-5'>
          <h1 className='font-serif text-[24pt] font-bold text-neutral-900'>
            {resume.title}
          </h1>
          <p className={`
            mt-1 text-[10.5pt] tracking-wide text-amber-700 uppercase
          `}>
            {resume.subTitle}
          </p>
        </header>

        <section className='mb-5 break-inside-avoid'>
          <h2 className={`
            mb-1.5 font-serif text-[10.5pt] font-bold text-neutral-900
          `}>
            Profile
          </h2>
          <p className='text-[9.5pt] leading-relaxed text-neutral-700'>
            {resume.overview}
          </p>
        </section>

        <section className='mb-5'>
          <h2 className={`
            mb-2 font-serif text-[10.5pt] font-bold text-neutral-900
          `}>
            Experience
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
                <p className='text-[9pt] font-medium text-amber-700'>
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

        <section>
          <h2 className={`
            mb-2 font-serif text-[10.5pt] font-bold text-neutral-900
          `}>
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
        w-[62mm] shrink-0 bg-neutral-950 p-[9mm] text-neutral-100
      `}>
        {resume.avatar && (
          <div className={`
            mx-auto mb-4 h-[26mm] w-[26mm] overflow-hidden rounded-full ring-2
            ring-amber-500
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

        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-amber-500
            uppercase
          `}>
            Contact
          </h2>
          <ul className='space-y-1.5 text-[8.5pt] text-neutral-300'>
            {information.map((info) => (
              <li key={info.id}>{info.value}</li>
            ))}
          </ul>
        </div>

        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-amber-500
            uppercase
          `}>
            Education
          </h2>
          <div className='space-y-2 text-[8.5pt] text-neutral-300'>
            {educations.map((edu) => (
              <div key={edu.id}>
                <p className='font-medium text-neutral-100'>{edu.school}</p>
                <p>
                  {edu.degree}, {edu.major}
                </p>
                <p className='text-neutral-500'>
                  {formatDateRange(edu.startDate, edu.endDate)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-amber-500
            uppercase
          `}>
            Skills
          </h2>
          <div className='flex flex-wrap gap-1.5'>
            {skills.map((skill) => (
              <span
                key={skill.id}
                className={`
                  rounded border border-neutral-700 px-1.5 py-0.5 text-[8pt]
                  text-neutral-200
                `}
              >
                {skill.label}
              </span>
            ))}
          </div>
        </div>

        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-amber-500
            uppercase
          `}>
            Certifications
          </h2>
          <ul className='space-y-1 text-[8.5pt] text-neutral-300'>
            {certifications.map((cert) => (
              <li key={cert.id}>{cert.name}</li>
            ))}
          </ul>
        </div>

        <div className='break-inside-avoid'>
          <h2 className={`
            mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-amber-500
            uppercase
          `}>
            Languages
          </h2>
          <ul className='space-y-1 text-[8.5pt] text-neutral-300'>
            {languages.map((lang) => (
              <li key={lang.id} className='flex justify-between'>
                <span>{lang.name}</span>
                <span className='text-neutral-500'>{lang.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
