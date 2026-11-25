// ═══════════════════════════════════════════════════════════════════
//  MOTOR: convierte tu configuración en etapas, itinerario, plazos y costes.
// ═══════════════════════════════════════════════════════════════════
import { DEFAULT_CFG, P, STRATEGIES, STOPS, BASES, LIFTS, HIGH_SEASON, SKIPASS, HOLIDAYS, ACTIVITIES, PREP,
  WINTER_PASS_CHF, SLED_CHF, SITTER_CHF_H, VIGNETTE_CHF, CRITAIR_EUR, CCP_CARD_EUR } from './data.js';

/* ─────────── Fechas ─────────── */
export const D = s => new Date(s + 'T12:00:00');
export const iso = d => d.toISOString().slice(0, 10);
export const addDays = (s, n) => { const d = D(s); d.setDate(d.getDate() + n); return iso(d); };
export const diffDays = (a, b) => Math.round((D(b) - D(a)) / 86400000);
export const fmtDate = (s, o = { weekday: 'short', day: 'numeric', month: 'short' }) => D(s).toLocaleDateString('es-ES', o);
export const fmtLong = s => D(s).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const inRange = (s, a, b) => s >= a && s <= b;
export const liftOpen = (lift, s) => !lift || inRange(s, LIFTS[lift].from, LIFTS[lift].to);
export const isHigh = s => inRange(s, HIGH_SEASON[0], HIGH_SEASON[1]) || [0, 6].includes(D(s).getDay());

/* ─────────── Configuración ─────────── */
export function getCfg(ctx) {
  const c = ctx.get('cfg', {});
  return { ...DEFAULT_CFG, ...c, origin: { ...DEFAULT_CFG.origin, ...c.origin }, van: { ...DEFAULT_CFG.van, ...c.van }, interests: { ...DEFAULT_CFG.interests, ...c.interests } };
}

/* ─────────── Distancias (OSRM en vivo con respaldo) ─────────── */
const LEGS = {}; let LIVE = { fx: 0.93, fuel: {} };
const hav = (a, b) => { const R = 6371, t = x => x * Math.PI / 180, dl = t(b[0] - a[0]), dn = t(b[1] - a[1]);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(t(a[0])) * Math.cos(t(b[0])) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const key = (a, b) => `${a.join(',')};${b.join(',')}`;
function leg(a, b) {
  const k = key(a, b);
  if (LEGS[k]) return LEGS[k];
  const km = hav(a, b) * 1.25; return { km, h: km / 88, coords: [[a[1], a[0]], [b[1], b[0]]], approx: true };
}
const posOf = (k, cfg) => k === 'ORIGIN' ? cfg.origin.pos : k === 'BASE' ? baseOf(cfg).pos : P[k];
export const baseOf = cfg => BASES.find(b => b.id === cfg.base) || BASES[0];

export async function prepare(ctx) {
  const cfg = getCfg(ctx), live = ctx.live;
  const pairs = new Map();
  for (const s of new Set([cfg.outStrategy, cfg.retStrategy])) {
    const ch = STRATEGIES[s].chain.map(k => posOf(k, cfg));
    for (let i = 0; i < ch.length - 1; i++) pairs.set(key(ch[i], ch[i + 1]), [ch[i], ch[i + 1]]);
  }
  const todo = [...pairs.values()].filter(([a, b]) => !LEGS[key(a, b)]);
  const work = (async () => {
    for (let i = 0; i < todo.length; i += 4) await Promise.all(todo.slice(i, i + 4).map(async ([a, b]) => {
      try { const r = await live.route([a, b]); LEGS[key(a, b)] = { km: r.km, h: r.h, coords: r.geo.coordinates }; } catch {}
    }));
  })();
  const fx = live.eurChf().then(f => LIVE.fx = f.rate).catch(() => {});
  const fuel = loadFuel(live, cfg.van.fuel);
  await Promise.race([Promise.all([work, fx, fuel]), new Promise(r => setTimeout(r, 9000))]);
}
async function loadFuel(live, type) {
  if (LIVE.fuel[type]) return;
  const [es, fr] = await Promise.all([
    live.fuelES('20', type).then(l => l[0]?.price).catch(() => null),
    live.fuelFR(46.144, 6.081, 25, type).then(l => l[0]?.price).catch(() => null),
  ]);
  LIVE.fuel[type] = { es, fr };
}
export const liveData = () => LIVE;

/* ─────────── Perfil de una ruta ─────────── */
function profile(stratKey, cfg) {
  const st = STRATEGIES[stratKey], keys = st.chain, pts = keys.map(k => posOf(k, cfg));
  let km = 0, h = 0; const out = [{ k: keys[0], pos: pts[0], km: 0, h: 0 }], geo = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const l = leg(pts[i], pts[i + 1]); km += l.km; h += l.h * st.vanFactor; geo.push(...l.coords);
    out.push({ k: keys[i + 1], pos: pts[i + 1], km, h, approx: l.approx });
  }
  const esKm = out.find(p => p.k === 'irun')?.km || 0, frKm = (out.find(p => p.k === 'bardonnex')?.km || 0) - esKm;
  return { pts: out, km, h, geo, esKm, frKm, chKm: km - esKm - frKm, approx: out.some(p => p.approx) };
}

