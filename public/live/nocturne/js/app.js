/* NOCTURNE — shell, router and the screens outside the editor. */
(function () {
  const S = NStore.state;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = document.getElementById('app');

  // ---------- icons (1.5px line, drawn for this app) ----------
  const P = {
    back: 'M15 18l-6-6 6-6', plus: 'M12 5v14M5 12h14', x: 'M6 6l12 12M18 6L6 18', search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    undo: 'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3', redo: 'M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h3',
    rotL: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5', rotR: 'M21 12a9 9 0 1 1-3-6.7M21 4v5h-5', copy: 'M9 9h11v11H9zM5 15H4V4h11v1', trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    lib: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', panel: 'M4 4h16v16H4zM15 4v16', walk: 'M13 4a1.5 1.5 0 1 0 0 .1M10 21l2-6 3 3v3M9 12l2-4 4 1 2 3M11 8l-2 6',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', share: 'M12 3v12M7 8l5-5 5 5M5 14v6h14v-6',
    check: 'M5 12l5 5 9-10', up: 'M12 19V5M6 11l6-6 6 6', down: 'M12 5v14M6 13l6 6 6-6', left: 'M19 12H5M11 6l-6 6 6 6', right: 'M5 12h14M13 6l6 6-6 6',
    tl: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5', tr: 'M21 12a9 9 0 1 1-3-6.7M21 4v5h-5', more: 'M5 12h.01M12 12h.01M19 12h.01', sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    download: 'M12 4v11M7 10l5 5 5-5M5 20h14', settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .2-1.3-1.3.2-2-3-1-1 2h-1.8l-1-2-3 1 .2 2L6 8.2 4 8l-1 3 2 1v1.8l-2 1 1 3 2-.2 1.3 1.3-.2 2 3 1 1-2h1.8l1 2 3-1-.2-2 1.3-1.3 2 .2 1-3-2-1z',
    expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  };
  const ic = (n, s = 18) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n]}"/></svg>`;

  const CRES = 'M73.33 5.78A50 50 0 1 0 73.33 94.22A45 45 0 1 1 73.33 5.78Z';
  const logo = (cls = '', href = '#home') => `<a class="logo ${cls}" href="${href}" aria-label="Nocturne, home"><span aria-hidden="true">N</span><svg class="g-o" viewBox="0 0 100 100" aria-hidden="true"><circle class="moon" cx="50" cy="50" r="50"/></svg><svg class="g-c" viewBox="0 0 80 100" aria-hidden="true"><path d="${CRES}" fill="currentColor"/></svg>${'TURNE'.split('').map(ch => `<span aria-hidden="true">${ch}</span>`).join('')}</a>`;

  // ---------- brand pieces: moon phases double as the five moments of the day ----------
  ND.MOODS = [
    { id: 'morning', name: 'Morning', time: 7.5, warmth: 3000, lamps: 'off' },
    { id: 'noon', name: 'Noon', time: 12, warmth: 4000, lamps: 'off' },
    { id: 'golden', name: 'Golden hour', time: 17.5, warmth: 2700, lamps: 'auto' },
    { id: 'dusk', name: 'Dusk', time: 19.67, warmth: 2700, lamps: 'on' },
    { id: 'night', name: 'Night', time: 22.5, warmth: 2200, lamps: 'on' },
  ];
  function phaseSVG(k) { // 0 new … 4 full
    const inner = k === 0 ? '' : k === 4 ? '<circle class="full" cx="50" cy="50" r="50"/>' : `<path d="M50 0A50 50 0 0 1 50 100A${k === 2 ? 0 : 30} 50 0 0 ${k < 3 ? 0 : 1} 50 0Z"/>`;
    return `<svg viewBox="0 0 100 100" aria-hidden="true" style="--k:${k}"><circle cx="50" cy="50" r="46" fill="none" stroke-width="6"/>${inner}</svg>`;
  }
  const phasesRow = (labels) => `<div class="phases-row" role="group" aria-label="Moments of the day">${ND.MOODS.map((m, k) => `<button type="button" class="phase" data-mood="${m.id}" aria-pressed="false" aria-label="${m.name}" title="${m.name}">${phaseSVG(k)}${labels ? `<span>${m.name}</span>` : ''}</button>`).join('')}</div>`;
  const track = (id, label) => `<div class="ruler" id="${id}" role="slider" tabindex="0" aria-label="${label}" aria-valuemin="0" aria-valuemax="24"><div class="knob"></div></div><div class="stops" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>`;
  const loaderPhases = () => `<div class="loader-phases" aria-hidden="true">${[0, 1, 2, 3, 4].map(phaseSVG).join('')}</div>`;
  function markPhase(root, t) { const near = ND.MOODS.reduce((x, m) => Math.abs(m.time - t) < Math.abs(x.time - t) ? m : x); $$('.phase', root).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mood === near.id && Math.abs(near.time - t) < 1.6))); }
  const reduced = () => document.documentElement.classList.contains('reduce-motion');
  function reveal(root) { const els = $$('[data-rv]', root); if (reduced() || !('IntersectionObserver' in window)) { els.forEach(x => x.classList.add('in')); return () => {}; }
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); if (x.target.dataset.count) countUp(x.target, +x.target.dataset.count); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }); els.forEach(x => io.observe(x)); return () => io.disconnect(); }
  function countUp(el, to) { if (reduced()) { el.textContent = money(to); return; } const t0 = performance.now(); (function f(n) { const k = Math.min(1, (n - t0) / 1000), ez = 1 - Math.pow(1 - k, 3); el.textContent = money(Math.round(to * ez / 5) * 5); if (k < 1 && document.body.contains(el)) requestAnimationFrame(f); else el.textContent = money(to); })(t0); }

  // ---------- formatting ----------
  function money(n, opts = {}) { const cur = (S.profile && S.profile.currency) || 'USD'; try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: 0, ...opts }).format(n); } catch (e) { return '$' + Math.round(n); } }
  function len(m) { return (S.profile && S.profile.units === 'in') ? Math.round(m * 39.37) + '″' : Math.round(m * 100) + ' cm'; }
  function area(m2) { return (S.profile && S.profile.units === 'in') ? Math.round(m2 * 10.764) + ' sq ft' : (Math.round(m2 * 10) / 10) + ' m²'; }
  const ago = (t) => { const s = (Date.now() - t) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + ' h ago'; const d = Math.floor(s / 86400); return d === 1 ? 'yesterday' : d + ' days ago'; };

  // ---------- budget maths (shared) ----------
  function itemCost(rec) { const it = ND.itemById[rec.item]; return it ? ND.itemPrice(it, rec.primary || it.primary, rec.scale || 1) : 0; }
  function costs(p) {
    const rooms = p.rooms.map(r => ({ room: r, spent: 0, items: [] }));
    p.items.forEach(rec => { const R = rooms.find(x => x.room.id === rec.room) || rooms[0]; const c = itemCost(rec); R.spent += c; R.items.push({ rec, cost: c }); });
    const spent = rooms.reduce((a, r) => a + r.spent, 0), budget = p.rooms.reduce((a, r) => a + (r.budget || 0), 0);
    return { rooms, spent, budget, left: budget - spent, over: spent > budget, pct: budget ? spent / budget : 0 };
  }

  // ---------- toasts & dialogs ----------
  const toasts = document.createElement('div'); toasts.className = 'toasts'; toasts.setAttribute('aria-live', 'polite'); toasts.setAttribute('role', 'status'); document.body.appendChild(toasts);
  function toast(msg, o = {}) {
    const t = document.createElement('div'); t.className = 'toast' + (o.err ? ' err' : ''); t.innerHTML = `<span>${esc(msg)}</span>` + (o.action ? `<button type="button">${esc(o.label || 'Undo')}</button>` : '');
    toasts.appendChild(t); const kill = () => t.remove();
    if (o.action) t.querySelector('button').onclick = () => { o.action(); kill(); };
    setTimeout(kill, o.ms || (o.action ? 6000 : 3200));
  }
  function confirmBox(title, body, ok = 'Confirm', danger = false) {
    return new Promise(res => {
      const d = document.createElement('dialog'); d.innerHTML = `<h2 class="h3">${esc(title)}</h2><p class="muted" style="margin-top:12px">${esc(body)}</p><div class="row"><button class="btn ghost" value="no">Cancel</button><button class="btn ${danger ? 'danger' : ''}" value="ok">${esc(ok)}</button></div>`;
      document.body.appendChild(d); d.showModal();
      d.querySelectorAll('button').forEach(b => b.onclick = () => d.close(b.value)); d.addEventListener('close', () => { res(d.returnValue === 'ok'); d.remove(); });
    });
  }
  function promptBox(title, value, ok = 'Save') {
    return new Promise(res => {
      const d = document.createElement('dialog'); d.innerHTML = `<form method="dialog"><h2 class="h3">${esc(title)}</h2><div class="field" style="margin-top:20px"><label for="pb">Name</label><input id="pb" class="input" maxlength="60" required value="${esc(value)}"></div><div class="row"><button class="btn ghost" value="no" formnovalidate>Cancel</button><button class="btn" value="ok">${esc(ok)}</button></div></form>`;
      document.body.appendChild(d); d.showModal(); const i = d.querySelector('input'); i.select();
      d.addEventListener('close', () => { res(d.returnValue === 'ok' ? i.value.trim() : null); d.remove(); });
    });
  }

  // ---------- current project ----------
  let currentId = null; try { currentId = sessionStorage.getItem('nocturne.cur'); } catch (e) {}
  function setCurrent(id) { currentId = id; try { sessionStorage.setItem('nocturne.cur', id); } catch (e) {} }
  function current() { return (currentId && NStore.getProject(currentId)) || S.projects[0] || null; }
  let intent = null; // what a visitor asked for on the landing page, honoured after sign-up
  function afterAuth() { if (intent === 'sample') { intent = null; NStore.saveProfile({ onboarded: true }); const sp = S.projects.find(p => p.sample) || NStore.sampleProject(); if (!NStore.getProject(sp.id)) NStore.saveProject(sp, { now: true }); setCurrent(sp.id); go('editor'); return true; } return false; }
  let draft = { name: '', type: 'both', layout: null, style: null };

  // ---------- the shared 3D stage ----------
  let stage = null;
  function getStage() { if (!stage) { try { stage = new NScene.Stage(); } catch (e) { stage = { ok: false }; } } return stage; }

  // ---------- router ----------
  const routes = {}; let teardown = null;
  const needAuth = ['dashboard', 'onboarding', 'new', 'layout', 'style', 'editor', 'budget', 'preview', 'saved', 'walk', 'share', 'settings'];
  function go(r) { if (location.hash.slice(1) === r) render(); else location.hash = r; }
  function render() {
    let r = location.hash.slice(1) || 'home';
    if (!routes[r]) r = 'home';
    if (needAuth.includes(r) && !S.profile) { r = 'signup'; }
    if (r === 'dashboard' && S.profile && !S.profile.onboarded) r = 'onboarding';
    if (teardown) { try { teardown(); } catch (e) { console.error(e); } teardown = null; }
    window.scrollTo(0, 0);
    app.innerHTML = '';
    const v = document.createElement('div'); v.className = 'view fresh'; app.appendChild(v); setTimeout(() => v.classList.remove('fresh'), 1400);
    teardown = routes[r](v) || null;
    const h = v.querySelector('h1'); document.title = (h ? h.textContent.trim() + ' · ' : '') + 'NOCTURNE';
    const focusTarget = v.querySelector('[data-autofocus]') || h; if (focusTarget) { focusTarget.setAttribute('tabindex', '-1'); focusTarget.focus({ preventScroll: true }); }
  }
  window.addEventListener('hashchange', render);

  function topbar(active) {
    const p = S.profile || {}; const ini = (p.name || 'You').trim()[0].toUpperCase();
    const L = (id, t) => `<a href="#${id}" ${active === id ? 'aria-current="page"' : ''}>${t}</a>`;
    return `<a class="skip" href="#main">Skip to content</a><header class="topbar">${logo('', '#dashboard')}<nav aria-label="Main">${L('dashboard', 'Studio')}${L('saved', 'Saved designs')}${L('style', 'Styles')}</nav><span class="sp"></span><a class="btn sm d-only" href="#new">${ic('plus', 16)} New space</a><a class="icon-btn m-only" href="#new" aria-label="New space">${ic('plus')}</a><a class="avatar" href="#settings" aria-label="Profile and settings">${esc(ini)}</a></header>`;
  }

  // ============ 01 LANDING ============
  routes.home = (v) => {
    const F = ND.HERO_FRAMES;
    const seq = [{ img: 'K1-sketch-empty', sk: true, cap: 'Draw the walls' }, { img: 'K2-sketch-furnished', sk: true, cap: 'Place the furniture' }, { img: 'K3-sketch-rendered', sk: true, cap: 'Choose the materials' }];
    v.innerHTML = `
<a class="skip" href="#main">Skip to content</a>
<header class="land-nav">${logo()}<span class="clock-chip d-only" id="clock"></span><span style="flex:1"></span><a class="nl" href="#how">How it works</a><a class="nl" href="#styles">Styles</a><a class="nl" href="#light">Light</a><a class="nl" href="#login">Sign in</a><a class="btn sm" href="#signup">Start designing</a></header>
<main id="main">
<section class="hero">
  <div class="hero-copy">
    <p class="label">Apartment & workspace planner, in 3D</p>
    <h1 class="display" aria-label="Design your world before you live in it."><span class="ln" style="--i:0" aria-hidden="true"><span>Design your world</span></span><span class="ln" style="--i:1" aria-hidden="true"><span><em>before</em> you live in it.</span></span></h1>
    <p class="lede">Plan an apartment or a studio in 3D. Real furniture, real prices, and the light at any hour.</p>
    <div class="hero-cta"><a class="btn" href="#signup">Create a free account</a><button class="link" id="trySample">Try the sample room</button></div>
    
  </div>
  <div class="hero-stage">
    <div class="hero-frames" id="frames">${seq.map((s, i) => `<img class="sk${i === 0 ? ' on' : ''}" ${i === 0 ? 'src' : 'data-src'}="img/${s.img}.webp" alt="" data-k="${i}">`).join('')}${F.map((f, i) => `<img data-src="img/${f.img}.webp" alt="" data-t="${f.t}">`).join('')}<div class="hero-wash" id="wash"></div><div class="hero-live" id="live" aria-label="Live 3D sample room. Drag to turn it."></div><div class="tags" id="tags" aria-hidden="true"></div></div>
    <p class="hero-caption" id="heroCap"><b>01</b> · Draw the walls</p>
    <div class="dial dusk-dial-l"><div class="dial-head"><span class="label">Time of day</span><span class="dial-time" id="heroTime"></span></div>${phasesRow(true)}${track('heroRuler', 'Time of day in the sample room')}</div>
  </div>
</section>

<section class="land-sec" id="how">
  <div class="land-sec-head" data-rv><span class="label">How it works</span><h2 class="h1">From a line drawing to a lit room.</h2><p class="lede">Every space opens furnished, so you start by changing things.</p></div>
  <div class="story">
    <div class="story-pin"><div class="story-frame">${[['K1-sketch-empty', 'Line drawing of an empty room'], ['K2-sketch-furnished', 'The room drawn with a sofa, table and desk'], ['K3-sketch-rendered', 'The room shaded, with a wood floor'], ['L1-dusk', 'The finished room at dusk with a lamp on']].map(([f, alt], i) => `<img src="img/${f}.webp" alt="${alt}" class="${i === 0 ? 'on' : ''}${i < 3 ? ' sk' : ''}">`).join('')}</div><div class="story-rail" aria-hidden="true"><i id="storyRail"></i></div><div class="story-count"><b id="storyN">01</b><span>/ 04</span></div></div>
    <ol class="story-steps">${[['Pick a layout.', 'Studio, one or two bedrooms, or a workspace on its own.'], ['Place the furniture.', 'Drag, rotate and resize. Everything snaps to 5 cm.'], ['Choose the materials.', 'Fabric, wood and walls change as you pick, and so does the price.'], ['Set the light.', 'Morning, noon or dusk. Lamps come on when it gets dark.']].map(([h, p], i) => `<li data-step="${i}" class="${i === 0 ? 'on' : ''}"><span class="st-no">${String(i + 1).padStart(2, '0')}</span><h3 class="h2">${h}</h3><p class="lede">${p}</p></li>`).join('')}</ol>
  </div>
</section>

<section class="land-sec" id="styles">
  <div class="land-sec-head" data-rv><span class="label">Styles</span><h2 class="h1">Eight ways to furnish it.</h2><p class="lede">A style sets the walls, floor, fabric and wood in one step.</p></div>
  <div class="style-cards">${ND.STYLES.map((s, i) => { const W = ND.WALLS.find(w => w.id === s.wall) || {}, F = ND.FLOORS[s.floor], FA = ND.MAT[s.fabric], WO = ND.MAT[s.wood];
    return `<a class="mood" href="#signup" data-rv style="--i:${i % 4}" aria-label="${esc(s.name)}. Walls ${esc(W.name)}, floor ${esc(F.name)}, fabric ${esc(FA.name)}, wood ${esc(WO.name)}.">
    <div class="mood-img"><img src="img/${s.img}.webp" alt="" loading="lazy">
      <div class="mood-chips" aria-hidden="true"><i class="chip-wall" style="background:${W.color}"></i><i class="chip-floor" style="${F.tex ? `background-image:url(img/${F.tex}.webp)` : `background:${F.color}`}"></i><i class="chip-fab" style="background:${FA.color}"></i><i class="chip-wood" style="background:${WO.color}"></i></div></div>
    <div class="mood-body"><div class="mood-title"><span class="mood-no">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s.name)}</h3></div>
      <dl class="mood-spec"><div><dt>Walls</dt><dd>${esc(W.name)}</dd></div><div><dt>Floor</dt><dd>${esc(F.name)}</dd></div><div><dt>Fabric</dt><dd>${esc(FA.name)}</dd></div><div><dt>Wood</dt><dd>${esc(WO.name)}</dd></div></dl>
      <span class="mood-add"><i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></i>Use this style</span></div></a>`; }).join('')}</div>
</section>

<section class="land-sec" id="light">
  <div class="land-sec-head" data-rv><span class="label">Light</span><h2 class="h1">The same room, five times a day.</h2><p class="lede">Move the sun. Lamps come on at dusk, and you set how warm they are.</p></div>
  <div class="light-stage" data-rv>
    <div class="ls-frame">${F.map((f, i) => `<img src="img/${f.img}.webp" alt="The same living room at ${ND.fmtTime(f.t)}, ${ND.timeLabel(f.t)}" loading="lazy" data-t="${f.t}" class="${i === 3 ? 'on' : ''}">`).join('')}<p class="ls-cap"><b class="num" id="lsTime">19:40</b> <em id="lsLabel">dusk</em></p></div>
    <div class="ls-modes light-strip" role="radiogroup" aria-label="Time of day">${F.map((f, i) => `<button type="button" role="radio" data-t="${f.t}" aria-pressed="${i === 3}" aria-checked="${i === 3}">${phaseSVG([1, 4, 2, 3, 0][i])}<span><b class="num">${ND.fmtTime(f.t)}</b><em>${ND.timeLabel(f.t)}</em></span></button>`).join('')}</div>
  </div>
</section>

<section class="land-sec" id="budget">
  <div class="budget-demo">
    <div data-rv><span class="label">Budget</span><h2 class="h1" style="margin:16px 0 20px">Know what it costs.</h2><p class="lede">Set a figure for each room. Every piece is priced, and a cheaper finish is one tap away.</p></div>
    <article class="spend" data-rv style="--i:1" aria-label="Example budget for a living room">
      <header class="sp-head"><div><p class="label">Living room · example</p><div class="budget-big sp-total" id="spTotal" data-rv data-count="4860">${money(0)}</div><p class="sp-sub">of ${money(6000)} budget · <b id="spLeft">${money(1140)} left</b></p></div><span class="sp-state" id="spState">81% used</span></header>
      <div class="sp-bar" role="img" id="spBar" aria-label="Spend by category"><span class="seg s1" style="--w:31.5%"></span><span class="seg s2" style="--w:21.7%"></span><span class="seg s3" style="--w:22.2%"></span><span class="seg s4" style="--w:5.7%"></span><b class="sp-limit" style="left:80%"><em>80%</em></b></div>
      <ul class="sp-legend">
        <li><i class="s1"></i><span>Seating<small>Curved sofa</small></span><span class="num" id="spSeat">${money(1890)}</span><span class="num sp-pct" id="spSeatP">39%</span></li>
        <li><i class="s2"></i><span>Tables<small>Coffee table, desk</small></span><span class="num">${money(1300)}</span><span class="num sp-pct">27%</span></li>
        <li><i class="s3"></i><span>Rugs<small>Wool, 240 × 170</small></span><span class="num">${money(1330)}</span><span class="num sp-pct">27%</span></li>
        <li><i class="s4"></i><span>Lighting<small>Arched floor lamp</small></span><span class="num">${money(340)}</span><span class="num sp-pct">7%</span></li>
      </ul>
      <div class="sp-variants" role="radiogroup" aria-label="Sofa finish"><p class="label">Curved sofa · finish</p>
        ${[['Ivory bouclé', '#E9E2D4', 1890], ['Stone linen', '#B7AFA3', 1795], ['Cognac leather', '#9A5A32', 2265]].map(([n, c, pr], k) => `<button type="button" class="sp-var" role="radio" aria-checked="${k === 0}" data-price="${pr}"><span class="n">${String(k + 1).padStart(2, '0')}</span><i style="background:${c}"></i><span>${n}</span><span class="num">${money(pr)}</span><span class="num d">${k === 0 ? 'Current' : (pr < 1890 ? '−' : '+') + money(Math.abs(pr - 1890))}</span></button>`).join('')}
      </div>
    </article>
  </div>
</section>

<section class="night-band"><div class="night-grid walk-index">
  <div class="wi-frame" data-rv>${[['Living room', 'L1-dusk'], ['Bedroom', 'D3-quiet-bedroom'], ['Home office', 'C2-monitor']].map(([n, f], i) => `<img src="img/${f}.webp" alt="${n}" loading="lazy" class="${i === 0 ? 'on' : ''}" data-r="${i}">`).join('')}</div>
  <div class="wi-text" data-rv style="--i:1"><span class="label">Walkthrough</span><h2 class="h1">Walk through it before you move.</h2><p class="lede" style="color:#C9C9C9">Step inside at eye height, one room at a time.</p>
    <ol class="wi-rooms">${[['Living room', 'Sofa, desk corner, the window to the city.'], ['Bedroom', 'Low bed, paper lantern, blackout linen.'], ['Home office', 'Standing desk, task chair, morning light.']].map(([n, d], i) => `<li><a href="#signup" data-r="${i}" class="${i === 0 ? 'on' : ''}"><span class="wi-no">${['I', 'II', 'III'][i]}</span><span><b>${n}</b><small>${d}</small></span><span class="wi-enter">Enter</span></a></li>`).join('')}</ol>
  </div></div></section>
</main>
<footer class="foot2">
  <div class="f2-top"><p class="f2-cta"><span class="h2">Start with one room.</span><a class="btn" href="#signup">Create a free account</a></p>
    <nav class="f2-links" aria-label="Footer"><div><p class="label">Product</p><a href="#how">How it works</a><a href="#styles">Styles</a><a href="#light">Light</a><a href="#budget">Budget</a></div><div><p class="label">Account</p><a href="#signup">Create account</a><a href="#login">Sign in</a></div></nav></div>
  <div class="f2-mark" aria-hidden="true">${logo('f2-logo', '#home')}</div>
  <div class="f2-base"><span>Prices are estimates, not live retail prices.</span><span class="num" id="fClock"></span></div>
</footer>`;

    // anchor links without changing the route
    $$('a[href="#how"],a[href="#styles"],a[href="#light"],a[href="#budget"]', v).forEach(a => a.onclick = (e) => { e.preventDefault(); $(a.getAttribute('href'), v).scrollIntoView({ behavior: document.documentElement.classList.contains('reduce-motion') ? 'auto' : 'smooth' }); });
    $('#trySample', v).onclick = () => { intent = 'sample'; go('signup'); };

    // hero: the room opens as a line drawing, the camera moves in, then it lights up at dusk
    const imgs = $$('#frames img', v), cap = $('#heroCap', v), ruler = $('#heroRuler', v), tEl = $('#heroTime', v), wash = $('#wash', v);
    const T0 = 0, T1 = 24; let t = 19.67, timers = []; cap.hidden = true;
    const reduce = reduced() || matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = $('#clock', v); const tick = () => { const d = new Date(), lt = d.getHours() + d.getMinutes() / 60; clock.innerHTML = `<b class="num">${ND.fmtTime(lt)}</b> ${ND.timeLabel(lt)}`; const fc = $('#fClock', v); if (fc) fc.textContent = ND.fmtTime(lt) + ' ' + ND.timeLabel(lt) + ' where you are'; }; tick(); const clockT = setInterval(tick, 30000);
    const st = getStage(); let live = null, tagEls = [];
    if (st.ok) {
      live = NStore.newProject({ name: 'Hero', type: 'apartment', layout: 'studio', style: 'scandi' }); live.atmos.time = t; live.atmos.view = 'city-dusk';
      const pins = ['lamp-arc', 'sofa-boucle', 'desk-oak'].map(id => live.items.find(i => i.item === id)).filter(Boolean);
      $('#tags', v).innerHTML = pins.map((r, i) => { const it = ND.itemById[r.item]; return `<span class="tag-pin" style="--i:${i}"><i></i>${esc(it.name)} · ${money(itemCostLocal(r))}</span>`; }).join(''); tagEls = $$('#tags .tag-pin', v);
      st.on('frame', () => { if (!live || !$('#live', v)) return; const H = st.renderer.domElement.getBoundingClientRect(); pins.forEach((r, i) => { const it = ND.itemById[r.item]; const s = st.screenOf(new THREE.Vector3(r.x, (it.light ? it.light.y : it.h) + 0.05, r.z)); tagEls[i].style.transform = `translate(${s.x}px, ${s.y}px)`; tagEls[i].style.visibility = s.behind || s.x < 8 || s.x > H.width - 180 || s.y < 70 ? 'hidden' : 'visible'; }); });
    }
    function drift() { if (reduce) return; st.controls.autoRotate = true; st.controls.autoRotateSpeed = 0.3; st.renderer.domElement.addEventListener('pointerdown', () => { st.controls.autoRotate = false; }, { once: true }); }
    function goLive() {
      st.mount($('#live', v)); st.setMode('view'); st.controls.enableZoom = false; st.controls.enablePan = false; st.setProject(live);
      const r = live.rooms[0], tgt = new THREE.Vector3(r.w * 0.46, 0.2, r.d * 0.42), near = new THREE.Vector3(r.w * 0.92 + 2, 6.8, r.d + 7.6), far = new THREE.Vector3(r.w * 0.92 + 6.5, 11.5, r.d + 13);
      $('#live', v).classList.add('on'); imgs.forEach(i => i.classList.remove('on'));
      if (reduce) { st.setLook('render'); st.flyTo(near, tgt, false); $('#tags', v).classList.add('on'); return; }
      st.setLook('sketch'); st.flyTo(far, tgt, false); st.camAnim = { p0: far.clone(), t0: tgt.clone(), p1: near, t1: tgt, s: performance.now(), d: 3600 };
      timers.push(setTimeout(() => { wash.classList.add('on'); timers.push(setTimeout(() => { st.setLook('render'); st.applyAtmos(); wash.classList.remove('on'); $('#tags', v).classList.add('on'); }, 400)); }, 1700));
      timers.push(setTimeout(drift, 3700));
    }
    function show(el) { imgs.forEach(i => i.classList.toggle('on', i === el)); }
    function setT(nt) {
      t = Math.max(T0, Math.min(T1 - 0.01, nt)); ruler.style.setProperty('--p', ((t - T0) / (T1 - T0) * 100) + '%'); tEl.innerHTML = ND.fmtTime(t) + ' <em>' + ND.timeLabel(t) + '</em>'; markPhase(v, t); ruler.setAttribute('aria-valuenow', t.toFixed(2)); ruler.setAttribute('aria-valuetext', ND.fmtTime(t) + ', ' + ND.timeLabel(t));
      const near = F.reduce((a, f) => Math.abs(f.t - t) < Math.abs(a.t - t) ? f : a, F[0]);
      if (live) { live.atmos.time = t; if (st.project === live) st.applyAtmos(); } else show(imgs.find(i => +i.dataset.t === near.t));

    }
    if (live) goLive(); else imgs.forEach(i => { if (i.dataset.src) i.src = i.dataset.src; }); setT(t);
    // scroll: the room sinks slower than the page, the nav steps aside, the story frames swap
    const nav = $('.land-nav', v), stageEl = $('.hero-stage', v); let lastY = 0, raf = 0;
    const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const y = window.scrollY; nav.classList.toggle('hide', y > lastY && y > 160); nav.classList.toggle('solid', y > 8); lastY = y; if (!reduce && y < innerHeight * 1.2) stageEl.style.transform = `translateY(${y * 0.22}px)`; }); };
    window.addEventListener('scroll', onScroll, { passive: true });
    const steps = $$('.story-steps li', v), frames = $$('.story-frame img', v);
    const sio = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(x => { if (!x.isIntersecting) return; const k = +x.target.dataset.step; steps.forEach((s, i) => s.classList.toggle('on', i === k)); frames.forEach((f, i) => f.classList.toggle('on', i === k)); $('#storyN', v).textContent = String(k + 1).padStart(2, '0'); $('#storyRail', v).style.width = ((k + 1) / 4 * 100) + '%'; }), { rootMargin: '-45% 0px -45% 0px' }) : null;
    if (sio) steps.forEach(s => sio.observe(s));
    $$('.receipt div', v).forEach((d, i) => { d.dataset.rv = ''; d.style.setProperty('--i', i); });
    const fromX = (x) => { const r = ruler.getBoundingClientRect(); return T0 + (x - r.left) / r.width * (T1 - T0); };
    ruler.addEventListener('pointerdown', e => { ruler.setPointerCapture(e.pointerId); setT(fromX(e.clientX)); ruler.onpointermove = ev => setT(fromX(ev.clientX)); });
    ruler.addEventListener('pointerup', () => ruler.onpointermove = null);
    ruler.addEventListener('keydown', e => { const k = { ArrowRight: .25, ArrowUp: .25, ArrowLeft: -.25, ArrowDown: -.25, PageUp: 1, PageDown: -1 }[e.key]; if (k) { e.preventDefault(); setT(t + k); } if (e.key === 'Home') setT(T0); if (e.key === 'End') setT(23.9); });
    $$('.phase', v).forEach(b => b.onclick = () => { const m = ND.MOODS.find(x => x.id === b.dataset.mood); if (live) { live.atmos.warmth = m.warmth; live.atmos.lamps = m.lamps; } setT(m.time); });
    const unReveal = reveal(v);
    // the example spend block reacts to a finish change, like the real budget screen
    $$('.sp-var', v).forEach(b => b.onclick = () => {
      $$('.sp-var', v).forEach(x => x.setAttribute('aria-checked', String(x === b)));
      const seat = +b.dataset.price, total = seat + 2970, pct = total / 6000;
      countUp($('#spTotal', v), total); $('#spSeat', v).textContent = money(seat); $('#spSeatP', v).textContent = Math.round(seat / total * 100) + '%';
      $('#spLeft', v).textContent = pct > 1 ? money(total - 6000) + ' over' : money(6000 - total) + ' left';
      $('.sp-bar .s1', v).style.setProperty('--w', (seat / 6000 * 100).toFixed(1) + '%');
      const st = $('#spState', v); st.textContent = Math.round(pct * 100) + '% used'; st.dataset.s = pct > 1 ? 'over' : pct >= 0.8 ? 'warn' : 'ok';
    });
    $('#spState', v).dataset.s = 'warn';
    $$('.wi-rooms a', v).forEach(l => { const on = () => { $$('.wi-rooms a', v).forEach(x => x.classList.toggle('on', x === l)); $$('.wi-frame img', v).forEach(im => im.classList.toggle('on', im.dataset.r === l.dataset.r)); }; l.addEventListener('pointerenter', on); l.addEventListener('focus', on); });
    function lightTo(tt) { $$('.ls-frame img', v).forEach(im => im.classList.toggle('on', +im.dataset.t === tt)); $$('.ls-modes button', v).forEach(b => { const on = +b.dataset.t === tt; b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-checked', String(on)); }); $('#lsTime', v).textContent = ND.fmtTime(tt); $('#lsLabel', v).textContent = ND.timeLabel(tt); }
    $$('.ls-modes button', v).forEach(b => b.onclick = () => lightTo(+b.dataset.t));
    return () => { timers.forEach(clearTimeout); clearInterval(clockT); unReveal(); window.removeEventListener('scroll', onScroll); if (sio) sio.disconnect(); if (st.ok) { st.controls.autoRotate = false; st.off('frame'); st.controls.enableZoom = true; st.controls.enablePan = true; st.setMode('edit'); } };
  };
  function itemCostLocal(r) { const it = ND.itemById[r.item]; return ND.itemPrice(it, r.primary, r.scale); }

  // ============ 02 SIGN UP / LOGIN ============
  function authView(v, mode) {
    const eye = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>';
    const field = (id, label, type, auto, extra = '') => `<div class="ff" data-f="${id}"><div class="ff-box"><input class="input" id="${id}" type="${type}" autocomplete="${auto}" placeholder=" " required ${extra}><label for="${id}">${label}</label><i class="ff-line"></i>${id === 'pw' ? `<button type="button" class="icon-btn ff-eye" id="eye" aria-label="Show password" aria-pressed="false">${eye}</button>` : ''}</div><span class="err" id="e${id === 'pw' ? 'p' : id}" aria-live="polite"></span></div>`;
    v.innerHTML = `<div class="auth"><div class="auth-stage">${logo()}<img class="auth-photo" src="img/L6-signup-desk.webp" alt=""><div class="auth-live" id="alive"></div><p class="auth-cap"><b class="num">19:40</b> <em>dusk</em></p></div>
<main class="auth-panel" id="main"><div class="auth-in">
<div class="seg auth-seg" role="tablist" data-mode="${mode}"><i class="seg-ink" aria-hidden="true"></i><button role="tab" id="tSign" aria-selected="${mode === 'signup'}">Create account</button><button role="tab" id="tLog" aria-selected="${mode === 'login'}">Sign in</button></div>
<div><h1 class="h1" id="ah"></h1><p class="muted" id="as" style="margin-top:10px"></p></div>
<form novalidate id="f">
<div class="collapse" id="nameWrap"><div>${field('n', 'Your name', 'text', 'name', 'maxlength="40"')}</div></div>
${field('e', 'Email', 'email', 'email')}
${field('pw', 'Password', 'password', 'new-password', 'minlength="8"')}
<div class="strength" id="str" aria-live="polite"><span><i></i><i></i><i></i><i></i></span><em id="strT">At least 8 characters. Not stored in this prototype.</em></div>
<button class="btn" type="submit" id="sub"></button>
<p class="small muted"><span id="alt"></span> · <button type="button" class="link" id="guest">Continue as guest</button></p>
</form></div></main></div>`;
    const seg = $('.auth-seg', v);
    function paintMode(animate) {
      seg.dataset.mode = mode; $('#tSign', v).setAttribute('aria-selected', String(mode === 'signup')); $('#tLog', v).setAttribute('aria-selected', String(mode === 'login'));
      const h = $('#ah', v); h.textContent = mode === 'signup' ? 'Start your first space.' : 'Welcome back.'; $('#as', v).textContent = mode === 'signup' ? 'Your designs save as you work.' : 'Your designs are where you left them.';
      if (animate) { h.classList.remove('swap'); void h.offsetWidth; h.classList.add('swap'); }
      $('#nameWrap', v).classList.toggle('shut', mode === 'login'); $('#n', v).tabIndex = mode === 'login' ? -1 : 0;
      $('#pw', v).autocomplete = mode === 'signup' ? 'new-password' : 'current-password'; $('#str', v).classList.toggle('quiet', mode === 'login'); if (mode === 'login') $('#strT', v).textContent = 'Not stored in this prototype.'; else $('#pw', v).dispatchEvent(new Event('input'));
      $('#sub', v).textContent = mode === 'signup' ? 'Create account' : 'Sign in';
      $('#alt', v).innerHTML = mode === 'signup' ? 'Have an account? <button type="button" class="link" id="sw">Sign in</button>' : 'New here? <button type="button" class="link" id="sw">Create an account</button>';
      $('#sw', v).onclick = () => setMode(mode === 'signup' ? 'login' : 'signup');
      $$('.err', v).forEach(x => x.textContent = ''); $$('.ff', v).forEach(x => x.classList.remove('bad')); $$('.input', v).forEach(x => x.removeAttribute('aria-invalid'));
      document.title = (mode === 'signup' ? 'Create account' : 'Sign in') + ' · NOCTURNE';
    }
    function setMode(m) { if (m === mode) return; mode = m; try { history.replaceState(null, '', '#' + m); } catch (e) {} paintMode(true); }
    $('#tSign', v).onclick = () => setMode('signup'); $('#tLog', v).onclick = () => setMode('login');
    $('#guest', v).onclick = () => { NStore.saveProfile({ name: 'Guest', guest: true, budget: 6000 }); if (!afterAuth()) go('onboarding'); };
    $('#eye', v).onclick = (e) => { const p = $('#pw', v), on = p.type === 'password'; p.type = on ? 'text' : 'password'; e.currentTarget.setAttribute('aria-pressed', String(on)); e.currentTarget.setAttribute('aria-label', on ? 'Hide password' : 'Show password'); };
    const rules = { n: x => mode === 'login' || x.trim() ? '' : 'Tell us what to call you.', e: x => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.trim()) ? '' : 'Enter an email like name@example.com.', pw: x => x.length >= 8 ? '' : 'Use at least 8 characters.' };
    function check(id, msgOverride) { const inp = $('#' + id, v), msg = msgOverride !== undefined ? msgOverride : rules[id](inp.value), ff = inp.closest('.ff'); inp.setAttribute('aria-invalid', String(!!msg)); $('#e' + (id === 'pw' ? 'p' : id), v).textContent = msg; ff.classList.toggle('bad', !!msg); ff.classList.toggle('good', !msg && !!inp.value); return !msg; }
    ['n', 'e', 'pw'].forEach(id => { const inp = $('#' + id, v); inp.addEventListener('blur', () => { if (inp.value) check(id); }); inp.addEventListener('input', () => { if (inp.getAttribute('aria-invalid') === 'true') check(id); }); });
    $('#pw', v).addEventListener('input', (e) => { if (mode === 'login') return; const x = e.target.value; const sc = !x ? 0 : Math.min(4, (x.length >= 8) + (x.length >= 12) + (/[A-Z]/.test(x) && /[a-z]/.test(x)) + (/\d/.test(x) || /[^\w]/.test(x))) || 1; $('#str', v).dataset.s = sc; $('#strT', v).textContent = !x ? 'At least 8 characters. Not stored in this prototype.' : ['', 'Weak', 'Fair', 'Good', 'Strong'][sc]; });
    paintMode(false);
    $('#f', v).onsubmit = (e) => {
      e.preventDefault(); const ok = ['n', 'e', 'pw'].map(id => check(id)).every(Boolean);
      if (!ok) { const bad = $('[aria-invalid="true"]', v); bad.closest('.ff').classList.remove('shake'); void bad.offsetWidth; bad.closest('.ff').classList.add('shake'); bad.focus(); return; }
      const em = $('#e', v).value.trim();
      if (mode === 'login') {
        if (S.profile && S.profile.email && S.profile.email !== em) { check('e', 'No account with that email on this device.'); return; }
        NStore.saveProfile({ email: em, name: (S.profile && S.profile.name) || em.split('@')[0], guest: false, onboarded: (S.profile && S.profile.onboarded) || S.projects.length > 0 });
        toast('Signed in'); if (!afterAuth()) go('dashboard');
      } else { NStore.saveProfile({ name: $('#n', v).value.trim(), email: em, guest: false, budget: 6000 }); if (!afterAuth()) go('onboarding'); }
    };
    // the room beside the form is live: the same studio at dusk, turning slowly
    const st = getStage();
    if (st.ok) {
      const pj = NStore.newProject({ name: 'Auth', layout: 'studio', style: 'scandi' }); pj.atmos.time = 19.67; pj.atmos.lamps = 'on';
      st.mount($('#alive', v)); st.setMode('view'); st.controls.enableZoom = false; st.controls.enablePan = false; st.setProject(pj); st.setLook('render');
      const r = pj.rooms[0], tgt = new THREE.Vector3(r.w * 0.44, 0.2, r.d * 0.45), end = new THREE.Vector3(r.w * 0.5 + 3.6, 6.2, r.d + 8.2), from = new THREE.Vector3(r.w * 0.5 + 6.5, 9.5, r.d + 12.5);
      if (reduced()) st.flyTo(end, tgt, false); else { st.flyTo(from, tgt, false); st.camAnim = { p0: from.clone(), t0: tgt.clone(), p1: end, t1: tgt, s: performance.now(), d: 2800 }; setTimeout(() => { if ($('#alive', v)) { st.controls.autoRotate = true; st.controls.autoRotateSpeed = 0.25; } }, 2900); }
      $('.auth-stage', v).classList.add('live');
    }
    return () => { if (st.ok) { st.controls.autoRotate = false; st.controls.enableZoom = true; st.controls.enablePan = true; st.setMode('edit'); } };
  }
  routes.signup = (v) => authView(v, 'signup');
  routes.login = (v) => authView(v, 'login');

  // ============ 03 ONBOARDING ============
  routes.onboarding = (v) => {
    const pr = S.profile; let step = 0; const pick = { type: pr.spaceType || 'both', styles: pr.styles || [], budget: pr.budget || 6000, currency: pr.currency || 'USD', units: pr.units || 'cm' };
    function paint() {
      const head = ['What are you designing?', 'Which rooms feel like you?', 'What can you spend?'][step];
      const sub = ['Your first plan starts from this.', 'Pick up to three.', 'For the whole space. Split it by room later.'][step];
      let body = '';
      if (step === 0) body = `<div class="choice-grid" role="radiogroup" aria-label="Space type" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">${ND.SPACE_TYPES.map(s => `<button class="choice" role="radio" aria-checked="${pick.type === s.id}" data-v="${s.id}"><img src="img/${s.img}.webp" alt=""><span class="tick">${ic('check', 14)}</span><span class="cap"><span class="h3">${s.name}</span><span class="small muted">${s.line}</span></span></button>`).join('')}</div>`;
      if (step === 1) body = `<div class="choice-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${ND.STYLES.map(s => `<button class="choice" aria-pressed="${pick.styles.includes(s.id)}" data-v="${s.id}"><img src="img/${s.img}.webp" data-shot="${s.id}" alt=""><span class="tick">${ic('check', 14)}</span><span class="cap"><span style="font-weight:500">${s.name}</span></span></button>`).join('')}</div><p class="small muted" id="cnt" style="margin-top:16px" aria-live="polite">${pick.styles.length} of 3 chosen</p>`;
      if (step === 2) body = `<div style="display:grid;gap:40px;max-width:560px"><div><div class="budget-big" id="bv">${money(pick.budget, { currency: pick.currency })}</div><input type="range" id="br" min="1000" max="40000" step="250" value="${pick.budget}" aria-label="Total budget"><div class="kv small"><span>${money(1000, { currency: pick.currency })}</span><span>${money(40000, { currency: pick.currency })}</span></div></div>
        <div style="display:flex;gap:40px;flex-wrap:wrap"><div class="field"><span class="label">Currency</span><div class="seg" id="cur">${['USD', 'EUR', 'GBP', 'CAD'].map(c => `<button type="button" aria-pressed="${pick.currency === c}" data-v="${c}">${c}</button>`).join('')}</div></div><div class="field"><span class="label">Measurements</span><div class="seg" id="un"><button type="button" aria-pressed="${pick.units === 'cm'}" data-v="cm">Metric</button><button type="button" aria-pressed="${pick.units === 'in'}" data-v="in">Imperial</button></div></div></div></div>`;
      v.innerHTML = `${topbarLite()}<main class="flow" id="main">${stepper(step, ['Space', 'Style', 'Budget'])}<h1 class="h1">${head}</h1><p class="lede" style="margin:12px 0 40px">${sub}</p>${body}</main>
      <div class="flow-foot"><button class="btn quiet" id="bk" ${step === 0 ? 'disabled' : ''}>${ic('back', 16)} Back</button><button class="btn" id="nx">${step === 2 ? 'Finish' : 'Continue'}</button></div>`;
      $$('.choice', v).forEach(b => b.onclick = () => {
        if (step === 0) { pick.type = b.dataset.v; $$('.choice', v).forEach(x => x.setAttribute('aria-checked', String(x === b))); }
        else { const id = b.dataset.v, has = pick.styles.includes(id); if (!has && pick.styles.length >= 3) { toast('Three is the limit. Unpick one first.'); return; } pick.styles = has ? pick.styles.filter(x => x !== id) : [...pick.styles, id]; b.setAttribute('aria-pressed', String(!has)); $('#cnt', v).textContent = pick.styles.length + ' of 3 chosen'; }
      });
      if (step === 1) bindStyleShots(v);
      if (step === 2) {
        const br = $('#br', v); br.oninput = () => { pick.budget = +br.value; $('#bv', v).textContent = money(pick.budget, { currency: pick.currency }); };
        $$('#cur button', v).forEach(b => b.onclick = () => { pick.currency = b.dataset.v; paint(); });
        $$('#un button', v).forEach(b => b.onclick = () => { pick.units = b.dataset.v; $$('#un button', v).forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
      }
      $('#bk', v).onclick = () => { step--; paint(); };
      $('#nx', v).onclick = () => {
        if (step === 1 && !pick.styles.length) { toast('Pick at least one style, or press Continue again to skip.'); pick.skipStyles = (pick.skipStyles || 0) + 1; if (pick.skipStyles < 2) return; }
        if (step < 2) { step++; paint(); return; }
        NStore.saveProfile({ spaceType: pick.type, styles: pick.styles, budget: pick.budget, currency: pick.currency, units: pick.units, onboarded: true });
        draft = { name: '', type: pick.type, layout: pick.type === 'workspace' ? 'office' : (pick.type === 'apartment' ? 'onebed' : 'twobed'), style: pick.styles[0] || 'scandi' };
         go('dashboard');
      };
    }
    paint();
  };
  const topbarLite = (exit) => `<a class="skip" href="#main">Skip to content</a><header class="topbar">${logo('', exit ? '#dashboard' : '#home')}<span class="sp"></span>${exit ? `<a class="btn quiet sm" href="#dashboard">${ic('x', 16)} Close</a>` : ''}</header>`;
  const STEP_NAMES = ['Space', 'Layout', 'Style'];
  const stepper = (k, names = STEP_NAMES, aside = '') => `<div class="stepper"><ol aria-label="Step ${k + 1} of ${names.length}">${names.map((n, i) => `<li class="${i < k ? 'done' : i === k ? 'on' : ''}" ${i === k ? 'aria-current="step"' : ''}><i></i><span>${n}</span></li>`).join('')}</ol>${aside ? `<span class="small muted">${aside}</span>` : ''}</div>`;

  // ============ 04 DASHBOARD ============
  let thumbQ = Promise.resolve();
  function ensureThumbs(list, root) {
    const st = getStage(); if (!st.ok) return;
    list.filter(p => !p.thumb).forEach(p => { thumbQ = thumbQ.then(() => new Promise(res => {
      if (st.host && document.body.contains(st.host) && st.host.closest('.ed, .walkfs, .preview-hero, .auth, .hero')) return res();
      const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-3000px;top:0;width:960px;height:600px;'; document.body.appendChild(host);
      st.mount(host); st.setMode('view'); st.setLook('render'); st.setProject(p); st.frameRoom(null, false, 'dollhouse');
      setTimeout(() => { try { p.thumb = st.capture(640, 400, 'image/jpeg', 0.8); NStore.saveProject(p); $$(`[data-thumbof="${p.id}"]`, root).forEach(el => { el.innerHTML = `<img src="${p.thumb}" alt="">`; el.classList.add('fadein'); }); } catch (e) {} host.remove(); res(); }, 450);
    })); });
  }
  function thumbHTML(p) { return p.thumb ? `<img src="${p.thumb}" alt="">` : `<div class="ph"><img src="img/K2-sketch-furnished.webp" alt=""></div>`; }
  routes.dashboard = (v) => {
    const pr = S.profile, ps = S.projects, h = new Date().getHours();
    const hi = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const last = ps[0];
    const tot = ps.reduce((a, p) => a + costs(p).spent, 0), pieces = ps.reduce((a, p) => a + p.items.length, 0);
    v.innerHTML = `${topbar('dashboard')}<main class="page" id="main">
<div class="page-head"><p class="label">Studio · ${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1 class="h1">${hi}${pr.guest ? '' : ', ' + esc(pr.name)}.</h1><a class="btn" href="#new">${ic('plus', 16)} New space</a></div>
${last ? `<div class="dash-grid"><div><p class="label" style="margin-bottom:12px">Continue where you left off</p><a class="feature-proj" href="#editor" data-open="${last.id}"><div class="thumb" data-thumbof="${last.id}">${thumbHTML(last)}</div><div class="kv" style="align-items:baseline"><span class="h2" style="color:var(--ink)">${esc(last.name)}</span><span class="small muted">Edited ${ago(last.updated)}</span></div></a>
  <div class="stat-row" style="margin-top:32px"><div><span class="label">Spaces</span><b>${ps.length}</b></div><div><span class="label">Pieces placed</span><b>${pieces}</b></div><div><span class="label">Planned spend</span><b>${money(tot)}</b></div></div></div>
  <aside class="side-stack"><div><p class="label" style="margin-bottom:8px">Start</p><div class="quick"><a href="#new">New space</a><button id="openSample">Sample apartment</button><a href="#style">Styles</a></div></div>
  ${ps.length > 1 ? `<div><p class="label" style="margin-bottom:8px">Recent</p><div class="quick">${ps.slice(1, 5).map(p => `<a href="#editor" data-open="${p.id}"><span>${esc(p.name)}</span><span class="small muted">${ago(p.updated)}</span></a>`).join('')}</div></div>` : ''}</aside></div>`
        : `<div class="empty"><img src="img/K1-sketch-empty.webp" alt="An empty room, drawn in pencil"><h2 class="h2">Nothing here yet.</h2><p class="muted">Pick a layout and a style. The first version comes furnished.</p><div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="#new">Create your first space</a><button class="btn ghost" id="openSample">Open a sample</button></div></div>`}
</main>`;
    $$('[data-open]', v).forEach(a => a.addEventListener('click', () => setCurrent(a.dataset.open)));
    ensureThumbs(ps.slice(0, 1), v);
    const os = $('#openSample', v); if (os) os.onclick = () => { const sp = S.projects.find(p => p.sample) || NStore.sampleProject(); if (!NStore.getProject(sp.id)) NStore.saveProject(sp, { now: true }); setCurrent(sp.id); go('editor'); };
  };

  // ============ 05 CREATE SPACE ============
  routes.new = (v) => {
    if (!draft.type) draft.type = S.profile.spaceType || 'both';
    v.innerHTML = `${topbarLite(true)}<main class="flow" id="main">${stepper(0)}
<h1 class="h1">Name the space.</h1><p class="lede" style="margin:12px 0 32px">You can rename it later.</p>
<div class="field" style="max-width:560px;margin-bottom:48px"><label for="nm">Space name</label><input id="nm" class="input" style="font-size:21px;font-weight:500;min-height:56px" maxlength="60" placeholder="e.g. Lisbon flat, spring" value="${esc(draft.name)}" data-autofocus><span class="err" id="nmE"></span></div>
<p class="label" style="margin-bottom:16px">Type of space</p><div class="choice-grid" role="radiogroup" aria-label="Space type" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">${ND.SPACE_TYPES.map(s => `<button class="choice" role="radio" aria-checked="${draft.type === s.id}" data-v="${s.id}"><img src="img/${s.img}.webp" alt=""><span class="tick">${ic('check', 14)}</span><span class="cap"><span class="h3">${s.name}</span><span class="small muted">${s.line}</span></span></button>`).join('')}</div></main>
<div class="flow-foot"><a class="btn quiet" href="#dashboard">Cancel</a><span class="sp"></span><button class="btn" id="nx">Choose a layout</button></div>`;
    $$('.choice', v).forEach(b => b.onclick = () => { draft.type = b.dataset.v; $$('.choice', v).forEach(x => x.setAttribute('aria-checked', String(x === b))); });
    $('#nx', v).onclick = () => { const n = $('#nm', v).value.trim(); if (n.length > 60) { $('#nmE', v).textContent = 'Keep it under 60 characters.'; return; } draft.name = n; go('layout'); };
  };

  // ============ 06 LAYOUT ============
  function planSVG(L0, k = 1) {
    const r1 = n => Math.round(n * k * 10) / 10; const L = { ...L0, rooms: L0.rooms.map(r => ({ ...r, w: r1(r.w), d: r1(r.d), x: r1(r.x), z: r1(r.z) })) };
    const xs = L.rooms.map(r => r.x + r.w), zs = L.rooms.map(r => r.z + r.d); const W = Math.max(...xs), D = Math.max(...zs); const pad = 1.1, sc = 300 / (Math.max(...L0.rooms.map(r => r.x + r.w)) * 1.4 + pad * 2);
    const vb = `0 0 300 ${Math.round((D + pad * 2) * sc)}`;
    return `<svg class="plan-svg" viewBox="${vb}" role="img" aria-label="Floor plan: ${L.rooms.map(r => r.name + ' ' + r.w + ' by ' + r.d + ' metres').join(', ')}">${L.rooms.map(r => `<rect x="${(r.x + pad) * sc}" y="${(r.z + pad) * sc}" width="${r.w * sc}" height="${r.d * sc}"/><text x="${(r.x + pad + r.w / 2) * sc}" y="${(r.z + pad + r.d / 2) * sc}" text-anchor="middle">${r.name.toUpperCase()}</text><text x="${(r.x + pad + r.w / 2) * sc}" y="${(r.z + pad + r.d / 2) * sc + 12}" text-anchor="middle">${r.w} × ${r.d} m</text>`).join('')}<line class="dl" x1="${pad * sc}" x2="${(W + pad) * sc}" y1="${pad * sc * 0.5}" y2="${pad * sc * 0.5}"/><text x="${(W / 2 + pad) * sc}" y="${pad * sc * 0.5 - 4}" text-anchor="middle">${W} m</text></svg>`;
  }
  routes.layout = (v) => {
    if (!draft.layout) draft.layout = draft.type === 'workspace' ? 'office' : draft.type === 'apartment' ? 'onebed' : 'twobed';
    v.innerHTML = `${topbarLite(true)}<main class="flow" id="main">${stepper(1, STEP_NAMES, esc(draft.name || 'Untitled space'))}
<h1 class="h1">Choose a layout.</h1><p class="lede" style="margin:12px 0 24px">Room sizes are typical for each plan. Windows face the street side.</p>
<div class="field" style="max-width:420px;margin-bottom:40px"><label class="mini-field" for="lsz"><span>Overall size</span><output id="lszO"></output></label><input type="range" id="lsz" min="0.8" max="1.3" step="0.05" value="${draft.scale || 1}"><div class="kv small"><span>Compact</span><span>Generous</span></div></div>
<div class="choice-grid" role="radiogroup" aria-label="Layouts" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">${ND.LAYOUTS.map(L => `<button class="choice" role="radio" aria-checked="${draft.layout === L.id}" data-v="${L.id}"><span class="plan-box" data-plan="${L.id}">${planSVG(L, draft.scale || 1)}</span><span class="tick">${ic('check', 14)}</span><span class="cap"><span class="kv"><span class="h3" style="color:var(--ink)">${L.name}</span><span class="num muted small" data-area="${L.id}">${area(L.area * (draft.scale || 1) ** 2)}</span></span><span class="small muted">${L.line}</span><span class="small muted">${L.rooms.length} room${L.rooms.length > 1 ? 's' : ''}</span></span></button>`).join('')}</div></main>
<div class="flow-foot"><a class="btn quiet" href="#new">${ic('back', 16)} Back</a><button class="btn" id="nx">Choose a style</button></div>`;
    $$('.choice', v).forEach(b => b.onclick = () => { draft.layout = b.dataset.v; $$('.choice', v).forEach(x => x.setAttribute('aria-checked', String(x === b))); });
    const lsz = $('#lsz', v), lo = () => { const k = +lsz.value; draft.scale = k; $('#lszO', v).textContent = k === 1 ? 'Typical' : (k > 1 ? '+' : '−') + Math.round(Math.abs(k * k - 1) * 100) + '% area'; ND.LAYOUTS.forEach(L => { $(`[data-plan="${L.id}"]`, v).innerHTML = planSVG(L, k); $(`[data-area="${L.id}"]`, v).textContent = area(L.area * k * k); }); }; lsz.oninput = lo; lo();
    $('#nx', v).onclick = () => go('style');
  };

  // ============ 07 STYLE DISCOVERY ============
  routes.style = (v) => {
    const inFlow = !!draft.layout; let sel = draft.style || (S.profile.styles && S.profile.styles[0]) || 'scandi'; let unbind = null;
    function paint() {
      const st = ND.STYLES.find(s => s.id === sel);
      v.innerHTML = `${inFlow ? topbarLite(true) : topbar('style')}<main class="flow" id="main">${inFlow ? stepper(2, STEP_NAMES, `${esc(draft.name || 'Untitled space')} · ${ND.LAYOUTS.find(l => l.id === draft.layout).name}`) : ''}
<div class="page-head" style="margin-bottom:40px"><p class="label">Style discovery</p><h1 class="h1">${inFlow ? 'Choose a style.' : 'Eight styles.'}</h1><span class="small muted">${(S.profile.styles || []).length ? 'Marked: your picks from setup' : ''}</span></div>
<div class="two-col"><div class="choice-grid" style="grid-template-columns:repeat(auto-fill,minmax(190px,1fr));align-content:start">${ND.STYLES.map(s => `<button class="choice" aria-pressed="${s.id === sel}" data-v="${s.id}"><img src="img/${s.img}.webp" data-shot="${s.id}" alt="" style="aspect-ratio:4/3"><span class="tick">${ic('check', 14)}</span><span class="mood-chips" aria-hidden="true">${s.palette.map(c => `<i style="background:${c}"></i>`).join('')}<i style="background:${ND.MAT[s.fabric].color}"></i><i style="background:${ND.MAT[s.wood].color}"></i>${ND.FLOORS[s.floor].tex ? `<i class="sq" style="background-image:url(img/${ND.FLOORS[s.floor].tex}.webp)"></i>` : `<i class="sq" style="background:${ND.FLOORS[s.floor].color}"></i>`}</span><span class="cap"><span style="font-weight:500">${s.name}</span>${(S.profile.styles || []).includes(s.id) ? '<span class="tag" style="justify-self:start">Your pick</span>' : ''}</span></button>`).join('')}</div>
<aside style="position:sticky;top:80px;align-self:start;display:grid;gap:20px"><div style="position:relative"><img src="img/${st.img}.webp" data-shot="${st.id}" alt="Your studio furnished in ${esc(st.name)}" style="aspect-ratio:4/3;object-fit:cover;width:100%;border:1px solid var(--rule)"><img src="img/${st.img}.webp" alt="Mood reference" title="Mood reference" style="position:absolute;right:12px;bottom:12px;width:26%;aspect-ratio:4/5;object-fit:cover;border:3px solid var(--paper)"></div><h2 class="h2">${st.name}</h2><p class="muted">${st.line}</p>
<div class="kv"><span>Walls</span><span>${(ND.WALLS.find(w => w.id === st.wall) || {}).name}</span></div><div class="kv"><span>Floor</span><span>${ND.FLOORS[st.floor].name}</span></div><div class="kv"><span>Fabric</span><span>${ND.MAT[st.fabric].name}</span></div><div class="kv"><span>Wood</span><span>${ND.MAT[st.wood].name}</span></div>
<div><p class="label" style="margin-bottom:8px">Suggested pieces</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--rule);border:1px solid var(--rule)">${st.suggest.slice(0, 6).map(id => { const it = ND.itemById[id]; return it ? `<div style="background:var(--paper);padding:6px"><img data-thumb="${id}" data-mat="${it.primaryOpts.includes(st.fabric) ? st.fabric : (it.primaryOpts.includes(st.wood) ? st.wood : it.primary)}" alt="" style="aspect-ratio:1;width:100%"><span style="font-size:11px;display:block">${esc(it.name)}</span></div>` : ''; }).join('')}</div></div>
<button class="btn" id="use">${inFlow ? 'Create this space' : 'Start a space in this style'}</button></aside></div></main>${inFlow ? `<div class="flow-foot"><a class="btn quiet" href="#layout">${ic('back', 16)} Back</a></div>` : ''}`;
      $$('.choice', v).forEach(b => b.onclick = () => { sel = b.dataset.v; paint(); });
      lazyThumbs(v); if (unbind) unbind(); unbind = bindStyleShots(v);
      $('#use', v).onclick = () => {
        if (!inFlow) { draft = { name: '', type: S.profile.spaceType || 'both', layout: null, style: sel }; go('new'); return; }
        draft.style = sel; const p = NStore.newProject(draft); NStore.saveProject(p, { now: true }); setCurrent(p.id); draft = { name: '', type: 'both', layout: null, style: null };
        toast('Space created and furnished in ' + ND.STYLES.find(s => s.id === p.style).name); go('editor');
      };
    }
    paint(); return () => unbind && unbind();
  };

  // The same room re-skinned in every style (Havenly): rendered once per visit from the live 3D stage, not stock photos.
  const styleShots = {}; let shotting = null;
  function renderStyleShots() {
    if (shotting) return shotting; const st = getStage(); if (!st.ok) return Promise.resolve({});
    shotting = new Promise(res => {
      const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-3000px;top:0;width:560px;height:420px;'; document.body.appendChild(host);
      st.mount(host); st.setMode('view'); const was = st.look; st.setLook('render');
      const texs = Object.values(ND.FLOORS).filter(f => f.tex).map(f => st.tex(f.tex)); const t0 = Date.now();
      let i = 0;
      (function next() {
        if (st.host !== host) { shotting = null; host.remove(); res(styleShots); return; } // another screen took the stage
        if (texs.some(t => !t.image) && Date.now() - t0 < 4000) return setTimeout(next, 80);
        if (i >= ND.STYLES.length) { st.setLook(was || 'render'); host.remove(); res(styleShots); return; }
        if (styleShots[ND.STYLES[i].id]) { i++; return next(); }
        const s = ND.STYLES[i++]; const pj = NStore.newProject({ name: s.name, layout: 'studio', style: s.id }); pj.atmos.time = 17.2; pj.atmos.lamps = 'on';
        st.setProject(pj); const r = pj.rooms[0]; st.flyTo(new THREE.Vector3(r.w * 0.8, 4.2, r.d + 4.2), new THREE.Vector3(r.w * 0.42, 0.4, r.d * 0.45), false);
        styleShots[s.id] = st.capture(560, 420, 'image/jpeg', 0.82); document.dispatchEvent(new CustomEvent('styleshot', { detail: s.id }));
        setTimeout(next, 30);
      })();
    });
    return shotting;
  }
  function bindStyleShots(root) {
    const paint = () => $$('img[data-shot]', root).forEach(im => { const u = styleShots[im.dataset.shot]; if (u && im.getAttribute('src') !== u) im.src = u; });
    paint(); document.addEventListener('styleshot', paint); renderStyleShots(); return () => document.removeEventListener('styleshot', paint);
  }

  // thumbnails rendered from the same 3D models as the editor, one per frame so the page stays responsive
  function lazyThumbs(root) {
    const imgs = $$('img[data-thumb]', root); let i = 0;
    (function next() { if (i >= imgs.length || !document.body.contains(imgs[i] || document.body)) return; const im = imgs[i++]; const u = NScene.thumb(im.dataset.thumb, im.dataset.mat || null); if (u) im.src = u; requestAnimationFrame(next); })();
  }

  // ============ 14 SAVED DESIGNS ============
  routes.saved = (v) => {
    let q = '', sort = 'recent', type = 'all';
    v.innerHTML = `${topbar('saved')}<main class="page" id="main"><div class="page-head"><p class="label">Library</p><h1 class="h1">Saved designs</h1><a class="btn" href="#new">${ic('plus', 16)} New space</a></div>
<div class="toolbar"><div class="field search"><label for="q" class="label">Search</label>${ic('search')}<input id="q" class="input" placeholder="Search by name or style"></div>
<div class="field"><label for="so" class="label">Sort</label><select id="so" class="input"><option value="recent">Last edited</option><option value="name">Name A–Z</option><option value="cost">Highest spend</option><option value="created">Date created</option></select></div>
<div class="field"><span class="label">Type</span><div class="seg" id="ty"><button aria-pressed="true" data-v="all">All</button>${ND.SPACE_TYPES.map(s => `<button aria-pressed="false" data-v="${s.id}">${s.name.replace('Apartment + workspace', 'Both')}</button>`).join('')}</div></div></div>
<div id="list" aria-live="polite"></div></main>`;
    function paint() {
      let ps = S.projects.filter(p => (type === 'all' || p.type === type) && (p.name + ' ' + (ND.STYLES.find(s => s.id === p.style) || {}).name).toLowerCase().includes(q));
      ps = ps.slice().sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'cost' ? costs(b).spent - costs(a).spent : sort === 'created' ? b.created - a.created : b.updated - a.updated);
      const L = $('#list', v);
      if (!S.projects.length) { L.innerHTML = `<div class="empty"><img src="img/K1-sketch-empty.webp" alt=""><h2 class="h2">No saved designs yet.</h2><p class="muted">Every space you create appears here and saves as you work.</p><a class="btn" href="#new">Create a space</a></div>`; return; }
      if (!ps.length) { L.innerHTML = `<div class="empty"><h2 class="h3">Nothing matches “${esc(q)}”.</h2><button class="btn ghost" id="clr">Clear filters</button></div>`; $('#clr', v).onclick = () => { q = ''; type = 'all'; $('#q', v).value = ''; $$('#ty button', v).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === 'all'))); paint(); }; return; }
      L.innerHTML = `<p class="small muted" style="margin-bottom:20px">${ps.length} design${ps.length > 1 ? 's' : ''}</p><div class="proj-grid">${ps.map((p, n) => { const c = costs(p), st = ND.STYLES.find(s => s.id === p.style) || {}; return `<article class="proj-card"><a class="cover" href="#editor" data-open="${p.id}" aria-label="Open ${esc(p.name)}"></a><div class="thumb" data-thumbof="${p.id}">${thumbHTML(p)}</div><div class="meta"><div style="display:grid;gap:4px"><h2 class="h3" style="font-size:20px"><span class="idx">${String(n + 1).padStart(2, '0')}</span> ${esc(p.name)}</h2><span class="small muted">${st.name || ''} · ${ND.LAYOUTS.find(l => l.id === p.layout).name} · ${ago(p.updated)}</span><span class="small num ${c.over ? '' : 'muted'}" style="${c.over ? 'color:var(--danger)' : ''}">${money(c.spent)} of ${money(c.budget)}${c.over ? ' · over budget' : ''}</span>${p.sample ? '<span class="tag" style="justify-self:start">Sample</span>' : ''}</div><div class="acts"><button class="icon-btn" data-dup="${p.id}" aria-label="Duplicate ${esc(p.name)}" title="Duplicate">${ic('copy')}</button><button class="icon-btn" data-ren="${p.id}" aria-label="Rename ${esc(p.name)}" title="Rename"><svg class="i" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"/></svg></button><button class="icon-btn" data-del="${p.id}" aria-label="Delete ${esc(p.name)}" title="Delete">${ic('trash')}</button></div></div></article>`; }).join('')}</div>`;
      $$('[data-open]', L).forEach(a => a.addEventListener('click', () => setCurrent(a.dataset.open))); ensureThumbs(ps, L);
      $$('[data-dup]', L).forEach(b => b.onclick = () => { const c = NStore.duplicateProject(b.dataset.dup); toast('Duplicated as “' + c.name + '”'); paint(); });
      $$('[data-ren]', L).forEach(b => b.onclick = async () => { const p = NStore.getProject(b.dataset.ren); const n = await promptBox('Rename design', p.name); if (n) { p.name = n; NStore.saveProject(p); paint(); toast('Renamed'); } });
      $$('[data-del]', L).forEach(b => b.onclick = () => { const p = NStore.deleteProject(b.dataset.del); paint(); toast('Deleted “' + p.name + '”', { action: () => { NStore.restoreProject(p); paint(); } }); });
    }
    $('#q', v).oninput = (e) => { q = e.target.value.trim().toLowerCase(); paint(); };
    $('#so', v).onchange = (e) => { sort = e.target.value; paint(); };
    $$('#ty button', v).forEach(b => b.onclick = () => { type = b.dataset.v; $$('#ty button', v).forEach(x => x.setAttribute('aria-pressed', String(x === b))); paint(); });
    paint(); const off = NStore.on(() => {}); return off;
  };

  // ============ 17 PROFILE / SETTINGS ============
  routes.settings = (v) => {
    const p = S.profile;
    v.innerHTML = `${topbar('')}<main class="page" id="main"><div class="page-head"><p class="label">Account</p><h1 class="h1">Profile & settings</h1><span class="sync" data-s="${S.sync}" id="sy">${esc(syncText())}</span></div>
<form id="f" novalidate>
<section class="settings-sec"><div><h2 class="h3">Profile</h2><p class="small muted" style="margin-top:6px">${p.guest ? 'You are designing as a guest.' : 'Shown on your studio.'}</p></div><div class="body"><div class="field"><label for="n">Name</label><input class="input" id="n" value="${esc(p.guest ? '' : p.name)}" maxlength="40" placeholder="Your name"></div><div class="field"><label for="e">Email</label><input class="input" id="e" type="email" value="${esc(p.email || '')}" placeholder="name@example.com"><span class="err" id="ee"></span></div></div></section>
<section class="settings-sec"><div><h2 class="h3">Planning</h2><p class="small muted" style="margin-top:6px">Used for new spaces and price display.</p></div><div class="body"><div class="field"><label for="b">Default budget for a new space</label><input class="input num" id="b" type="number" min="500" max="200000" step="50" value="${p.budget || 6000}"><span class="err" id="eb"></span></div>
<div class="field"><span class="label">Currency</span><div class="seg" id="cur">${['USD', 'EUR', 'GBP', 'CAD'].map(c => `<button type="button" aria-pressed="${(p.currency || 'USD') === c}" data-v="${c}">${c}</button>`).join('')}</div></div>
<div class="field"><span class="label">Measurements</span><div class="seg" id="un"><button type="button" aria-pressed="${p.units !== 'in'}" data-v="cm">Metric (cm, m²)</button><button type="button" aria-pressed="${p.units === 'in'}" data-v="in">Imperial (in, sq ft)</button></div></div></div></section>
<section class="settings-sec"><div><h2 class="h3">Accessibility</h2></div><div class="body"><label class="switch"><span>Reduce motion<br><span class="small muted">Camera moves and fades happen instantly.</span></span><input type="checkbox" id="rm" ${p.reducedMotion ? 'checked' : ''}></label></div></section>
<div style="display:flex;justify-content:flex-end;padding:24px 0"><button class="btn" type="submit">Save changes</button></div>
</form>
<section class="settings-sec"><div><h2 class="h3">Your data</h2><p class="small muted" style="margin-top:6px">${S.projects.length} design${S.projects.length === 1 ? '' : 's'}. ${NStore.hasCloud() ? 'Saved to your account and to this browser.' : 'Saved in this browser.'}</p></div><div class="body"><div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn ghost" id="exp">${ic('download', 16)} Export everything (.json)</button><label class="btn ghost" style="cursor:pointer">Import a design<input type="file" id="imp" accept="application/json,.json" class="sr"></label></div><div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn ghost" id="out">Sign out</button><button class="btn danger" id="wipe">Delete all designs</button></div></div></section></main>`;
    let cur = p.currency || 'USD', un = p.units || 'cm';
    $$('#cur button', v).forEach(b => b.onclick = () => { cur = b.dataset.v; $$('#cur button', v).forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
    $$('#un button', v).forEach(b => b.onclick = () => { un = b.dataset.v; $$('#un button', v).forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
    $('#f', v).onsubmit = (e) => {
      e.preventDefault(); const em = $('#e', v).value.trim(), b = +$('#b', v).value;
      $('#ee', v).textContent = em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) ? 'That email looks incomplete.' : ''; $('#eb', v).textContent = (b < 500 || b > 200000) ? 'Choose between 500 and 200,000.' : '';
      if ($('#ee', v).textContent || $('#eb', v).textContent) return;
      const name = $('#n', v).value.trim();
      NStore.saveProfile({ name: name || p.name, guest: name ? false : p.guest, email: em, budget: b, currency: cur, units: un, reducedMotion: $('#rm', v).checked });
      applyMotionPref(); toast('Settings saved');
    };
    $('#exp', v).onclick = () => saveFile('nocturne-designs.json', JSON.stringify({ app: 'nocturne', version: 1, profile: { ...S.profile }, projects: S.projects }, null, 1), 'application/json');
    $('#imp', v).onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { const d = JSON.parse(await f.text()); const list = d.projects || (d.project ? [d.project] : d.rooms ? [d] : []); if (!list.length) throw new Error('empty');
        list.forEach(pj => { if (!pj.rooms || !pj.items) throw new Error('bad'); pj.id = NStore.uidGen('p'); NStore.saveProject(pj, { now: true }); }); toast('Imported ' + list.length + ' design' + (list.length > 1 ? 's' : '')); }
      catch (err) { toast('That file is not a NOCTURNE design.', { err: true }); }
      e.target.value = '';
    };
    $('#out', v).onclick = async () => { if (await confirmBox('Sign out?', 'Your designs stay saved. Sign in again to see them.', 'Sign out')) { NStore.saveProfile({}); S.profile = null; try { const l = JSON.parse(localStorage.getItem('nocturne.v1')); l.profile = null; localStorage.setItem('nocturne.v1', JSON.stringify(l)); } catch (e) {} go('home'); } };
    $('#wipe', v).onclick = async () => { if (await confirmBox('Delete all designs?', 'This removes ' + S.projects.length + ' designs from this account and browser. It cannot be undone.', 'Delete all', true)) { S.projects.slice().forEach(pj => NStore.deleteProject(pj.id)); toast('All designs deleted'); render(); } };
    return NStore.on(() => { const sy = $('#sy', v); if (sy) { sy.dataset.s = S.sync; sy.textContent = syncText(); } });
  };
  function syncText() { return { local: 'Saved in this browser', cloud: 'Saved to your account', saving: 'Saving…', saved: 'Saved to your account', error: S.syncMsg || 'Could not save' }[S.sync] || 'Saved'; }

  // ---------- files ----------
  async function saveFile(name, data, mime) {
    try { if (window.claude && window.claude.use) { const dl = await window.claude.use('downloads'); if (dl && dl.save) { await dl.save({ filename: name, data }); toast('Saved ' + name); return true; } } } catch (e) { /* fall through */ }
    try {
      const blob = data instanceof Blob ? data : (typeof data === 'string' && data.startsWith('data:')) ? await (await fetch(data)).blob() : new Blob([data], { type: mime });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); toast('Downloading ' + name); return true;
    } catch (e) { toast('This browser blocked the download.', { err: true }); return false; }
  }

  function applyMotionPref() { document.documentElement.classList.toggle('reduce-motion', !!(S.profile && S.profile.reducedMotion) || matchMedia('(prefers-reduced-motion: reduce)').matches); }

  window.NApp = { phasesRow, track, loaderPhases, markPhase, countUp, reduced, S, $, $$, esc, ic, logo, money, len, area, ago, costs, itemCost, toast, confirmBox, promptBox, routes, go, render, topbar, setCurrent, current, getStage, lazyThumbs, saveFile, syncText, thumbHTML };

  // boot after the editor module registers its routes
  window.addEventListener('DOMContentLoaded', () => {
    NStore.init().then(() => {}); applyMotionPref();
    NStore.on(applyMotionPref);
    // every visit starts on the landing page; a link with ?app=1 (used for testing) keeps the requested screen
    if (!/[?&]app=1/.test(location.search) && location.hash && location.hash !== '#home') { try { history.replaceState(null, '', location.pathname + location.search + '#home'); } catch (e) { location.hash = 'home'; } }
    render();
  });
})();
