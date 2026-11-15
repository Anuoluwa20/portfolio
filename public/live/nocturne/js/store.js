/* NOCTURNE — state and saving.
   Saves to the viewer's private store (data/users/<id>/...) when the page runs on claude.ai,
   and always mirrors to this browser's local storage so work survives a reload either way. */
(function () {
  const LS_KEY = 'nocturne.v1';
  const listeners = new Set();
  const state = {
    profile: null,          // { name, email, style, units, currency, reducedMotion, budget, onboarded }
    projects: [],           // newest first
    sync: 'local',          // 'local' | 'cloud' | 'saving' | 'saved' | 'error'
    syncMsg: '',
    loaded: false,
  };
  let db = null, uid = null;
  const timers = {};

  function emit() { listeners.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } }); }
  function readLocal() { try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { return null; } }
  function writeLocal() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ profile: state.profile, projects: state.projects })); return true; }
    catch (e) { // quota: drop thumbnails and retry once
      try { localStorage.setItem(LS_KEY, JSON.stringify({ profile: state.profile, projects: state.projects.map(p => ({ ...p, thumb: null })) })); return true; } catch (e2) { return false; }
    }
  }
  const uidGen = (p) => p + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

  async function init() {
    const local = readLocal();
    if (local) { state.profile = local.profile || null; state.projects = local.projects || []; }
    state.loaded = true; emit();
    // Cloud store, when this page is served with the db capability.
    try {
      if (!window.claude || !window.claude.use) return;
      const [dbNs, userNs] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!dbNs || !userNs) return;
      const id = await userNs.id();
      if (!id) return;
      db = dbNs; uid = id;
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000));
      const snap = await Promise.race([db.collection('data/users/' + uid).get(), timeout]);
      const cloudProjects = [];
      let cloudProfile = null;
      snap.docs.forEach(d => { const v = d.data(); if (!v) return; if (d.id === 'profile') cloudProfile = v.profile; else if (d.id.startsWith('p-')) cloudProjects.push(v.project); });
      // merge: newest version of each project wins
      const byId = Object.fromEntries(state.projects.map(p => [p.id, p]));
      cloudProjects.forEach(p => { if (!p) return; const l = byId[p.id]; if (!l || (p.updated || 0) >= (l.updated || 0)) byId[p.id] = p; });
      state.projects = Object.values(byId).sort((a, b) => (b.updated || 0) - (a.updated || 0));
      if (cloudProfile && (!state.profile || !state.profile.email)) state.profile = cloudProfile;
      state.sync = 'cloud'; state.syncMsg = 'Saved to your account';
      writeLocal(); emit();
      // push anything that only existed locally
      state.projects.forEach(p => { if (!cloudProjects.find(c => c && c.id === p.id && c.updated === p.updated)) queueCloud('p-' + p.id, { project: p }); });
      if (state.profile && !cloudProfile) queueCloud('profile', { profile: state.profile });
    } catch (e) { state.sync = 'local'; state.syncMsg = 'Saved in this browser'; emit(); }
  }

  // One write at a time per document; coalesce bursts.
  const inflight = {}, pending = {};
  function queueCloud(docId, body) {
    if (!db || !uid) return;
    pending[docId] = body;
    if (inflight[docId]) return;
    const run = async () => {
      const b = pending[docId]; delete pending[docId];
      inflight[docId] = true; state.sync = 'saving'; emit();
      try { await db.collection('data/users/' + uid).doc(docId).set(b); state.sync = 'saved'; state.syncMsg = 'Saved to your account'; }
      catch (e) {
        if (e && e.code === 'unavailable') { await new Promise(r => setTimeout(r, 600 + Math.random() * 600)); try { await db.collection('data/users/' + uid).doc(docId).set(b); state.sync = 'saved'; } catch (e2) { state.sync = 'error'; } }
        else state.sync = 'error';
        if (state.sync === 'error') state.syncMsg = e && e.code === 'quota_exceeded' ? 'Account storage is full. Delete an old project to keep saving online.' : 'Could not reach your account. Your work is kept in this browser.';
      }
      inflight[docId] = false; emit();
      if (pending[docId]) run();
    };
    run();
  }
  function deleteCloud(docId) { if (db && uid) db.collection('data/users/' + uid).doc(docId).delete().catch(() => {}); }

  function saveProfile(patch) {
    state.profile = { units: 'cm', currency: 'USD', reducedMotion: false, ...(state.profile || {}), ...patch };
    writeLocal(); emit(); queueCloud('profile', { profile: state.profile });
  }

  function getProject(id) { return state.projects.find(p => p.id === id) || null; }

  function saveProject(p, opts = {}) {
    p.updated = Date.now();
    const i = state.projects.findIndex(x => x.id === p.id);
    if (i >= 0) state.projects[i] = p; else state.projects.unshift(p);
    state.projects.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    const okLocal = writeLocal();
    if (!db) { state.sync = okLocal ? 'local' : 'error'; state.syncMsg = okLocal ? 'Saved in this browser' : 'This browser blocked saving. Export an image to keep your work.'; }
    emit();
    clearTimeout(timers[p.id]);
    timers[p.id] = setTimeout(() => queueCloud('p-' + p.id, { project: p }), opts.now ? 0 : 700);
  }

  function deleteProject(id) {
    const p = getProject(id);
    state.projects = state.projects.filter(x => x.id !== id);
    writeLocal(); emit(); deleteCloud('p-' + id);
    return p;
  }

  function restoreProject(p) { if (!p) return; state.projects.push(p); saveProject(p, { now: true }); }

  function newProject({ name, type, layout, style, scale }) {
    const sc = Math.min(1.4, Math.max(0.7, scale || 1)), r1 = (n) => Math.round(n * sc * 10) / 10;
    const L = ND.LAYOUTS.find(l => l.id === layout) || ND.LAYOUTS[0];
    const S = ND.STYLES.find(s => s.id === style) || ND.STYLES[1];
    const totalBudget = (state.profile && state.profile.budget) || 6000;
    const areaSum = L.rooms.reduce((a, r) => a + r.w * r.d, 0);
    const rooms = L.rooms.map((r, i) => ({ id: 'r' + i, ...r, w: r1(r.w), d: r1(r.d), x: r1(r.x), z: r1(r.z), wall: S.wall, floor: S.floor, budget: Math.round(totalBudget * (r.w * r.d) / areaSum / 50) * 50 }));
    const p = {
      id: uidGen('p'), name: name || (S.name + ' ' + L.name.toLowerCase()), type: type || 'both', layout: L.id, style: S.id,
      rooms, items: [], atmos: { time: 19.67, warmth: 2700, lamps: 'auto', view: 'city-dusk', windowW: 1.4, sun: true },
      created: Date.now(), updated: Date.now(), thumb: null,
    };
    seedFurniture(p, S);
    return p;
  }

  // Starts each room furnished in the chosen style so nobody faces an empty box.
  function seedFurniture(p, S) {
    const fab = S.fabric, wood = S.wood;
    const add = (room, item, x, z, rot = 0, extra = {}) => {
      const it = ND.itemById[item]; if (!it) return;
      const primary = it.primaryOpts.includes(fab) ? fab : (it.primaryOpts.includes(wood) ? wood : it.primary);
      const secondary = it.secondaryOpts ? (it.secondaryOpts.includes(wood) ? wood : it.secondary) : it.secondary;
      p.items.push({ uid: uidGen('i'), item, room: room.id, x: room.x + x, z: room.z + z, rot, scale: 1, primary, secondary, ...extra });
    };
    p.rooms.forEach(r => {
      if (r.type === 'living') {
        add(r, 'rug-wool', r.w * 0.36, r.d * 0.58);
        add(r, S.id === 'midcentury' ? 'sofa-boucle' : (S.suggest.find(s => s.startsWith('sofa') || s === 'loveseat') || 'sofa-boucle'), r.w * 0.36, r.d - 0.6, Math.PI);
        add(r, 'coffee-round', r.w * 0.36, r.d * 0.55);
        add(r, 'lamp-arc', 0.45, r.d - 0.5, Math.PI / 2);
        add(r, 'desk-oak', r.w - 0.75, 0.4, 0);
        add(r, 'dining-chair', r.w - 0.75, 0.95, Math.PI);
        add(r, 'lamp-table', r.w - 0.45, 0.32, 0, { onTop: true });
        add(r, 'plant-fig', r.w - 0.5, r.d - 0.5);
      } else if (r.type === 'bedroom') {
        add(r, S.id === 'japandi' ? 'bed-platform' : 'bed-queen', r.w / 2, 1.15, 0);
        add(r, 'wardrobe', r.w - 0.75, r.d - 0.4, Math.PI);
        add(r, 'pendant', r.w / 2, 1.2);
      } else if (r.type === 'office') {
        add(r, 'desk-standing', r.w / 2, 0.45, 0);
        add(r, 'task-chair', r.w / 2, 1.05, Math.PI);
        add(r, 'bookshelf', 0.3, r.d / 2, Math.PI / 2);
        add(r, 'lamp-table', r.w / 2 + 0.5, 0.35, 0, { onTop: true });
        add(r, 'plant-small', r.w / 2 - 0.55, 0.35, 0, { onTop: true });
      }
    });
  }

  function duplicateProject(id) {
    const p = getProject(id); if (!p) return null;
    const c = JSON.parse(JSON.stringify(p));
    c.id = uidGen('p'); c.name = p.name + ' (copy)'; c.created = Date.now();
    c.items.forEach(i => i.uid = uidGen('i'));
    saveProject(c, { now: true });
    return c;
  }

  // A ready-made example for first-time visitors (clearly labelled as a sample).
  function sampleProject() {
    const p = newProject({ name: 'Sample: Dusk apartment', type: 'both', layout: 'twobed', style: 'scandi' });
    p.sample = true; p.atmos.time = 19.67; p.rooms.forEach(r => { r.budget = Math.round(r.budget * 1.4 / 50) * 50; });
    return p;
  }

  window.NStore = { state, init, on: fn => (listeners.add(fn), () => listeners.delete(fn)), saveProfile, getProject, saveProject, deleteProject, restoreProject, newProject, duplicateProject, sampleProject, uidGen, hasCloud: () => !!db };
})();
