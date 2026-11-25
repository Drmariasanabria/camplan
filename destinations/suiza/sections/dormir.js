import { IMG, BASES, DISCARDED, P } from '../data.js';
import { fmtDate, nightPrice, getCfg } from '../engine.js';

const fmtEN = s => new Date(s + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtDE = s => new Date(s + 'T12:00').toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });

function email(p, b, lang) {
  const c = p.cfg, n = p.nights, dogs = c.dogs;
  if (lang === 'de') return { s: `Anfrage Winterstellplatz ${fmtDE(p.arrive)} – ${fmtDE(p.leave)} · Camper${dogs ? ` + ${dogs} Hund${dogs > 1 ? 'e' : ''}` : ''}`,
    b: `Guten Tag\n\nWir möchten vom ${fmtDE(p.arrive)} bis ${fmtDE(p.leave)} (${n} Nächte) bei Ihnen übernachten: ${c.adults} Erwachsene${dogs ? ` und ${dogs} Hund${dogs > 1 ? 'e' : ''} (ca. ${c.dogKg} kg)` : ''}, mit einem Campervan (${c.van.name}, ${c.van.length} m lang, ${c.van.height} m hoch).\n\nKönnten Sie uns bitte schriftlich bestätigen:\n- ob ein Winterstellplatz mit Strom frei ist${dogs ? `\n- dass ${dogs > 1 ? 'beide Hunde' : 'der Hund'} erlaubt ${dogs > 1 ? 'sind' : 'ist'}` : ''}\n- den Gesamtpreis inkl. Kurtaxe und Strom (und die Ampere des Anschlusses)\n- ob Frischwasser, Grauwasserentsorgung und warme Duschen im Winter verfügbar sind\n- ob eine späte Ankunft am ${fmtDE(p.arrive)} möglich ist\n\nVielen Dank und freundliche Grüsse` };
  return { s: `Winter pitch enquiry · ${fmtEN(p.arrive)} – ${fmtEN(p.leave)} · campervan${dogs ? ` + ${dogs} dog${dogs > 1 ? 's' : ''}` : ''}`,
    b: `Hello,\n\nWe would like to stay from ${fmtEN(p.arrive)} to ${fmtEN(p.leave)} (${n} nights): ${c.adults} adult${c.adults > 1 ? 's' : ''}${dogs ? ` and ${dogs} dog${dogs > 1 ? 's' : ''} (about ${c.dogKg} kg each)` : ''}, travelling in a campervan (${c.van.name}, ${c.van.length} m long, ${c.van.height} m high).\n\nCould you please confirm in writing:\n- availability of a winter pitch with electricity${dogs ? `\n- that ${dogs > 1 ? 'both dogs are' : 'the dog is'} accepted` : ''}\n- the total price including tourist tax and electricity (and the amperage of the hook-up)\n- whether fresh water, grey-water disposal and hot showers are available in winter\n- whether a late arrival on ${fmtEN(p.arrive)} is possible\n\nMany thanks in advance.\nKind regards` };
}

export default {
  id: 'dormir', title: 'Dónde dormir', icon: '🏕️',
  bg: [IMG.lauterbrunnen, IMG.grindelwald, IMG.thun],
  render(ctx) {
    const { ui, plan: p } = ctx, c = p.cfg, t = ui.term, lang = ctx.get('mailLang', 'en');
    const rows = BASES.map(b => {
      const np = nightPrice({ ...c, nightPriceOverride: b.id === c.base ? c.nightPriceOverride : 0 }, b), tot = np * p.nights / p.fx;
      const issues = [b.opens > p.arrive ? `Abre el ${fmtDate(b.opens)}` : null, c.dogs > b.maxDogs ? `Máx. ${b.maxDogs} perro` : null].filter(Boolean);
      return { b, np, tot, issues };
    });
    const st = ctx.get('campStatus', {});
    return `<p class="kicker">Alojamiento</p><h1 class="title">Dónde dormir <span class="grad-text">en Suiza</span></h1>
    <p class="lead">Precios calculados para <b>${c.adults} adultos y ${c.dogs} perro${c.dogs === 1 ? '' : 's'}</b>, del ${fmtDate(p.arrive)} al ${fmtDate(p.leave)} (<b>${p.nights} noches</b>). En el cantón de Berna está prohibido dormir fuera de campings y áreas autorizadas (multas de 200 a 2.000 CHF) y los parkings de Grindelwald para autocaravanas son solo de día.</p>
    ${ui.table(['Camping', 'Pueblo', 'CHF / noche', `Total ${p.nights} noches`, 'Para vosotros', ''], rows.map(r => [
      `<b>${r.b.name}</b>${r.b.id === c.base ? ' <span class="badge ok">Elegido</span>' : ''}`, r.b.town, r.np.toFixed(0), ui.eur(r.tot),
      r.issues.length ? `<span class="badge bad">${r.issues.join(' · ')}</span>` : `<span class="badge ${r.b.status === 'ok' ? 'ok' : 'warn'}">${r.b.verdict}</span>`,
      r.b.id === c.base ? '' : `<button class="btn sm" data-base="${r.b.id}">Elegir</button>`]), { num: [2, 3] })}
    <p class="small muted">Precios estimados con las tarifas publicadas (parcela + adultos + tasa turística + perros + luz). Cuando os contesten, poned el precio real en <a href="#/suiza/viaje">Mi viaje</a>.</p>

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
    <div class="grid g2">${BASES.filter(b => b.mail).map(b => { const m = email(p, b, lang); return `
      <div class="card no-tilt"><span class="tag">${b.mail}</span><h3>${b.name}</h3><p class="small"><b>Asunto:</b> ${ui.esc(m.s)}</p>
      <div class="copy-box" id="m-${b.id}">${ui.esc(m.b)}</div>
      <div class="btn-row"><button class="btn sm" data-copy="m-${b.id}">📋 Copiar</button><a class="btn sm primary" href="mailto:${b.mail}?subject=${encodeURIComponent(m.s)}&body=${encodeURIComponent(m.b)}">✉️ Abrir en mi correo</a></div></div>`; }).join('')}</div>
    <div class="callout warn"><h3>Sin respuesta por escrito no hay reserva</h3><p>No paguéis anticipos no reembolsables hasta que confirmen camper + ${c.dogs} perro${c.dogs === 1 ? '' : 's'} y el precio total.</p></div>

    <h2>Mapa de campings, áreas <span class="grad-text">y puntos de vaciado</span></h2>
    <p class="small muted" id="osm"></p><div class="map" id="stay-map"></div>`;
  },
  mount(el, ctx) {
    const { ui, live } = ctx;
    ui.copyButtons(el);
    el.querySelectorAll('[data-base]').forEach(b => b.onclick = () => { const cfg = getCfg(ctx); cfg.base = b.dataset.base; cfg.nightPriceOverride = 0; ctx.set('cfg', cfg); ctx.rerender(); });
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
