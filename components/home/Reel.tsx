import { Link } from 'react-router';
import { img, type ImageKey } from '../../content/images';
import { Picture } from '../Picture';

/** The reel's pieces. Each keeps an internal code (a letter per project, a number per piece) as its key; codes aren't shown. */
const REEL: { code: string; image: ImageKey; name: string; what: string; slug: string }[] = [
  { code: 'A 01', image: 'commons-cover', name: 'Commons', what: 'Website', slug: 'commons' },
  { code: 'B 01', image: 'velora-flyer', name: 'VELORA', what: 'Launch flyer', slug: 'velora' },
  { code: 'G 01', image: 'nocturne-home', name: 'NOCTURNE', what: 'Landing page', slug: 'nocturne' },
  { code: 'C 01', image: 'crunch-cover', name: 'Crunch House', what: 'Packaging', slug: 'crunch-house' },
  { code: 'D 01', image: 'confam-cover', name: 'Confam', what: 'Website', slug: 'confam' },
  { code: 'E 01', image: 'ea-poster', name: 'Explore Africa', what: 'Poster', slug: 'explore-africa' },
  { code: 'A 02', image: 'commons-flow', name: 'Commons', what: 'RSVP', slug: 'commons' },
  { code: 'B 02', image: 'velora-car-2', name: 'VELORA', what: 'Carousel', slug: 'velora' },
  { code: 'C 02', image: 'crunch-ad-suya', name: 'Crunch House', what: 'Suya ad', slug: 'crunch-house' },
  { code: 'D 02', image: 'confam-brand', name: 'Confam', what: 'Brand', slug: 'confam' },
  { code: 'E 02', image: 'ea-billboard', name: 'Explore Africa', what: 'Billboard', slug: 'explore-africa' },
  { code: 'G 02', image: 'nocturne-editor', name: 'NOCTURNE', what: '3D editor', slug: 'nocturne' },
  { code: 'F 01', image: 'montra-cover', name: 'MONTRA', what: 'Dashboard', slug: 'montra' },
  { code: 'C 03', image: 'crunch-poster', name: 'Crunch House', what: 'Poster', slug: 'crunch-house' },
  { code: 'B 03', image: 'velora-popup', name: 'VELORA', what: 'Pop-up', slug: 'velora' },
  { code: 'F 02', image: 'montra-mobile', name: 'MONTRA', what: 'Mobile app', slug: 'montra' },
  { code: 'E 03', image: 'ea-lightbox-art', name: 'Explore Africa', what: 'Lightbox', slug: 'explore-africa' },
  { code: 'F 03', image: 'montra-brand', name: 'MONTRA', what: 'Brand', slug: 'montra' },
];

/**
 * A reel of the work under the hero. It drifts sideways on its own and stops while you hover or
 * focus it. Pictures sit in halftone and come up in colour when you point at them.
 * With reduced motion it stays still and scrolls sideways instead.
 */
export function Reel() {
  const row = (copy: number) =>
    REEL.map((r) => {
      const i = img(r.image);
      return (
        <li key={`${copy}-${r.code}`} className="reel-item" aria-hidden={copy > 0 || undefined}>
          <Link
            to={`/work/${r.slug}`}
            viewTransition
            tabIndex={copy > 0 ? -1 : undefined}
            aria-label={`${r.name}, ${r.what}`}
            className="group block"
          >
            <span className="reel-img block overflow-hidden" style={{ aspectRatio: `${i.width} / ${i.height}` }}>
              <Picture image={r.image} alt="" sizes="20rem" className="size-full object-cover" />
            </span>
          </Link>
        </li>
      );
    });

  return (
    <div className="reel" aria-label="A reel of the work">
      <ul className="reel-track">
        {row(0)}
        {row(1)}
      </ul>
    </div>
  );
}
