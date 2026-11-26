// ═══════════════════════════════════════════════════════════════════
//  MOTOR: convierte tu configuración en etapas, itinerario, plazos y costes.
// ═══════════════════════════════════════════════════════════════════
import { DEFAULT_CFG, P, IMG, STRATEGIES, STOPS, BASES, LIFTS, HIGH_SEASON, SKIPASS, HOLIDAYS, ACTIVITIES, PREP, REGIONS, GENERIC_SEASON, CROSSINGS,
  WINTER_PASS_CHF, SLED_CHF, SITTER_CHF_H, VIGNETTE_CHF, CRITAIR_EUR, CCP_CARD_EUR } from './data.js';

/* ─────────── Fechas ─────────── */
export const D = s => new Date(s + 'T12:00:00');
export const iso = d => d.toISOString().slice(0, 10);
export const addDays = (s, n) => { const d = D(s); d.setDate(d.getDate() + n); return iso(d); };
export const diffDays = (a, b) => Math.round((D(b) - D(a)) / 86400000);
export const fmtDate = (s, o = { weekday: 'short', day: 'numeric', month: 'short' }) => D(s).toLocaleDateString('es-ES', o);
export const fmtLong = s => D(s).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const inRange = (s, a, b) => s >= a && s <= b;
const LIFT = k => k === 'gen' ? { name: 'Remontes de la estación', ...GENERIC_SEASON } : LIFTS[k];
export const liftOpen = (lift, s) => !lift || inRange(s, LIFT(lift).from, LIFT(lift).to);
export const liftInfo = LIFT;

/* ─────────── Zonas y actividades ─────────── */
const near = (a, b) => Math.hypot(a[0] - b[0], (a[1] - b[1]) * 0.69) * 111;
const CUSTOM = new Map();
export function regionOf(id, place) {
  const R = REGIONS.find(r => r.id === id); if (R) return R;
  if (place?.area) place = place.area; // el camping elegido conserva la zona buscada
  if (place?.pos) {
    const n = REGIONS.filter(r => !place.country || (r.country || 'CH') === place.country).map(r => [r, near(r.pos, place.pos)]).sort((a, b) => a[1] - b[1])[0];
    if (n && n[1] < 12) return n[0];
    const k = 'custom-' + place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cc = place.country || 'CH';
    if (!CUSTOM.has(k)) CUSTOM.set(k, { id: k, name: place.name, short: place.name.split(',')[0], pos: place.pos, elev: place.elev || 1100, top: 2500, country: cc, side: cc === 'CH' ? undefined : 'valais', web: cc === 'IT' ? 'https://www.lovevda.it/' : cc === 'FR' ? 'https://www.france.fr/' : 'https://www.myswitzerland.com/es-es/' });
    return CUSTOM.get(k);
  }
  return REGIONS[0];
}
const ACT_REG = new Map();
const W = ([la, lo]) => ({ wikiloc: `https://www.wikiloc.com/wikiloc/map.do?sw=${(la - .05).toFixed(3)}%2C${(lo - .07).toFixed(3)}&ne=${(la + .05).toFixed(3)}%2C${(lo + .07).toFixed(3)}` });
export function activitiesFor(R) {
  if (R.detailed) return ACTIVITIES;
  const s = R.short, mk = (k, o) => { const a = { id: `${k}@${R.id}`, region: R.id, img: IMG.jungfrau, pos: R.pos, generic: true, ...o }; ACT_REG.set(a.id, a); return a; };
  return [
    mk('ski', { type: 'ski', name: `Esquí en ${s}`, lift: 'gen', dogs: false, cost: 'Forfait de la estación', how: `Remontes desde ${s} (${R.top ? `hasta ≈${R.top} m` : ''}).`, text: `Dominio de esquí de ${R.name}. Comprobad pistas abiertas el mismo día en la web oficial.`, crit: 'Fechas de apertura por confirmar en la web de la estación.' }),
    mk('hike', { type: 'hike', name: `Senderos invernales de ${s}`, lift: null, dogs: true, level: 'Fácil–media', cost: 'Gratis o remonte de subida', how: 'Rutas balizadas (señales rosas en invierno).', text: 'Caminos pisados y señalizados para caminar por la nieve: lo mejor con perros.', crit: 'Solo itinerarios abiertos y balizados.' }),
    mk('snowshoe', { type: 'hike', name: `Raquetas en ${s}`, lift: null, dogs: true, level: 'Media', cost: 'Alquiler ≈20–30 CHF/día', how: 'Itinerarios de raquetas señalizados.', text: 'Rutas de raquetas balizadas por la zona.', crit: 'Fuera de balizas: boletín de aludes y material de seguridad.' }),
    mk('valley', { type: 'valley', name: `Rodaje por el valle de ${s}`, lift: null, dogs: true, level: 'Fácil · trail', cost: 'Gratis', how: 'Desde el camping.', text: 'Caminos de fondo de valle para correr o pasear con los perros.', crit: 'Hielo en zonas de sombra.' }),
    mk('sled', { type: 'hike', name: `Trineo en ${s}`, lift: null, dogs: false, cost: 'Billete de remonte + alquiler', how: 'Pistas de trineo de la estación.', text: 'Bajadas de trineo señalizadas.', crit: 'Sin perros en las pistas.' }),
    mk('town', { type: 'town', name: `Pueblo de ${s} (termas o piscina si hay)`, lift: null, dogs: true, cost: 'Variable', how: '—', text: 'Día tranquilo: pueblo, piscina o termas y ducha caliente.', crit: '' }),
    ...ACTIVITIES.filter(a => ['shop', 'rest'].includes(a.type)),
  ].map(a => ({ ...a, links: W(R.pos) }));
}
export const actById = id => ACTIVITIES.find(a => a.id === id) || ACT_REG.get(id) || (id?.includes('@') ? (activitiesFor(regionOf(id.split('@')[1])), ACT_REG.get(id)) : null);
export const isHigh = s => inRange(s, HIGH_SEASON[0], HIGH_SEASON[1]) || [0, 6].includes(D(s).getDay());

