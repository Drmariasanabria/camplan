import { IMG, STRATEGIES, STOPS, P } from '../data.js';
import { fmtDate, hhmm, getCfg, countryOf, sideOf } from '../engine.js';
import { warnList } from '../common.js';

function stageTable(ctx, list, dir, cands) {
  const { ui, plan: p } = ctx, c = p.cfg, man = (dir === 'out' ? c.stopsOut : c.stopsRet) || {};
  return `<div class="table-wrap"><table><thead><tr><th>Día</th><th>Tramo</th><th class="num">Km</th><th class="num">Horas</th><th>Llegada</th><th>Noche</th></tr></thead><tbody>
  ${list.map((t, i) => `<tr><td><b>${fmtDate(t.date)}</b></td><td>${ui.esc(t.from)} → ${ui.esc(t.to)}${t.over ? ' <span class="badge warn">larga</span>' : ''}</td>
    <td class="num">${Math.round(t.km)}</td><td class="num">${t.totalH.toFixed(1)}</td><td>${hhmm(t.arrival)}${t.late ? ' <span class="badge warn">de noche</span>' : ''}</td>
    <td>${i < list.length - 1 || t.stop ? `<select data-stop="${dir}" data-i="${i}"><option value="">Automática${t.stop ? ` (${t.stop.name})` : ''}</option>${cands.map(s => `<option value="${s.id}" ${man[i] === s.id ? 'selected' : ''}>${s.name} · ${s.price ? s.price.toFixed(2) + ' €' : 'gratis'}</option>`).join('')}<option value="none" ${man[i] === 'none' ? 'selected' : ''}>Sin parada: seguir hasta el final</option></select>` : '🏁'}</td></tr>`).join('')}
  </tbody></table></div>`;
}

