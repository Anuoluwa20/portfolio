import type { CSSProperties } from 'react';

/**
 * Splits text into masked words so each can rise into place.
 * `from` offsets the stagger index so several runs can share one sequence.
 * Screen readers get the plain text once; the split spans are hidden from them.
 */
export function Words({ text, from = 0, className }: { text: string; from?: number; className?: string }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i}>
            <span className="w">
              <span className="wi" style={{ '--i': from + i } as CSSProperties}>
                {w}
              </span>
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </span>
  );
}

export const wordCount = (text: string) => text.split(' ').length;
