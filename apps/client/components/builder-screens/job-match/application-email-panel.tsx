'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { Textarea } from '@repo/ui/components/textarea';
import { cn } from '@repo/ui/lib/utils';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  Paperclip,
  RotateCw,
  ScanText,
  Send,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { SendConfirmDialog } from '@/components/builder-screens/job-match/send-confirm-dialog';
import { type useApplicationEmail } from '@/hooks/use-application-email';
import { useResumePdf } from '@/hooks/use-resume-pdf';
import { resumeSelector } from '@/stores/features/resume.slice';
import { useAppSelector } from '@/stores/store';
import { type EmailTone } from '@/types/application.type';

const TONES: Array<{ value: EmailTone; label: string; hint: string }> = [
  { value: 'professional', label: 'Professional', hint: 'Polished, confident' },
  { value: 'warm', label: 'Warm', hint: 'Friendly, enthusiastic' },
  { value: 'concise', label: 'Concise', hint: 'Short and direct' },
];

interface ApplicationEmailPanelProps {
  email: ReturnType<typeof useApplicationEmail>;
  company: string | null;
  /** The person the JD says to apply to, if any. */
  contactName: string | null;
  onBack: () => void;
}

/**
 * The email on the resume's contact section (labelled as email first), as
 * the server picks it for Reply-To. Mirrors `resumeContactEmail` there.
 */
function resumeContactEmail(contacts: Array<{ label: string; value: string }>) {
  const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const found =
    contacts.find(
      (c) => /e-?mail|thư/i.test(c.label) && isEmail(c.value.trim()),
    ) ?? contacts.find((c) => isEmail(c.value.trim()));
  return found?.value.trim();
}

/** "Jane Doe" -> "Jane-Doe-Resume.pdf", as the server names the attachment. */
function attachmentName(name: string) {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug ? `${slug}-Resume.pdf` : 'Resume.pdf';
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-1.5'>
      <label htmlFor={htmlFor} className='text-sm font-medium'>
        {label}
      </label>
      {children}
      {hint && <div className='text-muted-foreground text-xs'>{hint}</div>}
    </div>
  );
}

/**
 * Writes the application email with AI, lets the user edit it, then sends it
 * from CraftCV with the resume attached (or opens it in Gmail).
 */
