import {
  formatDateRange,
  type ResumeData,
  sortByOrder,
} from '@/components/templates/resume.types';

interface TemplateProps {
  resume: ResumeData;
}

const proficiencyBlocks = (value: string) => {
  const filled =
    value === 'Expert' || value === 'Native'
      ? 5
      : value === 'Advanced' || value === 'Fluent'
        ? 4
        : value === 'Intermediate'
          ? 3
          : 2;
  return Array.from({ length: 5 }, (_, i) => i < filled);
};

/**
 * Template 06 — "Bold Statement"
 * Oversized two-line name, left sidebar with segmented skill-level bars —
 * a stark black/white style built to grab attention fast.
 */
export function Template06({ resume }: TemplateProps) {
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
      <aside className='w-[62mm] shrink-0 bg-neutral-50 p-[9mm]'>
        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 text-[9pt] font-bold tracking-[0.15em] text-neutral-900
            uppercase
          `}>
            Info
          </h2>
          <ul className='space-y-2 text-[8.5pt] text-neutral-600'>
            {information.map((info) => (
              <li key={info.id}>
                <p className='font-bold text-neutral-900'>{info.label}</p>
                <p>{info.value}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className='mb-6 break-inside-avoid'>
          <h2 className={`
            mb-2 text-[9pt] font-bold tracking-[0.15em] text-neutral-900
            uppercase
          `}>
            Skills
          </h2>
          <div className='space-y-2'>
            {skills.map((skill) => (
              <div key={skill.id}>
                <p className='mb-1 text-[8.5pt] text-neutral-700'>
                  {skill.label}
                </p>
                <div className='flex gap-1'>
                  {proficiencyBlocks(skill.value).map((filled, i) => (
                    <span
                      key={i}
                      className={`
                        h-1.5 flex-1 rounded-sm
                        ${filled ? `bg-neutral-900` : `bg-neutral-200`}
                      `}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='break-inside-avoid'>
          <h2 className={`
            mb-2 text-[9pt] font-bold tracking-[0.15em] text-neutral-900
            uppercase
          `}>
            Languages
          </h2>
          <div className='space-y-2'>
            {languages.map((lang) => (
              <div key={lang.id}>
                <p className='mb-1 text-[8.5pt] text-neutral-700'>
                  {lang.name}
                </p>
                <div className='flex gap-1'>
                  {proficiencyBlocks(lang.description).map((filled, i) => (
                    <span
                      key={i}
                      className={`
                        h-1.5 flex-1 rounded-sm
                        ${filled ? `bg-neutral-900` : `bg-neutral-200`}
                      `}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className='flex-1 p-[10mm]'>
        <header className='mb-6'>
          <h1 className={`
            text-[26pt] leading-[1.1] font-extrabold tracking-tight
            text-neutral-900
          `}>
            {resume.title}
          </h1>
          <p className='mt-2 text-[10pt] text-neutral-500'>
            {resume.subTitle}
          </p>
        </header>

        <div className='mb-5 border-t-2 border-neutral-900 pt-4'>
          <h2 className={`
            mb-2 text-[9.5pt] font-bold tracking-[0.1em] text-neutral-900
            uppercase
          `}>
            Profile
          </h2>
          <p className='text-[9.5pt] leading-relaxed text-neutral-700'>
            {resume.overview}
          </p>
        </div>

        <section className='mb-5'>
          <h2 className={`
            mb-2 text-[9.5pt] font-bold tracking-[0.1em] text-neutral-900
            uppercase
          `}>
            Employment History
          </h2>
          <div className='space-y-4'>
            {workExperiences.map((job) => (
              <div key={job.id} className='break-inside-avoid'>
                <div className='flex items-baseline justify-between'>
                  <h3 className='text-[10pt] font-bold text-neutral-900'>
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

        <section className='mb-5'>
          <h2 className={`
            mb-2 text-[9.5pt] font-bold tracking-[0.1em] text-neutral-900
            uppercase
          `}>
            Projects
          </h2>
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

        <div className='grid grid-cols-2 gap-6'>
          <section className='break-inside-avoid'>
            <h2 className={`
              mb-2 text-[9.5pt] font-bold tracking-[0.1em] text-neutral-900
              uppercase
            `}>
              Education
            </h2>
            <div className='space-y-2'>
              {educations.map((edu) => (
                <div key={edu.id}>
                  <h3 className='text-[9pt] font-bold text-neutral-900'>
                    {edu.school}
                  </h3>
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
            <h2 className={`
              mb-2 text-[9.5pt] font-bold tracking-[0.1em] text-neutral-900
              uppercase
            `}>
              Certifications
            </h2>
            <ul className='space-y-1 text-[8.5pt] text-neutral-700'>
              {certifications.map((cert) => (
                <li key={cert.id}>{cert.name}</li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
