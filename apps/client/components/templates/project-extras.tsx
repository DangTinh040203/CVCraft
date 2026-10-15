import { cn } from '@repo/ui/lib/utils';

import { type ProjectItem } from '@/components/templates/resume.types';
import { hasRichText, RichText } from '@/components/templates/rich-text';

type ProjectField = 'subTitle' | 'position' | 'technologies' | 'demo';

const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * The project fields after its title and details: tagline and role, the
 * responsibilities, technologies and demo link. Each template renders it
 * under the details in its own text size/color (`className`), and `hide`s
 * whatever it already shows elsewhere. Empty fields are skipped.
 */
export function ProjectExtras({
  project,
  className,
  hide = [],
}: {
  project: ProjectItem;
  className?: string;
  hide?: ProjectField[];
}) {
  const shown = (field: ProjectField) =>
    !hide.includes(field) && !!project[field]?.trim();

  const headline = [
    shown('subTitle') && project.subTitle,
    shown('position') && project.position,
  ].filter(Boolean);
  // Imports often repeat the details as responsibilities
  const responsibilities =
    hasRichText(project.responsibilities) &&
    plain(project.responsibilities) !== plain(project.details)
      ? project.responsibilities
      : '';
  const demo = shown('demo') ? project.demo!.replace(/^https?:\/\//, '') : '';

  if (
    !headline.length &&
    !responsibilities &&
    !shown('technologies') &&
    !demo
  ) {
    return null;
  }

  return (
    <div className={cn('mt-0.5 space-y-0.5', className)}>
      {headline.length > 0 && (
        <p className='italic opacity-80'>{headline.join(' · ')}</p>
      )}
      {responsibilities && <RichText value={responsibilities} />}
      {shown('technologies') && (
        <p>
          <span className='font-semibold'>Tech: </span>
          {project.technologies}
        </p>
      )}
      {demo && <p className='opacity-80'>{demo}</p>}
    </div>
  );
}
