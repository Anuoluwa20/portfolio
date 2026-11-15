import { Link } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { archive } from '../../content/archive';
import { Picture } from '../Picture';
import { SectionHead } from './SectionHead';
import { Btn } from '../Btn';
import { followPointer, useSnapTrack } from './useSnapTrack';

/**
 * (02) More projects, after the card row at the foot of Jane Hou's site: big dark rounded cards
 * that start on the text column and run off the right edge, with the next card peeking in. Each
 * card holds the whole design, inset, so nothing gets cropped. The card in front sits at full
 * size; cards coming in from the right grow into place and cards leaving on the left shrink back
 * (scroll-driven, so it follows a drag or a swipe exactly), and the design drifts a little inside
 * its card as it travels. Every card opens that project in the archive.
 */
export function MoreCarousel() {
  const { track, index, atEnd, go, wasDrag, handlers } = useSnapTrack<HTMLOListElement>();

  return (
    <section aria-labelledby="more-title" className="mcar-sec pb-24 md:pb-32">
      <div className="wrap">
        <SectionHead id="more-title" title="More projects">
          <Btn to="/archive" viewTransition>
            {`View all ${archive.length}`}
          </Btn>
        </SectionHead>
      </div>

      <ol ref={track} className="carousel mcar sd-rise mt-10 md:mt-14" aria-label="More projects" {...handlers}>
        {archive.map((a, i) => (
          <li key={a.slug} className="mcar-card">
            <div className="mcar-grow">
              <Link
                to={{ pathname: '/archive', hash: `#${a.slug}` }}
                viewTransition
                draggable={false}
                onClick={(e) => {
                  if (wasDrag()) e.preventDefault();
                }}
                className="mcar-link group block"
              >
                <span className="mcar-tile" onPointerMove={followPointer}>
                  <span className="mcar-frame">
                    <Picture
                      image={a.image}
                      alt=""
                      sizes="(min-width: 48rem) 54vw, 70vw"
                      eager={i < 2}
                      draggable={false}
                      className="mcar-img"
                    />
                  </span>
                  <span aria-hidden="true" className="view-bubble">
                    View project
                  </span>
                </span>
                <span className="mt-4 grid gap-x-3 md:grid-cols-[minmax(0,1fr)_auto]">
                  <span className="min-w-0">
                    <span className="row-name inline-block font-medium">{a.name}</span>
                    <span className="block text-sm text-muted">{a.line}</span>
                  </span>
                  <span className="label hidden pt-1 text-right text-muted md:block">{a.type}</span>
                </span>
              </Link>
            </div>
          </li>
        ))}
      </ol>

      <div className="wrap mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:gap-6">
        <span aria-hidden="true" className="mcar-bar">
          <span />
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Previous project"
            className="press grid size-11 place-items-center rounded-full border border-rule disabled:opacity-35"
          >
            <ArrowLeft aria-hidden size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={atEnd || index === archive.length - 1}
            aria-label="Next project"
            className="press grid size-11 place-items-center rounded-full border border-rule disabled:opacity-35"
          >
            <ArrowRight aria-hidden size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </section>
  );
}
