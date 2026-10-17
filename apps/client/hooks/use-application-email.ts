import { useCallback, useMemo, useState } from 'react';

import { useService } from '@/hooks/use-http';
import { useResumePdf } from '@/hooks/use-resume-pdf';
import { ApplicationsService } from '@/services/applications.service';
import { ResumeService } from '@/services/resume.service';
import { resumeSelector } from '@/stores/features/resume.slice';
import { useAppSelector } from '@/stores/store';
import {
  type EmailTone,
  type SendQuota,
  type SentApplication,
} from '@/types/application.type';
import { type MatchResult } from '@/types/match.type';
import { toastApiError } from '@/utils/toast-error-message.util';

type Status = 'idle' | 'writing' | 'sending';

/** A light check; the server validates for real. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The application email for a matched job: drafted by AI, edited by the
 * user, then sent from CraftCV (resume attached, replies to the user) or
 * opened in Gmail to send themselves.
 */
export function useApplicationEmail(
  jobDescription: string,
  match: MatchResult | null,
) {
  const { resume } = useAppSelector(resumeSelector);
  const resumeService = useService(ResumeService);
  const applicationsService = useService(ApplicationsService);
  const { payload: pdfPayload } = useResumePdf();

  const [tone, setTone] = useState<EmailTone>('professional');
  // Greeting and recipient default to what the match read in the JD (and
  // follow a re-analysis) until the user types their own (null = untouched)
  const [greetingEdit, setGreeting] = useState<string | null>(null);
  const [toEdit, setTo] = useState<string | null>(null);
  const greeting = greetingEdit ?? match?.greeting ?? '';
  const to = toEdit ?? match?.contactEmail ?? '';
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [quota, setQuota] = useState<SendQuota | null>(null);
  const [sent, setSent] = useState<SentApplication | null>(null);

  const hasDraft = !!(subject || body);
  // Recomputed as the user edits, so filled-in gaps stop warning
  const placeholders = useMemo(
    () => [...new Set(`${subject}\n${body}`.match(/\[[^\]\n]{2,40}\]/g) ?? [])],
    [body, subject],
  );

  const refreshQuota = useCallback(async () => {
    try {
      setQuota(
        (await applicationsService.getApplications({ pageSize: 1 })).quota,
      );
    } catch {
      // Not fatal: the server checks the quota again when sending
    }
  }, [applicationsService]);

  const write = useCallback(async () => {
    if (!resume) return;
    setStatus('writing');
    try {
      const draft = await resumeService.writeApplicationEmail({
        resume,
        jobDescription: jobDescription.trim(),
        tone,
        greeting: greeting.trim() || undefined,
        match: match
          ? {
              jobTitle: match.jobTitle,
              company: match.company,
              strengths: match.strengths,
              matchedKeywords: match.matchedKeywords,
            }
          : undefined,
      });
      setSubject(draft.subject);
      setBody(draft.body);
      setSent(null);
    } catch (error) {
      toastApiError(error, "We couldn't write the email. Please try again.");
    } finally {
      setStatus('idle');
    }
  }, [greeting, jobDescription, match, resume, resumeService, tone]);

  const send = useCallback(async () => {
    const cv = pdfPayload();
    if (!cv) return false;
    setStatus('sending');
    try {
      const result = await applicationsService.sendApplication({
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
        jobTitle: match?.jobTitle ?? undefined,
        company: match?.company ?? undefined,
        cv,
      });
      setSent(result.application);
      setQuota(result.quota);
      return true;
    } catch (error) {
      toastApiError(error, "We couldn't send the email. Please try again.");
      void refreshQuota();
      return false;
    } finally {
      setStatus('idle');
    }
  }, [applicationsService, body, match, pdfPayload, refreshQuota, subject, to]);

  /** Gmail's compose window, prefilled; the user attaches and sends. */
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to.trim())}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const validRecipient = EMAIL_PATTERN.test(to.trim());

  return {
    tone,
    setTone,
    greeting,
    setGreeting,
    /** Whether the greeting / recipient are still the ones read from the JD. */
    greetingFromJd: greetingEdit === null && !!match?.greeting,
    toFromJd: toEdit === null && !!match?.contactEmail,
    to,
    setTo,
    subject,
    setSubject,
    body,
    setBody,
    status,
    quota,
    refreshQuota,
    sent,
    /** Back to editing after a send, e.g. for another recruiter. */
    resetSent: () => setSent(null),
    hasDraft,
    placeholders,
    validRecipient,
    canSend:
      hasDraft &&
      validRecipient &&
      placeholders.length === 0 &&
      status === 'idle' &&
      quota?.available !== false &&
      quota?.remaining !== 0,
    write,
    send,
    gmailUrl,
  };
}
