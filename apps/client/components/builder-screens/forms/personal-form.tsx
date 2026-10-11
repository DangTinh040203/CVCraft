'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
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
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { cn } from '@repo/ui/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { GripVertical, Plus, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import BuilderNavigation from '@/components/builder-screens/builder-navigation';
import { useSyncResume } from '@/hooks/use-sync-resume';
import { updateResume } from '@/stores/features/resume.slice';
import { useAppDispatch } from '@/stores/store';
import type { ResumeInformation } from '@/types/resume.type';

interface PersonalFormProps {
  onNext?: () => void;
  onBack?: () => void;
}

// Sortable item component
function SortableContactItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: ResumeInformation;
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
    transform: CSS.Transform.toString(transform),
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
        isDragging && 'relative z-50 shadow-lg ring-blue-500',
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

      {/* Label Input */}
      <Input
        value={item.label}
        onChange={(e) => onUpdate(item.id, 'label', e.target.value)}
        placeholder={'Label'}
        className={cn(
          `
            h-9 w-32 shrink-0 rounded-md border-0 bg-slate-50 text-sm
            font-medium
          `,
          'focus:bg-white focus:ring-2 focus:ring-blue-500/20',
          'dark:bg-slate-700',
        )}
      />

      {/* Value Input */}
      <Input
        value={item.value}
        onChange={(e) => onUpdate(item.id, 'value', e.target.value)}
        placeholder={'Value'}
        className={cn(
          'h-9 flex-1 rounded-md border-0 bg-slate-50 text-sm',
          'focus:bg-white focus:ring-2 focus:ring-blue-500/20',
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

const PersonalForm = ({ onNext, onBack }: PersonalFormProps) => {
  const dispatch = useAppDispatch();
  const { resume } = useSyncResume();
  const [isVisible, setIsVisible] = useState(false);

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

  const formSchema = z.object({
    title: z.string().optional(),
    subTitle: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resume?.title ?? '',
      subTitle: resume?.subTitle ?? '',
    },
  });

  useEffect(() => {
    if (resume) {
      form.reset({
        title: resume.title,
        subTitle: resume.subTitle,
      });
    }
  }, [form, resume]);

  const onSubmit = () => {
    onNext?.();
  };

  const handleFieldChange = (field: 'title' | 'subTitle', value: string) => {
    dispatch(updateResume({ [field]: value }));
  };

  const contactItems = resume?.information || [];

  const updateContactItem = (
    id: string,
    field: 'label' | 'value',
    value: string,
  ) => {
    const newItems = contactItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    dispatch(updateResume({ information: newItems }));
  };

  const addContactItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      label: '',
      value: '',
      resumeId: resume?.id || '',
    };
    dispatch(updateResume({ information: [...contactItems, newItem] }));
  };

  const removeContactItem = (id: string) => {
    const newItems = contactItems.filter((item) => item.id !== id);
    dispatch(updateResume({ information: newItems }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = contactItems.findIndex((item) => item.id === active.id);
      const newIndex = contactItems.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(contactItems, oldIndex, newIndex);
      dispatch(updateResume({ information: newItems }));
    }
  };

  if (!resume) return null;

  return (
    <div className='space-y-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card className={cn('relative gap-0 overflow-hidden py-0 shadow-xl')}>
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
                  'bg-linear-to-br from-blue-500 to-indigo-600',
                  'shadow-md shadow-blue-500/25',
                )}
              >
                <User className='h-5 w-5 text-white' />
              </div>
              <div className='flex flex-col'>
                <span
                  className={`
                    text-lg font-bold text-slate-900
                    dark:text-white
                  `}
                >
                  {'Personal Information'}
                </span>
                <span
                  className={`
                    text-sm font-normal text-slate-500
                    dark:text-slate-400
                  `}
                >
                  {'Tell us who you are and how to reach you'}
                </span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className='space-y-6 p-6'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                {/* Title & Subtitle Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.1 }}
                >
                  <div className='mb-3 flex items-center gap-2'>
                    <div className='h-1 w-1 rounded-full bg-blue-500' />
                    <span
                      className={`
                        text-xs font-semibold tracking-wider text-slate-500
                        uppercase
                      `}
                    >
                      {'Basic Details'}
                    </span>
                  </div>
                  <div className={`
                    grid gap-4
                    sm:grid-cols-2
                  `}>
                    <FormField
                      control={form.control}
                      name='title'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={`
                              text-sm font-medium text-slate-700
                              dark:text-slate-300
                            `}
                          >
                            {'Full Name'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={'e.g. Jane Doe'}
                              className={cn(
                                'h-11 rounded-lg border-slate-200 bg-slate-50',
                                'transition-all duration-200',
                                'hover:border-slate-300 hover:bg-white',
                                `
                                  focus:border-blue-500 focus:bg-white
                                  focus:ring-2 focus:ring-blue-500/20
                                `,
                                'dark:border-slate-700 dark:bg-slate-800',
                              )}
                              {...field}
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e);
                                handleFieldChange('title', e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='subTitle'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={`
                              text-sm font-medium text-slate-700
                              dark:text-slate-300
                            `}
                          >
                            {'Professional Headline'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={'e.g. Senior Product Designer'}
                              className={cn(
                                'h-11 rounded-lg border-slate-200 bg-slate-50',
                                'transition-all duration-200',
                                'hover:border-slate-300 hover:bg-white',
                                `
                                  focus:border-blue-500 focus:bg-white
                                  focus:ring-2 focus:ring-blue-500/20
                                `,
                                'dark:border-slate-700 dark:bg-slate-800',
                              )}
                              {...field}
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e);
                                handleFieldChange('subTitle', e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>

                {/* Contact Information Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 }}
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
                        {'Contact Information'}
                      </Label>
                      {contactItems.length > 0 && (
                        <span
                          className={`
                            rounded-full bg-slate-100 px-2 py-0.5 text-xs
                            font-medium text-slate-600
                            dark:bg-slate-800 dark:text-slate-400
                          `}
                        >
                          {contactItems.length}
                        </span>
                      )}
                    </div>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={addContactItem}
                      className={cn(
                        'h-8 gap-1.5 rounded-lg border-dashed',
                        'border-slate-300 text-slate-600',
                        `
                          hover:border-blue-500 hover:bg-blue-50
                          hover:text-blue-600
                        `,
                        'dark:border-slate-600 dark:text-slate-400',
                      )}
                      type='button'
                    >
                      <Plus className='h-3.5 w-3.5' />
                      {'Add'}
                    </Button>
                  </div>

                  <div
                    className={cn(
                      'rounded-xl border border-slate-200 bg-slate-50/50 p-3',
                      'dark:border-slate-700 dark:bg-slate-800/30',
                    )}
                  >
                    {contactItems.length === 0 ? (
                      <div
                        className={`
                          flex flex-col items-center justify-center py-8
                          text-center
                        `}
                      >
                        <p className='text-sm font-medium text-slate-500'>
                          {'No contact details yet'}
                        </p>
                        <p className='mt-1 text-xs text-slate-400'>
                          {'Add an email, phone number, or links so recruiters can reach you.'}
                        </p>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={contactItems.map((item) => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <AnimatePresence mode='popLayout'>
                            <div className='space-y-2'>
                              {contactItems.map((item) => (
                                <SortableContactItem
                                  key={item.id}
                                  item={item}
                                  onUpdate={updateContactItem}
                                  onRemove={removeContactItem}
                                />
                              ))}
                            </div>
                          </AnimatePresence>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </motion.div>

                {/* Navigation */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 }}
                >
                  <BuilderNavigation onBack={onBack} disableBack={!onBack} />
                </motion.div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PersonalForm;
