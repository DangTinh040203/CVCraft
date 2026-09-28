import { type LucideIcon } from 'lucide-react';

type BaseNavItem = {
  title: string;
  badge?: string;
  icon?: LucideIcon;
};

export type NavLink = BaseNavItem & {
  url: string;
  items?: never;
};

export type NavCollapsible = BaseNavItem & {
  url?: never;
  items: (BaseNavItem & { url: string })[];
};

export type NavItem = NavCollapsible | NavLink;

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export type SidebarData = {
  user: {
    name: string;
    email: string;
  };
  navGroups: NavGroup[];
};
