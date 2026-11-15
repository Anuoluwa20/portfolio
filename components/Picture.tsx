import type { CSSProperties } from 'react';
import { img, type ImageKey } from '../content/images';

interface Props {
  image: ImageKey;
  alt: string;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
  eager?: boolean;
  priority?: boolean;
  vtName?: string;
  'data-active'?: boolean;
  draggable?: boolean;
  /** Neutral block behind the image while it loads. Off for transparent cut-outs. */
  placeholder?: boolean;
}

/** An <img> with intrinsic size, srcset and optional view-transition name. */
export function Picture({ image, alt, sizes = '100vw', className, style, eager, priority, vtName, placeholder = true, ...rest }: Props) {
  const i = img(image);
  return (
    <img
      src={i.src}
      srcSet={i.srcSet}
      sizes={i.srcSet ? sizes : undefined}
      width={i.width}
      height={i.height}
      alt={alt}
      loading={eager || priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      className={placeholder ? `ph ${className ?? ''}` : className}
      style={vtName ? { ...style, viewTransitionName: vtName } : style}
      {...rest}
    />
  );
}

export const HERO_SIZES = '(min-width: 80rem) 74rem, 100vw';
