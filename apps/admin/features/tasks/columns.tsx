import { Badge } from '@repo/ui/components/badge';
import { Checkbox } from '@repo/ui/components/checkbox';
import { type ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/data-table';
import { labels, priorities, statuses } from '@/features/tasks/data';
import { DataTableRowActions } from '@/features/tasks/row-actions';
import { type Task } from '@/features/tasks/schema';

type ColumnsOptions = {
  onDelete: (id: string) => void;
};

export function buildTasksColumns({
  onDelete,
}: ColumnsOptions): ColumnDef<Task>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Task' />
      ),
      cell: ({ row }) => <div className='w-24'>{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Title' />
      ),
      cell: ({ row }) => {
        const label = labels.find(
          (label) => label.value === row.original.label,
        );
        return (
          <div className='flex items-center gap-2'>
            {label && <Badge variant='outline'>{label.label}</Badge>}
            <span className='truncate font-medium'>
              {row.getValue('title')}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const status = statuses.find(
          (status) => status.value === row.getValue('status'),
        );
        if (!status) return null;
        return (
          <div className='flex w-28 items-center gap-2'>
            <status.icon className='text-muted-foreground size-4' />
            <span>{status.label}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Priority' />
      ),
      cell: ({ row }) => {
        const priority = priorities.find(
          (priority) => priority.value === row.getValue('priority'),
        );
        if (!priority) return null;
        return (
          <div className='flex items-center gap-2'>
            <priority.icon className='text-muted-foreground size-4' />
            <span>{priority.label}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          onDelete={() => onDelete(row.original.id)}
        />
      ),
    },
  ];
}
