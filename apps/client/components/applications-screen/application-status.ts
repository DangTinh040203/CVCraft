import {
  CalendarClock,
  type LucideIcon,
  MailCheck,
  MessageSquareReply,
  PartyPopper,
  XCircle,
} from 'lucide-react';

import { type ApplicationStatus } from '@/types/application.type';

interface StatusMeta {
  label: string;
  /** What the status means, for the picker. */
  hint: string;
  icon: LucideIcon;
  /** Badge colors: tinted background, text and a hairline ring. */
  chip: string;
  /** The status color as a fill (dots, pipeline segments). */
  fill: string;
}

/** In the order an application moves through them. */
export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'SENT',
  'REPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

/** The steps of the process, without the way out of it (Rejected). */
export const PIPELINE_STEPS: ApplicationStatus[] = [
  'SENT',
  'REPLIED',
  'INTERVIEW',
  'OFFER',
];

export const STATUS_META: Record<ApplicationStatus, StatusMeta> = {
  SENT: {
    label: 'Sent',
    hint: 'Waiting to hear back',
    icon: MailCheck,
    chip: 'bg-slate-500/8 text-slate-700 ring-slate-500/20',
    fill: 'bg-slate-400',
  },
  REPLIED: {
    label: 'Replied',
    hint: 'The recruiter wrote back',
    icon: MessageSquareReply,
    chip: 'bg-sky-500/10 text-sky-700 ring-sky-600/20',
    fill: 'bg-sky-500',
  },
  INTERVIEW: {
    label: 'Interview',
    hint: 'An interview is set up or done',
    icon: CalendarClock,
    chip: 'bg-primary/10 text-primary ring-primary/25',
    fill: 'bg-primary',
  },
  OFFER: {
    label: 'Offer',
    hint: 'You got an offer',
    icon: PartyPopper,
    chip: 'bg-emerald-500/10 text-emerald-700 ring-emerald-600/20',
    fill: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    hint: 'Not moving forward',
    icon: XCircle,
    chip: 'bg-rose-500/8 text-rose-700 ring-rose-600/20',
    fill: 'bg-rose-400',
  },
};
