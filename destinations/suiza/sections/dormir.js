import { IMG, BASES, DISCARDED, P } from '../data.js';
import { fmtDate, nightPrice, getCfg, staysOf } from '../engine.js';

const fmtEN = s => new Date(s + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtDE = s => new Date(s + 'T12:00').toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });

function email(p, b, lang, from = p.arrive, to = p.leave) {
  const c = p.cfg, n = Math.max(1, Math.round((new Date(to) - new Date(from)) / 864e5)), dogs = c.dogs;
  if (lang === 'de') return { s: `Anfrage Winterstellplatz ${fmtDE(from)} – ${fmtDE(to)} · Camper${dogs ? ` + ${dogs} Hund${dogs > 1 ? 'e' : ''}` : ''}`,
    b: `Guten Tag\n\nWir möchten vom ${fmtDE(from)} bis ${fmtDE(to)} (${n} Nächte) bei Ihnen übernachten: ${c.adults} Erwachsene${dogs ? ` und ${dogs} Hund${dogs > 1 ? 'e' : ''} (ca. ${c.dogKg} kg)` : ''}, mit einem Campervan (${c.van.name}, ${c.van.length} m lang, ${c.van.height} m hoch).\n\nKönnten Sie uns bitte schriftlich bestätigen:\n- ob ein Winterstellplatz mit Strom frei ist${dogs ? `\n- dass ${dogs > 1 ? 'beide Hunde' : 'der Hund'} erlaubt ${dogs > 1 ? 'sind' : 'ist'}` : ''}\n- den Gesamtpreis inkl. Kurtaxe und Strom (und die Ampere des Anschlusses)\n- ob Frischwasser, Grauwasserentsorgung und warme Duschen im Winter verfügbar sind\n- ob eine späte Ankunft am ${fmtDE(from)} möglich ist\n\nVielen Dank und freundliche Grüsse` };
  return { s: `Winter pitch enquiry · ${fmtEN(from)} – ${fmtEN(to)} · campervan${dogs ? ` + ${dogs} dog${dogs > 1 ? 's' : ''}` : ''}`,
    b: `Hello,\n\nWe would like to stay from ${fmtEN(from)} to ${fmtEN(to)} (${n} nights): ${c.adults} adult${c.adults > 1 ? 's' : ''}${dogs ? ` and ${dogs} dog${dogs > 1 ? 's' : ''} (about ${c.dogKg} kg each)` : ''}, travelling in a campervan (${c.van.name}, ${c.van.length} m long, ${c.van.height} m high).\n\nCould you please confirm in writing:\n- availability of a winter pitch with electricity${dogs ? `\n- that ${dogs > 1 ? 'both dogs are' : 'the dog is'} accepted` : ''}\n- the total price including tourist tax and electricity (and the amperage of the hook-up)\n- whether fresh water, grey-water disposal and hot showers are available in winter\n- whether a late arrival on ${fmtEN(from)} is possible\n\nMany thanks in advance.\nKind regards` };
}

