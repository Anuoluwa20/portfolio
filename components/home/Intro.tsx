import { useEffect, useRef, useState } from 'react';
import { ASSET_BASE } from '../../content/images';
import { introVideo, site } from '../../content/site';

/**
 * Opening, played once per session on the home page: a red velvet stage curtain.
 * Beat sheet: the curtain hangs closed under a warm spotlight while the page loads → the seam
 * parts and a red rotary phone pushes through, dials 0-8-0 (the dial springing back each time),
 * rings, and is pulled back (drawn in SVG; the owner's film replaces this once added) → the
 * curtain opens, each half gathering up and out to its side like a theatre
 * curtain, and the hero name rises behind it. When there's a film, its last frame (the closed
 * curtain) is split down the middle and the two halves are what open, so the cut is invisible.
 * Skippable by button, any key or a click. Never plays with reduced motion.
 */
const OPEN_MS = 1700;
const MIN_HOLD = 1100;
const MAX_WAIT = 2600;

/** Play the opening again (the footer has a link for it). */
export function replayIntro() {
  window.dispatchEvent(new Event('replay-intro'));
}

/* ---------- The telephone (drawn, until the owner's film is added) ---------- */
const CX = 160;
const CY = 206;
/** Finger-hole angles: 1 at about three o'clock, round anticlockwise to 0 next to the finger stop. */
const HOLES = Array.from({ length: 10 }, (_, i) => ({ digit: (i + 1) % 10, deg: -5 - 30 * i }));
const at = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
};
/** A coiled cord from the handset down into the gap in the curtain. */
const CORD = (() => {
  const P = [
    [52, 138],
    [2, 220],
    [70, 330],
    [160, 470],
  ];
  const pts: string[] = [];
  const N = 260;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const u = 1 - t;
    const bx = u ** 3 * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t ** 3 * P[3][0];
    const by = u ** 3 * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t ** 3 * P[3][1];
    const dx = 3 * u * u * (P[1][0] - P[0][0]) + 6 * u * t * (P[2][0] - P[1][0]) + 3 * t * t * (P[3][0] - P[2][0]);
    const dy = 3 * u * u * (P[1][1] - P[0][1]) + 6 * u * t * (P[2][1] - P[1][1]) + 3 * t * t * (P[3][1] - P[2][1]);
    const len = Math.hypot(dx, dy) || 1;
    const off = 6.5 * Math.sin(t * Math.PI * 2 * 30);
    pts.push(`${(bx - (dy / len) * off).toFixed(1)},${(by + (dx / len) * off).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
})();

function RotaryPhone() {
  return (
    <svg className="cu-phone-svg" viewBox="0 0 320 352" aria-hidden="true">
      <defs>
        <linearGradient id="cu-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6222f" />
          <stop offset="0.55" stopColor="#a30f1c" />
          <stop offset="1" stopColor="#62040e" />
        </linearGradient>
        <linearGradient id="cu-hand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#de2a36" />
          <stop offset="1" stopColor="#860915" />
        </linearGradient>
        <radialGradient id="cu-plate" cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#f6eddc" />
          <stop offset="1" stopColor="#d6c29e" />
        </radialGradient>
        <radialGradient id="cu-wheel" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#c51b28" />
          <stop offset="1" stopColor="#7c0812" />
        </radialGradient>
        <mask id="cu-holes">
          <circle cx={CX} cy={CY} r="53" fill="#fff" />
          {HOLES.map((h) => {
            const p = at(h.deg, 37);
            return <circle key={h.digit} cx={p.x} cy={p.y} r="8.6" fill="#000" />;
          })}
          <circle cx={CX} cy={CY} r="17" fill="#000" />
        </mask>
      </defs>

      <path className="cu-cord" d={CORD} />

      {/* Base */}
      <path d="M42 252 Q38 166 84 134 L236 134 Q282 166 278 252 Q278 270 260 272 L60 272 Q42 270 42 252 Z" fill="url(#cu-body)" />
      <rect x="54" y="266" width="212" height="12" rx="6" fill="#4a030a" />
      <ellipse cx="160" cy="152" rx="96" ry="14" fill="#fff" opacity="0.16" />
      <rect x="96" y="124" width="20" height="16" rx="6" fill="#7a0611" />
      <rect x="204" y="124" width="20" height="16" rx="6" fill="#7a0611" />

      {/* Number card, then the finger wheel that turns over it */}
      <circle cx={CX} cy={CY} r="51" fill="url(#cu-plate)" />
      {HOLES.map((h) => {
        const p = at(h.deg, 37);
        return (
          <text key={h.digit} x={p.x} y={p.y + 3.4} textAnchor="middle" className="cu-digit">
            {h.digit}
          </text>
        );
      })}
      <g className="cu-wheel" style={{ transformOrigin: `${CX}px ${CY}px` }}>
        <circle cx={CX} cy={CY} r="53" fill="url(#cu-wheel)" mask="url(#cu-holes)" />
        {HOLES.map((h) => {
          const p = at(h.deg, 37);
          return <circle key={h.digit} cx={p.x} cy={p.y} r="8.6" fill="none" stroke="#3d0208" strokeOpacity="0.5" strokeWidth="1.2" />;
        })}
        <circle cx={CX} cy={CY} r="53" fill="none" stroke="#f0d9b8" strokeOpacity="0.35" strokeWidth="1.5" />
      </g>
      <circle cx={CX} cy={CY} r="15" fill="#f1e6d3" stroke="#b8904c" strokeWidth="1.6" />
      <circle cx={CX} cy={CY} r="4" fill="#b8904c" />
      {(() => {
        const a = at(58, 45);
        const b = at(58, 60);
        return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#cdb27a" strokeWidth="5" strokeLinecap="round" />;
      })()}

      {/* Handset on the cradle */}
      <g className="cu-handset" style={{ transformOrigin: '160px 116px' }}>
        <path d="M74 120 Q160 80 246 120" fill="none" stroke="url(#cu-hand)" strokeWidth="24" strokeLinecap="round" />
        <ellipse cx="62" cy="126" rx="38" ry="19" fill="url(#cu-hand)" />
        <ellipse cx="258" cy="126" rx="38" ry="19" fill="url(#cu-hand)" />
        <path d="M86 104 Q160 74 234 104" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Intro() {
  const [on, setOn] = useState(true);
  const [run, setRun] = useState(0);
  const [film, setFilm] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const done = useRef(false);

  // Replay: back to the top, curtain closed, run again
  useEffect(() => {
    const replay = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const html = document.documentElement;
      window.scrollTo({ top: 0, behavior: 'auto' });
      html.classList.remove('intro-seen', 'intro-open');
      html.classList.add('intro-playing');
      done.current = false;
      setFilm(null);
      setOn(true);
      setRun((r) => r + 1);
    };
    window.addEventListener('replay-intro', replay);
    return () => window.removeEventListener('replay-intro', replay);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains('intro-playing')) {
      setOn(false);
      return;
    }
    html.classList.add('intro-js');
    const el = root.current!;
    const count = el.querySelector('.cu-count') as HTMLElement;
    const timers: number[] = [];
    const t0 = performance.now();
    let raf = 0;
    let opening = false;

    const end = () => {
      if (done.current) return;
      done.current = true;
      try {
        sessionStorage.setItem('introSeen-curtain', '1');
      } catch {
        /* private mode: the intro may replay, which is harmless */
      }
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      html.classList.remove('intro-playing', 'intro-open');
      html.classList.add('intro-seen');
      setOn(false);
    };

    /** Part the curtain: both halves gather out to the sides; the hero plays in behind. */
    const open = (fast = false) => {
      if (opening) return;
      opening = true;
      cancelAnimationFrame(raf);
      el.dataset.state = 'open';
      el.style.setProperty('--open', `${fast ? 700 : OPEN_MS}ms`);
      html.classList.add('intro-open');
      timers.push(window.setTimeout(end, (fast ? 700 : OPEN_MS) + 80));
    };

    /** The film's last frame becomes the two curtain halves, cropped exactly as the film was shown. */
    const freezeLastFrame = () => {
      const v = video.current;
      if (!v || !v.videoWidth) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const c = document.createElement('canvas');
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const s = Math.max(c.width / v.videoWidth, c.height / v.videoHeight);
      const dw = v.videoWidth * s;
      const dh = v.videoHeight * s;
      ctx.drawImage(v, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh);
      try {
        el.style.setProperty('--frame', `url(${c.toDataURL('image/jpeg', 0.86)})`);
        el.dataset.frame = '1';
      } catch {
        /* drawing failed: the velvet made in CSS opens instead */
      }
    };

    /** The drawn telephone: pushed through the seam, dials 0-8-0, rings, pulled back. */
    const anims: Animation[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));
    const run = (node: Element, k: Keyframe[], o: KeyframeAnimationOptions) => {
      const a = node.animate(k, { fill: 'forwards', ...o });
      anims.push(a);
      return a.finished.then(() => undefined);
    };
    const playPhone = async () => {
      const phone = el.querySelector('.cu-phone');
      const wheel = el.querySelector('.cu-wheel');
      const handset = el.querySelector('.cu-handset');
      if (!phone || !wheel || !handset) return open();
      try {
        el.dataset.state = 'phone';
        await wait(260);
        await run(phone, [
          { transform: 'translateY(16%) scale(0.72)', opacity: 0, filter: 'brightness(0.35)' },
          { transform: 'none', opacity: 1, filter: 'brightness(1)' },
        ], { duration: 720, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
        await wait(160);
        for (const digit of [0, 8, 0]) {
          const deg = 30 * ((digit === 0 ? 10 : digit) + 1);
          await run(wheel, [{ transform: 'rotate(0deg)' }, { transform: `rotate(${deg}deg)` }], {
            duration: 150 + deg * 0.62,
            easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
          });
          await wait(70);
          await run(wheel, [{ transform: `rotate(${deg}deg)` }, { transform: 'rotate(0deg)' }], {
            duration: 120 + deg * 0.5,
            easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
          });
          await wait(90);
        }
        await run(handset, [
          { transform: 'rotate(0)' },
          { transform: 'translateY(-5px) rotate(-3deg)' },
          { transform: 'translateY(-3px) rotate(3deg)' },
          { transform: 'translateY(-5px) rotate(-3deg)' },
          { transform: 'translateY(-3px) rotate(3deg)' },
          { transform: 'translateY(-5px) rotate(-2deg)' },
          { transform: 'rotate(0)' },
        ], { duration: 560, easing: 'linear' });
        await wait(140);
        await run(phone, [
          { transform: 'none', opacity: 1, filter: 'brightness(1)' },
          { transform: 'translateY(12%) scale(0.74)', opacity: 0, filter: 'brightness(0.35)' },
        ], { duration: 460, easing: 'cubic-bezier(0.7, 0, 0.84, 0)' });
        el.dataset.state = 'closed';
        await wait(320);
        open();
      } catch {
        /* skipped part-way: the skip handler opens the curtain */
      }
    };

    const skip = () => {
      if (el.dataset.state === 'film') freezeLastFrame();
      anims.forEach((a) => a.cancel());
      open(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') return;
      skip();
    };
    window.addEventListener('keydown', onKey);

    // While the page loads: a small counter on the curtain, then either the film or the opening.
    let loaded = document.readyState === 'complete';
    const onLoad = () => (loaded = true);
    window.addEventListener('load', onLoad, { once: true });
    const tick = () => {
      const t = performance.now() - t0;
      const p = loaded ? Math.min(1, t / MIN_HOLD) : Math.min(0.92, t / MAX_WAIT);
      count.textContent = `${String(Math.round(p * 100)).padStart(3, '0')}%`;
      if ((loaded && t >= MIN_HOLD) || t >= MAX_WAIT) {
        count.textContent = '100%';
        if (introVideo) {
          const tall = window.innerWidth / window.innerHeight < 0.9;
          setFilm(`${ASSET_BASE}${tall ? introVideo.tall : introVideo.wide}`);
          el.dataset.state = 'film';
        } else {
          playPhone();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    (el as HTMLDivElement & { __open?: () => void; __freeze?: () => void }).__open = () => open();
    (el as HTMLDivElement & { __freeze?: () => void }).__freeze = freezeLastFrame;

    (el as HTMLDivElement & { __skip?: () => void }).__skip = skip;

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('load', onLoad);
    };
  }, [run]);

  if (!on) return null;

  const el = root.current as (HTMLDivElement & { __open?: () => void; __freeze?: () => void }) | null;

  return (
    <div
      ref={root}
      className="intro cu"
      data-state="closed"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('.cu-sound')) return;
        (root.current as (HTMLDivElement & { __skip?: () => void }) | null)?.__skip?.();
      }}
    >
      <div className="cu-back" aria-hidden="true" />
      <div className="cu-half cu-l" aria-hidden="true">
        <span className="cu-velvet" />
      </div>
      <div className="cu-half cu-r" aria-hidden="true">
        <span className="cu-velvet" />
      </div>
      <div className="cu-pelmet" aria-hidden="true" />
      <div className="cu-light" aria-hidden="true" />
      {!film && (
        <div className="cu-phone" aria-hidden="true">
          <RotaryPhone />
        </div>
      )}

      {film && (
        <video
          ref={video}
          className="cu-film"
          src={film}
          autoPlay
          muted={muted}
          playsInline
          preload="auto"
          aria-hidden="true"
          onEnded={() => {
            el?.__freeze?.();
            el?.__open?.();
          }}
          onError={() => el?.__open?.()}
        />
      )}

      <p className="cu-count label num" aria-hidden="true">
        000%
      </p>
      {film && (
        <button type="button" className="cu-sound label press" onClick={() => setMuted((m) => !m)} aria-pressed={!muted}>
          {muted ? 'Sound on' : 'Sound off'}
        </button>
      )}
      <button type="button" className="intro-skip cu-skip label press">
        Skip intro
      </button>
      <span className="sr-only">
        {site.name}, {site.role}. Intro playing; press any key to skip.
      </span>
    </div>
  );
}
