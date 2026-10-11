import { type CreateResumeCommand } from '@/modules/resume/application/commands';
import { type User } from '@/modules/user/domain';

/** Bulleted list in the HTML the builder's rich-text editor produces. */
const bullets = (items: string[]) =>
  `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

/**
 * Sample content for the resume every new user starts with, so the builder
 * and every template look complete on first open. User-specific fields
 * (name, email, avatar) are filled in by `buildDefaultResume`.
 */
export const DEFAULT_RESUME: Omit<CreateResumeCommand, 'avatar'> = {
  title: 'Full Name',
  subTitle: 'Fullstack Developer',
  overview:
    '<p>Passionate software engineer with 5+ years of experience in building scalable web applications. Expert in React, Node.js, and cloud technologies. Proven track record of delivering high-quality code and leading development teams.</p>' +
    bullets([
      'Shipped products used by 1M+ users across web and mobile',
      'Led a team of 5 engineers through two major platform migrations',
      'Strong focus on performance, testing and developer experience',
    ]),
  information: [
    { label: 'Phone', value: '+1 (555) 123-4567' },
    { label: 'Email', value: 'you@example.com' },
    { label: 'Address', value: 'Ho Chi Minh City, Vietnam' },
    { label: 'Website', value: 'https://example.com' },
    { label: 'LinkedIn', value: 'https://linkedin.com/in/example' },
    { label: 'GitHub', value: 'https://github.com/example' },
  ],
  educations: [
    {
      school: 'Ho Chi Minh City University of Technology',
      degree: 'Bachelor of Engineering',
      major: 'Computer Science',
      startDate: '2015-09-01T00:00:00.000Z',
      endDate: '2019-06-30T00:00:00.000Z',
    },
    {
      school: 'Coursera',
      degree: 'Professional Certificate',
      major: 'Cloud Architecture',
      startDate: '2021-01-01T00:00:00.000Z',
      endDate: '2021-06-30T00:00:00.000Z',
    },
  ],
  workExperiences: [
    {
      company: 'Tech Giant Corp',
      position: 'Senior Software Engineer',
      description: bullets([
        'Lead the frontend architecture for the main customer dashboard',
        'Improved page load time by 40% with code splitting and caching',
        'Built a design system now used across 5 products',
        'Mentor junior developers and run weekly code reviews',
      ]),
      startDate: '2022-01-01T00:00:00.000Z',
      endDate: null,
    },
    {
      company: 'StartUp Inc',
      position: 'Full Stack Developer',
      description: bullets([
        'Built the MVP from scratch with React, Node.js and PostgreSQL',
        'Integrated payment gateways, real-time chat and notifications',
        'Scaled the platform to support 10K+ concurrent users',
      ]),
      startDate: '2019-07-01T00:00:00.000Z',
      endDate: '2021-12-31T00:00:00.000Z',
    },
    {
      company: 'Digital Agency Co',
      position: 'Frontend Developer Intern',
      description: bullets([
        'Developed responsive landing pages for 10+ client campaigns',
        'Collaborated with designers to turn Figma mockups into components',
      ]),
      startDate: '2018-06-01T00:00:00.000Z',
      endDate: '2018-12-31T00:00:00.000Z',
    },
  ],
  projects: [
    {
      title: 'E-commerce Platform',
      subTitle: 'Multi-vendor marketplace',
      details:
        '<p>Online marketplace with product search, cart, checkout and seller dashboards, serving 50K monthly users.</p>',
      technologies: 'Next.js, NestJS, PostgreSQL, Redis, Stripe',
      position: 'Tech Lead',
      responsibilities: bullets([
        'Designed the service architecture and database schema',
        'Implemented checkout and payment integration',
      ]),
      domain: 'E-commerce',
      demo: 'https://shop.example.com',
    },
    {
      title: 'Task Master App',
      subTitle: 'Team productivity tool',
      details:
        '<p>Productivity application with task boards, time tracking and team collaboration.</p>',
      technologies: 'React Native, Firebase, TypeScript',
      position: 'Solo Developer',
      responsibilities: bullets([
        'Designed and built the whole application',
        'Set up authentication and real-time sync with Firebase',
      ]),
      domain: 'Productivity',
      demo: 'https://taskmaster.example.com',
    },
    {
      title: 'Open Source UI Kit',
      subTitle: 'Accessible React components',
      details:
        '<p>Contributed accessible components and fixes to a popular open-source React UI library.</p>',
      technologies: 'React, TypeScript, Storybook, Jest',
      position: 'Contributor',
      responsibilities: bullets([
        'Added 5 new components with full keyboard support',
        'Wrote unit tests for every new feature',
      ]),
      domain: 'Open Source',
      demo: 'https://github.com/example/ui-kit',
    },
  ],
  skills: [
    { label: 'TypeScript', value: 'Expert' },
    { label: 'React', value: 'Expert' },
    { label: 'Next.js', value: 'Advanced' },
    { label: 'Node.js', value: 'Advanced' },
    { label: 'NestJS', value: 'Advanced' },
    { label: 'PostgreSQL', value: 'Advanced' },
    { label: 'Docker', value: 'Intermediate' },
    { label: 'AWS', value: 'Intermediate' },
  ],
  certifications: [
    {
      name: 'AWS Certified Developer – Associate',
      issuer: 'Amazon Web Services',
      date: '2023-03-15T00:00:00.000Z',
    },
    {
      name: 'Professional Scrum Master I',
      issuer: 'Scrum.org',
      date: '2021-09-10T00:00:00.000Z',
    },
  ],
  languages: [
    { name: 'Vietnamese', description: 'Native' },
    { name: 'English', description: 'Fluent' },
    { name: 'Japanese', description: 'Basic' },
  ],
};

/** The default resume personalised with the new user's name, email and avatar. */
export function buildDefaultResume(user: User): CreateResumeCommand {
  return {
    ...DEFAULT_RESUME,
    title: user.fullName || DEFAULT_RESUME.title,
    avatar: user.avatar,
    information: DEFAULT_RESUME.information.map((item) =>
      item.label === 'Email' ? { ...item, value: user.email } : item,
    ),
  };
}
