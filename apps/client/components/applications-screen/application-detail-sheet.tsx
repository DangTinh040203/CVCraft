'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/alert-dialog';
import { Button } from '@repo/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import { Textarea } from '@repo/ui/components/textarea';
import { format } from 'date-fns';
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  Reply,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { CompanyAvatar } from '@/components/applications-screen/company-avatar';
import { StatusSelect } from '@/components/applications-screen/status-select';
import {
  type SentApplication,
  type UpdateApplicationPayload,
} from '@/types/application.type';

const NOTES_MAX = 2000;

interface ApplicationDetailSheetProps {
  application: SentApplication | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (
    application: SentApplication,
    payload: UpdateApplicationPayload,
  ) => Promise<SentApplication | null>;
  onRemove: (application: SentApplication) => Promise<boolean>;
}

/** One application in full: the email as sent, its status and notes. */
export function ApplicationDetailSheet({
  application,
  onOpenChange,
  onUpdate,
  onRemove,
}: ApplicationDetailSheetProps) {
  return (
    <Sheet open={!!application} onOpenChange={onOpenChange}>
      <SheetContent
        className={`
          w-full gap-0 p-0
          sm:max-w-xl
        `}
      >
        {application && (
          // Keyed so notes and copy state start fresh for each application
          <DetailBody
            key={application.id}
            application={application}
            onClose={() => onOpenChange(false)}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailBody({
  application,
  onClose,
  onUpdate,
  onRemove,
}: Omit<ApplicationDetailSheetProps, 'application' | 'onOpenChange'> & {
  application: SentApplication;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(application.notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const title = application.jobTitle || application.subject;
  const notesDirty = notes.trim() !== (application.notes ?? '');
  const followUpUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(application.toEmail)}&su=${encodeURIComponent(`Re: ${application.subject}`)}`;

  const saveNotes = async () => {
    setSavingNotes(true);
    const saved = await onUpdate(application, { notes });
    setSavingNotes(false);
    if (saved) setNotes(saved.notes ?? '');
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText(
      `Subject: ${application.subject}\n\n${application.body ?? ''}`.trim(),
    );
    setCopied(true);
  };

  const remove = async () => {
    setRemoving(true);
    if (await onRemove(application)) onClose();
    else setRemoving(false);
  };

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <SheetHeader className='border-b p-6 pr-12'>
        <div className='flex items-start gap-3'>
          <CompanyAvatar
            name={application.company || title}
            className='size-11'
          />
          <div className='min-w-0 flex-1'>
            <SheetTitle className='text-lg leading-snug'>{title}</SheetTitle>
            <SheetDescription className='truncate'>
              {application.company ?? 'Company not stated'}
            </SheetDescription>
          </div>
        </div>
        <div className='mt-4 flex items-center justify-between gap-3'>
          <span className='text-muted-foreground text-sm'>Status</span>
          <StatusSelect
            value={application.status}
            onChange={(status) => void onUpdate(application, { status })}
          />
        </div>
      </SheetHeader>

      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto p-6'>
        <dl className='grid gap-3 text-sm'>
          <MetaRow label='Sent to' value={application.toEmail} />
          {application.replyTo && (
            <MetaRow label='Replies go to' value={application.replyTo} />
          )}
          <MetaRow
            label='Sent'
            value={format(
              new Date(application.createdAt),
              'MMM d, yyyy · HH:mm',
            )}
          />
        </dl>

        <section className='space-y-2'>
          <h3 className='flex items-center gap-2 text-sm font-semibold'>
            <Mail className='text-muted-foreground size-4' />
            Email sent
          </h3>
          <div className='bg-muted/40 rounded-xl border p-4'>
            <p className='text-sm font-semibold'>{application.subject}</p>
            {application.body ? (
              <p
                className={`
                  text-muted-foreground mt-3 text-sm/relaxed whitespace-pre-wrap
                `}
              >
                {application.body}
              </p>
            ) : (
              <p className='text-muted-foreground mt-3 text-sm italic'>
                This email was sent before CraftCV kept a copy of the message.
              </p>
            )}
            <p className='text-muted-foreground mt-4 border-t pt-3 text-xs'>
              Your resume was attached as a PDF.
            </p>
          </div>
        </section>

        <section className='space-y-2'>
          <label htmlFor='application-notes' className='text-sm font-semibold'>
            Notes
          </label>
          <Textarea
            id='application-notes'
            value={notes}
            maxLength={NOTES_MAX}
            rows={4}
            placeholder='Interview dates, who you spoke with, salary range…'
            onChange={(event) => setNotes(event.target.value)}
          />
          <div className='flex items-center justify-between gap-3'>
            <span className='text-muted-foreground text-xs'>
              Only you can see these.
            </span>
            <Button
              size='sm'
              disabled={!notesDirty || savingNotes}
              onClick={() => void saveNotes()}
            >
              {savingNotes && <Loader2 className='size-3.5 animate-spin' />}
              Save notes
            </Button>
          </div>
        </section>
      </div>

      <div className='flex items-center gap-2 border-t p-4'>
        <Button asChild className='flex-1 gap-2'>
          <a href={followUpUrl} target='_blank' rel='noreferrer'>
            <Reply className='size-4' />
            Follow up in Gmail
            <ExternalLink className='size-3.5 opacity-70' />
          </a>
        </Button>
        <Button
          variant='outline'
          className='gap-2'
          onClick={() => void copyEmail()}
        >
          {copied ? (
            <Check className='size-4' />
          ) : (
            <Copy className='size-4' />
          )}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              aria-label='Remove from list'
              className={`
                text-muted-foreground
                hover:bg-destructive/10 hover:text-destructive
              `}
            >
              <Trash2 className='size-4' />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this application?</AlertDialogTitle>
              <AlertDialogDescription>
                It leaves your list for good. The email was already sent, so it
                still counts toward today&apos;s sending limit.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant='destructive'
                disabled={removing}
                onClick={(event) => {
                  // Stays open until the removal is done
                  event.preventDefault();
                  void remove();
                }}
              >
                {removing && <Loader2 className='size-3.5 animate-spin' />}
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-baseline justify-between gap-4'>
      <dt className='text-muted-foreground shrink-0'>{label}</dt>
      <dd className='truncate text-right font-medium'>{value}</dd>
    </div>
  );
}
