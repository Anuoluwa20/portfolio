import { lazy, Suspense, useState } from 'react';
import { Play } from 'lucide-react';
import type { LiveDemo } from '../content/types';

const load = () => import('./LiveViewer');
const LiveViewer = lazy(load);

/** Buttons that open working prototypes in the full-screen viewer. The first is the primary one. */
export function LiveButtons({ demos, solidFirst = true }: { demos: LiveDemo[]; solidFirst?: boolean }) {
  const [open, setOpen] = useState<LiveDemo | null>(null);
  const [mounted, setMounted] = useState(false);

  return (
    <>
      {demos.map((d, i) => (
        <button
          key={d.path}
          type="button"
          onPointerEnter={load}
          onFocus={load}
          onClick={() => {
            setMounted(true);
            setOpen(d);
          }}
          className={`pill press ${solidFirst && i === 0 ? 'pill-solid' : ''}`}
        >
          <span className="pill-roll">
            <span>{d.label}</span>
            <span aria-hidden="true">{d.label}</span>
          </span>
          <span className="pill-ico">
            <Play aria-hidden size={14} strokeWidth={2} />
          </span>
        </button>
      ))}
      {mounted && (
        <Suspense fallback={null}>
          <LiveViewer demo={open} onClose={() => setOpen(null)} />
        </Suspense>
      )}
    </>
  );
}
