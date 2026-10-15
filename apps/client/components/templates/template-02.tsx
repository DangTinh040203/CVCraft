import Image from 'next/image';

import { ProjectExtras } from '@/components/templates/project-extras';
import {
  formatDateRange,
  isSkillLevel,
  type ResumeData,
  skillDetail,
  sortByOrder,
} from '@/components/templates/resume.types';
import { RichText } from '@/components/templates/rich-text';

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Template 02 — "Sidebar Modern"
 * Dark left sidebar (photo, contact, skills, languages) + light main
 * column (summary, experience, education, projects, certifications).
 */
export function Template02({ resume }: TemplateProps) {
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
        flex min-h-[297mm] w-[210mm] bg-white text-[10pt] text-neutral-800
      `}
    >
      <aside
        className={`w-[68mm] shrink-0 bg-slate-900 p-[10mm] text-slate-100`}
      >
        {resume.avatar && (
          <div
            className={`
              mx-auto mb-4 h-[28mm] w-[28mm] overflow-hidden rounded-full ring-2
              ring-slate-600
            `}
          >
            <Image
              src={resume.avatar}
              alt={resume.title}
              width={112}
              height={112}
              className='h-full w-full object-cover'
            />
          </div>
        )}

        <h1 className='text-center text-[13pt] font-semibold text-white'>
          {resume.title}
        </h1>
        <p className='mt-1 text-center text-[9pt] text-slate-400'>
          {resume.subTitle}
        </p>

        {resume.information.length > 0 && (
          <div className='mt-6 break-inside-avoid'>
            <h2
              className={`
                mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-slate-400
                uppercase
              `}
            >
              Contact
            </h2>
            <ul className='space-y-1.5 text-[8.5pt] text-slate-200'>
              {information.map((info) => (
                <li key={info.id}>{info.value}</li>
              ))}
            </ul>
          </div>
        )}

        {resume.skills.length > 0 && (
          <div className='mt-6 break-inside-avoid'>
            <h2
              className={`
                mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-slate-400
                uppercase
              `}
            >
              Skills
            </h2>
            <div className='space-y-2'>
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div
                    className={`
                      flex justify-between text-[8.5pt] text-slate-200
                    `}
                  >
                    <span>{skill.label}</span>
                  </div>
                  {/* A level draws the bar; a list of items is written out */}
                  {isSkillLevel(skill.value) ? (
                    <div className='mt-1 h-1 rounded-full bg-slate-700'>
                      <div
                        className='h-1 rounded-full bg-sky-400'
                        style={{
                          width:
                            skill.value === 'Expert'
                              ? '95%'
                              : skill.value === 'Advanced'
                                ? '80%'
                                : '60%',
                        }}
                      />
                    </div>
                  ) : (
                    <p className='mt-0.5 text-[8pt] text-slate-400'>
                      {skillDetail(skill)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.languages.length > 0 && (
          <div className='mt-6 break-inside-avoid'>
            <h2
              className={`
                mb-2 text-[8.5pt] font-bold tracking-[0.15em] text-slate-400
                uppercase
              `}
            >
              Languages
            </h2>
            <ul className='space-y-1 text-[8.5pt] text-slate-200'>
              {languages.map((lang) => (
                <li key={lang.id} className='flex justify-between'>
                  <span>{lang.name}</span>
                  <span className='text-slate-400'>{lang.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <main className='flex-1 p-[10mm]'>
        {resume.overview && (
          <section className='mb-5 break-inside-avoid'>
            <h2
              className={`
                mb-1.5 text-[9.5pt] font-bold tracking-[0.1em] text-slate-900
                uppercase
              `}
            >
              Summary
            </h2>
            <RichText
              value={resume.overview}
              className='text-[9.5pt] leading-relaxed text-neutral-700'
            />
          </section>
        )}

        <div className='mb-5 grid grid-cols-2 gap-5'>
          {resume.educations.length > 0 && (
            <section className='break-inside-avoid'>
              <h2
                className={`
                  mb-2 text-[9.5pt] font-bold tracking-[0.1em] text-slate-900
                  uppercase
                `}
              >
                Education
              </h2>
              <div className='space-y-2'>
                {educations.map((edu) => (
                  <div key={edu.id}>
                    <h3 className='text-[9pt] font-semibold text-neutral-900'>
                      {edu.degree}
                    </h3>
                    <p className='text-[8.5pt] text-neutral-600'>
                      {edu.school}
                    </p>
                    <p className='text-[8pt] text-neutral-500'>
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {resume.certifications.length > 0 && (
            <section className='break-inside-avoid'>
              <h2
                className={`
                  mb-2 text-[9.5pt] font-bold tracking-[0.1em] text-slate-900
                  uppercase
                `}
              >
                Certifications
              </h2>
              <ul className='space-y-1 text-[8.5pt] text-neutral-700'>
                {certifications.map((cert) => (
                  <li key={cert.id}>
                    {cert.name}
                    <br />
                    <span className='text-neutral-500'>{cert.issuer}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {resume.workExperiences.length > 0 && (
          <section className='mb-5'>
            <h2
              className={`
                mb-2 text-[9.5pt] font-bold tracking-[0.1em] text-slate-900
                uppercase
              `}
            >
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
                  <p className='text-[9pt] font-medium text-sky-700'>
                    {job.company}
                  </p>
                  <RichText
                    value={job.description}
                    className={`mt-1 text-[9pt] text-neutral-700`}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.projects.length > 0 && (
          <section className='mb-5'>
            <h2
              className={`
                mb-2 text-[9.5pt] font-bold tracking-[0.1em] text-slate-900
                uppercase
              `}
            >
              Projects
            </h2>
            <div className='space-y-3'>
              {projects.map((project) => (
                <div key={project.id} className='break-inside-avoid'>
                  <h3 className='text-[9.5pt] font-semibold text-neutral-900'>
                    {project.title}
                  </h3>
                  <RichText
                    value={project.details}
                    className='text-[9pt] text-neutral-700'
                  />
                  <ProjectExtras
                    project={project}
                    className='text-[9pt] text-neutral-700'
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
