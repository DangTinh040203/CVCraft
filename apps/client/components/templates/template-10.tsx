import {
  Award,
  Briefcase,
  FileText,
  FolderKanban,
  GraduationCap,
  IdCard,
  Languages as LanguagesIcon,
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

const DotPattern = () => (
  <div
    className={`
      pointer-events-none absolute right-0 bottom-0 h-[40mm] w-[50mm] opacity-40
    `}
    style={{
      backgroundImage:
        'radial-gradient(circle, rgba(99,102,241,0.4) 1px, transparent 1.5px)',
      backgroundSize: '10px 10px',
      maskImage:
        'radial-gradient(ellipse at bottom right, black 30%, transparent 70%)',
    }}
  />
);

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
      mb-2 flex items-center gap-2 text-[10.5pt] font-bold text-neutral-900
    `}>
      <span
        className={`
          flex size-6 items-center justify-center rounded-full text-white
        `}
        style={{ backgroundColor: color }}
      >
        <Icon className='size-3.5' />
      </span>
      {children}
    </h2>
  );
}

function TableRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex border-b border-neutral-100 py-1.5 text-[9pt]'>
      <span className='w-[32mm] shrink-0 font-semibold text-neutral-500'>
        {label}
      </span>
      <span className='text-neutral-800'>{value}</span>
    </div>
  );
}

/**
 * Template 10 — "Iconic Badges"
 * Single column, a colored circular icon badge in front of every section
 * title, contact/skills laid out as clean label/value table rows.
 */
export function Template10({ resume }: TemplateProps) {
  const information = sortByOrder(resume.information);
  const educations = sortByOrder(resume.educations);
  const workExperiences = sortByOrder(resume.workExperiences);
  const projects = sortByOrder(resume.projects);
  const skills = sortByOrder(resume.skills);
  const certifications = sortByOrder(resume.certifications);
  const languages = sortByOrder(resume.languages);

  return (
    <div className={`
      relative min-h-[297mm] w-[210mm] overflow-hidden bg-white p-[14mm]
      text-[10pt] text-neutral-800
    `}>
      <DotPattern />

      <header className='relative mb-5'>
        <h1 className='text-[21pt] font-bold text-neutral-900'>
          {resume.title}
        </h1>
        <p className='mt-1 text-[10.5pt] text-neutral-500'>
          {resume.subTitle}
        </p>
      </header>

      <section className='relative mb-5 break-inside-avoid'>
        <Badge icon={IdCard} color='#0891b2'>
          Contact Information
        </Badge>
        <div className='grid grid-cols-2 gap-x-6'>
          {information.map((info) => (
            <TableRow key={info.id} label={info.label} value={info.value} />
          ))}
        </div>
      </section>

      <section className='relative mb-5 break-inside-avoid'>
        <Badge icon={FileText} color='#059669'>
          Overview
        </Badge>
        <p className='text-[9.5pt] leading-relaxed text-neutral-700'>
          {resume.overview}
        </p>
      </section>

      <section className='relative mb-5 break-inside-avoid'>
        <Badge icon={Layers} color='#2563eb'>
          Skills
        </Badge>
        <div className='grid grid-cols-2 gap-x-6'>
          {skills.map((skill) => (
            <TableRow key={skill.id} label={skill.label} value={skill.value} />
          ))}
        </div>
      </section>

      <section className='relative mb-5 break-inside-avoid'>
        <Badge icon={GraduationCap} color='#d97706'>
          Education
        </Badge>
        <div className='space-y-2'>
          {educations.map((edu) => (
            <div key={edu.id} className='flex gap-4 text-[9pt]'>
              <span className='w-[28mm] shrink-0 text-neutral-500'>
                {formatDateRange(edu.startDate, edu.endDate)}
              </span>
              <div>
                <p className='font-semibold text-neutral-900'>
                  {edu.school}
                </p>
                <p className='text-neutral-600'>
                  {edu.degree}, {edu.major}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='relative mb-5'>
        <Badge icon={Briefcase} color='#7c3aed'>
          Work Experience
        </Badge>
        <div className='space-y-4'>
          {workExperiences.map((job) => (
            <div key={job.id} className={`
              flex break-inside-avoid gap-4 text-[9pt]
            `}>
              <span className='w-[28mm] shrink-0 text-neutral-500'>
                {formatDateRange(job.startDate, job.endDate)}
              </span>
              <div>
                <p className='font-semibold text-neutral-900'>
                  {job.position} — {job.company}
                </p>
                <p className='mt-1 whitespace-pre-line text-neutral-700'>
                  {job.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='relative mb-5'>
        <Badge icon={FolderKanban} color='#e11d48'>
          Projects
        </Badge>
        <div className='space-y-2.5'>
          {projects.map((project) => (
            <div key={project.id} className='break-inside-avoid text-[9pt]'>
              <p className='font-semibold text-neutral-900'>
                {project.title}
              </p>
              <p className='text-neutral-700'>{project.details}</p>
            </div>
          ))}
        </div>
      </section>

      <div className='relative grid grid-cols-2 gap-6'>
        <section className='break-inside-avoid'>
          <Badge icon={Award} color='#4f46e5'>
            Certifications
          </Badge>
          <ul className='space-y-1 text-[9pt] text-neutral-700'>
            {certifications.map((cert) => (
              <li key={cert.id}>{cert.name}</li>
            ))}
          </ul>
        </section>

        <section className='break-inside-avoid'>
          <Badge icon={LanguagesIcon} color='#0d9488'>
            Languages
          </Badge>
          <ul className='space-y-1 text-[9pt] text-neutral-700'>
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
