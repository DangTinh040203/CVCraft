'use client';

import { Label } from '@repo/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Slider } from '@repo/ui/components/slider';
import { ToggleGroup, ToggleGroupItem } from '@repo/ui/components/toggle-group';
import { AlertCircle, Globe, Headphones, Volume2, X } from 'lucide-react';
import { type ReactNode } from 'react';

import { JobDescriptionStep } from '@/components/builder-screens/job-match/job-description-step';
import {
  INTERVIEW_LANGUAGES,
  INTERVIEW_PACES,
  INTERVIEW_TYPES,
  INTERVIEW_VOICES,
  QUESTION_COUNT_MAX,
  QUESTION_COUNT_MIN,
} from '@/constants/interview.constant';
import {
  type InterviewPace,
  type InterviewSettings,
  type InterviewType,
} from '@/types/interview.type';

interface InterviewSetupProps {
  settings: InterviewSettings;
  onChange: (patch: Partial<InterviewSettings>) => void;
  onPdf: (file: File) => void;
  reading: boolean;
  sourceFile: string | null;
  error: string | null;
  onDismissError: () => void;
}

function Field({
  label,
  htmlFor,
  icon,
  aside,
  children,
}: {
  label: string;
  htmlFor?: string;
  icon?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className='space-y-2.5'>
      <div className='flex items-center justify-between gap-3'>
        <Label
          htmlFor={htmlFor}
          className='flex items-center gap-1.5 text-sm font-semibold'
        >
          {icon}
          {label}
        </Label>
        {aside}
      </div>
      {children}
    </div>
  );
}

/** The job, the kind of interview, and how the interviewer sounds. */
export function InterviewSetup({
  settings,
  onChange,
  onPdf,
  reading,
  sourceFile,
  error,
  onDismissError,
}: InterviewSetupProps) {
  return (
    <div className='space-y-7'>
      {error && (
        <div
          role='alert'
          className={`
            border-destructive/30 bg-destructive/5 flex items-start gap-3
            rounded-xl border p-3.5
          `}
        >
          <AlertCircle className='text-destructive mt-0.5 size-4 shrink-0' />
          <p className='flex-1 text-sm leading-relaxed'>{error}</p>
          <button
            type='button'
            aria-label='Dismiss'
            onClick={onDismissError}
            className={`
              text-muted-foreground -m-1 rounded p-1
              hover:text-foreground
            `}
          >
            <X className='size-4' />
          </button>
        </div>
      )}

      <JobDescriptionStep
        compact
        value={settings.jobDescription}
        onChange={(jobDescription) => onChange({ jobDescription })}
        onPdf={onPdf}
        reading={reading}
        sourceFile={sourceFile}
        hint='The interviewer reads this and your resume as it is in the editor, unsaved changes included, then asks questions fitted to the role and its seniority.'
      />

      <Field label='Interview type'>
        <ToggleGroup
          type='single'
          spacing={2}
          aria-label='Interview type'
          value={settings.interviewType}
          // Always one type: clicking the current one keeps it
          onValueChange={(value) =>
            value && onChange({ interviewType: value as InterviewType })
          }
          className='grid w-full grid-cols-3'
        >
          {INTERVIEW_TYPES.map(({ value, label, description, icon: Icon }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className={`
                hover:border-primary/40 hover:bg-primary/5 hover:text-foreground
                data-[state=on]:border-primary data-[state=on]:bg-primary/10
                data-[state=on]:text-foreground
                h-auto min-w-0 cursor-pointer flex-col justify-start gap-1
                self-stretch rounded-xl border-2 px-2 py-3 text-center
                whitespace-normal
              `}
            >
              <Icon className='text-primary size-5' />
              <span className='text-sm font-semibold'>{label}</span>
              <span className='text-muted-foreground text-[11px] leading-tight'>
                {description}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Field
        label='Questions'
        aside={
          <span
            className={`
              bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs
              font-bold tabular-nums
            `}
          >
            {settings.questionCount}
          </span>
        }
      >
        <Slider
          aria-label='Number of questions'
          value={[settings.questionCount]}
          min={QUESTION_COUNT_MIN}
          max={QUESTION_COUNT_MAX}
          step={1}
          onValueChange={(values) =>
            values[0] !== undefined && onChange({ questionCount: values[0] })
          }
          className='cursor-pointer'
        />
        <p className='text-muted-foreground text-xs'>
          About {settings.questionCount * 2} minutes. One question at a time;
          take your time to think.
        </p>
      </Field>

      <div
        className={`
          grid gap-5
          sm:grid-cols-2
        `}
      >
        <Field
          label='Language'
          htmlFor='interview-language'
          icon={<Globe className='text-muted-foreground size-4' />}
        >
          <Select
            value={settings.language}
            onValueChange={(language) => onChange({ language })}
          >
            <SelectTrigger id='interview-language' className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVIEW_LANGUAGES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label='Interviewer voice'
          htmlFor='interview-voice'
          icon={<Volume2 className='text-muted-foreground size-4' />}
        >
          <Select
            value={settings.voiceName}
            onValueChange={(voiceName) => onChange({ voiceName })}
          >
            <SelectTrigger id='interview-voice' className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVIEW_VOICES.map((voice) => (
                <SelectItem key={voice.value} value={voice.value}>
                  {voice.label}
                  <span className='text-muted-foreground'>· {voice.tone}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label='Speaking pace'>
        <ToggleGroup
          type='single'
          variant='outline'
          aria-label='Speaking pace'
          value={settings.pace}
          onValueChange={(value) =>
            value && onChange({ pace: value as InterviewPace })
          }
          className='w-full'
        >
          {INTERVIEW_PACES.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className={`
                hover:bg-primary/5 hover:text-foreground
                data-[state=on]:bg-primary
                data-[state=on]:text-primary-foreground
                flex-1 cursor-pointer
              `}
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <div
        className={`
          text-muted-foreground bg-muted/60 flex gap-2.5 rounded-lg px-3 py-2.5
          text-xs leading-relaxed
        `}
      >
        <Headphones className='mt-px size-3.5 shrink-0' />
        <span>
          You&apos;ll need a microphone. Headphones work best: the interviewer
          can&apos;t hear itself, and your answers come through clearly.
        </span>
      </div>
    </div>
  );
}
