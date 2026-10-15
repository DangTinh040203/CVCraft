export interface ResumeInformationItem {
  id: string;
  label: string;
  value: string;
  order: number;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string; // ISO date
  endDate: string | null; // null = "Present"
  order: number;
}

export interface WorkExperienceItem {
  id: string;
  company: string;
  position: string;
  description: string; // rich text: editor HTML, or plain lines ("• ..." = bullet)
  startDate: string;
  endDate: string | null; // null = "Present"
  order: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  subTitle: string;
  details: string; // rich text, see description
  technologies: string;
  position: string;
  responsibilities: string; // rich text, see description
  domain: string;
  demo?: string;
  order: number;
}

export interface SkillItem {
  id: string;
  label: string;
  value: string; // category, or proficiency level
  order: number;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  order: number;
}

export interface LanguageItem {
  id: string;
  name: string;
  description: string; // e.g. "Native", "Fluent", "Intermediate"
  order: number;
}

export interface ResumeData {
  title: string; // full name
  subTitle: string; // headline / target role
  overview: string; // professional summary, rich text
  avatar?: string;
  information: ResumeInformationItem[];
  educations: EducationItem[];
  workExperiences: WorkExperienceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
}

/** Proficiency words a skill's `value` may hold, as in the sample data. */
const SKILL_LEVELS = new Set([
  'beginner',
  'elementary',
  'novice',
  'basic',
  'intermediate',
  'competent',
  'proficient',
  'advanced',
  'expert',
  'master',
]);

/** True when a skill's `value` is a proficiency level ("Expert"). */
export function isSkillLevel(value: string | null | undefined): boolean {
  return SKILL_LEVELS.has((value ?? '').trim().toLowerCase());
}

/**
 * What a skill lists, e.g. "React, Next.js" for the group "Frameworks" (as
 * CV import returns skills). Empty when `value` is a proficiency level or
 * blank, so templates that show levels their own way keep doing so.
 */
export function skillDetail(skill: SkillItem): string {
  const value = (skill.value ?? '').trim();
  return value && !isSkillLevel(value) ? value : '';
}

/** True when any skill lists items, so the section reads as groups. */
export function hasSkillGroups(skills: SkillItem[]): boolean {
  return skills.some((skill) => skillDetail(skill) !== '');
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/**
 * A resume date as a Date: ISO as the editor saves it, or "MM/YYYY" as early
 * CV imports returned it. Null when it can't be read.
 */
export function parseResumeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const monthYear = value.trim().match(/^(\d{1,2})[-/.](\d{4})$/);
  const date = monthYear
    ? new Date(Number(monthYear[2]), Number(monthYear[1]) - 1, 1)
    : new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

export function formatDateRange(
  startDate: string,
  endDate: string | null,
): string {
  // An unreadable date shows as written rather than "Invalid Date"
  const format = (value: string) =>
    parseResumeDate(value)?.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }) ?? value;

  return `${format(startDate)} – ${endDate ? format(endDate) : 'Present'}`;
}
