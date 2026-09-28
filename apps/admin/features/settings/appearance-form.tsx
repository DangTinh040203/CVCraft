'use client';

import { cn } from '@repo/ui/lib/utils';
import { Check, Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Laptop },
] as const;

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();

  return (
    <div className='space-y-4'>
      <div>
        <h4 className='mb-2 text-sm font-medium'>Theme</h4>
        <p className='text-muted-foreground mb-4 text-sm'>
          Select the theme for the admin app.
        </p>
      </div>
      <div className='grid max-w-md grid-cols-3 gap-4'>
        {options.map((option) => (
          <button
            key={option.value}
            type='button'
            onClick={() => setTheme(option.value)}
            className={cn(
              `
                hover:border-accent-foreground/50
                flex flex-col items-center gap-2 rounded-md border-2 p-4
              `,
              theme === option.value ? 'border-primary' : 'border-muted',
            )}
          >
            <option.icon className='size-6' />
            <span className='flex items-center gap-1 text-sm font-medium'>
              {option.label}
              {theme === option.value && <Check className='size-3' />}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
