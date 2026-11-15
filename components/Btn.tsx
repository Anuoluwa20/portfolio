import type { ReactNode } from 'react';
import { Link, type To } from 'react-router';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';

type Icon = 'right' | 'down' | 'ext' | 'none';

interface Base {
  children: string;
  solid?: boolean;
  icon?: Icon;
  className?: string;
  /** Extra content before the label, e.g. an icon of its own. */
  lead?: ReactNode;
}

/**
 * The one button style: a pill whose label rolls up on hover, ending in a round arrow.
 * Renders a router Link (to), a plain anchor (href) or a button (onClick).
 */
export function Btn(
  props: Base &
    (
      | { to: To; onClick?: () => void; viewTransition?: boolean }
      | { href: string; ext?: boolean }
      | { onClick: () => void; pressed?: boolean }
    ),
) {
  const { children, solid, icon = 'right', className = '', lead } = props;
  const ext = 'href' in props && props.ext;
  const I = icon === 'down' ? ArrowDown : ext || icon === 'ext' ? ArrowUpRight : ArrowRight;
  const cls = `pill press ${solid ? 'pill-solid' : ''} ${className}`;
  const inner = (
    <>
      {lead}
      <span className="pill-roll">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
      {icon !== 'none' && (
        <span className="pill-ico" data-dir={ext || icon === 'ext' ? 'ext' : icon}>
          <I aria-hidden size={15} strokeWidth={2} />
        </span>
      )}
      {ext && <span className="sr-only">(opens in a new tab)</span>}
    </>
  );
  if ('to' in props)
    return (
      <Link to={props.to} viewTransition={props.viewTransition} onClick={props.onClick} className={cls}>
        {inner}
      </Link>
    );
  if ('href' in props)
    return (
      <a href={props.href} target={ext ? '_blank' : undefined} rel={ext ? 'noreferrer' : undefined} className={cls}>
        {inner}
      </a>
    );
  return (
    <button type="button" onClick={props.onClick} aria-pressed={props.pressed} className={cls}>
      {inner}
    </button>
  );
}
