'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@repo/ui/components/select';
import { cn } from '@repo/ui/lib/utils';

import {
  APPLICATION_STATUSES,
  STATUS_META,
} from '@/components/applications-screen/application-status';
import { type ApplicationStatus } from '@/types/application.type';

interface StatusSelectProps {
  value: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void;
  className?: string;
}

/** The status as a badge that opens the list of statuses. */
export function StatusSelect({
  value,
  onChange,
  className,
}: StatusSelectProps) {
  const meta = STATUS_META[value];
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as ApplicationStatus)}
    >
      <SelectTrigger
        size='sm'
        aria-label={`Status: ${meta.label}`}
        className={cn(
          `
            h-7 w-[7.5rem] cursor-pointer justify-between gap-1.5 rounded-full
            border-0 px-2.5 text-xs font-semibold shadow-none ring-1
            transition-[filter] ring-inset
            hover:brightness-95
            [&_svg]:size-3.5 [&_svg]:opacity-60
          `,
          meta.chip,
          className,
        )}
        // Rows open on click: picking a status mustn't open them too
        onClick={(event) => event.stopPropagation()}
      >
        <span className='flex items-center gap-1.5'>
          <span className={cn('size-1.5 shrink-0 rounded-full', meta.fill)} />
          {meta.label}
        </span>
      </SelectTrigger>
      <SelectContent
        // Below the badge: item-aligned positioning lands off-screen in sheets
        position='popper'
        align='end'
        className='min-w-60 rounded-xl p-1'
        onClick={(event) => event.stopPropagation()}
      >
        {APPLICATION_STATUSES.map((status) => {
          const { label, hint, fill } = STATUS_META[status];
          return (
            <SelectItem
              key={status}
              value={status}
              className='rounded-lg py-2 pr-8 pl-3'
            >
              <span
                className={cn(
                  'mt-1.5 size-2 shrink-0 self-start rounded-full',
                  fill,
                )}
              />
              <span className='flex flex-col gap-0.5'>
                <span className='font-medium'>{label}</span>
                <span
                  className={`
                    text-muted-foreground text-xs
                    in-data-highlighted:text-accent-foreground/80
                  `}
                >
                  {hint}
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
