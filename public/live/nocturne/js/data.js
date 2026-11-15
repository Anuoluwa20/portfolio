/* NOCTURNE — product data: catalogue, materials, styles, layouts, times of day. All prices USD. */
(function () {
  const MAT = {
    // fabrics
    boucle_ivory:   { name: 'Ivory bouclé',     kind: 'fabric', color: '#E9E2D4', rough: 0.95, mult: 1.00 },
    linen_stone:    { name: 'Stone linen',      kind: 'fabric', color: '#B7AFA3', rough: 0.9,  mult: 0.95 },
    velvet_lav:     { name: 'Lavender velvet',  kind: 'fabric', color: '#A99ACB', rough: 0.7,  mult: 1.12 },
    leather_cognac: { name: 'Cognac leather',   kind: 'fabric', color: '#9A5A32', rough: 0.55, mult: 1.20 },
    wool_charcoal:  { name: 'Charcoal wool',    kind: 'fabric', color: '#3B3D43', rough: 0.95, mult: 1.00 },
    linen_sage:     { name: 'Sage linen',       kind: 'fabric', color: '#8E9C86', rough: 0.9,  mult: 0.95 },
    boucle_mustard: { name: 'Mustard bouclé',   kind: 'fabric', color: '#C3923E', rough: 0.95, mult: 1.05 },
    pale_grey:      { name: 'Pale grey knit',   kind: 'fabric', color: '#D9D8DE', rough: 0.85, mult: 1.00 },
    // woods
    oak:            { name: 'Natural oak',      kind: 'wood',   color: '#C7A57A', rough: 0.6,  mult: 1.00 },
    ash:            { name: 'Pale ash',         kind: 'wood',   color: '#DCCBAA', rough: 0.6,  mult: 0.95 },
    walnut:         { name: 'Walnut',           kind: 'wood',   color: '#6A4A33', rough: 0.55, mult: 1.15 },
    black_oak:      { name: 'Black-stained oak',kind: 'wood',   color: '#2B2A2C', rough: 0.6,  mult: 1.05 },
    // metals and stone
    brass:          { name: 'Brushed brass',    kind: 'metal',  color: '#B8995C', rough: 0.35, metal: 0.8, mult: 1.10 },
    graphite:       { name: 'Graphite steel',   kind: 'metal',  color: '#3D3F44', rough: 0.45, metal: 0.6, mult: 1.00 },
    white_lacquer:  { name: 'White lacquer',    kind: 'metal',  color: '#ECEBE8', rough: 0.3,  metal: 0.0, mult: 1.00 },
    travertine:     { name: 'Travertine',       kind: 'stone',  color: '#D9C9AE', rough: 0.8,  mult: 1.15 },
    ceramic_ivory:  { name: 'Ivory ceramic',    kind: 'stone',  color: '#E8E1D4', rough: 0.6,  mult: 1.00 },
    clay:           { name: 'Terracotta clay',  kind: 'stone',  color: '#B4704E', rough: 0.85, mult: 1.00 },
    stone_lacquer:  { name: 'Stone lacquer',    kind: 'metal',  color: '#CFC7BA', rough: 0.4,  mult: 1.00 },
  };

  const FABRICS = ['boucle_ivory', 'linen_stone', 'velvet_lav', 'leather_cognac', 'wool_charcoal', 'linen_sage', 'boucle_mustard'];
  const WOODS = ['oak', 'ash', 'walnut', 'black_oak'];

  const CATEGORIES = ['Sofas', 'Chairs', 'Beds', 'Storage', 'Desks', 'Office chairs', 'Tables', 'Shelves', 'Lighting', 'Plants', 'Rugs', 'Wall decor', 'Appliances', 'Accessories'];

  // dims in metres: w (x), d (z), h (y). primary/secondary = material slots.
  const ITEMS = [
    { id: 'sofa-boucle',   name: 'Curve three-seater', cat: 'Sofas', price: 1290, w: 2.3, d: 0.92, h: 0.78, build: 'sofaCurve', primary: 'boucle_ivory', secondary: 'oak', primaryOpts: FABRICS, secondaryOpts: WOODS, photo: 'F1-sofa-boucle', desc: 'Rounded three-seat sofa on a thin wooden plinth.' },
    { id: 'sofa-modular',  name: 'Low modular, two units', cat: 'Sofas', price: 1840, w: 2.0, d: 1.0, h: 0.75, build: 'sofaModular', primary: 'linen_stone', primaryOpts: FABRICS, photo: 'F2-sofa-modular', desc: 'Two armless units with a deep seat. Add or remove units by resizing.', scalable: true },
    { id: 'loveseat',      name: 'Linen loveseat', cat: 'Sofas', price: 760, w: 1.6, d: 0.85, h: 0.8, build: 'sofaBox', primary: 'linen_sage', secondary: 'oak', primaryOpts: FABRICS, secondaryOpts: WOODS, desc: 'Compact two-seater for small living rooms and studios.' },
    { id: 'lounge-chair',  name: 'Leather lounge chair', cat: 'Chairs', price: 890, w: 0.72, d: 0.78, h: 0.82, build: 'loungeChair', primary: 'leather_cognac', secondary: 'oak', primaryOpts: FABRICS, secondaryOpts: WOODS, photo: 'F3-lounge-chair', desc: 'Curved back on a slim wooden frame.' },
    { id: 'dining-chair',  name: 'Paper-cord dining chair', cat: 'Chairs', price: 240, w: 0.48, d: 0.5, h: 0.8, build: 'diningChair', primary: 'oak', primaryOpts: WOODS, photo: 'F4-dining-chair', desc: 'Spindle back with a woven paper-cord seat.' },
    { id: 'armchair',      name: 'Rounded armchair', cat: 'Chairs', price: 650, w: 0.85, d: 0.82, h: 0.74, build: 'armchair', primary: 'boucle_mustard', primaryOpts: FABRICS, desc: 'Soft tub armchair, upholstered all round.' },
    { id: 'bed-queen',     name: 'Upholstered queen bed', cat: 'Beds', price: 1150, w: 1.65, d: 2.1, h: 0.95, build: 'bedQueen', primary: 'linen_stone', secondary: 'boucle_ivory', primaryOpts: FABRICS, desc: 'Linen headboard, 160 × 200 cm mattress.' },
    { id: 'bed-platform',  name: 'Low platform bed', cat: 'Beds', price: 980, w: 1.75, d: 2.15, h: 0.45, build: 'bedPlatform', primary: 'oak', secondary: 'wool_charcoal', primaryOpts: WOODS, secondaryOpts: FABRICS, desc: 'Solid timber platform, 160 × 200 cm.' },
    { id: 'wardrobe',      name: 'Two-door wardrobe', cat: 'Storage', price: 1090, w: 1.2, d: 0.6, h: 2.1, build: 'wardrobe', primary: 'ash', primaryOpts: WOODS, desc: 'Pale veneer with recessed finger pulls.', scalable: true },
    { id: 'sideboard',     name: 'Low sideboard', cat: 'Storage', price: 840, w: 1.6, d: 0.45, h: 0.62, build: 'sideboard', primary: 'walnut', primaryOpts: WOODS, desc: 'Sliding doors on tapered legs.', scalable: true },
    { id: 'desk-oak',      name: 'Oak writing desk', cat: 'Desks', price: 520, w: 1.1, d: 0.55, h: 0.75, build: 'desk', primary: 'oak', primaryOpts: WOODS, desc: 'One shallow drawer, tapered legs.', scalable: true },
    { id: 'desk-standing', name: 'Standing desk', cat: 'Desks', price: 690, w: 1.4, d: 0.7, h: 0.75, build: 'deskStanding', primary: 'white_lacquer', secondary: 'graphite', primaryOpts: ['white_lacquer', 'oak', 'walnut'], desc: 'Height-adjustable, 72–122 cm.', scalable: true },
    { id: 'task-chair',    name: 'Ergonomic task chair', cat: 'Office chairs', price: 430, w: 0.62, d: 0.62, h: 1.05, build: 'taskChair', primary: 'wool_charcoal', primaryOpts: FABRICS, desc: 'Wool seat, mesh back, five-star base.' },
    { id: 'coffee-round',  name: 'Round coffee table', cat: 'Tables', price: 380, w: 0.9, d: 0.9, h: 0.4, build: 'coffeeRound', primary: 'oak', primaryOpts: [...WOODS, 'travertine'], desc: 'Ø 90 cm top on a pedestal base.' },
    { id: 'dining-table',  name: 'Walnut dining table', cat: 'Tables', price: 1450, w: 2.0, d: 0.95, h: 0.75, build: 'diningTable', primary: 'walnut', primaryOpts: WOODS, desc: 'Seats six. Solid top.', scalable: true },
    { id: 'side-table',    name: 'Travertine side table', cat: 'Tables', price: 290, w: 0.45, d: 0.45, h: 0.5, build: 'sideTable', primary: 'travertine', primaryOpts: ['travertine', 'oak', 'walnut'], desc: 'Honed stone pedestal.' },
    { id: 'bookshelf',     name: 'Open bookshelf', cat: 'Shelves', price: 560, w: 0.9, d: 0.35, h: 1.9, build: 'bookshelf', primary: 'oak', primaryOpts: WOODS, desc: 'Five shelves. Styled with books.', scalable: true },
    { id: 'wall-shelf',    name: 'Floating wall shelf', cat: 'Shelves', price: 85, w: 1.0, d: 0.22, h: 0.04, build: 'wallShelf', primary: 'stone_lacquer', primaryOpts: ['stone_lacquer', 'oak', 'walnut'], desc: 'Hangs at 140 cm.', wall: true, elev: 1.4, scalable: true },
    { id: 'lamp-arc',      name: 'Arched floor lamp', cat: 'Lighting', price: 340, w: 0.5, d: 1.4, h: 2.0, build: 'lampArc', primary: 'graphite', primaryOpts: ['graphite', 'brass'], desc: 'Linen drum shade. Warm 2700 K.', light: { y: 1.85, z: 1.05, power: 1.0 } },
    { id: 'lamp-table',    name: 'Ceramic table lamp', cat: 'Lighting', price: 160, w: 0.32, d: 0.32, h: 0.55, build: 'lampTable', primary: 'ceramic_ivory', primaryOpts: ['ceramic_ivory', 'clay', 'oak'], desc: 'Place it on a desk or side table.', light: { y: 0.45, z: 0, power: 0.6 }, onSurface: true },
    { id: 'pendant',       name: 'Paper pendant', cat: 'Lighting', price: 120, w: 0.55, d: 0.55, h: 0.5, build: 'pendant', primary: 'ceramic_ivory', primaryOpts: ['ceramic_ivory'], desc: 'Hangs from the ceiling. Soft spread.', light: { y: 0, z: 0, power: 0.9 }, ceiling: true },
    { id: 'plant-fig',     name: 'Fiddle-leaf fig', cat: 'Plants', price: 95, w: 0.6, d: 0.6, h: 1.7, build: 'plantTall', primary: 'clay', primaryOpts: ['clay', 'ceramic_ivory', 'graphite'], desc: 'Tall, in a matte clay pot.' },
    { id: 'plant-small',   name: 'Trailing pothos', cat: 'Plants', price: 35, w: 0.3, d: 0.3, h: 0.4, build: 'plantSmall', primary: 'ceramic_ivory', primaryOpts: ['ceramic_ivory', 'clay'], desc: 'Small, for shelves and desks.', onSurface: true },
    { id: 'rug-wool',      name: 'Wool rug', cat: 'Rugs', price: 420, w: 2.4, d: 1.7, h: 0.01, build: 'rug', primary: 'linen_stone', primaryOpts: ['linen_stone', 'boucle_ivory', 'wool_charcoal', 'linen_sage', 'velvet_lav'], desc: '240 × 170 cm. Resize to fit.', scalable: true, flat: true },
    { id: 'print',         name: 'Framed abstract print', cat: 'Wall decor', price: 180, w: 0.7, d: 0.03, h: 0.9, build: 'print', primary: 'oak', primaryOpts: WOODS, desc: 'Ivory, sand and one lavender stroke.', wall: true, elev: 1.15 },
    { id: 'mirror',        name: 'Round mirror', cat: 'Wall decor', price: 210, w: 0.7, d: 0.03, h: 0.7, build: 'mirror', primary: 'brass', primaryOpts: ['brass', 'graphite', 'oak'], desc: 'Ø 70 cm, slim frame.', wall: true, elev: 1.3 },
    { id: 'espresso',      name: 'Espresso machine', cat: 'Appliances', price: 340, w: 0.3, d: 0.35, h: 0.38, build: 'espresso', primary: 'white_lacquer', primaryOpts: ['white_lacquer', 'graphite'], desc: 'Compact, matte finish.', onSurface: true },
    { id: 'fridge',        name: 'Freestanding fridge', cat: 'Appliances', price: 1290, w: 0.6, d: 0.65, h: 1.85, build: 'fridge', primary: 'stone_lacquer', primaryOpts: ['stone_lacquer', 'white_lacquer', 'graphite'], desc: 'Smooth door, 330 litres.' },
    { id: 'vases',         name: 'Three ceramic vases', cat: 'Accessories', price: 75, w: 0.35, d: 0.18, h: 0.32, build: 'vases', primary: 'ceramic_ivory', primaryOpts: ['ceramic_ivory', 'clay'], desc: 'Hand-thrown set of three.', onSurface: true },
  ];

  const FLOORS = {
    oak_pale:   { name: 'Pale oak boards', tex: 'M5-oak', color: '#EDE3D6', rough: 0.7 },
    walnut:     { name: 'Walnut boards', tex: 'M6-walnut', color: '#FFFFFF', rough: 0.6 },
    travertine: { name: 'Travertine', tex: 'M7-travertine', color: '#FFFFFF', rough: 0.75 },
    concrete:   { name: 'Polished concrete', tex: 'M9-concrete', color: '#FFFFFF', rough: 0.55 },
    resin:      { name: 'White resin', tex: null, color: '#EEEDF2', rough: 0.2 },
    microcement:{ name: 'Pale microcement', tex: null, color: '#D8D5CF', rough: 0.7 },
  };

  const WALLS = [
    { id: 'ivory', name: 'Warm ivory', color: '#EEE7DC' },
    { id: 'plaster', name: 'Sand plaster', color: '#E2D6C4' },
    { id: 'white', name: 'Gallery white', color: '#F1F0EC' },
    { id: 'stone', name: 'Stone', color: '#CFC6B8' },
    { id: 'clay', name: 'Soft clay', color: '#D9B9A0' },
    { id: 'sage', name: 'Sage', color: '#B9C0AE' },
    { id: 'lavender', name: 'Dusk lavender', color: '#C9C0DA' },
    { id: 'brick', name: 'Old brick', color: '#8C5A45' },
  ];

  const STYLES = [
    { id: 'minimal', name: 'Modern minimalism', img: 'S1-minimalism', line: 'White plaster, one black line of light, nothing on the surfaces.', wall: 'white', floor: 'microcement', fabric: 'pale_grey', wood: 'ash', suggest: ['sofa-modular', 'coffee-round', 'desk-standing', 'task-chair', 'pendant'], palette: ['#F1F0EC', '#D8D5CF', '#2A2A2C'] },
    { id: 'scandi', name: 'Scandinavian', img: 'S2-scandinavian', line: 'Pale wood, oatmeal wool, an olive tree by the window.', wall: 'ivory', floor: 'oak_pale', fabric: 'linen_stone', wood: 'ash', suggest: ['sofa-boucle', 'dining-chair', 'desk-oak', 'plant-fig', 'rug-wool', 'lamp-table'], palette: ['#EEE7DC', '#DCCBAA', '#8E9C86'] },
    { id: 'luxury', name: 'Contemporary luxury', img: 'S3-contemporary-luxury', line: 'Travertine, walnut, cream velvet and a little brass.', wall: 'plaster', floor: 'travertine', fabric: 'boucle_ivory', wood: 'walnut', suggest: ['sofa-boucle', 'side-table', 'desk-oak', 'mirror', 'pendant'], palette: ['#E2D6C4', '#6A4A33', '#B8995C'] },
    { id: 'industrial', name: 'Industrial', img: 'S4-industrial', line: 'Brick, concrete, cognac leather and black steel.', wall: 'brick', floor: 'concrete', fabric: 'leather_cognac', wood: 'black_oak', suggest: ['sofa-box', 'bookshelf', 'desk-standing', 'lamp-arc', 'lounge-chair'], palette: ['#8C5A45', '#9C9A96', '#9A5A32'] },
    { id: 'japandi', name: 'Japandi', img: 'S5-japandi', line: 'Low oak, charcoal linen, a paper lantern and a branch.', wall: 'plaster', floor: 'oak_pale', fabric: 'wool_charcoal', wood: 'oak', suggest: ['bed-platform', 'coffee-round', 'pendant', 'vases', 'rug-wool'], palette: ['#E2D6C4', '#C7A57A', '#3B3D43'] },
    { id: 'midcentury', name: 'Mid-century modern', img: 'S6-mid-century', line: 'Teak and walnut, mustard bouclé, a brass sputnik.', wall: 'ivory', floor: 'walnut', fabric: 'boucle_mustard', wood: 'walnut', suggest: ['armchair', 'sideboard', 'coffee-round', 'desk-oak', 'rug-wool'], palette: ['#EEE7DC', '#6A4A33', '#C3923E'] },
    { id: 'organic', name: 'Organic modern', img: 'S7-organic-modern', line: 'Limewash, curves, jute and a tall palm.', wall: 'plaster', floor: 'oak_pale', fabric: 'boucle_ivory', wood: 'oak', suggest: ['sofa-boucle', 'side-table', 'plant-fig', 'vases', 'rug-wool'], palette: ['#E2D6C4', '#C7A57A', '#B4704E'] },
    { id: 'future', name: 'Futuristic', img: 'S8-futuristic', line: 'Seamless white, soft lavender light, chrome.', wall: 'white', floor: 'resin', fabric: 'pale_grey', wood: 'ash', suggest: ['sofa-modular', 'desk-standing', 'task-chair', 'side-table'], palette: ['#F1F0EC', '#C9C0DA', '#A99ACB'] },
  ];

  // Room rectangles in metres, placed on a plan (x, z = top-left corner).
  const LAYOUTS = [
    { id: 'studio', name: 'Studio', area: 32, img: 'P1-studio', line: 'One open room with a work corner.', rooms: [{ name: 'Studio', type: 'living', w: 8, d: 4, x: 0, z: 0 }] },
    { id: 'onebed', name: 'One bedroom', area: 55, img: 'P2-one-bed', line: 'Living room with a desk nook, separate bedroom.', rooms: [{ name: 'Living room', type: 'living', w: 6.5, d: 4.6, x: 0, z: 0 }, { name: 'Bedroom', type: 'bedroom', w: 4.2, d: 3.6, x: 6.5, z: 0 }] },
    { id: 'twobed', name: 'Two bedroom', area: 78, img: 'P3-two-bed', line: 'Living, main bedroom and a home office.', rooms: [{ name: 'Living room', type: 'living', w: 6.5, d: 5, x: 0, z: 0 }, { name: 'Bedroom', type: 'bedroom', w: 4.2, d: 3.8, x: 6.5, z: 0 }, { name: 'Home office', type: 'office', w: 3.6, d: 3.2, x: 6.5, z: 3.8 }] },
    { id: 'office', name: 'Workspace only', area: 24, img: 'C2-monitor', line: 'A standalone studio office.', rooms: [{ name: 'Studio office', type: 'office', w: 6, d: 4, x: 0, z: 0 }] },
  ];

  const SPACE_TYPES = [
    { id: 'apartment', name: 'Apartment', img: 'D3-quiet-bedroom', line: 'Living room, bedroom, the places you rest.' },
    { id: 'workspace', name: 'Workspace', img: 'C2-monitor', line: 'A home office or a small studio.' },
    { id: 'both', name: 'Apartment + workspace', img: 'L1-dusk', line: 'Live and work in one connected plan.' },
  ];

  // Hero frames for the landing dial: the same room at five times.
  const HERO_FRAMES = [
    { t: 7, img: 'L2-morning' }, { t: 12, img: 'L3-noon' }, { t: 17.5, img: 'L4-golden-hour' }, { t: 19.67, img: 'L1-dusk' }, { t: 23, img: 'L5-night' },
  ];

  const VIEWS = [
    { id: 'city-dusk', name: 'Rooftops at dusk', img: 'W6-dusk-skyline' },
    { id: 'city-overcast', name: 'City rooftops', img: 'W1-city-overcast' },
    { id: 'city-golden', name: 'City skyline', img: 'W4-city-golden' },
    { id: 'none', name: 'Plain sky', img: null },
  ];

  function timeLabel(t) {
    if (t < 5 || t >= 21.5) return 'night';
    if (t < 10.5) return 'morning';
    if (t < 15) return 'noon';
    if (t < 18.6) return 'golden hour';
    return 'dusk';
  }
  function fmtTime(t) {
    const h = Math.floor(t) % 24, m = Math.round((t - Math.floor(t)) * 60);
    return String(m === 60 ? (h + 1) % 24 : h).padStart(2, '0') + ':' + String(m === 60 ? 0 : m).padStart(2, '0');
  }

  const itemById = Object.fromEntries(ITEMS.map(i => [i.id, i]));
  // fix suggestion ids that refer to the loveseat
  STYLES.forEach(s => { s.suggest = s.suggest.map(x => x === 'sofa-box' ? 'loveseat' : x); });

  function itemPrice(item, primary, scale) {
    const m = MAT[primary] ? MAT[primary].mult : 1;
    const s = item.scalable ? Math.max(0.5, scale || 1) : 1;
    return Math.round(item.price * m * (item.scalable ? (0.55 + 0.45 * s) : 1) / 5) * 5;
  }

  window.ND = { MAT, ITEMS, itemById, CATEGORIES, FLOORS, WALLS, STYLES, LAYOUTS, SPACE_TYPES, HERO_FRAMES, VIEWS, timeLabel, fmtTime, itemPrice, FABRICS, WOODS };
})();
