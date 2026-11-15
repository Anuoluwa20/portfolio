import { lazy, Suspense, useCallback, useEffect, useState, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { archive } from '../content/archive';
import type { ArchiveItem } from '../content/types';
import { Picture } from '../components/Picture';
import { useTitle } from '../lib/nav';

const loadDialog = () => import('../components/ArchiveDialog');
const ArchiveDialog = lazy(loadDialog);

type Kind = 'all' | 'mobile' | 'web';
const KINDS: { value: Kind; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'web', label: 'Web' },
];
const isKind = (a: ArchiveItem, k: Kind) =>
  k === 'all' || (k === 'mobile' ? a.type.startsWith('Mobile') : !a.type.startsWith('Mobile'));

/** Archive: the earlier work as a grid of captioned pictures. Each one opens a slide-over quick look. */
export default function Archive() {
  useTitle('Archive');
  const [kind, setKind] = useState<Kind>('all');
  const [open, setOpen] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<number | null>(null);
  const [showPending, setShowPending] = useState(false);

  const warm = () => {
    if (!mounted) loadDialog();
  };
  const openAt = (i: number) => {
    setMounted(true);
    setOpen(i);
    if (!ready) setPending(i);
  };
  const onReady = useCallback(() => {
    setReady(true);
    setPending(null);
  }, []);

  // /archive#slug (linked from the home page) opens that project straight away.
  const { hash } = useLocation();
  useEffect(() => {
    const i = archive.findIndex((a) => `#${a.slug}` === hash);
    if (i >= 0) openAt(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  // Show "Opening…" only if loading the viewer takes longer than 100ms.
  useEffect(() => {
    if (pending == null) return setShowPending(false);
    const t = window.setTimeout(() => setShowPending(true), 100);
    return () => window.clearTimeout(t);
  }, [pending]);

  return (
    <div className="wrap pb-24 pt-6">
      <Link
        to={{ pathname: '/', hash: '#work' }}
        viewTransition
        className="press -ml-1 inline-flex min-h-11 items-center gap-2 px-1 text-sm"
      >
        <ArrowLeft aria-hidden size={16} strokeWidth={1.75} />
        Back to selected work
      </Link>
      <header className="mt-8 grid gap-x-6 gap-y-4 border-t border-rule pt-5 md:mt-12 md:grid-cols-12">
        <p className="label text-muted md:col-span-2 md:pt-3">Archive</p>
        <div className="md:col-span-6">
          <h1 className="t-section">Earlier product and UI work</h1>
          <p className="label mt-3 text-muted">{archive.length} projects</p>
        </div>
        <div className="md:col-span-4 md:self-end md:justify-self-end">
          <div role="group" aria-label="Filter the archive by platform" className="seg">
            {KINDS.map((k) => (
              <button key={k.value} type="button" aria-pressed={kind === k.value} onClick={() => setKind(k.value)} className="press">
                {k.label}
                <span className="num ml-2 opacity-60">{archive.filter((a) => isKind(a, k.value)).length}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <ul className="mt-10 grid gap-x-6 gap-y-12 md:mt-14 md:grid-cols-2 xl:grid-cols-3">
        {archive.map((a, i) =>
          isKind(a, kind) ? (
            <li key={a.slug} className="sd-rise" style={{ '--i': i % 3 } as CSSProperties}>
              <button
                type="button"
                onClick={() => openAt(i)}
                onPointerEnter={warm}
                onFocus={warm}
                aria-haspopup="dialog"
                aria-busy={pending === i}
                className="card group block w-full text-left"
              >
                <span className="card-img block aspect-[4/3] overflow-hidden rounded-[10px] border border-rule bg-l1">
                  <Picture
                    image={a.image}
                    alt=""
                    sizes="(min-width: 80rem) 24rem, (min-width: 48rem) 50vw, 100vw"
                    eager={i < 3}
                    className="size-full object-cover"
                  />
                </span>
                {pending === i && showPending && <span className="label mt-4 block text-muted">Opening…</span>}
                <span className="t-h2 mt-4 block font-semibold tracking-[-0.02em]">
                  <span className="sr-only">Open </span>
                  {a.name}
                </span>
                <span className="mt-1 block text-muted">{a.line}</span>
                <span className="label mt-3 flex flex-wrap gap-x-3 text-muted">
                  <span>{a.type}</span>
                  {a.status !== 'Client' && (
                    <>
                      <span aria-hidden>/</span>
                      <span>{a.status}</span>
                    </>
                  )}
                  <span aria-hidden>/</span>
                  <span className="num">{a.year}</span>
                </span>
              </button>
            </li>
          ) : null,
        )}
      </ul>

      {mounted && (
        <Suspense fallback={null}>
          <ArchiveDialog index={open} onIndex={setOpen} onReady={onReady} />
        </Suspense>
      )}
    </div>
  );
}
