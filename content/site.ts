export const site = {
  name: 'Oyebanji Anuoluwapo',
  fullName: 'Oyebanji Anuoluwapo Eniola',
  role: 'Product & brand designer',
  focus: 'Fintech, trust & safety, packaging',
  location: 'Nigeria',
  timeZone: 'Africa/Lagos',
  tzLabel: 'WAT',
  email: 'anuoluwaoyebanji20@gmail.com',
  phone: '+234 703 026 9759',
  phoneHref: 'tel:+2347030269759',
  linkedin: 'https://linkedin.com/in/oyebanji-anuoluwapo-163a62307',
  x: 'https://x.com/OyebanjiAnu12',
  bookCall: 'https://cal.com/oyebanji-anuoluwa-ivsr2j/15min',
  updated: 'November 2026',
  description:
    'Oyebanji Anuoluwapo is a product and brand designer in Nigeria: fintech and trust products, brand identity, packaging and campaigns.',
};

export const availability =
  'Open to remote product design roles, and to brand, packaging and campaign projects.';

export const bio = [
  'I’m Oyebanji Anuoluwapo Eniola, a product and brand designer in Nigeria. For a little over two years I’ve designed apps and dashboards in fintech, food delivery, cybersecurity, mobility, e-commerce, AI and edtech, and, more and more, the brands, packaging and campaigns around them.',
  'I like problems where the stakes are concrete: a trader closing the day, a buyer about to send a transfer, a crisp packet competing for a shelf. I start with the people and the numbers, then design the brand and the interface as one system.',
];

export const services = [
  {
    title: 'Product & UX',
    items: [
      'Product design and design systems',
      'Web apps and dashboards',
      'Mobile apps and prototyping',
      'User research and flows',
    ],
  },
  {
    title: 'Brand, packaging & campaigns',
    items: [
      'Logo and identity systems',
      'Packaging and flavour ranges',
      'Social, print and out-of-home campaigns',
      'Brand guidelines',
    ],
  },
];

/** Craft skills, drawn from the services above and the case studies. Confirm with the owner. */
export const skills = [
  'User research',
  'User flows and wireframes',
  'UI design',
  'Design systems',
  'Prototyping',
  'Identity design',
  'Packaging design',
  'Campaign design',
];

export const tools = {
  design: ['Figma', 'FigJam', 'Framer', 'Canva'],
  ai: ['Claude', 'ChatGPT', 'Gemini', 'Google Stitch'],
};

export interface Quote {
  id: string;
  quote: string;
  role: string;
  company: string;
  initials: string;
  /** Archive project the review is about, if it's on the site. */
  slug?: string;
}

/** Real testimonials. Quotes are verbatim; no photos. */
export const testimonials: Quote[] = [
  {
    id: 't_2',
    quote:
      'Working with Oyebanji on VulnWatch AI was a fantastic experience. They translated technical security vulnerability data into visual dashboards that our clients love using.',
    role: 'CEO & Co-Founder',
    company: 'VulnWatch AI',
    initials: 'VW',
    slug: 'vulnwatch',
  },
  {
    id: 't_3',
    quote:
      'Oyebanji’s design systems and attention to detail during developer handoff ensured our engineering team built Xtreeq Campus Transit quickly without design misalignments.',
    role: 'Head of Mobile Development',
    company: 'Xtreeq Transit',
    initials: 'XT',
  },
];

/**
 * The owner's intro film (a hand dials a red rotary phone through the curtain). Add the two files
 * to public/video/ and set them here; until then the curtain opens without a film.
 */
export const introVideo: { wide: string; tall: string } | null = null;
