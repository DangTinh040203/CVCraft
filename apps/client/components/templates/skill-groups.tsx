import { cn } from '@repo/ui/lib/utils';

import {
  skillDetail,
  type SkillItem,
} from '@/components/templates/resume.types';

/**
 * Skills as "Group: items" lines, e.g. "Frameworks: React, Next.js". Templates
 * whose own skill style (chips, a grid, a joined line) only fits short labels
 * switch to this when `hasSkillGroups(skills)`, so the items aren't dropped.
 * Text size and color come from `className`, the label weight from
 * `labelClassName`.
 */
export function SkillGroups({
  skills,
  className,
  labelClassName = 'font-semibold',
}: {
  skills: SkillItem[];
  className?: string;
  labelClassName?: string;
}) {
  return (
    <ul className={cn('space-y-1', className)}>
      {skills.map((skill) => {
        const detail = skillDetail(skill);
        return (
          <li key={skill.id}>
            <span className={labelClassName}>
              {skill.label}
              {detail && ':'}
            </span>
            {detail && ` ${detail}`}
          </li>
        );
      })}
    </ul>
  );
}
