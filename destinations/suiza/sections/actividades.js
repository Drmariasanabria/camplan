import { IMG, LIFTS, SKIPASS, HIKES, DAYPLAN, P } from '../data.js';

const wikiloc = ([la, lo]) => `https://www.wikiloc.com/wikiloc/map.do?sw=${(la - .04).toFixed(3)}%2C${(lo - .06).toFixed(3)}&ne=${(la + .04).toFixed(3)}%2C${(lo + .06).toFixed(3)}&act=all`;
const strava = ([la, lo]) => `https://www.strava.com/maps/global-heatmap?sport=All&style=dark&gColor=blue#13/${la}/${lo}`;
const komoot = ([la, lo]) => `https://www.komoot.com/discover/Location/@${la},${lo}/tours?sport=hike`;
const ig = tag => `https://www.instagram.com/explore/tags/${tag}/`;
const yt = q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

export default {
  id: 'actividades', title: 'Esquí y rutas', icon: '🎿',
  bg: [IMG.bachalpsee, IMG.faulhorn, IMG.kleine, IMG.murren],
  render: ({ ui, get }) => `
  ${ui.header('Región Jungfrau', 'Esquí, trail <span class="grad-text">y nieve</span>', 'Ninguna ruta es obligatoria: cada día se elige según apertura real, meteo, aludes y energía. Un sendero cerrado o sin confirmar se descarta aunque el track exista en internet.')}

  <h2>Apertura <span class="grad-text">2026/27</span></h2>
  ${ui.table(['Zona', 'Temporada'], LIFTS)}
  <div class="btn-row"><a class="btn primary" href="https://www.jungfrau.ch/de-ch/live/Pistendaten/" target="_blank"><span class="live-dot"></span>Estado de pistas, remontes y senderos HOY ↗</a></div>

  <h2>Forfait: <span class="grad-text">esquiar sin pagar de más</span></h2>
  <div class="grid g2">
    <div>${ui.table(['Forfait adulto', 'Baja (CHF)', 'Alta 19/12–03/01 (CHF)'], SKIPASS.map(r => [r[0], r[1], r[2]]), { num: [1, 2] })}
      <p class="source">Los fines de semana de temporada baja se cobra tarifa alta. Incluye el tren desde Interlaken Ost (no todos los buses). ${ui.link('https://www.jungfrau.ch/de-ch/jungfrau-ski-region/skipass-kaufen/', 'Comprar online')}</p></div>
    <div class="card no-tilt"><span class="tag">Calculadora de forfaits</span>
      <div class="grid g2">
        <label class="field">Días de esquí<input type="number" min="0" max="5" id="sk-d" value="${get('skiDays', 4)}"></label>
        <label class="field">Personas que esquían<input type="number" min="0" max="2" id="sk-p" value="${get('skiPeople', 1)}"></label>
        <label class="field">Días pase invernal (quien no esquía)<input type="number" min="0" max="9" id="sk-w" value="${get('winterDays', 3)}"><small>Winter Hiking & Sledging Pass ≈61 CHF/día</small></label>
        <label class="field">Trineo Big Pintenfritz<input type="number" min="0" max="4" id="sk-b" value="${get('pintenfritz', 0)}"><small>55 CHF/adulto</small></label>
      </div>
      <div class="big-num grad-text" id="sk-out" style="margin-top:16px">—</div><p class="muted" id="sk-out2"></p></div>
  </div>
  <div class="callout warn"><h3>Cómo organizar un día de esquí con los perros</h3>
    ${ui.table(['Modelo', 'Ventaja', 'Condición'], [['Una persona esquía; otra va con los perros', 'Más sencillo y seguro', 'Recorrido realista con transporte y regreso'], ['Ambas esquían', 'Compartir pistas', 'Cuidador profesional confirmado (petsitting24 ≈10–30 CHF/h)'], ['Día sin esquí', 'Todos juntos', 'Senderos invernales abiertos']])}</div>

  <h2>Seis rutas <span class="grad-text">para elegir bien</span></h2>
  <div class="grid g3">${HIKES.map(h => ui.photoCard({ img: h.img, tag: h.level, tagCls: h.level === 'Exigente' ? 'bad' : h.level === 'Media' ? 'warn' : 'ok', title: h.name,
    text: `${h.text}<br><b>${h.km} km · ${h.time} · ${h.up}</b><br>🐕 ${h.dogs}<br><span class="muted small">⚠️ ${h.crit}</span>`,
    extra: `<div class="link-list" style="margin-top:10px"><a href="${wikiloc(h.pos)}" target="_blank">Wikiloc</a><a href="${komoot(h.pos)}" target="_blank">Komoot</a><a href="${strava(h.pos)}" target="_blank">Heatmap</a><a href="${yt(h.name + ' winter')}" target="_blank">YouTube</a></div>` })).join('')}</div>
  <div class="map" id="hike-map" style="margin-top:22px"></div>

  <h2>Plan <span class="grad-text">día a día</span></h2>
  ${ui.table(['Día', 'Plan A', 'Perros'], DAYPLAN)}

  <div class="grid g2" style="margin-top:24px">
    <div class="card"><span class="tag">🏃 Trail running</span><h3>Fondo de valle</h3><p>Solo por senderos invernales pisados (Grindelwald ≈70 km) con microspikes y frontal, respetando pistas. Para series o rodajes llanos: Lauterbrunnen → Stechelberg y la orilla del Aar en Interlaken. Vuelta antes de oscurecer.</p></div>
    <div class="card"><span class="tag bad">⛷️ Travesía / raquetas fuera de pista</span><h3>Solo con todo</h3><p>Boletín consultado, ARVA-pala-sonda, experiencia o guía. Respetad las zonas de reposo de fauna. Con dudas, contratad guía.</p>${ui.links([['Skitourenguru', 'https://www.skitourenguru.ch/'], ['Zonas de fauna', 'https://natur-freizeit.ch/karte'], ['Guías Grindelwald', 'https://www.grindelwaldsports.ch/']])}</div>
    <div class="card"><span class="tag">🛷 Trineo</span><h3>Big Pintenfritz y Eiger Run</h3><p>Faulhorn → Grindelwald: el más largo de Europa (55 CHF billete específico). Eiger Run: pendiente hasta 36 %. <b>Ninguno con perros.</b></p></div>
    <div class="card"><span class="tag">🏊 Plan lluvia</span><h3>Sportzentrum Grindelwald</h3><p>Piscina cubierta, rocódromo, pista de hielo y ducha. 50 % dto. con Gästekarte. Tel. +41 33 854 12 30. Confirmar horario de Navidad.</p>${ui.links([['Sportzentrum', 'https://www.sportzentrum-grindelwald.ch/']])}</div>
  </div>

  <h2>Inspiración <span class="grad-text">en vivo</span></h2>
  <p class="muted">Fotos reales de Wikimedia Commons (cargadas ahora) y lo último en redes.</p>
  <div class="gallery" id="gal"><span class="loader"></span></div>
  <div style="margin-top:20px">${ui.links([['#grindelwald', ig('grindelwald')], ['#lauterbrunnen', ig('lauterbrunnen')], ['#jungfrauregion', ig('jungfrauregion')], ['#bachalpsee', ig('bachalpsee')], ['#murren', ig('murren')], ['#vanlifeswitzerland', ig('vanlifeswitzerland')], ['#wintervanlife', ig('wintervanlife')], ['#bordercollie_hiking', ig('bordercolliehiking')], ['TikTok Grindelwald', 'https://www.tiktok.com/tag/grindelwald'], ['Wikiloc región', wikiloc(P.grindelwald)], ['Strava heatmap', strava(P.grindelwald)]])}</div>`,

  async mount(el, { ui, live, get, set }) {
    const fx = await live.eurChf();
    const calc = () => {
      const d = +el.querySelector('#sk-d').value, p = +el.querySelector('#sk-p').value, w = +el.querySelector('#sk-w').value, b = +el.querySelector('#sk-b').value;
      set('skiDays', d); set('skiPeople', p); set('winterDays', w); set('pintenfritz', b);
      const ski = (SKIPASS.find(r => r[0] === `${d} día${d > 1 ? 's' : ''}`)?.[2] || 0) * p;
      const chfTot = ski + w * 61 + b * 55;
      el.querySelector('#sk-out').textContent = ui.chf(chfTot) + ' · ' + ui.eur(chfTot / fx.rate);
      el.querySelector('#sk-out2').textContent = `Forfait ${ui.chf(ski)} + pase invernal ${ui.chf(w * 61)} + trineo ${ui.chf(b * 55)} · cambio ${fx.rate.toFixed(3)} (BCE)`;
    };
    el.querySelectorAll('#sk-d,#sk-p,#sk-w,#sk-b').forEach(i => i.addEventListener('input', calc)); calc();

    const m = ui.makeMap(el.querySelector('#hike-map'), [46.62, 7.98], 12);
    HIKES.forEach(h => L.marker(h.pos, { icon: ui.pin('🥾', '#1fae78') }).addTo(m).bindPopup(`<b>${h.name}</b><br>${h.km} km · ${h.time}`));
    [['🚡', P.first, 'First 2.168 m'], ['🚡', P.mannlichen, 'Männlichen'], ['🚂', P.kleine, 'Kleine Scheidegg'], ['🏕️', P.campingJungfrau, 'Camping Jungfrau']].forEach(([e, p, n]) => L.marker(p, { icon: ui.pin(e) }).addTo(m).bindPopup(n));

    try {
      const imgs = (await Promise.all(['Grindelwald winter', 'Lauterbrunnen snow', 'Bachalpsee winter', 'Kleine Scheidegg winter', 'Mürren winter'].map(q => live.commons(q, 4).catch(() => [])))).flat();
      el.querySelector('#gal').innerHTML = imgs.map(i => `<a href="${i.page}" target="_blank" title="${ui.esc(i.title)} · ${ui.esc(i.author)}" style="background-image:url('${i.src}')"></a>`).join('') || '<p class="muted">Sin fotos ahora.</p>';
    } catch { el.querySelector('#gal').innerHTML = ''; }
  },
};
