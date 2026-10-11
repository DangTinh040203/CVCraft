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
import { Cpu, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import BuilderNavigation from '@/components/builder-screens/builder-navigation';
import { useSyncResume } from '@/hooks/use-sync-resume';
import { updateResume } from '@/stores/features/resume.slice';
import { useAppDispatch } from '@/stores/store';
import type { Skill } from '@/types/resume.type';

interface SkillsFormProps {
  onNext?: () => void;
  onBack?: () => void;
}

// Sortable skill item component
function SortableSkillItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: Skill;
  onUpdate: (id: string, field: 'label' | 'value', value: string) => void;
  onRemove: (id: string) => void;
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
        'group flex items-center gap-2 rounded-lg bg-white p-2',
        'ring-1 ring-slate-200',
        'hover:ring-slate-300',
        'dark:bg-slate-800 dark:ring-slate-700',
        isDragging && 'relative z-50 opacity-50',
      )}
    >
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

      {/* Skill Name Input */}
      <Input
        value={item.label}
        onChange={(e) => onUpdate(item.id, 'label', e.target.value)}
        placeholder={'Skill name'}
        className={cn(
          `
            h-9 w-52 shrink-0 rounded-md border-0 bg-slate-50 text-sm
            font-medium
          `,
          'focus:bg-white focus:ring-2 focus:ring-emerald-500/20',
          'dark:bg-slate-700',
        )}
      />

      {/* Proficiency Level Input */}
      <Input
        value={item.value}
        onChange={(e) => onUpdate(item.id, 'value', e.target.value)}
        placeholder={'Proficiency level'}
        className={cn(
          'h-9 flex-1 rounded-md border-0 bg-slate-50 text-sm',
          'focus:bg-white focus:ring-2 focus:ring-emerald-500/20',
          'dark:bg-slate-700',
        )}
      />

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
  );
}

const SkillsForm = ({ onNext, onBack }: SkillsFormProps) => {
  const dispatch = useAppDispatch();
  const { resume } = useSyncResume();
  const [isVisible, setIsVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const skillItems = resume?.skills || [];

  const updateSkillItem = (
    id: string,
    field: keyof Skill,
    value: string | number,
  ) => {
    const newItems = skillItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    dispatch(updateResume({ skills: newItems }));
  };

  const addSkillItem = () => {
    const newItem: Skill = {
      id: crypto.randomUUID(),
      label: '',
      value: '',
      resumeId: resume?.id || '',
    };
    dispatch(updateResume({ skills: [...skillItems, newItem] }));
  };

  const removeSkillItem = (id: string) => {
    const newItems = skillItems.filter((item) => item.id !== id);
    dispatch(updateResume({ skills: newItems }));
  };

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = skillItems.findIndex((item) => item.id === active.id);
      const newIndex = skillItems.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(skillItems, oldIndex, newIndex);
      dispatch(updateResume({ skills: newItems }));
    }
    setActiveId(null);
  };

  const activeItem = skillItems.find((item) => item.id === activeId);

  if (!resume) return null;

  return (
    <div className='space-y-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card className={cn('relative gap-0 border py-0 shadow-xl')}>
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
                <Cpu className='h-5 w-5 text-white' />
              </div>
              <div className='flex flex-col'>
                <span
                  className={`
                    text-lg font-bold text-slate-900
                    dark:text-white
                  `}
                >
                  {'Skills'}
                </span>
                <span
                  className={`
                    text-sm font-normal text-slate-500
                    dark:text-slate-400
                  `}
                >
                  {'Highlight the abilities that set you apart'}
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
                  <div className='h-1 w-1 rounded-full bg-emerald-500' />
                  <Label
                    className={`
                      text-xs font-semibold tracking-wider text-slate-500
                      uppercase
                    `}
                  >
                    {'Skills List'}
                  </Label>
                  {skillItems.length > 0 && (
                    <span
                      className={`
                        rounded-full bg-emerald-100 px-2 py-0.5 text-xs
                        font-medium text-emerald-600
                        dark:bg-emerald-900/30 dark:text-emerald-400
                      `}
                    >
                      {skillItems.length}
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
                {skillItems.length === 0 ? (
                  <div
                    className={`
                      flex flex-col items-center justify-center py-8 text-center
                    `}
                  >
                    <Cpu className='mb-2 h-8 w-8 text-slate-300' />
                    <p className='text-sm font-medium text-slate-500'>
                      {'No skills added yet'}
                    </p>
                    <p className='mt-1 text-xs text-slate-400'>
                      {'Add your key skills along with your proficiency level.'}
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
                      items={skillItems.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className={`grid grid-cols-1 gap-3`}>
                        {skillItems.map((item) => (
                          <SortableSkillItem
                            key={item.id}
                            item={item}
                            onUpdate={updateSkillItem}
                            onRemove={removeSkillItem}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeId && activeItem ? (
                        <SortableSkillItem
                          item={activeItem}
                          onUpdate={updateSkillItem}
                          onRemove={removeSkillItem}
                        />
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                )}
              </div>

              <Button
                size='sm'
                variant='outline'
                onClick={addSkillItem}
                className={cn(
                  'h-9 w-full gap-1.5 rounded-lg border-dashed',
                  'border-slate-300 text-slate-600',
                  `
                    hover:border-emerald-500 hover:bg-emerald-50
                    hover:text-emerald-600
                  `,
                  'dark:border-slate-600 dark:text-slate-400',
                )}
                type='button'
              >
                <Plus className='h-3.5 w-3.5' />
                {'Add Skill'}
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
                onNext={() => onNext?.()}
                disableBack={!onBack}
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SkillsForm;