/* Reparte la ruta en jornadas según horas máximas y paradas elegidas */
function splitDays(stratKey, cfg, dir, manual) {
  const pr = profile(stratKey, cfg), total = pr.h, maxH = cfg.maxHours / 1.12; // 1.12 = pausas perros cada 2 h
  const cands = STOPS.filter(s => s.strat.includes(stratKey)).map(s => {
    const p = pr.pts.find(x => x.k === s.at), extraH = s.detourKm / 70;
    const fromStart = dir === 'out' ? p.h : total - p.h, kmFromStart = dir === 'out' ? p.km : pr.km - p.km;
    return { ...s, hFrom: fromStart + extraH, kmFrom: kmFromStart + s.detourKm };
  }).sort((a, b) => a.hFrom - b.hFrom);
  const days = []; let curH = 0, curKm = 0, guard = 0;
  while (guard++ < 6) {
    const n = days.length, forced = manual?.[n];
    if (forced === 'none' || (!forced && total - curH <= maxH * 1.04)) { days.push({ km: pr.km - curKm, h: total - curH, stop: null }); break; }
    let pick = forced ? cands.find(c => c.id === forced && c.hFrom > curH) : null;
    if (!pick) {
      // Reparto equilibrado: días que quedan y punto ideal de corte; se prefieren áreas verificadas
      const left = total - curH, nLeft = Math.max(2, Math.ceil(left / (maxH * 1.04))), target = curH + left / nLeft;
      const ok = cands.filter(c => c.hFrom > curH + 0.5 && c.hFrom - curH <= maxH * 1.08 && total - c.hFrom > 0.5);
      const score = c => Math.abs(c.hFrom - target) + (c.zone ? 2.5 : 0);
      pick = ok.sort((a, b) => score(a) - score(b))[0] || cands.find(c => c.hFrom > curH + 0.5);
    }
    if (!pick) { days.push({ km: pr.km - curKm, h: total - curH, stop: null }); break; }
    days.push({ km: pick.kmFrom - curKm, h: pick.hFrom - curH, stop: pick, over: pick.hFrom - curH > maxH });
    curH = pick.hFrom; curKm = pick.kmFrom;
  }
  return { profile: pr, days, cands };
}

