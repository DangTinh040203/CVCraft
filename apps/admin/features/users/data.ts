import { ShieldCheck, User as UserIcon } from 'lucide-react';

import { type User } from '@/features/users/schema';

export const roles = [
  { label: 'Admin', value: 'admin', icon: ShieldCheck },
  { label: 'User', value: 'user', icon: UserIcon },
];

export const statuses = [
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
];

export const statusBadgeClass: Record<User['status'], string> = {
  active: 'text-green-700 dark:text-green-400',
  suspended: 'text-destructive',
};

export const initialUsers: User[] = [
  { id: 'usr_01', name: 'Olivia Martin', email: 'olivia.martin@email.com', role: 'user', status: 'active', resumeCount: 3, createdAt: '2026-01-14' },
  { id: 'usr_02', name: 'Jackson Lee', email: 'jackson.lee@email.com', role: 'user', status: 'active', resumeCount: 1, createdAt: '2026-02-02' },
  { id: 'usr_03', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', role: 'admin', status: 'active', resumeCount: 2, createdAt: '2025-11-20' },
  { id: 'usr_04', name: 'William Kim', email: 'will@email.com', role: 'user', status: 'suspended', resumeCount: 5, createdAt: '2025-09-08' },
  { id: 'usr_05', name: 'Sofia Davis', email: 'sofia.davis@email.com', role: 'user', status: 'active', resumeCount: 1, createdAt: '2026-03-01' },
  { id: 'usr_06', name: 'Liam Tran', email: 'liam.tran@email.com', role: 'user', status: 'active', resumeCount: 4, createdAt: '2026-01-29' },
];
