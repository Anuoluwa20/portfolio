import type { CSSProperties } from 'react';
import { availability, bio, site } from '../../content/site';
import { Picture } from '../Picture';
import { SectionHead } from './SectionHead';

/** (07) About: portrait on the left, bio on the right. Same in both options. */
export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="wrap pb-24 md:pb-32">
      <SectionHead
        id="about-title"
        title="About"
      />
      <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:gap-x-6">
        <div className="sd-wipe max-w-80 rounded-[14px] md:col-span-4 md:max-w-none">
          <span className="ht block">
            <Picture
              image="portrait"
              alt={`Portrait of ${site.fullName}.`}
              sizes="(min-width: 48rem) 30vw, 20rem"
              className="aspect-[4/5] w-full object-cover"
            />
          </span>
        </div>
        <div className="min-w-0 md:col-span-8 md:self-end">
          <div className="prose-col t-lead">
            {bio.map((p, i) => (
              <p key={p.slice(0, 24)} className="sd-rise" style={{ '--i': i } as CSSProperties}>
                {p}
              </p>
            ))}
          </div>
          <p className="label mt-10 border-t border-rule pt-4 text-muted">{availability}</p>
        </div>
      </div>
    </section>
  );
}