export default {
  id: 'ruta', title: 'Ruta y etapas', icon: '🛣️',
  bg: [IMG.geneva, IMG.bourg, IMG.limoges, IMG.bern],
  render(ctx) {
    const { ui, plan: p } = ctx, c = p.cfg, t = ui.term, so = STRATEGIES[c.outStrategy], sr = STRATEGIES[c.retStrategy];
    const candOut = STOPS.filter(s => s.strat.includes(c.outStrategy)), candRet = STOPS.filter(s => s.strat.includes(c.retStrategy));
    return `<p class="kicker">Por carretera</p><h1 class="title">Ruta <span class="grad-text">y etapas</span></h1>
    <p class="lead">Ida por <b style="color:${so.color}">${so.name}</b> y vuelta por <b style="color:${sr.color}">${sr.name}</b>, con un máximo de <b>${c.maxHours} h</b> al día. Las etapas y las paradas se recalculan solas; puedes fijar cada noche a mano. <a href="#/suiza/plan">Cambiar ruta u horas →</a></p>
    ${warnList(p)}
    <div class="map" id="route-map"></div>
    <p class="small muted">Distancias sobre la ruta real (OpenStreetMap). Horas ajustadas a una camper cargada, con una pausa de 15 min cada 2 h para los perros.</p>

    <h2>Ida · <span class="grad-text">${p.travelOut.length} día${p.travelOut.length > 1 ? 's' : ''}</span></h2>
    ${stageTable(ctx, p.travelOut, 'out', candOut)}
    <h2>Vuelta · <span class="grad-text">${p.travelRet.length} día${p.travelRet.length > 1 ? 's' : ''}</span></h2>
    ${stageTable(ctx, p.travelRet, 'ret', candRet)}

    ${p.stays.length > 1 ? `<h2>Traslados <span class="grad-text">entre zonas</span></h2>
    <div class="grid g2">${p.stays.filter(st => st.transfer).map(st => { const a = st.transfer.from, b = st.base, ca = countryOf(a), cb = countryOf(b);
      const how = (ca === 'FR' && sideOf(b) === 'bern') ? `Chamonix → ${t('Forclaz', 'Col de la Forclaz')} → Martigny → valle del Ródano hasta Gampel → Goppenstein → ${t('Lötschberg', 'tren del Lötschberg')} → Kandersteg → Spiez → Interlaken. ${c.vignette !== false ? 'Con viñeta también podéis ir por la autopista Lausana–Berna (más km, sin tren).' : 'Sin viñeta, evitad la A9 Martigny–Sion: id por la carretera cantonal paralela.'}`
        : (sideOf(a) === 'bern' && cb === 'IT') ? `Interlaken → Spiez → Kandersteg → ${t('Lötschberg', 'tren del Lötschberg')} → Goppenstein → Martigny → ${t('Gran San Bernardo', 'túnel del Gran San Bernardo')} → Aosta → ${b.town}. Así no repetís el Mont Blanc (55,50 €).`
        : (ca === 'FR' && cb === 'IT') || (ca === 'IT' && cb === 'FR') ? `Por el ${t('túnel del Mont Blanc')}.` : 'Ruta por carretera entre las dos zonas.';
      return `<div class="card no-tilt"><span class="tag">${fmtDate(st.checkin)} · ${Math.round(st.transfer.km)} km · ≈${st.transfer.h.toFixed(1)} h</span><h3>${ui.esc(a.town)} → ${ui.esc(b.town)}</h3><p>${how}</p>
        ${st.transfer.crossings.map(x => `<p class="small">💳 <b>${x.name}</b>: ${x.label}. ${x.note} <a href="${x.web}" target="_blank">oficial ↗</a></p>`).join('')}
        <div class="link-list"><a href="https://www.google.com/maps/dir/?api=1&origin=${a.pos[0]},${a.pos[1]}&destination=${b.pos[0]},${b.pos[1]}" target="_blank">Ruta en Google Maps ↗</a><a href="https://www.tcs.ch/de/tools/verkehrsinfo-verkehrslage/paesse-in-der-schweiz.php" target="_blank">Estado de puertos (TCS) ↗</a></div></div>`; }).join('')}</div>` : ''}

    <h2>Paradas posibles <span class="grad-text">en ruta</span></h2>
    <div class="grid g3">${STOPS.filter(s => s.strat.includes(c.outStrategy) || s.strat.includes(c.retStrategy)).map(s => `
      <div class="card"><span class="tag ${s.status}">${s.price ? s.price.toFixed(2) + ' € / 24 h' : 'Gratis'}</span><h3>${s.card ? t('Camping-Car Park', s.name) : s.name}</h3>
      <p class="small muted">${s.addr}</p><p class="small">${s.winter}</p>${s.plus ? `<p class="small">${s.plus}</p>` : ''}
      ${s.rating ? `<p class="small">⭐ ${s.rating}/5 en ${t('park4night')}</p>` : ''}
      <div class="link-list"><a href="https://park4night.com/en/search?lat=${s.pos[0]}&lng=${s.pos[1]}&z=14" target="_blank">Opiniones en park4night ↗</a><a href="https://www.google.com/maps/dir/?api=1&destination=${s.pos[0]},${s.pos[1]}" target="_blank">Navegar ↗</a></div></div>`).join('')}</div>
    <div class="callout warn"><h3>Sin duchas en las áreas de paso</h3><p>Ninguna de estas paradas abre duchas en diciembre. Llegad con agua de sobra: los grifos se cortan con helada.</p></div>
    ${STRATEGIES[c.retStrategy].needs === 'IT' ? `<div class="callout"><h3>Vuelta desde Italia</h3><p>${STRATEGIES[c.retStrategy].what.replace('Montgenèvre', t('Montgenèvre')).replace('túnel del Mont Blanc', t('túnel del Mont Blanc'))} Equipamiento de invierno: ${t('invierno en Italia', 'normas en el Valle de Aosta')}. Peajes italianos: ${ui.link('https://www.autostrade.it/', 'calcular en Autostrade')}.</p></div>` : ''}

    <h2>Combustible <span class="grad-text">hoy</span></h2>
    <p>Las gasolineras más baratas en cada punto clave del camino, con precios oficiales de hoy (${c.van.fuel === 'diesel' ? 'diésel' : 'gasolina 95'}). Con un depósito de ${c.van.tank} l y ${c.van.cons} l/100 km tenéis ≈<b>${Math.round(c.van.tank / c.van.cons * 100 * 0.9)} km</b> de autonomía.</p>
    <div class="grid g3" id="fuel"></div>

    <h2>Tráfico, puertos <span class="grad-text">y nieve en carretera</span></h2>
    ${ui.links([['Bison Futé (tráfico Francia)', 'https://www.bison-fute.gouv.fr/'], ['VINCI Autoroutes', 'https://www.vinci-autoroutes.com/fr/trafic'], ['DGT (España)', 'https://infocar.dgt.es/etraffic/'], ['TCS (Suiza)', 'https://www.tcs.ch/de/tools/verkehrsinfo/'], ['Viasuisse', 'https://www.viasuisse.ch/'], ['Puertos alpinos', 'https://www.alpen-paesse.ch/'], ['Calcular peajes exactos', 'https://www.autoroutes.fr/es/itineraires.htm'], ['Pagar A79', 'https://www.aliae.com/en/home.html']])}
    <p class="small muted" style="margin-top:12px">Peajes de la ruta elegida: ${ui.eur(p.budget.items.find(i => i.k === 'tolls').v)} ida y vuelta en ${t('clase de peaje', `clase ${c.van.height > 2 ? 2 : 1}`)}.${so.rcea || sr.rcea ? ` La mixta pasa por la ${t('A79')}, que se paga online.` : ''}</p>`;
  },

  async mount(el, ctx) {
    const { ui, live, plan: p } = ctx, c = p.cfg;
    const map = ui.makeMap(el.querySelector('#route-map'), [45.5, 2.5], 6);
    const lo = L.geoJSON({ type: 'LineString', coordinates: p.out.profile.geo }, { style: { color: STRATEGIES[c.outStrategy].color, weight: 6, opacity: .9 } }).addTo(map);
    if (c.retStrategy !== c.outStrategy) L.geoJSON({ type: 'LineString', coordinates: p.ret.profile.geo }, { style: { color: STRATEGIES[c.retStrategy].color, weight: 4, opacity: .8, dashArray: '8 8' } }).addTo(map);
    map.fitBounds(lo.getBounds(), { padding: [30, 30] });
    L.marker(c.origin.pos, { icon: ui.pin('🏠') }).addTo(map).bindPopup(ui.esc(c.origin.name));
    L.marker(p.base.pos, { icon: ui.pin('🏔️', '#1fae78') }).addTo(map).bindPopup(p.base.name);
    [...p.travelOut, ...p.travelRet].filter(t => t.stop).forEach(t => L.marker(t.stop.pos, { icon: ui.pin('🌙', t.dir === 'out' ? '#0aa3c2' : '#c23a7a') }).addTo(map).bindPopup(`<b>${t.stop.name}</b><br>${fmtDate(t.date)} · ${t.dir === 'out' ? 'ida' : 'vuelta'}`));
    p.stays.forEach((st, i) => L.marker(st.base.pos, { icon: ui.pin(String(i + 1), '#1fae78') }).addTo(map).bindPopup(`<b>${st.base.name}</b><br>${fmtDate(st.checkin)} → ${fmtDate(st.checkout)}`));
    for (const st of p.stays.filter(x => x.transfer)) live.route([st.transfer.from.pos, st.base.pos]).then(r => L.geoJSON(r.geo, { style: { color: '#ffc65c', weight: 5, opacity: .9 } }).addTo(map).bindPopup(`Traslado ${st.transfer.from.town} → ${st.base.town}`)).catch(() => {});
    [...(countryOf(p.base) === 'CH' ? [['🛃', P.bardonnex, 'Aduana de Bardonnex']] : []), ['💧', P.grauholz, 'Área Grauholz: agua y vaciado gratis']].forEach(([e, pos, n]) => L.marker(pos, { icon: ui.pin(e, '#5b46d6') }).addTo(map).bindPopup(n));

    el.querySelectorAll('[data-stop]').forEach(s => s.addEventListener('change', () => {
      const cfg = getCfg(ctx), k = s.dataset.stop === 'out' ? 'stopsOut' : 'stopsRet', m = { ...(cfg[k] || {}) };
      if (s.value) m[s.dataset.i] = s.value; else delete m[s.dataset.i];
      Object.keys(m).forEach(i => +i > +s.dataset.i && delete m[i]); // las siguientes se recalculan
      cfg[k] = m; ctx.set('cfg', cfg); ctx.rerender();
    }));

    const spots = [['🇪🇸', 'Cantabria (salida)', () => live.fuelES('39', c.van.fuel)], ['🇪🇸', 'Gipuzkoa · antes de Irún', () => live.fuelES('20', c.van.fuel)],
      ...[...new Map([...p.travelOut, ...p.travelRet].filter(t => t.stop).map(t => [t.stop.id, t.stop])).values()].map(s => ['🇫🇷', `Cerca de ${s.name.replace('Camping-Car Park ', '').replace('Área municipal de ', '')}`, () => live.fuelFR(s.pos[0], s.pos[1], 20, c.van.fuel)]),
      ['🇫🇷', 'Saint-Julien · antes de Ginebra', () => live.fuelFR(46.144, 6.081, 20, c.van.fuel)]];
    const box = el.querySelector('#fuel');
    box.innerHTML = spots.map((s, i) => `<div class="card" id="fu${i}"><span class="tag">${s[0]} ${s[1]}</span><div class="big-num"><span class="loader"></span></div></div>`).join('');
    spots.forEach(async (s, i) => {
      const card = box.querySelector('#fu' + i);
      try {
        const l = (await s[2]()).slice(0, 3);
        card.innerHTML = `<span class="tag ok"><span class="live-dot"></span>${s[0]} ${s[1]}</span><div class="big-num">${l[0].price.toFixed(3)}<span class="small muted"> €/l</span></div>
        ${l.map(g => `<p class="small" style="margin:8px 0 0"><b>${g.price.toFixed(3)}</b> · <a href="https://www.google.com/maps/dir/?api=1&destination=${g.lat},${g.lon}" target="_blank">${ui.esc(g.name ? g.name + ' · ' + g.town : g.town)}</a><br><span class="muted">${ui.esc(g.addr)}</span></p>`).join('')}`;
      } catch { card.querySelector('.big-num').innerHTML = '<span class="small muted">Sin datos ahora</span>'; }
    });
  },
};
