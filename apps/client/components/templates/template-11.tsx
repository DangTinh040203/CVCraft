import {
  formatDateRange,
  type ResumeData,
  sortByOrder,
} from '@/components/templates/resume.types';

interface TemplateProps {
  resume: ResumeData;
}

function PlainHeading({ children }: { children: string }) {
  return (
    <h2 className={`
      mb-2 border-b-2 border-neutral-900 pb-1 text-[10.5pt] font-bold
      tracking-wide text-neutral-900 uppercase
    `}>
      {children}
    </h2>
  );
}

function TableRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex border-b border-neutral-200 py-1.5 text-[9pt]'>
      <span className='w-[30mm] shrink-0 font-semibold text-neutral-500'>
        {label}
      </span>
      <span className='text-neutral-800'>{value}</span>
    </div>
  );
}

/**
 * Template 11 — "Framed Centered"
 * A dotted frame around the whole page, a centered header, and plain
 * underlined section headers — a quieter, more formal cousin of
 * Template 10.
 */
export function Template11({ resume }: TemplateProps) {
  const information = sortByOrder(resume.information);
  const educations = sortByOrder(resume.educations);
  const workExperiences = sortByOrder(resume.workExperiences);
  const projects = sortByOrder(resume.projects);
  const skills = sortByOrder(resume.skills);
  const certifications = sortByOrder(resume.certifications);
  const languages = sortByOrder(resume.languages);

  return (
    <div className={`
      min-h-[297mm] w-[210mm] bg-white p-[8mm] text-[10pt] text-neutral-800
    `}>
      <div className='h-full border-2 border-dotted border-neutral-400 p-[10mm]'>
        <header className='mb-6 text-center'>
          <h1 className='text-[21pt] font-bold text-neutral-900'>
            {resume.title}
          </h1>
          <p className='mt-1 text-[10.5pt] text-neutral-500'>
            {resume.subTitle}
          </p>
        </header>

        <section className='mb-5 break-inside-avoid'>
          <PlainHeading>Contact Information</PlainHeading>
          <div className='grid grid-cols-2 gap-x-8'>
            {information.map((info) => (
              <TableRow key={info.id} label={info.label} value={info.value} />
            ))}
          </div>
        </section>

        <section className='mb-5 break-inside-avoid'>
          <PlainHeading>Overview</PlainHeading>
          <p className='text-[9.5pt] leading-relaxed text-neutral-700'>
            {resume.overview}
          </p>
        </section>

        <section className='mb-5'>
          <PlainHeading>Work Experience</PlainHeading>
          <div className='space-y-4'>
            {workExperiences.map((job) => (
              <div key={job.id} className='flex break-inside-avoid gap-4'>
                <span className={`
                  w-[26mm] shrink-0 text-[8.5pt] text-neutral-500
                `}>
                  {formatDateRange(job.startDate, job.endDate)}
                </span>
                <div>
                  <p className='text-[9.5pt] font-semibold text-neutral-900'>
                    {job.position} — {job.company}
                  </p>
                  <ul className='mt-1 space-y-0.5 text-[9pt] text-neutral-700'>
                    {job.description
                      .split('\n')
                      .filter(Boolean)
                      .map((line) => (
                        <li key={line} className='flex gap-1.5'>
                          <span>•</span>
                          <span>{line.replace(/^•\s*/, '')}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='mb-5 break-inside-avoid'>
          <PlainHeading>Education</PlainHeading>
          <div className='space-y-2'>
            {educations.map((edu) => (
              <div key={edu.id} className='flex gap-4'>
                <span className={`
                  w-[26mm] shrink-0 text-[8.5pt] text-neutral-500
                `}>
                  {formatDateRange(edu.startDate, edu.endDate)}
                </span>
                <p className='text-[9.5pt] text-neutral-800'>
                  <span className='font-semibold'>{edu.school}</span> —{' '}
                  {edu.degree}, {edu.major}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className='mb-5 break-inside-avoid'>
          <PlainHeading>Selected Projects</PlainHeading>
          <div className='space-y-2'>
            {projects.map((project) => (
              <div key={project.id}>
                <p className='text-[9.5pt] font-semibold text-neutral-900'>
                  {project.title}
                </p>
                <p className='text-[9pt] text-neutral-700'>
                  {project.details}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className='grid break-inside-avoid grid-cols-3 gap-6'>
          <section>
            <PlainHeading>Skills</PlainHeading>
            <p className='text-[8.5pt] text-neutral-700'>
              {skills.map((skill) => skill.label).join(', ')}
            </p>
          </section>
          <section>
            <PlainHeading>Certificates</PlainHeading>
            <p className='text-[8.5pt] text-neutral-700'>
              {certifications.map((cert) => cert.name).join(', ')}
            </p>
          </section>
          <section>
            <PlainHeading>Languages</PlainHeading>
            <p className='text-[8.5pt] text-neutral-700'>
              {languages.map((lang) => lang.name).join(', ')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
