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
  description: string; // multi-line, bullet-style ("• ..." per line)
  startDate: string;
  endDate: string | null; // null = "Present"
  order: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  subTitle: string;
  details: string;
  technologies: string;
  position: string;
  responsibilities: string;
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
  overview: string; // professional summary
  avatar?: string;
  information: ResumeInformationItem[];
  educations: EducationItem[];
  workExperiences: WorkExperienceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function formatDateRange(
  startDate: string,
  endDate: string | null,
): string {
  const format = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

  return `${format(startDate)} – ${endDate ? format(endDate) : 'Present'}`;
}
