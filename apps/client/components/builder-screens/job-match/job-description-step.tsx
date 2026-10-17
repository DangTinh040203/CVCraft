'use client';

import { Button } from '@repo/ui/components/button';
import { Textarea } from '@repo/ui/components/textarea';
import { cn } from '@repo/ui/lib/utils';
import { FileText, FileUp, Info, Loader2 } from 'lucide-react';
import { useRef } from 'react';

import { JD_MAX_LENGTH, JD_MIN_LENGTH } from '@/hooks/use-job-match';

interface JobDescriptionStepProps {
  value: string;
  onChange: (value: string) => void;
  onPdf: (file: File) => void;
  reading: boolean;
  /** The PDF the text was read from, until the user edits it. */
  sourceFile: string | null;
}

/** Paste the posting, or read it from a PDF into the same box to review. */
export function JobDescriptionStep({
  value,
  onChange,
  onPdf,
  reading,
  sourceFile,
}: JobDescriptionStepProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const length = value.trim().length;
  const tooShort = length > 0 && length < JD_MIN_LENGTH;

  return (
    <div className='space-y-4'>
      <div className='flex items-end justify-between gap-3'>
        <label htmlFor='job-description' className='text-sm font-semibold'>
          Job description
        </label>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-1.5'
          disabled={reading}
          onClick={() => fileRef.current?.click()}
        >
          {reading ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <FileUp className='size-3.5' />
          )}
          {reading ? 'Reading…' : 'Upload PDF'}
        </Button>
        <input
          ref={fileRef}
          type='file'
          accept='.pdf,application/pdf'
          className='hidden'
          onChange={(event) => {
            const file = event.target.files?.[0];
            // Reset so the same file can be picked again
            event.target.value = '';
            if (file) onPdf(file);
          }}
        />
      </div>

      <div className='space-y-1.5'>
        <Textarea
          id='job-description'
          value={value}
          maxLength={JD_MAX_LENGTH}
          disabled={reading}
          aria-invalid={tooShort || undefined}
          aria-describedby='job-description-hint'
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            'Paste the full job posting here: the role, responsibilities and requirements.\n\nTip: the more complete it is, the more useful the analysis.'
          }
          className={`
            field-sizing-fixed h-[min(46vh,420px)] resize-none rounded-xl px-4
            py-3 leading-relaxed
          `}
        />
        {/* Below the box rather than over it, where long text would run
            under it */}
        <div
          id='job-description-hint'
          className='flex items-center justify-between gap-3 text-xs'
        >
          <span className={`
            text-muted-foreground flex min-w-0 items-center gap-1.5
          `}>
            {sourceFile && (
              <>
                <FileText className='size-3.5 shrink-0' />
                <span className='truncate'>
                  From {sourceFile}. Review it before analyzing.
                </span>
              </>
            )}
          </span>
          <span
            className={cn(
              'text-muted-foreground shrink-0 tabular-nums',
              tooShort && 'text-destructive',
            )}
          >
            {tooShort
              ? `${JD_MIN_LENGTH - length} more characters needed`
              : `${value.length.toLocaleString()} / ${JD_MAX_LENGTH.toLocaleString()}`}
          </span>
        </div>
      </div>

      <p
        className={`
          text-muted-foreground bg-muted/60 flex gap-2 rounded-lg px-3 py-2.5
          text-xs leading-relaxed
        `}
      >
        <Info className='mt-px size-3.5 shrink-0' />
        Scored against your resume as it is in the editor, unsaved changes
        included, on hard skills, experience, domain, education and soft skills.
      </p>
    </div>
  );
}
