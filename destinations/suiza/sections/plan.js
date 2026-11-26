// Pantalla principal: el viaje entero como itinerario editable.
import { IMG, BASES, REGIONS, STRATEGIES, STOPS, ZONES, ROUTE_SHOWERS, CHECKED } from '../data.js';
import { fmtDate, fmtLong, hhmm, diffDays, addDays, getCfg, staysOf, actById, activitiesFor, regionOf, nightPrice, money, curOf, countryOf, iso, plan as computePlan } from '../engine.js';
import { bindCfg } from '../common.js';
import { openRoadbook } from '../roadbook.js';

const FLAG = { FR: '🇫🇷', CH: '🇨🇭', IT: '🇮🇹' };
const short = b => b.short || b.town.split(' (')[0];
const enc = encodeURIComponent;

/* ─────────── Bloques ─────────── */
const daysSel = (k, v) => `<label class="field" style="flex-direction:row;align-items:center;gap:10px">Días de carretera <select data-roaddays="${k}" style="width:auto">${[[0, 'Automático (según tus horas)'], [1, '1 día (sin parar a dormir)'], [2, '2 días'], [3, '3 días'], [4, '4 días']].map(([n, l]) => `<option value="${n}" ${+v === n ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
function driveCard(ctx, t, i, dir, cands) {
  const { ui, plan: p } = ctx, c = p.cfg, man = (dir === 'out' ? c.stopsOut : c.stopsRet) || {}, s = t.stop, sh = s && ROUTE_SHOWERS[s.id];
  return `<div class="drive"><span class="badge info">🚐 ${fmtDate(t.date)}</span><b>${ui.esc(t.from.replace('Camping-Car Park ', ''))} → ${ui.esc(t.to.replace('Camping-Car Park ', ''))}</b>
    <label class="small">Salida <input type="time" data-dtime="${t.date}" value="${t.departAt}" style="width:auto;padding:6px 8px;font-size:15px"></label><span>${Math.round(t.km)} km · ${t.totalH.toFixed(1)} h · llegada ≈<b>${hhmm(t.arrival)}</b></span>${t.late ? '<span class="badge warn">de noche</span>' : ''}${t.over ? '<span class="badge warn">etapa larga</span>' : ''}
    ${s || i < (dir === 'out' ? p.travelOut : p.travelRet).length - 1 ? `<label class="small" style="margin-left:auto">Dormir en <select data-stop="${dir}" data-i="${i}"><option value="">Automático${s ? ` (${s.name.replace('Camping-Car Park ', '')})` : ''}</option>${cands.map(x => `<option value="${x.id}" ${man[i] === x.id ? 'selected' : ''}>${x.name.replace('Camping-Car Park ', '')} · ${x.price ? x.price.toFixed(2) + ' €' : 'gratis'}</option>`).join('')}<option value="none" ${man[i] === 'none' ? 'selected' : ''}>Seguir sin parar</option></select></label>` : ''}
    ${s ? `<div class="small" style="flex-basis:100%;color:var(--muted)">🌙 ${s.name} · ${s.price ? s.price.toFixed(2) + ' €' : 'gratis'} · ${s.winter}${sh ? ` · 🚿 <a href="${sh.url}" target="_blank">${sh.name}</a> ${sh.price}` : ''} · <a href="https://park4night.com/en/search?lat=${s.pos[0]}&lng=${s.pos[1]}&z=14" target="_blank">park4night</a> · <a href="https://www.google.com/maps/dir/?api=1&destination=${s.pos[0]},${s.pos[1]}" target="_blank">navegar</a></div>` : ''}
  </div>`;
}

function transferCard(ctx, st) {
  const { ui } = ctx, tr = st.transfer, a = tr.from, b = st.base;
  return `<div class="drive"><span class="badge info">🚐 ${fmtDate(st.checkin)}</span><b>Traslado ${ui.esc(short(a))} → ${ui.esc(short(b))}</b><span>${Math.round(tr.km)} km · ≈${tr.h.toFixed(1)} h</span>
    <a class="small" style="margin-left:auto" href="https://www.google.com/maps/dir/?api=1&origin=${a.pos[0]},${a.pos[1]}&destination=${b.pos[0]},${b.pos[1]}" target="_blank">Ver ruta ↗</a>
    ${tr.crossings.map(x => `<div class="small" style="flex-basis:100%">💳 <b>${x.name}</b> · ${x.label} · ${x.note} <a href="${x.web}" target="_blank">oficial ↗</a></div>`).join('')}</div>`;
}

function emailFor(p, st) {
  const c = p.cfg, d = s => new Date(s + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const subj = `Booking request ${d(st.checkin)} – ${d(st.checkout)} · campervan${c.dogs ? ` + ${c.dogs} dog${c.dogs > 1 ? 's' : ''}` : ''}`;
  const body = `Hello,\n\nWe would like to stay from ${d(st.checkin)} to ${d(st.checkout)} (${st.nights} nights): ${c.adults} adults${c.dogs ? ` and ${c.dogs} dog${c.dogs > 1 ? 's' : ''} (about ${c.dogKg} kg each)` : ''}, in a campervan (${c.van.name}, ${c.van.length} m long, ${c.van.height} m high).\n\nCould you please confirm in writing availability, that ${c.dogs > 1 ? 'both dogs are' : 'the dog is'} accepted, the total price with electricity and tourist tax, and whether hot showers and water are available in winter?\n\nMany thanks.\nKind regards`;
  return `mailto:${st.base.mail}?subject=${enc(subj)}&body=${enc(body)}`;
}

function stayCard(ctx, st, idx, total) {
  const { ui, plan: p } = ctx, c = p.cfg, b = st.base, R = b.regionObj || regionOf(b.region), Z = ZONES[R.id] || null;
  const days = p.days.filter(d => d.kind === 'base' && d.stay?.i === st.i), acts = activitiesFor(R);
  const optsFor = (d) => acts.map(a => `<option value="${a.id}" ${a.id === d.act ? 'selected' : ''}>${a.name}${a.dogs ? '' : ' · sin perros'}</option>`).join('');
  const sameZone = BASES.filter(x => (x.region === b.region) || countryOf(x) === st.country);
  const camps = `<optgroup label="Comprobados">${sameZone.map(x => `<option value="${x.id}" ${x.id === b.id ? 'selected' : ''}>${x.name} · ${money(nightPrice(c, x), curOf(x))}</option>`).join('')}</optgroup>
    <optgroup label="Otros campings comprobados">${BASES.filter(x => !sameZone.includes(x)).map(x => `<option value="${x.id}">${FLAG[countryOf(x)] || ''} ${x.name}</option>`).join('')}</optgroup>
    <optgroup label="Otra zona de montaña (eliges camping después)">${REGIONS.filter(r => !r.detailed && !BASES.some(x => x.region === r.id)).map(r => `<option value="zone:${r.id}" ${b.key === 'zone:' + r.id ? 'selected' : ''}>${r.name}</option>`).join('')}</optgroup>
    ${b.generic ? `<option value="${b.key}" selected>📍 ${ui.esc(b.name)}</option>` : ''}`;
  const last = idx === total - 1;
  const showers = Z?.showers || [{ name: 'Busca piscina o polideportivo cercano', price: '', note: 'Las piscinas municipales suelen costar 5–10 € y tienen duchas calientes.', url: `https://www.google.com/maps/search/piscina/@${b.pos[0]},${b.pos[1]},12z` }];
  const shops = Z?.shops || [{ name: 'Supermercados cerca', note: 'Lidl y Aldi suelen ser los más baratos.', url: `https://www.google.com/maps/search/supermercado/@${b.pos[0]},${b.pos[1]},12z` }];
  const item = x => `<div class="item"><b>${x.url ? `<a href="${x.url}" target="_blank">${x.name}</a>` : x.name}</b>${x.price ? `<span class="price">${x.price}</span>` : ''}<div class="small">${x.note || ''}</div></div>`;
  return `<div class="leg stay"><span class="leg-dot">${idx + 1}</span>
  <div class="stay-card">
    <div class="stay-head" style="background-image:url('${Z?.img || b.img || IMG.eiger}')">
      <div class="stay-tools">${idx > 0 ? `<button data-mv="${idx}" data-d="-1" title="Subir">↑</button>` : ''}${!last ? `<button data-mv="${idx}" data-d="1" title="Bajar">↓</button>` : ''}${total > 1 ? `<button data-del="${idx}" title="Quitar parada">✕</button>` : ''}</div>
      <div class="when">${FLAG[st.country] || ''} ${fmtDate(st.checkin)} → ${fmtDate(st.checkout)} · ${st.nights} noche${st.nights === 1 ? '' : 's'}</div>
      <h2>${ui.esc(R.short || short(b))}</h2></div>
    <div class="stay-body">
      <div class="stay-edit">
        <label class="field">Dónde dormís<select data-stay="${idx}" data-k="base">${camps}</select></label>
        <label class="field" style="flex:0 1 170px">Llegada<input type="date" data-sdate="${idx}" data-k="in" value="${st.checkin}" ${idx === 0 ? '' : 'disabled title="Es el día que salís de la parada anterior"'}></label>
        <label class="field" style="flex:0 1 170px">Salida<input type="date" data-sdate="${idx}" data-k="out" value="${st.checkout}" min="${st.checkin}"></label>
        <div class="field"><span>Noches</span>${last ? `<span class="small muted">Las que quedan hasta la vuelta: <b>${st.nights}</b></span>` : `<div class="stepper"><button data-n="${idx}" data-d="-1">−</button><span>${st.nights}</span><button data-n="${idx}" data-d="1">+</button></div>`}</div>
        <label class="field" style="flex:0 1 180px">Precio real/noche (${st.cur === 'EUR' ? '€' : 'CHF'})<input type="number" min="0" data-stay="${idx}" data-k="price" value="${st.price || ''}" placeholder="${Math.round(st.np)}"></label>
      </div>
      <div class="stay-edit" style="padding-top:0">
        <label class="field">¿Otro sitio? Escribe un pueblo o valle de los Alpes (Italia, Francia, Suiza…)<input type="text" data-q="${idx}" placeholder="p. ej. Courmayeur, Cervinia, Annecy, Arolla"></label>
        <button type="button" class="btn" data-qgo="${idx}">🔎 Buscar</button>
      </div><div class="link-list" id="qres-${idx}" style="margin:-6px 0 12px"></div>
      <div class="rows">
        <div class="row"><div class="k">🛏 Dormir</div><div class="v">
          <div class="item"><b>${b.web ? `<a href="${b.web}" target="_blank">${ui.esc(b.name)}</a>` : ui.esc(b.name)}</b><span class="price">≈${money(st.np, st.cur)}/noche</span>${b.status === 'ok' ? '' : ` <span class="badge ${b.status === 'bad' ? 'bad' : 'warn'}">${b.verdict}</span>`}</div>
          <div class="small">${(b.pros || []).slice(0, 4).join(' · ')}</div>
          ${(b.cons || []).length ? `<div class="small" style="color:var(--warn)">⚠ ${b.cons.join(' · ')}</div>` : ''}
          <div class="link-list" style="margin-top:8px">${b.mail ? `<a href="${emailFor(p, st)}">✉️ Pedir reserva</a>` : ''}${b.tel ? `<a href="tel:${b.tel.replace(/\s/g, '')}">📞 ${b.tel}</a>` : ''}<a href="https://park4night.com/en/search?lat=${b.pos[0]}&lng=${b.pos[1]}&z=13" target="_blank">Más sitios en park4night</a><button type="button" class="btn sm" data-near="${idx}">📍 Campings reales cerca</button></div>
          <div id="near-${idx}"></div>
          ${b.generic ? '' : `<div class="verified">✓ Comprobado ${CHECKED}</div>`}</div></div>
        <div class="row"><div class="k">🚿 Ducharse</div><div class="v">${showers.map(item).join('')}</div></div>
        <div class="row"><div class="k">🛒 Comprar</div><div class="v">${shops.map(item).join('')}</div></div>
        <div class="row"><div class="k">⛷️ Cada día</div><div class="v"><div class="days-mini">${days.map(d => `<div class="d"><span><b>${fmtDate(d.date)}</b>${d.hol ? `<br><span class="badge ${d.hol.kind === 'closed' ? 'bad' : 'warn'}">${d.hol.name}</span>` : ''}${d.transfer ? '<br><span class="badge info">traslado</span>' : ''}</span>
          <select data-day="${d.date}" data-k="act">${optsFor(d)}</select></div>`).join('') || '<span class="muted small">Solo noche de paso.</span>'}</div>
          ${(Z?.todo || []).length ? `<p class="small muted" style="margin-top:10px">Ideas: ${Z.todo.join(' · ')}</p>` : ''}</div></div>
        ${c.dogs ? `<div class="row"><div class="k">🐕 Perros</div><div class="v small">${(Z?.dogs || ['Correa en pueblos y senderos; prohibidos en pistas', 'Comprobad la norma de cada remonte']).join(' · ')}</div></div>` : ''}
        <div class="row"><div class="k">⚠️ Ojo</div><div class="v small">${[...(Z?.tips || []), R.camper].filter(Boolean).join(' · ') || 'Nada especial.'}</div></div>
        ${last ? `<div class="row"><div class="k">🔀 ¿Francia o Italia?</div><div class="v"><p class="small muted">Compara dónde pasar esta última parada. Las noches, la vuelta y el total se recalculan con cada opción.</p><div id="compare-last"><span class="loader"></span></div></div></div>` : ''}
        <div class="row"><div class="k">🔗 Enlaces</div><div class="v">${ui.links([...(Z?.links || [['Web de la zona', R.web]]), ['Rutas en Wikiloc', `https://www.wikiloc.com/wikiloc/map.do?sw=${(b.pos[0] - .05).toFixed(3)}%2C${(b.pos[1] - .07).toFixed(3)}&ne=${(b.pos[0] + .05).toFixed(3)}%2C${(b.pos[1] + .07).toFixed(3)}`]])}</div></div>
      </div>
    </div>
  </div></div>
  <div class="add-stop"><button class="btn sm" data-add="${idx + 1}">＋ Añadir parada aquí</button></div>`;
}

function drawer(ctx) {
  const { ui, plan: p } = ctx, c = p.cfg, t = ui.term;
  return `<div class="drawer-bg" id="dbg"></div><aside class="drawer" id="drawer" aria-label="Ajustes del viaje">
    <div style="display:flex;justify-content:space-between;align-items:center"><h2>Ajustes del viaje</h2><button class="btn sm" id="dclose">✕ Cerrar</button></div>
    <p class="small muted">Cada cambio recalcula el itinerario al momento.</p>
    <fieldset><legend>📅 Fechas</legend><div class="form-grid">
      ${ui.dateIn('depart', 'Salida', c.depart)}${ui.timeIn('departTime', 'Hora de salida', c.departTime)}
      ${ui.dateIn('homeBy', 'En casa como tarde', c.homeBy)}${ui.num('maxHours', 'Máx. horas al volante/día', c.maxHours, { min: 3, max: 14, step: 0.5 })}
    </div><div class="btn-row">${ui.tog('bufferDay', 'Guardar un día colchón al final', c.bufferDay)}</div></fieldset>
    <fieldset><legend>📍 Origen</legend><div class="form-grid"><label class="field">Ciudad<input type="text" id="origin-q" value="${ui.esc(c.origin.name)}"></label><div style="display:flex;align-items:flex-end"><button class="btn" id="origin-go" type="button">Buscar</button></div></div><div id="origin-res" class="link-list" style="margin-top:10px"></div></fieldset>
    <fieldset><legend>🛣️ Ruta</legend><div class="form-grid">
      ${ui.sel('outStrategy', 'Ida', c.outStrategy, Object.entries(STRATEGIES).filter(([, s]) => !s.onlyRet).map(([k, s]) => [k, s.name]))}
      ${ui.sel('retStrategy', 'Vuelta', c.retStrategy, Object.entries(STRATEGIES).map(([k, s]) => [k, s.name]))}
    </div><div class="btn-row">${ui.tog('vignette', 'Viñeta suiza (40 CHF) para usar autopistas en Suiza', c.vignette !== false)}</div>
    <p class="small muted">${STRATEGIES[c.retStrategy].what}</p></fieldset>
    <fieldset><legend>👥 Viajeros y perros</legend><div class="form-grid">
      ${ui.num('adults', 'Adultos', c.adults, { min: 1, max: 6 })}${ui.num('skiers', 'Esquían', c.skiers, { min: 0, max: c.adults })}
      ${ui.num('dogs', 'Perros', c.dogs, { min: 0, max: 5 })}${ui.txt('dogNames', 'Nombres', c.dogNames)}${ui.num('dogKg', 'Peso por perro (kg)', c.dogKg, { min: 1, max: 80 })}
    </div></fieldset>
    <fieldset><legend>🚐 Furgoneta</legend><div class="form-grid">
      ${ui.txt('van.name', 'Modelo', c.van.name)}
      <label class="field">Altura total (m)<input type="number" data-cfg="van.height" value="${c.van.height}" step="0.01" min="1.5" max="4"><small>≤2,00 m = ${t('clase de peaje', 'clase 1')} en peajes y túneles</small></label>
      ${ui.num('van.length', 'Longitud (m)', c.van.length, { min: 3, max: 10, step: 0.01 })}${ui.num('van.cons', 'Consumo (l/100)', c.van.cons, { min: 4, max: 20, step: 0.1 })}
      ${ui.num('van.tank', 'Depósito (l)', c.van.tank, { min: 30, max: 200 })}${ui.sel('van.fuel', 'Combustible', c.van.fuel, [['diesel', 'Diésel'], ['gasolina', 'Gasolina']])}
    </div></fieldset>
    <fieldset><legend>⛷️ Actividades</legend>
      <div class="btn-row">${[['ski', 'Esquí'], ['tour', 'Travesía'], ['trail', 'Trail'], ['snowshoe', 'Raquetas'], ['sled', 'Trineo'], ['pool', 'Piscina']].map(([k, l]) => ui.tog('interests.' + k, l, c.interests[k])).join('')}</div>
      <div class="form-grid">${ui.num('skiDays', 'Días de esquí', c.skiDays, { min: 0, max: 12 })}${ui.num('skiDayOther', 'Forfait/día fuera de Jungfrau (CHF)', c.skiDayOther, { min: 0, max: 200 })}
      ${ui.num('winterPassDays', 'Días de pase invernal', c.winterPassDays, { min: 0, max: 30 })}${ui.num('sitterHours', 'Horas de cuidador', c.sitterHours, { min: 0, max: 80 })}</div></fieldset>
    <fieldset><legend>💶 Gastos</legend><div class="form-grid">
      ${ui.num('foodPerDay', 'Comida (€/día)', c.foodPerDay, { min: 5, max: 200 })}${ui.num('eatOutMeals', 'Comidas fuera', c.eatOutMeals, { min: 0, max: 40 })}
      ${ui.num('laundryLoads', 'Coladas', c.laundryLoads, { min: 0, max: 10 })}${ui.num('insurance', 'Seguro (€)', c.insurance, { min: 0, max: 1000, step: 5 })}
      ${ui.num('contingencyPct', 'Imprevistos (%)', c.contingencyPct, { min: 0, max: 40 })}${ui.num('localKm', 'Km extra en destino', c.localKm, { min: 0, max: 2000, step: 10 })}
    </div></fieldset>
    <div class="btn-row"><button class="btn" id="reset">↺ Volver al itinerario inicial</button></div>
  </aside>`;
}

/* ─────────── Sección ─────────── */
export default {
  id: 'plan', title: 'Itinerario', icon: '🗺️',
  bg: [IMG.chamonix, IMG.montblanc, IMG.champoluc, IMG.unterseen],
  render(ctx) {
    const { ui, plan: p } = ctx, c = p.cfg, today = iso(new Date()), left = diffDays(today, c.depart);
    const candOut = STOPS.filter(s => s.strat.includes(c.outStrategy)), candRet = STOPS.filter(s => s.strat.includes(c.retStrategy));
    return `
    <section class="trip-hero">
      <p class="kicker">${fmtLong(c.depart)} – ${fmtLong(c.homeBy)}</p>
      <h1>${p.stays.map(st => ui.esc(st.base.regionObj?.short || short(st.base))).join(' → ')}</h1>
      <div class="chips">
        ${left > 0 ? `<span class="chip">⏳ ${left} <small>días para salir</small></span>` : ''}
        <span class="chip">🌙 ${p.nights} <small>noches</small></span>
        <span class="chip">🚐 ${Math.round(p.budget.km).toLocaleString('es-ES')} <small>km</small></span>
        <a class="chip" href="#/suiza/presupuesto" style="color:inherit;text-decoration:none">💶 ${ui.eur(p.budget.total)} <small>· ${ui.eur(p.budget.total / c.adults)}/persona</small></a>
        <span class="chip">🐕 ${c.dogs} <small>perros</small></span>
      </div>
      <div class="btn-row"><button class="btn primary" id="dopen">⚙️ Ajustes del viaje</button><button class="btn" id="rb">📄 PDF</button><button class="btn" id="ics">📆 Calendario</button></div>
      ${p.warn.length ? `<div class="warn-list">${p.warn.map(w => `<div class="warn-item ${w.lvl}">${w.lvl === 'bad' ? '⛔' : '⚠️'} ${w.t}</div>`).join('')}</div>` : ''}
    </section>
    <div class="map" id="plan-map" style="height:380px;margin-bottom:30px"></div>

    <div class="leg"><span class="leg-dot">→</span><h2 style="margin:6px 0 10px;font-size:26px">Ida · ${p.travelOut.length} día${p.travelOut.length > 1 ? 's' : ''}</h2>
      <div class="btn-row" style="margin:0 0 14px">${daysSel('outDays', c.outDays)} <span class="small muted">Salida de ${ui.esc(c.origin.name)} el ${fmtDate(c.depart)} a las ${c.dayTimes?.[c.depart] || c.departTime} · llegada el ${fmtDate(p.arrive)}</span></div>
      ${p.travelOut.map((t, i) => driveCard(ctx, t, i, 'out', candOut)).join('')}</div>
    ${p.stays.map((st, i) => (st.transfer ? `<div class="leg">${transferCard(ctx, st)}</div>` : '') + stayCard(ctx, st, i, p.stays.length)).join('')}
    <div class="leg ret"><span class="leg-dot">←</span><h2 style="margin:6px 0 10px;font-size:26px">Vuelta · ${p.travelRet.length} día${p.travelRet.length > 1 ? 's' : ''}</h2>
      <div class="btn-row" style="margin:0 0 14px">${daysSel('retDays', c.retDays)} <span class="small muted">Ruta: <b>${STRATEGIES[p.cfg.retStrategy].name}</b> · en casa el ${fmtDate(p.homeArrive)}</span></div>
      ${p.travelRet.map((t, i) => driveCard(ctx, t, i, 'ret', candRet)).join('')}
      ${c.bufferDay ? `<div class="drive"><span class="badge">${fmtDate(c.homeBy)}</span><b>Día colchón</b><span class="muted">por si una nevada retrasa la vuelta</span></div>` : ''}</div>
    ${drawer(ctx)}`;
  },

  mount(el, ctx) {
    const { ui, live, plan: p } = ctx;
    // Panel de ajustes: vive en <body> y, si está abierto, se conserva tal cual al recalcular
    // (así no se pierde el campo que estás escribiendo).
    let dr = document.querySelector('body > #drawer'), bg = document.querySelector('body > #dbg');
    const freshDr = el.querySelector('#drawer'), freshBg = el.querySelector('#dbg');
    const reuse = dr && dr.classList.contains('open');
    if (reuse) { freshDr.remove(); freshBg.remove(); }
    else {
      dr?.remove(); bg?.remove(); dr = freshDr; bg = freshBg; document.body.append(bg, dr);
      addEventListener('hashchange', function h() { if (!location.hash.startsWith('#/suiza/plan')) { dr.remove(); bg.remove(); sessionStorage.removeItem('drawer'); } removeEventListener('hashchange', h); });
    }
    const open = v => { dr.classList.toggle('open', v); bg.classList.toggle('open', v); sessionStorage.setItem('drawer', v ? '1' : ''); };
    if (location.hash.includes('ajustes')) { sessionStorage.setItem('drawer', '1'); history.replaceState(null, '', '#/suiza/plan'); }
    if (!reuse && sessionStorage.getItem('drawer')) { dr.style.transition = 'none'; open(true); requestAnimationFrame(() => dr.style.transition = ''); }
    el.querySelector('#dopen').onclick = () => open(true);
    if (!reuse) {
      dr.querySelector('#dclose').onclick = bg.onclick = () => open(false);
      bindCfg(dr, ctx);
      dr.querySelector('#reset').onclick = () => { if (confirm('¿Volver al itinerario inicial? Se pierden los cambios de paradas y días.')) { ctx.set('cfg', {}); ctx.set('dayplan', {}); open(false); ctx.rerender(); } };
      const res = dr.querySelector('#origin-res'), go = async () => {
        const q = dr.querySelector('#origin-q').value.trim(); if (!q) return; res.innerHTML = '<span class="loader"></span>';
        try { const list = await live.geocode(q); res.innerHTML = list.map((r, i) => `<a href="#" data-i="${i}">${ui.esc(r.name)}</a>`).join('') || 'Sin resultados';
          res.querySelectorAll('a').forEach(a => a.onclick = e => { e.preventDefault(); const r = list[+a.dataset.i], cfg = getCfg(ctx); cfg.origin = { name: r.name.split(',')[0], pos: r.pos }; ctx.set('cfg', cfg); ctx.rerender(); });
        } catch { res.textContent = 'No se pudo buscar ahora.'; }
      };
      dr.querySelector('#origin-go').onclick = go;
      dr.querySelector('#origin-q').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    }

    // Paradas: editar, mover, quitar, añadir
    const saveStays = fn => { const cfg = getCfg(ctx), st = staysOf(cfg); fn(st, cfg); cfg.stays = st; delete cfg.base; delete cfg.nightPriceOverride; ctx.set('cfg', cfg); ctx.toast('Itinerario recalculado'); ctx.rerender(); };
    el.querySelectorAll('[data-stay]').forEach(i => i.addEventListener('change', () => saveStays(st => { const x = st[+i.dataset.stay];
      if (i.dataset.k === 'base') { x.base = i.value; x.place = null; x.price = 0; } else x.price = +i.value || 0; })));
    el.querySelectorAll('[data-n]').forEach(b => b.onclick = () => saveStays(st => { const x = st[+b.dataset.n]; x.nights = Math.max(1, (x.nights || 1) + +b.dataset.d); }));
    el.querySelectorAll('[data-mv]').forEach(b => b.onclick = () => saveStays(st => { const i = +b.dataset.mv, j = i + +b.dataset.d; [st[i], st[j]] = [st[j], st[i]]; st.forEach((x, k) => { if (k < st.length - 1 && !x.nights) x.nights = 2; }); st.at(-1).nights = 0; }));
    el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => saveStays(st => { st.splice(+b.dataset.del, 1); st.at(-1).nights = 0; }));
    el.querySelectorAll('[data-add]').forEach(b => b.onclick = () => saveStays(st => { const at = +b.dataset.add; st.forEach((x, k) => { if (k < st.length - 1 && !x.nights) x.nights = 2; });
      if (at >= st.length) { st.at(-1).nights = 2; st.push({ base: 'zone:verbier', nights: 0, price: 0 }); } else st.splice(at, 0, { base: 'zone:verbier', nights: 2, price: 0 }); }));
    // Fechas de cada parada
    // Se aplica al salir del campo (o con Intro), no mientras se teclea
    const onCommit = (inp, fn) => { let last = inp.value, t; const run = () => { clearTimeout(t); if (inp.value && inp.value !== last) { last = inp.value; fn(); } };
      inp.addEventListener('blur', run); inp.addEventListener('keydown', e => e.key === 'Enter' && (e.preventDefault(), run()));
      inp.addEventListener('change', () => { clearTimeout(t); t = setTimeout(run, 1000); }); };
    el.querySelectorAll('[data-sdate]').forEach(inp => onCommit(inp, () => {
      const i = +inp.dataset.sdate, st = p.stays[i], lastI = p.stays.length - 1;
      const cfg = getCfg(ctx), sts = staysOf(cfg);
      if (inp.dataset.k === 'in') { // llegada a la primera parada: se mantiene tu día de salida y cambian los días de carretera
        const dd = diffDays(cfg.depart, inp.value) + 1;
        if (dd >= 1) { cfg.outDays = Math.min(4, dd); cfg.stopsOut = {}; } else { cfg.depart = inp.value; cfg.outDays = 1; cfg.stopsOut = {}; }
      } else if (i < lastI) {
        sts[i].nights = Math.max(1, diffDays(st.checkin, inp.value));
      } else { // la última parada: su salida fija la vuelta a casa
        cfg.homeBy = addDays(inp.value, (p.travelRet.length - 1) + (cfg.bufferDay ? 1 : 0));
      }
      sts.forEach((x, k) => { if (k < sts.length - 1) x.nights = Math.max(1, x.nights || p.stays[k]?.nights || 1); });
      sts.at(-1).nights = 0; cfg.stays = sts; ctx.set('cfg', cfg); ctx.toast('Fechas actualizadas'); ctx.rerender();
    }));
    // Hora de salida de cada día de carretera
    el.querySelectorAll('[data-dtime]').forEach(inp => onCommit(inp, () => {
      const cfg = getCfg(ctx); cfg.dayTimes = { ...(cfg.dayTimes || {}), [inp.dataset.dtime]: inp.value }; ctx.set('cfg', cfg); ctx.rerender();
    }));
    // Buscar cualquier lugar para una parada
    el.querySelectorAll('[data-qgo]').forEach(b => {
      const i = +b.dataset.qgo, inp = el.querySelector(`[data-q="${i}"]`), box = el.querySelector('#qres-' + i);
      const go = async () => {
        const q = inp.value.trim(); if (!q) return; box.innerHTML = '<span class="loader"></span>';
        try {
          const list = (await live.geocode(q)).filter(r => r.pos[0] > 43.3 && r.pos[0] < 48.6 && r.pos[1] > 4.5 && r.pos[1] < 16.5);
          box.innerHTML = list.map((r, k) => `<a href="#" data-k="${k}">${FLAG[r.country] || '📍'} ${ui.esc(r.name)}</a>`).join('') || '<span class="small muted">No lo encuentro en los Alpes.</span>';
          box.querySelectorAll('a').forEach(a => a.onclick = e => { e.preventDefault(); const r = list[+a.dataset.k];
            saveStays(sts => { sts[i].base = 'place'; sts[i].place = { name: r.name.split(',')[0], pos: r.pos, country: r.country }; sts[i].price = 0; }); });
        } catch { box.textContent = 'No se pudo buscar ahora.'; }
      };
      b.onclick = go; inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    });
    // Días de carretera de ida y vuelta
    el.querySelectorAll('[data-roaddays]').forEach(sel => sel.addEventListener('change', () => { const cfg = getCfg(ctx); cfg[sel.dataset.roaddays] = +sel.value;
      cfg[sel.dataset.roaddays === 'outDays' ? 'stopsOut' : 'stopsRet'] = {}; ctx.set('cfg', cfg); ctx.toast('Días de carretera actualizados'); ctx.rerender(); }));
    // Comparar la última parada
    const cmp = el.querySelector('#compare-last');
    if (cmp) {
      const lastI = p.stays.length - 1, curId = p.stays[lastI].base.id;
      const opts = ['deuxglaciers', 'champoluc', 'tschaval', 'grandassaly'].filter(id => BASES.some(b => b.id === id));
      const rows = opts.map(id => { const cfg = getCfg(ctx), sts = staysOf(cfg); sts[lastI] = { base: id, nights: 0, price: 0 };
        const q = computePlan({ ...ctx, get: (k, d) => k === 'cfg' ? { ...cfg, stays: sts } : ctx.get(k, d) }), b = BASES.find(x => x.id === id), st = q.stays[lastI];
        return { id, b, st, q, cur: id === curId }; });
      cmp.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Opción</th><th class="num">Noches</th><th class="num">€/noche</th><th>Vuelta</th><th class="num">Total viaje</th><th></th></tr></thead><tbody>${rows.map(r => `<tr>
        <td><b>${FLAG[countryOf(r.b)]} ${r.b.short || r.b.town}</b><br><span class="small muted">${r.b.name}${r.b.status !== 'ok' ? ` · ${r.b.verdict}` : ''}</span></td>
        <td class="num">${r.st.nights}</td><td class="num">${money(r.st.np, r.st.cur)}</td>
        <td class="small">${STRATEGIES[r.q.cfg.retStrategy].short} · ${r.q.travelRet.length} día${r.q.travelRet.length > 1 ? 's' : ''}${r.st.transfer?.crossings.length ? `<br>${r.st.transfer.crossings.map(x => x.name.split(' (')[0] + ' ' + x.label).join(' + ')}` : ''}</td>
        <td class="num"><b>${ui.eur(r.q.budget.total)}</b><br><span class="small ${r.q.budget.total <= p.budget.total ? '' : 'muted'}">${r.cur ? 'actual' : (r.q.budget.total < p.budget.total ? '−' : '+') + ui.eur(Math.abs(r.q.budget.total - p.budget.total))}</span></td>
        <td>${r.cur ? '<span class="badge ok">Elegida</span>' : `<button class="btn sm" data-pickzone="${r.id}">Elegir</button>`}</td></tr>`).join('')}</tbody></table></div>
        <p class="small muted" style="margin-top:8px">¿Otro sitio? Usa el buscador de arriba en esta misma ficha (Courmayeur, Cervinia, Annecy, Val Thorens…).</p>`;
      cmp.querySelectorAll('[data-pickzone]').forEach(b => b.onclick = () => saveStays(sts => { sts[lastI] = { base: b.dataset.pickzone, nights: 0, price: 0 }; }));
    }
    // Paradas de noche en ruta
    el.querySelectorAll('[data-stop]').forEach(s => s.addEventListener('change', () => { const cfg = getCfg(ctx), k = s.dataset.stop === 'out' ? 'stopsOut' : 'stopsRet', m = { ...(cfg[k] || {}) };
      if (s.value) m[s.dataset.i] = s.value; else delete m[s.dataset.i]; Object.keys(m).forEach(i => +i > +s.dataset.i && delete m[i]); cfg[k] = m; ctx.set('cfg', cfg); ctx.rerender(); }));
    // Plan de cada día
    el.querySelectorAll('[data-day]').forEach(i => i.addEventListener('change', () => { const dp = ctx.get('dayplan', {}); (dp[i.dataset.day] ||= {}).act = i.value; ctx.set('dayplan', dp); ctx.toast('Día actualizado'); ctx.rerender(); }));
    // Campings reales cerca de una parada
    el.querySelectorAll('[data-near]').forEach(b => b.onclick = async () => {
      const i = +b.dataset.near, st = p.stays[i], box = el.querySelector('#near-' + i), pos = st.base.regionObj?.pos || st.base.pos;
      box.innerHTML = '<span class="loader"></span>';
      try {
        const dist = (a, c) => Math.hypot(a[0] - c[0], (a[1] - c[1]) * 0.69) * 111;
        const list = (await live.campsites(pos, 20)).map(x => ({ ...x, km: dist(pos, x.pos) })).sort((a, c) => a.km - c.km).slice(0, 10);
        box.innerHTML = list.length ? `<div class="table-wrap" style="margin-top:10px"><table><tbody>${list.map((x, k) => `<tr><td><b>${ui.esc(x.name)}</b><br><span class="small muted">${ui.esc(x.city || '')} · ${x.kind === 'caravan_site' ? 'área autocaravanas' : 'camping'} · ${x.km.toFixed(0)} km</span></td>
          <td class="small"><a href="https://www.google.com/maps/search/?api=1&query=${enc(x.name + ' ' + (x.city || ''))}" target="_blank">opiniones</a></td><td><button class="btn sm" data-pick="${k}">Usar</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="small muted">No hay campings registrados cerca: mirad park4night.</p>';
        box.querySelectorAll('[data-pick]').forEach(btn => btn.onclick = () => { const x = list[+btn.dataset.pick];
          saveStays(sts => { const cur = sts[i], zone = st.base.key?.startsWith('zone:') ? st.base.key : 'zone:' + (st.base.regionObj?.id || st.base.region); cur.base = zone.startsWith('zone:jungfrau') ? 'place' : zone; cur.place = { name: x.name, pos: x.pos, ...(cur.base === 'place' ? { area: { name: st.base.town, pos } } : {}) }; cur.price = 0; }); });
      } catch { box.innerHTML = '<p class="small muted">No se pudo consultar ahora.</p>'; }
    });
    // Exportar
    el.querySelector('#rb').onclick = () => openRoadbook(p, ctx);
    el.querySelector('#ics').onclick = () => {
      const L2 = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CAMPlan//ES'], ds = s => s.replace(/-/g, '');
      p.days.forEach(d => { const t = d.travel ? `🚐 ${d.travel.from} → ${d.travel.to}` : d.kind === 'buffer' ? 'Día colchón' : `${short(d.stay.base)}: ${actById(d.act)?.name || 'Día libre'}`;
        const n = new Date(d.date + 'T12:00'); n.setDate(n.getDate() + 1);
        L2.push('BEGIN:VEVENT', `UID:${d.date}-camplan`, `DTSTART;VALUE=DATE:${ds(d.date)}`, `DTEND;VALUE=DATE:${ds(n.toISOString().slice(0, 10))}`, `SUMMARY:${t.replace(/[,;]/g, ' ')}`, 'END:VEVENT'); });
      L2.push('END:VCALENDAR'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([L2.join('\r\n')], { type: 'text/calendar' })); a.download = 'camplan-viaje.ics'; a.click();
    };
    // Mapa: ruta + paradas + traslados
    const map = ui.makeMap(el.querySelector('#plan-map'), [45.8, 4], 6);
    const lo = L.geoJSON({ type: 'LineString', coordinates: p.out.profile.geo }, { style: { color: '#1b6fd6', weight: 5, opacity: .85 } }).addTo(map);
    L.geoJSON({ type: 'LineString', coordinates: p.ret.profile.geo }, { style: { color: '#0a9e95', weight: 4, opacity: .8, dashArray: '8 8' } }).addTo(map);
    p.stays.forEach((st, i) => L.marker(st.base.pos, { icon: ui.pin(String(i + 1), '#0a9e95') }).addTo(map).bindPopup(`<b>${st.base.name}</b><br>${fmtDate(st.checkin)} → ${fmtDate(st.checkout)}`));
    [...p.travelOut, ...p.travelRet].filter(t => t.stop).forEach(t => L.marker(t.stop.pos, { icon: ui.pin('🌙', '#5d7189') }).addTo(map).bindPopup(t.stop.name));
    L.marker(p.cfg.origin.pos, { icon: ui.pin('🏠', '#10243a') }).addTo(map);
    p.stays.filter(x => x.transfer).forEach(st => live.route([st.transfer.from.pos, st.base.pos]).then(r => L.geoJSON(r.geo, { style: { color: '#e2463b', weight: 4 } }).addTo(map)).catch(() => {}));
    try { map.fitBounds(lo.getBounds().extend(L.latLngBounds(p.stays.map(s => s.base.pos))), { padding: [30, 30] }); } catch {}
  },
};
