'use client';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { m } from 'framer-motion';
import { PenLine, Upload } from 'lucide-react';
import React, { useRef } from 'react';

// The last step repeats the first, so the ticker loops without a jump
const LOADING_STEPS = [
  'Reading your resume...',
  'Extracting your experience...',
  'Organizing your details...',
  'Almost there...',
  'Reading your resume...',
];

interface TemplateSelectionDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: 'upload' | 'scratch', file?: File) => void;
}

export const TemplateSelectionDialog = ({
  isOpen,
  isLoading = false,
  onOpenChange,
  onSelect,
}: TemplateSelectionDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleScratchClick = () => {
    onSelect('scratch');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so the same file can be picked again after a failed import
    e.target.value = '';
    if (file) {
      onSelect('upload', file);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className={`
            w-[90vw] overflow-hidden rounded-xl
            sm:max-w-4xl
          `}
        >
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DialogHeader className='text-center'>
              <DialogTitle className='text-2xl font-bold'>
                Let&apos;s Build Your Resume
              </DialogTitle>
              <DialogDescription className='text-lg'>
                How would you like to get started?
              </DialogDescription>
            </DialogHeader>
          </m.div>

          {isLoading ? (
            <div
              className={`
                flex min-h-[400px] flex-col items-center justify-center py-8
              `}
            >
              <div className='relative mb-8 h-32 w-32'>
                {/* Glowing background effect */}
                <m.div
                  className={`
                    absolute inset-0 rounded-full bg-blue-500/20 blur-2xl
                  `}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                <div
                  className={`
                    relative flex h-full w-full items-center justify-center
                  `}
                >
                  <m.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                      relative flex h-24 w-20 items-center justify-center
                      rounded-xl border border-white/10 bg-white/5
                      backdrop-blur-sm
                    `}
                  >
                    <Upload className='text-primary/50 h-10 w-10' />

                    {/* Scanning Line */}
                    <m.div
                      className={`
                        absolute right-0 left-0 h-[2px] bg-linear-to-r
                        from-transparent via-blue-500 to-transparent
                        shadow-[0_0_15px_rgba(59,130,246,0.5)]
                      `}
                      animate={{
                        top: ['10%', '90%', '10%'],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </m.div>
                </div>

                {/* Orbiting particles */}
                {[0, 1, 2].map((i) => (
                  <m.div
                    key={i}
                    className={`
                      absolute top-1/2 left-1/2 h-[120%] w-[120%]
                      -translate-x-1/2 -translate-y-1/2 rounded-full border
                      border-blue-500/10
                    `}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8 - i * 2,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: i * 0.5,
                    }}
                  >
                    <m.div
                      className={`
                        absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2
                        rounded-full bg-blue-400
                      `}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </m.div>
                ))}
              </div>

              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='space-y-4 text-center'
              >
                <div className='relative h-8 overflow-hidden'>
                  <m.div
                    animate={{
                      y: [0, 0, -32, -32, -64, -64, -96, -96, -128],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      times: [0, 0.2, 0.25, 0.45, 0.5, 0.7, 0.75, 0.95, 1],
                    }}
                    className='flex flex-col items-center'
                  >
                    {LOADING_STEPS.map((text, i) => (
                      <h3
                        key={i}
                        className={`
                          h-8 bg-linear-to-r from-blue-400 to-purple-400
                          bg-clip-text text-xl font-bold text-transparent
                        `}
                      >
                        {text}
                      </h3>
                    ))}
                  </m.div>
                </div>

                <p
                  className={`
                    text-muted-foreground mx-auto max-w-[300px] text-sm
                  `}
                >
                  This usually takes just a few seconds. Hang tight while we
                  work our magic.
                </p>
              </m.div>
            </div>
          ) : (
            <div
              className={`
                grid grid-cols-1 gap-6 py-8
                md:grid-cols-2
              `}
            >
              <div>
                <Card
                  className={`
                    hover:border-primary hover:bg-muted/50
                    cursor-pointer transition-all
                  `}
                  onClick={handleUploadClick}
                >
                  <CardContent
                    className={`
                      flex flex-col items-center justify-center gap-4
                      text-center
                      lg:p-8
                    `}
                  >
                    <div
                      className={`
                        bg-primary/10 flex h-16 w-16 items-center justify-center
                        rounded-full
                      `}
                    >
                      <Upload className='text-primary h-8 w-8' />
                    </div>
                    <div className='space-y-2'>
                      <CardTitle>Upload a Resume</CardTitle>
                      <CardDescription>
                        Upload an existing PDF resume and let AI fill in your
                        details automatically.
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card
                  className={`
                    hover:border-primary hover:bg-muted/50
                    cursor-pointer transition-all
                  `}
                  onClick={handleScratchClick}
                >
                  <CardContent
                    className={`
                      flex flex-col items-center justify-center gap-4
                      text-center
                      lg:p-8
                    `}
                  >
                    <div
                      className={`
                        bg-primary/10 flex h-16 w-16 items-center justify-center
                        rounded-full
                      `}
                    >
                      <PenLine className='text-primary h-8 w-8' />
                    </div>
                    <div className='space-y-2'>
                      <CardTitle>Start from Scratch</CardTitle>
                      <CardDescription>
                        Begin with a blank resume and fill in your details step
                        by step.
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <DialogFooter className='flex items-center justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept='.pdf'
        onChange={handleFileChange}
      />
    </>
  );
};
