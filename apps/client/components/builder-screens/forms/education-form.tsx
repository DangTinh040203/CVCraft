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
import { DatePicker } from '@repo/ui/components/date-picker';
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
  GraduationCap,
  GripVertical,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import BuilderNavigation from '@/components/builder-screens/builder-navigation';
import { parseResumeDate } from '@/components/templates/resume.types';
import { useSyncResume } from '@/hooks/use-sync-resume';
import { updateResume } from '@/stores/features/resume.slice';
import { useAppDispatch } from '@/stores/store';
import type { Education } from '@/types/resume.type';

interface EducationFormProps {
  onNext?: () => void;
  onBack?: () => void;
}

const DEGREE_OPTIONS = [
  { value: 'High School Diploma', labelKey: 'High School Diploma' },
  { value: 'GED', labelKey: 'GED' },
  { value: 'Associate of Arts', labelKey: 'Associate of Arts' },
  {
    value: 'Associate of Science',
    labelKey: 'Associate of Science',
  },
  {
    value: 'Associate of Applied Science',
    labelKey: 'Associate of Applied Science',
  },
  { value: 'Bachelor of Arts', labelKey: 'Bachelor of Arts' },
  {
    value: 'Bachelor of Science',
    labelKey: 'Bachelor of Science',
  },
  { value: 'BBA', labelKey: 'BBA' },
  { value: 'Master of Arts', labelKey: 'Master of Arts' },
  { value: 'Master of Science', labelKey: 'Master of Science' },
  { value: 'MBA', labelKey: 'MBA' },
  { value: 'J.D.', labelKey: 'J.D.' },
  { value: 'M.D.', labelKey: 'M.D.' },
  { value: 'Ph.D', labelKey: 'Ph.D' },
  { value: 'No Degree', labelKey: 'No Degree' },
];
const DEGREE_VALUES = DEGREE_OPTIONS.map((option) => option.value);

