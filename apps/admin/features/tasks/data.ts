import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  Timer,
} from 'lucide-react';

import { type Task } from '@/features/tasks/schema';

export const labels = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'chore', label: 'Chore' },
];

export const statuses = [
  { label: 'Backlog', value: 'backlog', icon: HelpCircle },
  { label: 'Todo', value: 'todo', icon: Circle },
  { label: 'In Progress', value: 'in progress', icon: Timer },
  { label: 'Done', value: 'done', icon: CheckCircle },
  { label: 'Canceled', value: 'canceled', icon: CircleOff },
];

export const priorities = [
  { label: 'Low', value: 'low', icon: ArrowDown },
  { label: 'Medium', value: 'medium', icon: ArrowRight },
  { label: 'High', value: 'high', icon: ArrowUp },
  { label: 'Critical', value: 'critical', icon: AlertCircle },
];

export const initialTasks: Task[] = [
  { id: 'TASK-101', title: 'Fix Paged.js page-break flicker on Firefox', status: 'in progress', label: 'bug', priority: 'high' },
  { id: 'TASK-102', title: 'Add Executive template', status: 'todo', label: 'feature', priority: 'medium' },
  { id: 'TASK-103', title: 'Wire up Clerk production OAuth apps', status: 'backlog', label: 'chore', priority: 'critical' },
  { id: 'TASK-104', title: 'Instrument Gemini token/cost logging', status: 'done', label: 'feature', priority: 'high' },
  { id: 'TASK-105', title: 'Investigate Supabase pooler timeout under load', status: 'todo', label: 'bug', priority: 'critical' },
  { id: 'TASK-106', title: 'Add feature flag table + admin UI', status: 'backlog', label: 'feature', priority: 'low' },
  { id: 'TASK-107', title: 'Write PDF export load test', status: 'canceled', label: 'chore', priority: 'medium' },
  { id: 'TASK-108', title: 'Audit i18n key parity across 11 locales', status: 'in progress', label: 'chore', priority: 'medium' },
];
