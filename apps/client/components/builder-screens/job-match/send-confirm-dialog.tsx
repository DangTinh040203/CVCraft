'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog';
import { Button } from '@repo/ui/components/button';
import { Loader2, Send } from 'lucide-react';

interface SendConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  sending: boolean;
  to: string;
  fromName: string;
  replyTo: string;
  subject: string;
  attachment: string;
}

/**
 * The last look before an email leaves on the user's behalf: who gets it,
 * whose name it carries and where replies go.
 */
export function SendConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  sending,
  to,
  fromName,
  replyTo,
  subject,
  attachment,
}: SendConfirmDialogProps) {
  const rows = [
    ['To', to],
    ['From', fromName],
    ['Replies to', `${replyTo} (you also get a copy)`],
    ['Subject', subject],
    ['Attached', attachment],
  ];

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !sending && onOpenChange(next)}
    >
      <AlertDialogContent className='sm:max-w-md'>
        <AlertDialogHeader>
          <AlertDialogTitle>Send this application?</AlertDialogTitle>
          <AlertDialogDescription>
            It goes out right away and can&apos;t be unsent.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <dl className='bg-muted/50 space-y-2 rounded-lg p-3 text-sm'>
          {rows.map(([label, value]) => (
            <div key={label} className='flex gap-3'>
              <dt className='text-muted-foreground w-20 shrink-0'>{label}</dt>
              <dd className='min-w-0 font-medium break-words'>{value}</dd>
            </div>
          ))}
        </dl>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={sending}>Cancel</AlertDialogCancel>
          {/* A plain button: AlertDialogAction would close before sending */}
          <Button
            variant='gradient'
            className='gap-2'
            disabled={sending}
            onClick={onConfirm}
          >
            {sending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Send className='size-4' />
            )}
            {sending ? 'Sending…' : 'Send now'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
