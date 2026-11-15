import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { tools } from '../../content/site';
import type { ImageKey } from '../../content/images';
import { Picture } from '../Picture';
import { SectionHead } from './SectionHead';

const PROJECTS = {
  A: { name: 'Commons', slug: 'commons' },
  B: { name: 'VELORA', slug: 'velora' },
  C: { name: 'Crunch House', slug: 'crunch-house' },
  D: { name: 'Confam', slug: 'confam' },
  E: { name: 'Explore Africa', slug: 'explore-africa' },
  F: { name: 'MONTRA', slug: 'montra' },
  G: { name: 'NOCTURNE', slug: 'nocturne' },
} as const;
type Code = keyof typeof PROJECTS;

type Card = { image: ImageKey } | { figure: string; text: string };

/** Every skill points at the case studies that show it, with three pieces of proof from them. */
const SKILLS: { name: string; in: Code[]; cards: Card[] }[] = [
  {
    name: 'Research',
    in: ['D'],
    cards: [
      { figure: '0', text: 'products I found that search public call-outs about one seller and show the posts' },
      { figure: '6+', text: 'Nigerian report sites launched in 2026, all waiting for reports to come to them' },
      { figure: '2', text: 'free AI checkers already read pitches, so Confam doesn’t compete there' },
    ],
  },
  { name: 'Flows and wireframes', in: ['A', 'G', 'D', 'F'], cards: [{ image: 'commons-flow' }, { image: 'nocturne-layout' }, { image: 'montra-m-onboard' }] },
  { name: 'UI design', in: ['A', 'G', 'D', 'F'], cards: [{ image: 'nocturne-editor' }, { image: 'montra-dash' }, { image: 'commons-events' }] },
  { name: 'Design systems', in: ['F'], cards: [{ image: 'montra-brand' }, { image: 'montra-mobile' }, { image: 'montra-m-home' }] },
  { name: 'Prototyping', in: ['G', 'D', 'F'], cards: [{ image: 'nocturne-walk' }, { image: 'confam-check' }, { image: 'montra-mobile' }] },
  { name: 'Identity design', in: ['B', 'C', 'D', 'F'], cards: [{ image: 'velora-lockup' }, { image: 'crunch-board-identity' }, { image: 'confam-brand' }] },
  { name: 'Packaging design', in: ['B', 'C'], cards: [{ image: 'crunch-packs' }, { image: 'velora-box' }, { image: 'velora-tags' }] },
  { name: 'Launch film and motion', in: ['B'], cards: [{ image: 'velora-reel-poster' }, { image: 'velora-story' }, { image: 'velora-car-1' }] },
  { name: 'Campaign design', in: ['B', 'C', 'E'], cards: [{ image: 'ea-billboard' }, { image: 'crunch-ad-suya' }, { image: 'velora-flyer' }] },
];
const N = SKILLS.length;
/** Where each of the three cards sits in the fan: tilt, then offset across and down. */
const FAN = [
  { r: '-3deg', x: '0%', y: '0%' },
  { r: '6deg', x: '22%', y: '-7%' },
  { r: '-10deg', x: '-20%', y: '9%' },
];

/** Wheel position of item i when the wheel sits at (fractional) index `at`. */
function wheel(i: number, at: number): CSSProperties {
  const d = i - at;
  const a = Math.min(Math.abs(d), 3);
  return {
    transform: `translateY(calc(${d.toFixed(3)} * var(--row))) rotateX(${(-d * 22).toFixed(2)}deg) scale(${(1 - a * 0.07).toFixed(3)})`,
    opacity: Math.max(0, 1 - a * 0.4).toFixed(3),
  };
}

/**
 * Skills. The section pins while you scroll through it. Skill names roll past on a drum, and
 * each one deals in a fanned stack of the work that shows it, with links to the projects it comes
 * from underneath. Tools follow as pills. Screen readers get
 * the whole list as plain text; the drum and the cards are visual only.
 */
