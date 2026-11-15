import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import { site } from '../content/site';
import { Clock } from './Clock';

const NAV = [
  { label: 'Home', hash: '#home' },
  { label: 'Work', hash: '#work' },
  { label: 'Playground', hash: '#playground' },
  { label: 'Services', hash: '#services' },
  { label: 'Skills', hash: '#skills' },
  { label: 'About', hash: '#about' },
  { label: 'Contact', hash: '#contact' },
];

/**
 * Section links as on the reference the owner chose, plus Playground. From 768px they sit in the bar; below
 * that they fold into a Menu button that opens a panel under the bar.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Close after any navigation.
  useEffect(() => setOpen(false), [location.key]);

  // Escape closes the panel and puts focus back on the button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const link = 'nav-link press inline-flex min-h-11 items-center text-ink/75 hover:text-ink';

  return (
    <header className="site-header sticky top-0 z-30 border-b border-rule bg-paper">
      <div className="gutter flex h-14 items-center justify-between gap-4">
        <Link
          to={{ pathname: '/', hash: '#home' }}
          className="press inline-flex min-h-11 items-center whitespace-nowrap text-sm font-medium tracking-[-0.01em] md:text-base"
        >
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex xl:gap-3">
          {NAV.map((n) => (
            <Link key={n.label} to={{ pathname: '/', hash: n.hash }} className={`${link} px-2 text-sm xl:text-base`}>
              {n.label}
            </Link>
          ))}
          <Clock className="label ml-3 hidden text-muted xl:inline-flex xl:items-center" />
        </nav>

        <button
          ref={button}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
          className="press -mr-2 inline-flex min-h-11 items-center gap-2 px-2 text-sm md:hidden"
        >
          {open ? <X aria-hidden size={18} strokeWidth={1.75} /> : <Menu aria-hidden size={18} strokeWidth={1.75} />}
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <nav id="mobile-nav" aria-label="Main" hidden={!open} className="mobile-nav absolute inset-x-0 top-full max-h-[calc(100svh-var(--header-h))] overflow-y-auto border-y border-rule bg-paper md:hidden">
        <ul className="gutter py-2">
          {NAV.map((n) => (
            <li key={n.label} className="border-b border-rule last:border-b-0">
              <Link
                to={{ pathname: '/', hash: n.hash }}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center text-2xl font-semibold tracking-[-0.02em]"
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="gutter label flex justify-between border-t border-rule py-4 text-muted">
          <span>{site.location}</span>
          <Clock className="inline-flex items-center" />
        </p>
      </nav>
    </header>
  );
}
