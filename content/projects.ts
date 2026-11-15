import type { Project } from './types';

/**
 * The seven selected projects, in index order.
 * Product projects are text-led ('case'); brand and packaging projects are image-led ('gallery').
 * Copy here is the source of truth for the whole site. Keep claims to what actually happened.
 */
export const projects: Project[] = [
  {
    slug: 'commons',
    n: '01',
    name: 'Commons',
    line: 'Save a seat in about 20 seconds',
    headline: 'A meetup page that reads like an invitation and saves you a seat in about 20 seconds.',
    dek: 'Landing page and RSVP for a free monthly meetup for designers, developers, founders and creatives.',
    types: ['Web'],
    tracks: ['product'],
    sector: 'Events · community',
    status: 'Client',
    year: '2026',
    cover: 'commons-cover',
    coverAlt:
      'Commons landing page for meetup #24, “Design in the Age of AI”, with a ticket showing seat 159, next to a phone showing the RSVP confirmation.',
    theme: {
      bg: '#F6F6F4',
      ink: '#111111',
      muted: '#6B6B6B',
      rule: '#DADAD6',
      accent: '#1F2BFF',
      tone: 'light',
    },
    mode: 'case',
    meta: [
      ['Role', 'Designer'],
      ['Event', 'Commons #24, “Design in the Age of AI”'],
      ['Platform', 'Website'],
      ['Status', 'Live'],
    ],
    live: [{ label: 'Try the site', title: 'Commons · Website', path: 'commons/index.html' }],
    link: { href: 'https://commons-a.vercel.app/', label: 'Visit the live site' },
    description:
      'Commons is a free monthly meetup for designers, developers, founders and creatives. The site promotes the next night and lets people save a seat in about 20 seconds.',
    blocks: [
      {
        type: 'text',
        label: 'Brief',
        body: [
          'Commons is a free monthly meetup for designers, developers, founders and creatives. The site has one job: get people to the next night. I designed the page for Commons #24, “Design in the Age of AI”.',
        ],
      },
      {
        type: 'decision',
        n: '01',
        title: 'The RSVP ends in a ticket',
        from: 'a sign-up form',
        to: 'a ticket',
        body: [
          'Saving a seat is two short steps: name and email, then what you do. It ends with a ticket that shows your seat number and an add-to-calendar button, so the RSVP feels like being let in rather than filling in a form.',
        ],
        shot: {
          image: 'commons-flow',
          alt: 'Three phone screens of the RSVP: name and email, "One quick thing" with role choices, then a ticket for seat 159.',
          caption: 'Step one, step two, then the ticket.',
        },
        layout: 'below',
      },
      {
        type: 'decision',
        n: '02',
        title: 'The doubts get answered first',
        from: 'hesitation',
        to: 'answers before they’re asked',
        body: [
          'The page leads with the event and a live seat counter, then the agenda, the speakers and photos from past nights. The FAQ answers what stops people coming: is it free, can I come alone, is it accessible?',
        ],
        shot: {
          image: 'commons-evening',
          alt: 'The evening laid out as a timeline from doors at 6:00 to networking at 9:30, with a photo of a past night above.',
          caption: 'The evening, to scale.',
        },
        layout: 'below',
      },
      {
        type: 'text',
        label: 'Look',
        body: [
          'A dark theme, italic accents and a seat map give it the feel of an evening out.',
        ],
      },
      {
        type: 'grid',
        cols: 2,
        shots: [
          { image: 'commons-table', alt: 'The round table: speakers and your seat around the #24 badge.', caption: 'Your seat fills in at the table after you RSVP.' },
          { image: 'commons-speakers', alt: 'Speakers this month: four black-and-white portraits with their talk titles.' },
          { image: 'commons-events', alt: 'Events page with Talks, Workshops and Socials filters and upcoming nights.', span: 2 },
        ],
      },
    ],
  },
  {
    slug: 'velora',
    n: '02',
    name: 'VELORA',
    line: 'Make your presence loud.',
    headline: 'Make your presence loud.',
    dek: 'A Lagos streetwear label and its first drop: logo, launch flyer, social posts, packaging and a 30-second reel.',
    types: ['Identity', 'Campaign', 'Packaging'],
    tracks: ['brand'],
    sector: 'Fashion',
    status: 'Design challenge',
    year: '2026',
    cover: 'velora-cover',
    coverAlt:
      'Three VELORA launch pieces on red: a night-time story reading "Make your presence loud.", the launch flyer with a black hoodie on concrete, and a numbered hang tag.',
    theme: {
      bg: '#0B0B0C',
      ink: '#F2F0EB',
      muted: '#8C8C88',
      rule: '#2A2A2C',
      accent: '#E10600',
      tone: 'dark',
    },
    mode: 'gallery',
    meta: [
      ['Scope', 'Logo, launch flyer, carousel, story, pop-up sign, packaging, hang tags, 30-second reel'],
      ['Brief', 'Design challenge, day 7'],
      ['Status', 'Design challenge'],
    ],
    description:
      'Identity and launch for VELORA, a premium Lagos streetwear label that numbers every piece, from the flyer to the hang tag to a 30-second reel.',
    blocks: [
      {
        type: 'text',
        label: 'Brief',
        body: [
          'The brief asked for one launch flyer for VELORA’s new streetwear collection, with the line “Make your presence loud.”, four highlights and “Shop the new collection.” The logo, collection name, prices and launch offer were left open.',
          'I set it in Lagos and called the first drop DECIBEL. From the flyer it grew into the whole launch: social posts, a pop-up sign, packaging, hang tags and a 30-second reel.',
        ],
      },
      {
        type: 'grid',
        cols: 2,
        label: 'Launch flyer',
        shots: [
          {
            image: 'velora-flyer',
            alt: 'Launch flyer: "Make your presence loud." in red around a black hoodie on concrete, with the drop date and velora.ng running up the sides.',
            caption: 'Launch flyer, 1080 × 1350.',
          },
          {
            image: 'velora-flyer-ig',
            alt: 'Red Instagram version: hands holding the folded hoodie, "Make your presence LOUD.", the four highlights and the Lekki pop-up details.',
            caption: 'Instagram version, with the four highlights and the pop-up details.',
          },
        ],
      },
      {
        type: 'text',
        label: 'Idea',
        body: [
          'Every piece is numbered: 300 of each style, No. 001 to No. 300. None of the twelve streetwear brands I looked at number their pieces, so the number became the hook. It turns up on the hang tag, the receipt post, the box and the end of the reel.',
          'Red is kept for one word and the label mark, never body text. Headlines are set in Archivo at 62% width; prices, codes and dates in JetBrains Mono.',
        ],
      },
      {
        type: 'chapter',
        n: 'Identity',
        title: 'The label',
        line: 'The mark is a woven clothing label: a notch at the top for the V, and a swallowtail at the bottom that returns as the last letter of the wordmark.',
      },
      {
        type: 'figure',
        shot: {
          image: 'velora-lockup',
          alt: 'VELORA logo on red: the black label mark beside the wordmark, its final A drawn as an open Λ.',
          caption: 'Label mark and wordmark.',
        },
        bleed: true,
      },
      {
        type: 'grid',
        cols: 3,
        label: 'Social',
        shots: [
          {
            image: 'velora-car-1',
            alt: 'Carousel slide 1: a black hoodie with its red woven label and "Make your presence LOUD."',
            caption: 'Carousel 1: the label.',
          },
          {
            image: 'velora-car-2',
            alt: 'Carousel slide 2: "Five pieces. 300 of each." with the hoodie, tee, cargo pants, cap and coach jacket and their prices.',
            caption: 'Carousel 2: five pieces, 300 of each.',
          },
          {
            image: 'velora-car-3',
            alt: 'Carousel slide 3: a VELORA receipt on concrete listing the five pieces, prices, sizes, free Lagos delivery and the code LOUD15.',
            caption: 'Carousel 3: the receipt, with prices and the launch code.',
          },
        ],
      },
      {
        type: 'grid',
        cols: 2,
        shots: [
          {
            image: 'velora-story',
            alt: 'Story: "Make your presence LOUD. Drops in 3 days, 27.11.26 — 19:00" over a wet Lagos street at night.',
            caption: 'Countdown story, 1080 × 1920.',
          },
          {
            image: 'velora-popup',
            alt: 'A shipping-container pop-up on a Lagos street at night under a red VELORA sign, captioned "Lekki pop-up 27–29.11.26".',
            caption: 'Lekki pop-up sign, mocked up.',
          },
        ],
      },
      {
        type: 'chapter',
        n: 'Packaging',
        title: 'Down to the tag',
        line: 'A black mailer box, red tape, tissue, stickers, a garment bag, and a hang tag with a blank for the piece number.',
      },
      {
        type: 'grid',
        cols: 2,
        shots: [
          {
            image: 'velora-box',
            alt: 'Mailer box: matte black lid with the wordmark printed black on black, a red inside lid reading "Make your presence loud." with a piece number line, and red packing tape.',
            caption: 'Mailer box and tape.',
          },
          {
            image: 'velora-tissue',
            alt: 'Bone tissue paper printed with small red label marks, a sticker sheet with a "Loud." circle and a number label, and a frosted garment bag.',
            caption: 'Tissue, stickers and garment bag.',
          },
        ],
      },
      {
        type: 'figure',
        shot: {
          image: 'velora-tags',
          alt: 'Hang tags: the front in red with the black label mark and wordmark; the back in bone with "Make your presence loud." and a line for the piece number out of 300.',
          caption: 'Hang tag, front and back.',
        },
      },
      {
        type: 'chapter',
        n: 'Film',
        title: '30 seconds, loud',
        line: 'A 30-second launch reel for Reels, TikTok and Shorts.',
      },
      {
        type: 'video',
        label: 'Reel',
        title: 'Lagos calls three times',
        body: [
          'A danfo conductor’s call opens the reel, comes back on the street and closes it, so the end loops straight into the start. In between: the label, the pieces, the city at night, then 300 numbered pieces and the date.',
          'Headline words land on the beat, the sound drops out for a moment before “Loud.”, and a counter runs from No. 001 to 300 before the end card.',
        ],
        src: 'video/velora-reel.mp4',
        poster: 'velora-reel-poster',
        width: 720,
        height: 1280,
        caption: '30-second launch reel, 9:16, with sound.',
      },
    ],
  },
  {
    slug: 'nocturne',
    n: '03',
    name: 'NOCTURNE',
    line: 'Design your world before you live in it',
    headline: 'A 3D planner for apartments and workspaces, with real prices and the light at any hour.',
    dek: 'Plan an apartment or a workspace in 3D: pick a layout and a style, place the furniture, keep each room on budget and see it at any hour of the day.',
    types: ['Web'],
    tracks: ['product'],
    sector: 'Interiors · 3D',
    status: 'Concept',
    year: '2026',
    cover: 'nocturne-cover',
    coverAlt:
      'NOCTURNE landing page in a browser, “Design your world before you live in it.”, over a furnished 3D room at 19:40 dusk, next to a phone showing the 3D editor.',
    theme: {
      bg: '#F5F1E9',
      ink: '#17191D',
      muted: '#5B5A57',
      rule: '#D8D0C4',
      accent: '#5F4E96',
      tone: 'light',
    },
    mode: 'case',
    meta: [
      ['Role', 'Product designer'],
      ['Screens', 'Landing, sign-up, onboarding, studio, layouts, styles, 3D editor, budget, preview, walkthrough, share, settings'],
      ['Platform', 'Web, desktop and phone'],
      ['Status', 'Concept'],
    ],
    live: [{ label: 'Try the app', title: 'NOCTURNE · Prototype', path: 'nocturne/index.html' }],
    description:
      'NOCTURNE is a 3D planner for apartments and workspaces: pick a layout and a style, place real furniture, keep each room on budget and see it at any hour of the day.',
    blocks: [
      {
        type: 'text',
        label: 'Brief',
        body: [
          'Planning a flat usually means a floor plan, a moodboard and a spreadsheet that never agree. NOCTURNE puts them in one place: the room in 3D, the furniture with prices, and the light at the hour you’ll actually be home.',
          'It covers the whole trip, from the landing page and sign-up to the editor, the budget, a walkthrough and sharing. Designs save in the browser.',
        ],
      },
      {
        type: 'figure',
        shot: {
          image: 'nocturne-home',
          alt: 'Landing page: “Design your world before you live in it.” over a 3D living room at dusk, with price tags on the floor lamp, sofa and desk, and a time-of-day control set to 19:40.',
          caption: 'The landing page opens on the sample room, priced, at 19:40.',
        },
        bleed: true,
      },
      {
        type: 'decision',
        n: '01',
        title: 'Every space opens furnished',
        from: 'an empty room',
        to: 'a furnished start',
        body: [
          'You pick a layout (a studio, one or two bedrooms, or a workspace on its own), then a style, and the rooms arrive furnished. The first thing you do is change something, not stare at an empty box.',
          'A style sets the walls, floor, fabric and wood in one step. There are eight, from modern minimalism to futuristic.',
        ],
        shot: {
          image: 'nocturne-style',
          alt: 'Choose a style: eight style cards with palettes, Scandinavian selected, and a preview of the furnished room with its walls and floor listed.',
          caption: 'Choosing a style furnishes the plan.',
        },
        layout: 'below',
      },
      {
        type: 'grid',
        cols: 2,
        shots: [
          {
            image: 'nocturne-onboard',
            alt: 'Onboarding: “What are you designing?” with Apartment, Workspace and Apartment + workspace cards.',
            caption: 'Onboarding starts with what you’re designing.',
          },
          {
            image: 'nocturne-layout',
            alt: 'Choose a layout: Studio 32 m², One bedroom 55 m², Two bedroom 78 m² selected, and Workspace only 24 m², each with a small plan.',
            caption: 'Layouts, with an overall size slider.',
          },
        ],
      },
      {
        type: 'figure',
        shot: {
          image: 'nocturne-editor',
          alt: 'The 3D editor: a furniture library on the left, the living room in the middle at dusk, room size, spend, wall and floor swatches on the right, and the time-of-day bar below.',
          caption: 'The editor: library on the left, the room and its finishes on the right, the time of day underneath.',
        },
        bleed: true,
      },
      {
        type: 'decision',
        n: '02',
        title: 'The moon tells the time',
        from: 'a time picker',
        to: 'moon phases',
        body: [
          'The five moments of the day (morning, noon, golden hour, dusk and night) are drawn as moon phases along a 24-hour track. Move the sun and the room changes with it; lamps come on at dusk, and you set how warm they are.',
          'The same moon is in the name: the O of the wordmark is a full moon and the C a crescent.',
        ],
        shot: {
          image: 'nocturne-night',
          alt: 'The same living room at 22:30 night: lamps on, the window dark, the night phase selected on the time bar.',
          caption: 'The living room at 22:30.',
        },
        layout: 'below',
      },
      {
        type: 'decision',
        n: '03',
        title: 'Every piece has a price',
        from: 'a guess',
        to: 'a running total',
        body: [
          'Each room gets its own budget. Every piece is priced, the total sits in the top bar while you design, and the budget page shows which room is over and by how much. A cheaper finish is one tap away, and the shopping list downloads as a spreadsheet.',
          'The prices are estimates, not live retail prices.',
        ],
        shot: {
          image: 'nocturne-budget',
          alt: 'Budget overview: $7,380 of $8,400 with $1,020 left; living room 73% used, bedroom at the limit, home office over by $225, and a list of every piece.',
          caption: 'The budget, room by room.',
        },
        layout: 'below',
      },
      {
        type: 'decision',
        n: '04',
        title: 'Walk through it before you move',
        from: 'a floor plan',
        to: 'eye level',
        body: [
          'The preview shows the finished home with each room’s spend pinned to it. From there you can step inside at eye height, one room at a time: drag to look, and use W A S D or the arrow keys to walk.',
        ],
        shot: {
          image: 'nocturne-walk',
          alt: 'Walkthrough of the living room at night at eye level, with a minimap, walk controls and the time-of-day bar.',
          caption: 'Inside the living room at night.',
        },
        layout: 'below',
      },
      {
        type: 'grid',
        cols: 2,
        shots: [
          {
            image: 'nocturne-preview',
            alt: 'Project preview of the two-bedroom apartment in 3D with each room’s spend pinned, the total, and the room sizes and finishes listed beside it.',
            caption: 'Preview, with each room’s spend.',
          },
          {
            image: 'nocturne-sketch',
            alt: 'The editor in Sketch view: the same living room drawn as clean lines.',
            caption: 'Sketch view: the same room as a line drawing.',
          },
        ],
      },
      {
        type: 'figure',
        shot: {
          image: 'nocturne-phones',
          alt: 'Three phones: the studio home with the sample apartment, the 3D editor with the time bar, and the budget by room.',
          caption: 'On a phone: the studio, the editor and the budget.',
        },
      },
      {
        type: 'text',
        label: 'Look',
        body: [
          'Ivory paper, midnight ink and one lavender accent, with lamp gold for the sun on the time bar. Headings are in Newsreader and everything else in Instrument Sans. The icons are drawn for the app in a single 1.5-pixel line.',
        ],
      },
      {
        type: 'grid',
        cols: 2,
        shots: [
          {
            image: 'nocturne-styles',
            alt: 'The landing page’s eight styles, each card listing its walls, floor, fabric and wood.',
            caption: 'Eight styles on the landing page.',
          },
          {
            image: 'nocturne-light',
            alt: 'The landing page’s light section: “The same room, five times a day.” above a photo of the living room at dusk.',
            caption: 'The same room, five times a day.',
          },
        ],
      },
    ],
  },
  {
    slug: 'crunch-house',
    n: '04',
    name: 'Crunch House',
    line: 'Three flavours, one loud shelf',
    headline: 'Three flavours, one loud shelf.',
    dek: 'Crisps packaging, identity and launch campaign.',
    types: ['Packaging', 'Campaign'],
    tracks: ['brand'],
    sector: 'FMCG · snacks',
    status: 'Design challenge',
    year: '2026',
    cover: 'crunch-cover',
    coverAlt:
      'Three Crunch House crisp packs on a red background: Suya Spice, Classic Salted and Ata Rodo Hot Pepper, under the line "Pick your crunch."',
    theme: {
      bg: '#B20A17',
      ink: '#FFF5D9',
      muted: '#F6CFC4',
      rule: 'rgba(255,245,217,0.28)',
      accent: '#FFD23F',
      tone: 'dark',
    },
    mode: 'gallery',
    meta: [
      ['Scope', 'Logo, packaging system, launch campaign'],
      ['Brief', 'Design challenge, day 4'],
      ['Range', 'Classic Salted, Suya Spice, Ata Rodo Hot Pepper'],
      ['Status', 'Design challenge'],
    ],
    description:
      'Packaging and identity for a Nigerian ridge-cut potato crisps brand with three flavours, plus its launch campaign.',
    blocks: [
      {
        type: 'text',
        label: 'Brief',
        body: [
          'Crunch House is a Nigerian ridge-cut potato crisps brand with three flavours: Classic Salted, Suya Spice and Ata Rodo Hot Pepper. The range had to read as one family from across a shop, and each flavour had to be easy to grab.',
        ],
      },
      { type: 'flavours' },
      {
        type: 'figure',
        shot: {
          image: 'crunch-flats',
          alt: 'Flat pack artwork: the fronts of Classic, Suya and Ata Rodo, and the back of the Classic pack with the nutrition panel.',
          caption: 'Flat artwork: three fronts and the back panel. Only the colour band and the flavour icon change.',
        },
        bleed: true,
      },
      {
        type: 'text',
        label: 'System',
        body: [
          'The logo is a house: a badge, a mark and a horizontal lockup. A roof-ridge zigzag runs behind everything and doubles as the ridge-cut crisp. Every flavour keeps the same yellow bag and changes only its colour band and icon, so the range reads as one family on the shelf.',
          'Type is Lilita One for the wordmark, Anton for flavour names and DM Sans for the small print.',
        ],
      },
      {
        type: 'figure',
        shot: {
          image: 'crunch-board-identity',
          alt: 'Crunch House identity board: the house-shaped logo badge, logo variations, the palette, type specimens and the roof-ridge pattern.',
          caption: 'Identity board: logo system, palette, type and the roof-ridge pattern.',
        },
        bleed: true,
      },
      {
        type: 'grid',
        cols: 2,
        shots: [
          {
            image: 'crunch-board-architecture',
            alt: 'Pack architecture board numbering the front-of-pack hierarchy: brand, product, appetite hero, claim and flavour band.',
            caption: 'Pack architecture: what the eye reads first, second and third.',
          },
          {
            image: 'crunch-board-flavours',
            alt: 'Flavour system board showing the three packs with blue, brown and green bands on a yellow background.',
            caption: 'Flavour system: one bag, three bands.',
          },
        ],
      },
      {
        type: 'figure',
        shot: {
          image: 'crunch-packs',
          alt: 'Three tilted Crunch House packs on red panels: Suya, Classic and Ata Rodo.',
          caption: 'Pack mockups.',
        },
        bleed: true,
      },
      {
        type: 'chapter',
        n: 'Chapter 2',
        title: 'Launch campaign',
        line: '“So crunchy, the whole house hears it.”',
      },
      {
        type: 'grid',
        cols: 2,
        shots: [
          {
            image: 'crunch-ad-hero',
            alt: 'Crunch House hero feed ad: "So crunchy, the whole house hears it." with a Classic pack and crisps.',
            caption: 'Hero feed ad, 1080 × 1350.',
          },
          {
            image: 'crunch-ad-story',
            alt: 'Crunch House Instagram story version of the hero ad.',
            caption: 'Story, 1080 × 1920.',
          },
        ],
      },
      {
        type: 'grid',
        cols: 3,
        label: 'Flavour posts',
        shots: [
          {
            image: 'crunch-ad-classic',
            alt: 'Classic flavour post on blue: "The one that started the noise."',
            caption: 'Classic: “The one that started the noise.”',
          },
          {
            image: 'crunch-ad-suya',
            alt: 'Suya flavour post on brown: "Suya spot energy. In a bag."',
            caption: 'Suya: “Suya spot energy. In a bag.”',
          },
          {
            image: 'crunch-ad-atarodo',
            alt: 'Ata Rodo flavour post on green: "Hot enough to wake the neighbours."',
            caption: 'Ata Rodo: “Hot enough to wake the neighbours.”',
          },
        ],
      },
      {
        type: 'grid',
        cols: 2,
        shots: [
          {
            image: 'crunch-poster',
            alt: 'A2 poster: "So crunchy, the whole house hears it." in yellow on red with a tilted Classic pack.',
            caption: 'A2 poster.',
          },
          {
            image: 'crunch-street',
            alt: 'The A2 poster mocked up on an orange wall on a Lagos street.',
            caption: 'Street poster mockup, Lagos.',
          },
        ],
      },
      {
        type: 'note',
        label: 'Credits',
        body: [
          'Concept, identity, packaging and campaign: me. Pack shots and the street poster are mockups, not photographs of printed work.',
        ],
      },
    ],
  },
  {
    slug: 'confam',
    n: '05',
    name: 'Confam',
    line: 'Who are you about to pay?',
    headline: 'A scam check that shows what other buyers posted about a seller, before you send the money.',
    dek: 'Research, brand, website and WhatsApp bot for young Nigerians buying from social-media vendors.',
    types: ['Product', 'Research', 'Brand'],
    tracks: ['product'],
    sector: 'Trust & safety',
    status: 'Self-initiated',
    year: '2026',
    cover: 'confam-cover',
    coverAlt:
      'Confam website on a laptop and phone, asking "Who are you about to pay?" with a search box for an account number, phone or @handle.',
    theme: {
      bg: '#FAF7F0',
      ink: '#14161F',
      muted: '#5C5E68',
      rule: '#E3DDCF',
      accent: '#E5A400',
      tone: 'light',
    },
    mode: 'case',
    meta: [
      ['Role', 'Research, brand and product design, solo'],
      ['Timeline', 'November 2026'],
      ['Platform', 'Website and WhatsApp bot'],
      ['Status', 'Self-initiated concept. “Confam” is a working name'],
    ],
    live: [{ label: 'Try the website prototype', title: 'Confam · Website prototype', path: 'confam/index.html' }],
    description:
      'Confam lets young Nigerians check a vendor or an investment offer before they pay, by showing what other buyers have already posted about it in public.',
    blocks: [
      {
        type: 'text',
        label: 'The problem',
        body: [
          'Young Nigerians buy from vendors they find on Instagram, TikTok, WhatsApp and X, and people they know pitch them “double your money” schemes in group chats. The warning often already exists, as a call-out on TikTok, X, Instagram or Nairaland. Almost nobody looks it up before paying.',
        ],
      },
      {
        type: 'findings',
        label: 'What I found',
        title: 'The gap was real, and narrower than I first thought.',
        items: [
          {
            figure: '0',
            text: 'products I found, in Nigeria or abroad, that search existing public call-outs about one seller and show the posts.',
          },
          {
            figure: '6+',
            text: 'small Nigerian report sites launched in 2026. All of them wait for people to send reports to their own database.',
          },
          {
            figure: '2',
            text: 'free AI checkers (Bitdefender Scamio and Norton Genie) already read pitches in general, so I didn’t compete there.',
          },
        ],
      },
      {
        type: 'text',
        label: 'The reframe',
        title: 'From “is this vendor a scam?” to “what has already been said about this account, and where?”',
        body: [
          'A tool can’t know whether a seller is honest. It can show the evidence that already exists and let the buyer decide. That turned a verdict into a search, and it set the rules for everything else.',
        ],
      },
      {
        type: 'list',
        label: 'Rules',
        title: 'Rules for a sensitive topic',
        items: [
          'Never say “safe”. Say “not found on the SEC list when we checked on [date]”.',
          'Show counts, dates and sources. No scores, no green, no ticks.',
          'Mask account numbers, and show results only to the person who searched.',
          'Give vendors a way to reply, and fix wrong-person matches straight away.',
        ],
      },
      { type: 'scan' },
      {
        type: 'decision',
        n: '01',
        title: 'Worded results, with the posts underneath',
        from: 'a risk score',
        to: 'what was found',
        body: [
          'Results use three or four worded levels, such as “Nothing found in the places we searched”, “A few public posts” and “Many public posts”, with the posts, dates and sources underneath. A clean result means nothing turned up where we looked. It is not proof.',
        ],
        shot: {
          image: 'confam-fair',
          alt: 'Confam "Built to be fair to both sides" section with four cards: We never say safe, We hide the middle, Vendors can answer, We do the maths.',
          caption: 'The fairness rules, shown to users as four plain cards.',
        },
        layout: 'below',
      },
      {
        type: 'decision',
        n: '02',
        title: 'It works inside WhatsApp',
        from: 'an app to download',
        to: 'a message you already send',
        body: [
          'The main channel is a WhatsApp bot that sends one combined reply per check, with a light web page for the detail. Paste an account number, phone number, @handle or the pitch itself; Confam works out which it is.',
        ],
        shot: {
          image: 'confam-steps',
          alt: 'Confam "From paste to answer in four steps" section with a phone showing the check screen.',
          caption: 'From paste to answer in four steps.',
        },
        layout: 'below',
      },
      {
        type: 'decision',
        n: '03',
        title: 'A calculator for promised returns',
        from: '“trust me” returns',
        to: 'the real maths',
        body: [
          'A small tool turns a promised return into a yearly number. 100% in 30 days is about 1,200% a year, or over 400,000% if it is reinvested. Nothing yet shows this stops someone who joins knowingly, so I treat it as an experiment.',
        ],
        shot: {
          image: 'confam-pause',
          alt: 'Confam "Pause. Check. Show someone." section: a photo of two women looking at a phone and a four-step list ending in "Keep your money".',
          caption: 'Pause, check, show one person, keep your money.',
        },
        layout: 'below',
      },
      {
        type: 'grid',
        cols: 3,
        label: 'Check screen',
        shots: [
          {
            image: 'confam-check',
            span: 2,
            alt: 'Confam check page on desktop: "Who are you about to pay?", a search field, sample searches and a list of where a check looks.',
            caption: 'The check page lists exactly where it looks: TikTok, X, Instagram and Facebook, Nairaland and official records.',
          },
          {
            image: 'confam-check-m',
            alt: 'Confam check page on mobile with the search field and a yellow "Check am" button.',
            caption: 'Mobile check.',
          },
        ],
      },
      {
        type: 'text',
        label: 'The brand layer',
        title: 'A “second look” brand, calm and neighbourly.',
        body: [
          'The lens reads as an o, a magnifier and a speech bubble, in marigold and ink. There are no shields, ticks or green, because each of them promises “safe”. The line is in Pidgin: “Check am before you send am.”',
        ],
      },
      {
        type: 'figure',
        shot: {
          image: 'confam-brand',
          alt: 'Confam brand board: the lens-o wordmark, the app mark on marigold, "Check am before you send am." on ink, and the palette.',
          caption: 'Wordmark, app mark, palette and line.',
        },
        bleed: true,
      },
      {
        type: 'note',
        label: 'Still open',
        body: [
          '“Confam” is a working name. Live Nigerian products already use the similar “Konfam”, so a real launch needs a new one.',
          'Next I want to put the result screen in front of people aged 18 to 30 and see whether “nothing found” makes them trust a seller too much.',
          'How Nigerian law treats summaries of public posts is a question for a lawyer before any launch.',
        ],
      },
    ],
  },
  {
    slug: 'explore-africa',
    n: '06',
    name: 'Explore Africa',
    line: 'Don’t just see Dubai. Feel it.',
    headline: 'Don’t just see Dubai. Feel it.',
    dek: 'A Dubai holiday campaign across social, print and out-of-home.',
    types: ['Campaign'],
    tracks: ['brand'],
    sector: 'Travel',
    status: 'Design challenge',
    year: '2026',
    cover: 'ea-cover',
    coverAlt:
      'Billboard over the Lekki-Ikoyi bridge at dusk reading "Don’t just see DUBAI. Feel it." with a couple looking at the Dubai skyline.',
    theme: {
      bg: '#EFE6D6',
      ink: '#16203A',
      muted: '#635C50',
      rule: '#D6C9B2',
      accent: '#B4472C',
      tone: 'light',
    },
    mode: 'gallery',
    meta: [
      ['Scope', 'Feed ads, story, carousel, poster, billboard, airport lightbox'],
      ['Brief', 'Design challenge, day 5'],
      ['Status', 'Design challenge'],
    ],
    description:
      'A travel campaign selling a Dubai escape from Lagos, built around one line, across social, print and out-of-home.',
    blocks: [
      {
        type: 'text',
        label: 'Brief',
        body: [
          'Explore Africa sells a Dubai escape from Lagos. The campaign had to carry one idea, a trip you feel rather than tick off, from a phone feed to a poster, a Lekki billboard and an airport lightbox.',
        ],
      },
      {
        type: 'grid',
        cols: 2,
        label: 'Key visual',
        shots: [
          {
            image: 'ea-feed-navy',
            alt: 'Feed ad in navy type: "Don’t just see DUBAI. Feel it." over a couple at sunrise above the clouds.',
            caption: 'Hero feed ad, navy.',
          },
          {
            image: 'ea-feed-white',
            alt: 'The same feed ad with DUBAI set in white.',
            caption: 'Hero feed ad, white.',
          },
        ],
      },
      { type: 'clock' },
      {
        type: 'grid',
        cols: 3,
        label: 'Story, print, lightbox',
        shots: [
          {
            image: 'ea-story',
            alt: 'Instagram story version of the key visual: "Don’t just see DUBAI. Feel it."',
            caption: 'Story, 1080 × 1920.',
          },
          {
            image: 'ea-poster',
            alt: 'A3 poster of the key visual, set as a travelogue page.',
            caption: 'A3 poster.',
          },
          {
            image: 'ea-lightbox-art',
            alt: 'Airport lightbox artwork: "Next gate: Dubai." with a desert safari photo and a boarding pass.',
            caption: 'Airport lightbox artwork: “Next gate: Dubai.”',
          },
        ],
      },
      {
        type: 'chapter',
        n: 'Out of home',
        title: 'From a phone to a bridge',
      },
      {
        type: 'figure',
        shot: {
          image: 'ea-billboard-art',
          alt: 'Flat billboard artwork: "Don’t just see DUBAI. Feel it." beside a couple looking at the Dubai skyline.',
          caption: 'Billboard artwork. The opening image shows it mocked up on the Lekki-Ikoyi link bridge.',
        },
        bleed: true,
      },
      {
        type: 'grid',
        cols: 2,
        shots: [
          {
            image: 'ea-airport',
            alt: 'Airport lightbox mockup at Murtala Muhammed International Airport, Lagos: "Next gate: Dubai."',
            caption: 'Lagos airport lightbox mockup.',
          },
          {
            image: 'ea-phones',
            alt: 'Two phones showing the feed ad and the 16:30 carousel slide.',
            caption: 'In the feed.',
          },
        ],
      },
      {
        type: 'text',
        label: 'System',
        body: [
          'A boarding pass, LOS to DXB, ties every piece together, with a torn-paper edge, Bricolage and Instrument type, and a navy, terracotta and sand palette.',
        ],
      },
      {
        type: 'figure',
        shot: {
          image: 'ea-brand',
          alt: 'Explore Africa brand board: "Made by hand, not by prompt.", type specimens, polaroid photos, the boarding pass and the palette.',
          caption: 'Brand board.',
        },
        bleed: true,
      },
      {
        type: 'note',
        label: 'Credits',
        body: ['Concept, art direction and layouts: me. The billboard, lightbox and phones are mockups.'],
      },
    ],
  },
  {
    slug: 'montra',
    n: '07',
    name: 'MONTRA',
    line: 'How much did my shop make today, in naira?',
    headline: 'A finance app that tells a trader, at closing time, whether the day made money.',
    dek: 'Web dashboard, companion mobile app and the brand behind them, for Nigerian small businesses.',
    types: ['Product', 'Brand'],
    tracks: ['product', 'brand'],
    sector: 'Fintech',
    status: 'Design challenge',
    year: '2026',
    cover: 'montra-cover',
    coverAlt:
      'MONTRA web dashboard showing "You made ₦38,500 profit today" beside the mobile app home screen with ₦4,820,350 cash on hand.',
    theme: {
      bg: '#F8F5EC',
      ink: '#172B4D',
      muted: '#56607A',
      rule: '#DED8C8',
      accent: '#087F5B',
      tone: 'light',
    },
    mode: 'case',
    meta: [
      ['Role', 'Product and brand design, solo'],
      ['Brief', 'Designers Tribe, November 2026, week 2'],
      ['Timeline', 'One week'],
      ['Platform', 'Web dashboard and mobile app'],
      ['Status', 'Design challenge'],
    ],
    live: [
      { label: 'Try the web prototype', title: 'MONTRA · Web prototype', path: 'montra-web/index.html' },
      { label: 'Try the mobile prototype', title: 'MONTRA · Mobile prototype', path: 'montra-mobile/index.html' },
    ],
    description:
      'MONTRA helps Nigerian small business owners record sales, track expenses and read their cash flow, so they know at closing time whether they made money.',
    blocks: [
      {
        type: 'text',
        label: 'The problem',
        body: [
          'Small business owners in Nigeria get paid three ways at once: cash, bank transfer and POS. Often they are working on a weak network, and the screen faces a counter where customers can see it. At the end of the day most of them still can’t answer one question quickly: did I make money today?',
          'The brief asked for a financial management platform for small businesses: a user flow, wireframes, a dashboard, a transactions screen, analytics, mobile screens and an interactive prototype.',
        ],
      },
      {
        type: 'list',
        label: 'Designed for',
        title: 'Three conditions shaped every screen.',
        items: [
          'Cash, transfer and POS sit side by side, so every sale records how it was paid.',
          'The network drops, so nothing can wait for it.',
          'Customers can see the screen, so balances must be easy to hide.',
        ],
      },
      { type: 'ledger' },
      {
        type: 'decision',
        n: '01',
        title: 'A sale starts with the amount',
        from: 'a sales form',
        to: 'an amount pad',
        body: [
          'Recording a sale starts with the amount, not a form. Type the figure, pick how it was paid, save: three taps. Quick amounts sit above the keypad for the prices a shop charges most.',
        ],
        shot: {
          image: 'montra-m-sale',
          alt: 'MONTRA sale screen: a large ₦0 amount field, quick amounts from ₦2,000 to ₦25,000, a number pad and a "Type an amount" button.',
          caption: 'Amount first, payment method second. The sale saves with its time the moment you tap.',
        },
        layout: 'side',
      },
      {
        type: 'decision',
        n: '02',
        title: 'Sales save without a signal',
        from: '“no network, no record”',
        to: 'save now, sync later',
        body: [
          'Sales save on the phone first and sync by themselves when the signal comes back. A sale that hasn’t synced says so in plain words, and the last sync time stays on screen, so the owner never wonders whether a sale was lost.',
        ],
        shot: {
          image: 'montra-m-tx',
          alt: 'MONTRA transactions list with naira amounts. One row is marked "Not synced yet" and another "Failed"; a pill reads "Synced 18:42".',
          caption: 'Unsynced and failed sales are marked in the list itself.',
        },
        layout: 'side',
      },
      {
        type: 'decision',
        n: '03',
        title: 'One bar per day',
        from: 'a revenue line',
        to: 'one bar per day',
        body: [
          'Cash flow is one bar per day, split into money in, money spent and money kept. A bad day stands out at a glance, and tapping a day shows its numbers.',
        ],
        shot: {
          image: 'montra-m-analytics',
          alt: 'MONTRA analytics screen: "Profit is ₦486,300, up 18%", money in and money out cards, and a cash-flow chart with one bar per day.',
          caption: 'Money in, money out and money kept, one bar per day.',
        },
        layout: 'side',
      },
      {
        type: 'decision',
        n: '04',
        title: 'One switch hides every balance',
        from: 'balances always on show',
        to: 'one switch to hide them',
        body: [
          'An eye switch hides every balance in the app at once, for counters where customers can see the screen.',
        ],
        shot: {
          image: 'montra-m-home',
          alt: 'MONTRA mobile home screen for "Mama Ada Provisions" showing cash on hand of ₦4,820,350 with an eye icon to hide balances.',
          caption: 'The eye icon beside “Cash on hand” hides every figure.',
        },
        layout: 'side',
      },
      {
        type: 'figure',
        shot: {
          image: 'montra-dash',
          alt: 'MONTRA web dashboard: the headline "You made ₦38,500 profit today", a cash-on-hand chart, today’s sales split by transfer, cash and POS, and "montra noticed" prompts.',
          caption: 'The web dashboard leads with today’s profit, then cash on hand, sales by payment method and “montra noticed” prompts.',
        },
        bleed: true,
      },
      {
        type: 'text',
        label: 'The brand layer',
        title: 'I designed the brand first, then carried it into every screen.',
        body: [
          'The “Count Up” mark draws an M as four rounded strokes for sales, expenses, transactions and cash flow, and ends in a tick. The palette follows the brief: emerald, deep navy, lime and warm cream.',
        ],
      },
      {
        type: 'grid',
        cols: 2,
        shots: [
          {
            image: 'montra-brand',
            alt: 'MONTRA brand board: the Count Up M logo, the wordmark on navy, app icons and the colour palette.',
            caption: 'Logo, wordmark, app icons and palette.',
          },
          {
            image: 'montra-mobile',
            alt: 'Four MONTRA mobile screens on a lime background: home, sale pad, analytics and transactions.',
            caption: 'The mobile app in the brand’s colours.',
          },
        ],
      },
    ],
  },
];

export const projectBySlug = (slug: string | undefined) => projects.find((p) => p.slug === slug);