export function Skills() {
  const track = useRef<HTMLDivElement>(null);
  const drum = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const activeRef = useRef(0);

  useEffect(() => {
    const el = track.current;
    const list = drum.current;
    if (!el || !list) return;
    const items = [...list.children] as HTMLElement[];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let target = 0;
    let at = 0;
    let raf = 0;
    let clear = 0;

    const measure = () => {
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      target = Math.min(1, Math.max(0, -r.top / Math.max(1, total))) * (N - 1);
    };
    const paint = () => {
      items.forEach((it, i) => Object.assign(it.style, wheel(i, at)));
      if (bar.current) bar.current.style.transform = `scaleY(${(at / (N - 1)).toFixed(4)})`;
      const idx = Math.round(at);
      if (idx !== activeRef.current) {
        setLeaving(activeRef.current);
        activeRef.current = idx;
        setActive(idx);
        window.clearTimeout(clear);
        clear = window.setTimeout(() => setLeaving(null), 380);
      }
    };
    const tick = () => {
      at += (target - at) * (reduce ? 1 : 0.14);
      if (Math.abs(target - at) < 0.002) at = target;
      paint();
      raf = at === target ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
      window.clearTimeout(clear);
    };
  }, []);

  /** Scroll the page so skill i is the one in front. */
  const jump = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: top + (total * i) / (N - 1) + 1, behavior: reduce ? 'auto' : 'smooth' });
  };

  const skill = SKILLS[active];

  return (
    <section id="skills" aria-labelledby="skills-title" className="pb-24 md:pb-32">
      <div className="wrap">
        <SectionHead id="skills-title" title="Skills" />
      </div>

      <ul className="sr-only">
        {SKILLS.map((s) => (
          <li key={s.name}>
            {s.name}, shown in {s.in.map((c) => PROJECTS[c].name).join(', ')}.
          </li>
        ))}
      </ul>

      <div ref={track} className="skx" style={{ '--n': N } as CSSProperties}>
        <div className="skx-stage wrap">
          <span aria-hidden="true" className="skx-rail">
            <span ref={bar} />
          </span>

          <div className="skx-left">
            <ol ref={drum} aria-hidden="true" className="skx-drum">
              {SKILLS.map((s, i) => (
                <li key={s.name} style={wheel(i, 0)}>
                  <button type="button" tabIndex={-1} onClick={() => jump(i)} data-on={i === active || undefined}>
                    {s.name}
                  </button>
                </li>
              ))}
            </ol>

            <div className="skx-proof">
              <p className="text-sm text-muted">Shown in</p>
              <ul className="skx-chips" aria-label={`${skill.name} is shown in`}>
                {skill.in.map((c, j) => (
                  <li key={`${active}-${c}`} style={{ '--j': j } as CSSProperties}>
                    <Link to={`/work/${PROJECTS[c].slug}`} viewTransition className="skx-chip">
                      {PROJECTS[c].name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div aria-hidden="true" className="skx-stack">
            {leaving !== null &&
              leaving !== active &&
              SKILLS[leaving].cards.map((c, j) => <ProofCard key={`out-${leaving}-${j}`} card={c} j={j} out />)}
            {skill.cards.map((c, j) => (
              <ProofCard key={`in-${active}-${j}`} card={c} j={j} />
            ))}
          </div>
        </div>
      </div>

      <div className="wrap mt-4">
        <dl className="grid gap-x-6 gap-y-4 border-t border-rule pt-6 md:grid-cols-12">
          <dt className="label text-muted md:col-span-2">Design tools</dt>
          <dd className="flex flex-wrap gap-2 md:col-span-4">
            {tools.design.map((t, i) => (
              <span key={t} className="skx-tool sd-pop" style={{ '--c': i * 0.4 } as CSSProperties}>
                {t}
              </span>
            ))}
          </dd>
          <dt className="label text-muted md:col-span-2">AI tools</dt>
          <dd className="flex flex-wrap gap-2 md:col-span-4">
            {tools.ai.map((t, i) => (
              <span key={t} className="skx-tool sd-pop" style={{ '--c': (i + 4) * 0.4 } as CSSProperties}>
                {t}
              </span>
            ))}
          </dd>
        </dl>
      </div>
    </section>
  );
}

function ProofCard({ card, j, out = false }: { card: Card; j: number; out?: boolean }) {
  return (
    <div
      className={`skx-card${out ? ' is-out' : ''}`}
      style={{ '--j': j, '--r': FAN[j].r, '--x': FAN[j].x, '--y': FAN[j].y } as CSSProperties}
    >
      {'image' in card ? (
        <Picture image={card.image} alt="" sizes="(min-width: 48rem) 34vw, 70vw" draggable={false} className="skx-img" />
      ) : (
        <div className="skx-fact">
          <span className="skx-fig">{card.figure}</span>
          <span className="skx-txt">{card.text}</span>
        </div>
      )}
    </div>
  );
}
