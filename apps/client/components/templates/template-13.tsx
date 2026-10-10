import {
  Award,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Languages as LanguagesIcon,
  Layers,
  ScanFace,
  User as UserIcon,
} from 'lucide-react';
import Image from 'next/image';

import {
  type ResumeData,
  sortByOrder,
} from '@/components/templates/resume.types';

interface TemplateProps {
  resume: ResumeData;
}

const ACCENT = '#3f8a68';

// Fixed node/edge coordinates so the decoration renders identically on the
// server, the client, and in the exported PDF.
const NETWORK_NODES: [number, number, number][] = [
  [20, 30, 5], [70, 15, 3], [110, 50, 7], [60, 80, 4], [150, 20, 4],
  [180, 70, 5], [130, 110, 3], [90, 130, 6], [200, 120, 4], [40, 150, 3],
  [160, 160, 7], [210, 190, 3], [110, 190, 4], [60, 210, 5], [190, 230, 4],
];
const NETWORK_EDGES: [number, number][] = [
  [0, 1], [0, 3], [1, 2], [1, 4], [2, 3], [2, 5], [2, 6], [4, 5], [5, 8],
  [6, 7], [6, 8], [3, 7], [7, 9], [7, 10], [8, 10], [10, 11], [10, 12],
  [12, 13], [9, 13], [11, 14], [10, 14], [12, 14],
];

