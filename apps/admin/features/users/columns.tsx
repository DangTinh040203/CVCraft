import { Avatar, AvatarFallback } from '@repo/ui/components/avatar';
import { Badge } from '@repo/ui/components/badge';
import { cn } from '@repo/ui/lib/utils';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/data-table';
import { roles, statusBadgeClass } from '@/features/users/data';
import { DataTableRowActions } from '@/features/users/row-actions';
import { type User } from '@/features/users/schema';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

type ColumnsOptions = {
  onToggleSuspend: (id: string) => void;
};

export function buildUsersColumns({
  onToggleSuspend,
}: ColumnsOptions): ColumnDef<User>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Avatar className='size-8'>
            <AvatarFallback>{initials(row.original.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium'>{row.original.name}</div>
            <div className='text-muted-foreground text-sm'>
              {row.original.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'resumeCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Resumes' />
      ),
      cell: ({ row }) => <div>{row.getValue('resumeCount')}</div>,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Role' />
      ),
      cell: ({ row }) => {
        const role = roles.find((r) => r.value === row.getValue('role'));
        if (!role) return null;
        return (
          <div className='flex items-center gap-2'>
            <role.icon className='text-muted-foreground size-4' />
            <span className='capitalize'>{row.getValue('role')}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => (
        <Badge
          variant='outline'
          className={cn(
            'capitalize',
            statusBadgeClass[row.original.status],
          )}
        >
          {row.getValue('status')}
        </Badge>
      ),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Joined' />
      ),
      cell: ({ row }) => <div>{row.getValue('createdAt')}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          onToggleSuspend={() => onToggleSuspend(row.original.id)}
        />
      ),
    },
  ];
}
