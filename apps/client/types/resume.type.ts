import { type Format } from '@/stores/features/template.slice';

export interface ResumeInformation {
  id: string;
  label: string;
  value: string;
  resumeId: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string | null;
  resumeId: string;
}

export interface Skill {
  id: string;
  label: string;
  value: string;
  resumeId: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string | null;
  resumeId: string;
}

export interface Project {
  id: string;
  title: string;
  subTitle: string;
  details: string;
  technologies: string;
  position: string;
  responsibilities: string;
  domain: string;
  demo?: string | null;
  resumeId: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  resumeId: string;
}

export interface Language {
  id: string;
  name: string;
  description: string;
  resumeId: string;
}

export interface Resume {
  id: string;
  userId: string;

  title: string;
  subTitle: string;
  overview: string;
  avatar: string | null;
  templateKey: string | null;
  format: Partial<Format> | null;

  information: Array<ResumeInformation>;
  educations: Array<Education>;
  skills: Array<Skill>;
  workExperiences: Array<WorkExperience>;

  projects: Array<Project>;
  certifications: Array<Certification>;
  languages: Array<Language>;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateResumeDto {
  title?: string;
  subTitle?: string;
  overview?: string;
  avatar?: string | null;
  templateKey?: string | null;
  format?: Partial<Format> | null;
  information?: Array<Omit<ResumeInformation, 'id' | 'resumeId'>>;
  educations?: Array<Omit<Education, 'id' | 'resumeId'>>;
  skills?: Array<Omit<Skill, 'id' | 'resumeId'>>;
  workExperiences?: Array<Omit<WorkExperience, 'id' | 'resumeId'>>;
  projects?: Array<Omit<Project, 'id' | 'resumeId'>>;
  certifications?: Array<Omit<Certification, 'id' | 'resumeId'>>;
  languages?: Array<Omit<Language, 'id' | 'resumeId'>>;
}

/** What `POST /resumes/parse` extracts from an uploaded PDF resume. */
export interface ParseResumeResponse {
  title: string;
  subTitle: string;
  overview: string;
  avatar: string | null;
  information: Array<Omit<ResumeInformation, 'id' | 'resumeId'>>;
  educations: Array<Omit<Education, 'id' | 'resumeId'>>;
  skills: Array<Omit<Skill, 'id' | 'resumeId'>>;
  workExperiences: Array<Omit<WorkExperience, 'id' | 'resumeId'>>;
  projects: Array<Omit<Project, 'id' | 'resumeId'>>;
  certifications: Array<Omit<Certification, 'id' | 'resumeId'>>;
  languages: Array<Omit<Language, 'id' | 'resumeId'>>;
}
