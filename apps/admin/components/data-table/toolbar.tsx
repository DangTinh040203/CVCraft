import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { type Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { type ComponentType } from 'react';

import { DataTableFacetedFilter } from '@/components/data-table/faceted-filter';
import { DataTableViewOptions } from '@/components/data-table/view-options';

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  searchPlaceholder?: string;
  filters?: {
    columnId: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: ComponentType<{ className?: string }>;
    }[];
  }[];
};

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Filter...',
  filters = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter;

  return (
    <div className='flex items-center justify-between'>
      <div className={`
        flex flex-1 flex-col-reverse items-start gap-y-2
        sm:flex-row sm:items-center sm:space-x-2
      `}>
        <Input
          placeholder={searchPlaceholder}
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className={`
            h-8 w-40
            lg:w-64
          `}
        />
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId);
            if (!column) return null;
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            );
          })}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter('');
            }}
            className={`
              h-8 px-2
              lg:px-3
            `}
          >
            Reset
            <X className='ms-2 size-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
