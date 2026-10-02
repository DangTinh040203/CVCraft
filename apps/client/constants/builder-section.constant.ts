import {
  Briefcase,
  Code,
  FileText,
  FolderGit2,
  GraduationCap,
  Plus,
  User,
} from 'lucide-react';

export enum Section {
  Personal = 'personal',
  Summary = 'summary',
  Skills = 'skills',
  Education = 'education',
  Experience = 'experience',
  Projects = 'projects',
  Extra = 'extra',
}

export const sectionConfig = [
  { id: Section.Personal, label: 'Personal', icon: User },
  { id: Section.Summary, label: 'Summary', icon: FileText },
  { id: Section.Skills, label: 'Skills', icon: Code },
  {
    id: Section.Education,
    label: 'Education',
    icon: GraduationCap,
  },
  { id: Section.Experience, label: 'Experience', icon: Briefcase },
  { id: Section.Projects, label: 'Projects', icon: FolderGit2 },
  { id: Section.Extra, label: 'Extra', icon: Plus },
];
