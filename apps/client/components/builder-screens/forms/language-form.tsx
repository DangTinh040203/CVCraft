'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { cn } from '@repo/ui/lib/utils';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  GripVertical,
  Languages,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import BuilderNavigation from '@/components/builder-screens/builder-navigation';
import { useSyncResume } from '@/hooks/use-sync-resume';
import { updateResume } from '@/stores/features/resume.slice';
import { useAppDispatch } from '@/stores/store';
import type { Language } from '@/types/resume.type';

interface LanguageFormProps {
  onNext?: () => void;
  onBack?: () => void;
  hideNavigation?: boolean;
}

const LANGUAGE_LEVEL_OPTIONS = [
  { value: 'Elementary', labelKey: 'Elementary' },
  {
    value: 'Limited Working Proficiency',
    labelKey: 'Limited Working',
  },
  {
    value: 'Professional Working Proficiency',
    labelKey: 'Professional Working',
  },
  {
    value: 'Full Professional Proficiency',
    labelKey: 'Full Professional',
  },
  {
    value: 'Native or Bilingual Proficiency',
    labelKey: 'Native or Bilingual',
  },
];

// Sortable language item component
function SortableLanguageItem({
  item,
  onUpdate,
  onRemove,
  errors,
}: {
  item: Language;
  onUpdate: (id: string, field: keyof Language, value: string | null) => void;
  onRemove: (id: string) => void;
  errors?: { name?: string; description?: string };
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-xl bg-white p-4',
        'ring-1 ring-slate-200',
        'hover:ring-slate-300',
        'dark:bg-slate-800 dark:ring-slate-700',
        isDragging && 'relative z-50 opacity-50',
      )}
    >
      <div className='mb-3 flex items-center justify-between'>
        {/* Drag Handle */}
        <button
          type='button'
          className={cn(
            'cursor-grab touch-none rounded p-1',
            'text-slate-400 transition-colors',
            'hover:bg-slate-100 hover:text-slate-600',
            'dark:hover:bg-slate-700',
            isDragging && 'cursor-grabbing',
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical className='h-4 w-4' />
        </button>

        {/* Delete Button */}
        <Button
          variant='ghost'
          size='icon'
          className={cn(
            'h-8 w-8 shrink-0 rounded-md',
            'text-slate-400 opacity-0 transition-opacity',
            'group-hover:opacity-100',
            'hover:bg-rose-50 hover:text-rose-500',
            'dark:hover:bg-rose-500/10',
          )}
          onClick={() => onRemove(item.id)}
          type='button'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      <div
        className={`
          grid gap-3
          sm:grid-cols-2
        `}
      >
        <div className='space-y-1'>
          <Input
            value={item.name}
            onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
            placeholder={'Language'}
            className={cn(
              'h-10 rounded-lg border-slate-200 bg-slate-50 text-sm',
              'focus:bg-white focus:ring-2 focus:ring-violet-500/20',
              'dark:border-slate-700 dark:bg-slate-700',
              errors?.name && 'border-red-400 focus:ring-red-500/20',
            )}
          />
          {errors?.name && (
            <p className='flex items-center gap-1 text-xs text-red-500'>
              <AlertCircle className='h-3 w-3' />
              {errors.name}
            </p>
          )}
        </div>
        <div className='space-y-1'>
          <Select
            value={item.description}
            onValueChange={(value) => onUpdate(item.id, 'description', value)}
          >
            <SelectTrigger
              className={cn(
                'h-10 w-full rounded-lg border-slate-200 bg-slate-50 text-sm',
                'focus:bg-white focus:ring-2 focus:ring-violet-500/20',
                'dark:border-slate-700 dark:bg-slate-700',
                errors?.description && 'border-red-400 focus:ring-red-500/20',
              )}
            >
              <SelectValue placeholder={'Select proficiency'} />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_LEVEL_OPTIONS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.labelKey}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.description && (
            <p className='flex items-center gap-1 text-xs text-red-500'>
              <AlertCircle className='h-3 w-3' />
              {errors.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const LanguageForm = ({
  onNext,
  onBack,
  hideNavigation,
}: LanguageFormProps) => {
  const dispatch = useAppDispatch();
  const { resume } = useSyncResume();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, { name?: string; description?: string }>
  >({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const languageItems = useMemo(
    () => resume?.languages || [],
    [resume?.languages],
  );

  const validateItems = useCallback(() => {
    const errors: Record<string, { name?: string; description?: string }> = {};
    let isValid = true;

    languageItems.forEach((item) => {
      const itemErrors: { name?: string; description?: string } = {};
      if (!item.name.trim()) {
        itemErrors.name = 'Language is required';
        isValid = false;
      }
      if (!item.description.trim()) {
        itemErrors.description = 'Proficiency level is required';
        isValid = false;
      }
      if (Object.keys(itemErrors).length > 0) {
        errors[item.id] = itemErrors;
      }
    });

    setValidationErrors(errors);
    return isValid;
  }, [languageItems]);

  const onSubmit = () => {
    if (!validateItems()) {
      return;
    }
    setValidationErrors({});
    onNext?.();
  };

  const updateLanguageItem = (
    id: string,
    field: keyof Language,
    value: string | null,
  ) => {
    const newItems = languageItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    dispatch(updateResume({ languages: newItems }));
  };

  const addLanguageItem = () => {
    const newItem: Language = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      resumeId: resume?.id || '',
    };
    dispatch(updateResume({ languages: [...languageItems, newItem] }));
  };

  const removeLanguageItem = (id: string) => {
    const newItems = languageItems.filter((item) => item.id !== id);
    dispatch(updateResume({ languages: newItems }));
  };

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = languageItems.findIndex((item) => item.id === active.id);
      const newIndex = languageItems.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(languageItems, oldIndex, newIndex);
      dispatch(updateResume({ languages: newItems }));
    }
    setActiveId(null);
  };

  const activeItem = languageItems.find((item) => item.id === activeId);

  if (!resume) return null;

  return (
    <div className='space-y-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card className={cn('relative gap-0 py-0 shadow-xl')}>
          <CardHeader
            className={`
              border-b border-slate-100 pt-6 pb-5
              dark:border-slate-800
            `}
          >
            <CardTitle className='flex items-center gap-3'>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  'bg-linear-to-br from-green-500 to-emerald-600',
                  'shadow-md shadow-green-500/25',
                )}
              >
                <Languages className='h-5 w-5 text-white' />
              </div>
              <div className='flex flex-col'>
                <span
                  className={`
                    text-lg font-bold text-slate-900
                    dark:text-white
                  `}
                >
                  {'Languages'}
                </span>
                <span
                  className={`
                    text-sm font-normal text-slate-500
                    dark:text-slate-400
                  `}
                >
                  {'List the languages you speak and your fluency'}
                </span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className='space-y-6 p-6'>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className='space-y-3'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-1 w-1 rounded-full bg-green-500' />
                  <Label
                    className={`
                      text-xs font-semibold tracking-wider text-slate-500
                      uppercase
                    `}
                  >
                    {'Languages List'}
                  </Label>
                  {languageItems.length > 0 && (
                    <span
                      className={`
                        rounded-full bg-green-100 px-2 py-0.5 text-xs
                        font-medium text-green-600
                        dark:bg-green-900/30 dark:text-green-400
                      `}
                    >
                      {languageItems.length}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={cn(
                  'rounded-xl border border-slate-200 bg-slate-50/50 p-3',
                  'dark:border-slate-700 dark:bg-slate-800/30',
                )}
              >
                {languageItems.length === 0 ? (
                  <div
                    className={`
                      flex flex-col items-center justify-center py-8 text-center
                    `}
                  >
                    <Languages className='mb-2 h-8 w-8 text-slate-300' />
                    <p className='text-sm font-medium text-slate-500'>
                      {'No languages added yet'}
                    </p>
                    <p className='mt-1 text-xs text-slate-400'>
                      {
                        'Add the languages you speak and your level of proficiency.'
                      }
                    </p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={languageItems.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className='space-y-3'>
                        {languageItems.map((item) => (
                          <SortableLanguageItem
                            key={item.id}
                            item={item}
                            onUpdate={updateLanguageItem}
                            onRemove={removeLanguageItem}
                            errors={validationErrors[item.id]}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeId && activeItem ? (
                        <SortableLanguageItem
                          item={activeItem}
                          onUpdate={updateLanguageItem}
                          onRemove={removeLanguageItem}
                          errors={validationErrors[activeId]}
                        />
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                )}
              </div>

              <Button
                size='sm'
                variant='outline'
                onClick={addLanguageItem}
                className={cn(
                  'h-9 w-full gap-1.5 rounded-lg border-dashed',
                  'border-slate-300 text-slate-600',
                  `
                    hover:border-green-500 hover:bg-green-50
                    hover:text-green-600
                  `,
                  'dark:border-slate-600 dark:text-slate-400',
                )}
                type='button'
              >
                <Plus className='h-3.5 w-3.5' />
                {'Add Language'}
              </Button>
            </motion.div>

            {/* Navigation */}
            {!hideNavigation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
              >
                <BuilderNavigation
                  onBack={onBack}
                  onNext={onSubmit}
                  disableBack={!onBack}
                />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LanguageForm;
