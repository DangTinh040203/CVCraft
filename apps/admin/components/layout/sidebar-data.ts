import {
  Bell,
  LayoutDashboard,
  ListTodo,
  Monitor,
  Palette,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react';

import { type SidebarData } from '@/components/layout/types';

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@resume-builder.local',
  },
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Wrench,
          items: [
            { title: 'Profile', url: '/settings', icon: UserCog },
            { title: 'Account', url: '/settings/account', icon: Wrench },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            { title: 'Display', url: '/settings/display', icon: Monitor },
          ],
        },
      ],
    },
  ],
};
