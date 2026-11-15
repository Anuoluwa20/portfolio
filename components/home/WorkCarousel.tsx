import { Link } from 'react-router';
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { projects } from '../../content/projects';
import { Picture } from '../Picture';
import { SectionHead } from './SectionHead';
import { ProjectTags, WorkFilter, matches, warm, type Filter } from './work';
import { followPointer, useSnapTrack } from './useSnapTrack';

/**
 * (01) Selected work, after davemiye.com: a row of large rounded pictures that runs off the right
 * edge, so the next project peeks in. Scroll, drag, or use the arrows; each card snaps into place.
 * Over a picture, a round "View project" label follows the pointer. The picture is the shared
 * element that grows into the project page.
 */
export function WorkCarousel({ filter, onFilter }: { filter: Filter; onFilter: (f: Filter) => void }) {
  const visible = projects.filter((p) => matches(p, filter));
  const { track, index, atEnd, go, wasDrag, handlers } = useSnapTrack<HTMLOListElement>(filter);
  const { playing, setPlaying, segs, hold } = useAutoplay(track, index, atEnd, go, visible.length, filter);

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="pb-24 pt-8 md:pb-32"
      onFocus={() => (hold.current.focus = true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) hold.current.focus = false;
      }}
    >
      <div className="wrap">
        <SectionHead
          id="work-title"
          title="Selected work"
        >
          <WorkFilter filter={filter} onFilter={onFilter} />
        </SectionHead>
      </div>

      <ol
        ref={track}
        className="carousel sd-rise mt-10 md:mt-14"
        aria-label="Selected projects"
        {...handlers}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') hold.current.hover = true;
        }}
        onPointerLeave={() => (hold.current.hover = false)}
        onPointerDownCapture={(e) => {
          if (e.pointerType !== 'mouse') hold.current.touchAt = performance.now();
        }}
      >
        {visible.map((p, i) => (
          <li key={p.slug} className="carousel-card">
            <Link
              to={`/work/${p.slug}`}
              viewTransition
              draggable={false}
              onPointerEnter={() => warm(p)}
              onFocus={() => warm(p)}
              onClick={(e) => {
                if (wasDrag()) e.preventDefault();
              }}
              className="card group block"
            >
              <span className="card-img carousel-img block" onPointerMove={followPointer}>
                <Picture
                  image={p.cover}
                  alt=""
                  sizes="(min-width: 48rem) 46rem, 86vw"
                  eager={i < 2}
                  className="size-full object-cover"
                  vtName={`project-${p.slug}`}
                  draggable={false}
                />
                <span aria-hidden="true" className="view-bubble">
                  View project
                </span>
              </span>
              <span className="mt-4 grid gap-x-6 gap-y-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                <span className="min-w-0">
                  <span className="t-h3 block font-semibold">{p.name}</span>
                  <span className="mt-1 block text-muted">{p.line}</span>
                  <ProjectTags p={p} className="mt-2" />
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-medium md:pt-1">
                  Read case study
                  <ArrowRight aria-hidden size={16} strokeWidth={1.75} className="press group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="wrap mt-6 flex items-center gap-4 md:gap-6">
        <div ref={segs} className="wc-segs" style={{ '--t': 0 } as CSSProperties}>
          {visible.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => go(i - index)}
              aria-label={`Show ${p.name}`}
              aria-current={i === index || undefined}
              data-state={i < index ? 'done' : i === index ? 'now' : undefined}
              className="wc-seg"
            >
              <span />
            </button>
          ))}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? 'Pause the slideshow' : 'Play the slideshow'}
            aria-pressed={!playing}
            className="wc-play press grid size-11 place-items-center rounded-full border border-rule"
          >
            {playing ? <Pause aria-hidden size={16} strokeWidth={1.75} /> : <Play aria-hidden size={16} strokeWidth={1.75} />}
          </button>
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Previous project"
            className="press grid size-11 place-items-center rounded-full border border-rule disabled:opacity-35"
          >
            <ArrowLeft aria-hidden size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={atEnd || index === visible.length - 1}
            aria-label="Next project"
            className="press grid size-11 place-items-center rounded-full border border-rule disabled:opacity-35"
          >
            <ArrowRight aria-hidden size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </section>
  );
}

const STEP = 4800;

/**
 * The work row moves on by itself: every few seconds it slides to the next project and, after the
 * last, back to the first. It waits while the row is off screen, while a mouse is over it, while
 * anything inside has focus, for a few seconds after a touch, and when the tab is hidden. The bar
 * under the row fills as the next move comes up. Off for reduced motion; the pause button stops it.
 */
function useAutoplay(
  track: RefObject<HTMLOListElement | null>,
  index: number,
  atEnd: boolean,
  go: (d: number) => void,
  count: number,
  resetKey: unknown,
) {
  const [playing, setPlaying] = useState(true);
  const segs = useRef<HTMLDivElement>(null);
  const hold = useRef({ hover: false, focus: false, touchAt: -1e9, view: false });
  const t = useRef(0);
  const latest = useRef({ index, atEnd, go, count });
  latest.current = { index, atEnd, go, count };

  // Any move (arrows, drag, swipe, a click on a bar) starts the count again
  useEffect(() => {
    t.current = 0;
  }, [index, resetKey]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) setPlaying(false);
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (hold.current.view = e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [track]);

  useEffect(() => {
    const bars = segs.current;
    if (!playing) {
      bars?.style.setProperty('--t', '0');
      return;
    }
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      const h = hold.current;
      const waiting = !h.view || h.hover || h.focus || now - h.touchAt < 6000 || document.hidden;
      if (!waiting) {
        t.current += dt / STEP;
        if (t.current >= 1) {
          t.current = 0;
          const { index: i, atEnd: end, go: move, count: n } = latest.current;
          if (end || i >= n - 1) {
            track.current?.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            move(1);
          }
        }
      }
      bars?.style.setProperty('--t', t.current.toFixed(4));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, track]);

  return { playing, setPlaying, segs, hold };
}
