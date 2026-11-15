import { useEffect } from 'react';
import { site } from '../content/site';

/** The project the visitor last opened, so the index can morph back into the right preview. */
let lastProject: string | undefined;
export const setLastProject = (slug: string) => {
  lastProject = slug;
};
export const getLastProject = () => lastProject;

export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${site.name}` : `${site.name} — ${site.role}`;
  }, [title]);
}
