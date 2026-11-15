import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';

/**
 * Shared behaviour for the horizontal card rows (Selected work, More projects): which card is in
 * front, prev/next that respects reduced motion, mouse drag to scroll, and a 0–1 scroll progress
 * written to `--p` on the track's parent (so a progress line can follow without re-rendering).
 * Touch and trackpads scroll natively.
 */
export function useSnapTrack<T extends HTMLElement>(resetKey?: unknown) {
  const track = useRef<T>(null);
  const [index, setIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const cards = [...el.children] as HTMLElement[];
    const start = el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft);
    let best = 0;
    let bestD = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.getBoundingClientRect().left - start);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setIndex(best);
    const max = el.scrollWidth - el.clientWidth;
    setAtEnd(el.scrollLeft >= max - 4);
    el.parentElement?.style.setProperty('--p', max > 0 ? (el.scrollLeft / max).toFixed(4) : '1');
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [resetKey, sync]);

  const go = (d: number) => {
    const el = track.current;
    if (!el) return;
    const cards = [...el.children] as HTMLElement[];
    const next = cards[Math.max(0, Math.min(cards.length - 1, index + d))];
    if (!next) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({
      left: next.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft),
      behavior: reduce ? 'auto' : 'smooth',
    });
  };

  const onPointerDown = (e: RPointerEvent<T>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag.current = { x: e.clientX, left: track.current!.scrollLeft, moved: false };
  };
  const onPointerMove = (e: RPointerEvent<T>) => {
    const d = drag.current;
    const el = track.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      el.dataset.dragging = '1';
      el.setPointerCapture(e.pointerId);
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const onPointerUp = () => {
    const el = track.current;
    if (el) delete el.dataset.dragging;
    // Keep the flag for the click that follows a drag, then clear it.
    window.setTimeout(() => (drag.current = null), 0);
  };

  /** True while the click in progress ends a drag (so it shouldn't open the card). */
  const wasDrag = () => !!drag.current?.moved;

  return {
    track,
    index,
    atEnd,
    go,
    wasDrag,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}

/** The round "View project" label follows the pointer inside a picture. */
export function followPointer(e: RPointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--cx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--cy', `${e.clientY - r.top}px`);
}
