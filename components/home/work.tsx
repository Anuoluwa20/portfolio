import { projects } from '../../content/projects';
import { preload } from '../../content/images';
import type { Project } from '../../content/types';
import { HERO_SIZES } from '../Picture';

export type Filter = 'all' | 'product' | 'brand';

const FILTERS: { value: Filter; label: string; short: string }[] = [
  { value: 'all', label: 'All', short: 'All' },
  { value: 'product', label: 'Product', short: 'Product' },
  { value: 'brand', label: 'Brand & packaging', short: 'Brand' },
];

export const matches = (p: Project, f: Filter) => f === 'all' || p.tracks.includes(f);
const count = (f: Filter) => projects.filter((p) => matches(p, f)).length;

/** Warm the project hero image before the click. */
export const warm = (p: Project) => preload(p.cover, p.mode === 'gallery' ? '100vw' : HERO_SIZES);

export function WorkFilter({ filter, onFilter }: { filter: Filter; onFilter: (f: Filter) => void }) {
  return (
    <div role="group" aria-label="Filter projects by discipline" className="seg">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          aria-pressed={filter === f.value}
          onClick={() => onFilter(f.value)}
          className="press"
        >
          <span className="md:hidden">{f.short}</span>
          <span className="hidden md:inline">{f.label}</span>
          <span className="num ml-2 opacity-60">{count(f.value)}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * The labels under a project name. Status is shown only for work that wasn't for a client
 * (Design challenge, Self-initiated), so concepts stay labelled as concepts.
 */
export function ProjectTags({ p, className = '' }: { p: Project; className?: string }) {
  return (
    <span className={`label flex flex-wrap items-center gap-x-3 gap-y-1 text-muted ${className}`}>
      <span>{p.types.join(' · ')}</span>
      {p.status !== 'Client' && (
        <>
          <span aria-hidden>/</span>
          <span>{p.status}</span>
        </>
      )}
      {p.live && (
        <>
          <span aria-hidden>/</span>
          <span className="text-ink">Live prototype</span>
        </>
      )}
    </span>
  );
}
