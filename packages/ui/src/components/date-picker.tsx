'use client';

import { Button } from '@repo/ui/components/button';
import { Calendar } from '@repo/ui/components/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover';
import { cn } from '@repo/ui/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

interface DatePickerProps {
  date?: Date | null;
  setDate: (date: Date | null | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  setDate,
  placeholder = 'Pick a date',
  className,
}: DatePickerProps) {
  const validDate = date && !isNaN(date.getTime()) ? date : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'h-10 w-full justify-start text-left font-normal',
            'rounded-lg border-slate-200 bg-slate-50 text-sm',
            'hover:bg-slate-100 hover:text-slate-900',
            `
              dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200
              dark:hover:bg-slate-600
            `,
            !date && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {validDate ? format(validDate, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          // Open on the picked date and allow jumping straight to a year,
          // since resume dates are often years in the past
          defaultMonth={validDate}
          captionLayout='dropdown'
          startMonth={new Date(1960, 0)}
          endMonth={new Date(new Date().getFullYear() + 10, 11)}
          selected={validDate}
          onSelect={setDate}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