export default {
  id: 'dormir', title: 'Dónde dormir', icon: '🏕️',
  bg: [IMG.lauterbrunnen, IMG.grindelwald, IMG.thun],
  render(ctx) {
    const { ui, plan: p } = ctx, c = p.cfg, t = ui.term, lang = ctx.get('mailLang', 'en');
    const inStay = id => p.stays.filter(st => st.base.id === id);
    const rows = BASES.map(b => {
      const mine = inStay(b.id), np = mine[0]?.np || nightPrice(c, b), tot = np * p.nights / p.fx;
      const issues = [b.opens > p.arrive ? `Abre el ${fmtDate(b.opens)}` : null, c.dogs > b.maxDogs ? `Máx. ${b.maxDogs} perro` : null].filter(Boolean);
      return { b, np, tot, issues };
    });
    const st = ctx.get('campStatus', {});
    return `<p class="kicker">Alojamiento</p><h1 class="title">Dónde dormir <span class="grad-text">en Suiza</span></h1>
    <p class="lead">Vuestro plan: ${p.stays.map(st => `<b>${st.base.name}</b> ${fmtDate(st.checkin)} → ${fmtDate(st.checkout)} (${st.nights} n)`).join(' · ')}. Precios para <b>${c.adults} adultos y ${c.dogs} perro${c.dogs === 1 ? '' : 's'}</b>; las estancias se cambian en <a href="#/suiza/viaje">Mi viaje</a>. En el cantón de Berna está prohibido dormir fuera de campings y áreas autorizadas (multas de 200 a 2.000 CHF) y los parkings de Grindelwald para autocaravanas son solo de día.</p>
    ${p.stays.map((st, i) => st.base.generic ? `<div class="card no-tilt" style="margin-bottom:20px"><span class="tag ${st.base.verdict === 'Elige un camping' ? 'warn' : 'ok'}">Estancia ${i + 1} · ${fmtDate(st.checkin)} → ${fmtDate(st.checkout)} · ${st.nights} noches</span>
      <h3 style="font-size:26px">${st.base.verdict === 'Elige un camping' ? `Elige dónde dormir en ${ui.esc(st.base.town)}` : `📍 ${ui.esc(st.base.name)}`}</h3>
      ${st.base.cons[0] ? `<p style="color:var(--warn)">🚐 ${st.base.cons[0]}</p>` : ''}
      <p class="small muted">Campings y áreas de autocaravanas reales en ≈20 km a la redonda (OpenStreetMap). Antes de reservar confirmad por escrito que abren en invierno y aceptan ${c.dogs} perro${c.dogs === 1 ? '' : 's'}.</p>
      <div id="near-${i}" data-near='${JSON.stringify({ i, pos: st.base.regionObj?.pos || st.base.pos }).replace(/'/g, '&#39;')}'><span class="loader"></span></div>
      <div class="btn-row">${ui.links([['park4night en la zona', `https://park4night.com/en/search?lat=${st.base.pos[0]}&lng=${st.base.pos[1]}&z=11`], ['Campercontact', 'https://www.campercontact.com/en/switzerland'], ['Campings en MySwitzerland', 'https://www.myswitzerland.com/es-es/'], ['Web oficial de la zona', st.base.regionObj?.web || st.base.web]])}</div></div>` : '').join('')}
    ${ui.table(['Camping', 'Pueblo', 'CHF / noche', `Si fueran las ${p.nights} noches`, 'Para vosotros', ''], rows.map(r => [
      `<b>${r.b.name}</b>${inStay(r.b.id).length ? ` <span class="badge ok">En tu plan · ${inStay(r.b.id).reduce((a, st) => a + st.nights, 0)} n</span>` : ''}`, r.b.town, r.np.toFixed(0), ui.eur(r.tot),
      r.issues.length ? `<span class="badge bad">${r.issues.join(' · ')}</span>` : `<span class="badge ${r.b.status === 'ok' ? 'ok' : 'warn'}">${r.b.verdict}</span>`,
      inStay(r.b.id).length ? '' : `<button class="btn sm" data-base="${r.b.id}">＋ Añadir estancia</button>`]), { num: [2, 3] })}
    <p class="small muted">Precios estimados con las tarifas publicadas (parcela + adultos + tasa turística + perros + luz). Cuando os contesten, poned el precio real de cada estancia en <a href="#/suiza/viaje">Mi viaje</a>.</p>

    <div class="grid g2" style="margin-top:24px">${rows.map(({ b, np, issues }) => `
      <div class="card photo" style="min-height:560px"><div class="ph" style="background-image:url('${b.img}')"></div><div class="body">
        <span class="tag ${issues.length ? 'bad' : b.status}">${issues.length ? issues.join(' · ') : b.verdict}</span>
        <h3 style="font-size:28px">${b.name}</h3><p class="muted">${b.town} · a Grindelwald: ${b.toGrindelwald}</p>
        <p><b>≈${np.toFixed(0)} CHF/noche</b> <span class="small muted">(${b.estimate})</span></p>
        <ul class="small" style="padding-left:18px;margin:8px 0">${b.pros.map(x => `<li>${x.replace('tarjeta de huésped', t('tarjeta de huésped')).replace('Tarjeta de huésped', t('tarjeta de huésped', 'Tarjeta de huésped'))}</li>`).join('')}${b.cons.map(x => `<li style="color:var(--warn)">${x}</li>`).join('')}</ul>
        <div class="btn-row" style="margin:8px 0">${b.web ? `<a class="btn sm" href="${b.web}" target="_blank">Web ↗</a>` : ''}<a class="btn sm" href="tel:${b.tel.replace(/\s/g, '')}">📞 ${b.tel}</a>
          <a class="btn sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name + ' ' + b.town)}" target="_blank">⭐ Opiniones Google</a>
          <a class="btn sm" href="https://park4night.com/en/search?lat=${b.pos[0]}&lng=${b.pos[1]}&z=14" target="_blank">park4night</a></div>
        <label class="field small">Estado de la reserva<select data-status="${b.id}"><option value="">Sin contactar</option>${['Correo enviado', 'Esperando respuesta', 'Confirmado por escrito', 'Rechazado', 'Reservado y pagado'].map(o => `<option ${st[b.id] === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
      </div></div>`).join('')}</div>
    <div class="callout bad"><h3>Descartado: ${DISCARDED.name}</h3><p>${DISCARDED.why} <a href="${DISCARDED.web}" target="_blank">Su web ↗</a></p></div>

    <h2>Correo <span class="grad-text">para reservar</span></h2>
    <p>Escrito con vuestras fechas, viajeros, perros y furgoneta. Pide lo que de verdad decide: perros, precio total, luz y servicios en invierno.</p>
    <div class="btn-row">${ui.segmented('mailLang', [['en', 'Inglés'], ['de', 'Alemán']], lang)}</div>
    <div class="grid g2">${[...p.stays.filter(st => st.base.mail).map(st => ({ b: st.base, from: st.checkin, to: st.checkout, mine: true })), ...BASES.filter(b => b.mail && !inStay(b.id).length).map(b => ({ b, from: p.arrive, to: p.leave }))].map(({ b, from, to, mine }, k) => { const m = email(p, b, lang, from, to); b = { ...b, id: b.id + k }; return `
      <div class="card no-tilt"><span class="tag ${mine ? 'ok' : ''}">${mine ? `Tu estancia · ${fmtDate(from)} → ${fmtDate(to)}` : 'Alternativa'}</span><h3>${b.name}</h3><p class="small muted">${b.mail}</p><p class="small"><b>Asunto:</b> ${ui.esc(m.s)}</p>
      <div class="copy-box" id="m-${b.id}">${ui.esc(m.b)}</div>
      <div class="btn-row"><button class="btn sm" data-copy="m-${b.id}">📋 Copiar</button><a class="btn sm primary" href="mailto:${b.mail}?subject=${encodeURIComponent(m.s)}&body=${encodeURIComponent(m.b)}">✉️ Abrir en mi correo</a></div></div>`; }).join('')}</div>
    <div class="callout warn"><h3>Sin respuesta por escrito no hay reserva</h3><p>No paguéis anticipos no reembolsables hasta que confirmen camper + ${c.dogs} perro${c.dogs === 1 ? '' : 's'} y el precio total.</p></div>

    <h2>Mapa de campings, áreas <span class="grad-text">y puntos de vaciado</span></h2>
    <p class="small muted" id="osm"></p><div class="map" id="stay-map"></div>`;
  },
  mount(el, ctx) {
    const { ui, live } = ctx;
    ui.copyButtons(el);
    el.querySelectorAll('[data-near]').forEach(async box => {
      const { i, pos } = JSON.parse(box.dataset.near), [la, lo] = pos, bb = `(${la - .18},${lo - .26},${la + .18},${lo + .26})`;
      try {
        const dist = (a, b) => Math.hypot(a[0] - b[0], (a[1] - b[1]) * 0.69) * 111;
        const list = (await live.campsites(pos, 20)).map(x => ({ t: { ...x.tags, name: x.name, tourism: x.kind, 'addr:city': x.city }, pos: x.pos }))
          .map(x => ({ ...x, km: dist(pos, x.pos) })).sort((a, b) => a.km - b.km).slice(0, 12);
        box.innerHTML = list.length ? `<div class="table-wrap"><table><thead><tr><th>Lugar</th><th>Tipo</th><th class="num">Km</th><th>Datos</th><th></th></tr></thead><tbody>${list.map((x, k) => `<tr>
          <td><b>${ui.esc(x.t.name)}</b>${x.t['addr:city'] ? `<br><span class="small muted">${ui.esc(x.t['addr:city'])}</span>` : ''}</td><td>${x.t.tourism === 'caravan_site' ? 'Área autocaravanas' : 'Camping'}</td><td class="num">${x.km.toFixed(0)}</td>
          <td class="small">${[x.t.dog ? `🐕 ${x.t.dog === 'yes' ? 'perros sí' : x.t.dog === 'no' ? 'sin perros' : x.t.dog}` : '', x.t.opening_hours ? `🕑 ${ui.esc(x.t.opening_hours)}` : '', x.t.website ? `<a href="${ui.esc(x.t.website)}" target="_blank">web ↗</a>` : '', x.t.phone ? `<a href="tel:${ui.esc(x.t.phone)}">${ui.esc(x.t.phone)}</a>` : ''].filter(Boolean).join(' · ') || '—'}
            · <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(x.t.name)}&query_place_id=" target="_blank">opiniones ↗</a></td>
          <td><button class="btn sm" data-pick="${i}" data-k="${k}">Usar este</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No hay campings registrados cerca en OpenStreetMap: mirad park4night.</p>';
        box.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { const x = list[+b.dataset.k], cfg = getCfg(ctx), sts = staysOf(cfg);
          const prev = sts[i].place, area = sts[i].base === 'place' ? (prev?.area || (prev ? { name: prev.name, pos: prev.pos } : null)) : null;
          sts[i].place = { name: x.t.name, pos: x.pos, web: x.t.website || '', phone: x.t.phone || '', email: x.t.email || x.t['contact:email'] || '', ...(area ? { area } : {}) };
          cfg.stays = sts; ctx.set('cfg', cfg); ctx.toast('Camping elegido para la estancia ' + (i + 1)); ctx.rerender(); });
      } catch { box.innerHTML = 'OpenStreetMap no responde ahora. <button class="btn sm" onclick="location.reload()">↻ Reintentar</button>'; }
    });
    el.querySelectorAll('[data-base]').forEach(b => b.onclick = () => { const cfg = getCfg(ctx), st = staysOf(cfg), last = ctx.plan.stays.at(-1);
      if (st.length) st.at(-1).nights = Math.max(1, Math.floor((last?.nights || 2) / 2)); st.push({ base: b.dataset.base, nights: 0, price: 0 });
      cfg.stays = st; delete cfg.base; delete cfg.nightPriceOverride; ctx.set('cfg', cfg); ctx.toast('Estancia añadida: ajusta las noches en Mi viaje'); ctx.rerender(); });
    el.querySelectorAll('[data-status]').forEach(s => s.onchange = () => { const st = ctx.get('campStatus', {}); st[s.dataset.status] = s.value; ctx.set('campStatus', st); ctx.toast('Guardado'); });
    el.querySelector('[data-seg=mailLang]').onclick = e => { const b = e.target.closest('button'); if (b) { ctx.set('mailLang', b.dataset.v); ctx.rerender(); } };
    const map = ui.makeMap(el.querySelector('#stay-map'), P.interlaken, 11);
    BASES.forEach(b => L.marker(b.pos, { icon: ui.pin('🏕️', b.status === 'ok' ? '#1fae78' : b.status === 'warn' ? '#d39a1c' : '#c24040') }).addTo(map).bindPopup(`<b>${b.name}</b><br>${b.verdict}`));
    ui.osmLayer(el.querySelector('#osm'), async () => {
      const d = await live.overpass('[out:json][timeout:25];(nwr["tourism"~"camp_site|caravan_site"](46.50,7.70,46.78,8.20);nwr["amenity"="sanitary_dump_station"](46.50,7.70,46.78,8.20););out center tags;');
      let n = 0; d.elements.forEach(e => { const la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon, t = e.tags || {}; if (!la) return; n++;
        L.circleMarker([la, lo], { radius: 7, color: '#5ee7ff', fillColor: '#7c5cff', fillOpacity: .8, weight: 2 }).addTo(map).bindPopup(`<b>${ui.esc(t.name || (t.amenity ? 'Punto de vaciado' : 'Camping'))}</b>${t.website ? `<br><a href="${t.website}" target="_blank">web ↗</a>` : ''}`); });
      return `${n} campings, áreas y puntos de vaciado de OpenStreetMap.`;
    });
  },
};
