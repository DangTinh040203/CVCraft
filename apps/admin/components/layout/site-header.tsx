import { Separator } from '@repo/ui/components/separator';
import { SidebarTrigger } from '@repo/ui/components/sidebar';
import { type ReactNode } from 'react';

import { CommandMenu } from '@/components/command-menu';
import { ThemeSwitch } from '@/components/theme-switch';

export function SiteHeader({ title }: { title: ReactNode }) {
  return (
    <header className={`
      bg-background sticky top-0 z-50 flex h-16 shrink-0 items-center gap-3
      border-b px-4
    `}>
      <SidebarTrigger variant='outline' />
      <Separator orientation='vertical' className='h-6' />
      <h1 className='flex-1 truncate text-lg font-semibold'>{title}</h1>
      <CommandMenu />
      <ThemeSwitch />
    </header>
  );
}
