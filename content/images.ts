import manifest from './images.json';

type Entry = { w: number; h: number; s?: number };
const MAP = manifest as Record<string, Entry>;

export type ImageKey = keyof typeof manifest;

export interface Img {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
}

/** Path prefix for public assets. './' in the single-file preview build, '/' on the real site. */
export const ASSET_BASE: string = import.meta.env.BASE_URL || '/';

export function img(key: ImageKey): Img {
  const e = MAP[key];
  if (!e) throw new Error(`Unknown image: ${key}`);
  const src = `${ASSET_BASE}img/${key}.webp`;
  return {
    src,
    width: e.w,
    height: e.h,
    srcSet: e.s ? `${ASSET_BASE}img/${key}-900.webp 900w, ${src} ${e.w}w` : undefined,
  };
}

/** Warm the browser cache with the size a full-width hero will ask for. */
export function preload(key: ImageKey, sizes: string) {
  if (typeof window === 'undefined') return;
  const i = img(key);
  const el = new Image();
  el.decoding = 'async';
  el.sizes = sizes;
  if (i.srcSet) el.srcset = i.srcSet;
  el.src = i.src;
}
