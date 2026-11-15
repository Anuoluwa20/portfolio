import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { site } from '../../content/site';
import { Words, wordCount } from '../Words';
import { img, type ImageKey } from '../../content/images';
import { Btn } from '../Btn';
import { Clock } from '../Clock';
import { Reel } from './Reel';
import type { Filter } from './work';

/** A small picture of the work, set inline in the sentence like a word. */
function Chip({ image, d }: { image: ImageKey; d: number }) {
  const i = img(image);
  return (
    <span aria-hidden="true" className="chip" style={{ '--d': `${d}ms` } as CSSProperties}>
      <img src={i.srcSet ? i.src.replace('.webp', '-900.webp') : i.src} alt="" width={900} height={563} decoding="async" />
    </span>
  );
}

const A = 'I design';
const DOOR_1 = 'fintech and trust products';
const B = 'people understand at a glance, and';
const DOOR_2 = 'brands and packaging';
const C = 'people reach for.';

/**
 * The title card (where the intro lands the name), then a reel of the work drifting underneath.
 * After Giorgos Papadakis's statement-led first screen: name, one positioning sentence, a live clock.
 * Black and white only: the sentence is grey, the two doors are full ink.
 */
export function Hero({ onDoor }: { onDoor: (f: Filter) => void }) {
  let i = 0;
  const next = (t: string) => {
    const from = i;
    i += wordCount(t);
    return from;
  };
  return (
    <section id="home" aria-labelledby="intro-name" className="hero">
      <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-6 pt-6 md:gap-8">
        <p className="label enter-fade flex flex-wrap justify-between gap-x-6 gap-y-1 text-muted">
          <span>
            <span className="text-ink">{site.role}</span>
          </span>
          <span className="flex items-center gap-3">
            <span>{site.location}</span>
            <Clock className="inline-flex items-center text-ink" />
          </span>
        </p>

        <h1 id="intro-name" className="hero-name hero-name-style">
          <span className="block">Oyebanji</span>
          <span className="block">Anuoluwapo</span>
          <span className="sr-only">, {site.role}</span>
        </h1>

        <div className="grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10">
          <p className="display enter-words max-w-[30ch] text-[clamp(1.25rem,0.9rem+1.5vw,2.074rem)] font-medium tracking-[-0.02em] text-muted">
            <Words text={A} from={next(A)} />{' '}
            <Link to={{ pathname: '/', hash: '#work' }} className="door-c text-ink" onClick={() => onDoor('product')}>
              <Words text={DOOR_1} from={next(DOOR_1)} className="door" />
            </Link>{' '}
            <Chip image="montra-cover" d={650} /> <Words text={B} from={next(B)} />{' '}
            <Link to={{ pathname: '/', hash: '#work' }} className="door-c text-ink" onClick={() => onDoor('brand')}>
              <Words text={DOOR_2} from={next(DOOR_2)} className="door" />
            </Link>{' '}
            <Chip image="crunch-cover" d={800} /> <Words text={C} from={next(C)} />
          </p>
          <div className="enter-rise flex flex-wrap gap-2 md:justify-end" style={{ '--d': '900ms' } as CSSProperties}>
            <Btn to={{ pathname: '/', hash: '#work' }} solid icon="down">
              See the work
            </Btn>
            <Btn to={{ pathname: '/', hash: '#contact' }}>Start a chat</Btn>
          </div>
        </div>
      </div>

      <div className="enter-rise mt-10 md:mt-12" style={{ '--d': '1100ms' } as CSSProperties}>
        <Reel />
      </div>
    </section>
  );
}
