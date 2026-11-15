import type { CSSProperties, ReactNode } from 'react';
import { Words } from '../Words';

/**
 * Every home section opens the same way: a hairline that draws itself across, the title rising
 * word by word, and room on the right for a control. No section numbers.
 */
export function SectionHead({
  id,
  title,
  intro,
  children,
}: {
  /** Unused: sections are no longer numbered. */
  n?: string;
  id: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <div className="sh relative grid gap-x-6 gap-y-4 pt-5 md:grid-cols-12">
      <span aria-hidden="true" className="sh-line sd-draw" />
      <div className="md:col-span-8">
        <h2 id={id} className="t-section sd-words">
          <Words text={title} />
        </h2>
        {intro && (
          <p className="sd-rise mt-3 max-w-[44ch] text-muted" style={{ '--i': 1 } as CSSProperties}>
            {intro}
          </p>
        )}
      </div>
      {children && (
        <div className="sd-rise md:col-span-4 md:self-end md:justify-self-end" style={{ '--i': 2 } as CSSProperties}>
          {children}
        </div>
      )}
    </div>
  );
}
