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
import { cn } from '@repo/ui/lib/utils';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Briefcase,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import BuilderNavigation from '@/components/builder-screens/builder-navigation';
import Editor from '@/components/builder-screens/editor';
import { useSyncResume } from '@/hooks/use-sync-resume';
import { updateResume } from '@/stores/features/resume.slice';
import { useAppDispatch } from '@/stores/store';
import type { WorkExperience } from '@/types/resume.type';

const safeDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

interface ExperienceFormProps {
  onNext?: () => void;
  onBack?: () => void;
}

// Sortable experience item component
function SortableExperienceItem({
  item,
  onUpdate,
  onRemove,
  errors,
}: {
  item: WorkExperience;
  onUpdate: (
    id: string,
    field: keyof WorkExperience,
    value: string | null,
  ) => void;
  onRemove: (id: string) => void;
  errors?: { company?: string; position?: string };
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

  // Local state avoids the Redux dispatch → re-render → quill onChange → dispatch loop
  const [description, setDescription] = useState(item.description);

  // Keep in sync if item is replaced externally (e.g. drag-and-drop reorder)
  useEffect(() => {
    setDescription(item.description);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on item swap
  }, [item.id]);

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

      <div className='grid gap-3'>
        <div className={`
          grid gap-3
          sm:grid-cols-2
        `}>
          <div className='space-y-1'>
            <Input
              value={item.company}
              onChange={(e) => onUpdate(item.id, 'company', e.target.value)}
              placeholder={'Company name'}
              className={cn(
                'h-10 rounded-lg border-slate-200 bg-slate-50 text-sm',
                'focus:bg-white focus:ring-2 focus:ring-orange-500/20',
                'dark:border-slate-700 dark:bg-slate-700',
                errors?.company && 'border-red-400 focus:ring-red-500/20',
              )}
            />
            {errors?.company && (
              <p className='flex items-center gap-1 text-xs text-red-500'>
                <AlertCircle className='h-3 w-3' />
                {errors.company}
              </p>
            )}
          </div>
          <div className='space-y-1'>
            <Input
              value={item.position}
              onChange={(e) => onUpdate(item.id, 'position', e.target.value)}
              placeholder={'Job title'}
              className={cn(
                'h-10 rounded-lg border-slate-200 bg-slate-50 text-sm',
                'focus:bg-white focus:ring-2 focus:ring-orange-500/20',
                'dark:border-slate-700 dark:bg-slate-700',
                errors?.position && 'border-red-400 focus:ring-red-500/20',
              )}
            />
            {errors?.position && (
              <p className='flex items-center gap-1 text-xs text-red-500'>
                <AlertCircle className='h-3 w-3' />
                {errors.position}
              </p>
            )}
          </div>
        </div>
        <div className={`
          grid gap-3
          sm:grid-cols-2
        `}>
          <div>
            <Label className='mb-1.5 block text-xs text-slate-500'>
              {'Start date'}
            </Label>
            <DatePicker
              date={safeDate(item.startDate)}
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
              date={safeDate(item.endDate)}
              setDate={(date) =>
                onUpdate(item.id, 'endDate', date ? date.toISOString() : null)
              }
              placeholder={'Present'}
            />
          </div>
        </div>
        <div>
          <Label className='mb-1.5 block text-xs text-slate-500'>
            {'Description & Achievements'}
          </Label>
          <Editor
            className='[&_.ql-editor]:min-h-[100px]'
            value={description}
            onChange={setDescription}
            onBlur={() => onUpdate(item.id, 'description', description)}
          />
        </div>
      </div>
    </div>
  );
}

