/* NOCTURNE — the 3D workspace and the screens that read from it. */
(function () {
  const A = window.NApp; const { S, $, $$, esc, ic, money, len, costs, itemCost, toast, routes, go } = A;
  const T0 = 0, T1 = 24;
  const MOODS = ND.MOODS;

  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  function needProject() { const p = A.current(); if (!p) { toast('Create a space first.'); go('new'); return null; } A.setCurrent(p.id); return p; }

  const ruler = (id, label) => A.track(id, label);
  function bindRuler(el, get, set, commit) {
    const knob = el.querySelector('.knob');
    const paint = () => { const t = get(); el.style.setProperty('--p', (t / 24 * 100) + '%'); A.markPhase(el.parentNode, t); el.setAttribute('aria-valuenow', t.toFixed(2)); el.setAttribute('aria-valuetext', ND.fmtTime(t) + ', ' + ND.timeLabel(t)); };
    const fromX = (x) => { const r = el.getBoundingClientRect(); return Math.max(0, Math.min(23.99, (x - r.left) / r.width * 24)); };
    el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); set(fromX(e.clientX)); el.onpointermove = ev => set(fromX(ev.clientX)); });
    el.addEventListener('pointerup', () => { if (el.onpointermove) { el.onpointermove = null; commit && commit(); } });
    el.addEventListener('keydown', e => { const k = { ArrowRight: .25, ArrowUp: .25, ArrowLeft: -.25, ArrowDown: -.25, PageUp: 1, PageDown: -1 }[e.key]; if (k) { e.preventDefault(); set((get() + k + 24) % 24); commit && commit(); } });
    return paint;
  }

  function webglFallback(host, p) {
    const f = document.createElement('div'); f.className = 'fallback';
    f.innerHTML = `<div><img src="img/K3-sketch-rendered.webp" alt="" style="mix-blend-mode:multiply"><h2 class="h2">3D could not start here.</h2><p class="muted">This browser or device has WebGL turned off. Your designs are safe, and the budget, preview list and export still work.</p><div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="#budget">Open the budget</a><a class="btn ghost" href="#saved">Saved designs</a></div></div>`;
    host.appendChild(f);
  }

  // ============ 08–11 EDITOR ============
  routes.editor = (v) => {
    const p = needProject(); if (!p) return;
    const st = A.getStage(); const mobile = matchMedia('(max-width: 760px)').matches;
    let userLook = false; let selected = null, roomFocus = 'all', cat = 'All', q = '', inspTab = 'room', hist = [], fut = [];
    const snap = () => JSON.stringify({ items: p.items, rooms: p.rooms, atmos: p.atmos });
    function commit(label) { hist.push(lastSnap); if (hist.length > 80) hist.shift(); fut = []; lastSnap = snap(); NStore.saveProject(p); paintBar(); }
    let lastSnap = snap();
    function restore(sn) { const o = JSON.parse(sn); p.items = o.items; p.rooms = o.rooms; p.atmos = o.atmos; lastSnap = sn; st.setProject(p, { keepCamera: true }); select(null); NStore.saveProject(p); paintBar(); paintDial(); }
    const undo = () => { if (!hist.length) return; fut.push(snap()); restore(hist.pop()); toast('Undone'); };
    const redo = () => { if (!fut.length) return; hist.push(snap()); restore(fut.pop()); toast('Redone'); };

    v.innerHTML = `<div class="ed">
<header class="ed-bar"><a class="icon-btn" href="#dashboard" aria-label="Back to studio">${ic('back')}</a>${A.logo('d-only', '#dashboard')}<span class="vsep d-only"></span>
<label class="sr" for="pn">Design name</label><input class="ed-name" id="pn" value="${esc(p.name)}" maxlength="60"><span class="sync d-only" id="sy" role="status"></span>
<span style="flex:1"></span>
<div class="seg d-only" aria-label="Look"><button id="lkR" aria-pressed="true" title="Lit render">Render</button><button id="lkS" aria-pressed="false" title="Pencil drawing">Sketch</button></div>
<button class="icon-btn" id="un" aria-label="Undo (Ctrl Z)" title="Undo">${ic('undo')}</button><button class="icon-btn" id="re" aria-label="Redo (Ctrl Shift Z)" title="Redo">${ic('redo')}</button>
<button class="budget-pill" id="bp" aria-label="Budget"><span class="bar"><i></i></span><span id="bpT"></span></button>
<a class="btn sm ghost d-only" href="#preview">Preview</a><a class="btn sm d-only" href="#share">Share</a>
<a class="icon-btn m-only" href="#share" aria-label="Share and export">${ic('share')}</a></header>
<div class="ed-body ${mobile ? 'no-rail no-insp' : ''}" id="body">
<aside class="rail" aria-label="Furniture library"><span class="grab" style="display:none"></span><div class="rail-head"><div style="display:flex;justify-content:space-between;align-items:center"><h2 class="h3" style="font-size:20px">Library</h2><button class="icon-btn m-only" id="railX" aria-label="Close library">${ic('x')}</button></div><div class="search"><label for="lq" class="sr">Search furniture</label>${ic('search')}<input id="lq" class="input" placeholder="Search 29 pieces"></div><div class="cats" id="cats" role="toolbar" aria-label="Categories"></div></div><div class="lib" id="lib"></div></aside>
<div class="stage" id="stage">
  <div class="loading-veil" id="veil"><figure><img src="img/K1-sketch-empty.webp" alt=""><figcaption>${A.loaderPhases()}</figcaption></figure><div class="pct"><span id="pct">0</span><small>%</small></div><div class="hair"><i id="hair"></i></div></div>
  <div class="float room-tabs" id="rooms" role="toolbar" aria-label="Rooms"></div>
  <div class="float view-tools d-only" role="toolbar" aria-label="Camera"><button class="t" data-cam="orbit" aria-pressed="true">Orbit</button><button class="t" data-cam="top" aria-pressed="false">Plan</button><button class="t" data-cam="eye" aria-pressed="false">Eye level</button><a class="t" href="#walk">${ic('walk', 16)} Walk</a></div>
  <div class="float panel-toggles d-only"><button class="icon-btn" id="tRail" aria-pressed="true" aria-label="Show library" title="Library">${ic('lib')}</button><button class="icon-btn" id="tInsp" aria-pressed="true" aria-label="Show inspector" title="Inspector">${ic('panel')}</button></div>
  <div class="m-bar" style="display:none"><button class="icon-btn" id="mLib" aria-label="Open library">${ic('plus')}</button><button class="icon-btn" id="mInsp" aria-label="Open inspector">${ic('panel')}</button><button class="icon-btn" id="mLook" aria-label="Toggle sketch look">${ic('eye')}</button><a class="icon-btn" href="#walk" aria-label="Walk through">${ic('walk')}</a></div>
  <svg class="dim-overlay" id="dimo" aria-hidden="true"></svg>
  <div class="float dusk-dial"><div class="dial-head"><button class="icon-btn" id="play" aria-label="Play a full day" aria-pressed="false" title="Play a day" style="width:32px;height:32px;margin-left:-6px"><svg class="i" viewBox="0 0 24 24"><path id="playP" d="M8 5l11 7-11 7z"/></svg></button><span class="label d-only">Time of day</span>${A.phasesRow(false)}<span class="dial-time"><span id="dT"></span> <em id="dLab"></em></span></div>${ruler('dial', 'Time of day')}</div>
</div>
<aside class="insp" id="insp" aria-label="Inspector"><span class="grab" style="display:none"></span><div id="inspIn"></div></aside>
</div></div>`;
    const body = $('#body', v), host = $('#stage', v); document.body.classList.add('in-editor');

    // ----- stage -----
    if (!st.ok || !st.mount(host)) { $('#veil', v).remove(); webglFallback(host, p); }
    else {
      st.mode = 'edit'; st.setMode('edit'); st.controls.enabled = true; st.setProject(p, { room: null }); st.frameRoom(null, false, 'dollhouse'); st.frameRoom(p.rooms[0].id, true);
      const want = st.look === 'sketch' ? 'sketch' : 'render';
      const reduce = document.documentElement.classList.contains('reduce-motion');
      if (want === 'render' && !reduce) { st.setLook('sketch'); paintLook(); var drawT = setTimeout(() => { if (st.look === 'sketch' && !userLook) { st.setLook('render'); paintLook(); } }, 1700); }
      else { st.setLook(want); paintLook(); }
      let n = 0, pc = 0; const pcT = setInterval(() => { const el = $('#pct', v); if (!el) return clearInterval(pcT); pc = Math.min(99, pc + Math.max(1, Math.round((100 - pc) / 7))); el.textContent = pc; $('#hair', v).style.width = pc + '%'; }, 40);
      const off = () => { if (++n > 2 && pc > 60) { clearInterval(pcT); const el = $('#pct', v); if (el) { el.textContent = 100; $('#hair', v).style.width = '100%'; } $('#veil', v).classList.add('out'); } }; st.off('frame'); st.on('frame', off); setTimeout(() => { clearInterval(pcT); $('#veil', v) && $('#veil', v).classList.add('out'); }, 2400);
      ['select', 'moved', 'drop', 'dragging', 'camera', 'atmos'].forEach(e => st.off(e));
      st.on('select', uid => { selected = uid; inspTab = 'item'; paintInsp(); if (mobile && uid) openSheet('insp'); });
      st.on('moved', (rec) => { commit('Move'); paintInsp(); });
      st.on('drop', (id, fp) => addItem(id, fp));
    }

    function select(uid) { selected = uid; if (st.ok) st.select(uid, true); inspTab = uid ? 'item' : (inspTab === 'item' ? 'room' : inspTab); paintInsp(); }
    const recOf = (uid) => p.items.find(i => i.uid === uid);

    // ----- adding furniture -----
    function freeSpot(it, room) {
      const cx = room.x + room.w / 2, cz = room.z + room.d / 2; const tries = [[0, 0], [0.8, 0], [-0.8, 0], [0, 0.8], [0, -0.8], [1.2, 0.8], [-1.2, -0.8], [1.2, -0.8], [-1.2, 0.8]];
      for (const [dx, dz] of tries) { const x = cx + dx, z = cz + dz; const clash = p.items.some(o => { const oi = ND.itemById[o.item]; if (oi.wall || oi.flat || oi.ceiling || oi.id === 'rug-wool') return false; return Math.abs(o.x - x) < (oi.w + it.w) / 2.2 && Math.abs(o.z - z) < (oi.d + it.d) / 2.2; }); if (!clash) return { x, z }; }
      return { x: cx, z: cz };
    }
    function addItem(id, at) {
      const it = ND.itemById[id]; if (!it) return;
      const sty = ND.STYLES.find(s => s.id === p.style) || ND.STYLES[1];
      const primary = it.primaryOpts.includes(sty.fabric) ? sty.fabric : it.primaryOpts.includes(sty.wood) ? sty.wood : it.primary;
      const room = (at && st.roomAt && st.roomAt(at.x, at.z)) || (roomFocus !== 'all' && p.rooms.find(r => r.id === roomFocus)) || p.rooms[0];
      const pos = at ? { x: at.x, z: at.z } : freeSpot(it, room);
      const rec = { uid: NStore.uidGen('i'), item: id, room: room.id, x: Math.round(pos.x / .05) * .05, z: Math.round(pos.z / .05) * .05, rot: 0, scale: 1, primary, secondary: it.secondary };
      if (st.ok) { st.clampToRooms(rec); if (it.onSurface) rec.onTop = st.surfaceUnder(rec) > 0; }
      p.items.push(rec); if (st.ok) { st.addItemMesh(rec); st.applyAtmos(); if (st.look === 'sketch') st.applyLook2(); }
      commit('Add'); select(rec.uid); if (st.ok) st.pop(rec.uid); toast(it.name + ' added · ' + money(itemCost(rec)));
      if (mobile) closeSheets();
    }

    // ----- library -----
    function paintCats() { $('#cats', v).innerHTML = ['All', ...ND.CATEGORIES].map(c => `<button aria-pressed="${c === cat}" data-c="${c}">${c}</button>`).join(''); $$('#cats button', v).forEach(b => b.onclick = () => { cat = b.dataset.c; paintCats(); paintLib(); }); }
    function paintLib() {
      const list = ND.ITEMS.filter(i => (cat === 'All' || i.cat === cat) && (i.name + ' ' + i.cat + ' ' + (i.desc || '')).toLowerCase().includes(q));
      const L = $('#lib', v);
      L.innerHTML = list.length ? list.map(i => `<button class="lib-item" draggable="true" data-id="${i.id}" aria-label="Add ${esc(i.name)}, ${money(i.price)}"><img data-thumb="${i.id}" alt=""><span class="dots" aria-hidden="true">${i.primaryOpts.slice(0, 4).map(k => `<i style="background:${ND.MAT[k].color}"></i>`).join('')}${i.primaryOpts.length > 4 ? `<em>+${i.primaryOpts.length - 4}</em>` : ''}</span><span class="nm">${esc(i.name)}</span><span class="pr">from ${money(ND.itemPrice(i, i.primaryOpts.reduce((a, b) => (ND.MAT[a].mult < ND.MAT[b].mult ? a : b)), 1))}</span><span class="add" aria-hidden="true">${ic('plus', 14)}</span></button>`).join('')
        : `<div class="lib-empty"><p class="h3" style="font-size:18px">No pieces match “${esc(q)}”.</p><p class="small muted" style="margin:6px 0 12px">Try “lamp”, “oak” or “desk”.</p><button class="btn sm ghost" id="lclr">Clear search</button></div>`;
      if (!list.length) { $('#lclr', v).onclick = () => { q = ''; cat = 'All'; $('#lq', v).value = ''; paintCats(); paintLib(); }; return; }
      A.lazyThumbs(L);
      $$('.lib-item', L).forEach(b => {
        b.onclick = () => addItem(b.dataset.id);
        b.addEventListener('dragstart', e => { e.dataTransfer.setData('text/nocturne-item', b.dataset.id); e.dataTransfer.effectAllowed = 'copy'; if (st.ok) st.dragItemId = b.dataset.id; const im = b.querySelector('img'); if (im && im.src) e.dataTransfer.setDragImage(im, 40, 40); });
        b.addEventListener('dragend', () => { if (st.ok) { st.dragItemId = null; st.showGhost(null); } });
      });
    }
    $('#lq', v).oninput = (e) => { q = e.target.value.trim().toLowerCase(); paintLib(); };
    paintCats(); paintLib();

    // ----- rooms -----
    function paintRooms() {
      const R = $('#rooms', v);
      R.innerHTML = (p.rooms.length > 1 ? `<button aria-pressed="${roomFocus === 'all'}" data-r="all">Whole home</button>` : '') + p.rooms.map(r => `<button aria-pressed="${roomFocus === r.id || (p.rooms.length === 1)}" data-r="${r.id}">${esc(r.name)}</button>`).join('');
      $$('button', R).forEach(b => b.onclick = () => { roomFocus = b.dataset.r; paintRooms(); if (st.ok) st.frameRoom(roomFocus === 'all' ? null : roomFocus, true, roomFocus === 'all' ? 'dollhouse' : 'orbit'); camPressed(roomFocus === 'all' ? 'dollhouse' : 'orbit'); if (!selected) paintInsp(); });
    }
    paintRooms();
    function camPressed(c) { $$('[data-cam]', v).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cam === c))); }
    $$('[data-cam]', v).forEach(b => b.onclick = () => { if (!st.ok) return; const c = b.dataset.cam; camPressed(c); st.frameRoom(c === 'dollhouse' || roomFocus === 'all' ? (c === 'dollhouse' ? null : p.rooms[0].id) : roomFocus, true, c); });

    // ----- look -----
    function paintLook() { const sk = st.look === 'sketch'; const r = $('#lkR', v), s = $('#lkS', v); if (r) { r.setAttribute('aria-pressed', String(!sk)); s.setAttribute('aria-pressed', String(sk)); } }
    $('#lkR', v).onclick = () => { userLook = true; if (st.ok) { st.setLook('render'); paintLook(); } };
    $('#lkS', v).onclick = () => { userLook = true; if (st.ok) { st.setLook('sketch'); paintLook(); } };
    $('#mLook', v).onclick = () => { if (st.ok) { st.setLook(st.look === 'sketch' ? 'render' : 'sketch'); paintLook(); toast(st.look === 'sketch' ? 'Sketch view' : 'Render view'); } };

    // ----- top bar -----
    const pn = $('#pn', v);
    pn.onchange = () => { const n = pn.value.trim(); if (!n) { pn.value = p.name; toast('A design needs a name.'); return; } p.name = n; commit('Rename'); };
    pn.onkeydown = (e) => { if (e.key === 'Enter') pn.blur(); };
    $('#un', v).onclick = undo; $('#re', v).onclick = redo; $('#bp', v).onclick = () => go('budget');
    function paintBar() {
      const c = costs(p), bp = $('#bp', v); if (!bp) return;
      bp.classList.toggle('over', c.over); bp.classList.toggle('warn', !c.over && c.pct >= 0.8); bp.querySelector('i').style.width = Math.min(100, c.pct * 100) + '%';
      $('#bpT', v).textContent = money(c.spent) + ' / ' + money(c.budget); bp.setAttribute('aria-label', 'Budget: ' + money(c.spent) + ' of ' + money(c.budget) + (c.over ? ', over by ' + money(-c.left) : ', ' + money(c.left) + ' left') + '. Open budget overview.');
      $('#un', v).disabled = !hist.length; $('#re', v).disabled = !fut.length;
      const sy = $('#sy', v); if (sy) { sy.dataset.s = S.sync; sy.textContent = A.syncText(); }
    }
    paintBar();
    const offStore = NStore.on(() => { const sy = $('#sy', v); if (sy) { sy.dataset.s = S.sync; sy.textContent = A.syncText(); } });

    // ----- panels -----
    function setPanel(which, show) { body.classList.toggle(which === 'rail' ? 'no-rail' : 'no-insp', !show); const t = $(which === 'rail' ? '#tRail' : '#tInsp', v); if (t) t.setAttribute('aria-pressed', String(show)); setTimeout(() => st.ok && st.resize(), 300); }
    $('#tRail', v).onclick = () => setPanel('rail', body.classList.contains('no-rail'));
    $('#tInsp', v).onclick = () => setPanel('insp', body.classList.contains('no-insp'));
    function openSheet(w) { setPanel(w === 'rail' ? 'insp' : 'rail', false); setPanel(w, true); }
    function closeSheets() { setPanel('rail', false); setPanel('insp', false); }
    $('#mLib', v).onclick = () => openSheet('rail'); $('#mInsp', v).onclick = () => openSheet('insp'); $('#railX', v).onclick = () => setPanel('rail', false);

    // ----- inspector -----
    function swatches(keys, cur, attr) { return `<div class="swatches">${keys.map(k => { const m = ND.MAT[k]; return `<button class="swatch" style="background:${m.color}" data-${attr}="${k}" aria-pressed="${k === cur}" aria-label="${esc(m.name)}${m.mult !== 1 ? ', ' + (m.mult > 1 ? '+' : '') + Math.round((m.mult - 1) * 100) + '%' : ''}" title="${esc(m.name)}"></button>`; }).join('')}</div>`; }
    function paintInsp() {
      const I = $('#inspIn', v); const rec = selected && recOf(selected);
      const tabs = `<div class="tabs-line" role="tablist" style="padding:0 16px;position:sticky;top:0;background:var(--paper);z-index:2">${rec ? '<button role="tab" aria-selected="' + (inspTab === 'item') + '" data-tab="item">Piece</button>' : ''}<button role="tab" aria-selected="${inspTab === 'room'}" data-tab="room">Room</button><button role="tab" aria-selected="${inspTab === 'light'}" data-tab="light">Light</button>${mobile ? `<span style="flex:1"></span><button class="icon-btn" id="inspX" aria-label="Close inspector">${ic('x')}</button>` : ''}</div>`;
      let h = '';
      if (inspTab === 'item' && rec) {
        const it = ND.itemById[rec.item], sc = it.scalable ? rec.scale || 1 : 1, price = itemCost(rec);
        const room = p.rooms.find(r => r.id === rec.room);
        h = `<div class="insp-sec">${it.photo ? `<img class="insp-photo" src="img/${it.photo}.webp" alt="Product photo of the ${esc(it.name)}">` : `<img class="insp-photo" data-thumb="${it.id}" data-mat="${rec.primary}" alt="" style="object-fit:contain;background:#FBF9F4">`}
          <div><p class="label">${esc(it.cat)} · ${esc(room ? room.name : '')}</p><h3 class="h3" style="margin-top:4px">${esc(it.name)}</h3><p class="small muted" style="margin-top:4px">${esc(it.desc || '')}</p></div>
          <div class="kv"><span>Price</span><b class="num" style="font-weight:500;font-size:28px;line-height:1" aria-live="polite">${money(price)}</b></div>
          <dl class="spec"><div><dt>Width</dt><dd>${len(it.w * sc)}</dd></div><div><dt>Depth</dt><dd>${len(it.d)}</dd></div><div><dt>Height</dt><dd>${len(it.h)}</dd></div><div><dt>Finishes</dt><dd>${it.primaryOpts.length}</dd></div>${it.light ? `<div><dt>Light</dt><dd>${p.atmos.warmth} K</dd></div>` : ''}<div><dt>Rotation</dt><dd>${Math.round(((rec.rot * 180 / Math.PI) % 360 + 360) % 360)}°</dd></div></dl></div>
        <div class="insp-sec"><p class="label">${ND.MAT[rec.primary].kind === 'fabric' ? 'Fabric' : 'Finish'} · ${it.primaryOpts.length} option${it.primaryOpts.length > 1 ? 's' : ''}</p><div class="variants" role="group" aria-label="Variants">${it.primaryOpts.map((k, i) => `<button class="variant" data-p="${k}" aria-pressed="${k === rec.primary}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="c" style="background:${ND.MAT[k].color}"></span><span>${esc(ND.MAT[k].name)}</span><span class="p">${money(ND.itemPrice(it, k, rec.scale))}</span></button>`).join('')}</div>
          ${it.secondaryOpts ? `<p class="label">Frame · ${esc(ND.MAT[rec.secondary || it.secondary].name)}</p>${swatches(it.secondaryOpts, rec.secondary || it.secondary, 's')}` : ''}</div>
        <div class="insp-sec">${it.scalable ? `<label class="mini-field" for="scl"><span>Width</span><output id="sclO">${len(it.w * sc)}</output></label><input type="range" id="scl" min="0.6" max="1.6" step="0.05" value="${sc}">` : ''}
          <label class="mini-field" for="rot"><span>Rotation</span><output id="rotO">${Math.round(((rec.rot * 180 / Math.PI) % 360 + 360) % 360)}°</output></label><input type="range" id="rot" min="0" max="345" step="15" value="${Math.round(((rec.rot * 180 / Math.PI) % 360 + 360) % 360)}">
          <div class="acts-row"><button class="btn ghost sm" id="rl" aria-label="Rotate left 15 degrees" title="Rotate left">${ic('rotL', 16)}</button><button class="btn ghost sm" id="rr" aria-label="Rotate right 15 degrees" title="Rotate right (R)">${ic('rotR', 16)}</button><button class="btn ghost sm" id="dup" aria-label="Duplicate" title="Duplicate">${ic('copy', 16)}</button><button class="btn danger sm" id="del" aria-label="Delete" title="Delete">${ic('trash', 16)}</button></div>
          <button class="link small" id="sim" style="justify-self:start">More ${esc(it.cat.toLowerCase())}</button>
          ${it.light ? `<label class="switch"><span>Lamp on</span><input type="checkbox" id="lon" ${rec.off ? '' : 'checked'}></label>` : ''}
          ${p.rooms.length > 1 ? `<label class="mini-field" for="mv"><span>Move to room</span></label><select class="input" id="mv">${p.rooms.map(r => `<option value="${r.id}" ${r.id === rec.room ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select>` : ''}</div>`;
      } else if (inspTab === 'light') {
        const At = p.atmos;
        h = `<div class="insp-sec"><p class="label">Light</p><h3 class="h3">${ND.fmtTime(At.time)}, ${ND.timeLabel(At.time)}</h3><p class="small muted">Drag the dial under the room to change the hour.</p></div>
        <div class="insp-sec"><label class="mini-field" for="wk"><span>Bulb warmth</span><output id="wkO">${At.warmth} K</output></label><input type="range" id="wk" min="2200" max="5000" step="100" value="${At.warmth}"><div class="kv small"><span>Candle</span><span>Daylight</span></div>
          <span class="label">Lamps</span><div class="seg" id="lmp">${['auto', 'on', 'off'].map(x => `<button aria-pressed="${At.lamps === x}" data-v="${x}">${x === 'auto' ? 'Auto at dusk' : x === 'on' ? 'Always on' : 'Off'}</button>`).join('')}</div>
          <label class="switch"><span>Sunlight</span><input type="checkbox" id="sun" ${At.sun !== false ? 'checked' : ''}></label></div>
        <div class="insp-sec"><span class="label">Window view</span><div class="swatches">${ND.VIEWS.map(w => `<button class="swatch sq" style="${w.img ? `background-image:url(img/${w.img}.webp)` : 'background:linear-gradient(#DCE6EC,#F3EFE8)'}" data-view="${w.id}" aria-pressed="${At.view === w.id}" aria-label="${esc(w.name)}" title="${esc(w.name)}"></button>`).join('')}</div>
          <label class="mini-field" for="ww"><span>Main window width</span><output id="wwO">${len(At.windowW || 1.4)}</output></label><input type="range" id="ww" min="0.8" max="2.6" step="0.1" value="${At.windowW || 1.4}"></div>`;
      } else {
        const room = (roomFocus !== 'all' && p.rooms.find(r => r.id === roomFocus)) || p.rooms[0]; const c = costs(p).rooms.find(x => x.room.id === room.id);
        h = `<div class="insp-sec"><p class="label">Room</p>${p.rooms.length > 1 ? `<select class="input" id="rsel" aria-label="Room">${p.rooms.map(r => `<option value="${r.id}" ${r.id === room.id ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select>` : `<h3 class="h3">${esc(room.name)}</h3>`}
          <div class="kv"><span>Size</span><span class="num">${len(room.w)} × ${len(room.d)} · ${A.area(room.w * room.d)}</span></div><div class="kv"><span>Pieces</span><span class="num">${c.items.length}</span></div><div class="kv"><span>Spent</span><span class="num">${money(c.spent)} of ${money(room.budget)}</span></div><div class="meter ${c.spent > room.budget ? 'over' : ''}"><i style="width:${Math.min(100, c.spent / (room.budget || 1) * 100)}%"></i></div></div>
        <div class="insp-sec"><p class="label">Walls · ${esc((ND.WALLS.find(w => w.id === room.wall) || {}).name || '')}</p><div class="swatches">${ND.WALLS.map(w => `<button class="swatch" style="background:${w.color}" data-wall="${w.id}" aria-pressed="${room.wall === w.id}" aria-label="${esc(w.name)}" title="${esc(w.name)}"></button>`).join('')}</div>
          <p class="label">Floor · ${esc(ND.FLOORS[room.floor].name)}</p><div class="swatches">${Object.entries(ND.FLOORS).map(([k, f]) => `<button class="swatch sq" style="${f.tex ? `background-image:url(img/${f.tex}.webp)` : `background:${f.color}`}" data-floor="${k}" aria-pressed="${room.floor === k}" aria-label="${esc(f.name)}" title="${esc(f.name)}"></button>`).join('')}</div>
          <button class="btn ghost sm" id="allR" ${p.rooms.length < 2 ? 'hidden' : ''}>Apply walls and floor to every room</button></div>
        <div class="insp-sec"><p class="label">In this room</p>${c.items.length ? `<div style="display:grid">${c.items.map(x => `<button class="btn quiet sm" style="justify-content:space-between;padding:0" data-pick="${x.rec.uid}"><span>${esc(ND.itemById[x.rec.item].name)}</span><span class="num muted">${money(x.cost)}</span></button>`).join('')}</div>` : '<p class="small muted">Empty. Add pieces from the library.</p>'}${c.items.length ? '<button class="btn ghost sm" id="clrR">Clear this room</button>' : ''}</div>`;
        I.dataset.room = room.id;
      }
      I.innerHTML = tabs + h; A.lazyThumbs(I);
      $$('[data-tab]', I).forEach(b => b.onclick = () => { inspTab = b.dataset.tab; paintInsp(); });
      const ix = $('#inspX', I); if (ix) ix.onclick = () => setPanel('insp', false);
      if (inspTab === 'item' && rec) bindItem(I, rec); else if (inspTab === 'light') bindLight(I); else bindRoom(I);
    }
    function refresh(rec, label) { if (st.ok) st.refreshItem(rec); commit(label); paintInsp(); }
    function bindItem(I, rec) {
      const it = ND.itemById[rec.item];
      $$('[data-p]', I).forEach(b => b.onclick = () => { const before = itemCost(rec); rec.primary = b.dataset.p; refresh(rec, 'Material'); const d = itemCost(rec) - before; if (d) toast(ND.MAT[rec.primary].name + ' · ' + (d > 0 ? '+' : '−') + money(Math.abs(d))); });
      $$('[data-s]', I).forEach(b => b.onclick = () => { rec.secondary = b.dataset.s; refresh(rec, 'Frame'); });
      const scl = $('#scl', I); if (scl) { scl.oninput = () => { rec.scale = +scl.value; $('#sclO', I).textContent = len(it.w * rec.scale); if (st.ok) st.refreshItem(rec); paintBar(); }; scl.onchange = () => { if (st.ok) st.clampToRooms(rec); refresh(rec, 'Resize'); }; }
      const rot = $('#rot', I); rot.oninput = () => { rec.rot = +rot.value * Math.PI / 180; $('#rotO', I).textContent = rot.value + '°'; if (st.ok) { st.placeHolder(st.meshes[rec.uid], rec); st.dirty = true; } }; rot.onchange = () => commit('Rotate');
      $('#rl', I).onclick = () => rotateBy(rec, -1); $('#rr', I).onclick = () => rotateBy(rec, 1);
      $('#dup', I).onclick = () => duplicate(rec); $('#del', I).onclick = () => remove(rec);
      $('#sim', I).onclick = () => { cat = it.cat; q = ''; $('#lq', v).value = ''; paintCats(); paintLib(); if (mobile) openSheet('rail'); else setPanel('rail', true); $('#lib', v).scrollTop = 0; };
      const lon = $('#lon', I); if (lon) lon.onchange = () => { rec.off = !lon.checked; if (st.ok) st.applyAtmos(); commit('Lamp'); };
      const mv = $('#mv', I); if (mv) mv.onchange = () => { const r = p.rooms.find(x => x.id === mv.value); rec.room = r.id; rec.x = r.x + r.w / 2; rec.z = r.z + r.d / 2; if (st.ok) { st.clampToRooms(rec); st.refreshItem(rec); st.frameRoom(r.id, true); } roomFocus = r.id; paintRooms(); commit('Move room'); paintInsp(); };
    }
    function bindRoom(I) {
      const room = p.rooms.find(r => r.id === I.dataset.room);
      const rsel = $('#rsel', I); if (rsel) rsel.onchange = () => { roomFocus = rsel.value; paintRooms(); if (st.ok) st.frameRoom(roomFocus, true); paintInsp(); };
      $$('[data-wall]', I).forEach(b => b.onclick = () => { room.wall = b.dataset.wall; rebuildRooms(); commit('Wall colour'); paintInsp(); });
      $$('[data-floor]', I).forEach(b => b.onclick = () => { room.floor = b.dataset.floor; rebuildRooms(); commit('Floor'); paintInsp(); });
      $('#allR', I).onclick = () => { p.rooms.forEach(r => { r.wall = room.wall; r.floor = room.floor; }); rebuildRooms(); commit('All rooms'); toast('Applied to every room'); };
      $$('[data-pick]', I).forEach(b => b.onclick = () => select(b.dataset.pick));
      const cr = $('#clrR', I); if (cr) cr.onclick = () => { const gone = p.items.filter(i => i.room === room.id); p.items = p.items.filter(i => i.room !== room.id); if (st.ok) st.buildItems(); commit('Clear room'); paintInsp(); toast(gone.length + ' pieces removed from ' + room.name, { action: undo }); };
    }
    function rebuildRooms() { if (st.ok) { st.buildRooms(); st.applyAtmos(); } }
    function bindLight(I) {
      const At = p.atmos;
      $$('[data-mood]', I).forEach(b => b.onclick = () => applyMood(b.dataset.mood));
      const wk = $('#wk', I); wk.oninput = () => { At.warmth = +wk.value; $('#wkO', I).textContent = At.warmth + ' K'; st.ok && st.applyAtmos(); }; wk.onchange = () => commit('Warmth');
      $$('#lmp button', I).forEach(b => b.onclick = () => { At.lamps = b.dataset.v; st.ok && st.applyAtmos(); commit('Lamps'); paintInsp(); });
      $('#sun', I).onchange = (e) => { At.sun = e.target.checked; st.ok && st.applyAtmos(); commit('Sun'); };
      $$('[data-view]', I).forEach(b => b.onclick = () => { At.view = b.dataset.view; st.ok && st.applyView(); commit('View'); paintInsp(); });
      const ww = $('#ww', I); ww.oninput = () => { $('#wwO', I).textContent = len(+ww.value); }; ww.onchange = () => { At.windowW = +ww.value; rebuildRooms(); if (st.ok && st.look === 'sketch') st.applyLook2(); commit('Window'); };
    }
    function applyMood(id) { const m = MOODS.find(x => x.id === id); Object.assign(p.atmos, { warmth: m.warmth, lamps: m.lamps }); if (st.ok) { st.applyAtmos(); st.animateTime(m.time, 800); st.off('timeDone'); st.on('timeDone', () => { commit('Mood'); paintDial(); if (inspTab === 'light') paintInsp(); }); } else { p.atmos.time = m.time; commit('Mood'); } toast(m.name); }

    // ----- manipulation -----
    function rotateBy(rec, dir) { rec.rot = (rec.rot || 0) + dir * Math.PI / 12; if (st.ok) { st.placeHolder(st.meshes[rec.uid], rec); st.dirty = true; } commit('Rotate'); paintInsp(); }
    function duplicate(rec) { const c = { ...rec, uid: NStore.uidGen('i'), x: rec.x + 0.4, z: rec.z + 0.4 }; if (st.ok) st.clampToRooms(c); p.items.push(c); if (st.ok) { st.addItemMesh(c); st.applyAtmos(); if (st.look === 'sketch') st.applyLook2(); } commit('Duplicate'); select(c.uid); if (st.ok) st.pop(c.uid); toast('Duplicated · ' + money(itemCost(c))); }
    function remove(rec) { const i = p.items.indexOf(rec); p.items.splice(i, 1); if (st.ok) st.removeItem(rec.uid); commit('Delete'); select(null); const name = ND.itemById[rec.item].name;
      toast(name + ' removed', { action: () => { p.items.splice(i, 0, rec); if (st.ok) { st.addItemMesh(rec); st.applyAtmos(); if (st.look === 'sketch') st.applyLook2(); } commit('Restore'); select(rec.uid); } }); }
    function nudge(rec, dx, dz) { rec.x += dx; rec.z += dz; if (st.ok) { st.clampToRooms(rec); st.placeHolder(st.meshes[rec.uid], rec); st.select(rec.uid, true); } }

    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && document.activeElement.type !== 'range') return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
      const rec = selected && recOf(selected); if (!rec) return;
      if (document.activeElement.type === 'range') return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(rec); }
      else if (e.key.toLowerCase() === 'r' && !mod) { rotateBy(rec, e.shiftKey ? -1 : 1); }
      else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicate(rec); }
      else if (e.key === 'Escape') select(null);
      else if (e.key.startsWith('Arrow')) { e.preventDefault(); const s = e.shiftKey ? 0.25 : 0.05; nudge(rec, e.key === 'ArrowLeft' ? -s : e.key === 'ArrowRight' ? s : 0, e.key === 'ArrowUp' ? -s : e.key === 'ArrowDown' ? s : 0); clearTimeout(nudge.t); nudge.t = setTimeout(() => commit('Nudge'), 400); }
    };
    window.addEventListener('keydown', onKey);

    // ----- the dusk dial -----
    const dial = $('#dial', v);
    const paintKnob = bindRuler(dial, () => p.atmos.time, (t) => { p.atmos.time = t; st.ok && st.applyAtmos(); paintDial(); }, () => commit('Time'));
    function paintDial() { paintKnob(); $('#dT', v).textContent = ND.fmtTime(p.atmos.time); $('#dLab', v).textContent = ND.timeLabel(p.atmos.time); }
    paintDial();
    $$('.dusk-dial .phase', v).forEach(b => b.onclick = () => applyMood(b.dataset.mood));
    let playT = null; const playB = $('#play', v);
    function stopPlay(save) { if (!playT) return; cancelAnimationFrame(playT); playT = null; playB.setAttribute('aria-pressed', 'false'); playB.setAttribute('aria-label', 'Play a full day'); $('#playP', v).setAttribute('d', 'M8 5l11 7-11 7z'); if (save) commit('Time'); }
    playB.onclick = () => { if (playT) return stopPlay(true); if (!st.ok) return; playB.setAttribute('aria-pressed', 'true'); playB.setAttribute('aria-label', 'Pause'); $('#playP', v).setAttribute('d', 'M8 5v14M16 5v14'); const t0 = p.atmos.time; let last = performance.now(), run = 0; const step = (n) => { const dt = (n - last) / 1000; last = n; run += dt * 2.4; p.atmos.time = (t0 + run) % 24; st.applyAtmos(); if (run >= 24) { p.atmos.time = t0; st.applyAtmos(); return stopPlay(false); } playT = requestAnimationFrame(step); }; playT = requestAnimationFrame(step); };
    dial.addEventListener('pointerdown', () => stopPlay(false));
    if (st.ok) st.on('atmos', () => { $('#dT', v) && paintDial(); });

    paintInsp();
    // dimension lines pinned to the selected piece (Cartier Roadster, PDA Architecture)
    const dimo = $('#dimo', v);
    function paintDims() {
      const rec = selected && recOf(selected);
      if (!st.ok || !rec || st.mode !== 'edit') { dimo.innerHTML = ''; return; }
      const it = ND.itemById[rec.item], sc = it.scalable ? rec.scale || 1 : 1, w = it.w * sc, d = it.d, y = (st.meshes[rec.uid] ? st.meshes[rec.uid].position.y : 0) + 0.01;
      const c = Math.cos(rec.rot || 0), s = Math.sin(rec.rot || 0);
      const P = (lx, lz) => st.screenOf(new THREE.Vector3(rec.x + lx * c + lz * s, y, rec.z - lx * s + lz * c));
      const off = 0.18, seg = (a, b, label) => { if (a.behind || b.behind) return ''; const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, ang = Math.atan2(b.y - a.y, b.x - a.x), nx = -Math.sin(ang) * 5, ny = Math.cos(ang) * 5, tw = label.length * 6.6 + 12;
        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><line class="tk" x1="${a.x - nx}" y1="${a.y - ny}" x2="${a.x + nx}" y2="${a.y + ny}"/><line class="tk" x1="${b.x - nx}" y1="${b.y - ny}" x2="${b.x + nx}" y2="${b.y + ny}"/><rect x="${mx - tw / 2}" y="${my - 9}" width="${tw}" height="18" rx="2"/><text x="${mx}" y="${my + 4}" text-anchor="middle">${label}</text>`; };
      dimo.innerHTML = seg(P(-w / 2, d / 2 + off), P(w / 2, d / 2 + off), len(w)) + seg(P(w / 2 + off, -d / 2), P(w / 2 + off, d / 2), len(d));
    }
    if (st.ok) { st.on('frame', paintDims); st.on('dragging', paintDims); }

    return () => {
      document.body.classList.remove('in-editor'); window.removeEventListener('keydown', onKey); offStore(); if (playT) cancelAnimationFrame(playT);
      if (st.ok) { try { st.select(null, true); p.thumb = st.capture(640, 400, 'image/jpeg', 0.78); NStore.saveProject(p, { now: true }); } catch (e) {} ['select', 'moved', 'drop', 'atmos', 'frame', 'timeDone', 'dragging'].forEach(e => st.off(e)); }
    };
  };

  // ============ 12 BUDGET ============
  routes.budget = (v) => {
    const p = needProject(); if (!p) return;
    function paint() {
      const c = costs(p);
      // cheapest material swap per piece
      const swaps = p.items.map(rec => { const it = ND.itemById[rec.item]; const cheapest = it.primaryOpts.reduce((a, b) => ND.itemPrice(it, a, rec.scale) <= ND.itemPrice(it, b, rec.scale) ? a : b); const save = itemCost(rec) - ND.itemPrice(it, cheapest, rec.scale); return { rec, it, cheapest, save }; }).filter(s => s.save > 0).sort((a, b) => b.save - a.save).slice(0, 4);
      v.innerHTML = `${A.topbar('')}<main class="page" id="main"><div class="page-head"><p class="label"><a href="#editor">${esc(p.name)}</a> · Budget overview</p><h1 class="h1">Budget</h1><a class="btn ghost" href="#editor">${ic('back', 16)} Back to the room</a></div>
<div class="two-col"><div>
<div style="display:flex;align-items:baseline;gap:24px;flex-wrap:wrap;margin-bottom:12px"><span class="budget-big" id="bbig" style="${c.over ? 'color:var(--danger)' : ''}">${money(c.spent)}</span><span class="lede">of ${money(c.budget)} · <b>${c.over ? money(-c.left) + ' over' : money(c.left) + ' left'}</b></span></div>
<div class="meter ${c.over ? 'over' : c.pct >= 0.8 ? 'warn' : ''}" style="margin-bottom:56px" role="img" aria-label="${Math.round(c.pct * 100)} percent of budget used"><i style="width:${Math.min(100, c.pct * 100)}%"></i></div>
<h2 class="h3" style="margin-bottom:8px">By room</h2>
${c.rooms.map(r => `<div class="room-budget"><div><b>${esc(r.room.name)}</b><div class="small muted num">${money(r.spent)} spent · ${r.items.length} pieces</div></div><div><div class="meter ${r.spent > r.room.budget ? 'over' : r.spent >= r.room.budget * 0.8 ? 'warn' : ''}"><i style="width:${Math.min(100, r.spent / (r.room.budget || 1) * 100)}%"></i></div><span class="small" style="color:${r.spent > r.room.budget ? 'var(--danger)' : r.spent >= r.room.budget * 0.8 ? 'var(--ink)' : 'var(--ink-3)'}">${r.spent > r.room.budget ? 'Over by ' + money(r.spent - r.room.budget) : Math.round(r.spent / (r.room.budget || 1) * 100) + '% used' + (r.spent >= r.room.budget * 0.8 ? ' · close to the limit' : '')}</span></div><label class="sr" for="rb${r.room.id}">${esc(r.room.name)} budget</label><span class="money-in"><span aria-hidden="true">${money(0).replace(/[\d.,\s]/g, '')}</span><input class="input num" id="rb${r.room.id}" data-rb="${r.room.id}" type="number" min="0" step="50" value="${r.room.budget}"></span></div>`).join('')}
<h2 class="h3" style="margin:56px 0 8px">Every piece</h2>
<table class="btable"><thead><tr><th>Piece</th><th class="hide-m">Room</th><th class="hide-m">Material</th><th class="r">Price</th></tr></thead><tbody>${c.rooms.flatMap(r => r.items.map(x => { const it = ND.itemById[x.rec.item]; return `<tr><td>${esc(it.name)}${it.scalable && x.rec.scale !== 1 ? ` <span class="muted small">· ${len(it.w * x.rec.scale)} wide</span>` : ''}</td><td class="hide-m muted">${esc(r.room.name)}</td><td class="hide-m muted">${esc(ND.MAT[x.rec.primary].name)}</td><td class="r">${money(x.cost)}</td></tr>`; })).join('') || '<tr><td colspan="4" class="muted">No pieces yet.</td></tr>'}</tbody><tfoot><tr><td>Total</td><td class="hide-m"></td><td class="hide-m"></td><td class="r">${money(c.spent)}</td></tr></tfoot></table>
</div><aside style="display:grid;gap:24px;align-content:start">
<div style="border:1px solid ${c.over ? 'var(--danger)' : 'var(--rule)'};padding:20px;display:grid;gap:8px"><span class="label" style="${c.over ? 'color:var(--danger)' : c.pct >= 0.8 ? 'color:var(--ink)' : ''}">${c.over ? 'Over budget' : c.pct >= 0.8 ? Math.round(c.pct * 100) + '% used' : 'On track'}</span><p>${c.over ? `Swap a finish or raise a room's budget to close the ${money(-c.left)} gap.` : `${money(c.left)} left to spend across ${p.rooms.length} room${p.rooms.length > 1 ? 's' : ''}.`}</p></div>
<div><h2 class="h3" style="margin-bottom:8px">Swap for less</h2>${swaps.length ? `<div class="quick">${swaps.map((s, i) => `<button data-sw="${i}"><span>${esc(s.it.name)} in ${esc(ND.MAT[s.cheapest].name)}</span><span class="num" style="color:var(--ok)">−${money(s.save)}</span></button>`).join('')}</div><p class="small muted" style="margin-top:8px">Saves ${money(swaps.reduce((a, s) => a + s.save, 0))} in total.</p>` : '<p class="small muted">Every piece is already in its least expensive finish.</p>'}</div>
<button class="btn ghost" id="csv">${ic('download', 16)} Download shopping list (.csv)</button></aside></div></main>`;
      $$('[data-rb]', v).forEach(inp => inp.onchange = () => { const n = Math.max(0, Math.round(+inp.value || 0)); p.rooms.find(r => r.id === inp.dataset.rb).budget = n; NStore.saveProject(p); paint(); toast('Budget updated'); $('#rb' + inp.dataset.rb, v).focus(); });
      $$('[data-sw]', v).forEach(b => b.onclick = () => { const s = swaps[+b.dataset.sw]; const old = s.rec.primary; s.rec.primary = s.cheapest; NStore.saveProject(p); paint(); toast('Switched to ' + ND.MAT[s.cheapest].name + ' · saved ' + money(s.save), { action: () => { s.rec.primary = old; NStore.saveProject(p); paint(); } }); });
      $('#csv', v).onclick = () => A.saveFile(slug(p.name) + '-shopping-list.csv', shoppingCSV(p), 'text/csv');
    }
    paint(); A.countUp($('#bbig', v), costs(p).spent);
  };
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'nocturne';
  function shoppingCSV(p) {
    const rows = [['Room', 'Piece', 'Category', 'Material', 'Width (cm)', 'Depth (cm)', 'Height (cm)', 'Price']];
    costs(p).rooms.forEach(r => r.items.forEach(x => { const it = ND.itemById[x.rec.item]; const sc = it.scalable ? x.rec.scale || 1 : 1; rows.push([r.room.name, it.name, it.cat, ND.MAT[x.rec.primary].name, Math.round(it.w * sc * 100), Math.round(it.d * 100), Math.round(it.h * 100), x.cost]); }));
    rows.push(['', 'Total', '', '', '', '', '', costs(p).spent]);
    return rows.map(r => r.map(c => /[",\n]/.test(String(c)) ? '"' + String(c).replace(/"/g, '""') + '"' : c).join(',')).join('\n');
  }

  // ============ 13 PROJECT PREVIEW ============
  routes.preview = (v) => {
    const p = needProject(); if (!p) return; const st = A.getStage(); const c = costs(p); const sty = ND.STYLES.find(s => s.id === p.style) || {};
    v.innerHTML = `${A.topbar('')}<main class="page" id="main"><div class="page-head"><p class="label">Project preview · ${esc(sty.name || '')} · ${ND.LAYOUTS.find(l => l.id === p.layout).name}</p><h1 class="h1">${esc(p.name)}</h1><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn ghost" href="#editor">Edit</a><a class="btn ghost" href="#walk">${ic('walk', 16)} Walk through</a><a class="btn" href="#share">${ic('share', 16)} Share</a></div></div>
<div class="two-col"><div style="display:grid;gap:40px"><div class="preview-hero stage" id="pv" style="position:relative"><div class="tags on" id="rl"></div></div>
<div><h2 class="h3" style="margin-bottom:16px">Through the day</h2><div class="time-strip" id="ts">${[7.5, 12, 17.5, 21.5].map((t, i) => `<figure><img alt="${esc(p.name)} at ${ND.fmtTime(t)}" data-t="${t}"><figcaption><b style="font-weight:500">${ND.timeLabel(t).replace(/^./, c => c.toUpperCase())}</b> <span class="num muted">${ND.fmtTime(t)}</span></figcaption></figure>`).join('')}</div></div></div>
<aside style="display:grid;gap:24px;align-content:start"><div class="stat-row" style="grid-template-columns:1fr 1fr"><div><span class="label">Spend</span><b>${money(c.spent)}</b></div><div><span class="label">Pieces</span><b>${p.items.length}</b></div></div>
<div>${p.rooms.map(r => `<div class="kv" style="padding:10px 0;border-bottom:1px solid var(--rule)"><span>${esc(r.name)}</span><span class="num">${len(r.w)} × ${len(r.d)}</span></div>`).join('')}</div>
<div class="kv"><span>Walls</span><span>${esc((ND.WALLS.find(w => w.id === p.rooms[0].wall) || {}).name || '')}</span></div><div class="kv"><span>Floor</span><span>${esc(ND.FLOORS[p.rooms[0].floor].name)}</span></div><div class="kv"><span>Light</span><span>${ND.fmtTime(p.atmos.time)} · ${p.atmos.warmth} K</span></div>
<div class="kv"><span>Last edited</span><span>${A.ago(p.updated)}</span></div><a class="btn ghost" href="#budget">Budget details</a></aside></div></main>`;
    const host = $('#pv', v);
    if (!st.ok || !st.mount(host)) { webglFallback(host, p); return; }
    st.setMode('view'); st.controls.enabled = true; st.setProject(p); st.frameRoom(null, false, 'dollhouse'); st.select(null, true);
    $('#rl', v).innerHTML = c.rooms.map(r => `<a class="tag-pin" href="#walk" data-room="${r.room.id}" style="pointer-events:auto;text-decoration:none"><i></i>${esc(r.room.name)} · ${money(r.spent)}</a>`).join('');
    const pins = $$('#rl .tag-pin', v); pins.forEach(a => a.onclick = () => { st.walkRoom = a.dataset.room; });
    st.off('frame'); st.on('frame', () => p.rooms.forEach((r, i) => { const s = st.screenOf(new THREE.Vector3(r.x + r.w / 2, 0.4, r.z + r.d / 2)); pins[i].style.transform = `translate(${s.x}px, ${s.y}px)`; }));
    // stills at four times of day, rendered from the same camera, then the room returns to its saved time
    setTimeout(() => {
      const t0 = p.atmos.time; $$('#ts img', v).forEach(im => { p.atmos.time = +im.dataset.t; st.applyAtmos(); im.src = st.capture(640, 400, 'image/jpeg', 0.8); });
      p.atmos.time = t0; st.applyAtmos();
    }, 250);
    return () => { st.off('frame'); const wr = st.walkRoom; st.setMode('edit'); st.walkRoom = wr; };
  };

  // ============ 15 WALKTHROUGH ============
  routes.walk = (v) => {
    const p = needProject(); if (!p) return; const st = A.getStage(); const startRoomHint = st.walkRoom;
    v.innerHTML = `<div class="walkfs"><div class="stage" id="wk"></div>
<div class="walk-top"><a class="btn sm" href="#editor">${ic('x', 16)} Exit walkthrough</a><div class="chip"><label for="wr" class="sr">Room</label><select id="wr">${p.rooms.map(r => `<option value="${r.id}">${esc(r.name)}</option>`).join('')}</select><span id="wt" class="num"></span></div></div>
<p class="walk-tip" id="tip" style="opacity:0">Drag to look · W A S D or arrows to walk</p>
<div class="chapter" id="chap"></div>
<div class="enter" id="ent"><div><p class="label">Walkthrough</p><h1 class="h2">Which room?</h1><div class="quick">${p.rooms.map((r, i) => `<button data-enter="${r.id}" ${r.id === startRoomHint ? 'data-first' : ''}><span>${esc(r.name)}</span><span class="small muted">${A.area(r.w * r.d)}</span></button>`).join('')}</div><p class="small muted">Drag to look. W A S D or arrows to walk.</p></div></div>
<div class="float miniplan" id="mini"></div>
<div class="walk-hud"><div class="seg wseg" id="wv" aria-label="View"><button aria-pressed="true" data-v="walk">Walk</button><button aria-pressed="false" data-v="dollhouse">Dollhouse</button><button aria-pressed="false" data-v="top">Plan</button></div><div class="pad" aria-label="Movement">${[['tl', 'Turn left'], ['f', 'Forward', 'up'], ['tr', 'Turn right'], ['l', 'Step left', 'left'], ['b', 'Back', 'down'], ['r', 'Step right', 'right']].map(([k, l, i]) => `<button data-j="${k}" aria-label="${l}">${ic(i || k, 18)}</button>`).join('')}</div>
<div class="float dusk-dial" style="position:relative;left:auto;bottom:auto;transform:none;width:min(420px,60vw)"><div class="dial-head"><span class="label">Time of day</span><span class="dial-time"><span id="wtm"></span> <em id="wl"></em></span></div>${ruler('wdial', 'Time of day')}</div></div></div>`;
    const host = $('#wk', v);
    if (!st.ok || !st.mount(host)) { webglFallback(host, p); return; }
    const startRoom = (st.walkRoom && p.rooms.find(r => r.id === st.walkRoom)) ? st.walkRoom : p.rooms[0].id; st.setProject(p); st.walkRoom = startRoom; st.setMode('walk'); st.renderer.domElement.focus();
    const sel = $('#wr', v);
    function chapter() { const i = p.rooms.findIndex(r => r.id === st.walkRoom); $('#chap', v).innerHTML = `<p class="label">${esc(p.rooms[i].name)}</p><p class="h2">${ND.timeLabel(p.atmos.time).replace(/^./, c => c.toUpperCase())}</p>`; }
    function setView(m) { $$('#wv button', v).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === m))); $('.pad', v).style.visibility = m === 'walk' ? 'visible' : 'hidden'; if (m === 'walk') { st.setMode('walk'); } else { st.setMode('view'); st.controls.enabled = true; st.frameRoom(null, true, m); } }
    function enter(id) { const r = p.rooms.find(x => x.id === id); sel.value = id; st.walkRoom = id; setView('walk'); st.enterWalk(r); chapter(); mini(); st.renderer.domElement.focus(); }
    $$('#wv button', v).forEach(b => b.onclick = () => { if (b.dataset.v === 'walk') enter(st.walkRoom); else setView(b.dataset.v); });
    function mini() { const B = st.bounds(), k = 150 / Math.max(B.w, B.d * 1.6); $('#mini', v).innerHTML = `<svg viewBox="0 0 ${B.w * k + 8} ${B.d * k + 8}" width="${B.w * k + 8}" height="${B.d * k + 8}" role="group" aria-label="Plan">${p.rooms.map(r => `<rect tabindex="0" role="button" aria-label="Enter ${esc(r.name)}" data-mr="${r.id}" x="${(r.x - B.minX) * k + 4}" y="${(r.z - B.minZ) * k + 4}" width="${r.w * k}" height="${r.d * k}" class="${r.id === st.walkRoom ? 'on' : ''}"/>`).join('')}<circle id="me" r="3.5"/></svg>`; $$('[data-mr]', v).forEach(el => { el.onclick = () => enter(el.dataset.mr); el.onkeydown = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); enter(el.dataset.mr); } }; }); }
    st.off('frame'); st.on('frame', () => { const me = $('#me', v); if (!me) return; const B = st.bounds(), k = 150 / Math.max(B.w, B.d * 1.6); me.setAttribute('cx', (st.camera.position.x - B.minX) * k + 4); me.setAttribute('cy', (st.camera.position.z - B.minZ) * k + 4); me.style.display = st.mode === 'walk' ? '' : 'none'; });
    mini();
    sel.onchange = () => enter(sel.value);
    $$('[data-enter]', v).forEach(b => b.onclick = () => { $('#ent', v).remove(); enter(b.dataset.enter); const t = $('#tip', v); t.style.opacity = 1; setTimeout(() => { t.style.opacity = 0; }, 4000); });
    $('[data-enter]', v).focus();
    const first = $('[data-first]', v); if (first) first.click();
    $$('[data-j]', v).forEach(b => { const on = (e) => { e.preventDefault(); st.joy = b.dataset.j; }, off = () => { st.joy = null; }; b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off); });
    const pk = bindRuler($('#wdial', v), () => p.atmos.time, (t) => { p.atmos.time = t; st.applyAtmos(); paint(); }, () => NStore.saveProject(p));
    function paint() { pk(); $('#wtm', v).textContent = ND.fmtTime(p.atmos.time); $('#wl', v).textContent = ND.timeLabel(p.atmos.time); if (!$('#ent', v)) chapter(); }
    paint(); const tip = 0;
    const esc2 = (e) => { if (e.key === 'Escape') go('editor'); }; window.addEventListener('keydown', esc2);
    return () => { clearTimeout(tip); window.removeEventListener('keydown', esc2); st.joy = null; st.keys = {}; st.off('frame'); st.setMode('edit'); st.walkRoom = null; };
  };

  // ============ 16 EXPORT / SHARE ============
  routes.share = (v) => {
    const p = needProject(); if (!p) return; const st = A.getStage(); const c = costs(p);
    const summary = `${p.name}\n${(ND.STYLES.find(s => s.id === p.style) || {}).name} · ${ND.LAYOUTS.find(l => l.id === p.layout).name}\n${p.items.length} pieces · ${money(c.spent)} of ${money(c.budget)}\n\n` + c.rooms.map(r => r.room.name + '\n' + r.items.map(x => '  ' + ND.itemById[x.rec.item].name + ' (' + ND.MAT[x.rec.primary].name + ') ' + money(x.cost)).join('\n')).join('\n\n');
    v.innerHTML = `${A.topbar('')}<main class="page" id="main"><div class="page-head"><p class="label"><a href="#editor">${esc(p.name)}</a> · Export & share</p><h1 class="h1">Share this design</h1><a class="btn ghost" href="#editor">${ic('back', 16)} Back to the room</a></div>
<div class="preview-hero" style="margin-bottom:48px"><img id="shot" alt="Rendered view of ${esc(p.name)}"><div class="stage" id="sh" style="position:absolute;inset:0;opacity:0;pointer-events:none"></div></div>
<div class="share-grid">
<div class="share-opt"><h2 class="h3">Image</h2><p class="small muted">1920 × 1080 JPEG.</p><div class="field"><span class="label">Look</span><div class="seg" id="lk"><button aria-pressed="true" data-v="render">Render</button><button aria-pressed="false" data-v="sketch">Sketch</button></div></div><button class="btn" id="dlImg">${ic('download', 16)} Download image</button></div>
<div class="share-opt"><h2 class="h3">Shopping list</h2><p class="small muted">${p.items.length} pieces · ${money(c.spent)}</p><button class="btn ghost" id="dlCsv">${ic('download', 16)} Download .csv</button><button class="btn ghost" id="cpS">${ic('copy', 16)} Copy as text</button></div>
<div class="share-opt"><h2 class="h3">Link</h2><p class="small muted">Opens this design for you on any device you are signed in on.</p><div class="copy-field"><input class="input" id="lnk" readonly value="${esc(location.href.split('#')[0] + '#preview')}" aria-label="Link to this design"><button class="btn ghost" id="cpL">Copy link</button></div></div>
<div class="share-opt"><h2 class="h3">Design file</h2><p class="small muted">Send the file. It opens under Settings, Import.</p><button class="btn ghost" id="dlJson">${ic('download', 16)} Download design file</button></div>
</div></main>`;
    const host = $('#sh', v); let look = 'render';
    function shoot() { if (!st.ok) { $('#shot', v).src = p.thumb || 'img/K3-sketch-rendered.webp'; return; } const was = st.look; st.setLook(look); const u = st.capture(1920, 1080, 'image/jpeg', 0.9); st.setLook(was || 'render'); $('#shot', v).src = u; return u; }
    if (st.ok && st.mount(host)) { st.setMode('view'); st.setProject(p); st.frameRoom(p.rooms[0].id, false); st.select(null, true); setTimeout(shoot, 200); } else shoot();
    $$('#lk button', v).forEach(b => b.onclick = () => { look = b.dataset.v; $$('#lk button', v).forEach(x => x.setAttribute('aria-pressed', String(x === b))); shoot(); });
    $('#dlImg', v).onclick = () => { const u = shoot() || $('#shot', v).src; A.saveFile(slug(p.name) + (look === 'sketch' ? '-sketch' : '') + '.jpg', u, 'image/jpeg'); };
    $('#dlCsv', v).onclick = () => A.saveFile(slug(p.name) + '-shopping-list.csv', shoppingCSV(p), 'text/csv');
    $('#dlJson', v).onclick = () => A.saveFile(slug(p.name) + '.nocturne.json', JSON.stringify({ app: 'nocturne', version: 1, project: { ...p, thumb: null } }), 'application/json');
    $('#cpL', v).onclick = async () => { try { await navigator.clipboard.writeText($('#lnk', v).value); toast('Link copied'); } catch (e) { $('#lnk', v).select(); toast('Press Ctrl C to copy the selected link.'); } };
    $('#cpS', v).onclick = async () => { try { await navigator.clipboard.writeText(summary); toast('Copied the list'); } catch (e) { toast('Copying is blocked here. Use the .csv instead.', { err: true }); } };
    return () => { if (st.ok) st.setMode('edit'); };
  };
})();
