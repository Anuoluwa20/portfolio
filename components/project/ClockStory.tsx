import { useEffect, useRef, useState, type CSSProperties } from 'react';
import NumberFlow from '@number-flow/react';
import { Picture } from '../Picture';
import type { ImageKey } from '../../content/images';

/** One day in Dubai, told by the clock. Lines and times come from the carousel itself. */
const STEPS: { h: number; m: number; line: string; image: ImageKey; alt: string; bg: string; ink: string }[] = [
  {
    h: 6,
    m: 4,
    line: 'Breakfast above the clouds.',
    image: 'ea-car-1',
    alt: 'Carousel slide: "06:04 — Breakfast above the clouds."',
    bg: '#F2DCC6',
    ink: '#16203A',
  },
  {
    h: 16,
    m: 30,
    line: 'Golden hour, sideways.',
    image: 'ea-car-2',
    alt: 'Carousel slide: "16:30 — Golden hour, sideways." A woman waving from a 4x4 in the desert.',
    bg: '#E7A945',
    ink: '#16203A',
  },
  {
    h: 20,
    m: 0,
    line: 'Dinner on the water.',
    image: 'ea-car-3',
    alt: 'Carousel slide: "20:00 — Dinner on the water." A couple at dinner by the Dubai Marina.',
    bg: '#16203A',
    ink: '#F3EADB',
  },
  {
    h: 0,
    m: 0,
    line: 'Your Dubai escape, sorted.',
    image: 'ea-car-4',
    alt: 'Carousel slide: "Your Dubai escape, sorted." A five-day plan and a LOS to DXB boarding pass.',
    bg: '#EFE6D6',
    ink: '#16203A',
  },
];

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const timing = { duration: 700, easing: EASE };

/**
 * Sticky scroll story: as the reader scrolls, the clock rolls through the carousel's three times
 * and the ground follows the time of day. Scrolling drives it; nothing plays on its own.
 */
export function ClockStory() {
  const [step, setStep] = useState(0);
  const markers = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    markers.current.forEach((m) => m && io.observe(m));
    return () => io.disconnect();
  }, []);

  const s = STEPS[step];
  const plan = step === STEPS.length - 1;

  return (
    <section aria-labelledby="clock-title" className="relative" style={{ height: `${STEPS.length * 90}svh` }}>
      {STEPS.map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            markers.current[i] = el;
          }}
          data-step={i}
          aria-hidden="true"
          className="absolute inset-x-0"
          style={{ top: `${(i / STEPS.length) * 100}%`, height: `${100 / STEPS.length}%` }}
        />
      ))}

      <div
        className="sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))] overflow-hidden"
        style={{ color: s.ink } as CSSProperties}
      >
        {STEPS.map((x, i) => (
          <div key={i} aria-hidden="true" className="clock-ground absolute inset-0" data-active={i === step} style={{ background: x.bg }} />
        ))}

        <div className="wrap relative grid h-full items-center gap-6 py-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
          <div className="min-w-0">
            <p className="label opacity-80">
              Carousel · one day in Dubai
              <span className="num ml-3">
                {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
              </span>
            </p>
            <h2 id="clock-title" className="sr-only">
              One day in Dubai, told by the clock: 06:04, 16:30 and 20:00, then the plan.
            </h2>
            <div aria-hidden="true" className="relative mt-4 h-[1.1em] text-[clamp(4.3rem,2rem+9vw,8.916rem)] font-bold leading-[1.1] [font-stretch:62%]">
              <span className={`clock-face absolute inset-0 ${plan ? '' : 'is-on'}`}>
                <NumberFlow value={s.h} format={{ minimumIntegerDigits: 2 }} transformTiming={timing} spinTiming={timing} className="num" />
                <span>:</span>
                <NumberFlow value={s.m} format={{ minimumIntegerDigits: 2 }} transformTiming={timing} spinTiming={timing} className="num" />
              </span>
              <span className={`clock-face absolute inset-0 ${plan ? 'is-on' : ''}`}>LOS → DXB</span>
            </div>
            <p key={step} className="clock-line t-display-2 display mt-4" aria-live="polite">
              {s.line}
            </p>
            <ol aria-hidden="true" className="mt-8 flex gap-2">
              {STEPS.map((_, i) => (
                <li key={i} className="h-1 w-12 bg-current" style={{ opacity: i === step ? 1 : 0.25 }} />
              ))}
            </ol>
          </div>
          <div className="relative mx-auto aspect-[4/5] h-[38svh] max-h-[min(70svh,34rem)] md:mx-0 md:h-full md:justify-self-end">
            {STEPS.map((x, i) => (
              <Picture
                key={x.image}
                image={x.image}
                alt={i === step ? x.alt : ''}
                sizes="(min-width: 48rem) 28rem, 70vw"
                className="clock-img absolute inset-0 size-full object-cover shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                data-active={i === step}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