function NetworkPattern({ className }: { className: string }) {
  return (
    <svg
      viewBox='0 0 230 250'
      className={`
        pointer-events-none absolute text-neutral-200
        ${className}
      `}
      aria-hidden='true'
    >
      {NETWORK_EDGES.map(([a, b]) => {
        const [x1, y1] = NETWORK_NODES[a]!;
        const [x2, y2] = NETWORK_NODES[b]!;
        return (
          <line
            key={`${a}-${b}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke='currentColor'
            strokeWidth={1}
          />
        );
      })}
      {NETWORK_NODES.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill='currentColor' />
      ))}
    </svg>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof Briefcase;
  children: string;
}) {
  return (
    <h2
      className={`
        mb-3 flex items-center gap-2 border-b border-neutral-300 pb-1
        text-[11pt] font-bold
      `}
      style={{ color: ACCENT }}
    >
      <span
        className={`
          flex size-5 items-center justify-center rounded-sm text-white
        `}
        style={{ backgroundColor: ACCENT }}
      >
        <Icon className='size-3' />
      </span>
      {children}
    </h2>
  );
}

function formatMonth(iso: string) {
  const date = new Date(iso);
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function formatRange(startDate: string, endDate: string | null) {
  return `${formatMonth(startDate)} – ${endDate ? formatMonth(endDate) : 'Present'}`;
}

function toBullets(text: string) {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*[•\-*]\s*/, '').trim())
    .filter(Boolean);
}

/**
 * Template 13 — "Green Network"
 * Green accent name and section headers, label/value contact grid next to a
 * square photo, date column on the left of each entry, faint network-graph
 * decoration in the corners.
 */
export function Template13({ resume }: TemplateProps) {
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
        relative min-h-[297mm] w-[210mm] overflow-hidden bg-white p-[14mm]
        text-[9.5pt] leading-relaxed text-neutral-800
      `}
    >
      <NetworkPattern className='top-0 right-[40mm] h-[45mm] w-[45mm]' />
      <NetworkPattern className='right-0 bottom-0 h-[70mm] w-[65mm]' />

      <div className='relative'>
        <header className='mb-5 flex items-start justify-between gap-6'>
          <div className='flex-1'>
            <h1
              className='text-[24pt] leading-tight font-bold'
              style={{ color: ACCENT }}
            >
              {resume.title}
            </h1>
            <p className='mb-4 text-[10.5pt] text-neutral-700'>
              {resume.subTitle}
            </p>
            <dl className='grid grid-cols-2 gap-x-6 gap-y-1.5 text-[8.5pt]'>
              {information.map((info) => (
                <div key={info.id} className='flex gap-3'>
                  <dt className='w-[16mm] shrink-0 font-bold text-neutral-900'>
                    {info.label}
                  </dt>
                  <dd className='break-all text-neutral-700'>{info.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div
            className={`
              flex h-[30mm] w-[26mm] shrink-0 items-center justify-center
              overflow-hidden bg-neutral-200
            `}
          >
            {resume.avatar ? (
              <Image
                src={resume.avatar}
                alt={resume.title}
                width={98}
                height={113}
                className='h-full w-full object-cover'
              />
            ) : (
              <UserIcon className='size-16 text-neutral-400' />
            )}
          </div>
        </header>

        <section className='mb-5'>
          <SectionTitle icon={ScanFace}>Overview</SectionTitle>
          <p className='whitespace-pre-line text-neutral-700'>
            {resume.overview}
          </p>
        </section>

        <section className='mb-5'>
          <SectionTitle icon={Briefcase}>Work experience</SectionTitle>
          <div className='space-y-3'>
            {workExperiences.map((job) => (
              <div key={job.id} className='flex break-inside-avoid gap-4'>
                <span className='w-[35mm] shrink-0 font-bold text-neutral-900'>
                  {formatRange(job.startDate, job.endDate)}
                </span>
                <div className='flex-1'>
                  <h3 className='font-bold text-neutral-900 uppercase'>
                    {job.company}
                  </h3>
                  <p className='text-neutral-600 italic'>{job.position}</p>
                  <ul className='mt-0.5 list-disc pl-5 text-neutral-700'>
                    {toBullets(job.description).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='mb-5'>
          <SectionTitle icon={FolderKanban}>Projects</SectionTitle>
          <div className='space-y-3'>
            {projects.map((project) => (
              <div key={project.id} className='flex break-inside-avoid gap-4'>
                <span className='w-[35mm] shrink-0 font-bold text-neutral-900'>
                  {project.domain}
                </span>
                <div className='flex-1'>
                  <h3 className='font-bold text-neutral-900'>
                    {project.title}
                  </h3>
                  <p className='text-neutral-600 italic'>{project.position}</p>
                  <p className='text-neutral-700'>{project.details}</p>
                  <p className='text-neutral-700'>
                    <span className='font-bold'>Technologies - </span>
                    {project.technologies}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='mb-5'>
          <SectionTitle icon={GraduationCap}>Education</SectionTitle>
          <div className='space-y-3'>
            {educations.map((edu) => (
              <div key={edu.id} className='flex break-inside-avoid gap-4'>
                <span className='w-[35mm] shrink-0 font-bold text-neutral-900'>
                  {formatRange(edu.startDate, edu.endDate)}
                </span>
                <div className='flex-1 text-neutral-700'>
                  <h3 className='font-bold text-neutral-900'>{edu.school}</h3>
                  <p>
                    <span className='font-bold'>Major - </span>
                    {edu.major}
                  </p>
                  <p>{edu.degree}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className='grid grid-cols-2 gap-6'>
          <section className='break-inside-avoid'>
            <SectionTitle icon={Layers}>Skills</SectionTitle>
            <ul className='space-y-0.5 text-neutral-700'>
              {skills.map((skill) => (
                <li key={skill.id}>
                  - {skill.label}{' '}
                  <span className='text-neutral-500'>({skill.value})</span>
                </li>
              ))}
            </ul>
          </section>

          <div className='space-y-5'>
            <section className='break-inside-avoid'>
              <SectionTitle icon={Award}>Certifications</SectionTitle>
              <ul className='space-y-0.5 text-neutral-700'>
                {certifications.map((cert) => (
                  <li key={cert.id}>
                    - <span className='font-bold'>{cert.name}</span> —{' '}
                    {cert.issuer}
                  </li>
                ))}
              </ul>
            </section>

            <section className='break-inside-avoid'>
              <SectionTitle icon={LanguagesIcon}>Languages</SectionTitle>
              <ul className='space-y-0.5 text-neutral-700'>
                {languages.map((lang) => (
                  <li key={lang.id}>
                    - {lang.name}{' '}
                    <span className='text-neutral-500'>
                      ({lang.description})
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
