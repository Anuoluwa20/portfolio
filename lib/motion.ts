import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True once the element has scrolled into view (fires once). */
export function useInViewOnce<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen] as const;
}

/**
 * Plays a beat sheet: returns the index of the current beat.
 * `beats` are start times in ms. Reduced motion jumps straight to the last beat.
 */
export function useBeats(run: boolean, beats: number[], runId = 0) {
  const [beat, setBeat] = useState(-1);
  useEffect(() => {
    if (!run) return;
    if (prefersReducedMotion()) {
      setBeat(beats.length - 1);
      return;
    }
    setBeat(-1);
    const timers = beats.map((at, i) => window.setTimeout(() => setBeat(i), at));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, runId]);
  return beat;
}
