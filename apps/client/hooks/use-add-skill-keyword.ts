import { useCallback, useState } from 'react';

import { resumeSelector, updateResume } from '@/stores/features/resume.slice';
import { useAppDispatch, useAppSelector } from '@/stores/store';

/** Where keywords added from a match or ATS check go, so they're easy to review. */
const ADDED_SKILLS_LABEL = 'Additional Skills';

/**
 * Adds a suggested keyword to the resume's skills (an unsaved edit), and
 * remembers which were added so their chips can show it.
 */
export function useAddSkillKeyword() {
  const { resume } = useAppSelector(resumeSelector);
  const dispatch = useAppDispatch();
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set());

  const addKeyword = useCallback(
    (keyword: string) => {
      if (!resume) return;
      const skills = resume.skills;
      const group = skills.find(
        (skill) =>
          skill.label.trim().toLowerCase() === ADDED_SKILLS_LABEL.toLowerCase(),
      );
      dispatch(
        updateResume({
          skills: group
            ? skills.map((skill) =>
                skill === group
                  ? {
                      ...skill,
                      value: [skill.value, keyword].filter(Boolean).join(', '),
                    }
                  : skill,
              )
            : [
                ...skills,
                {
                  id: crypto.randomUUID(),
                  label: ADDED_SKILLS_LABEL,
                  value: keyword,
                  resumeId: resume.id,
                },
              ],
        }),
      );
      setAddedKeywords((current) => new Set(current).add(keyword));
    },
    [dispatch, resume],
  );

  return { addedKeywords, addKeyword };
}
