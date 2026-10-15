'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Label } from '@repo/ui/components/label';
import { cn } from '@repo/ui/lib/utils';
import { motion } from 'framer-motion';
import { FileText, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import BuilderNavigation from '@/components/builder-screens/builder-navigation';
import Editor from '@/components/builder-screens/editor';
import { useSyncResume } from '@/hooks/use-sync-resume';
import { updateResume } from '@/stores/features/resume.slice';
import { useAppDispatch } from '@/stores/store';

interface SummaryFormProps {
  onNext?: () => void;
  onBack?: () => void;
}

const SummaryForm = ({ onNext, onBack }: SummaryFormProps) => {
  const dispatch = useAppDispatch();
  const { resume } = useSyncResume();
  const [value, setValue] = useState(resume?.overview || '');
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (resume?.overview) {
      setValue(resume.overview);
    }
  }, [resume?.overview]);

  const handleChange = (content: string) => {
    setValue(content);
    dispatch(updateResume({ overview: content }));
  };

  const handleNext = () => {
    onNext?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className={cn('relative overflow-hidden shadow-xl')}>
        <CardHeader className='relative pb-6'>
          <CardTitle className='flex items-center gap-3 text-xl font-semibold'>
            <div
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-xl',
                `
                  bg-linear-to-br from-purple-500 to-purple-600 shadow-lg
                  shadow-purple-500/25
                `,
                `
                  transition-all duration-300
                  hover:scale-110 hover:shadow-purple-500/40
                `,
                'group',
              )}
            >
              <FileText
                className={`
                  h-5 w-5 text-white transition-transform duration-300
                  group-hover:scale-110
                `}
              />
              <Sparkles
                className={`
                  absolute -top-1 -right-1 h-3 w-3 text-yellow-400 opacity-0
                  transition-opacity duration-300
                  group-hover:opacity-100
                `}
              />
            </div>
            <div className='flex flex-col gap-0.5'>
              <span
                className={`
                  bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text
                  text-transparent
                  dark:from-white dark:to-gray-400
                `}
              >
                {'Professional Summary'}
              </span>
              <span className='text-muted-foreground text-xs font-normal'>
                {'Write a short pitch that captures your experience and goals'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className='relative space-y-6 pb-8'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className='space-y-3'
          >
            <div className='flex items-center justify-between'>
              <Label
                className={cn(
                  `
                    flex items-center gap-2 text-xs font-semibold tracking-wider
                    uppercase
                  `,
                  `
                    text-gray-500 transition-colors duration-300
                    dark:text-gray-400
                  `,
                  isFocused && 'text-purple-600 dark:text-purple-400',
                )}
              >
                <span
                  className={cn(
                    `
                      inline-block h-1.5 w-1.5 rounded-full bg-gray-300
                      transition-all duration-300
                    `,
                    isFocused && 'bg-purple-500 shadow-sm shadow-purple-500/50',
                  )}
                />
                {'Professional Summary'}
              </Label>

              {value && (
                <span className='animate-fade-in text-muted-foreground text-xs'>
                  {(() => {
                    const count = value.replace(/<[^>]*>/g, '').length;
                    return `${count} ${count === 1 ? 'character' : 'characters'}`;
                  })()}
                </span>
              )}
            </div>

            <div
              className={cn(
                'relative rounded-xl transition-all duration-300',
                'ring-2 ring-transparent',
                isFocused &&
                  'shadow-lg shadow-purple-500/10 ring-purple-500/20',
              )}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            >
              <div
                className={cn(
                  `
                    absolute inset-0 rounded-xl bg-linear-to-r
                    from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0
                    transition-opacity duration-300
                  `,
                  isFocused && 'opacity-100',
                )}
              />
              <Editor
                value={value}
                onChange={handleChange}
                placeholder={
                  'Summarize your background, key strengths, and what you bring to a role...'
                }
              />
            </div>

            <div
              className={cn(
                `
                  flex items-start gap-2 rounded-lg bg-linear-to-r from-amber-50
                  to-orange-50 p-3
                  dark:from-amber-950/30 dark:to-orange-950/30
                `,
                `
                  border border-amber-200/50
                  dark:border-amber-800/30
                `,
                'transition-all delay-200 duration-500',
              )}
            >
              <span className='mt-0.5 text-amber-500'>💡</span>
              <p
                className={`
                  text-xs leading-relaxed text-amber-700
                  dark:text-amber-300
                `}
              >
                <span className='font-medium'>{'Pro tip:'}</span>{' '}
                {
                  'Keep it to 3-5 sentences and lead with your strongest achievements.'
                }
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <BuilderNavigation
              onBack={onBack}
              onNext={handleNext}
              disableBack={!onBack}
              disableNext={!onNext}
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SummaryForm;
