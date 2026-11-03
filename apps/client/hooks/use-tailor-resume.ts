import { useCallback, useState } from 'react';

import { toEditorHtml } from '@/components/builder-screens/ai-rewrite-button';
import { useService } from '@/hooks/use-http';
import { ResumeService } from '@/services/resume.service';
import { resumeSelector, updateResume } from '@/stores/features/resume.slice';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { type MatchResult, type TailorChange } from '@/types/match.type';
import { type Resume } from '@/types/resume.type';
import { toastApiError } from '@/utils/toast-error-message.util';

type Fields = Pick<Resume, 'overview' | 'workExperiences' | 'projects'>;

/** The field's HTML as the editor has it; undefined once its entry is gone. */
function readField(resume: Fields, change: TailorChange) {
  if (change.section === 'summary') return resume.overview;
  if (change.section === 'experience') {
    return resume.workExperiences.find((w) => w.id === change.itemId)
      ?.description;
  }
  return resume.projects.find((p) => p.id === change.itemId)?.responsibilities;
}

function writeField(
  resume: Fields,
  change: TailorChange,
  html: string,
): Fields {
  if (change.section === 'summary') return { ...resume, overview: html };
  if (change.section === 'experience') {
    return {
      ...resume,
      workExperiences: resume.workExperiences.map((w) =>
        w.id === change.itemId ? { ...w, description: html } : w,
      ),
    };
  }
  return {
    ...resume,
    projects: resume.projects.map((p) =>
      p.id === change.itemId ? { ...p, responsibilities: html } : p,
    ),
  };
}

/**
 * Rewrites the resume for the matched job with AI, then lets the user apply
 * (or undo) each change in the editor. Applied changes are unsaved edits,
 * like any other, and re-analyzing the match shows what they did.
 */
export function useTailorResume(
  jobDescription: string,
  result: MatchResult | null,
) {
  const { resume } = useAppSelector(resumeSelector);
  const dispatch = useAppDispatch();
  const resumeService = useService(ResumeService);
  // The changes and the JD they were made for: editing the JD drops them
  const [tailored, setTailored] = useState<{
    jd: string;
    changes: TailorChange[];
  } | null>(null);
  // Each applied change's field HTML from before, for undo
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const jd = jobDescription.trim();
  const changes = tailored?.jd === jd ? tailored.changes : null;

  const generate = useCallback(async () => {
    if (!resume || !result) return;
    setLoading(true);
    try {
      const next = await resumeService.tailorResume(
        resume,
        jd,
        result.missingKeywords,
      );
      setTailored({ jd, changes: next });
      setApplied({});
    } catch (error) {
      toastApiError(error, "We couldn't tailor your resume. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [jd, result, resume, resumeService]);

  /** Applies the given changes in one edit, skipping removed entries. */
  const apply = useCallback(
    (toApply: TailorChange[]) => {
      if (!resume) return;
      let next: Fields = resume;
      const before: Record<string, string> = {};
      for (const change of toApply) {
        const current = readField(next, change);
        if (current === undefined || change.ref in applied) continue;
        before[change.ref] = current;
        next = writeField(
          next,
          change,
          toEditorHtml(change.kind, change.lines),
        );
      }
      if (!Object.keys(before).length) return;
      dispatch(
        updateResume({
          overview: next.overview,
          workExperiences: next.workExperiences,
          projects: next.projects,
        }),
      );
      setApplied((current) => ({ ...current, ...before }));
    },
    [applied, dispatch, resume],
  );

  const undo = useCallback(
    (change: TailorChange) => {
      const previous = applied[change.ref];
      if (!resume || previous === undefined) return;
      if (readField(resume, change) !== undefined) {
        const next = writeField(resume, change, previous);
        dispatch(
          updateResume({
            overview: next.overview,
            workExperiences: next.workExperiences,
            projects: next.projects,
          }),
        );
      }
      setApplied((current) => {
        const rest = { ...current };
        delete rest[change.ref];
        return rest;
      });
    },
    [applied, dispatch, resume],
  );

  return {
    changes,
    loading,
    isApplied: (change: TailorChange) => change.ref in applied,
    /** False once the entry it rewrites was deleted from the resume. */
    isAvailable: (change: TailorChange) =>
      !!resume && readField(resume, change) !== undefined,
    appliedCount: changes?.filter((c) => c.ref in applied).length ?? 0,
    generate,
    apply,
    undo,
  };
}
