import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Link } from 'react-router';
import { ArrowRight, X } from 'lucide-react';
import { img, type ImageKey } from '../../content/images';
import { Picture } from '../Picture';
import { SectionHead } from './SectionHead';

interface Piece {
  code: string;
  image: ImageKey;
  title: string;
  project: string;
  slug: string;
}

/** Posters, ads and brand sheets from the projects, catalogued like the reel (B VELORA, C Crunch House, D Confam, E Explore Africa, F MONTRA). */
const PIECES: Piece[] = [
  { code: 'B 04', image: 'velora-story', title: 'Countdown story', project: 'VELORA', slug: 'velora' },
  { code: 'C 04', image: 'crunch-ad-hero', title: 'Launch ad', project: 'Crunch House', slug: 'crunch-house' },
  { code: 'E 04', image: 'ea-poster', title: 'Dubai poster', project: 'Explore Africa', slug: 'explore-africa' },
  { code: 'F 04', image: 'montra-brand', title: 'Brand sheet', project: 'MONTRA', slug: 'montra' },
  { code: 'C 05', image: 'crunch-ad-suya', title: 'Suya Spice ad', project: 'Crunch House', slug: 'crunch-house' },
  { code: 'E 05', image: 'ea-lightbox-art', title: 'Airport lightbox', project: 'Explore Africa', slug: 'explore-africa' },
  { code: 'C 06', image: 'crunch-street', title: 'Street poster', project: 'Crunch House', slug: 'crunch-house' },
  { code: 'B 05', image: 'velora-flyer-ig', title: 'Instagram flyer', project: 'VELORA', slug: 'velora' },
  { code: 'D 03', image: 'confam-brand', title: 'Brand sheet', project: 'Confam', slug: 'confam' },
  { code: 'E 06', image: 'ea-car-1', title: 'Next gate: Dubai', project: 'Explore Africa', slug: 'explore-africa' },
  { code: 'C 07', image: 'crunch-ad-story', title: 'Story ad', project: 'Crunch House', slug: 'crunch-house' },
  { code: 'C 08', image: 'crunch-ad-atarodo', title: 'Ata Rodo ad', project: 'Crunch House', slug: 'crunch-house' },
  { code: 'C 09', image: 'crunch-flats', title: 'Pack flats', project: 'Crunch House', slug: 'crunch-house' },
  { code: 'B 06', image: 'velora-tag-back', title: 'Hang tag', project: 'VELORA', slug: 'velora' },
  { code: 'E 07', image: 'ea-brand', title: 'Brand sheet', project: 'Explore Africa', slug: 'explore-africa' },
  { code: 'E 08', image: 'ea-feed-navy', title: 'Feed post', project: 'Explore Africa', slug: 'explore-africa' },
];

// A fixed scatter (fractions of a slot) so the wall looks the same on every visit.
const JIT = [
  [0.1, -0.2, -4], [-0.25, 0.15, 3], [0.2, 0.05, -2], [-0.1, -0.15, 5], [0.15, 0.2, -3],
  [-0.2, 0.1, 2], [0.05, -0.1, -5], [0.25, 0.15, 4], [-0.15, -0.2, -2], [0.1, 0.25, 3],
  [-0.05, 0.05, -1], [0.2, -0.15, 2], [-0.2, 0.2, -4], [0.15, -0.05, 4], [-0.1, 0.2, -3],
  [0.05, -0.2, 2], [-0.2, -0.05, -5], [0.1, 0.15, 3],
];

const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * (03) Playground, after Juan Mora Romero's endlessly draggable "Lab" and Alec Tear's
 * "(touch and drag)" toy: an endless wall of the posters, ads and brand sheets. Drag it any way
 * (it keeps a little momentum), or leave it and it drifts on its own. Pieces sit in halftone until
 * you point at them; click one to see it large and in colour. Focus a piece with the keyboard and
 * the wall brings it to the middle.
 */
