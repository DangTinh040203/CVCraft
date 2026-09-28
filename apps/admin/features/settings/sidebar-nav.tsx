'use client';

import { buttonVariants } from '@repo/ui/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { cn } from '@repo/ui/lib/utils';
import { Bell, Monitor, Palette, UserCog, Wrench } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const items = [
  { title: 'Profile', href: '/settings', icon: UserCog },
  { title: 'Account', href: '/settings/account', icon: Wrench },
  { title: 'Appearance', href: '/settings/appearance', icon: Palette },
  { title: 'Notifications', href: '/settings/notifications', icon: Bell },
  { title: 'Display', href: '/settings/display', icon: Monitor },
];

export function SettingsSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <div className={`
        p-1
        md:hidden
      `}>
        <Select value={pathname} onValueChange={(value) => router.push(value)}>
          <SelectTrigger className={`
            h-12
            sm:w-56
          `}>
            <SelectValue placeholder='Section' />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className='flex gap-x-4 px-2 py-1'>
                  <item.icon className='size-4.5' />
                  <span>{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <nav className={`
        hidden w-full min-w-40 flex-col gap-1 py-2
        md:flex
      `}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              pathname === item.href
                ? 'bg-muted hover:bg-accent'
                : 'hover:bg-accent hover:underline',
              'justify-start',
            )}
          >
            <item.icon className='me-2 size-4.5' />
            {item.title}
          </Link>
        ))}
      </nav>
    </>
  );
}
