import {
  formatDateRange,
  type ResumeData,
  sortByOrder,
} from '@/components/templates/resume.types';

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Template 01 — "Minimalist"
 * Single column, generous whitespace, no color — built for ATS parsing
 * and recruiters who want to scan fast.
 */
export function Template01({ resume }: TemplateProps) {
  const information = sortByOrder(resume.information);
  const educations = sortByOrder(resume.educations);
  const workExperiences = sortByOrder(resume.workExperiences);
  const projects = sortByOrder(resume.projects);
  const skills = sortByOrder(resume.skills);
  const certifications = sortByOrder(resume.certifications);
  const languages = sortByOrder(resume.languages);

  return (
    <div
      className={`
        min-h-[297mm] w-[210mm] bg-white p-[16mm] text-[10.5pt] leading-relaxed
        text-neutral-800
      `}
    >
      <header className='mb-6 border-b border-neutral-300 pb-4 text-center'>
        <h1
          className={`text-[22pt] font-semibold tracking-tight text-neutral-900`}
        >
          {resume.title}
        </h1>
        <p className='mt-1 text-[11pt] text-neutral-600'>{resume.subTitle}</p>
        <div
          className={`
            mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9pt]
            text-neutral-500
          `}
        >
          {information.map((info) => (
            <span key={info.id}>{info.value}</span>
          ))}
        </div>
      </header>

      <section className='mb-5'>
        <p className='text-[10pt] text-neutral-700'>{resume.overview}</p>
      </section>

      <section className='mb-5'>
        <h2
          className={`
            mb-2 text-[9.5pt] font-bold tracking-[0.15em] text-neutral-900
            uppercase
          `}
        >
          Experience
        </h2>
        <div className='space-y-4'>
          {workExperiences.map((job) => (
            <div key={job.id} className='break-inside-avoid'>
              <div className='flex items-baseline justify-between'>
                <h3 className='text-[10.5pt] font-semibold text-neutral-900'>
                  {job.position} · {job.company}
                </h3>
                <span className='text-[9pt] text-neutral-500'>
                  {formatDateRange(job.startDate, job.endDate)}
                </span>
              </div>
              <p
                className={`
                  mt-1 text-[9.5pt] whitespace-pre-line text-neutral-700
                `}
              >
                {job.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className='mb-5'>
        <h2
          className={`
            mb-2 text-[9.5pt] font-bold tracking-[0.15em] text-neutral-900
            uppercase
          `}
        >
          Projects
        </h2>
        <div className='space-y-3'>
          {projects.map((project) => (
            <div key={project.id} className='break-inside-avoid'>
              <h3 className='text-[10pt] font-semibold text-neutral-900'>
                {project.title}{' '}
                <span className='font-normal text-neutral-500'>
                  — {project.subTitle}
                </span>
              </h3>
              <p className='text-[9.5pt] text-neutral-700'>{project.details}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='mb-5'>
        <h2
          className={`
            mb-2 text-[9.5pt] font-bold tracking-[0.15em] text-neutral-900
            uppercase
          `}
        >
          Education
        </h2>
        <div className='space-y-2'>
          {educations.map((edu) => (
            <div
              key={edu.id}
              className={`
                flex break-inside-avoid items-baseline justify-between
              `}
            >
              <h3 className='text-[10pt] font-semibold text-neutral-900'>
                {edu.degree}, {edu.major} · {edu.school}
              </h3>
              <span className='text-[9pt] text-neutral-500'>
                {formatDateRange(edu.startDate, edu.endDate)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className='grid grid-cols-2 gap-6'>
        <section className='break-inside-avoid'>
          <h2
            className={`
              mb-2 text-[9.5pt] font-bold tracking-[0.15em] text-neutral-900
              uppercase
            `}
          >
            Skills
          </h2>
          <p className='text-[9.5pt] text-neutral-700'>
            {skills.map((skill) => skill.label).join(' · ')}
          </p>
        </section>

        <section className='break-inside-avoid'>
          <h2
            className={`
              mb-2 text-[9.5pt] font-bold tracking-[0.15em] text-neutral-900
              uppercase
            `}
          >
            Certifications
          </h2>
          <ul className='space-y-0.5 text-[9.5pt] text-neutral-700'>
            {certifications.map((cert) => (
              <li key={cert.id}>
                {cert.name} — {cert.issuer}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className='mt-5 break-inside-avoid'>
        <h2
          className={`
            mb-2 text-[9.5pt] font-bold tracking-[0.15em] text-neutral-900
            uppercase
          `}
        >
          Languages
        </h2>
        <p className='text-[9.5pt] text-neutral-700'>
          {languages
            .map((lang) => `${lang.name} (${lang.description})`)
            .join(' · ')}
        </p>
      </section>
    </div>
  );
}