/* ─────────── Plan completo ─────────── */
export function plan(ctx) {
  const cfg = getCfg(ctx), base = baseOf(cfg), warn = [];
  const out = splitDays(cfg.outStrategy, cfg, 'out', cfg.stopsOut), ret = splitDays(cfg.retStrategy, cfg, 'ret', cfg.stopsRet);
  const arrive = addDays(cfg.depart, out.days.length - 1);
  const homeArrive = addDays(cfg.homeBy, cfg.bufferDay ? -1 : 0);
  const leave = addDays(homeArrive, -(ret.days.length - 1));
  const nights = diffDays(arrive, leave);
  const [h0, m0] = cfg.departTime.split(':').map(Number);
  const mkTravel = (sp, startDate, dir) => sp.days.map((d, i) => {
    const date = addDays(startDate, i), driveH = d.h * 1.0, totalH = d.h * 1.12;
    const arr = h0 + m0 / 60 + totalH, from = i === 0 ? (dir === 'out' ? cfg.origin.name : base.name) : sp.days[i - 1].stop.name, to = d.stop ? d.stop.name : (dir === 'out' ? base.name : cfg.origin.name);
    return { date, dir, km: d.km, driveH, totalH, arrival: arr, from, to, stop: d.stop, over: d.over, late: arr > 17.25 };
  });
  const travelOut = mkTravel(out, cfg.depart, 'out'), travelRet = mkTravel(ret, leave, 'ret');

  if (nights < 1) warn.push({ lvl: 'bad', t: `Con estas fechas no queda ninguna noche en Suiza (ida ${out.days.length} días + vuelta ${ret.days.length} días). Amplía la vuelta o sube las horas de conducción.` });
  if (arrive < base.opens) warn.push({ lvl: 'bad', t: `${base.name} abre el ${fmtDate(base.opens)} y llegaríais el ${fmtDate(arrive)}.` });
  if (cfg.dogs > base.maxDogs) warn.push({ lvl: 'bad', t: `${base.name} admite como máximo ${base.maxDogs} perro según su tarifa; vais con ${cfg.dogs}.` });
  [...travelOut, ...travelRet].forEach(t => { if (t.over) warn.push({ lvl: 'warn', t: `${fmtDate(t.date)}: ninguna parada encaja en ${cfg.maxHours} h; la jornada sale de ${t.totalH.toFixed(1)} h.` });
    if (t.late) warn.push({ lvl: 'warn', t: `${fmtDate(t.date)}: llegada estimada a las ${hhmm(t.arrival)}, ya de noche (anochece ≈17:15). Sal antes o acorta la etapa.` }); });
  if (cfg.skiers > cfg.adults) warn.push({ lvl: 'warn', t: 'Hay más esquiadores que adultos.' });

  // Itinerario día a día
  const overrides = ctx.get('dayplan', {}), days = [];
  for (let d = cfg.depart; d <= cfg.homeBy; d = addDays(d, 1)) {
    const tr = travelOut.find(t => t.date === d) || travelRet.find(t => t.date === d);
    const kind = tr ? tr.dir : d > homeArrive ? 'buffer' : 'base';
    days.push({ date: d, kind, travel: tr || null, hol: HOLIDAYS[d] || null });
  }
  autoPlan(days.filter(x => x.kind === 'base'), cfg);
  days.forEach(x => { const o = overrides[x.date]; if (o && x.kind === 'base') { if (o.act) x.act = o.act; if (o.alt !== undefined) x.alt = o.alt; if (o.note) x.note = o.note; x.edited = true; } });
  days.forEach(x => { if (x.act) { const a = ACTIVITIES.find(z => z.id === x.act); if (a?.lift && !liftOpen(a.lift, x.date)) x.liftWarn = `${LIFTS[a.lift].name} abre el ${fmtDate(LIFTS[a.lift].from)}`; } });

  const skiDates = days.filter(x => ACTIVITIES.find(a => a.id === x.act)?.type === 'ski').map(x => x.date);
  const budget = costs(cfg, { out, ret, travelOut, travelRet, nights, base, skiDates });
  const prep = PREP.map(p => { let due = addDays(cfg.depart, -p.days); if (p.notBefore && due < p.notBefore) due = p.notBefore; return { ...p, due }; })
    .sort((a, b) => a.due.localeCompare(b.due));

  return { cfg, base, out, ret, travelOut, travelRet, arrive, leave, nights, homeArrive, days, warn, budget, prep, skiDates, fx: LIVE.fx,
    totalDays: diffDays(cfg.depart, cfg.homeBy) + 1, approx: out.profile.approx || ret.profile.approx };
}
export const hhmm = h => `${String(Math.floor(h) % 24).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

/* Reparto automático de actividades */
function autoPlan(baseDays, cfg) {
  if (!baseDays.length) return;
  const last = baseDays[baseDays.length - 1];
  if (baseDays.length > 3) { last.act = 'valley-stechelberg'; last.auto = 'Día suave: preparar la salida (ropa seca, grises vacíos, depósito, cadenas a mano).'; }
  const mid = baseDays.length > 3 ? baseDays.slice(0, -1) : baseDays.slice();
  // Compra: víspera del primer festivo cerrado (o mitad de estancia)
  const firstClosed = mid.findIndex(x => x.hol?.kind === 'closed' || x.hol?.kind === 'half');
  let shopIdx = firstClosed > 0 ? firstClosed - 1 : Math.floor(mid.length / 2);
  if (mid[shopIdx]?.hol) shopIdx = Math.max(0, shopIdx - 1);
  mid[shopIdx].act = 'shop'; mid[shopIdx].auto = 'Compra para los festivos, una colada y vaciado/llenado.';
  // Esquí repartido
  const free = mid.filter(x => !x.act), skiN = cfg.interests.ski && cfg.skiers > 0 ? Math.min(cfg.skiDays, free.length) : 0;
  const skiable = free.filter(x => Object.keys(LIFTS).some(l => liftOpen(l, x.date)));
  const pickIdx = n => Array.from({ length: n }, (_, i) => Math.round((i + 0.5) * skiable.length / n - 0.5));
  const skiRot = ['ski-first', 'ski-kleine', 'ski-murren', 'ski-kleine'];
  let r = 0;
  pickIdx(Math.min(skiN, skiable.length)).forEach(i => { const x = skiable[i]; if (!x || x.act) return;
    let a = skiRot[r++ % skiRot.length]; for (let t = 0; t < 4 && !liftOpen(ACTIVITIES.find(z => z.id === a).lift, x.date); t++) a = skiRot[r++ % skiRot.length];
    x.act = a; x.alt = cfg.adults > cfg.skiers ? (['hike-bachalp', 'hike-mannlichen', 'hike-murren', 'valley-stechelberg'].find(h => liftOpen(ACTIVITIES.find(z => z.id === h).lift, x.date))) : ''; });
  // Resto: rutas según intereses y aperturas
  const pool = ['hike-bachalp', 'hike-mannlichen', 'valley-stechelberg', 'hike-murren', 'hike-bort', cfg.interests.pool ? 'town-grindelwald' : null,
    cfg.interests.snowshoe ? 'hike-faulhorn' : null, cfg.interests.trail ? 'valley-aar' : null, cfg.interests.sled ? 'sled-pintenfritz' : null].filter(Boolean);
  let streak = 0, pi = 0; const used = new Set();
  mid.forEach(x => {
    if (x.act) { streak = x.act === 'shop' ? 0 : streak + 1; return; }
    if (streak >= 3) { x.act = 'rest'; streak = 0; return; }
    for (let t = 0; t < pool.length * 2; t++) { const a = pool[pi++ % pool.length], A = ACTIVITIES.find(z => z.id === a);
      if (liftOpen(A.lift, x.date) && (!used.has(a) || used.size >= pool.length)) { x.act = a; used.add(a); break; } }
    x.act ||= 'valley-stechelberg'; streak++;
  });
}

/* ─────────── Costes ─────────── */
export function nightPrice(cfg, base = baseOf(cfg)) {
  if (cfg.nightPriceOverride > 0) return cfg.nightPriceOverride;
  return base.pitch + cfg.adults * (base.adult + base.tax) + cfg.dogs * base.dog + base.elec;
}
export function skipassCHF(days, skiDates) {
  if (!days) return 0;
  const high = skiDates.some(isHigh) || !skiDates.length, table = high ? SKIPASS.high : SKIPASS.low;
  if (days <= 5) return table[days]; return table[5] + (days - 5) * (high ? 70 : 66);
}
function costs(cfg, p) {
  const fx = LIVE.fx || 0.93, f = LIVE.fuel[cfg.van.fuel] || {};
  const pES = cfg.fuelES || f.es || 1.6, pFR = cfg.fuelFR || f.fr || 1.95, pCH = 1.95;
  const c2 = cfg.van.height > 2.0, L = km => km * cfg.van.cons / 100;
  const esKm = p.out.profile.esKm + p.ret.profile.esKm, frKm = p.out.profile.frKm + p.ret.profile.frKm, chKm = p.out.profile.chKm + p.ret.profile.chKm + cfg.localKm;
  const fuel = L(esKm) * pES + L(frKm) * pFR + L(chKm) * pCH / fx;
  const tolls = (c2 ? STRATEGIES[cfg.outStrategy].tollsC2 : STRATEGIES[cfg.outStrategy].tollsC1) + (c2 ? STRATEGIES[cfg.retStrategy].tollsC2 : STRATEGIES[cfg.retStrategy].tollsC1);
  const stops = [...p.travelOut, ...p.travelRet].filter(t => t.stop);
  const frNights = stops.reduce((a, t) => a + t.stop.price, 0) + (stops.some(t => t.stop.card) ? CCP_CARD_EUR : 0);
  const np = nightPrice(cfg, p.base), camp = Math.max(0, p.nights) * np / fx;
  const totalDays = diffDays(cfg.depart, cfg.homeBy) + 1;
  const food = cfg.foodPerDay * totalDays + cfg.eatOutMeals * 30 / fx;
  const ski = cfg.interests.ski ? (cfg.skiers * skipassCHF(cfg.skiDays, p.skiDates) + cfg.halfDays * cfg.skiers * 65) / fx : 0;
  const pass = cfg.winterPassDays * WINTER_PASS_CHF / fx, sled = cfg.sledRides * SLED_CHF / fx, sitter = cfg.sitterHours * SITTER_CHF_H / fx;
  const laundry = cfg.laundryLoads * 10 / fx, vign = VIGNETTE_CHF / fx + CRITAIR_EUR;
  const items = [
    { k: 'fuel', l: 'Combustible', v: fuel, n: `${Math.round(esKm + frKm + chKm).toLocaleString('es-ES')} km · ${Math.round(L(esKm + frKm + chKm))} l · España ${pES.toFixed(3)} €/l, Francia ${pFR.toFixed(3)} €/l` },
    { k: 'tolls', l: 'Peajes España + Francia', v: tolls, n: `Ida ${STRATEGIES[cfg.outStrategy].short}, vuelta ${STRATEGIES[cfg.retStrategy].short} · clase ${c2 ? 2 : 1} (altura ${cfg.van.height} m)` },
    { k: 'vign', l: "Viñeta suiza + Crit'Air", v: vign, n: '40 CHF + ≈5 €' },
    { k: 'fr', l: 'Paradas en Francia', v: frNights, n: `${stops.length} noches${stops.some(t => t.stop.card) ? ' + tarjeta Camping-Car Park 5 €' : ''}` },
    { k: 'camp', l: `Camping ${p.base.name}`, v: camp, n: `${p.nights} noches × ${np.toFixed(0)} CHF (${cfg.adults} adultos, ${cfg.dogs} perros${cfg.nightPriceOverride ? ', precio fijado por ti' : ', estimado'})` },
    { k: 'food', l: 'Comida y compra', v: food, n: `${cfg.foodPerDay} €/día × ${totalDays} días${cfg.eatOutMeals ? ` + ${cfg.eatOutMeals} comidas fuera` : ''}` },
    { k: 'ski', l: 'Forfaits de esquí', v: ski, n: cfg.interests.ski ? `${cfg.skiers} esquiador(es) × ${cfg.skiDays} días${cfg.halfDays ? ` + ${cfg.halfDays} medios días` : ''} · ${p.skiDates.some(isHigh) ? 'temporada alta' : 'temporada baja'}` : 'Sin esquí' },
    { k: 'pass', l: 'Pase invernal (no esquiadores)', v: pass, n: `${cfg.winterPassDays} días-persona × 61 CHF` },
    { k: 'sled', l: 'Trineo', v: sled, n: `${cfg.sledRides} × 55 CHF` },
    { k: 'sitter', l: 'Cuidador de perros', v: sitter, n: `${cfg.sitterHours} h × 20 CHF` },
    { k: 'laundry', l: 'Lavandería', v: laundry, n: `${cfg.laundryLoads} coladas × ≈10 CHF` },
    { k: 'ins', l: 'Seguro de montaña', v: cfg.insurance, n: cfg.insurance ? 'Indicado por ti' : 'Ya lo tenéis' },
  ];
  const sub = items.reduce((a, i) => a + i.v, 0), cont = sub * cfg.contingencyPct / 100;
  items.push({ k: 'cont', l: 'Imprevistos', v: cont, n: `${cfg.contingencyPct} % del total` });
  return { items, total: sub + cont, fuelPrices: { pES, pFR, live: !cfg.fuelES && !!f.es }, km: esKm + frKm + chKm };
}
