import { useEffect, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { projectBySlug, projects } from '../content/projects';
import type { Project as P } from '../content/types';
import { Picture } from '../components/Picture';
import { Blocks } from '../components/project/Blocks';
import { setLastProject, useTitle } from '../lib/nav';
import NotFound from './NotFound';
import { Words } from '../components/Words';
import { LiveButtons } from '../components/LiveButtons';
import { Btn } from '../components/Btn';

function themeVars(p: P): CSSProperties {
  const t = p.theme;
  return {
    ['--bg' as string]: t.bg,
    ['--fg' as string]: t.ink,
    ['--mu' as string]: t.muted,
    ['--ru' as string]: t.rule,
    ['--ac' as string]: t.accent,
    ['--link' as string]: t.ink,
    ['--ring' as string]: t.tone === 'dark' ? t.accent : t.ink,
    // L1 surface: one step off the page colour (darker on dark pages, lighter on light ones)
    ['--l1' as string]: t.tone === 'dark' ? `color-mix(in srgb, ${t.bg} 88%, black)` : `color-mix(in srgb, ${t.bg} 45%, white)`,
    background: t.bg,
    color: t.ink,
  };
}

/** Plain facts under the title: what it is, where it sits, its status and year. */
function Facts({ p }: { p: P }) {
  const bits = [p.types.join(', '), p.sector, p.status !== 'Client' ? p.status : null, p.year].filter(Boolean);
  return <p className="text-sm muted">{bits.join(' · ')}</p>;
}

function Back() {
  return (
    <Link
      to={{ pathname: '/', hash: '#work' }}
      viewTransition
      className="press -ml-1 inline-flex min-h-11 items-center gap-2 px-1 text-sm"
    >
      <ArrowLeft aria-hidden size={16} strokeWidth={1.75} />
      Back to all work
    </Link>
  );
}

function Meta({ p }: { p: P }) {
  return (
    <div className="wrap">
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
        {p.meta.map(([k, v]) => (
          <div key={k} className="border-t border-[var(--ru)] pt-3">
            <dt className="text-sm muted">{k}</dt>
            <dd className="mt-1">{v}</dd>
          </div>
        ))}
      </dl>
      {(p.live || p.link) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {p.live && <LiveButtons demos={p.live} />}
          {p.link && (
            <Btn href={p.link.href} ext solid={!p.live}>
              {p.link.label}
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}

function Next({ p }: { p: P }) {
  const i = projects.findIndex((x) => x.slug === p.slug);
  const next = projects[(i + 1) % projects.length];
  return (
    <nav aria-label="Next project" className="border-t border-[var(--fg)]">
      <Link to={`/work/${next.slug}`} viewTransition className="wrap sd-rise group flex flex-col gap-2 py-12 md:py-16">
        <span className="text-sm muted">Read next</span>
        <span className="flex items-baseline gap-4">
          <span className="display t-display-2">{next.name}</span>
          <ArrowRight aria-hidden size={24} strokeWidth={1.5} className="press ml-auto self-center group-hover:translate-x-1" />
        </span>
        <span className="muted">{next.line}</span>
      </Link>
    </nav>
  );
}

export default function Project() {
  const { slug } = useParams();
  const p = projectBySlug(slug);
  useTitle(p?.name);
  useEffect(() => {
    if (p) setLastProject(p.slug);
  }, [p]);

  if (!p) return <NotFound />;

  const hero = (
    <Picture
      image={p.cover}
      alt={p.coverAlt}
      sizes="100vw"
      priority
      className="sd-parallax size-full object-cover"
      vtName={`project-${p.slug}`}
    />
  );

  return (
    <article style={themeVars(p)} data-tone={p.theme.tone}>
      <header className="wrap pb-10 pt-6 md:pb-14">
        <Back />
        <h1 className="display t-name enter-words mt-10 md:mt-16">
          <Words text={p.name} />
        </h1>
        <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-12 md:items-end md:gap-8">
          <div className="md:col-span-8">
            {p.mode === 'gallery' && (
              <p className="t-h2 enter-rise" style={{ '--d': '350ms' } as CSSProperties}>
                {p.headline}
              </p>
            )}
            <p
              className={`enter-rise max-w-[42rem] ${p.mode === 'gallery' ? 't-lead mt-3 muted' : 't-h3'}`}
              style={{ '--d': '450ms' } as CSSProperties}
            >
              {p.dek}
            </p>
          </div>
          <div className="enter-fade md:col-span-4 md:justify-self-end md:text-right" style={{ '--d': '600ms' } as CSSProperties}>
            <Facts p={p} />
          </div>
        </div>
      </header>
      <div className="aspect-[16/10] max-h-[88svh] w-full overflow-hidden">{hero}</div>
      <div className="sd-rise pb-16 pt-8 md:pb-24 md:pt-10">
        <Meta p={p} />
      </div>

      <Blocks project={p} />
      <Next p={p} />
    </article>
  );
}
