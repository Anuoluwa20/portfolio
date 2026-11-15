import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { testimonials } from '../../content/site';
import { archive } from '../../content/archive';
import { SectionHead } from './SectionHead';

/**
 * (06) Testimonials. Each review is set large and in full, and its words fill in from faint to
 * solid as it scrolls up the screen, so it reads like it's being said. The reviewer sits on the
 * left with a stamped monogram (it stays in view on wide screens while the quote fills), plus a
 * link to the project when it's on the site. Quotes are verbatim. Screen readers get the plain
 * quote once; the split words are hidden from them.
 */
export function Testimonials() {
  return (
    <section aria-labelledby="words-title" className="wrap pb-24 md:pb-32">
      <SectionHead id="words-title" title="Testimonials" />

      <ol className="mt-10 md:mt-14">
        {testimonials.map((t) => {
          const words = t.quote.split(' ');
          const project = t.slug ? archive.find((a) => a.slug === t.slug) : undefined;
          return (
            <li key={t.id} className="grid gap-8 border-t border-rule py-12 md:grid-cols-12 md:gap-x-6 md:py-20">
              <div className="md:col-span-4">
                <div className="flex items-start gap-4 md:sticky md:top-28">
                  <span aria-hidden="true" className="tq-badge sd-stamp">
                    {t.initials}
                  </span>
                  <div className="min-w-0 pt-1">
                    <p className="font-medium">{t.role}</p>
                    <p className="text-sm text-muted">{t.company}</p>
                    {project && (
                      <Link
                        to={{ pathname: '/archive', hash: `#${project.slug}` }}
                        viewTransition
                        className="tq-link mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium"
                      >
                        See {project.name}
                        <ArrowUpRight aria-hidden size={16} strokeWidth={1.75} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <figure className="md:col-span-8">
                <blockquote>
                  <p className="sr-only">{t.quote}</p>
                  <p
                    aria-hidden="true"
                    className="tq t-quote"
                    style={{ '--n': words.length } as CSSProperties}
                  >
                    <span className="tq-open">“</span>
                    {words.map((w, j) => (
                      <span key={j}>
                        <span className="tq-w" style={{ '--i': j } as CSSProperties}>
                          {w}
                          {j === words.length - 1 ? '”' : ''}
                        </span>
                        {j < words.length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </p>
                </blockquote>
                <figcaption className="sr-only">
                  {t.role}, {t.company}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
