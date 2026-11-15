import { useEffect, useRef, type ReactElement } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Tooltip } from '@base-ui/react/tooltip';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { archive } from '../content/archive';
import type { ArchiveItem } from '../content/types';
import { Picture } from './Picture';
import { LiveButtons } from './LiveButtons';

/** Square icon button with a real tooltip on hover and keyboard focus. */
function IconButton({ label, kbd, render }: { label: string; kbd: string; render: ReactElement }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={render} aria-label={label} />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={8} className="z-[60]">
          <Tooltip.Popup className="tip">
            {label}
            <kbd>{kbd}</kbd>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/**
 * Archive quick look: a slide-over from the right, so the table stays in view.
 * Loaded on demand so Base UI stays out of the main bundle.
 */
export default function ArchiveDialog({
  index,
  onIndex,
  onReady,
}: {
  index: number | null;
  onIndex: (i: number | null) => void;
  onReady: () => void;
}) {
  useEffect(onReady, [onReady]);

  // Keep the last item on screen while the panel slides out.
  const last = useRef<ArchiveItem | null>(null);
  const lastIndex = useRef(0);
  if (index != null) {
    last.current = archive[index];
    lastIndex.current = index;
  }
  const item = last.current;
  const step = (d: number) => onIndex(index == null ? index : (index + d + archive.length) % archive.length);
  const iconBtn = 'press grid size-11 place-items-center';

  return (
    <Tooltip.Provider delay={300}>
      <Dialog.Root open={index != null} onOpenChange={(o) => !o && onIndex(null)}>
        <Dialog.Portal>
          <Dialog.Backdrop className="dlg-backdrop z-40" />
          <Dialog.Popup
            className="dlg-popup z-50 outline-none"
            onKeyDown={(e) => {
              // Keys from the prototype viewer (a portal) bubble here through React; ignore them.
              if (!e.currentTarget.contains(e.target as Node)) return;
              if (e.key === 'ArrowRight') step(1);
              if (e.key === 'ArrowLeft') step(-1);
            }}
          >
            {item && (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-rule bg-paper px-4 py-2 md:px-6">
                  <p className="label text-muted">{item.type}</p>
                  <div className="flex items-center gap-1">
                    <IconButton
                      label="Show previous project"
                      kbd="←"
                      render={
                        <button type="button" onClick={() => step(-1)} className={iconBtn}>
                          <ArrowLeft aria-hidden size={18} strokeWidth={1.75} />
                        </button>
                      }
                    />
                    <IconButton
                      label="Show next project"
                      kbd="→"
                      render={
                        <button type="button" onClick={() => step(1)} className={iconBtn}>
                          <ArrowRight aria-hidden size={18} strokeWidth={1.75} />
                        </button>
                      }
                    />
                    <IconButton
                      label="Close"
                      kbd="Esc"
                      render={
                        <Dialog.Close className={iconBtn}>
                          <X aria-hidden size={18} strokeWidth={1.75} />
                        </Dialog.Close>
                      }
                    />
                  </div>
                </div>
                <div className="bg-[#ECECE8]">
                  <Picture
                    key={item.slug}
                    image={item.image}
                    alt={item.alt}
                    sizes="(min-width: 48rem) 40rem, 100vw"
                    eager
                    placeholder={false}
                    className="mx-auto max-h-[60dvh] w-auto object-contain"
                  />
                </div>
                <div className="px-4 py-6 md:px-6">
                  <Dialog.Title className="t-h2">
                    {item.name} <span className="block text-base font-normal text-muted">{item.line}</span>
                  </Dialog.Title>
                  <Dialog.Description className="prose-col mt-3 text-base">{item.note}</Dialog.Description>
                  <dl className="surface label mt-6 grid grid-cols-[6rem_minmax(0,1fr)] gap-y-2 p-4 text-muted">
                    <dt>Role</dt>
                    <dd className="text-ink">{item.role}</dd>
                    <dt>Type</dt>
                    <dd className="text-ink">{item.type}</dd>
                    {item.status !== 'Client' && (
                      <>
                        <dt>Status</dt>
                        <dd className="text-ink">{item.status}</dd>
                      </>
                    )}
                    <dt>Year</dt>
                    <dd className="num text-ink">{item.year}</dd>
                  </dl>
                  {item.live && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      <LiveButtons demos={item.live} />
                    </div>
                  )}
                </div>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </Tooltip.Provider>
  );
}
