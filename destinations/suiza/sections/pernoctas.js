import { IMG, STOPS_FR, CAMPINGS_CH, EMAILS, P } from '../data.js';

const st = { ok: ['ok', 'Recomendado'], warn: ['warn', 'Confirmar'], bad: ['bad', 'Ojo'] };
const gmaps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export default {
  id: 'pernoctas', title: 'Pernoctas', icon: '🏕️',
  bg: [IMG.lauterbrunnen, IMG.grindelwald, IMG.thun],
  render: ({ ui, get }) => `
  ${ui.header('Alojamientos', 'Dónde dormir <span class="grad-text">con dos perros</span>', 'Dormir, conectar luz, lavar ropa y gestionar depósitos son parte del plan. En el cantón de Berna está prohibido pernoctar fuera de campings/áreas (multas 200–2.000 CHF); solo Argovia y Obwalden toleran una noche en aparcamiento público.')}

  <div class="callout ok"><h3>Decisión recomendada · Camping Jungfrau</h3><p>Lauterbrunnen, del <b>17 al 27 de diciembre (10 noches)</b>, sujeto a presupuesto y confirmación escrita para dos perros, furgoneta y electricidad. Perros gratis en los trenes de Jungfraubahnen hacia Grindelwald, Kleine Scheidegg y Mürren. Si Gletscherdorf confirma plaza y perros, es más cómodo para First/Männlichen: usadlo al menos las noches de esquí.</p></div>

  <h2>Base en Suiza</h2>
  <div class="grid g2">${CAMPINGS_CH.map(c => {
    const s = get('camp:' + c.id, '');
    return `<div class="card photo" style="min-height:520px">
      <div class="ph" style="background-image:url('${c.img}')"></div>
      <div class="body"><span class="tag ${st[c.status][0]}">${c.decision}</span>
        <h3 style="font-size:28px">${c.name}</h3><p class="muted">${c.sub}</p>
        <dl class="kv"><dt>Perros</dt><dd>${c.dogs}</dd><dt>Invierno</dt><dd>${c.winter}</dd><dt>Precio</dt><dd>${c.price}</dd></dl>
        <ul class="small" style="margin:12px 0;padding-left:18px">${c.pros.map(p => `<li>${p}</li>`).join('')}</ul>
        <div class="btn-row" style="margin:10px 0 4px">
          ${c.web ? `<a class="btn sm" href="${c.web}" target="_blank">Web ↗</a>` : ''}
          ${c.tel ? `<a class="btn sm" href="tel:${c.tel.replace(/\s/g, '')}">📞 ${c.tel}</a>` : ''}
          ${c.mail ? `<a class="btn sm" href="mailto:${c.mail}">✉️ Email</a>` : ''}
          <a class="btn sm" href="${gmaps(c.name + ' ' + c.sub)}" target="_blank">⭐ Reseñas Google</a>
          <a class="btn sm" href="https://park4night.com/en/search?lat=${c.pos[0]}&lng=${c.pos[1]}&z=14" target="_blank">park4night</a>
        </div>
        <label class="field small" style="margin-top:10px">Estado de mi gestión
          <select data-camp="${c.id}"><option value="">— sin contactar —</option>${['Email enviado', 'Esperando respuesta', 'Confirmado por escrito ✅', 'Rechazado ❌', 'Reservado y pagado 💳'].map(o => `<option ${s === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
      </div></div>`;
  }).join('')}</div>

  <h2>Mapa de <span class="grad-text">pernoctas y áreas</span></h2>
  <p class="muted">Marcadores del plan + capa en vivo de OpenStreetMap con campings, áreas de autocaravanas y puntos de vaciado alrededor de Interlaken–Grindelwald. <span id="ovp-status"></span></p>
  <div class="map" id="stay-map"></div>

  <h2>Pernoctas en ruta <span class="grad-text">(Francia)</span></h2>
  <div class="grid g3">${STOPS_FR.map(s => `
    <div class="card"><span class="tag ${st[s.status][0]}">Ruta ${s.route}</span><h3>${s.name}</h3><p class="muted small">${s.sub}</p>
      <p><b>${s.price}</b></p>${s.rating ? `<p class="stars">${'★'.repeat(Math.round(s.rating))}${'☆'.repeat(5 - Math.round(s.rating))} <span class="muted small">${s.rating}/5 park4night</span></p>` : ''}
      <p class="small">${s.notes}</p>
      <div class="link-list"><a href="${s.p4n}" target="_blank">park4night ↗</a><a href="${s.web}" target="_blank">Ficha ↗</a><a href="https://www.google.com/maps/dir/?api=1&destination=${s.pos[0]},${s.pos[1]}" target="_blank">Navegar ↗</a></div>
    </div>`).join('')}</div>
  <div class="callout warn"><h3>Sin duchas hasta Suiza</h3><p>Ni Ussel ni Thiers abren duchas en diciembre. La primera ducha caliente será en el camping suizo. Algunas áreas grandes de autopista tienen duchas de pago para camioneros (no garantizadas).</p></div>

  <h2>Mensajes <span class="grad-text">listos para enviar</span></h2>
  <p class="lead">Centrados en lo que cambia la viabilidad: número de perros y servicios de invierno. Sin respuesta escrita no hay reserva real; no pagar anticipos no reembolsables hasta confirmar camper + 2 perros.</p>
  <div class="grid g2">${EMAILS.map(m => `
    <div class="card no-tilt"><span class="tag">${m.to}</span><h3>${m.title}</h3><p class="small"><b>Subject:</b> ${m.subject}</p>
      <div class="copy-box" id="${m.id}">${ui.esc(m.body)}</div>
      <div class="btn-row"><button class="btn sm" data-copy="${m.id}">📋 Copiar</button>
      <a class="btn sm primary" href="mailto:${m.to}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}">✉️ Abrir en el correo</a></div></div>`).join('')}</div>

  <h2>Buscar más <span class="grad-text">áreas y reseñas</span></h2>
  ${ui.links([
    ['park4night · Lauterbrunnen', 'https://park4night.com/en/search?lat=46.5935&lng=7.9091&z=12'],
    ['park4night · Grindelwald', 'https://park4night.com/en/search?lat=46.6242&lng=8.0414&z=12'],
    ['park4night · Interlaken', 'https://park4night.com/en/search?lat=46.6863&lng=7.8632&z=12'],
    ['park4night · Ussel', 'https://park4night.com/en/search?lat=45.5476&lng=2.2842&z=11'],
    ['park4night · Bourg', 'https://park4night.com/en/search?lat=46.2091&lng=5.239&z=11'],
    ['Campercontact Suiza', 'https://www.campercontact.com/en/switzerland'],
    ['Caramaps', 'https://caramaps.com/'],
    ['Camping-Car Park (app)', 'https://www.campingcarpark.com/'],
    ['TCS estaciones de vaciado', 'https://www.tcs.ch/'],
    ['Camping Jungfrau en MySwitzerland', 'https://www.myswitzerland.com/es-es/'],
    ['Gletscherdorf en camping.info', 'https://www.camping.info/'],
  ])}`,

  async mount(el, { ui, live, set }) {
    ui.copyButtons(el);
    el.querySelectorAll('[data-camp]').forEach(s => s.addEventListener('change', () => set('camp:' + s.dataset.camp, s.value)));
    const map = ui.makeMap(el.querySelector('#stay-map'), P.interlaken, 11);
    CAMPINGS_CH.forEach(c => L.marker(c.pos, { icon: ui.pin('🏕️', c.status === 'ok' ? '#1fae78' : c.status === 'warn' ? '#d39a1c' : '#c24040') }).addTo(map).bindPopup(`<b>${c.name}</b><br>${c.decision}<br>${c.price}`));
    L.marker(P.grauholz, { icon: ui.pin('💧', '#0aa3c2') }).addTo(map).bindPopup('Área Grauholz (A1) · vaciado y agua gratis');
    ui.osmLayer(el.querySelector('#ovp-status'), async () => {
      const q = `[out:json][timeout:25];(nwr["tourism"~"camp_site|caravan_site"](46.50,7.70,46.78,8.20);nwr["amenity"="sanitary_dump_station"](46.50,7.70,46.78,8.20);nwr["amenity"="water_point"](46.50,7.70,46.78,8.20););out center tags;`;
      const d = await live.overpass(q);
      let n = 0;
      d.elements.forEach(e => {
        const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon; if (!lat) return;
        const t = e.tags || {}, kind = t.amenity === 'sanitary_dump_station' ? ['🚽', 'Vaciado'] : t.amenity === 'water_point' ? ['🚰', 'Agua'] : t.tourism === 'caravan_site' ? ['🚐', 'Área autocaravanas'] : ['⛺', 'Camping'];
        n++;
        L.circleMarker([lat, lon], { radius: 7, color: '#5ee7ff', fillColor: '#7c5cff', fillOpacity: .8, weight: 2 }).addTo(map)
          .bindPopup(`${kind[0]} <b>${ui.esc(t.name || kind[1])}</b><br>${kind[1]}${t.dog ? `<br>Perros: ${t.dog}` : ''}${t.website ? `<br><a href="${t.website}" target="_blank">web ↗</a>` : ''}${t.phone ? `<br>${t.phone}` : ''}<br><a href="https://park4night.com/en/search?lat=${lat}&lng=${lon}&z=15" target="_blank">park4night aquí ↗</a>`);
      });
      return `${n} puntos OSM en vivo.`;
    });
  },
};
