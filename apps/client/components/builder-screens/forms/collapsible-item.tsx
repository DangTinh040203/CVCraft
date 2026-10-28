'use client';

import {
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from '@dnd-kit/core';
import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import {
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  GripVertical,
  Trash2,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { parseResumeDate } from '@/components/templates/resume.types';

/** "Mar 2024", or the value as written when it isn't a date. */
export function formatMonth(value: string | null | undefined) {
  if (!value) return '';
  return (
    parseResumeDate(value)?.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }) ?? value
  );
}

/**
 * Which items of a section are folded to their header. A section that opens
 * with several items starts folded, so it fits on screen; items added later
 * start open, ready to fill in.
 */
export function useCollapsedItems(items: Array<{ id: string }>) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  // Set while rendering (not in an effect) so folded items never flash open
  if (!initialized && items.length > 0) {
    setInitialized(true);
    if (items.length > 1) setCollapsed(new Set(items.map((item) => item.id)));
  }

  const isCollapsed = useCallback(
    (id: string) => collapsed.has(id),
    [collapsed],
  );

  const toggle = useCallback((id: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  /** Opens these items, e.g. the ones with validation errors. */
  const expand = useCallback((ids: string[]) => {
    if (!ids.length) return;
    setCollapsed((current) => {
      const next = new Set(current);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const setAll = useCallback(
    (fold: boolean) =>
      setCollapsed(fold ? new Set(items.map((item) => item.id)) : new Set()),
    [items],
  );

  return {
    isCollapsed,
    toggle,
    expand,
    setAll,
    allCollapsed:
      items.length > 0 && items.every((item) => collapsed.has(item.id)),
  };
}

interface SortableItemHeaderProps {
  title: string;
  /** Shown in place of an empty title. */
  placeholder: string;
  subtitle?: string;
  collapsed: boolean;
  /** Without it (the drag preview) the header doesn't fold. */
  onToggle?: () => void;
  onRemove: () => void;
  isDragging: boolean;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
}

/**
 * The top row of a sortable item: drag handle, its title and subtitle (a
 * button that folds or opens the item) and delete.
 */
export function SortableItemHeader({
  title,
  placeholder,
  subtitle,
  collapsed,
  onToggle,
  onRemove,
  isDragging,
  attributes,
  listeners,
}: SortableItemHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2', !collapsed && 'mb-3')}>
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        aria-label='Drag to reorder'
        className={cn(
          'text-muted-foreground shrink-0 cursor-grab touch-none',
          'hover:bg-muted hover:text-foreground',
          isDragging && 'cursor-grabbing',
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className='h-4 w-4' />
      </Button>

      <button
        type='button'
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${title || placeholder}`}
        // No background of its own on hover: a box inside the card reads as a
        // second card. The title and chevron react instead.
        className={cn(
          'group/toggle flex min-w-0 flex-1 items-center gap-2 rounded-md py-1',
          'text-left outline-none',
          'focus-visible:ring-primary/30 focus-visible:ring-2',
        )}
      >
        <span className='min-w-0 flex-1'>
          <span
            className={cn(
              'block truncate text-sm font-medium transition-colors',
              'group-hover/toggle:text-primary',
              title
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 italic',
            )}
          >
            {title || placeholder}
          </span>
          {subtitle && (
            <span className='block truncate text-xs text-slate-500'>
              {subtitle}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-slate-400 transition-[color,transform]',
            `
              duration-200
              group-hover/toggle:text-slate-700
            `,
            'dark:group-hover/toggle:text-slate-200',
            !collapsed && 'rotate-180',
          )}
        />
      </button>

      <Button
        variant='ghost'
        size='icon'
        aria-label='Delete'
        className={cn(
          'h-8 w-8 shrink-0 rounded-md',
          'text-slate-400 opacity-0 transition-opacity',
          `
            group-hover:opacity-100
            focus-visible:opacity-100
          `,
          'hover:bg-rose-50 hover:text-rose-500',
          'dark:hover:bg-rose-500/10',
        )}
        onClick={onRemove}
        type='button'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  );
}

/** "Collapse all" / "Expand all" for a section with a few items. */
export function CollapseAllButton({
  count,
  allCollapsed,
  onChange,
}: {
  count: number;
  allCollapsed: boolean;
  onChange: (collapsed: boolean) => void;
}) {
  if (count < 2) return null;
  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      className={`
        h-7 gap-1.5 px-2 text-xs text-slate-500
        hover:bg-slate-100 hover:text-slate-900
        dark:hover:bg-slate-700/50 dark:hover:text-white
      `}
      onClick={() => onChange(!allCollapsed)}
    >
      {allCollapsed ? (
        <ChevronsUpDown className='size-3.5' />
      ) : (
        <ChevronsDownUp className='size-3.5' />
      )}
      {allCollapsed ? 'Expand all' : 'Collapse all'}
    </Button>
  );
}
