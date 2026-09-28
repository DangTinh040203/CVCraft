'use client';

import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Ellipsis } from 'lucide-react';
import { toast } from 'sonner';

export function DataTableRowActions({
  onToggleSuspend,
}: {
  onToggleSuspend: () => void;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='flex size-8 p-0'>
          <Ellipsis className='size-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-44'>
        <DropdownMenuItem
          onClick={() =>
            toast.info('Viewing resumes will land once the admin API exists.')
          }
        >
          View resumes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive' onClick={onToggleSuspend}>
          Toggle suspended
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
