import { useEffect, useState } from 'react';
import { site } from '../content/site';

function now() {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: site.timeZone,
  }).format(new Date());
}

/** Local time in Nigeria. Renders a fixed-width placeholder on the server so hydration matches. */
export function Clock({ className }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(now());
    const id = window.setInterval(() => setTime(now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={className}>
      <span aria-hidden="true" className="mr-2 inline-block size-2 translate-y-[-1px] rounded-full bg-accent" />
      <span className="num">
        <time aria-label={time ? `Local time in ${site.location}: ${time}` : undefined}>{time ?? '--:--'}</time>{' '}
        {site.tzLabel}
      </span>
    </span>
  );
}
