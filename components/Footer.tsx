import { Link, useLocation } from 'react-router';
import { replayIntro } from './home/Intro';
import { site } from '../content/site';

/** Ends every page with the name set large, in the ink colour. */
export function Footer() {
  const home = useLocation().pathname === '/';
  return (
    <footer className="bg-paper text-ink">
      <div className="gutter overflow-hidden pb-4 pt-12" aria-hidden="true">
        <p className="wordmark sd-stretch text-[9vw] text-ink">{site.name}</p>
      </div>
      <div className="gutter label flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-rule py-6 text-muted">
        <p>© 2026 {site.fullName}</p>
        <div className="flex flex-wrap items-center gap-x-8">
          {home && (
            <button type="button" onClick={replayIntro} className="link inline-flex min-h-11 items-center uppercase">
              Replay the intro
            </button>
          )}
          <Link to="/archive" viewTransition className="link inline-flex min-h-11 items-center">
            Browse earlier work
          </Link>
        </div>
      </div>
    </footer>
  );
}
