import { useEffect, useState } from 'react';
import NumberFlow from '@number-flow/react';
import { useBeats, useInViewOnce } from '../../lib/motion';
import { Words } from '../Words';

const IN = 186500;
const OUT = 63900;
const KEPT = IN - OUT; // 122,600, as on the prototype's home screen

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const timing = { duration: 900, easing: EASE };

function Amount({ value, show }: { value: number; show: boolean }) {
  return (
    <NumberFlow
      value={show ? value : 0}
      prefix="₦"
      locales="en-GB"
      format={{ maximumFractionDigits: 0 }}
      transformTiming={timing}
      spinTiming={timing}
      opacityTiming={{ duration: 400, easing: 'ease-out' }}
      className="num"
    />
  );
}

/** MONTRA: the day's three numbers count up, then the ledger bar splits into spent and kept. */
export function LedgerCount() {
  const [ref, seen] = useInViewOnce<HTMLDivElement>(0.4);
  const [armed, setArmed] = useState(false);
  useEffect(() => setArmed(true), []);
  // Beats: money in, money out, money kept (ms)
  const beat = useBeats(seen, [0, 800, 1500]);
  // Server and no-JS render the final figures; on the client they wait at zero until seen.
  const at = (k: number) => !armed || beat >= k;

  return (
    <section aria-labelledby="ledger-title" className="wrap">
      <div ref={ref} className="surface p-6 md:p-10 xl:p-12" data-beat={armed ? beat : 2}>
        <p className="label muted">A trader’s day, counted</p>
        <h2 id="ledger-title" className="display sd-words t-display-2 mt-3 max-w-[18ch]">
          <Words text="Did the shop make money today?" />
        </h2>

        <dl className="mt-10 grid gap-6 md:grid-cols-3">
          <div>
            <dt className="label muted">Money in</dt>
            <dd className="t-figure mt-2 [font-stretch:100%]">
              <Amount value={IN} show={at(0)} />
            </dd>
          </div>
          <div>
            <dt className="label muted">Money out</dt>
            <dd className="t-figure mt-2 [font-stretch:100%]">
              <Amount value={OUT} show={at(1)} />
            </dd>
          </div>
          <div>
            <dt className="label muted">Money kept</dt>
            <dd className="t-figure mt-2 text-[#087F5B] [font-stretch:100%]">
              <Amount value={KEPT} show={at(2)} />
            </dd>
          </div>
        </dl>

        {/* One bar for the day: the lime track is money in; navy eats in from the right, emerald fills from the left */}
        <div aria-hidden="true" className="ledger-bar relative mt-8 h-6 overflow-hidden">
          <span className="ledger-in absolute inset-0 bg-[#C5E86C]" />
          <span className="ledger-out absolute inset-y-0 right-0 bg-[#172B4D]" style={{ width: `${(OUT / IN) * 100}%` }} />
          <span className="ledger-kept absolute inset-y-0 left-0 bg-[#087F5B]" style={{ width: `${(KEPT / IN) * 100}%` }} />
        </div>
        <p className="mt-4 max-w-[68ch] text-sm muted">
          Money in, money out, money kept: the three numbers the app leads with. Figures are the prototype’s sample day
          for Mama Ada Provisions.
        </p>
      </div>
    </section>
  );
}
