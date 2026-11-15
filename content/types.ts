import type { ImageKey } from './images';

export type Status = 'Client' | 'Self-initiated' | 'Design challenge' | 'Concept' | 'Study';
export type Track = 'product' | 'brand';

export interface Theme {
  bg: string;
  ink: string;
  muted: string;
  rule: string;
  /** Decorative colour: numbers, markers, link underlines. */
  accent: string;
  /** 'light' or 'dark' decides focus ring and selection colours. */
  tone: 'light' | 'dark';
}

export interface Shot {
  image: ImageKey;
  alt: string;
  caption?: string;
  /** Span two columns in a grid. */
  span?: 2;
}

export type Block =
  | { type: 'text'; label: string; title?: string; body: string[] }
  | { type: 'list'; label: string; title?: string; intro?: string; items: string[] }
  | { type: 'findings'; label: string; title?: string; items: { figure: string; text: string }[] }
  | {
      type: 'decision';
      n: string;
      /** The heading, in plain words. */
      title?: string;
      from: string;
      to: string;
      body: string[];
      shot?: Shot;
      /** Portrait phone screens sit beside the text; wide shots go below it. */
      layout?: 'side' | 'below';
    }
  | { type: 'figure'; shot: Shot; bleed?: boolean }
  | { type: 'grid'; shots: Shot[]; cols: 2 | 3 | 4; label?: string; title?: string }
  | { type: 'chapter'; n: string; title: string; line?: string }
  | { type: 'flavours' }
  | { type: 'ledger' }
  | { type: 'scan' }
  | { type: 'clock' }
  | { type: 'note'; label: string; body: string[] }
  | {
      type: 'video';
      label: string;
      title?: string;
      body?: string[];
      /** Path under the site root, e.g. 'video/velora-reel.mp4'. */
      src: string;
      poster: ImageKey;
      width: number;
      height: number;
      caption?: string;
    };

export interface Project {
  slug: string;
  n: string;
  name: string;
  /** One line in the index: an outcome, a question or an idea-title. */
  line: string;
  /** Headline on the project page. */
  headline: string;
  /** Short line under the headline. */
  dek: string;
  types: string[];
  tracks: Track[];
  sector: string;
  status: Status;
  year: string;
  cover: ImageKey;
  coverAlt: string;
  theme: Theme;
  /** 'case' = text-led product case study; 'gallery' = image-led brand page. */
  mode: 'case' | 'gallery';
  meta: [string, string][];
  /** Working prototypes kept in /public/live, opened in the in-page viewer. */
  live?: LiveDemo[];
  /** An outside link, such as a live client site. */
  link?: { href: string; label: string };
  blocks: Block[];
  description: string;
}

export interface ArchiveItem {
  slug: string;
  name: string;
  line: string;
  type: string;
  status: Status;
  year: string;
  role: string;
  image: ImageKey;
  alt: string;
  note: string;
  live?: LiveDemo[];
}

export interface LiveDemo {
  /** Verb-first button label. */
  label: string;
  /** Shown in the viewer's top bar and as the iframe title. */
  title: string;
  /** Path under /live, e.g. 'montra-web/index.html'. */
  path: string;
}
