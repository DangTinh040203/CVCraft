'use client';

import { Button } from '@repo/ui/components/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';
import { Check, Loader2, RotateCw, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { hasRichText } from '@/components/templates/rich-text';
import { useService } from '@/hooks/use-http';
import { ResumeService } from '@/services/resume.service';
import { type RewriteKind, type RewritePayload } from '@/types/ats.type';
import { toastApiError } from '@/utils/toast-error-message.util';

/** A fill-in the AI leaves where a number belongs, e.g. "[X%]". */
const PLACEHOLDER = /(\[[^\]]{1,20}\])/;

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** The rewrite in the editor's own markup (Quill's bullet list). */
function toEditorHtml(kind: RewriteKind, lines: string[]) {
  if (kind === 'summary') return `<p>${escapeHtml(lines.join(' '))}</p>`;
  return `<ol>${lines
    .map((line) => `<li data-list="bullet">${escapeHtml(line)}</li>`)
    .join('')}</ol>`;
}

/** The line with its placeholders highlighted for the user to fill in. */
function SuggestedLine({ line }: { line: string }) {
  return (
    <>
      {line.split(PLACEHOLDER).map((part, index) =>
        PLACEHOLDER.test(part) ? (
          <mark
            key={index}
            className={`
              rounded bg-amber-100 px-0.5 font-medium text-amber-800
              dark:bg-amber-500/20 dark:text-amber-200
            `}
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

interface AiRewriteButtonProps extends Omit<RewritePayload, 'text'> {
  /** The field as the editor has it (HTML). */
  value: string;
  /** Gets the rewrite as editor HTML, replacing the field. */
  onApply: (html: string) => void;
}

/**
 * "Improve with AI" for one rich-text field: shows a rewrite (strong verbs,
 * results, [placeholders] where a number belongs) to accept or try again.
 * Nothing changes until the user picks Replace.
 */
export function AiRewriteButton({
  value,
  onApply,
  ...context
}: AiRewriteButtonProps) {
  const resumeService = useService(ResumeService);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState<string[] | null>(null);
  const empty = !hasRichText(value);

  const rewrite = async () => {
    setLoading(true);
    try {
      setLines(await resumeService.rewriteText({ ...context, text: value }));
    } catch (error) {
      toastApiError(error, "We couldn't rewrite this. Please try again.");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setLines(null);
      void rewrite();
    }
  };

  const apply = () => {
    if (!lines) return;
    onApply(toEditorHtml(context.kind, lines));
    setOpen(false);
  };

  const hasPlaceholders = lines?.some((line) => PLACEHOLDER.test(line));

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={empty}
          title={empty ? 'Write a few lines first' : undefined}
          className={`
            border-primary/30 text-primary h-7 gap-1.5 px-2.5 text-xs
            hover:bg-primary/10 hover:text-primary
          `}
        >
          <Sparkles className='size-3.5' />
          Improve with AI
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-[min(28rem,calc(100vw-2rem))] p-0'
      >
        <div className='flex items-center gap-2 border-b px-4 py-3'>
          <Sparkles className='text-primary size-4' />
          <p className='text-sm font-semibold'>AI suggestion</p>
        </div>

        <div className='max-h-80 overflow-y-auto px-4 py-3'>
          {loading || !lines ? (
            <div className='space-y-2.5' aria-label='Rewriting'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-11/12' />
              <Skeleton className='h-4 w-4/5' />
            </div>
          ) : context.kind === 'summary' ? (
            <p className='text-sm leading-relaxed'>
              <SuggestedLine line={lines.join(' ')} />
            </p>
          ) : (
            <ul className='list-disc space-y-1.5 pl-5 text-sm leading-relaxed'>
              {lines.map((line) => (
                <li key={line}>
                  <SuggestedLine line={line} />
                </li>
              ))}
            </ul>
          )}
          {hasPlaceholders && !loading && (
            <p className='text-muted-foreground mt-3 text-xs leading-relaxed'>
              Replace the{' '}
              <mark
                className={`
                  rounded bg-amber-100 px-0.5 text-amber-800
                  dark:bg-amber-500/20 dark:text-amber-200
                `}
              >
                [highlighted]
              </mark>{' '}
              parts with your real numbers, or remove them. Never claim results
              you can&apos;t back up.
            </p>
          )}
        </div>

        <div className='flex items-center justify-end gap-2 border-t px-4 py-3'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='hover:bg-muted hover:text-foreground'
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className={`
              hover:bg-muted hover:text-foreground
              gap-1.5
            `}
            disabled={loading}
            onClick={() => void rewrite()}
          >
            <RotateCw className={cn('size-3.5', loading && 'animate-spin')} />
            Try again
          </Button>
          <Button
            type='button'
            variant='gradient'
            size='sm'
            className='gap-1.5'
            disabled={loading || !lines}
            onClick={apply}
          >
            {loading ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Check className='size-3.5' />
            )}
            Replace
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