/* ─────────── Configuración ─────────── */
export function getCfg(ctx) {
  const c = ctx.get('cfg', {});
  return { ...DEFAULT_CFG, ...c, origin: { ...DEFAULT_CFG.origin, ...c.origin }, van: { ...DEFAULT_CFG.van, ...c.van }, interests: { ...DEFAULT_CFG.interests, ...c.interests } };
}
/* Vuelta efectiva: las rutas «desde Italia» solo tienen sentido si la última parada está en Italia */
function effectiveCfg(cfg) {
  const out = { ...cfg }, s = staysOf(cfg).at(-1), lastC = countryOf(baseById(s.base, s.place));
  if (STRATEGIES[cfg.retStrategy]?.needs === 'IT' && lastC !== 'IT') { out.retStrategy = 'A'; out._retAuto = true; }
  if (STRATEGIES[cfg.outStrategy]?.onlyRet) out.outStrategy = 'A';
  return out;
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
export const countryOf = b => b.country || regionOf(b.region)?.country || 'CH';
export const sideOf = b => b.side || regionOf(b.region)?.side || (countryOf(b) === 'CH' ? 'other' : 'valais');
export const curOf = b => b.cur || (countryOf(b) === 'CH' ? 'CHF' : 'EUR');
export function baseById(id, place) {
  const b = BASES.find(x => x.id === id); if (b) return b;
  if (id?.startsWith('zone:') || id === 'place') {
    const R = id === 'place' ? regionOf(null, place) : regionOf(id.slice(5), place);
    return { id: `${id}${place ? '|' + place.name : ''}`, key: id, region: R.id, regionObj: R, generic: true, country: R.country || 'CH', cur: R.country && R.country !== 'CH' ? 'EUR' : 'CHF',
      name: place?.area ? place.name : place?.name && id !== 'place' ? place.name : place?.name ? `Camping por elegir en ${place.name}` : `Camping por elegir en ${R.short}`, town: R.short, pos: place?.pos || R.camperPos || R.pos, img: IMG.jungfrau, elev: R.elev,
      pitch: 35, adult: 10, tax: 3, dog: 4, elec: 5, maxDogs: 9, opens: '2026-01-01', status: 'warn', verdict: place && (place.area || id !== 'place') ? 'Confirmar invierno y perros' : 'Elige un camping',
      toGrindelwald: '', toInterlaken: '', pros: [place ? 'Elegido por ti' : 'Elige un camping concreto en «Dónde dormir»', R.note].filter(Boolean), cons: [R.camper].filter(Boolean),
      tel: place?.phone || '', mail: place?.email || '', web: place?.web || R.web, estimate: 'Estimación genérica: parcela ≈35 CHF + 10/adulto + tasa + perros + luz' };
  }
  return BASES[0];
}
/* Estancias en destino: [{ base, nights (0 = las que queden), price (0 = estimado) }] */
export function staysOf(cfg) {
  const st = Array.isArray(cfg.stays) && cfg.stays.length ? cfg.stays : [{ base: cfg.base || 'jungfrau', nights: 0, price: cfg.nightPriceOverride || 0 }];
  return st.map(x => ({ base: x.base, nights: +x.nights || 0, price: +x.price || 0, place: x.place || null }));
}
export const baseOf = cfg => { const s = staysOf(cfg)[0]; return baseById(s.base, s.place); };
const lastBase = cfg => { const s = staysOf(cfg).at(-1); return baseById(s.base, s.place); };
const posOf = (k, cfg, dir = 'out') => k === 'ORIGIN' ? cfg.origin.pos : k === 'BASE' ? (dir === 'ret' ? lastBase(cfg) : baseOf(cfg)).pos : P[k];

export async function prepare(ctx) {
  const cfg = effectiveCfg(getCfg(ctx)), live = ctx.live;
  const pairs = new Map();
  for (const [s, dir] of [[cfg.outStrategy, 'out'], [cfg.retStrategy, 'ret']]) {
    const ch = chainFor(s, cfg, dir).map(k => posOf(k, cfg, dir));
    for (let i = 0; i < ch.length - 1; i++) pairs.set(key(ch[i], ch[i + 1]), [ch[i], ch[i + 1]]);
  }
  const sb = staysOf(cfg).map(x => baseById(x.base, x.place).pos);
  for (let i = 0; i < sb.length - 1; i++) if (key(sb[i], sb[i + 1]) !== key(sb[i + 1], sb[i + 1])) pairs.set(key(sb[i], sb[i + 1]), [sb[i], sb[i + 1]]);
  const todo = [...pairs.values()].filter(([a, b]) => !LEGS[key(a, b)]);
  const work = (async () => {
    for (let i = 0; i < todo.length; i += 4) await Promise.all(todo.slice(i, i + 4).map(async ([a, b]) => {
      try { const r = await live.route([a, b]); LEGS[key(a, b)] = { km: r.km, h: r.h, coords: r.geo.coordinates }; } catch {}
    }));
  })();
  // Cambio y combustible no bloquean: se usan los últimos conocidos y se actualizan en segundo plano
  const last = live.lastValue?.('fx'); if (last?.rate) LIVE.fx = last.rate;
  const lf = { es: live.lastValue?.(`fes:20:${cfg.van.fuel}`)?.[0]?.price, fr: live.lastValue?.(`ffr:46.144,6.081,25,${cfg.van.fuel}`)?.[0]?.price };
  if (!LIVE.fuel[cfg.van.fuel] && (lf.es || lf.fr)) LIVE.fuel[cfg.van.fuel] = lf;
  live.eurChf().then(f => LIVE.fx = f.rate).catch(() => {});
  const fuel = loadFuel(live, cfg.van.fuel);
  // Solo se espera a las distancias de ruta que no estén ya guardadas (máx. 8 s)
  await Promise.race([Promise.all([work, LIVE.fuel[cfg.van.fuel] ? null : fuel]), new Promise(r => setTimeout(r, 8000))]);
}
async function loadFuel(live, type) {
  if (LIVE.fuel[type]?.fresh) return;
  const [es, fr] = await Promise.all([
    live.fuelES('20', type).then(l => l[0]?.price).catch(() => null),
    live.fuelFR(46.144, 6.081, 25, type).then(l => l[0]?.price).catch(() => null),
  ]);
  const prev = LIVE.fuel[type] || {};
  LIVE.fuel[type] = { es: es ?? prev.es, fr: fr ?? prev.fr, fresh: true };
}
export const liveData = () => LIVE;

/* ─────────── Perfil de una ruta ─────────── */
function chainFor(stratKey, cfg, dir) {
  const b = dir === 'ret' ? lastBase(cfg) : baseOf(cfg);
  return STRATEGIES[stratKey].chain.filter(k => !(k === 'bardonnex' && countryOf(b) !== 'CH'));
}
function profile(stratKey, cfg, dir = 'out') {
  const st = STRATEGIES[stratKey], keys = chainFor(stratKey, cfg, dir), pts = keys.map(k => posOf(k, cfg, dir));
  let km = 0, h = 0; const out = [{ k: keys[0], pos: pts[0], km: 0, h: 0 }], geo = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const l = leg(pts[i], pts[i + 1]); km += l.km; h += l.h * st.vanFactor; geo.push(...l.coords);
    out.push({ k: keys[i + 1], pos: pts[i + 1], km, h, approx: l.approx });
  }
  const esKm = out.find(p => p.k === 'irun')?.km || 0, frKm = (out.find(p => p.k === 'bardonnex')?.km || 0) - esKm;
  return { pts: out, km, h, geo, esKm, frKm, chKm: km - esKm - frKm, approx: out.some(p => p.approx) };
}

