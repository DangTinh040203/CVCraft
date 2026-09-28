'use client';

import { Button } from '@repo/ui/components/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@repo/ui/components/command';
import { ArrowRight, ChevronRight, Laptop, Moon, Search, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

import { sidebarData } from '@/components/layout/sidebar-data';
import { useSearch } from '@/lib/search-context';

export function CommandMenu() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { open, setOpen } = useSearch();

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    [setOpen],
  );

  return (
    <>
      <Button
        variant='outline'
        className={`
          text-muted-foreground h-8 w-40 justify-start gap-2
          sm:w-56
        `}
        onClick={() => setOpen(true)}
      >
        <Search className='size-4' />
        <span className='flex-1 text-start'>Search</span>
        <kbd className={`
          bg-muted hidden rounded border px-1.5 font-mono text-[10px]
          sm:inline
        `}>
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder='Type a command or search...' />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {sidebarData.navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem) => {
                if (navItem.url) {
                  return (
                    <CommandItem
                      key={navItem.url}
                      value={navItem.title}
                      onSelect={() =>
                        runCommand(() => router.push(navItem.url as string))
                      }
                    >
                      <ArrowRight className='text-muted-foreground/80 size-3' />
                      {navItem.title}
                    </CommandItem>
                  );
                }

                return navItem.items?.map((subItem) => (
                  <CommandItem
                    key={subItem.url}
                    value={`${navItem.title}-${subItem.url}`}
                    onSelect={() =>
                      runCommand(() => router.push(subItem.url))
                    }
                  >
                    <ArrowRight className='text-muted-foreground/80 size-3' />
                    {navItem.title} <ChevronRight className='size-3' />{' '}
                    {subItem.title}
                  </CommandItem>
                ));
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading='Theme'>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <Sun /> Light
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon /> Dark
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setTheme('system'))}
            >
              <Laptop /> System
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