export function ApplicationEmailPanel({
  email,
  company,
  contactName,
  onBack,
}: ApplicationEmailPanelProps) {
  const { user } = useUser();
  const { payload: pdfPayload } = useResumePdf();
  const { resume } = useAppSelector(resumeSelector);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { refreshQuota } = email;

  useEffect(() => {
    void refreshQuota();
  }, [refreshQuota]);

  // Where replies and the copy go, as the server decides: the email on the
  // resume as sent (a hidden contact section isn't on it), else the
  // sign-in email
  const userEmail =
    resumeContactEmail(pdfPayload()?.resume.information ?? []) ??
    user?.primaryEmailAddress?.emailAddress ??
    '';
  const candidate = resume?.title?.trim() || user?.fullName || 'You';
  const writing = email.status === 'writing';
  const quota = email.quota;
  const outOfSends = quota?.remaining === 0;

  const copy = async () => {
    await navigator.clipboard.writeText(
      `Subject: ${email.subject}\n\n${email.body}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const confirmSend = async () => {
    if (await email.send()) setConfirmOpen(false);
  };

  if (email.sent) {
    return (
      <div className='flex flex-1 flex-col'>
        <div
          className={`
            flex flex-1 flex-col items-center justify-center px-6 py-10
            text-center
          `}
        >
          <div
            className={`
              mb-4 flex size-16 items-center justify-center rounded-full
              bg-emerald-50 text-emerald-600
              dark:bg-emerald-500/15 dark:text-emerald-300
            `}
          >
            <CheckCircle2 className='size-8' />
          </div>
          <h3 className='text-lg font-semibold'>Application sent</h3>
          <p
            className={`
              text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed
            `}
          >
            Sent to <strong>{email.sent.toEmail}</strong> with your resume
            attached. Replies will come to {userEmail}, and a copy is in your
            inbox.
          </p>
          {quota && (
            <p className='text-muted-foreground mt-3 text-xs'>
              {quota.remaining} of {quota.limit} sends left today
            </p>
          )}
        </div>
        <div className='bg-background flex gap-2 border-t px-6 py-4'>
          <Button
            variant='outline'
            className='h-11 flex-1'
            onClick={email.resetSent}
          >
            Send to someone else
          </Button>
          <Button variant='gradient' className='h-11 flex-1' onClick={onBack}>
            Back to results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='flex-1 space-y-6 overflow-y-auto px-6 py-6'>
        <section className='space-y-4'>
          <div>
            <h3 className='flex items-center gap-2 font-semibold'>
              <Mail className='text-primary size-4' />
              Apply by email{company ? ` to ${company}` : ''}
            </h3>
            <p className='text-muted-foreground mt-1 text-sm'>
              AI drafts it from your resume and this job, using what matched
              best. Review it, then send.
            </p>
          </div>

          <RadioGroup
            aria-label='Tone'
            value={email.tone}
            disabled={writing}
            onValueChange={(value) => email.setTone(value as EmailTone)}
            className='grid grid-cols-3 gap-2'
          >
            {TONES.map((option) => (
              <Label
                key={option.value}
                htmlFor={`tone-${option.value}`}
                className={`
                  hover:bg-muted/60
                  has-data-[state=checked]:border-primary
                  has-data-[state=checked]:bg-primary/5
                  has-data-[state=checked]:ring-primary/30
                  has-data-[state=checked]:ring-2
                  flex cursor-pointer flex-col items-stretch gap-0.5 rounded-xl
                  border px-3 py-2.5
                `}
              >
                <span className={`
                  flex items-center justify-between gap-2 text-sm font-semibold
                `}>
                  {option.label}
                  <RadioGroupItem
                    id={`tone-${option.value}`}
                    value={option.value}
                  />
                </span>
                <span className='text-muted-foreground text-xs font-normal'>
                  {option.hint}
                </span>
              </Label>
            ))}
          </RadioGroup>

          <Field
            label='Greeting'
            htmlFor='email-greeting'
            hint={
              email.greetingFromJd ? (
                <span className='inline-flex items-center gap-1'>
                  <ScanText className='size-3.5 shrink-0' />
                  {contactName
                    ? `Addressed to ${contactName}, named in the job description.`
                    : 'The job description names no one, so it greets the hiring team. Change it if you know who reads it.'}
                </span>
              ) : (
                'The email opens with exactly this line.'
              )
            }
          >
            <Input
              id='email-greeting'
              value={email.greeting}
              maxLength={120}
              disabled={writing}
              placeholder='Dear Hiring Team,'
              onChange={(event) => email.setGreeting(event.target.value)}
            />
          </Field>

          <Button
            variant={email.hasDraft ? 'outline' : 'gradient'}
            className='h-11 w-full gap-2'
            disabled={writing}
            onClick={() => void email.write()}
          >
            {writing ? (
              <Loader2 className='size-4 animate-spin' />
            ) : email.hasDraft ? (
              <RotateCw className='size-4' />
            ) : (
              <Sparkles className='size-4' />
            )}
            {writing
              ? 'Writing…'
              : email.hasDraft
                ? 'Rewrite with these settings'
                : 'Write with AI'}
          </Button>
        </section>

        {email.hasDraft && (
          <section
            className={cn(
              'space-y-4 border-t pt-6 transition-opacity',
              writing && 'pointer-events-none opacity-50',
            )}
          >
            <Field
              label='To'
              htmlFor='recipient-email'
              hint={
                email.to && !email.validRecipient ? (
                  <span className='text-destructive'>
                    Enter a valid email address.
                  </span>
                ) : email.toFromJd ? (
                  <span className='inline-flex items-center gap-1'>
                    <ScanText className='size-3.5 shrink-0' />
                    Found in the job description.
                  </span>
                ) : (
                  "The recruiter's address, usually in the job posting."
                )
              }
            >
              <Input
                id='recipient-email'
                type='email'
                inputMode='email'
                autoComplete='off'
                value={email.to}
                aria-invalid={
                  (!!email.to && !email.validRecipient) || undefined
                }
                placeholder='recruiter@company.com'
                onChange={(event) => email.setTo(event.target.value)}
              />
            </Field>

            <Field label='Subject' htmlFor='email-subject'>
              <Input
                id='email-subject'
                value={email.subject}
                maxLength={200}
                onChange={(event) => email.setSubject(event.target.value)}
              />
            </Field>

            <Field label='Message' htmlFor='email-body'>
              <Textarea
                id='email-body'
                value={email.body}
                maxLength={10000}
                onChange={(event) => email.setBody(event.target.value)}
                className='min-h-72 rounded-xl px-4 py-3 leading-relaxed'
              />
            </Field>

            {email.placeholders.length > 0 && (
              <div
                className={`
                  flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50
                  px-3 py-2.5 text-sm text-amber-800
                  dark:border-amber-500/30 dark:bg-amber-500/10
                  dark:text-amber-200
                `}
              >
                <TriangleAlert className='mt-0.5 size-4 shrink-0' />
                <span>
                  Fill in before sending:{' '}
                  <strong>{email.placeholders.join(', ')}</strong>
                </span>
              </div>
            )}

            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='gap-1.5'
                onClick={() => void copy()}
              >
                {copied ? (
                  <Check className='size-3.5' />
                ) : (
                  <Copy className='size-3.5' />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant='outline' size='sm' className='gap-1.5' asChild>
                <a href={email.gmailUrl} target='_blank' rel='noreferrer'>
                  <ExternalLink className='size-3.5' />
                  Open in Gmail
                </a>
              </Button>
            </div>

            <ul
              className={`
                text-muted-foreground bg-muted/50 space-y-1.5 rounded-lg px-3
                py-2.5 text-xs
              `}
            >
              <li className='flex items-center gap-2'>
                <Send className='size-3.5 shrink-0' />
                Sent under your name ({candidate}); replies go to{' '}
                {userEmail || 'your email'}, with a copy to you.
              </li>
              <li className='flex items-center gap-2'>
                <Paperclip className='size-3.5 shrink-0' />
                {attachmentName(candidate)}, from the template you&apos;re
                using.
              </li>
              {quota && (
                <li
                  className={cn(
                    'flex items-center gap-2',
                    outOfSends && 'text-destructive',
                  )}
                >
                  <Mail className='size-3.5 shrink-0' />
                  {quota.available
                    ? outOfSends
                      ? `No sends left today (${quota.limit} per 24 hours). Use Open in Gmail instead.`
                      : `${quota.remaining} of ${quota.limit} sends left today.`
                    : 'Sending from CraftCV is unavailable. Use Open in Gmail instead.'}
                </li>
              )}
            </ul>
          </section>
        )}
      </div>

      <div className='bg-background flex gap-2 border-t px-6 py-4'>
        <Button
          variant='outline'
          className='h-11 flex-1 gap-2'
          onClick={onBack}
        >
          <ArrowLeft className='size-4' />
          Back to results
        </Button>
        <Button
          variant='gradient'
          className='h-11 flex-1 gap-2'
          disabled={!email.canSend}
          onClick={() => setConfirmOpen(true)}
        >
          <Send className='size-4' />
          Send email
        </Button>
      </div>

      <SendConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => void confirmSend()}
        sending={email.status === 'sending'}
        to={email.to.trim()}
        fromName={candidate}
        replyTo={userEmail}
        subject={email.subject}
        attachment={attachmentName(candidate)}
      />
    </div>
  );
}
