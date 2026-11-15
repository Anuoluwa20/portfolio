import { useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Picture } from '../Picture';
import { img, type ImageKey } from '../../content/images';
import { prefersReducedMotion } from '../../lib/motion';

const FLAVOURS: {
  id: string;
  short: string;
  name: string;
  note: string;
  line: string;
  colour: string;
  bag: ImageKey;
}[] = [
  {
    id: 'classic',
    short: 'Classic',
    name: 'Classic Salted',
    note: 'Sea salt · blue band',
    line: 'The one that started the noise.',
    colour: '#16439F',
    bag: 'crunch-bag-classic',
  },
  {
    id: 'suya',
    short: 'Suya',
    name: 'Suya Spice',
    note: 'Yaji spiced · ember band',
    line: 'Suya spot energy. In a bag.',
    colour: '#6E230D',
    bag: 'crunch-bag-suya',
  },
  {
    id: 'atarodo',
    short: 'Ata Rodo',
    name: 'Ata Rodo Hot Pepper',
    note: 'Scotch bonnet · green band',
    line: 'Hot enough to wake the neighbours.',
    colour: '#0E6536',
    bag: 'crunch-bag-atarodo',
  },
];

// Where each crisp flies on a swap (offsets from the pack centre)
const CRISPS = [
  { x: '-11rem', y: '-7rem', r: '-140deg', s: 1 },
  { x: '10rem', y: '-9rem', r: '120deg', s: 0.8 },
  { x: '-12rem', y: '5rem', r: '200deg', s: 0.7 },
  { x: '11rem', y: '6rem', r: '-90deg', s: 1.1 },
  { x: '-3rem', y: '-12rem', r: '60deg', s: 0.6 },
  { x: '4rem', y: '11rem', r: '-170deg', s: 0.9 },
];

/**
 * The one interactive moment on the packaging page. Pick a flavour: its colour floods out from the
 * button you pressed, the pack drops in with a little bounce and a few crisps fly.
 */
export function FlavourSwitcher() {
  const [id, setId] = useState(FLAVOURS[0].id);
  const [base, setBase] = useState(FLAVOURS[0].colour);
  const [flood, setFlood] = useState<{ n: number; x: number; y: number; d: number } | null>(null);
  const section = useRef<HTMLElement>(null);
  const current = FLAVOURS.find((f) => f.id === id)!;
  const crisp = img('crunch-crisp');

  function pick(f: (typeof FLAVOURS)[number], e: MouseEvent<HTMLButtonElement>) {
    if (f.id === id) return;
    const sec = section.current!.getBoundingClientRect();
    const btn = e.currentTarget.getBoundingClientRect();
    const x = btn.left + btn.width / 2 - sec.left;
    const y = btn.top + btn.height / 2 - sec.top;
    // Circle big enough to cover the section from the button's centre
    const d = 2 * Math.hypot(Math.max(x, sec.width - x), Math.max(y, sec.height - y));
    setBase(current.colour);
    setId(f.id);
    if (prefersReducedMotion()) {
      setBase(f.colour);
      setFlood(null);
    } else {
      setFlood({ n: (flood?.n ?? 0) + 1, x, y, d });
    }
  }

  return (
    <section
      ref={section}
      aria-labelledby="flavour-title"
      className={`relative isolate overflow-hidden text-[#FFF5D9] ${flood ? 'fl-armed' : ''}`}
      style={{ background: base }}
    >
      {flood && (
        <span
          key={flood.n}
          aria-hidden="true"
          className="fl-flood -z-10"
          style={{ left: flood.x, top: flood.y, width: flood.d, height: flood.d, background: current.colour }}
          onAnimationEnd={() => setBase(current.colour)}
        />
      )}
      <div className="wrap grid items-center gap-8 py-12 md:grid-cols-2 md:gap-12 md:py-16">
        <div className="relative mx-auto aspect-[640/854] w-full max-w-[17rem] md:max-w-[22rem]">
          {flood &&
            CRISPS.map((c, i) => (
              <img
                key={`${flood.n}-${i}`}
                src={crisp.src}
                alt=""
                aria-hidden="true"
                width={crisp.width}
                height={crisp.height}
                className="fl-crisp"
                style={{ '--x': c.x, '--y': c.y, '--r': c.r, '--s': c.s, animationDelay: `${120 + i * 30}ms` } as CSSProperties}
              />
            ))}
          {FLAVOURS.map((f) => (
            <Picture
              key={f.id}
              image={f.bag}
              alt={f.id === id ? `Front of the ${f.name} pack.` : ''}
              sizes="22rem"
              placeholder={false}
              className="fl-bag"
              data-active={f.id === id}
            />
          ))}
        </div>
        <div>
          <p className="label opacity-80">Flavour system</p>
          <h2 id="flavour-title" className="display t-display-2 mt-3">
            One bag. Three bands.
          </h2>
          <p className="mt-4 max-w-[30rem] text-base opacity-90">
            The yellow bag, logo and crisp stay put. The colour band, the flavour icon and the line change. Pick one.
          </p>
          <div role="group" aria-label="Choose a flavour" className="mt-6 flex flex-wrap gap-2">
            {FLAVOURS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={f.id === id}
                onClick={(e) => pick(f, e)}
                className="press min-h-11 border border-[#FFF5D9]/70 px-4 text-sm font-medium aria-pressed:border-[#FFF5D9] aria-pressed:bg-[#FFF5D9] aria-pressed:text-[var(--fl)]"
                style={{ ['--fl' as string]: f.colour }}
              >
                {f.short}
              </button>
            ))}
          </div>
          <div className="mt-8 border-t border-[#FFF5D9]/30 pt-4" aria-live="polite">
            <p className="t-h3">{current.name}</p>
            <p className="label mt-1 opacity-80">{current.note}</p>
            <p key={id} className="t-h2 enter-rise mt-4">
              “{current.line}”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
