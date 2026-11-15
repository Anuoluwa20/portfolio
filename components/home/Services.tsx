import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { ImageKey } from '../../content/images';
import { Picture } from '../Picture';
import { Btn } from '../Btn';
import { SectionHead } from './SectionHead';
import type { Filter } from './work';

type Service = {
  name: string;
  project: string;
  what: string;
  slug: string;
  image: ImageKey;
  /** Wide pictures (a logo lock-up) sit whole on their own colour instead of being cropped. */
  fit?: { bg: string };
};

/** The two practices and what each covers, every service tied to the project that shows it. */
const GROUPS: { key: Exclude<Filter, 'all'>; label: string; cta: string; items: Service[] }[] = [
  {
    key: 'product',
    label: 'Product & UX',
    cta: 'See product work',
    items: [
      { name: 'Product and UI design', project: 'MONTRA', what: 'web dashboard', slug: 'montra', image: 'montra-dash' },
      { name: 'Mobile apps and prototypes', project: 'MONTRA', what: 'mobile app', slug: 'montra', image: 'montra-mobile' },
      { name: 'Websites and landing pages', project: 'Commons', what: 'event site and RSVP', slug: 'commons', image: 'commons-cover' },
      { name: '3D tools and editors', project: 'NOCTURNE', what: 'apartment planner', slug: 'nocturne', image: 'nocturne-editor' },
      { name: 'Research and user flows', project: 'Confam', what: 'scam check', slug: 'confam', image: 'confam-steps' },
    ],
  },
  {
    key: 'brand',
    label: 'Brand & packaging',
    cta: 'See brand work',
    items: [
      {
        name: 'Logo and identity systems',
        project: 'VELORA',
        what: 'label mark and wordmark',
        slug: 'velora',
        image: 'velora-lockup',
        fit: { bg: '#E20600' },
      },
      { name: 'Packaging and flavour ranges', project: 'Crunch House', what: 'three flavours', slug: 'crunch-house', image: 'crunch-packs' },
      { name: 'Campaigns: social, print and outdoor', project: 'Explore Africa', what: 'billboard and lightbox', slug: 'explore-africa', image: 'ea-billboard' },
      {
        name: 'Launch films and motion',
        project: 'VELORA',
        what: '30-second reel',
        slug: 'velora',
        image: 'velora-reel-poster',
      },
    ],
  },
];
const ALL = GROUPS.flatMap((g) => g.items);

/**
 * Services. Both practices in one list, set large; beside it a picture frame stays in view and
 * wipes to the project behind whichever service you're on: the one under the pointer, or the
 * one crossing the middle of the screen as you scroll. Every row opens that case study.
 * (After Frédéric Lord's big index rows and Lauren Hom's hover reveals.)
 */
export function Services({ onFilter }: { onFilter: (f: Filter) => void }) {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const pointing = useRef(false);

  // As you scroll, the row crossing the middle of the screen becomes the active one
  useEffect(() => {
    const rows = list.current?.querySelectorAll<HTMLElement>('[data-row]');
    if (!rows?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (pointing.current) return;
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(Number((hit.target as HTMLElement).dataset.row));
      },
      { rootMargin: '-46% 0px -46% 0px' },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  const current = ALL[active];
  let n = -1;

  return (
    <section id="services" aria-labelledby="services-title" className="wrap pb-24 md:pb-32">
      <SectionHead id="services-title" title="Services" />

      <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:gap-6">
        <div
          ref={list}
          className="sv-list md:col-span-7"
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse') pointing.current = true;
          }}
          onPointerLeave={() => (pointing.current = false)}
        >
          {GROUPS.map((g, gi) => (
            <div key={g.key} className={gi > 0 ? 'mt-14 md:mt-20' : undefined}>
              <div className="sv-group sd-rise relative flex flex-wrap items-end justify-between gap-4 pb-4">
                <span aria-hidden="true" className="sh-line sd-draw sv-group-line" />
                <h3 className="t-h3 font-semibold">{g.label}</h3>
                <Btn to={{ pathname: '/', hash: '#work' }} onClick={() => onFilter(g.key)}>
                  {g.cta}
                </Btn>
              </div>
              <ol>
                {g.items.map((it) => {
                  n += 1;
                  const i = n;
                  return (
                    <li key={it.name} data-row={i} className="sd-rise" style={{ '--i': i % 4 } as CSSProperties}>
                      <Link
                        to={`/work/${it.slug}`}
                        viewTransition
                        data-on={i === active || undefined}
                        onPointerEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        className="sv-row group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-b border-rule py-5 md:py-6"
                      >
                        <span className="min-w-0">
                          <span className="sv-name t-svc block">{it.name}</span>
                          <span className="mt-1.5 block text-sm text-muted">
                            {it.project}, {it.what}
                          </span>
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="sv-thumb overflow-hidden md:hidden" style={it.fit ? { background: it.fit.bg } : undefined}>
                            <Picture
                              image={it.image}
                              alt=""
                              sizes="5rem"
                              className={`size-full ${it.fit ? 'object-contain !bg-transparent' : 'object-cover'}`}
                            />
                          </span>
                          <ArrowRight aria-hidden size={20} strokeWidth={1.75} className="sv-arrow hidden md:block" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>

        <div aria-hidden="true" className="hidden md:col-span-5 md:block">
          <div className="sv-panel">
            <div className="sv-frame">
              {ALL.map((it, i) => (
                <span
                  key={it.name}
                  className="sv-shot"
                  data-on={i === active || undefined}
                  style={it.fit ? { background: it.fit.bg } : undefined}
                >
                  <Picture
                    image={it.image}
                    alt=""
                    sizes="(min-width: 80rem) 30rem, 40vw"
                    className={`size-full ${it.fit ? 'object-contain p-[8%] !bg-transparent' : 'object-cover'}`}
                  />
                </span>
              ))}
            </div>
            <p key={active} className="sv-cap mt-4 flex items-baseline justify-between gap-4">
              <span>
                <span className="font-medium">{current.project}</span>
                <span className="text-muted">, {current.what}</span>
              </span>
              <span className="text-sm text-muted">{current.name}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
