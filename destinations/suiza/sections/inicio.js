import { IMG, TRIP, P } from '../data.js';

export default {
  id: 'inicio', title: 'Inicio', icon: '🏔️',
  bg: [IMG.grindelwald, IMG.eiger, IMG.kleine, IMG.lauterbrunnen],
  render: ({ ui }) => `
  <section class="hero">
    <p class="kicker">Alpine roadbook · invierno 2026</p>
    <h1 class="title">Grindel<span class="grad-text">wald</span><br>en camper.</h1>
    <p class="lead">Torrelavega → Francia → Oberland bernés. Del <b>16 al 29 de diciembre</b>: esquí, trail, senderismo invernal y rutas con dos border collies. Todo lo que hay que saber, pedir, pagar y llevar — con datos en vivo.</p>
    <div class="meta">
      <span class="pill">👥 2 personas</span><span class="pill">🐕 2 border collies</span><span class="pill">🚐 Transit Custom Trail</span><span class="pill">📅 14 días</span>
    </div>
    <div class="countdown" id="cd"></div>
    <div class="grid g4" style="margin-top:26px" id="live-strip">
      <div class="card"><span class="tag"><span class="live-dot"></span>Cambio</span><div class="big-num" id="ls-fx"><span class="loader"></span></div><p class="small muted" id="ls-fx2">EUR → CHF</p></div>
      <div class="card"><span class="tag"><span class="live-dot"></span>Lauterbrunnen ahora</span><div class="big-num" id="ls-t"><span class="loader"></span></div><p class="small muted" id="ls-t2">800 m</p></div>
      <div class="card"><span class="tag"><span class="live-dot"></span>Nieve en First</span><div class="big-num" id="ls-s"><span class="loader"></span></div><p class="small muted">2.168 m · modelo</p></div>
      <div class="card"><span class="tag"><span class="live-dot"></span>Aludes SLF</span><div class="big-num" id="ls-a"><span class="loader"></span></div><p class="small muted" id="ls-a2">Región Jungfrau</p></div>
    </div>
    <p class="scroll-hint">↓ Lo crítico primero</p>
  </section>

  <h2>Lo crítico <span class="grad-text">(léelo primero)</span></h2>
  <div class="grid g3">
    <div class="card"><span class="tag ok">Decisión</span><h3>Camping Jungfrau, 17→27 dic</h3><p>10 noches en Lauterbrunnen, sujeto a confirmación escrita de <b>dos perros</b>, furgo y electricidad. Conserva el día colchón del 29.</p><a href="#/suiza/pernoctas">Ver pernoctas →</a></div>
    <div class="card"><span class="tag bad">Descartado</span><h3>Eigernordwand: sin perros</h3><p>Aparece en todas las guías. Su web lo dice expresamente. Manor Farm: tarifa 2027 «dog max. 1» → no presupuestar sin excepción escrita.</p></div>
    <div class="card"><span class="tag warn">Desde 1/12</span><h3>Viñeta 2027 · 40 CHF</h3><p>Solo en <a href="https://via.admin.ch/shop/" target="_blank">via.admin.ch</a>. Válida 1/12/2026–31/01/2028. Sin ella: 200 CHF de multa.</p></div>
    <div class="card"><span class="tag warn">Ya</span><h3>Crit'Air 2</h3><p>Tarda en llegar a España. ≈5 € en la web oficial. Desconfía de las de 20–30 €.</p><a href="#/suiza/tramites">Trámites →</a></div>
    <div class="card"><span class="tag bad">Obligatorio</span><h3>3PMSF o cadenas</h3><p>Loi Montagne 1/11–31/03 en Puy-de-Dôme, Ain, Allier, Creuse… M+S ya no vale. Multa 135 €. Para una camper: ambas cosas.</p></div>
    <div class="card"><span class="tag bad">Multa 200–2.000 CHF</span><h3>Nada de pernocta libre</h3><p>Prohibido dormir fuera de campings/áreas en el cantón de Berna. Los parkings de Grindelwald (Terminal, Teufiweg) son solo de día.</p></div>
    <div class="card"><span class="tag warn">Navidad</span><h3>24 cierra pronto · 25 y 26 festivos</h3><p>Compra grande el <b>miércoles 23</b> en Lidl Matten / Aldi Interlaken.</p></div>
    <div class="card"><span class="tag">Seguro</span><h3>Rescate con cobertura Europa</h3><p>La TSE no cubre rescate. FCDME modalidad C (B + Europa) ≈150 €/adulto.</p></div>
    <div class="card"><span class="tag">Grises</span><h3>Probar la electroválvula</h3><p>Vaciado solo en punto autorizado. Pedid al camping el amperaje real (puede ser 4–6 A).</p></div>
  </div>

  <h2>El viaje <span class="grad-text">de un vistazo</span></h2>
  <div class="grid g2">
    <div class="timeline">
      ${[['Mié 16 dic', 'Torrelavega → Ussel', '≈760 km · noche Camping-Car Park Ussel'],
         ['Jue 17 dic', 'Ussel → Ginebra → Lauterbrunnen', '≈650 km · Camping Jungfrau'],
         ['18–26 dic', 'Región Jungfrau', 'Esquí, rutas invernales, trail de valle, días flexibles'],
         ['Dom 27 dic', 'Salida temprano a Ussel / Thiers', 'Área francesa'],
         ['Lun 28 dic', 'Regreso a Torrelavega', 'Casa'],
         ['Mar 29 dic', 'Día colchón', 'Nevada, incidencias o descanso']].map(([d, t, s]) => `<div class="tl-item"><div class="d">${d}</div><h3>${t}</h3><p class="muted">${s}</p></div>`).join('')}
    </div>
    <div class="card no-tilt" style="padding:0"><div id="mini-map" class="map" style="height:100%;min-height:440px;border:none"></div></div>
  </div>

  <h2>Rutina de <span class="grad-text">decisión</span> cada mañana</h2>
  <div class="grid g4">
    ${['Estado de pistas y senderos', 'Meteo, viento y aludes', 'Reglas para perros / transporte', 'Puesta de sol (≈16:45)', 'Plan de retorno al camping'].map((t, i) => `<div class="card"><div class="big-num grad-text">${i + 1}</div><h3 style="margin-top:10px">${t}</h3></div>`).join('')}
  </div>
  <div class="callout ok"><h3>Regla de oro</h3><p>Con dos perros y una camper, el mejor plan de montaña es el que permite regresar sin improvisar transporte, rescate ni pernocta en la nieve.</p></div>`,

  async mount(el, { live, ui }) {
    // Countdown
    const target = new Date(TRIP.start).getTime(), cd = el.querySelector('#cd');
    const tick = () => {
      if (!document.body.contains(cd)) return clearInterval(h);
      let s = Math.max(0, (target - Date.now()) / 1000);
      const d = Math.floor(s / 86400); s -= d * 86400; const hh = Math.floor(s / 3600); s -= hh * 3600; const m = Math.floor(s / 60); const sec = Math.floor(s - m * 60);
      cd.innerHTML = [[d, 'días'], [hh, 'horas'], [m, 'min'], [sec, 'seg']].map(([v, l]) => `<div class="cd-box"><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
    };
    const h = setInterval(tick, 1000); tick();

    // Mini mapa
    const m = ui.makeMap(el.querySelector('#mini-map'), [45.5, 2.5], 5);
    const pts = [['🏠', P.torrelavega, 'Torrelavega'], ['🌙', P.ussel, 'Ussel'], ['🛃', P.bardonnex, 'Ginebra'], ['🏔️', P.campingJungfrau, 'Lauterbrunnen']];
    pts.forEach(([e, p, n]) => L.marker(p, { icon: ui.pin(e) }).addTo(m).bindPopup(n));
    live.route([P.torrelavega, P.ussel, P.bardonnex, P.campingJungfrau]).then(r => {
      const g = L.geoJSON(r.geo, { style: { color: '#5ee7ff', weight: 5, opacity: .9 } }).addTo(m); m.fitBounds(g.getBounds(), { padding: [20, 20] });
    }).catch(() => m.fitBounds(pts.map(p => p[1])));

    // Live strip
    live.eurChf().then(f => { el.querySelector('#ls-fx').textContent = f.rate.toFixed(4); el.querySelector('#ls-fx2').textContent = `1 € = ${f.rate.toFixed(3)} CHF · BCE ${f.date}`; });
    live.snowNow(46.5935, 7.9091, 800).then(d => { el.querySelector('#ls-t').textContent = `${d.current.temperature_2m.toFixed(0)}°`; el.querySelector('#ls-t2').textContent = `${live.WMO(d.current.weather_code)} · viento ${d.current.wind_speed_10m.toFixed(0)} km/h`; }).catch(() => el.querySelector('#ls-t').textContent = '—');
    live.snowNow(46.6597, 8.0545, 2168).then(d => { el.querySelector('#ls-s').textContent = `${Math.round((d.current.snow_depth || 0) * 100)} cm`; }).catch(() => el.querySelector('#ls-s').textContent = '—');
    live.slf().then(g => {
      const f = g.features.filter(f => f.properties.regions.some(r => /^CH-(1233|1234|1241|1242|1243)$/.test(r.regionID)));
      const lvl = { low: 1, moderate: 2, considerable: 3, high: 4, very_high: 5 };
      const max = Math.max(0, ...f.flatMap(x => x.properties.dangerRatings.map(d => lvl[d.mainValue] || 0)));
      el.querySelector('#ls-a').innerHTML = max ? `<span class="danger d${max}">${max}</span>` : 'n/d';
      el.querySelector('#ls-a2').textContent = max ? ['', 'Débil', 'Limitado', 'Notable', 'Fuerte', 'Muy fuerte'][max] + ' · ' + (f[0]?.properties.regions.map(r => r.name).slice(0, 2).join(', ') || '') : 'Sin boletín para la zona';
    }).catch(() => el.querySelector('#ls-a').textContent = '—');
  },
};
