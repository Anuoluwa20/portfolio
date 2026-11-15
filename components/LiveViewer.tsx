import { useRef } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { ArrowUpRight, X } from 'lucide-react';
import type { LiveDemo } from '../content/types';

export const liveHref = (path: string) => `${import.meta.env.BASE_URL}live/${path}`;

/**
 * Full-screen viewer for a working prototype kept in /public/live.
 * The prototype runs in an iframe, so the visitor never leaves the portfolio.
 * Loaded on demand so Base UI stays out of the main bundle.
 */
export default function LiveViewer({ demo, onClose }: { demo: LiveDemo | null; onClose: () => void }) {
  // Keep the last prototype on screen while the viewer fades out.
  const last = useRef<LiveDemo | null>(null);
  if (demo) last.current = demo;
  const d = last.current;
  const bar = 'press label inline-flex min-h-11 items-center gap-1.5 px-3';

  return (
    <Dialog.Root open={demo != null} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="live-backdrop z-[70]" />
        <Dialog.Popup className="live-popup z-[80] outline-none">
          {d && (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-rule bg-paper py-1 pr-1 pl-4 md:pl-6">
                <Dialog.Title className="truncate text-sm font-medium">{d.title}</Dialog.Title>
                <Dialog.Description className="sr-only">
                  A working prototype. Use the Close button to go back to the portfolio.
                </Dialog.Description>
                <div className="flex shrink-0 items-center">
                  <a href={liveHref(d.path)} target="_blank" rel="noreferrer" className={`${bar} max-md:hidden`}>
                    Open in a new tab
                    <ArrowUpRight aria-hidden size={14} strokeWidth={1.75} />
                  </a>
                  <Dialog.Close className={bar}>
                    <X aria-hidden size={16} strokeWidth={1.75} />
                    Close
                  </Dialog.Close>
                </div>
              </div>
              <iframe key={d.path} src={liveHref(d.path)} title={d.title} className="live-frame" />
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
