'use client';

import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import { Label } from '@repo/ui/components/label';
import { toast } from '@repo/ui/components/sonner';
import { Switch } from '@repo/ui/components/switch';
import {
  Copy,
  Download,
  ExternalLink,
  Globe,
  Loader2,
  Lock,
  RefreshCw,
  Save,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState } from 'react';

import { useService } from '@/hooks/use-http';
import { useSyncResume } from '@/hooks/use-sync-resume';
import { ResumeService } from '@/services/resume.service';
import { resumeSelector, setSharing } from '@/stores/features/resume.slice';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { toastApiError } from '@/utils/toast-error-message.util';

interface ShareResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Turns the resume's public, read-only link on or off, with a QR code for
 * printed material. The link shows the last saved version.
 */
export function ShareResumeDialog({
  open,
  onOpenChange,
}: ShareResumeDialogProps) {
  const { resume, isDirty } = useAppSelector(resumeSelector);
  const { sync, isSyncing } = useSyncResume();
  const resumeService = useService(ResumeService);
  const dispatch = useAppDispatch();
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [pending, setPending] = useState<'toggle' | 'regenerate' | null>(null);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  if (!resume) return null;

  const isPublic = !!resume.isPublic && !!resume.shareSlug;
  const link =
    resume.shareSlug && typeof window !== 'undefined'
      ? `${window.location.origin}/r/${resume.shareSlug}`
      : '';

  const update = async (
    payload: { enabled: boolean; regenerate?: boolean },
    action: 'toggle' | 'regenerate',
  ) => {
    setPending(action);
    try {
      dispatch(
        setSharing(await resumeService.updateSharing(resume.id, payload)),
      );
      if (action === 'regenerate') toast.success('New link created.');
    } catch (error) {
      toastApiError(error, "We couldn't update sharing. Please try again.");
    } finally {
      setPending(null);
      setConfirmRegenerate(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied.');
    } catch {
      toast.error("Couldn't copy. Select the link and copy it yourself.");
    }
  };

  const downloadQr = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const anchor = document.createElement('a');
    anchor.href = canvas.toDataURL('image/png');
    anchor.download = `${resume.title.trim() || 'resume'}-qr.png`;
    anchor.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Share your resume</DialogTitle>
          <DialogDescription>
            A read-only web page of your resume, for anyone with the link.
          </DialogDescription>
        </DialogHeader>

        <div
          className={`
            flex items-start justify-between gap-4 rounded-xl border p-4
          `}
        >
          <div className='flex gap-3'>
            {isPublic ? (
              <Globe className='mt-0.5 size-5 shrink-0 text-emerald-500' />
            ) : (
              <Lock className='text-muted-foreground mt-0.5 size-5 shrink-0' />
            )}
            <div className='space-y-1'>
              <Label htmlFor='share-public' className='font-semibold'>
                {isPublic ? 'Anyone with the link' : 'Only you'}
              </Label>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                {isPublic
                  ? 'They see everything on your resume, contact details included.'
                  : 'Turn on to get a link you can send or print as a QR code.'}
              </p>
            </div>
          </div>
          {pending === 'toggle' ? (
            <Loader2 className='text-muted-foreground size-5 animate-spin' />
          ) : (
            <Switch
              id='share-public'
              checked={isPublic}
              disabled={pending !== null}
              onCheckedChange={(enabled) => void update({ enabled }, 'toggle')}
            />
          )}
        </div>

        {isPublic && (
          <div className='space-y-4'>
            <InputGroup>
              <InputGroupInput
                readOnly
                value={link}
                aria-label='Share link'
                onFocus={(e) => e.currentTarget.select()}
              />
              <InputGroupAddon align='inline-end'>
                <InputGroupButton
                  size='icon-xs'
                  className='hover:bg-muted hover:text-foreground'
                  aria-label='Copy link'
                  title='Copy link'
                  onClick={() => void copyLink()}
                >
                  <Copy />
                </InputGroupButton>
                <InputGroupButton
                  size='icon-xs'
                  className='hover:bg-muted hover:text-foreground'
                  aria-label='Open link'
                  title='Open link'
                  asChild
                >
                  <a href={link} target='_blank' rel='noopener noreferrer'>
                    <ExternalLink />
                  </a>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            {isDirty && (
              <div
                className={`
                  flex items-center justify-between gap-3 rounded-lg bg-amber-50
                  px-3 py-2 text-xs text-amber-800
                  dark:bg-amber-500/15 dark:text-amber-200
                `}
              >
                <span>
                  The link shows your last saved version. Save to update it.
                </span>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='h-7 shrink-0 gap-1.5 bg-transparent text-xs'
                  disabled={isSyncing}
                  onClick={() => void sync()}
                >
                  {isSyncing ? (
                    <Loader2 className='size-3.5 animate-spin' />
                  ) : (
                    <Save className='size-3.5' />
                  )}
                  Save
                </Button>
              </div>
            )}

            <div className='flex items-center gap-4'>
              <div className='rounded-xl border bg-white p-2'>
                <QRCodeCanvas
                  ref={qrRef}
                  value={link}
                  size={128}
                  marginSize={1}
                  level='M'
                  title='QR code for your resume link'
                />
              </div>
              <div className='space-y-2'>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  Put it on a business card, a printed CV or a slide.
                </p>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className={`
                    hover:bg-muted hover:text-foreground
                    gap-1.5
                  `}
                  onClick={downloadQr}
                >
                  <Download className='size-3.5' />
                  Download QR code
                </Button>
              </div>
            </div>

            <div className='border-t pt-4'>
              {confirmRegenerate ? (
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='text-muted-foreground flex-1 text-xs'>
                    The current link and QR code will stop working.
                  </p>
                  <Button
                    type='button'
                    size='sm'
                    variant='ghost'
                    className='hover:bg-muted hover:text-foreground'
                    onClick={() => setConfirmRegenerate(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    variant='destructive'
                    className='gap-1.5'
                    disabled={pending !== null}
                    onClick={() =>
                      void update(
                        { enabled: true, regenerate: true },
                        'regenerate',
                      )
                    }
                  >
                    {pending === 'regenerate' && (
                      <Loader2 className='size-3.5 animate-spin' />
                    )}
                    Create new link
                  </Button>
                </div>
              ) : (
                <Button
                  type='button'
                  size='sm'
                  variant='ghost'
                  className={`
                    text-muted-foreground gap-1.5 px-2
                    hover:bg-muted hover:text-foreground
                  `}
                  onClick={() => setConfirmRegenerate(true)}
                >
                  <RefreshCw className='size-3.5' />
                  Replace the link
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