/* Reparte la ruta en jornadas según horas máximas y paradas elegidas */
function splitDays(stratKey, cfg, dir, manual, forcedN = 0) {
  const pr = profile(stratKey, cfg, dir), total = pr.h, maxH = cfg.maxHours / 1.12; // 1.12 = pausas perros cada 2 h
  const cands = STOPS.filter(s => s.strat.includes(stratKey) && pr.pts.some(x => x.k === s.at)).map(s => {
    const p = pr.pts.find(x => x.k === s.at), extraH = s.detourKm / 70;
    const fromStart = dir === 'out' ? p.h : total - p.h, kmFromStart = dir === 'out' ? p.km : pr.km - p.km;
    return { ...s, hFrom: fromStart + extraH, kmFrom: kmFromStart + s.detourKm };
  }).sort((a, b) => a.hFrom - b.hFrom);
  const days = []; let curH = 0, curKm = 0, guard = 0;
  while (guard++ < 6) {
    const n = days.length, forced = manual?.[n];
    const lastDay = forcedN ? n >= forcedN - 1 : total - curH <= maxH * 1.04;
    if (forced === 'none' || (!forced && lastDay)) { days.push({ km: pr.km - curKm, h: total - curH, stop: null, over: total - curH > maxH }); break; }
    let pick = forced ? cands.find(c => c.id === forced && c.hFrom > curH) : null;
    if (!pick && forcedN) { // número de días fijado por ti: cortes repartidos a partes iguales
      const target = curH + (total - curH) / (forcedN - n), score = c => Math.abs(c.hFrom - target) + (c.zone ? 1.5 : 0);
      pick = cands.filter(c => c.hFrom > curH + 0.5 && total - c.hFrom > 0.5).sort((a, b) => score(a) - score(b))[0];
    }
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
  const cfg = effectiveCfg(getCfg(ctx)), base = baseOf(cfg), endBase = lastBase(cfg), warn = [];
  const out = splitDays(cfg.outStrategy, cfg, 'out', cfg.stopsOut, +cfg.outDays || 0), ret = splitDays(cfg.retStrategy, cfg, 'ret', cfg.stopsRet, +cfg.retDays || 0);
  const arrive = addDays(cfg.depart, out.days.length - 1);
  const homeArrive = addDays(cfg.homeBy, cfg.bufferDay ? -1 : 0);
  const leave = addDays(homeArrive, -(ret.days.length - 1));
  const nights = diffDays(arrive, leave);
  const [h0, m0] = cfg.departTime.split(':').map(Number);
  const mkTravel = (sp, startDate, dir) => sp.days.map((d, i) => {
    const date = addDays(startDate, i), driveH = d.h * 1.0, totalH = d.h * 1.12;
    const tStr = cfg.dayTimes?.[date] || cfg.departTime, [hh, mm] = tStr.split(':').map(Number);
    const arr = hh + mm / 60 + totalH, from = i === 0 ? (dir === 'out' ? cfg.origin.name : endBase.name) : sp.days[i - 1].stop.name, to = d.stop ? d.stop.name : (dir === 'out' ? base.name : cfg.origin.name);
    return { date, dir, km: d.km, driveH, totalH, arrival: arr, departAt: tStr, from, to, stop: d.stop, over: d.over, late: arr > 17.25 };
  });
  const travelOut = mkTravel(out, cfg.depart, 'out'), travelRet = mkTravel(ret, leave, 'ret');

  if (nights < 1) warn.push({ lvl: 'bad', t: `Con estas fechas no queda ninguna noche en Suiza (ida ${out.days.length} días + vuelta ${ret.days.length} días). Amplía la vuelta o sube las horas de conducción.` });
  // Reparto de noches entre estancias (la última se queda con las que sobren)
  const raw = staysOf(cfg), fixed = raw.slice(0, -1).reduce((a, x) => a + Math.max(1, x.nights), 0);
  let cur = arrive;
  const stays = raw.map((x, i) => {
    const b = baseById(x.base, x.place), n = i < raw.length - 1 ? Math.max(1, x.nights) : nights - fixed;
    const st = { i, base: b, nights: n, price: x.price, np: nightPrice(cfg, b, x.price), cur: curOf(b), country: countryOf(b), checkin: cur, checkout: addDays(cur, Math.max(0, n)) };
    st.npEUR = toEUR(st.np, st.cur, LIVE.fx || 0.93);
    if (i > 0) { const pb = baseById(raw[i - 1].base, raw[i - 1].place), l = leg(pb.pos, b.pos); st.transfer = { from: pb, km: l.km, h: l.h * 1.12, crossings: crossingCosts(pb, b, cur, LIVE.fx || 0.93) }; }
    cur = st.checkout;
    return st;
  });
  const lastC = countryOf(endBase);
  if (cfg._retAuto) warn.push({ lvl: 'warn', t: `La última parada (${endBase.town}) no está en Italia: la vuelta va por autopista. Puedes cambiarla en Ajustes del viaje.` });
  if (raw.length > 1 && stays.at(-1).nights < 1) warn.push({ lvl: 'bad', t: `Las estancias suman ${fixed} noches pero solo hay ${nights}. Quita noches a alguna estancia o amplía el viaje.` });
  stays.forEach(st => {
    if (st.nights < 1) return;
    if (st.checkin < st.base.opens) warn.push({ lvl: 'bad', t: `${st.base.name} abre el ${fmtDate(st.base.opens)} y llegaríais el ${fmtDate(st.checkin)}.` });
    if (cfg.dogs > st.base.maxDogs) warn.push({ lvl: 'bad', t: `${st.base.name} admite como máximo ${st.base.maxDogs} perro según su tarifa; vais con ${cfg.dogs}.` });
  });
  [...travelOut, ...travelRet].forEach(t => { if (t.over) warn.push({ lvl: 'warn', t: `${fmtDate(t.date)}: jornada de ${t.totalH.toFixed(1)} h al volante (más de tus ${cfg.maxHours} h). Salid muy temprano y turnaos.` });
    if (t.late) warn.push({ lvl: 'warn', t: `${fmtDate(t.date)}: llegada estimada a las ${hhmm(t.arrival)}, ya de noche (anochece ≈17:15). Sal antes o acorta la etapa.` }); });
  if (cfg.skiers > cfg.adults) warn.push({ lvl: 'warn', t: 'Hay más esquiadores que adultos.' });

  // Itinerario día a día
  const overrides = ctx.get('dayplan', {}), days = [];
  for (let d = cfg.depart; d <= cfg.homeBy; d = addDays(d, 1)) {
    const tr = travelOut.find(t => t.date === d) || travelRet.find(t => t.date === d);
    const kind = tr ? tr.dir : d > homeArrive ? 'buffer' : 'base';
    const stay = kind === 'base' ? stays.find(st => d >= st.checkin && d < st.checkout) || stays.at(-1) : null;
    days.push({ date: d, kind, travel: tr || null, hol: HOLIDAYS[d] || null, stay, transfer: stay && stay.i > 0 && d === stay.checkin ? stay.transfer : null });
  }
  // El plan automático se reparte dentro de cada zona (las actividades dependen de la región)
  const baseDays = days.filter(x => x.kind === 'base'); baseDays.forEach(x => x.__totalBase = baseDays.length);
  [...new Set(baseDays.map(x => x.stay.base.region))].forEach(reg => { const ds = baseDays.filter(x => x.stay.base.region === reg); autoPlan(ds, cfg, ds[0].stay.base.regionObj || regionOf(reg)); });
  baseDays.filter(x => x.transfer).forEach(x => { if (!x.act || actById(x.act)?.type === 'ski') { x.act = 'rest'; } x.auto = `Traslado ${x.transfer.from.name} → ${x.stay.base.name} (${Math.round(x.transfer.km)} km, ≈${x.transfer.h.toFixed(1)} h)${x.transfer.crossings.length ? ' por ' + x.transfer.crossings.map(c => `${c.name.split(' (')[0]} (${c.label})`).join(' y ') : ''}. Llegada con luz y plan corto.`; });
  days.forEach(x => { const o = overrides[x.date]; if (o && x.kind === 'base') { if (o.act) x.act = o.act; if (o.alt !== undefined) x.alt = o.alt; if (o.note) x.note = o.note; x.edited = true; } });
  days.forEach(x => { if (x.act) { const a = actById(x.act); if (a?.lift && !liftOpen(a.lift, x.date)) x.liftWarn = `${LIFT(a.lift).name}: temporada desde el ${fmtDate(LIFT(a.lift).from)}`; } });

  const skiDays = days.filter(x => actById(x.act)?.type === 'ski'), skiDates = skiDays.filter(x => x.stay?.base.region === 'jungfrau').map(x => x.date), skiOther = skiDays.length - skiDates.length;
  const budget = costs(cfg, { out, ret, travelOut, travelRet, nights, base, stays, skiDates, skiOther });
  const prep = PREP.map(p => { let due = addDays(cfg.depart, -p.days); if (p.notBefore && due < p.notBefore) due = p.notBefore; return { ...p, due }; })
    .sort((a, b) => a.due.localeCompare(b.due));

  return { cfg, base, endBase, stays, skiOther, out, ret, travelOut, travelRet, arrive, leave, nights, homeArrive, days, warn, budget, prep, skiDates, fx: LIVE.fx,
    totalDays: diffDays(cfg.depart, cfg.homeBy) + 1, approx: out.profile.approx || ret.profile.approx };
}
export const hhmm = h => `${String(Math.floor(h) % 24).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

/* Reparto automático de actividades */
function autoPlan(baseDays, cfg, R) {
  if (!baseDays.length) return;
  const acts = activitiesFor(R), A = id => acts.find(a => a.id === id), ok = (id, d) => A(id) && liftOpen(A(id).lift, d);
  const SKI = R.detailed ? ['ski-first', 'ski-kleine', 'ski-murren', 'ski-kleine'] : [`ski@${R.id}`];
  const DOGHIKE = R.detailed ? ['hike-bachalp', 'hike-mannlichen', 'hike-murren', 'valley-stechelberg'] : [`hike@${R.id}`, `valley@${R.id}`];
  const POOL = R.detailed
    ? ['hike-bachalp', 'hike-mannlichen', 'valley-stechelberg', 'hike-murren', 'hike-bort', cfg.interests.pool ? 'town-grindelwald' : null, cfg.interests.snowshoe ? 'hike-faulhorn' : null, cfg.interests.trail ? 'valley-aar' : null, cfg.interests.sled ? 'sled-pintenfritz' : null]
    : [`hike@${R.id}`, cfg.interests.snowshoe ? `snowshoe@${R.id}` : null, cfg.interests.trail ? `valley@${R.id}` : null, cfg.interests.pool ? `town@${R.id}` : null, cfg.interests.sled ? `sled@${R.id}` : null];
  const pool = POOL.filter(Boolean);
  const last = baseDays[baseDays.length - 1];
  if (baseDays.length > 3) { last.act = DOGHIKE.at(-1); last.auto = 'Día suave: preparar la salida (ropa seca, grises vacíos, depósito, cadenas a mano).'; }
  const mid = baseDays.length > 3 ? baseDays.slice(0, -1) : baseDays.slice();
  // Compra: víspera del primer festivo (o mitad de estancia)
  const firstClosed = mid.findIndex(x => x.hol?.kind === 'closed' || x.hol?.kind === 'half');
  let shopIdx = firstClosed > 0 ? firstClosed - 1 : Math.floor(mid.length / 2);
  if (mid[shopIdx]?.hol) shopIdx = Math.max(0, shopIdx - 1);
  if (mid.length > 2 || firstClosed > 0) { mid[shopIdx].act = 'shop'; mid[shopIdx].auto = 'Compra para los próximos días, una colada y vaciado/llenado.'; }
  // Esquí repartido (los días de esquí totales se reparten en proporción a las noches de cada zona)
  const share = Math.round(cfg.skiDays * baseDays.length / Math.max(1, baseDays[0].__totalBase || baseDays.length));
  const free = mid.filter(x => !x.act), skiN = cfg.interests.ski && cfg.skiers > 0 ? Math.min(share, free.length) : 0;
  const skiable = free.filter(x => SKI.some(id => ok(id, x.date)));
  const pickIdx = n => Array.from({ length: n }, (_, i) => Math.round((i + 0.5) * skiable.length / n - 0.5));
  let r = 0;
  pickIdx(Math.min(skiN, skiable.length)).forEach(i => { const x = skiable[i]; if (!x || x.act) return;
    let a = SKI[r++ % SKI.length]; for (let t = 0; t < 4 && !ok(a, x.date); t++) a = SKI[r++ % SKI.length];
    x.act = a; x.alt = cfg.adults > cfg.skiers ? (DOGHIKE.find(h => ok(h, x.date)) || '') : ''; });
  let streak = 0, pi = 0; const used = new Set();
  mid.forEach(x => {
    if (x.act) { streak = x.act === 'shop' ? 0 : streak + 1; return; }
    if (streak >= 3) { x.act = 'rest'; streak = 0; return; }
    for (let t = 0; t < pool.length * 2; t++) { const a = pool[pi++ % pool.length];
      if (ok(a, x.date) && (!used.has(a) || used.size >= pool.length)) { x.act = a; used.add(a); break; } }
    x.act ||= DOGHIKE.at(-1); streak++;
  });
}

/* ─────────── Costes ─────────── */
/* Precio por noche en la moneda del camping (CHF o EUR) */
export function nightPrice(cfg, base = baseOf(cfg), override = 0) {
  if (override > 0) return override;
  const extra = base.incl ? Math.max(0, cfg.adults - base.incl) * (base.extraAdult || 0) : cfg.adults * (base.adult || 0);
  const dogs = Math.max(0, cfg.dogs - (base.dogFree || 0)) * (base.dog || 0);
  return base.pitch + extra + cfg.adults * (base.tax || 0) + (base.vehicleTax || 0) + dogs + (base.elec || 0);
}
export const toEUR = (v, cur, fx) => cur === 'EUR' ? v : v / fx;
export const money = (v, cur) => `${Math.round(v)} ${cur === 'EUR' ? '€' : 'CHF'}`;

/* Costes de los pasos entre dos zonas (trenes y túneles) */
export function crossingCosts(from, to, date, fx) {
  const out = [], cf = countryOf(from), ct = countryOf(to), sf = sideOf(from), sto = sideOf(to);
  const wkend = [0, 5, 6].includes(D(date).getDay()) || HOLIDAYS[date]?.kind === 'closed';
  if ((sf === 'bern') !== (sto === 'bern') && (sf === 'bern' || sto === 'bern') && [sf, sto].includes('valais')) {
    const chf = wkend ? CROSSINGS.loetschberg.chfWeekend : CROSSINGS.loetschberg.chfWeek;
    out.push({ ...CROSSINGS.loetschberg, eur: chf / fx, label: `${chf} CHF (${wkend ? 'vie–dom/festivo' : 'lun–jue'})` });
  }
  if ((cf === 'CH' && ct === 'IT') || (cf === 'IT' && ct === 'CH')) out.push({ ...CROSSINGS.gsb, label: '33,50 €' });
  if ((cf === 'FR' && ct === 'IT') || (cf === 'IT' && ct === 'FR')) { const e = cf === 'FR' ? CROSSINGS.montblanc.eurFrIt : CROSSINGS.montblanc.eurItFr; out.push({ ...CROSSINGS.montblanc, eur: e, label: `${String(e).replace('.', ',')} €` }); }
  return out;
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
  const esKm = p.out.profile.esKm + p.ret.profile.esKm, frKm = p.out.profile.frKm + p.ret.profile.frKm, chKm = p.out.profile.chKm + p.ret.profile.chKm + cfg.localKm + p.stays.reduce((a, st) => a + (st.transfer?.km || 0), 0);
  const fuel = L(esKm) * pES + L(frKm) * pFR + L(chKm) * pCH / fx;
  const tolls = (c2 ? STRATEGIES[cfg.outStrategy].tollsC2 : STRATEGIES[cfg.outStrategy].tollsC1) + (c2 ? STRATEGIES[cfg.retStrategy].tollsC2 : STRATEGIES[cfg.retStrategy].tollsC1);
  const stops = [...p.travelOut, ...p.travelRet].filter(t => t.stop);
  const frNights = stops.reduce((a, t) => a + t.stop.price, 0) + (stops.some(t => t.stop.card) ? CCP_CARD_EUR : 0);
  const camp = p.stays.reduce((a, st) => a + Math.max(0, st.nights) * toEUR(st.np, st.cur, fx), 0);
  const crosses = p.stays.flatMap(st => st.transfer?.crossings || []);
  const crossEUR = crosses.reduce((a, x) => a + x.eur, 0);
  const inCH = p.stays.some(st => st.country === 'CH');
  const trKm = p.stays.reduce((a, st) => a + (st.transfer?.km || 0), 0);
  const totalDays = diffDays(cfg.depart, cfg.homeBy) + 1;
  const food = cfg.foodPerDay * totalDays + cfg.eatOutMeals * 30 / fx;
  const jfDays = p.skiDates.length && p.skiOther ? p.skiDates.length : (p.skiOther ? 0 : cfg.skiDays);
  const ski = cfg.interests.ski ? (cfg.skiers * (skipassCHF(jfDays, p.skiDates) + p.skiOther * (cfg.skiDayOther || 80)) + cfg.halfDays * cfg.skiers * 65) / fx : 0;
  const pass = cfg.winterPassDays * WINTER_PASS_CHF / fx, sled = cfg.sledRides * SLED_CHF / fx, sitter = cfg.sitterHours * SITTER_CHF_H / fx;
  const laundry = cfg.laundryLoads * 10 / fx, vign = (inCH && cfg.vignette !== false ? VIGNETTE_CHF / fx : 0) + CRITAIR_EUR;
  const items = [
    { k: 'fuel', l: 'Combustible', v: fuel, n: `${Math.round(esKm + frKm + chKm).toLocaleString('es-ES')} km · ${Math.round(L(esKm + frKm + chKm))} l · España ${pES.toFixed(3)} €/l, Francia ${pFR.toFixed(3)} €/l` },
    { k: 'tolls', l: 'Peajes de ida y vuelta', v: tolls, n: `Ida ${STRATEGIES[cfg.outStrategy].short}, vuelta ${STRATEGIES[cfg.retStrategy].short} · clase ${c2 ? 2 : 1} (altura ${cfg.van.height} m)${STRATEGIES[cfg.retStrategy].tunnel ? ` · incluye ${STRATEGIES[cfg.retStrategy].tunnel.name} ${STRATEGIES[cfg.retStrategy].tunnel.eur} €` : ''}${STRATEGIES[cfg.retStrategy].estTolls ? ' · peajes italianos y del sur de Francia estimados' : ''}` },
    { k: 'vign', l: inCH && cfg.vignette !== false ? "Viñeta suiza + Crit'Air" : "Crit'Air (sin viñeta suiza)", v: vign, n: inCH && cfg.vignette !== false ? '40 CHF + ≈5 €' : 'Por Suiza sin autopistas: carreteras cantonales y tren del Lötschberg' },
    { k: 'cross', l: 'Trenes y túneles entre zonas', v: crossEUR, n: crosses.map(x => `${x.name.split(' (')[0]}: ${x.label}`).join(' · ') || 'Ninguno' },
    { k: 'fr', l: 'Paradas en Francia', v: frNights, n: `${stops.length} noches${stops.some(t => t.stop.card) ? ' + tarjeta Camping-Car Park 5 €' : ''}` },
    { k: 'camp', l: p.stays.length > 1 ? `Alojamiento (${p.stays.length} estancias)` : `Camping ${p.base.name}`, v: camp, n: p.stays.map(st => `${st.base.name}: ${st.nights} n × ${money(st.np, st.cur)}${st.price ? ' (tu precio)' : ''}`).join(' · ') + ` · ${cfg.adults} adultos, ${cfg.dogs} perros` },
    { k: 'food', l: 'Comida y compra', v: food, n: `${cfg.foodPerDay} €/día × ${totalDays} días${cfg.eatOutMeals ? ` + ${cfg.eatOutMeals} comidas fuera` : ''}` },
    { k: 'ski', l: 'Forfaits de esquí', v: ski, n: cfg.interests.ski ? `${cfg.skiers} esquiador(es) · ${jfDays ? `Jungfrau ${jfDays} días (${p.skiDates.some(isHigh) ? 'alta' : 'baja'})` : ''}${jfDays && p.skiOther ? ' + ' : ''}${p.skiOther ? `otras zonas ${p.skiOther} días × ${cfg.skiDayOther} CHF` : ''}${cfg.halfDays ? ` + ${cfg.halfDays} medios días` : ''}` : 'Sin esquí' },
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