export function Playground() {
  const lab = useRef<HTMLDivElement>(null);
  const pieces = useRef<(HTMLButtonElement | null)[]>([]);
  const hud = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const state = useRef({ ox: 0, oy: 0, vx: 0, vy: 0, hover: false, drag: null as null | { x: number; y: number; moved: boolean; i: number | null }, goal: null as null | { x: number; y: number } });

  useEffect(() => {
    const el = lab.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = false;
    let frame = 0;
    let W = 0;
    let H = 0;
    let TW = 0;
    let TH = 0;
    let base: { x: number; y: number; w: number; h: number; r: number }[] = [];

    const layout = () => {
      W = el.clientWidth;
      H = el.clientHeight;
      const k = W < 768 ? 0.68 : 1;
      TW = Math.max(W + 380, 1900 * k);
      TH = Math.max(H + 480, 1100 * k);
      const cols = 6;
      const rows = 3;
      base = PIECES.map((p, i) => {
        const im = img(p.image);
        const ratio = im.width / im.height;
        const w = (ratio > 1.3 ? 330 : ratio < 0.6 ? 170 : 215) * k;
        const h = w / ratio;
        const [jx, jy, r] = JIT[i % JIT.length];
        const cx = ((i % cols) + 0.5 + jx) * (TW / cols);
        const cy = (Math.floor(i / cols) + 0.5 + jy) * (TH / rows);
        return { x: cx - w / 2, y: cy - h / 2, w, h, r };
      });
      pieces.current.forEach((p, i) => p && (p.style.width = `${base[i].w}px`));
    };

    const paint = () => {
      const s = state.current;
      base.forEach((b, i) => {
        const p = pieces.current[i];
        if (!p) return;
        const x = mod(b.x + s.ox + 380, TW) - 380;
        const y = mod(b.y + s.oy + 480, TH) - 480;
        p.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${b.r}deg)`;
      });
      el.style.backgroundPosition = `${s.ox}px ${s.oy}px`;
      if (hud.current && frame % 6 === 0) {
        const fx = String(Math.round(mod(-s.ox, TW))).padStart(4, '0');
        const fy = String(Math.round(mod(-s.oy, TH))).padStart(4, '0');
        hud.current.textContent = `X ${fx} · Y ${fy}`;
      }
    };

    const tick = () => {
      frame += 1;
      const s = state.current;
      if (!s.drag) {
        if (s.goal) {
          s.ox += (s.goal.x - s.ox) * 0.12;
          s.oy += (s.goal.y - s.oy) * 0.12;
          if (Math.abs(s.goal.x - s.ox) < 0.5 && Math.abs(s.goal.y - s.oy) < 0.5) s.goal = null;
        } else {
          s.ox += s.vx;
          s.oy += s.vy;
          s.vx *= 0.94;
          s.vy *= 0.94;
          if (!s.hover && !reduce) {
            s.ox -= 0.35;
            s.oy -= 0.12;
          }
        }
      }
      paint();
      if (visible) raf = requestAnimationFrame(tick);
    };

    layout();
    paint();
    const ro = new ResizeObserver(() => {
      layout();
      paint();
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    // Expose for keyboard focus: bring a piece to the middle.
    (el as HTMLDivElement & { centre?: (i: number) => void }).centre = (i: number) => {
      const b = base[i];
      const s = state.current;
      const x = mod(b.x + s.ox + 380, TW) - 380;
      const y = mod(b.y + s.oy + 480, TH) - 480;
      s.goal = { x: s.ox + (W / 2 - (x + b.w / 2)), y: s.oy + (H / 2 - (y + b.h / 2)) };
      if (!visible) paint();
    };
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open != null && !d.open) d.showModal();
    if (open == null && d.open) d.close();
  }, [open]);

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-i]');
    state.current.drag = { x: e.clientX, y: e.clientY, moved: false, i: t ? Number(t.dataset.i) : null };
    state.current.goal = null;
    state.current.vx = 0;
    state.current.vy = 0;
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const s = state.current;
    const d = s.drag;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) > 6) {
      d.moved = true;
      lab.current!.setPointerCapture(e.pointerId);
      lab.current!.dataset.dragging = '1';
    }
    if (!d.moved) return;
    s.ox += dx;
    s.oy += dy;
    s.vx = dx;
    s.vy = dy;
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onUp = () => {
    const d = state.current.drag;
    state.current.drag = null;
    if (lab.current) delete lab.current.dataset.dragging;
    if (d && !d.moved && d.i != null) setOpen(d.i);
  };

  const piece = open != null ? PIECES[open] : null;

  return (
    <section id="playground" aria-labelledby="play-title" className="pb-24 md:pb-32">
      <div className="wrap">
        <SectionHead
          id="play-title"
          title="Playground"
        >
          <p className="label text-muted">Drag to look around</p>
        </SectionHead>
      </div>

      <div className="wrap sd-rise mt-10 md:mt-14">
        <div
          ref={lab}
          className="lab"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerEnter={() => (state.current.hover = true)}
          onPointerLeave={() => (state.current.hover = false)}
        >
          {PIECES.map((p, i) => (
            <button
              key={p.image}
              ref={(n) => {
                pieces.current[i] = n;
              }}
              type="button"
              data-i={i}
              className="lab-piece"
              aria-label={`${p.project}: ${p.title}. Open large`}
              onFocus={() => (lab.current as (HTMLDivElement & { centre?: (i: number) => void }) | null)?.centre?.(i)}
              onClick={(e) => {
                // Keyboard activation only; pointer clicks are handled on release, so drags don't open pieces.
                if (e.detail === 0) setOpen(i);
              }}
            >
              <span className="ht block rounded-[6px]">
                <Picture image={p.image} alt="" sizes="22rem" className="block w-full" draggable={false} />
              </span>
            </button>
          ))}
          <p className="lab-hud label" aria-hidden="true">
            <span ref={hud}>X 0000 · Y 0000</span>
            <span>Drag ↔ ↕</span>
          </p>
        </div>
      </div>

      <dialog
        ref={dialog}
        className="play-dialog"
        aria-labelledby="play-dialog-title"
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(null);
        }}
      >
        {piece && (
          <div className="flex max-h-[92dvh] flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-rule py-1 pl-4 pr-1">
              <h3 id="play-dialog-title" className="truncate text-sm font-medium">
                {piece.project} · {piece.title}
              </h3>
              <button type="button" onClick={() => setOpen(null)} className="press label inline-flex min-h-11 items-center gap-1.5 px-3">
                <X aria-hidden size={16} strokeWidth={1.75} />
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-l1">
              <Picture image={piece.image} alt={`${piece.project}: ${piece.title}.`} sizes="90vw" className="mx-auto max-h-[78dvh] w-auto" placeholder={false} />
            </div>
            <div className="flex justify-end border-t border-rule px-4 py-2">
              <Link to={`/work/${piece.slug}`} onClick={() => setOpen(null)} className="press inline-flex min-h-11 items-center gap-2 text-sm font-medium">
                Open the {piece.project} case study
                <ArrowRight aria-hidden size={16} strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
