import clsx from 'clsx';
import type { Block, Project, Shot } from '../../content/types';
import { Picture } from '../Picture';
import { ASSET_BASE, img } from '../../content/images';
import { FlavourSwitcher } from './FlavourSwitcher';
import { LedgerCount } from './LedgerCount';
import { ScanDemo } from './ScanDemo';
import { ClockStory } from './ClockStory';
import { Words } from '../Words';

/** Label column on the left, content on the right (desktop); stacked on phones. */
function Row({ label, children, className }: { label?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('wrap sd-rise grid gap-4 xl:grid-cols-[13rem_minmax(0,1fr)] xl:gap-12', className)}>
      <div className="case-label pt-1">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Caption({ children }: { children?: string }) {
  if (!children) return null;
  return <figcaption className="mt-3 max-w-[68ch] text-sm muted">{children}</figcaption>;
}

function Figure({ shot, sizes, className, imgClass }: { shot: Shot; sizes: string; className?: string; imgClass?: string }) {
  return (
    <figure className={className}>
      <div className="sd-wipe">
        <Picture image={shot.image} alt={shot.alt} sizes={sizes} className={clsx('w-full', imgClass)} />
      </div>
      <Caption>{shot.caption}</Caption>
    </figure>
  );
}

const GRID: Record<2 | 3 | 4, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
};
const GRID_SIZES: Record<2 | 3 | 4, string> = {
  2: '(min-width: 48rem) 40rem, 100vw',
  3: '(min-width: 48rem) 26rem, 100vw',
  4: '(min-width: 48rem) 20rem, 50vw',
};

export function Blocks({ project }: { project: Project }) {
  const gallery = project.mode === 'gallery';
  return (
    <div className="flex flex-col gap-16 pb-24 md:gap-24">
      {project.blocks.map((b, i) => (
        <BlockView key={i} block={b} gallery={gallery} />
      ))}
    </div>
  );
}

function BlockView({ block: b, gallery }: { block: Block; gallery: boolean }) {
  switch (b.type) {
    case 'text':
      return (
        <Row label={b.label}>
          {b.title && (
            <h2 className="t-h2 sd-words mb-4 max-w-[36rem]">
              <Words text={b.title} />
            </h2>
          )}
          <div className="prose-col">
            {b.body.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </Row>
      );

    case 'video':
      return (
        <Row label={b.label}>
          <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-16">
            <div>
              {b.title && <h2 className="t-h2 max-w-[34rem]">{b.title}</h2>}
              {b.body && (
                <div className="prose-col mt-4">
                  {b.body.map((p) => (
                    <p key={p.slice(0, 32)}>{p}</p>
                  ))}
                </div>
              )}
            </div>
            <figure className="mx-auto w-full max-w-[20rem] md:mx-0">
              <video
                className="block h-auto w-full rounded-[14px] border border-[var(--ru)] bg-black"
                src={`${ASSET_BASE}${b.src}`}
                poster={img(b.poster).src}
                width={b.width}
                height={b.height}
                controls
                playsInline
                preload="none"
              />
              <Caption>{b.caption}</Caption>
            </figure>
          </div>
        </Row>
      );

    case 'note':
      return (
        <Row label={b.label} className="text-sm">
          <ul className="prose-col">
            {b.body.map((p) => (
              <li key={p.slice(0, 32)} className="border-b border-[var(--ru)] py-3 first:pt-0 muted">
                {p}
              </li>
            ))}
          </ul>
        </Row>
      );

    case 'list':
      return (
        <Row label={b.label}>
          {b.title && <h2 className="t-h2 mb-4 max-w-[36rem]">{b.title}</h2>}
          <ol className="prose-col surface px-4">
            {b.items.map((it, n) => (
              <li key={it.slice(0, 32)} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2 border-b border-[var(--ru)] py-3 last:border-b-0">
                <span className="label num pt-1 muted">{String(n + 1).padStart(2, '0')}</span>
                <span>{it}</span>
              </li>
            ))}
          </ol>
        </Row>
      );

    case 'findings':
      return (
        <Row label={b.label}>
          {b.title && <h2 className="t-h2 mb-6 max-w-[36rem]">{b.title}</h2>}
          <ul className="surface grid md:grid-cols-3">
            {b.items.map((f) => (
              <li key={f.text.slice(0, 24)} className="border-[var(--ru)] p-6 not-first:border-t md:not-first:border-l md:not-first:border-t-0">
                <p className="num t-figure">{f.figure}</p>
                <p className="mt-3 text-sm">{f.text}</p>
              </li>
            ))}
          </ul>
        </Row>
      );

    case 'decision': {
      const side = b.layout === 'side' && b.shot;
      return (
        <Row>
          <div className={clsx(side && 'grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_15rem] xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-16')}>
            <div>
              <h2 className="t-h2 max-w-[34rem]">{b.title ?? `${b.to.charAt(0).toUpperCase()}${b.to.slice(1)}`}</h2>
              <div className="prose-col mt-4">
                {b.body.map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </div>
            {b.shot && (
              <Figure
                shot={b.shot}
                sizes={side ? '17rem' : '(min-width: 80rem) 58rem, 100vw'}
                className={side ? 'mx-auto w-full max-w-[17rem] md:mx-0' : 'mt-8'}
                imgClass={side ? undefined : 'border border-[var(--ru)]'}
              />
            )}
          </div>
        </Row>
      );
    }

    case 'figure':
      if (gallery && b.bleed) {
        return (
          <figure>
            <div className="sd-wipe">
              <Picture image={b.shot.image} alt={b.shot.alt} sizes="100vw" className="w-full" />
            </div>
            <div className="wrap">
              <Caption>{b.shot.caption}</Caption>
            </div>
          </figure>
        );
      }
      return (
        <div className="wrap">
          <Figure shot={b.shot} sizes="(min-width: 80rem) 74rem, 100vw" />
        </div>
      );

    case 'grid':
      return (
        <div className="wrap">
          {(b.label || b.title) && (
            <div className="mb-6 grid gap-2 xl:grid-cols-[13rem_minmax(0,1fr)] xl:gap-12">
              <p className="case-label pt-1">{b.label}</p>
              {b.title && <h2 className="t-h2">{b.title}</h2>}
            </div>
          )}
          <div className={clsx('grid items-start gap-x-4 gap-y-8 xl:gap-x-6', GRID[b.cols])}>
            {b.shots.map((s) => (
              <Figure
                key={s.image}
                shot={s}
                sizes={s.span ? '(min-width: 40rem) 56rem, 100vw' : GRID_SIZES[b.cols]}
                className={s.span ? 'md:col-span-2' : undefined}
              />
            ))}
          </div>
        </div>
      );

    case 'chapter':
      return (
        <div>
          <div className="wrap">
            <div className="border-t border-[var(--fg)] pt-6">
              <p className="case-label">{b.n}</p>
            </div>
          </div>
          <div className="overflow-hidden">
            <h2 className="chapter-title sd-drift mt-4 pl-[8vw]">{b.title}</h2>
          </div>
          {b.line && (
            <div className="wrap">
              <p className="t-lead sd-rise mt-3 muted">{b.line}</p>
            </div>
          )}
        </div>
      );

    case 'flavours':
      return <FlavourSwitcher />;
    case 'ledger':
      return <LedgerCount />;
    case 'scan':
      return <ScanDemo />;
    case 'clock':
      return <ClockStory />;
  }
}
