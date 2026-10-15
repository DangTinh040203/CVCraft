import { type ResumeData } from '@/components/templates/resume.types';
import { hasRichText } from '@/components/templates/rich-text';
import {
  defaultFormat,
  type Format,
  type SectionType,
} from '@/stores/features/template.slice';
import {
  type ParseResumeResponse,
  type Resume,
  type UpdateResumeDto,
} from '@/types/resume.type';

/** Editor HTML as-is, or an empty string when it is only empty paragraphs. */
function richText(value: string | null | undefined): string {
  return hasRichText(value) ? value! : '';
}

/**
 * Maps the editor's resume to the shape every template takes. Array position
 * becomes `order`, rich text stays HTML (rendered by `RichText`), and sections hidden in the
 * Customize panel are emptied so every template drops them.
 */
export function toResumeData(
  resume: Resume,
  format: Partial<Format> = defaultFormat,
): ResumeData {
  const hidden = new Set<SectionType>(format.hiddenSections ?? []);
  const shown = <T>(section: SectionType, items: T[]) =>
    hidden.has(section) ? [] : items;
  const ordered = <T>(items: T[]) =>
    items.map((item, order) => ({ ...item, order }));

  return {
    title: resume.title,
    subTitle: resume.subTitle,
    overview: hidden.has('summary') ? '' : richText(resume.overview),
    avatar: resume.avatar ?? undefined,
    information: shown('personal', ordered(resume.information)),
    educations: shown('education', ordered(resume.educations)),
    workExperiences: shown(
      'experience',
      ordered(
        resume.workExperiences.map((job) => ({
          ...job,
          description: richText(job.description),
        })),
      ),
    ),
    projects: shown(
      'projects',
      ordered(
        resume.projects.map((project) => ({
          ...project,
          details: richText(project.details),
          responsibilities: richText(project.responsibilities),
          demo: project.demo ?? undefined,
        })),
      ),
    ),
    skills: shown('skills', ordered(resume.skills)),
    certifications: shown('certifications', ordered(resume.certifications)),
    languages: shown('languages', ordered(resume.languages)),
  };
}

/**
 * Safely converts a date value to ISO string.
 * Handles common CV date formats: "MM/YYYY", "YYYY", "Month YYYY", ISO strings, etc.
 */
function toISOSafe(value: string | null | undefined): string | null {
  if (!value) return null;

  // Already valid ISO or parseable date
  const direct = new Date(value);
  if (!isNaN(direct.getTime())) return direct.toISOString();

  // Handle "MM/YYYY" format (e.g., "01/2024", "12/2025")
  const mmYyyy = value.match(/^(\d{1,2})\/(\d{4})$/);
  if (mmYyyy?.[1] && mmYyyy?.[2]) {
    return new Date(Number(mmYyyy[2]), Number(mmYyyy[1]) - 1, 1).toISOString();
  }

  // Handle "YYYY" only
  const yyyy = value.match(/^(\d{4})$/);
  if (yyyy?.[1]) {
    return new Date(Number(yyyy[1]), 0, 1).toISOString();
  }

  // Fallback: return a default date to prevent Prisma crash
  return new Date().toISOString();
}

/**
 * Deduplicates an array by a key function.
 * Keeps only the first occurrence of each unique key.
 */
function dedup<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Converts Redux resume state to UpdateResumeDto for backend sync.
 * Strips out id and resumeId from relation arrays.
 * Deduplicates all relation arrays to prevent corrupt data from propagating.
 */
export function resumeToUpdateDto(
  resume: Resume,
  options: { templateKey?: string | null; format?: Format | null } = {},
): UpdateResumeDto {
  return {
    title: resume.title,
    subTitle: resume.subTitle,
    overview: resume.overview,
    avatar: resume.avatar,
    templateKey: options.templateKey ?? resume.templateKey,
    format: options.format ?? resume.format ?? null,
    // Filter out empty information items + deduplicate by label+value
    information: dedup(
      resume.information.filter(
        (item) => item.label.trim() && item.value.trim(),
      ),
      (item) => `${item.label}::${item.value}`,
    ).map(({ label, value }) => ({
      label,
      value,
    })),
    educations: dedup(
      resume.educations.filter((edu) => edu.school.trim() || edu.degree.trim()),
      (edu) => `${edu.school}::${edu.degree}::${edu.major}::${edu.startDate}`,
    ).map(({ school, degree, major, startDate, endDate }) => ({
      school,
      degree,
      major,
      startDate: toISOSafe(startDate) ?? startDate,
      endDate: toISOSafe(endDate),
    })),
    skills: dedup(
      resume.skills.filter((skill) => skill.label.trim() || skill.value.trim()),
      (skill) => `${skill.label}::${skill.value}`,
    ).map(({ label, value }) => ({
      label,
      value,
    })),
    workExperiences: dedup(
      resume.workExperiences.filter(
        (exp) => exp.company.trim() || exp.position.trim(),
      ),
      (exp) => `${exp.company}::${exp.position}::${exp.startDate}`,
    ).map(({ company, position, description, startDate, endDate }) => ({
      company,
      position,
      description,
      startDate: toISOSafe(startDate) ?? startDate,
      endDate: toISOSafe(endDate),
    })),
    projects: dedup(
      resume.projects.filter(
        (proj) => proj.title.trim() || proj.details.trim(),
      ),
      (proj) => `${proj.title}::${proj.subTitle}::${proj.domain}`,
    ).map(
      ({
        title,
        subTitle,
        details,
        technologies,
        position,
        responsibilities,
        domain,
        demo,
      }) => ({
        title,
        subTitle,
        details,
        technologies: technologies ?? '',
        position,
        responsibilities,
        domain,
        demo,
      }),
    ),
    certifications: dedup(
      resume.certifications.filter(
        (cert) => cert.name.trim() || cert.issuer.trim(),
      ),
      (cert) => `${cert.name}::${cert.issuer}::${cert.date}`,
    ).map(({ name, issuer, date }) => ({
      name,
      issuer,
      date: toISOSafe(date) ?? new Date().toISOString(),
    })),
    languages: dedup(
      resume.languages.filter(
        (lang) => lang.name.trim() || lang.description.trim(),
      ),
      (lang) => `${lang.name}::${lang.description}`,
    ).map(({ name, description }) => ({
      name,
      description,
    })),
  };
}

/**
 * Fills a resume with what `POST /resumes/parse` extracted. The resume keeps
 * its id, template and format; every section is replaced, and each new row
 * gets a client id until the next save.
 */
export function applyParsedResume(
  resume: Resume,
  parsed: ParseResumeResponse,
): Resume {
  const rows = <T>(items: T[] | null | undefined) =>
    (items ?? []).map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      resumeId: resume.id,
    }));

  return {
    ...resume,
    title: parsed.title ?? '',
    subTitle: parsed.subTitle ?? '',
    overview: parsed.overview ?? '',
    avatar: parsed.avatar ?? resume.avatar,
    information: rows(parsed.information),
    educations: rows(parsed.educations),
    skills: rows(parsed.skills),
    workExperiences: rows(parsed.workExperiences),
    projects: rows(parsed.projects),
    certifications: rows(parsed.certifications),
    languages: rows(parsed.languages),
  };
}
