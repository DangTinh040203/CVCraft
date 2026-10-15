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
import { cn } from '@repo/ui/lib/utils';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  FolderGit2,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import BuilderNavigation from '@/components/builder-screens/builder-navigation';
import Editor from '@/components/builder-screens/editor';
import { useSyncResume } from '@/hooks/use-sync-resume';
import { updateResume } from '@/stores/features/resume.slice';
import { useAppDispatch } from '@/stores/store';
import type { Project } from '@/types/resume.type';

interface ProjectsFormProps {
  onNext?: () => void;
  onBack?: () => void;
}

// Sortable project item component
function SortableProjectItem({
  item,
  onUpdate,
  onRemove,
  errors,
}: {
  item: Project;
  onUpdate: (id: string, field: keyof Project, value: string) => void;
  onRemove: (id: string) => void;
  errors?: { title?: string };
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

  // Local state to avoid Redux dispatch → re-render → quill onChange → dispatch loop
  const [details, setDetails] = useState(item.details);
  const [responsibilities, setResponsibilities] = useState(
    item.responsibilities,
  );

  // Reset when the item is swapped (e.g. drag-and-drop reorder)
  useEffect(() => {
    setDetails(item.details);
    setResponsibilities(item.responsibilities);
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
        <div
          className={`
          grid gap-3
          sm:grid-cols-2
        `}
        >
          <div className='space-y-1'>
            <Input
              value={item.title}
              onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
              placeholder={'Project name'}
              className={cn(
                'h-10 rounded-lg border-slate-200 bg-slate-50 text-sm',
                'focus:bg-white focus:ring-2 focus:ring-cyan-500/20',
                'dark:border-slate-700 dark:bg-slate-700',
                errors?.title && 'border-red-400 focus:ring-red-500/20',
              )}
            />
            {errors?.title && (
              <p className='flex items-center gap-1 text-xs text-red-500'>
                <AlertCircle className='h-3 w-3' />
                {errors.title}
              </p>
            )}
          </div>
          <Input
            value={item.subTitle}
            onChange={(e) => onUpdate(item.id, 'subTitle', e.target.value)}
            placeholder={'Subtitle or tagline'}
            className={cn(
              'h-10 rounded-lg border-slate-200 bg-slate-50 text-sm',
              'focus:bg-white focus:ring-2 focus:ring-cyan-500/20',
              'dark:border-slate-700 dark:bg-slate-700',
            )}
          />
        </div>

        <div
          className={`
          grid gap-3
          sm:grid-cols-2
        `}
        >
          <Input
            value={item.position}
            onChange={(e) => onUpdate(item.id, 'position', e.target.value)}
            placeholder={'Your role'}
            className={cn(
              'h-10 rounded-lg border-slate-200 bg-slate-50 text-sm',
              'focus:bg-white focus:ring-2 focus:ring-cyan-500/20',
              'dark:border-slate-700 dark:bg-slate-700',
            )}
          />
          <Input
            value={item.domain}
            onChange={(e) => onUpdate(item.id, 'domain', e.target.value)}
            placeholder={'Domain or industry'}
            className={cn(
              'h-10 rounded-lg border-slate-200 bg-slate-50 text-sm',
              'focus:bg-white focus:ring-2 focus:ring-cyan-500/20',
              'dark:border-slate-700 dark:bg-slate-700',
            )}
          />
        </div>

        <Input
          value={item.technologies}
          onChange={(e) => onUpdate(item.id, 'technologies', e.target.value)}
          placeholder={'Technologies used'}
          className={cn(
            'h-10 rounded-lg border-slate-200 bg-slate-50 text-sm',
            'focus:bg-white focus:ring-2 focus:ring-cyan-500/20',
            'dark:border-slate-700 dark:bg-slate-700',
          )}
        />

        <Input
          value={item.demo || ''}
          onChange={(e) => onUpdate(item.id, 'demo', e.target.value)}
          placeholder={'Demo or live URL'}
          className={cn(
            'h-10 rounded-lg border-slate-200 bg-slate-50 text-sm',
            'focus:bg-white focus:ring-2 focus:ring-cyan-500/20',
            'dark:border-slate-700 dark:bg-slate-700',
          )}
        />

        <div>
          <Label className='mb-1.5 block text-xs text-slate-500'>
            {'Description'}
          </Label>
          <Editor
            className='[&_.ql-editor]:min-h-[100px]'
            value={details}
            onChange={setDetails}
            onBlur={() => onUpdate(item.id, 'details', details)}
          />
        </div>

        <div>
          <Label className='mb-1.5 block text-xs text-slate-500'>
            {'Responsibilities'}
          </Label>
          <Editor
            className='[&_.ql-editor]:min-h-[100px]'
            value={responsibilities}
            onChange={setResponsibilities}
            onBlur={() =>
              onUpdate(item.id, 'responsibilities', responsibilities)
            }
          />
        </div>
      </div>
    </div>
  );
}

const ProjectsForm = ({ onNext, onBack }: ProjectsFormProps) => {
  const dispatch = useAppDispatch();
  const { resume } = useSyncResume();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, { title?: string }>
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

  const projectItems = useMemo(
    () => resume?.projects || [],
    [resume?.projects],
  );

  const validateItems = useCallback(() => {
    const errors: Record<string, { title?: string }> = {};
    let isValid = true;

    projectItems.forEach((item) => {
      if (!item.title.trim()) {
        errors[item.id] = { title: 'Project name is required' };
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  }, [projectItems]);

  const onSubmit = () => {
    if (!validateItems()) {
      return;
    }
    setValidationErrors({});
    onNext?.();
  };

  const updateProjectItem = (
    id: string,
    field: keyof Project,
    value: string,
  ) => {
    const newItems = projectItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    dispatch(updateResume({ projects: newItems }));
  };

  const addProjectItem = () => {
    const newItem: Project = {
      id: crypto.randomUUID(),
      title: '',
      subTitle: '',
      details: '',
      technologies: '',
      position: '',
      responsibilities: '',
      domain: '',
      demo: '',
      resumeId: resume?.id || '',
    };
    dispatch(updateResume({ projects: [...projectItems, newItem] }));
  };

  const removeProjectItem = (id: string) => {
    const newItems = projectItems.filter((item) => item.id !== id);
    dispatch(updateResume({ projects: newItems }));
  };

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projectItems.findIndex((item) => item.id === active.id);
      const newIndex = projectItems.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(projectItems, oldIndex, newIndex);
      dispatch(updateResume({ projects: newItems }));
    }
    setActiveId(null);
  };

  const activeItem = projectItems.find((item) => item.id === activeId);

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
                <FolderGit2 className='h-5 w-5 text-white' />
              </div>
              <div className='flex flex-col'>
                <span
                  className={`
                    text-lg font-bold text-slate-900
                    dark:text-white
                  `}
                >
                  {'Projects'}
                </span>
                <span
                  className={`
                    text-sm font-normal text-slate-500
                    dark:text-slate-400
                  `}
                >
                  {"Highlight the work you're most proud of"}
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
                  <div className='h-1 w-1 rounded-full bg-cyan-500' />
                  <Label
                    className={`
                      text-xs font-semibold tracking-wider text-slate-500
                      uppercase
                    `}
                  >
                    {'Projects List'}
                  </Label>
                  {projectItems.length > 0 && (
                    <span
                      className={`
                        rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium
                        text-cyan-600
                        dark:bg-cyan-900/30 dark:text-cyan-400
                      `}
                    >
                      {projectItems.length}
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
                {projectItems.length === 0 ? (
                  <div
                    className={`
                      flex flex-col items-center justify-center py-8 text-center
                    `}
                  >
                    <FolderGit2 className='mb-2 h-8 w-8 text-slate-300' />
                    <p className='text-sm font-medium text-slate-500'>
                      {'No projects added yet'}
                    </p>
                    <p className='mt-1 text-xs text-slate-400'>
                      {'Add projects to demonstrate your hands-on experience.'}
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
                      items={projectItems.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className='space-y-3'>
                        {projectItems.map((item) => (
                          <SortableProjectItem
                            key={item.id}
                            item={item}
                            onUpdate={updateProjectItem}
                            onRemove={removeProjectItem}
                            errors={validationErrors[item.id]}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeId && activeItem ? (
                        <SortableProjectItem
                          item={activeItem}
                          onUpdate={updateProjectItem}
                          onRemove={removeProjectItem}
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
                onClick={addProjectItem}
                className={cn(
                  'h-9 w-full gap-1.5 rounded-lg border-dashed',
                  'border-slate-300 text-slate-600',
                  `hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-600`,
                  'dark:border-slate-600 dark:text-slate-400',
                )}
                type='button'
              >
                <Plus className='h-3.5 w-3.5' />
                {'Add Project'}
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

export default ProjectsForm;
