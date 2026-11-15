import { useEffect, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { useBeats, useInViewOnce, prefersReducedMotion } from '../../lib/motion';
import { Words } from '../Words';

const HANDLE = '@glowgadgets_demo';
const SOURCES = [
  { name: 'TikTok', note: 'Videos and comments', found: 1 },
  { name: 'X', note: 'Posts and replies', found: 1 },
  { name: 'Instagram and Facebook', note: 'Comments and call-outs', found: 0 },
  { name: 'Nairaland and the web', note: 'Threads and forums', found: 1 },
];
// Sample call-outs shown in the Confam prototype
const POSTS = [
  { where: 'TikTok · 14 Oct', text: 'Paid ₦185,000 for a phone. Tracking never worked.' },
  { where: 'X · 26 Sep', text: 'Three weeks now. No order from this page.' },
  { where: 'Nairaland · 6 Sep', text: 'Got one power bank, and the wrong brand.' },
];
// Beat sheet (ms): type the handle, sweep four sources, land the result, drop three posts
const BEATS = [0, 1000, 1350, 1700, 2050, 2500, 2700, 2900, 3100];

/** Confam: a lens sweeps where a check looks, then the posts it found drop in. */
export function ScanDemo() {
  const [ref, seen] = useInViewOnce<HTMLDivElement>(0.45);
  const [runId, setRunId] = useState(0);
  const [armed, setArmed] = useState(false);
  useEffect(() => setArmed(true), []);
  const beat = useBeats(seen, BEATS, runId);
  const done = !armed ? BEATS.length - 1 : beat;

  // Typewriter for the handle during the first beat
  const [typed, setTyped] = useState(HANDLE);
  useEffect(() => {
    if (!armed) return;
    if (!seen || prefersReducedMotion()) {
      setTyped(seen ? HANDLE : '');
      return;
    }
    setTyped('');
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setTyped(HANDLE.slice(0, n));
      if (n >= HANDLE.length) window.clearInterval(id);
    }, 50);
    return () => window.clearInterval(id);
  }, [armed, seen, runId]);

  const scanning = done >= 1 && done <= 4 ? done - 1 : -1;
  const level = done >= 5;

  return (
    <section aria-labelledby="scan-title" className="wrap">
      <div className="mb-8 grid gap-2 xl:grid-cols-[13rem_minmax(0,1fr)] xl:gap-12">
        <p className="label pt-1">
          <span aria-hidden="true" className="mr-2 inline-block size-2 translate-y-[-1px] bg-[var(--ac)]" />
          How a check feels
        </p>
        <h2 id="scan-title" className="display sd-words t-display-2 max-w-[20ch]">
          <Words text="Paste the handle. See what buyers already said." />
        </h2>
      </div>

      <figure ref={ref} className="grid gap-4 md:grid-cols-2">
        <div aria-hidden="true" className="surface p-6">
          <p className="label muted">New check</p>
          <div className="mt-3 flex min-h-12 items-center gap-2 border border-[var(--ru)] bg-white px-4">
            <Search size={16} strokeWidth={1.75} className="muted" />
            <span className="mono">{typed}</span>
            <span className="h-5 w-px bg-[var(--fg)]" />
          </div>
          <div className="mt-3 flex min-h-11 items-center justify-center bg-[#FFC21A] text-sm font-medium text-[#14161F]">
            Check am
          </div>

          <p className="label muted mt-6">Where a check looks</p>
          <ul className="relative mt-2">
            <span
              className="lens absolute -left-1 top-0 grid size-10 place-items-center rounded-full bg-[#14161F] text-[#FFC21A]"
              style={{ transform: `translateY(${Math.max(scanning, 0) * 56}px)`, opacity: scanning >= 0 ? 1 : 0 }}
            >
              <Search size={16} strokeWidth={2} />
            </span>
            {SOURCES.map((s, i) => {
              const checked = done >= i + 2 || (done >= 5 && i === 3);
              return (
                <li key={s.name} className="flex h-14 items-center justify-between gap-4 border-b border-[var(--ru)] pl-12 last:border-b-0">
                  <span>
                    <span className="block text-sm font-medium">{s.name}</span>
                    <span className="block text-xs muted">{s.note}</span>
                  </span>
                  <span className={`scan-count label ${checked ? 'is-on' : ''}`}>
                    {s.found ? `${s.found} post` : 'No posts'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div aria-hidden="true" className="surface flex flex-col p-6">
          <p className="label muted">Result for {HANDLE}</p>
          <p className={`scan-level t-h2 mt-3 ${level ? 'is-on' : ''}`}>A few public posts</p>
          <ul className="mt-4 grid gap-3">
            {POSTS.map((p, i) => (
              <li key={p.where} className={`scan-post border border-[var(--ru)] bg-white p-4 ${done >= 6 + i ? 'is-on' : ''}`}>
                <p className="label text-[#B5300B]">{p.where}</p>
                <p className="mt-1 text-sm">{p.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-auto pt-6 text-sm muted">
            We never say “safe”. A clean result means nothing turned up where we looked.
          </p>
        </div>
        <figcaption className="flex flex-wrap items-center justify-between gap-4 text-sm muted md:col-span-2">
          <span>
            A check for {HANDLE} finds three public call-outs across TikTok, X and Nairaland. Sample data from the
            Confam prototype.
          </span>
          <button
            type="button"
            onClick={() => setRunId((n) => n + 1)}
            className="btn press text-[var(--fg)]"
          >
            <RotateCcw aria-hidden size={16} strokeWidth={1.75} />
            Run the check again
          </button>
        </figcaption>
      </figure>
    </section>
  );
}
