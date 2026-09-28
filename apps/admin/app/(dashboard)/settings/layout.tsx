import { Separator } from '@repo/ui/components/separator';
import { type ReactNode } from 'react';

import { Main } from '@/components/layout/main';
import { SiteHeader } from '@/components/layout/site-header';
import { SettingsSidebarNav } from '@/features/settings/sidebar-nav';

export default function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader title='Settings' />
      <Main>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>
          <p className='text-muted-foreground'>
            Manage your admin account settings.
          </p>
        </div>
        <Separator className='my-4' />
        <div className={`
          flex flex-1 flex-col gap-8
          md:flex-row
        `}>
          <aside className='md:w-1/5'>
            <SettingsSidebarNav />
          </aside>
          <div className='flex-1'>{children}</div>
        </div>
      </Main>
    </>
  );
}
