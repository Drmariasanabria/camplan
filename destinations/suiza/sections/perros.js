import { IMG, P } from '../data.js';

export default {
  id: 'perros', title: 'Con los perros', icon: '🐕',
  bg: [IMG.collie, IMG.lauterbrunnen],
  render: ({ ui, ctx }) => `
  ${ui.header('Dos border collies', 'Plan <span class="grad-text">para West y compañía</span>', 'El itinerario tiene que funcionar también los días de esquí. Los perros no pueden ser un problema a resolver cuando ya estáis en un remonte.')}
  <h2>Transporte <span class="grad-text">con perro</span></h2>
  ${ui.table(['Trayecto', 'Perro', 'Nota'], [
    ['Interlaken – Lauterbrunnen / Grindelwald', '<b style="color:var(--ok)">Gratis</b>', 'Jungfraubahnen'],
    ['Lauterbrunnen – Mürren (Grütschalp)', '<b style="color:var(--ok)">Gratis</b>', ''],
    ['Lauterbrunnen – Kleine Scheidegg – Grindelwald', '<b style="color:var(--ok)">Gratis</b>', ''],
    ['Firstbahn (Grindelwald – First)', '<b style="color:var(--ok)">Gratis</b>', ''],
    ['Eigergletscher – Jungfraujoch', '30 CHF/perro', 'Mejor no'],
    ['Telecabina Männlichen', 'Preguntar', 'Otra empresa'],
    ['SBB fuera de la región', '25 CHF pase de día', ''],
    ['Pistas de esquí y trineos', '<b style="color:var(--bad)">No admitidos</b>', ''],
  ])}
  <p class="source">${ui.link('https://www.jungfrau.ch/de-ch/faq/', 'FAQ Jungfraubahnen')} · ${ui.link('https://www.sbb.ch/de/abos-billette/billette-schweiz/hunde.html', 'SBB perros')} — confirmar siempre en taquilla.</p>

  <h2>Normas <span class="grad-text">y cuidado</span></h2>
  <div class="grid g3">
    <div class="card"><span class="tag warn">Fauna</span><h3>Correa obligatoria</h3><p>En zonas de reposo y protección de fauna (Wildruhezonen). Grindelwald tiene zona protegida cantonal. Rebecos, ciervos y urogallos sufren el estrés invernal.</p>${ui.links([['Mapa oficial', 'https://natur-freizeit.ch/karte']])}</div>
    <div class="card"><span class="tag">Almohadillas</span><h3>Hielo y sal</h3><p>Bolas de hielo entre los dedos, sal en carreteras, resbalones, fatiga en nieve profunda. Botines o cera, toalla al volver.</p></div>
    <div class="card"><span class="tag">Robidog</span><h3>Papeleras para cacas</h3><p>Hay por todas partes en Suiza, con bolsas. Llevad las vuestras igualmente.</p></div>
    <div class="card"><span class="tag bad">Furgo</span><h3>Nunca horas solos</h3><p>Por la noche baja de −10 °C. Ni la calefacción programada sustituye la supervisión: una avería de batería o calefacción tiene consecuencias rápidas.</p></div>
    <div class="card"><span class="tag">Restaurantes</span><h3>Casi todos los admiten</h3><p>En montaña, preguntad al entrar.</p></div>
    <div class="card"><span class="tag">Salud</span><h3>Antiparasitario</h3><p>No obligatorio para CH/FR, pero recomendable desparasitar antes y llevar antiparasitario externo.</p></div>
  </div>

  <h2>Cuidadores <span class="grad-text">y veterinario</span></h2>
  <div class="grid g2">
    <div class="card"><span class="tag">Dog sitter</span><h3>petsitting24 Grindelwald</h3><p>Desde ≈10–30 CHF/h. Para los días que esquiéis los dos. Confirmar con antelación, sin improvisar.</p>${ui.links([['petsitting24', 'https://petsitting24.ch/en/dog-sitter/be/grindelwald'], ['Rover / Pawshake', 'https://www.pawshake.ch/']])}</div>
    <div class="card"><span class="tag bad">24 h</span><h3>Tierklinik Interlaken</h3><p>General-Guisanstrasse 39, 3800 Interlaken.<br><a href="tel:+41338222141" class="big-num" style="font-size:32px">+41 33 822 21 41</a><br>Llamar siempre antes de ir.</p></div>
  </div>
  <div class="map" id="dog-map" style="margin-top:20px"></div>
  <p class="muted small" id="dog-status"></p>`,

  async mount(el, { ui, live }) {
    const m = ui.makeMap(el.querySelector('#dog-map'), P.interlaken, 11);
    L.marker(P.tierklinik, { icon: ui.pin('🏥', '#c24040') }).addTo(m).bindPopup('<b>Tierklinik Interlaken 24 h</b><br>+41 33 822 21 41');
    L.marker(P.campingJungfrau, { icon: ui.pin('🏕️', '#1fae78') }).addTo(m).bindPopup('Camping Jungfrau');
    ui.osmLayer(el.querySelector('#dog-status'), async () => {
      const d = await live.overpass('[out:json][timeout:25];(nwr["amenity"="veterinary"](46.50,7.70,46.78,8.20);nwr["shop"="pet"](46.50,7.70,46.78,8.20);nwr["leisure"="dog_park"](46.50,7.70,46.78,8.20);nwr["amenity"="waste_basket"]["waste"~"dog_excrement"](46.58,7.88,46.64,8.06););out center tags;');
      let n = 0;
      d.elements.forEach(e => { const la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon, t = e.tags || {}; if (!la) return; n++;
        const k = t.amenity === 'veterinary' ? '🩺' : t.shop === 'pet' ? '🦴' : t.leisure === 'dog_park' ? '🌳' : '🗑️';
        L.circleMarker([la, lo], { radius: k === '🗑️' ? 4 : 7, color: '#ffc65c', fillColor: '#ff5ea8', fillOpacity: .8, weight: 2 }).addTo(m).bindPopup(`${k} <b>${ui.esc(t.name || (k === '🗑️' ? 'Robidog' : ''))}</b>${t.phone ? '<br>' + t.phone : ''}${t.opening_hours ? '<br>' + t.opening_hours : ''}`); });
      return `${n} puntos de OpenStreetMap: 🩺 veterinarios · 🦴 tiendas · 🌳 parques · 🗑️ Robidog.`;
    });
  },
};
