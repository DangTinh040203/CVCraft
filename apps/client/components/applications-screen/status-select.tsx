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

/** The status as a colored chip that opens the list of statuses. */
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
          'h-8 gap-1.5 rounded-full px-3 text-xs font-medium shadow-none',
          meta.chip,
          className,
        )}
        // Rows open on click: picking a status mustn't open them too
        onClick={(event) => event.stopPropagation()}
      >
        <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} />
        {meta.label}
      </SelectTrigger>
      <SelectContent
        // Below the chip: item-aligned positioning lands off-screen in sheets
        position='popper'
        align='end'
        className='min-w-56'
        onClick={(event) => event.stopPropagation()}
      >
        {APPLICATION_STATUSES.map((status) => {
          const { label, hint, icon: Icon } = STATUS_META[status];
          return (
            <SelectItem key={status} value={status} className='py-2'>
              <Icon className='size-4' />
              <span className='flex flex-col'>
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
