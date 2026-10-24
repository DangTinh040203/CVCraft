import { type Metadata } from 'next';

import { InterviewScreen } from '@/components/interview-screen/interview-screen';

export const metadata: Metadata = {
  title: 'Mock interview',
  description:
    'Practice a spoken interview for any job with an AI interviewer, then get scored feedback.',
  robots: { index: false },
};

export default function InterviewPage() {
  return <InterviewScreen />;
}