const ExperienceForm = ({ onNext, onBack }: ExperienceFormProps) => {
  const dispatch = useAppDispatch();
  const { resume } = useSyncResume();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, { company?: string; position?: string }>
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

  const experienceItems = resume?.workExperiences || [];

  const validateItems = () => {
    const errors: Record<string, { company?: string; position?: string }> = {};
    let isValid = true;

    experienceItems.forEach((item) => {
      const itemErrors: { company?: string; position?: string } = {};
      if (!item.company.trim()) {
        itemErrors.company = 'Company name is required';
        isValid = false;
      }
      if (!item.position.trim()) {
        itemErrors.position = 'Job title is required';
        isValid = false;
      }
      if (Object.keys(itemErrors).length > 0) {
        errors[item.id] = itemErrors;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const onSubmit = () => {
    if (!validateItems()) {
      return;
    }
    setValidationErrors({});
    onNext?.();
  };

  const updateExperienceItem = (
    id: string,
    field: keyof WorkExperience,
    value: string | null,
  ) => {
    const newItems = experienceItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    dispatch(updateResume({ workExperiences: newItems }));
  };

  const addExperienceItem = () => {
    const newItem: WorkExperience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      description: '',
      startDate: new Date().toISOString(),
      endDate: null,
      resumeId: resume?.id || '',
    };
    dispatch(updateResume({ workExperiences: [...experienceItems, newItem] }));
  };

  const removeExperienceItem = (id: string) => {
    const newItems = experienceItems.filter((item) => item.id !== id);
    dispatch(updateResume({ workExperiences: newItems }));
  };

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = experienceItems.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = experienceItems.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(experienceItems, oldIndex, newIndex);
      dispatch(updateResume({ workExperiences: newItems }));
    }
    setActiveId(null);
  };

  const activeItem = experienceItems.find((item) => item.id === activeId);

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
                <Briefcase className='h-5 w-5 text-white' />
              </div>
              <div className='flex flex-col'>
                <span
                  className={`
                    text-lg font-bold text-slate-900
                    dark:text-white
                  `}
                >
                  {'Work Experience'}
                </span>
                <span
                  className={`
                    text-sm font-normal text-slate-500
                    dark:text-slate-400
                  `}
                >
                  {'Showcase your roles and the impact you made'}
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
                  <div className='h-1 w-1 rounded-full bg-orange-500' />
                  <Label
                    className={`
                      text-xs font-semibold tracking-wider text-slate-500
                      uppercase
                    `}
                  >
                    {'Experience History'}
                  </Label>
                  {experienceItems.length > 0 && (
                    <span
                      className={`
                        rounded-full bg-orange-100 px-2 py-0.5 text-xs
                        font-medium text-orange-600
                        dark:bg-orange-900/30 dark:text-orange-400
                      `}
                    >
                      {experienceItems.length}
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
                {experienceItems.length === 0 ? (
                  <div
                    className={`
                      flex flex-col items-center justify-center py-8 text-center
                    `}
                  >
                    <Briefcase className='mb-2 h-8 w-8 text-slate-300' />
                    <p className='text-sm font-medium text-slate-500'>
                      {'No work experience yet'}
                    </p>
                    <p className='mt-1 text-xs text-slate-400'>
                      {'Add your roles to highlight your career history and achievements.'}
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
                      items={experienceItems.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className='space-y-3'>
                        {experienceItems.map((item) => (
                          <SortableExperienceItem
                            key={item.id}
                            item={item}
                            onUpdate={updateExperienceItem}
                            onRemove={removeExperienceItem}
                            errors={validationErrors[item.id]}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeId && activeItem ? (
                        <SortableExperienceItem
                          item={activeItem}
                          onUpdate={updateExperienceItem}
                          onRemove={removeExperienceItem}
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
                onClick={addExperienceItem}
                className={cn(
                  'h-9 w-full gap-1.5 rounded-lg border-dashed',
                  'border-slate-300 text-slate-600',
                  `
                    hover:border-orange-500 hover:bg-orange-50
                    hover:text-orange-600
                  `,
                  'dark:border-slate-600 dark:text-slate-400',
                )}
                type='button'
              >
                <Plus className='h-3.5 w-3.5' />
                {'Add Experience'}
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

export default ExperienceForm;
