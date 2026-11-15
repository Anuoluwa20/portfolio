import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useTitle } from '../lib/nav';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <section className="wrap flex min-h-[70svh] flex-col justify-center py-20">
      <p className="label text-muted">Error 404</p>
      <h1 className="mt-4 text-[6.19rem] font-bold leading-[1.1] tracking-[-0.04em] [font-stretch:125%]">
        404
      </h1>
      <p className="t-lead mt-8 max-w-[30rem]">This page isn’t in the index. It may have moved when the site was rebuilt.</p>
      <Link to="/" viewTransition className="btn btn-solid press mt-8 self-start">
        Back to the work
        <ArrowRight aria-hidden size={16} strokeWidth={1.75} />
      </Link>
    </section>
  );
}