// Sortable education item component
function SortableEducationItem({
  item,
  onUpdate,
  onRemove,
  errors,
}: {
  item: Education;
  onUpdate: (id: string, field: keyof Education, value: string | null) => void;
  onRemove: (id: string) => void;
  errors?: { school?: string; degree?: string };
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const [isCustomDegree, setIsCustomDegree] = useState(
    !!item.degree && !DEGREE_VALUES.includes(item.degree),
  );

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
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          aria-label='Drag to reorder'
          className={cn(
            'text-muted-foreground cursor-grab touch-none',
            'hover:bg-muted hover:text-foreground',
            isDragging && 'cursor-grabbing',
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical className='h-4 w-4' />
        </Button>

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

      <div className='grid gap-3'>
        <div
          className={`
            grid gap-3
            sm:grid-cols-2
          `}
        >
          <div className='space-y-1'>
            <Input
              value={item.school}
              onChange={(e) => onUpdate(item.id, 'school', e.target.value)}
              placeholder={'School or university'}
              className={cn(
                'h-10 rounded-lg border-slate-200 bg-slate-50 text-sm',
                'focus:bg-white focus:ring-2 focus:ring-violet-500/20',
                'dark:border-slate-700 dark:bg-slate-700',
                errors?.school && 'border-red-400 focus:ring-red-500/20',
              )}
            />
            {errors?.school && (
              <p className='flex items-center gap-1 text-xs text-red-500'>
                <AlertCircle className='h-3 w-3' />
                {errors.school}
              </p>
            )}
          </div>
          <div className='space-y-1'>
            {isCustomDegree ? (
              <div className='relative'>
                <Input
                  value={item.degree}
                  onChange={(e) => onUpdate(item.id, 'degree', e.target.value)}
                  placeholder={'Select a degree'}
                  className={cn(
                    'h-10 rounded-lg border-slate-200 bg-slate-50 text-sm',
                    'focus:bg-white focus:ring-2 focus:ring-violet-500/20',
                    'dark:border-slate-700 dark:bg-slate-700',
                    errors?.degree && 'border-red-400 focus:ring-red-500/20',
                  )}
                />
                <Button
                  variant='ghost'
                  size='icon'
                  className={`
                    absolute top-1 right-1 h-8 w-8 text-slate-400
                    hover:text-slate-600
                    dark:hover:text-slate-300
                  `}
                  onClick={() => {
                    setIsCustomDegree(false);
                    onUpdate(item.id, 'degree', '');
                  }}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            ) : (
              <Select
                value={DEGREE_VALUES.includes(item.degree) ? item.degree : ''}
                onValueChange={(value) => {
                  if (value === 'custom_degree_option') {
                    setIsCustomDegree(true);
                    onUpdate(item.id, 'degree', '');
                  } else {
                    onUpdate(item.id, 'degree', value);
                  }
                }}
              >
                <SelectTrigger
                  className={cn(
                    `
                      h-10 w-full rounded-lg border-slate-200 bg-slate-50
                      text-sm
                    `,
                    'focus:bg-white focus:ring-2 focus:ring-violet-500/20',
                    'dark:border-slate-700 dark:bg-slate-700',
                    errors?.degree && 'border-red-400 focus:ring-red-500/20',
                  )}
                >
                  <SelectValue placeholder={'Select a degree'} />
                </SelectTrigger>
                <SelectContent>
                  {DEGREE_OPTIONS.map((degree) => (
                    <SelectItem key={degree.value} value={degree.value}>
                      {degree.labelKey}
                    </SelectItem>
                  ))}
                  <SelectItem value='custom_degree_option'>
                    {'Add custom degree'}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            {errors?.degree && (
              <p className='flex items-center gap-1 text-xs text-red-500'>
                <AlertCircle className='h-3 w-3' />
                {errors.degree}
              </p>
            )}
          </div>
        </div>
        <Input
          value={item.major}
          onChange={(e) => onUpdate(item.id, 'major', e.target.value)}
          placeholder={'Field of study'}
          className={cn(
            'h-10 rounded-lg border-slate-200 bg-slate-50 text-sm',
            'focus:bg-white focus:ring-2 focus:ring-violet-500/20',
            'dark:border-slate-700 dark:bg-slate-700',
          )}
        />
        <div
          className={`
            grid gap-3
            sm:grid-cols-2
          `}
        >
          <div>
            <Label className='mb-1.5 block text-xs text-slate-500'>
              {'Start date'}
            </Label>
            <DatePicker
              date={parseResumeDate(item.startDate)}
              setDate={(date) =>
                onUpdate(
                  item.id,
                  'startDate',
                  date ? date.toISOString() : new Date().toISOString(),
                )
              }
            />
          </div>
          <div>
            <Label className='mb-1.5 block text-xs text-slate-500'>
              {'End date'}
            </Label>
            <DatePicker
              date={parseResumeDate(item.endDate)}
              setDate={(date) =>
                onUpdate(item.id, 'endDate', date ? date.toISOString() : null)
              }
              placeholder={'Present'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const EducationForm = ({ onNext, onBack }: EducationFormProps) => {
  const dispatch = useAppDispatch();
  const { resume } = useSyncResume();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, { school?: string; degree?: string }>
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

  const educationItems = useMemo(
    () => resume?.educations || [],
    [resume?.educations],
  );

  const validateItems = useCallback(() => {
    const errors: Record<string, { school?: string; degree?: string }> = {};
    let isValid = true;

    educationItems.forEach((item) => {
      const itemErrors: { school?: string; degree?: string } = {};
      if (!item.school.trim()) {
        itemErrors.school = 'School name is required';
        isValid = false;
      }
      if (!item.degree.trim()) {
        itemErrors.degree = 'Degree is required';
        isValid = false;
      }
      if (Object.keys(itemErrors).length > 0) {
        errors[item.id] = itemErrors;
      }
    });

    setValidationErrors(errors);
    return isValid;
  }, [educationItems]);

  const onSubmit = () => {
    if (!validateItems()) {
      return;
    }
    setValidationErrors({});
    onNext?.();
  };

  const updateEducationItem = (
    id: string,
    field: keyof Education,
    value: string | null,
  ) => {
    const newItems = educationItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    dispatch(updateResume({ educations: newItems }));
  };

  const addEducationItem = () => {
    const newItem: Education = {
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      major: '',
      startDate: new Date().toISOString(),
      endDate: null,
      resumeId: resume?.id || '',
    };
    dispatch(updateResume({ educations: [...educationItems, newItem] }));
  };

  const removeEducationItem = (id: string) => {
    const newItems = educationItems.filter((item) => item.id !== id);
    dispatch(updateResume({ educations: newItems }));
  };

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = educationItems.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = educationItems.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(educationItems, oldIndex, newIndex);
      dispatch(updateResume({ educations: newItems }));
    }
    setActiveId(null);
  };

  const activeItem = educationItems.find((item) => item.id === activeId);

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
                  'bg-linear-to-br from-violet-500 to-purple-600',
                  'shadow-md shadow-violet-500/25',
                )}
              >
                <GraduationCap className='h-5 w-5 text-white' />
              </div>
              <div className='flex flex-col'>
                <span
                  className={`
                    text-lg font-bold text-slate-900
                    dark:text-white
                  `}
                >
                  {'Education'}
                </span>
                <span
                  className={`
                    text-sm font-normal text-slate-500
                    dark:text-slate-400
                  `}
                >
                  {'List your degrees, schools, and fields of study'}
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
                  <div className='h-1 w-1 rounded-full bg-violet-500' />
                  <Label
                    className={`
                      text-xs font-semibold tracking-wider text-slate-500
                      uppercase
                    `}
                  >
                    {'Education History'}
                  </Label>
                  {educationItems.length > 0 && (
                    <span
                      className={`
                        rounded-full bg-violet-100 px-2 py-0.5 text-xs
                        font-medium text-violet-600
                        dark:bg-violet-900/30 dark:text-violet-400
                      `}
                    >
                      {educationItems.length}
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
                {educationItems.length === 0 ? (
                  <div
                    className={`
                      flex flex-col items-center justify-center py-8 text-center
                    `}
                  >
                    <GraduationCap className='mb-2 h-8 w-8 text-slate-300' />
                    <p className='text-sm font-medium text-slate-500'>
                      {'No education added yet'}
                    </p>
                    <p className='mt-1 text-xs text-slate-400'>
                      {
                        'Add your schools and degrees to round out your profile.'
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
                      items={educationItems.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className='space-y-3'>
                        {educationItems.map((item) => (
                          <SortableEducationItem
                            key={item.id}
                            item={item}
                            onUpdate={updateEducationItem}
                            onRemove={removeEducationItem}
                            errors={validationErrors[item.id]}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeId && activeItem ? (
                        <SortableEducationItem
                          item={activeItem}
                          onUpdate={updateEducationItem}
                          onRemove={removeEducationItem}
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
                onClick={addEducationItem}
                className={cn(
                  'h-9 w-full gap-1.5 rounded-lg border-dashed',
                  'border-slate-300 text-slate-600',
                  `
                    hover:border-violet-500 hover:bg-violet-50
                    hover:text-violet-600
                  `,
                  'dark:border-slate-600 dark:text-slate-400',
                )}
                type='button'
              >
                <Plus className='h-3.5 w-3.5' />
                {'Add Education'}
              </Button>
            </motion.div>

            {/* Navigation */}
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EducationForm;
