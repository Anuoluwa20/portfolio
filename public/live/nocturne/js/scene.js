/* NOCTURNE — the 3D stage. One WebGL renderer, moved between screens.
   Furniture is built from primitives so nothing has to be downloaded. */
(function () {
  const T = THREE;
  const WALL_H = 2.7, WALL_T = 0.1;
  const SURFACE_H = { 'desk-oak': 0.75, 'desk-standing': 0.75, 'dining-table': 0.75, 'coffee-round': 0.4, 'side-table': 0.5, 'sideboard': 0.62, 'bookshelf': 1.9 };

  // ---------- colour helpers ----------
  const C = (h) => new T.Color(h);
  const lerpC = (a, b, t) => C(a).lerp(C(b), t);
  function keyed(keys, t) { // keys: [[hour, value]], wraps at 24
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
      if (t >= t0 && t <= t1) { const k = (t - t0) / (t1 - t0 || 1); return typeof v0 === 'number' ? v0 + (v1 - v0) * k : lerpC(v0, v1, k); }
    }
    const v = keys[keys.length - 1][1]; return typeof v === 'number' ? v : C(v);
  }
  const SKY = [[0, '#0F1120'], [4.5, '#151628'], [6, '#4A3F5E'], [7, '#D9C3B8'], [9, '#CFDCE3'], [12, '#DCE6EC'], [16, '#E6D8BE'], [17.6, '#F0B977'], [18.8, '#C98C7A'], [19.7, '#8C7FAE'], [20.8, '#3A3560'], [22, '#171828'], [24, '#0F1120']];
  const SUN_COL = [[5, '#FF9A5A'], [7, '#FFC79A'], [10, '#FFF2E2'], [14, '#FFF6EA'], [17, '#FFC27A'], [18.8, '#FF8C55'], [20, '#FF8C55']];
  const AMB = [[0, 0.06], [5, 0.08], [7, 0.45], [11, 0.75], [15, 0.7], [17.5, 0.5], [19, 0.3], [20.5, 0.14], [24, 0.06]];
  const VIEW_TINT = [[0, '#1C1D2E'], [5, '#2B2840'], [7, '#C8B8B4'], [10, '#FFFFFF'], [16, '#FFF2DE'], [18, '#F2B07A'], [19.7, '#8B7FA8'], [21, '#2E2C48'], [24, '#1C1D2E']];

  function kelvinToColor(k) { // 1800–6500 K approximation
    const t = Math.min(1, Math.max(0, (k - 1800) / 4700));
    return lerpC('#FF9F45', '#FFF1E0', Math.min(1, t * 1.6)).lerp(C('#F4F6FF'), Math.max(0, t - 0.6));
  }

  // ---------- materials ----------
  const matCache = {};
  function mat(key, opts = {}) {
    const id = key + JSON.stringify(opts);
    if (matCache[id]) return matCache[id];
    const m = ND.MAT[key] || { color: key, rough: 0.7 };
    const mm = new T.MeshStandardMaterial({ color: C(m.color), roughness: m.rough ?? 0.7, metalness: m.metal || 0, ...opts });
    mm.userData.key = key;
    return (matCache[id] = mm);
  }
  const plainMat = (hex, rough = 0.8, extra = {}) => new T.MeshStandardMaterial({ color: C(hex), roughness: rough, ...extra });

  // ---------- geometry helpers ----------
  function box(g, w, h, d, m, x, y, z) { const me = new T.Mesh(new T.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; g.add(me); return me; }
  function cyl(g, rt, rb, h, m, x, y, z, seg = 24) { const me = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg), m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; g.add(me); return me; }
  function sph(g, r, m, x, y, z, sx = 1, sy = 1, sz = 1) { const me = new T.Mesh(new T.SphereGeometry(r, 24, 16), m); me.position.set(x, y, z); me.scale.set(sx, sy, sz); me.castShadow = me.receiveShadow = true; g.add(me); return me; }
  function rbox(g, w, h, d, r, m, x, y, z) { // soft-edged box (rounded in plan)
    const s = new T.Shape(); const hw = w / 2, hd = d / 2; r = Math.min(r, hw, hd);
    s.moveTo(-hw + r, -hd); s.lineTo(hw - r, -hd); s.quadraticCurveTo(hw, -hd, hw, -hd + r); s.lineTo(hw, hd - r); s.quadraticCurveTo(hw, hd, hw - r, hd); s.lineTo(-hw + r, hd); s.quadraticCurveTo(-hw, hd, -hw, hd - r); s.lineTo(-hw, -hd + r); s.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
    const geo = new T.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: Math.min(0.04, h / 4), bevelSize: Math.min(0.035, r / 2), bevelSegments: 3, curveSegments: 10 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, -h / 2, 0);
    const me = new T.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; g.add(me); return me;
  }
  function legs(g, w, d, h, m, inset = 0.06, r = 0.022, taper = 0.7) {
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => cyl(g, r * taper, r, h, m, sx * (w / 2 - inset), h / 2, sz * (d / 2 - inset), 10));
  }

  // ---------- furniture builders (local origin at floor centre, front faces +z) ----------
  const B = {
    sofaCurve(it, p, s) { const g = new T.Group(), f = mat(p), w = mat(s); const W = it.w, D = it.d;
      rbox(g, W, 0.05, D * 0.92, 0.3, w, 0, 0.03, 0);
      rbox(g, W, 0.24, D, 0.42, f, 0, 0.2, 0);
      rbox(g, W * 0.94, 0.12, D * 0.7, 0.3, f, 0, 0.38, 0.06);
      rbox(g, W, 0.36, 0.26, 0.13, f, 0, 0.56, -D / 2 + 0.13);
      [-1, 1].forEach(sx => rbox(g, 0.26, 0.28, D * 0.95, 0.13, f, sx * (W / 2 - 0.13), 0.45, 0));
      return g; },
    sofaModular(it, p, s, sc) { const g = new T.Group(), f = mat(p); const n = Math.max(1, Math.round(2 * sc)); const uw = (it.w * sc) / n, D = it.d;
      for (let i = 0; i < n; i++) { const x = -it.w * sc / 2 + uw / 2 + i * uw; rbox(g, uw - 0.02, 0.4, D, 0.06, f, x, 0.21, 0); rbox(g, uw - 0.04, 0.12, D - 0.25, 0.06, f, x, 0.46, 0.1); rbox(g, uw - 0.02, 0.38, 0.22, 0.06, f, x, 0.56, -D / 2 + 0.11); }
      return g; },
    sofaBox(it, p, s) { const g = new T.Group(), f = mat(p), w = mat(s); const W = it.w, D = it.d;
      legs(g, W, D, 0.14, w, 0.08, 0.02); rbox(g, W, 0.22, D, 0.05, f, 0, 0.25, 0); rbox(g, W - 0.3, 0.12, D - 0.2, 0.05, f, 0, 0.42, 0.08);
      rbox(g, W, 0.36, 0.2, 0.05, f, 0, 0.56, -D / 2 + 0.1); [-1, 1].forEach(sx => rbox(g, 0.16, 0.2, D, 0.05, f, sx * (W / 2 - 0.08), 0.46, 0)); return g; },
    loungeChair(it, p, s) { const g = new T.Group(), f = mat(p), w = mat(s); const W = it.w, D = it.d;
      legs(g, W - 0.04, D - 0.06, 0.38, w, 0.04, 0.02, 0.8);
      [-1, 1].forEach(sx => box(g, 0.05, 0.035, D * 0.82, w, sx * (W / 2 - 0.03), 0.6, 0.02));
      rbox(g, W - 0.12, 0.12, D - 0.14, 0.12, f, 0, 0.42, 0.04);
      const back = rbox(g, W - 0.1, 0.5, 0.1, 0.05, f, 0, 0.66, -D / 2 + 0.12); back.rotation.x = -0.18; return g; },
    diningChair(it, p) { const g = new T.Group(), w = mat(p), cord = plainMat('#C6A97F', 0.95); const W = it.w, D = it.d;
      legs(g, W, D, 0.45, w, 0.04, 0.018, 0.85); box(g, W - 0.04, 0.035, D - 0.04, cord, 0, 0.46, 0);
      [-1, 1].forEach(sx => cyl(g, 0.016, 0.018, 0.35, w, sx * (W / 2 - 0.04), 0.64, -D / 2 + 0.04, 8));
      for (let i = -1.5; i <= 1.5; i++) cyl(g, 0.008, 0.008, 0.26, w, i * 0.07, 0.61, -D / 2 + 0.04, 6);
      box(g, W - 0.06, 0.06, 0.03, w, 0, 0.78, -D / 2 + 0.04); return g; },
    armchair(it, p) { const g = new T.Group(), f = mat(p); const W = it.w, D = it.d;
      rbox(g, W, 0.38, D, 0.4, f, 0, 0.2, 0); rbox(g, W - 0.24, 0.1, D - 0.24, 0.3, f, 0, 0.42, 0.06);
      const arc = new T.Mesh(new T.TorusGeometry(W / 2 - 0.12, 0.12, 12, 24, Math.PI), f); arc.rotation.x = Math.PI / 2; arc.rotation.z = Math.PI; arc.position.set(0, 0.52, 0.02); arc.scale.set(1, D / W, 1.6); arc.castShadow = true; g.add(arc); return g; },
    bedQueen(it, p, s) { const g = new T.Group(), f = mat(p), sheet = mat(s || 'boucle_ivory'); const W = it.w, D = it.d;
      rbox(g, W, 0.3, D, 0.05, f, 0, 0.18, 0.05); rbox(g, W - 0.08, 0.2, D - 0.15, 0.08, sheet, 0, 0.43, 0.08);
      rbox(g, W, 0.95, 0.12, 0.05, f, 0, 0.5, -D / 2 + 0.06);
      [-1, 1].forEach(sx => rbox(g, W / 2 - 0.2, 0.12, 0.4, 0.1, plainMat('#F2EEE6', 0.9), sx * W / 4, 0.58, -D / 2 + 0.38));
      rbox(g, W - 0.04, 0.06, D * 0.45, 0.06, plainMat('#CDBFA9', 0.95), 0, 0.55, D * 0.22); return g; },
    bedPlatform(it, p, s) { const g = new T.Group(), w = mat(p), f = mat(s || 'wool_charcoal'); const W = it.w, D = it.d;
      box(g, W, 0.16, D, w, 0, 0.08, 0); rbox(g, W - 0.15, 0.2, D - 0.2, 0.06, plainMat('#F1EDE5', 0.9), 0, 0.26, 0.05);
      rbox(g, W - 0.12, 0.05, D * 0.55, 0.05, f, 0, 0.38, D * 0.17);
      [-1, 1].forEach(sx => rbox(g, W / 2 - 0.2, 0.12, 0.38, 0.1, f, sx * W / 4, 0.42, -D / 2 + 0.35)); return g; },
    wardrobe(it, p, s, sc) { const g = new T.Group(), w = mat(p); const W = it.w * sc, D = it.d, H = it.h;
      box(g, W, H - 0.05, D, w, 0, (H + 0.05) / 2, 0); box(g, W - 0.04, 0.05, D - 0.06, plainMat('#2B2A2C', 0.8), 0, 0.025, 0);
      const n = Math.max(2, Math.round(W / 0.6)); for (let i = 1; i < n; i++) box(g, 0.006, H - 0.12, 0.004, plainMat('#8B7A62', 0.8), -W / 2 + i * W / n, H / 2, D / 2 + 0.002); return g; },
    sideboard(it, p, s, sc) { const g = new T.Group(), w = mat(p); const W = it.w * sc, D = it.d;
      legs(g, W, D, 0.18, w, 0.08, 0.02); box(g, W, 0.44, D, w, 0, 0.4, 0);
      box(g, 0.006, 0.38, 0.004, plainMat('#3A2A1E', 0.7), 0, 0.4, D / 2 + 0.002); return g; },
    desk(it, p, s, sc) { const g = new T.Group(), w = mat(p); const W = it.w * sc, D = it.d;
      legs(g, W, D, 0.72, w, 0.05, 0.022, 0.75); box(g, W, 0.035, D, w, 0, 0.735, 0); box(g, W * 0.45, 0.07, D - 0.08, w, 0, 0.68, 0.0); return g; },
    deskStanding(it, p, s, sc) { const g = new T.Group(), top = mat(p), leg = mat(s || 'graphite'); const W = it.w * sc, D = it.d;
      box(g, W, 0.03, D, top, 0, 0.735, 0); [-1, 1].forEach(sx => { box(g, 0.06, 0.7, 0.06, leg, sx * (W / 2 - 0.12), 0.36, 0); box(g, 0.08, 0.03, D - 0.1, leg, sx * (W / 2 - 0.12), 0.015, 0); });
      box(g, W - 0.3, 0.04, 0.04, leg, 0, 0.6, -0.1);
      const mon = new T.Group(); box(mon, 0.62, 0.36, 0.02, plainMat('#1A1B1F', 0.4), 0, 0.27, 0); box(mon, 0.05, 0.22, 0.05, plainMat('#BFC1C4', 0.4, { metalness: 0.5 }), 0, 0.02, -0.03); mon.position.set(0, 0.75, -D / 2 + 0.15); g.add(mon); return g; },
    taskChair(it, p) { const g = new T.Group(), f = mat(p), base = plainMat('#2A2B2F', 0.5, { metalness: 0.4 });
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const leg = box(g, 0.3, 0.025, 0.04, base, Math.cos(a) * 0.15, 0.06, Math.sin(a) * 0.15); leg.rotation.y = -a; }
      cyl(g, 0.025, 0.025, 0.38, base, 0, 0.26, 0, 10); rbox(g, 0.5, 0.08, 0.48, 0.08, f, 0, 0.48, 0.02);
      const back = rbox(g, 0.46, 0.5, 0.06, 0.06, plainMat('#4A4C52', 0.9), 0, 0.8, -0.22); back.rotation.x = 0.1; return g; },
    coffeeRound(it, p) { const g = new T.Group(), w = mat(p); const R = it.w / 2;
      cyl(g, R, R, 0.04, w, 0, 0.38, 0, 48); cyl(g, R * 0.42, R * 0.42, 0.36, w, 0, 0.18, 0, 32); return g; },
    diningTable(it, p, s, sc) { const g = new T.Group(), w = mat(p); const W = it.w * sc, D = it.d;
      box(g, W, 0.04, D, w, 0, 0.73, 0); legs(g, W, D, 0.71, w, 0.12, 0.03, 0.7); return g; },
    sideTable(it, p) { const g = new T.Group(), m = mat(p); cyl(g, 0.22, 0.22, 0.04, m, 0, 0.48, 0, 32); cyl(g, 0.12, 0.15, 0.46, m, 0, 0.23, 0, 24); return g; },
    bookshelf(it, p, s, sc) { const g = new T.Group(), w = mat(p); const W = it.w * sc, D = it.d, H = it.h;
      [-1, 1].forEach(sx => box(g, 0.025, H, D, w, sx * (W / 2 - 0.0125), H / 2, 0));
      const cols = ['#7D6A55', '#B9A88E', '#3E4552', '#C8BBA6', '#8E9C86', '#A99ACB', '#6A4A33'];
      for (let i = 0; i < 6; i++) { const y = 0.02 + i * (H - 0.04) / 5; box(g, W, 0.025, D, w, 0, y, 0);
        if (i < 5) { let x = -W / 2 + 0.05; let k = i * 3; while (x < W / 2 - 0.12) { const bw = 0.025 + ((k * 37) % 5) * 0.006, bh = 0.2 + ((k * 13) % 4) * 0.025; box(g, bw, bh, D * 0.75, plainMat(cols[k % cols.length], 0.9), x + bw / 2, y + 0.0125 + bh / 2, 0); x += bw + 0.004; k++; if ((k % 9) === 0) x += 0.12; } } }
      return g; },
    wallShelf(it, p, s, sc) { const g = new T.Group(), m = mat(p); box(g, it.w * sc, 0.04, it.d, m, 0, 0, 0); box(g, 0.12, 0.16, 0.1, plainMat('#E8E1D4', 0.6), -0.2 * sc, 0.1, 0); return g; },
    lampArc(it, p) { const g = new T.Group(), m = mat(p); cyl(g, 0.17, 0.18, 0.04, plainMat('#D9D3CA', 0.4), 0, 0.02, 0, 32);
      const curve = new T.QuadraticBezierCurve3(new T.Vector3(0, 0.04, 0), new T.Vector3(0, 2.4, 0.15), new T.Vector3(0, 1.95, 1.05));
      const tube = new T.Mesh(new T.TubeGeometry(curve, 30, 0.012, 8), m); tube.castShadow = true; g.add(tube);
      const shade = cyl(g, 0.17, 0.23, 0.22, new T.MeshStandardMaterial({ color: C('#F3EADB'), roughness: 0.9, emissive: C('#FFD7A0'), emissiveIntensity: 0, side: T.DoubleSide }), 0, 1.86, 1.05, 32); shade.castShadow = false; shade.userData.shade = true; return g; },
    lampTable(it, p) { const g = new T.Group(), m = mat(p); sph(g, 0.08, m, 0, 0.12, 0, 1, 1.3, 1); cyl(g, 0.01, 0.01, 0.18, plainMat('#8A7A60', 0.5), 0, 0.3, 0, 8);
      const shade = cyl(g, 0.1, 0.15, 0.17, new T.MeshStandardMaterial({ color: C('#F3EADB'), roughness: 0.9, emissive: C('#FFD7A0'), emissiveIntensity: 0, side: T.DoubleSide }), 0, 0.44, 0, 28); shade.castShadow = false; shade.userData.shade = true; return g; },
    pendant(it, p) { const g = new T.Group();
      cyl(g, 0.004, 0.004, 0.6, plainMat('#222', 0.5), 0, 0.3, 0, 6);
      const shade = sph(g, 0.27, new T.MeshStandardMaterial({ color: C('#F5EFE4'), roughness: 0.95, emissive: C('#FFD9A8'), emissiveIntensity: 0 }), 0, -0.1, 0, 1, 0.9, 1); shade.castShadow = false; shade.userData.shade = true; return g; },
    plantTall(it, p) { const g = new T.Group(), pot = mat(p), leaf = plainMat('#4F6B45', 0.8);
      cyl(g, 0.2, 0.16, 0.38, pot, 0, 0.19, 0, 24); cyl(g, 0.015, 0.02, 1.0, plainMat('#5B4636', 0.9), 0, 0.85, 0, 6);
      for (let i = 0; i < 16; i++) { const a = i * 2.4, y = 0.75 + (i % 8) * 0.11 + (i > 7 ? 0.08 : 0), r = 0.14 + (i % 3) * 0.06; sph(g, 0.1, leaf, Math.cos(a) * r, y, Math.sin(a) * r, 1, 0.55, 1.4).rotation.set(0.5, a, 0.3); }
      return g; },
    plantSmall(it, p) { const g = new T.Group(), pot = mat(p), leaf = plainMat('#5E7D52', 0.8); cyl(g, 0.1, 0.08, 0.16, pot, 0, 0.08, 0, 20);
      for (let i = 0; i < 9; i++) { const a = i * 0.7; sph(g, 0.05, leaf, Math.cos(a) * 0.09, 0.2 - (i % 3) * 0.05, Math.sin(a) * 0.09, 1, 0.5, 1.3); } return g; },
    rug(it, p, s, sc) { const g = new T.Group(); const m = mat(p).clone(); m.roughness = 1; const me = rbox(g, it.w * sc, 0.012, it.d * sc, 0.04, m, 0, 0.006, 0); me.castShadow = false; return g; },
    print(it, p) { const g = new T.Group(), fr = mat(p); box(g, it.w, it.h, 0.03, fr, 0, 0, 0);
      const cv = document.createElement('canvas'); cv.width = 140; cv.height = 180; const x = cv.getContext('2d'); x.fillStyle = '#F2ECE1'; x.fillRect(0, 0, 140, 180); x.fillStyle = '#D8C7AB'; x.beginPath(); x.arc(60, 105, 42, 0, Math.PI * 2); x.fill(); x.fillStyle = '#A99ACB'; x.fillRect(78, 40, 10, 90); x.fillStyle = '#17191D'; x.fillRect(30, 140, 70, 3);
      const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; const art = new T.Mesh(new T.PlaneGeometry(it.w - 0.08, it.h - 0.08), new T.MeshStandardMaterial({ map: tex, roughness: 0.9 })); art.position.z = 0.016; g.add(art); return g; },
    mirror(it, p) { const g = new T.Group(); const ring = new T.Mesh(new T.TorusGeometry(0.34, 0.018, 10, 48), mat(p)); g.add(ring);
      const glass = new T.Mesh(new T.CircleGeometry(0.335, 48), new T.MeshStandardMaterial({ color: C('#C9D0D6'), roughness: 0.05, metalness: 0.9 })); glass.position.z = -0.005; g.add(glass); return g; },
    espresso(it, p) { const g = new T.Group(), m = mat(p); rbox(g, 0.28, 0.36, 0.32, 0.03, m, 0, 0.18, 0); box(g, 0.16, 0.06, 0.1, plainMat('#2A2B2F', 0.4), 0, 0.2, 0.16); return g; },
    fridge(it, p) { const g = new T.Group(), m = mat(p); rbox(g, it.w, it.h, it.d, 0.03, m, 0, it.h / 2, 0); box(g, 0.02, 0.5, 0.03, plainMat('#8C8478', 0.4, { metalness: 0.5 }), it.w / 2 - 0.06, 1.2, it.d / 2 + 0.02); box(g, it.w - 0.02, 0.006, 0.01, plainMat('#9B9386', 0.6), 0, 0.62, it.d / 2 + 0.01); return g; },
    vases(it, p) { const g = new T.Group(); const cs = [p, 'clay', 'wool_charcoal']; [[-0.1, 0.12, 0.06], [0.03, 0.18, 0.05], [0.13, 0.09, 0.055]].forEach(([x, h, r], i) => { cyl(g, r * 0.6, r, h, mat(cs[i]), x, h / 2, 0, 20); }); return g; },
  };

  // ---------- Stage ----------
  class Stage {
    constructor() {
      this.renderer = null; this.ok = true;
      try {
        const cv = document.createElement('canvas');
        this.renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
      } catch (e) { this.ok = false; return; }
      const r = this.renderer;
      r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
      r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
      r.domElement.className = 'stage-canvas'; r.domElement.tabIndex = 0; r.domElement.setAttribute('aria-label', '3D room. Drag furniture to move it. Use arrow keys to nudge and R to rotate the selected piece.');
      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(42, 1, 0.05, 200);
      this.controls = new T.OrbitControls(this.camera, r.domElement);
      Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.09, maxPolarAngle: Math.PI * 0.49, minDistance: 1.2, maxDistance: 26, screenSpacePanning: true });
      this.controls.addEventListener('change', () => { this.dirty = true; this.cullWalls(); this.emit('camera'); });
      this.controls.addEventListener('start', () => { this.camAnim = null; });

      this.hemi = new T.HemisphereLight(0xffffff, 0x8a7a66, 0.5); this.scene.add(this.hemi);
      this.sun = new T.DirectionalLight(0xffffff, 1); this.sun.castShadow = true;
      Object.assign(this.sun.shadow.mapSize, { width: 2048, height: 2048 }); this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.02;
      this.scene.add(this.sun, this.sun.target);
      this.fill = new T.AmbientLight(0xffffff, 0.08); this.scene.add(this.fill);

      this.world = new T.Group(); this.scene.add(this.world);
      this.itemsGroup = new T.Group(); this.scene.add(this.itemsGroup);
      this.helpers = new T.Group(); this.scene.add(this.helpers);
      this.ring = new T.Mesh(new T.RingGeometry(0.5, 0.53, 64), new T.MeshBasicMaterial({ color: 0xA99ACB, transparent: true, opacity: 0.95, depthTest: false }));
      this.ring.rotation.x = -Math.PI / 2; this.ring.renderOrder = 10; this.ring.visible = false; this.helpers.add(this.ring);
      this.ghost = null;

      this.ray = new T.Raycaster(); this.ptr = new T.Vector2();
      this.floorPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
      this.handlers = {}; this.dirty = true; this.mode = 'edit'; this.project = null; this.meshes = {}; this.lamps = [];
      this.walls = []; this.selected = null; this.drag = null; this.keys = {}; this.yaw = 0; this.pitch = 0;
      this.texLoader = new T.TextureLoader(); this.texCache = {};
      this.bindPointer(); this.bindKeys();
      this.ro = new ResizeObserver(() => this.resize());
      this.clock = new T.Clock(); this.loop = this.loop.bind(this); requestAnimationFrame(this.loop);
    }
    on(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); }
    off(ev) { delete this.handlers[ev]; }
    emit(ev, ...a) { (this.handlers[ev] || []).forEach(fn => fn(...a)); }

    mount(el) {
      if (!this.ok) return false;
      if (this.host) this.ro.unobserve(this.host);
      this.host = el; el.appendChild(this.renderer.domElement); this.ro.observe(el); this.resize(); return true;
    }
    resize() { if (!this.host) return; const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1; this.renderer.setSize(w, h, false); this.renderer.domElement.style.width = '100%'; this.renderer.domElement.style.height = '100%'; this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.dirty = true; }

    tex(name, rep = 1) {
      const k = name + rep; if (this.texCache[k]) return this.texCache[k];
      const t = this.texLoader.load('img/' + name + '.webp', () => { this.dirty = true; this.emit('texture'); });
      t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return (this.texCache[k] = t);
    }

    // ----- project -----
    setProject(p, opts = {}) {
      this.project = p; this.selected = null; this.ring.visible = false;
      this.buildRooms(); this.buildItems(); this.applyAtmos();
      if (!opts.keepCamera) this.frameRoom(opts.room || (p.rooms[0] && p.rooms[0].id), false);
      this.dirty = true;
    }
    roomById(id) { return this.project.rooms.find(r => r.id === id); }
    roomAt(x, z) { return this.project.rooms.find(r => x >= r.x && x <= r.x + r.w && z >= r.z && z <= r.z + r.d); }
    bounds() { const rs = this.project.rooms; const minX = Math.min(...rs.map(r => r.x)), minZ = Math.min(...rs.map(r => r.z)), maxX = Math.max(...rs.map(r => r.x + r.w)), maxZ = Math.max(...rs.map(r => r.z + r.d)); return { minX, minZ, maxX, maxZ, cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2, w: maxX - minX, d: maxZ - minZ }; }

    buildRooms() {
      this.world.clear(); this.walls = []; this.windows = [];
      const p = this.project, A = p.atmos;
      const b = this.bounds();
      // ground beyond the rooms
      const ground = new T.Mesh(new T.PlaneGeometry(80, 80), new T.MeshStandardMaterial({ color: C('#CFC6B8'), roughness: 1 }));
      ground.rotation.x = -Math.PI / 2; ground.position.set(b.cx, -0.02, b.cz); ground.receiveShadow = true; this.world.add(ground); this.ground = ground;
      p.rooms.forEach((r, ri) => {
        const F = ND.FLOORS[r.floor] || ND.FLOORS.oak_pale;
        const fm = new T.MeshStandardMaterial({ color: C(F.color), roughness: F.rough });
        if (F.tex) { const t = this.tex(F.tex).clone(); t.needsUpdate = true; t.repeat.set(r.w / 2.2, r.d / 2.2); fm.map = t; }
        const floor = new T.Mesh(new T.PlaneGeometry(r.w, r.d), fm); floor.rotation.x = -Math.PI / 2; floor.position.set(r.x + r.w / 2, 0.001, r.z + r.d / 2); floor.receiveShadow = true; floor.userData.room = r.id; this.world.add(floor);
        const wallCol = (ND.WALLS.find(w => w.id === r.wall) || ND.WALLS[0]).color;
        const wm = new T.MeshStandardMaterial({ color: C(wallCol), roughness: 0.95 });
        // window on the north wall of every room that touches the north edge, else on its east/west outer wall
        const north = Math.abs(r.z - b.minZ) < 0.01;
        const winW = Math.min(r.w - 1, ri === 0 ? (A.windowW || 1.4) : 1.2);
        const sides = [
          { side: 'N', len: r.w, x: r.x + r.w / 2, z: r.z, ry: 0, nx: 0, nz: -1, win: north ? { at: r.w * 0.68, w: winW } : null },
          { side: 'S', len: r.w, x: r.x + r.w / 2, z: r.z + r.d, ry: 0, nx: 0, nz: 1 },
          { side: 'W', len: r.d, x: r.x, z: r.z + r.d / 2, ry: Math.PI / 2, nx: -1, nz: 0 },
          { side: 'E', len: r.d, x: r.x + r.w, z: r.z + r.d / 2, ry: Math.PI / 2, nx: 1, nz: 0, win: (!north && Math.abs(r.x + r.w - b.maxX) < 0.01) ? { at: r.d * 0.5, w: winW } : null },
        ];
        sides.forEach(sd => {
          const g = new T.Group(); g.position.set(sd.x, 0, sd.z); g.rotation.y = sd.ry; g.userData = { normal: new T.Vector3(sd.nx, 0, sd.nz), room: r.id, side: sd.side };
          const L = sd.len + WALL_T;
          if (sd.win) {
            const wx = sd.win.at - sd.len / 2, ww = sd.win.w, sill = 0.25, top = 2.35;
            const leftW = (wx - ww / 2) + L / 2, rightW = L / 2 - (wx + ww / 2);
            box(g, leftW, WALL_H, WALL_T, wm, -L / 2 + leftW / 2, WALL_H / 2, 0);
            box(g, rightW, WALL_H, WALL_T, wm, L / 2 - rightW / 2, WALL_H / 2, 0);
            box(g, ww, sill, WALL_T, wm, wx, sill / 2, 0); box(g, ww, WALL_H - top, WALL_T, wm, wx, (WALL_H + top) / 2, 0);
            const frame = plainMat('#E9E5DE', 0.5); [[ww, 0.05, wx, sill], [ww, 0.05, wx, top]].forEach(([w, h, x, y]) => box(g, w, h, WALL_T + 0.02, frame, x, y, 0));
            [wx - ww / 2, wx + ww / 2].forEach(x => box(g, 0.05, top - sill, WALL_T + 0.02, frame, x, (top + sill) / 2, 0));
            const glass = new T.Mesh(new T.PlaneGeometry(ww, top - sill), new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, roughness: 0.05, metalness: 0.2 })); glass.position.set(wx, (top + sill) / 2, 0); g.add(glass);
            // view plate outside the window
            const vp = new T.Mesh(new T.PlaneGeometry(9, 3.9), new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
            vp.position.set(wx, 1.6, sd.nx === 0 ? 3.2 * sd.nz : 0); if (sd.nx !== 0) { vp.position.set(wx, 1.6, 3.2 * sd.nx); }
            vp.rotation.y = sd.nz === -1 || sd.nx === 1 ? 0 : Math.PI;
            if (sd.side === 'E') vp.rotation.y = Math.PI; // faces back into the room
            vp.userData.plate = true; g.add(vp); this.windows.push({ plate: vp, group: g, room: r.id, x: wx, w: ww, side: sd.side });
            const lightPatch = new T.SpotLight(0xffffff, 0, 9, 0.75, 0.6, 1.2); lightPatch.position.set(wx, 2.1, -1.4 * (sd.side === 'N' ? 1 : -1)); lightPatch.target.position.set(wx, 0, 2.5 * (sd.side === 'N' ? 1 : -1)); g.add(lightPatch, lightPatch.target); this.windows[this.windows.length - 1].spot = lightPatch;
          } else box(g, L, WALL_H, WALL_T, wm, 0, WALL_H / 2, 0);
          g.traverse(o => { if (o.isMesh) o.userData.wall = true; });
          this.world.add(g); this.walls.push(g);
        });
        // skirting line to read the room edge from above
      });
      this.ceilings = new T.Group(); this.world.add(this.ceilings);
      p.rooms.forEach(r => { const c = new T.Mesh(new T.PlaneGeometry(r.w, r.d), new T.MeshStandardMaterial({ color: C('#F3EFE8'), roughness: 1, side: T.DoubleSide })); c.rotation.x = Math.PI / 2; c.position.set(r.x + r.w / 2, WALL_H, r.z + r.d / 2); this.ceilings.add(c); });
      this.ceilings.visible = this.mode === 'walk';
      this.applyView(); this.cullWalls(); if (this.look === 'sketch') this.applyLook2();
    }

    applyView() {
      const V = ND.VIEWS.find(v => v.id === this.project.atmos.view) || ND.VIEWS[0];
      (this.windows || []).forEach(w => { let t = null; if (V.img) { t = this.tex(V.img).clone(); t.wrapS = t.wrapT = T.ClampToEdgeWrapping; t.repeat.set(1, 1); t.needsUpdate = true; } const pm = w.plate.userData.mat0 || w.plate.material; pm.map = t; pm.needsUpdate = true; });
      this.applyAtmos();
    }

    cullWalls() {
      if (!this.walls) return;
      const cam = this.camera.position;
      this.walls.forEach(g => {
        if (this.mode === 'walk') { g.visible = true; return; }
        const n = g.userData.normal; const toCam = new T.Vector3(cam.x - g.position.x, 0, cam.z - g.position.z);
        const facing = n.dot(toCam) > 0.2;
        g.visible = !facing;
      });
      const inside = this.mode === 'walk' || cam.y < WALL_H + 0.2;
      (this.windows || []).forEach(w => { w.plate.visible = inside && this.look !== 'sketch'; });
      this.dirty = true;
    }

    surfaceUnder(rec) { // height of a surface below a small item
      let best = 0;
      this.project.items.forEach(o => { if (o.uid === rec.uid) return; const h = SURFACE_H[o.item]; if (!h) return; const it = ND.itemById[o.item]; const sc = it.scalable ? o.scale || 1 : 1;
        const hw = (it.w * sc) / 2, hd = it.d / 2; const dx = rec.x - o.x, dz = rec.z - o.z; const c = Math.cos(-o.rot), s = Math.sin(-o.rot); const lx = dx * c - dz * s, lz = dx * s + dz * c;
        if (Math.abs(lx) <= hw && Math.abs(lz) <= hd && h > best && h < 1.5) best = h; });
      return best;
    }

    buildItem(rec) {
      const it = ND.itemById[rec.item]; if (!it) return null;
      const g = (B[it.build] || B.sideTable)(it, rec.primary || it.primary, rec.secondary || it.secondary, rec.scale || 1);
      const holder = new T.Group(); holder.add(g); holder.userData.uid = rec.uid;
      if (it.scalable && it.flat) {}
      this.placeHolder(holder, rec);
      holder.traverse(o => { if (o.isMesh) o.userData.uid = rec.uid; });
      return holder;
    }
    placeHolder(holder, rec) {
      const it = ND.itemById[rec.item];
      let y = 0;
      if (it.wall || it.elev) y = it.elev || 1.2;
      else if (it.ceiling) y = WALL_H - 0.35;
      else if (it.onSurface || rec.onTop) y = this.surfaceUnder(rec);
      holder.position.set(rec.x, y, rec.z); holder.rotation.y = rec.rot || 0;
    }
    buildItems() {
      this.itemsGroup.clear(); this.meshes = {}; this.lamps.forEach(l => l.light.parent && l.light.parent.remove(l.light)); this.lamps = [];
      this.project.items.forEach(rec => this.addItemMesh(rec));
      this.applyAtmos(); if (this.look === 'sketch') this.applyLook2();
    }
    addItemMesh(rec) {
      const h = this.buildItem(rec); if (!h) return; this.itemsGroup.add(h); this.meshes[rec.uid] = h;
      const it = ND.itemById[rec.item];
      if (it.light) {
        const L = new T.PointLight(0xffc98a, 0, 6.5, 1.6); L.position.set(0, it.light.y + (it.ceiling ? -0.1 : 0), it.light.z || 0); L.castShadow = false; h.add(L);
        const shades = []; h.traverse(o => { if (o.userData.shade) shades.push(o); }); this.lamps.push({ uid: rec.uid, light: L, shades, power: it.light.power });
      }
    }
    refreshItem(rec) {
      const old = this.meshes[rec.uid];
      if (old) { this.itemsGroup.remove(old); this.lamps = this.lamps.filter(l => l.uid !== rec.uid); }
      this.addItemMesh(rec); this.applyAtmos(); if (this.look === 'sketch') this.applyLook2();
      // dependants that sit on top
      this.project.items.forEach(o => { const it = ND.itemById[o.item]; if ((it.onSurface || o.onTop) && this.meshes[o.uid]) this.placeHolder(this.meshes[o.uid], o); });
      if (this.selected === rec.uid) this.select(rec.uid, true);
      this.dirty = true;
    }
    pop(uid) { // a placed piece settles into the room
      const h = this.meshes[uid]; if (!h || document.documentElement.classList.contains('reduce-motion')) return;
      const y = h.position.y, t0 = performance.now(); this.anims = this.anims || [];
      this.anims.push(() => { if (this.meshes[uid] !== h) return true; const k = Math.min(1, (performance.now() - t0) / 340), e = 1 - Math.pow(1 - k, 3); h.scale.setScalar(0.84 + 0.16 * e); h.position.y = y + 0.24 * (1 - e); this.dirty = true; return k >= 1; });
    }
    removeItem(uid) { const m = this.meshes[uid]; if (m) this.itemsGroup.remove(m); delete this.meshes[uid]; this.lamps = this.lamps.filter(l => l.uid !== uid); if (this.selected === uid) this.select(null); this.applyAtmos(); this.dirty = true; }

    // ----- atmosphere -----
    applyAtmos() {
      if (!this.project) return;
      const A = this.project.atmos, t = A.time;
      const sky = keyed(SKY, t); this.scene.background = sky;
      const elev = Math.sin(Math.PI * (t - 6) / 12); // 1 at noon, 0 at 6 and 18
      const sunUp = Math.max(0, elev);
      const az = (t - 6) / 12 * Math.PI; // east -> west
      const b = this.bounds();
      const dir = new T.Vector3(-Math.cos(az) * 0.8, Math.max(0.12, sunUp) * 1.2, -0.9).normalize();
      this.sun.position.set(b.cx + dir.x * 14, dir.y * 14, b.cz + dir.z * 14); this.sun.target.position.set(b.cx, 0, b.cz);
      const ext = Math.max(b.w, b.d) * 0.75 + 2; Object.assign(this.sun.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, near: 1, far: 40 }); this.sun.shadow.camera.updateProjectionMatrix();
      this.sun.color = keyed(SUN_COL, Math.min(20, Math.max(5, t)));
      this.sun.intensity = A.sun === false ? 0 : (elev > -0.05 ? 0.25 + 2.2 * Math.pow(sunUp, 0.7) : 0);
      const amb = keyed(AMB, t);
      this.hemi.intensity = amb * 0.9; this.hemi.color = keyed(SKY, t).lerp(C('#FFFFFF'), 0.5); this.hemi.groundColor = C('#8A7A66');
      this.fill.intensity = 0.05 + amb * 0.15;
      const dark = 1 - Math.min(1, amb / 0.6);
      const lampsOn = A.lamps === 'on' || (A.lamps === 'auto' && (t < 7.5 || t > 17.8));
      const lampCol = kelvinToColor(A.warmth || 2700);
      this.lamps.forEach(l => { const rec = this.project.items.find(i => i.uid === l.uid); const on = lampsOn && !(rec && rec.off);
        l.light.intensity = on ? (1.0 + dark * 2.2) * l.power : 0; l.light.color = lampCol;
        l.shades.forEach(s => { const m = s.userData.mat0 || s.material; if (!m.isMeshStandardMaterial) return; m.emissive.copy(lampCol); m.emissiveIntensity = on ? 0.6 + dark * 0.9 : 0; }); });
      this.renderer.toneMappingExposure = 0.85 + amb * 0.35 + (lampsOn ? 0.1 : 0);
      const tint = keyed(VIEW_TINT, t);
      (this.windows || []).forEach(w => { const pm = w.plate.userData.mat0 || w.plate.material; pm.color = pm.map ? tint : sky.clone().lerp(C('#FFFFFF'), 0.15); pm.needsUpdate = true;
        if (w.spot) { w.spot.intensity = sunUp * 2.4; w.spot.color = this.sun.color; } });
      (this.ground.userData.mat0 || this.ground.material).color = C('#CFC6B8').multiplyScalar(0.35 + amb * 0.8);
      if (this.look === 'sketch') { this.scene.background = C('#F3EFE6'); this.renderer.toneMappingExposure = 1; }
      this.dirty = true; this.emit('atmos', t);
    }

    // ----- look: 'render' (lit, materials) or 'sketch' (graphite lines on paper, like an architect's drawing) -----
    setLook(look) { this.look = look; this.applyLook2(); this.applyAtmos(); }
    applyLook2() {
      const sk = this.look === 'sketch';
      if (!this.paper) { this.paper = new T.MeshBasicMaterial({ color: C('#F7F3EB'), toneMapped: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }); this.ink = new T.LineBasicMaterial({ color: C('#3E3F43'), toneMapped: false }); this.paperHex = '#F7F3EB'; this.inkSoft = new T.LineBasicMaterial({ color: C('#B5AEA2'), toneMapped: false }); }
      [this.world, this.itemsGroup].forEach(root => root.traverse(o => {
        if (!o.isMesh) return;
        if (o.userData.mat0 === undefined) o.userData.mat0 = o.material;
        const isPlate = o.userData.plate;
        if (sk) {
          if (isPlate || (o.userData.mat0.transparent && o.userData.mat0.opacity < 0.2)) { o.visible = false; return; }
          o.material = this.paper; o.castShadow = false;
          if (!o.userData.edges) { const e = new T.LineSegments(new T.EdgesGeometry(o.geometry, 32), o === this.ground ? this.inkSoft : this.ink); e.userData.edgeLine = true; o.userData.edges = e; o.add(e); }
          o.userData.edges.visible = o !== this.ground;
        } else {
          o.visible = true; o.material = o.userData.mat0; o.castShadow = true;
          if (o.userData.edges) o.userData.edges.visible = false;
        }
      }));
      this.paper.color.set(this.paperHex);
      if (this.ground) this.ground.visible = !sk;
      this.cullWalls(); this.dirty = true;
    }

    // ----- camera -----
    frameRoom(roomId, animate = true, view = 'orbit') {
      const r = roomId ? this.roomById(roomId) : null; const b = this.bounds();
      const cx = r ? r.x + r.w / 2 : b.cx, cz = r ? r.z + r.d / 2 : b.cz, size = r ? Math.max(r.w, r.d) : Math.max(b.w, b.d);
      let pos, tgt = new T.Vector3(cx, 0.6, cz);
      if (view === 'top') { pos = new T.Vector3(cx, size * 1.55 + 3, cz + 0.01); tgt.y = 0; }
      else if (view === 'eye') { pos = new T.Vector3(cx - (r ? r.w * 0.2 : 0), 1.55, cz + (r ? r.d / 2 - 0.3 : size / 2)); tgt = new T.Vector3(cx + (r ? r.w * 0.1 : 0), 1.1, cz - (r ? r.d / 2 : size / 2)); }
      else if (view === 'dollhouse') { pos = new T.Vector3(b.cx + b.w * 0.55, Math.max(b.w, b.d) * 1.0 + 3, b.cz + b.d * 1.15 + 2.5); tgt = new T.Vector3(b.cx, 0, b.cz); }
      else pos = new T.Vector3(cx + size * 0.55, size * 0.75 + 1.6, cz + size * 0.95 + 1.2);
      this.flyTo(pos, tgt, animate);
    }
    flyTo(pos, tgt, animate = true) {
      const reduce = document.documentElement.classList.contains('reduce-motion');
      if (!animate || reduce) { this.camera.position.copy(pos); this.controls.target.copy(tgt); this.controls.update(); this.cullWalls(); this.dirty = true; return; }
      this.camAnim = { p0: this.camera.position.clone(), t0: this.controls.target.clone(), p1: pos, t1: tgt, s: performance.now(), d: 850 };
    }

    setMode(m) {
      this.mode = m; this.ceilings && (this.ceilings.visible = m === 'walk');
      this.controls.enabled = m !== 'walk';
      if (m === 'walk') { const r = this.walkRoom ? this.roomById(this.walkRoom) : this.project.rooms[0]; this.enterWalk(r); }
      else { this.select(null); }
      this.cullWalls(); this.dirty = true;
    }
    enterWalk(r) {
      this.walkRoom = r.id; this.camera.position.set(r.x + r.w * 0.3, 1.6, r.z + r.d - 0.6); this.yaw = Math.PI * 0.08; this.pitch = -0.06; this.applyLook(); this.dirty = true;
    }
    applyLook() { const d = new T.Vector3(Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch)); this.camera.lookAt(this.camera.position.clone().add(d)); }

    // ----- selection & manipulation -----
    pick(clientX, clientY) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.ptr.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      this.ray.setFromCamera(this.ptr, this.camera);
    }
    floorPoint(clientX, clientY) { this.pick(clientX, clientY); const v = new T.Vector3(); return this.ray.ray.intersectPlane(this.floorPlane, v) ? v : null; }
    hitItem(clientX, clientY) {
      this.pick(clientX, clientY);
      const hits = this.ray.intersectObjects(this.itemsGroup.children, true).filter(h => h.object.isMesh && h.object.visible && h.object.userData.uid);
      return hits.length ? hits[0].object.userData.uid : null;
    }
    select(uid, quiet) {
      this.selected = uid; const h = uid && this.meshes[uid];
      if (h) { const rec = this.project.items.find(i => i.uid === uid); const it = ND.itemById[rec.item]; const sc = it.scalable ? rec.scale || 1 : 1;
        const rad = Math.max(it.w * sc, it.d) / 2 + 0.08; this.ring.scale.setScalar(rad / 0.5); this.ring.position.set(rec.x, 0.02, rec.z); this.ring.visible = this.mode === 'edit'; }
      else this.ring.visible = false;
      this.dirty = true; if (!quiet) this.emit('select', uid);
    }
    snap(v) { return Math.round(v / 0.05) * 0.05; }
    clampToRooms(rec) {
      const it = ND.itemById[rec.item]; let r = this.roomAt(rec.x, rec.z) || this.roomById(rec.room) || this.project.rooms[0];
      const sc = it.scalable ? rec.scale || 1 : 1; const half = Math.max(it.w * sc, it.d) / 2 * 0.5;
      rec.x = Math.min(r.x + r.w - half, Math.max(r.x + half, rec.x)); rec.z = Math.min(r.z + r.d - half, Math.max(r.z + half, rec.z)); rec.room = r.id;
      if (it.wall) this.snapToWall(rec, r);
    }
    snapToWall(rec, r) { // hang wall items flat against the nearest wall
      const d = [['N', rec.z - r.z], ['S', r.z + r.d - rec.z], ['W', rec.x - r.x], ['E', r.x + r.w - rec.x]].sort((a, b) => a[1] - b[1])[0][0];
      const off = 0.07;
      if (d === 'N') { rec.z = r.z + off; rec.rot = 0; } else if (d === 'S') { rec.z = r.z + r.d - off; rec.rot = Math.PI; } else if (d === 'W') { rec.x = r.x + off; rec.rot = Math.PI / 2; } else { rec.x = r.x + r.w - off; rec.rot = -Math.PI / 2; }
    }

    bindPointer() {
      const el = this.renderer.domElement;
      el.addEventListener('pointerdown', (e) => {
        el.focus({ preventScroll: true });
        if (this.mode === 'walk') { this.look = { x: e.clientX, y: e.clientY, yaw: this.yaw, pitch: this.pitch }; el.setPointerCapture(e.pointerId); return; }
        if (this.mode !== 'edit') return;
        const uid = this.hitItem(e.clientX, e.clientY);
        this.downAt = { x: e.clientX, y: e.clientY, uid };
        if (uid) {
          this.controls.enabled = false; this.select(uid);
          const rec = this.project.items.find(i => i.uid === uid); const fp = this.floorPoint(e.clientX, e.clientY);
          this.drag = { uid, rec, off: fp ? { x: rec.x - fp.x, z: rec.z - fp.z } : { x: 0, z: 0 }, moved: false, start: { x: rec.x, z: rec.z } };
          el.setPointerCapture(e.pointerId); document.body.classList.add('dragging');
        }
      });
      el.addEventListener('pointermove', (e) => {
        if (this.mode === 'walk' && this.look) { this.yaw = this.look.yaw + (e.clientX - this.look.x) * 0.004; this.pitch = Math.max(-0.9, Math.min(0.9, this.look.pitch - (e.clientY - this.look.y) * 0.004)); this.applyLook(); this.dirty = true; return; }
        if (this.drag) {
          const fp = this.floorPoint(e.clientX, e.clientY); if (!fp) return;
          const r = this.drag.rec; r.x = this.snap(fp.x + this.drag.off.x); r.z = this.snap(fp.z + this.drag.off.z); this.clampToRooms(r);
          this.placeHolder(this.meshes[r.uid], r); this.ring.position.set(r.x, 0.02, r.z); this.drag.moved = true;
          this.project.items.forEach(o => { const it = ND.itemById[o.item]; if ((it.onSurface || o.onTop) && o.uid !== r.uid && this.meshes[o.uid]) this.placeHolder(this.meshes[o.uid], o); });
          this.dirty = true; this.emit('dragging', r);
        } else if (this.mode === 'edit' && e.pointerType === 'mouse') {
          const uid = this.hitItem(e.clientX, e.clientY); el.style.cursor = uid ? 'grab' : '';
        }
      });
      const end = (e) => {
        if (this.look) { this.look = null; return; }
        if (this.drag) {
          const d = this.drag; this.drag = null; this.controls.enabled = this.mode !== 'walk'; document.body.classList.remove('dragging');
          if (d.moved) { const r = d.rec; const it = ND.itemById[r.item]; if (it.onSurface) r.onTop = this.surfaceUnder(r) > 0; this.placeHolder(this.meshes[r.uid], r); this.emit('moved', r, d.start); }
        } else if (this.downAt && this.mode === 'edit') {
          const moved = Math.hypot(e.clientX - this.downAt.x, e.clientY - this.downAt.y) > 5;
          if (!moved && !this.downAt.uid) this.select(null);
        }
        this.downAt = null;
      };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
      // drop from the library
      el.addEventListener('dragover', (e) => { if (this.mode !== 'edit') return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; const fp = this.floorPoint(e.clientX, e.clientY); this.showGhost(this.dragItemId, fp); });
      el.addEventListener('dragleave', () => this.showGhost(null));
      el.addEventListener('drop', (e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/nocturne-item') || this.dragItemId; this.showGhost(null); const fp = this.floorPoint(e.clientX, e.clientY); if (id && fp) this.emit('drop', id, fp); });
    }
    showGhost(itemId, fp) {
      if (this.ghost && (!itemId || this.ghost.userData.item !== itemId)) { this.helpers.remove(this.ghost); this.ghost = null; }
      if (!itemId || !fp) { this.dirty = true; return; }
      if (!this.ghost) { const it = ND.itemById[itemId]; if (!it) return; const g = (B[it.build])(it, it.primary, it.secondary, 1); g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.55; o.castShadow = false; } }); g.userData.item = itemId; this.ghost = g; this.helpers.add(g); }
      this.ghost.position.set(this.snap(fp.x), 0, this.snap(fp.z)); this.dirty = true;
    }

    bindKeys() {
      window.addEventListener('keydown', (e) => { if (this.mode === 'walk' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { this.keys[e.key.toLowerCase()] = true; if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault(); } });
      window.addEventListener('keyup', (e) => { this.keys[e.key.toLowerCase()] = false; });
    }
    walkStep(dt) {
      const k = this.keys; let f = 0, s = 0, turn = 0;
      if (k['w'] || k['arrowup'] || this.joy === 'f') f += 1; if (k['s'] || k['arrowdown'] || this.joy === 'b') f -= 1;
      if (k['a'] || this.joy === 'l') s -= 1; if (k['d'] || this.joy === 'r') s += 1;
      if (k['arrowleft'] || this.joy === 'tl') turn -= 1; if (k['arrowright'] || this.joy === 'tr') turn += 1;
      if (!f && !s && !turn) return;
      this.yaw += turn * dt * 1.6;
      const sp = 1.6 * dt; const p = this.camera.position;
      p.x += (Math.sin(this.yaw) * f + Math.cos(this.yaw) * s) * sp; p.z += (-Math.cos(this.yaw) * f + Math.sin(this.yaw) * s) * sp;
      const r = this.roomById(this.walkRoom); if (r) { p.x = Math.min(r.x + r.w - 0.3, Math.max(r.x + 0.3, p.x)); p.z = Math.min(r.z + r.d - 0.3, Math.max(r.z + 0.3, p.z)); }
      this.applyLook(); this.dirty = true;
    }

    // ----- loop & capture -----
    loop() {
      requestAnimationFrame(this.loop);
      if (!this.ok || !this.host || !this.project) return;
      const dt = Math.min(0.05, this.clock.getDelta());
      if (this.camAnim) { const a = this.camAnim, k = Math.min(1, (performance.now() - a.s) / a.d), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        this.camera.position.lerpVectors(a.p0, a.p1, e); this.controls.target.lerpVectors(a.t0, a.t1, e); if (k >= 1) this.camAnim = null; this.controls.update(); this.cullWalls(); this.dirty = true; }
      if (this.mode === 'walk') this.walkStep(dt); else this.controls.update();
      if (this.tween) this.tween(dt);
      if (this.anims && this.anims.length) this.anims = this.anims.filter(f => !f());
      if (this.ring.visible) { this.ring.material.opacity = 0.75 + 0.2 * Math.sin(performance.now() / 300); this.dirty = true; }
      if (!this.dirty || document.hidden) return;
      this.dirty = false; this.renderer.render(this.scene, this.camera); this.emit('frame');
    }
    animateTime(target, ms = 700) {
      const A = this.project.atmos, from = A.time; let to = target; if (Math.abs(to - from) > 12) to += to < from ? 24 : -24;
      const reduce = document.documentElement.classList.contains('reduce-motion');
      if (reduce) { A.time = (target + 24) % 24; this.applyAtmos(); return; }
      let el = 0; this.tween = (dt) => { el += dt * 1000; const k = Math.min(1, el / ms), e = 1 - Math.pow(1 - k, 3); A.time = ((from + (to - from) * e) + 24) % 24; this.applyAtmos(); if (k >= 1) { this.tween = null; A.time = (target + 24) % 24; this.emit('timeDone'); } };
    }
    capture(w = 1600, h = 900, type = 'image/jpeg', q = 0.88) {
      this.ring.visible = false; this.renderer.render(this.scene, this.camera);
      const src = this.renderer.domElement; const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
      const sr = src.width / src.height, dr = w / h; let sw = src.width, sh = src.height, sx = 0, sy = 0; if (sr > dr) { sw = sh * dr; sx = (src.width - sw) / 2; } else { sh = sw / dr; sy = (src.height - sh) / 2; }
      x.drawImage(src, sx, sy, sw, sh, 0, 0, w, h); if (this.selected && this.mode === 'edit') this.ring.visible = true; this.dirty = true;
      return c.toDataURL(type, q);
    }
    screenOf(v3) { const v = v3.clone().project(this.camera); const r = this.renderer.domElement.getBoundingClientRect(); return { x: (v.x + 1) / 2 * r.width, y: (1 - v.y) / 2 * r.height, behind: v.z > 1 }; }
  }

  // ---------- offscreen thumbnails for the library ----------
  let thumbR = null; const thumbCache = {};
  function thumb(itemId, primary) {
    const k = itemId + '|' + (primary || ''); if (thumbCache[k]) return thumbCache[k];
    try {
      if (!thumbR) { thumbR = { r: new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }), s: new T.Scene(), c: new T.PerspectiveCamera(30, 1, 0.05, 50) };
        thumbR.r.setSize(240, 240); thumbR.r.outputEncoding = T.sRGBEncoding; thumbR.r.toneMapping = T.ACESFilmicToneMapping; thumbR.r.toneMappingExposure = 1.1;
        thumbR.s.add(new T.HemisphereLight(0xffffff, 0xb8ad9c, 0.9)); const d = new T.DirectionalLight(0xfff4e6, 1.3); d.position.set(-2, 4, 3); thumbR.s.add(d); }
      const it = ND.itemById[itemId]; const g = B[it.build](it, primary || it.primary, it.secondary, 1); g.traverse(o => { if (o.userData.shade) o.material.emissiveIntensity = 0.5; });
      thumbR.s.add(g); const bx = new T.Box3().setFromObject(g); const sz = bx.getSize(new T.Vector3()), ct = bx.getCenter(new T.Vector3()); const R = Math.max(sz.x, sz.y, sz.z);
      thumbR.c.position.set(ct.x + R * 1.25, ct.y + R * 0.95, ct.z + R * 1.85); thumbR.c.lookAt(ct); thumbR.r.render(thumbR.s, thumbR.c);
      const url = thumbR.r.domElement.toDataURL('image/png'); thumbR.s.remove(g); return (thumbCache[k] = url);
    } catch (e) { return ''; }
  }

  window.NScene = { Stage, thumb, SURFACE_H, kelvinToColor };
})();
