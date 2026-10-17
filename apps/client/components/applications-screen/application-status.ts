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
  /** Chip colors (text, background, border). */
  chip: string;
  /** The dot shown next to the label. */
  dot: string;
}

/** In the order an application moves through them. */
export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'SENT',
  'REPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

export const STATUS_META: Record<ApplicationStatus, StatusMeta> = {
  SENT: {
    label: 'Sent',
    hint: 'Waiting to hear back',
    icon: MailCheck,
    chip: 'border-sky-200 bg-sky-50 text-sky-700',
    dot: 'bg-sky-500',
  },
  REPLIED: {
    label: 'Replied',
    hint: 'The recruiter wrote back',
    icon: MessageSquareReply,
    chip: 'border-violet-200 bg-violet-50 text-violet-700',
    dot: 'bg-violet-500',
  },
  INTERVIEW: {
    label: 'Interview',
    hint: 'An interview is set up or done',
    icon: CalendarClock,
    chip: 'border-amber-200 bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  OFFER: {
    label: 'Offer',
    hint: 'You got an offer',
    icon: PartyPopper,
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    hint: 'Not moving forward',
    icon: XCircle,
    chip: 'border-rose-200 bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
};
