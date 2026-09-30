import { type ResumeData } from '@/components/templates/resume.types';

/**
 * Fixture data shared by all 8 template previews on /templates.
 * Same role as `sampleResume.js` in resume-pdf-mvp — hardcoded, long enough
 * to exercise a real layout, not tied to any real user.
 */
export const sampleResume: ResumeData = {
  title: 'Alexandra Chen',
  subTitle: 'Senior Product Designer',
  overview:
    'Product designer with 8+ years crafting design systems and 0-to-1 experiences for B2B SaaS. Led design for a platform that scaled from 10K to 2M users, partnering closely with engineering and product to ship fast without sacrificing craft.',
  avatar: '/avatars/sarah-chen.jpg',
  information: [
    { id: 'i1', label: 'Email', value: 'alexandra.chen@email.com', order: 0 },
    { id: 'i2', label: 'Phone', value: '+1 (555) 234-1187', order: 1 },
    { id: 'i3', label: 'Location', value: 'San Francisco, CA', order: 2 },
    { id: 'i4', label: 'LinkedIn', value: 'linkedin.com/in/alexchen', order: 3 },
    { id: 'i5', label: 'Portfolio', value: 'alexchen.design', order: 4 },
  ],
  educations: [
    {
      id: 'e1',
      school: 'Rhode Island School of Design',
      degree: 'Bachelor of Fine Arts',
      major: 'Graphic Design',
      startDate: '2012-09-01',
      endDate: '2016-05-01',
      order: 0,
    },
    {
      id: 'e2',
      school: 'California Institute of the Arts',
      degree: 'Certificate',
      major: 'Interaction Design',
      startDate: '2017-01-01',
      endDate: '2017-06-01',
      order: 1,
    },
  ],
  workExperiences: [
    {
      id: 'w1',
      company: 'Northbeam',
      position: 'Senior Product Designer',
      description:
        '• Led design for the analytics platform used by 2M+ monthly active users\n• Built and maintained a design system adopted across 6 product squads\n• Partnered with PM/Eng to ship a redesigned onboarding flow, lifting activation by 24%',
      startDate: '2021-03-01',
      endDate: null,
      order: 0,
    },
    {
      id: 'w2',
      company: 'Fieldwire',
      position: 'Product Designer',
      description:
        '• Designed the mobile field-reporting experience used on construction sites\n• Ran 40+ user interviews to reshape the task-assignment workflow\n• Mentored 2 junior designers on craft and process',
      startDate: '2018-07-01',
      endDate: '2021-02-01',
      order: 1,
    },
    {
      id: 'w3',
      company: 'Studio Loop',
      position: 'UX/UI Designer',
      description:
        '• Delivered brand and product design for 12+ early-stage startup clients\n• Established the studio\'s first component library, cutting handoff time by 30%',
      startDate: '2016-06-01',
      endDate: '2018-06-01',
      order: 2,
    },
  ],
  projects: [
    {
      id: 'p1',
      title: 'Design System "Atlas"',
      subTitle: 'Internal design system, Northbeam',
      details:
        'Token-based design system spanning Figma and a React component library, adopted by 6 product teams and cutting new-screen design time roughly in half.',
      technologies: 'Figma, React, Storybook, Style Dictionary',
      position: 'Design Lead',
      responsibilities: 'Component architecture, design tokens, documentation',
      domain: 'B2B SaaS',
      demo: 'atlas.northbeam.design',
      order: 0,
    },
    {
      id: 'p2',
      title: 'Onboarding Redesign',
      subTitle: 'Activation initiative, Northbeam',
      details:
        'End-to-end redesign of the first-run experience based on funnel analysis and usability testing, raising day-7 activation from 41% to 51%.',
      technologies: 'Figma, Mixpanel, Maze',
      position: 'Product Designer',
      responsibilities: 'Research, flow design, A/B test coordination',
      domain: 'Analytics',
      order: 1,
    },
    {
      id: 'p3',
      title: 'Fieldwire Mobile Reporting',
      subTitle: 'Mobile app module, Fieldwire',
      details:
        'Offline-first reporting flow for construction site supervisors, designed around low-connectivity environments and one-handed use.',
      technologies: 'Figma, Principle',
      position: 'Product Designer',
      responsibilities: 'Interaction design, usability testing',
      domain: 'Construction Tech',
      order: 2,
    },
  ],
  skills: [
    { id: 's1', label: 'Product Design', value: 'Expert', order: 0 },
    { id: 's2', label: 'Design Systems', value: 'Expert', order: 1 },
    { id: 's3', label: 'Figma', value: 'Expert', order: 2 },
    { id: 's4', label: 'User Research', value: 'Advanced', order: 3 },
    { id: 's5', label: 'Interaction Design', value: 'Advanced', order: 4 },
    { id: 's6', label: 'Prototyping', value: 'Advanced', order: 5 },
    { id: 's7', label: 'HTML/CSS', value: 'Intermediate', order: 6 },
    { id: 's8', label: 'Design Ops', value: 'Intermediate', order: 7 },
  ],
  certifications: [
    {
      id: 'c1',
      name: 'Certified Usability Analyst',
      issuer: 'Human Factors International',
      date: '2020-04-01',
      order: 0,
    },
    {
      id: 'c2',
      name: 'Design Leadership Certificate',
      issuer: 'DesignBetter Academy',
      date: '2022-09-01',
      order: 1,
    },
  ],
  languages: [
    { id: 'l1', name: 'English', description: 'Native', order: 0 },
    { id: 'l2', name: 'Mandarin', description: 'Native', order: 1 },
    { id: 'l3', name: 'Spanish', description: 'Intermediate', order: 2 },
  ],
};
