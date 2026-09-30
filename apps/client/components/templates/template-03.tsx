import {
  formatDateRange,
  type ResumeData,
  sortByOrder,
} from '@/components/templates/resume.types';

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Template 03 — "Timeline"
 * Experience and education rendered as a vertical timeline with dot
 * markers and a connecting rail.
 */
export function Template03({ resume }: TemplateProps) {
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
        min-h-[297mm] w-[210mm] bg-white p-[14mm] text-[10pt] text-neutral-800
      `}
    >
      <header className='mb-6'>
        <h1 className='text-[21pt] font-bold text-neutral-900'>
          {resume.title}
        </h1>
        <p className='mt-1 text-[11pt] text-emerald-700'>{resume.subTitle}</p>
        <div className={`
          mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[8.5pt] text-neutral-500
        `}>
          {information.map((info) => (
            <span key={info.id}>{info.value}</span>
          ))}
        </div>
      </header>

      <p className='mb-6 text-[9.5pt] text-neutral-700'>{resume.overview}</p>

      <section className='mb-6'>
        <h2 className={`
          mb-4 text-[10pt] font-bold tracking-wide text-emerald-800 uppercase
        `}>
          Experience
        </h2>
        <div className='relative border-l-2 border-emerald-200 pl-5'>
          {workExperiences.map((job) => (
            <div key={job.id} className='relative mb-5 break-inside-avoid'>
              <span className={`
                absolute top-1 -left-[26px] h-3 w-3 rounded-full border-2
                border-emerald-600 bg-white
              `} />
              <div className='flex items-baseline justify-between'>
                <h3 className='text-[10pt] font-semibold text-neutral-900'>
                  {job.position} · {job.company}
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

      <section className='mb-6'>
        <h2 className={`
          mb-4 text-[10pt] font-bold tracking-wide text-emerald-800 uppercase
        `}>
          Education
        </h2>
        <div className='relative border-l-2 border-emerald-200 pl-5'>
          {educations.map((edu) => (
            <div key={edu.id} className='relative mb-3 break-inside-avoid'>
              <span className={`
                absolute top-1 -left-[26px] h-3 w-3 rounded-full border-2
                border-emerald-600 bg-white
              `} />
              <div className='flex items-baseline justify-between'>
                <h3 className='text-[9.5pt] font-semibold text-neutral-900'>
                  {edu.degree}, {edu.major} · {edu.school}
                </h3>
                <span className='text-[8.5pt] text-neutral-500'>
                  {formatDateRange(edu.startDate, edu.endDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='mb-6'>
        <h2 className={`
          mb-3 text-[10pt] font-bold tracking-wide text-emerald-800 uppercase
        `}>
          Projects
        </h2>
        <div className='space-y-2.5'>
          {projects.map((project) => (
            <div key={project.id} className='break-inside-avoid'>
              <h3 className='text-[9.5pt] font-semibold text-neutral-900'>
                {project.title}
              </h3>
              <p className='text-[9pt] text-neutral-700'>{project.details}</p>
            </div>
          ))}
        </div>
      </section>

      <div className='grid grid-cols-3 gap-5'>
        <section className='break-inside-avoid'>
          <h2 className={`
            mb-2 text-[9.5pt] font-bold tracking-wide text-emerald-800 uppercase
          `}>
            Skills
          </h2>
          <ul className='space-y-1 text-[8.5pt] text-neutral-700'>
            {skills.map((skill) => (
              <li key={skill.id}>{skill.label}</li>
            ))}
          </ul>
        </section>

        <section className='break-inside-avoid'>
          <h2 className={`
            mb-2 text-[9.5pt] font-bold tracking-wide text-emerald-800 uppercase
          `}>
            Certifications
          </h2>
          <ul className='space-y-1 text-[8.5pt] text-neutral-700'>
            {certifications.map((cert) => (
              <li key={cert.id}>{cert.name}</li>
            ))}
          </ul>
        </section>

        <section className='break-inside-avoid'>
          <h2 className={`
            mb-2 text-[9.5pt] font-bold tracking-wide text-emerald-800 uppercase
          `}>
            Languages
          </h2>
          <ul className='space-y-1 text-[8.5pt] text-neutral-700'>
            {languages.map((lang) => (
              <li key={lang.id}>
                {lang.name} — {lang.description}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
