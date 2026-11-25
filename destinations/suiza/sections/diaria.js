import { IMG, SHOPS, SERVICES, LAUNDRY, P } from '../data.js';

export default {
  id: 'diaria', title: 'Súper, lavandería y moverse', icon: '🛒',
  bg: [IMG.interlaken, IMG.thun, IMG.wengen],
  render: ({ ui }) => `
  ${ui.header('La vida diaria', 'Vivir barato <span class="grad-text">en Suiza</span>', 'Compras, duchas, vaciados, lavandería y cómo moverse gastando lo mínimo. Separar compra grande, reposiciones y gestión técnica ahorra tiempo y dinero.')}

  <h2>Estrategia <span class="grad-text">de compra</span></h2>
  <div class="grid g3">
    <div class="card"><span class="tag ok">1 · Francia</span><h3>Compra grande antes de cruzar</h3><p>Cuanto más cerca de Ginebra, mejor. Pasta, legumbre, conservas, café, snacks y pienso sin límite de cantidad (cuentan para 150 CHF/persona/día). Carne máx. 1 kg y vino 5 l por persona.</p></div>
    <div class="card"><span class="tag ok">2 · Lidl / Aldi</span><h3>Reposición en Interlaken</h3><p>Lidl Matten y Aldi Interlaken: los más baratos de Suiza. Coop/Migros más caros; Coop Grindelwald para lo del día.</p></div>
    <div class="card"><span class="tag warn">3 · Miércoles 23</span><h3>Compra fuerte de Navidad</h3><p>24 cierra 16–17 h. 25 y 26 festivos en Berna: casi todo cerrado. Confirmad horarios en la app de cada cadena la semana antes.</p></div>
  </div>
  ${ui.table(['Tienda', 'Dirección', 'Precio', 'Notas'], SHOPS.map(s => [`<b>${s.name}</b>`, `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ' ' + s.addr)}" target="_blank">${s.addr}</a>`, s.tier, s.note]))}
  ${ui.links([['Lidl Suiza (horarios)', 'https://www.lidl.ch/'], ['Aldi Suisse', 'https://www.aldi-suisse.ch/'], ['Coop', 'https://www.coop.ch/'], ['Migros', 'https://www.migros.ch/'], ['Landi (gas, perros)', 'https://www.landi.ch/'], ['Festivos cantón Berna', 'https://www.bj.admin.ch/']])}

  <h2>Mapa en vivo: <span class="grad-text">súper, lavanderías, vaciados</span></h2>
  <p class="muted" id="osm-st"></p>
  <div class="map" id="life-map"></div>

  <h2>Agua, grises <span class="grad-text">y duchas</span></h2>
  ${ui.table(['Dónde', 'Agua', 'Grises', 'Ducha', 'Coste'], SERVICES)}
  <div class="callout bad"><h3>Grises: solo en punto autorizado</h3><p>En Suiza está prohibido vaciar en la calle o el campo. Con −10 °C, acordad con el camping su procedimiento anticongelación (cubo bajo la salida o un poco de anticongelante para grises) y usad la estación de vaciado.</p></div>

  <h2>Lavanderías</h2>
  ${ui.table(['Dónde', 'Tipo', 'Precio', 'Notas'], LAUNDRY)}
  <div class="callout"><h3>Plan de lavado barato · ≈20–30 €</h3><p>Una lavadora + secadora a mitad de estancia (el 23, día de compras) para ropa interior, capas base y toallas de los perros. La ropa técnica se seca dentro con calefacción y ventilación.</p></div>

  <h2>Moverse <span class="grad-text">a lo barato</span></h2>
  <div class="grid g3">
    <div class="card"><span class="tag ok">Gratis</span><h3>Gästekarte</h3><p>Te la da el camping. En Interlaken incluye transporte público local <b>hasta el 31/12/2026</b> (desde 1/1/2027 ya no). En Grindelwald (Gletscherdorf): bus/skibús gratis y 50 % en el Sportzentrum.</p>${ui.links([['FAQ Gästekarte Interlaken', 'https://www.interlaken.swiss/']])}</div>
    <div class="card"><span class="tag ok">Incluido</span><h3>El forfait es tu billete</h3><p>Incluye trenes de la Jungfrau Ski Region desde Interlaken Ost: no pagues parking en Grindelwald los días de esquí. Furgo aparcada en el camping.</p></div>
    <div class="card"><span class="tag ok">0 CHF</span><h3>Rutas desde el valle</h3><p>Lauterbrunnen–Stechelberg, orilla del Aar y muchos senderos invernales salen a pie sin remonte.</p></div>
    <div class="card"><span class="tag">Tren vs furgo</span><h3>Lauterbrunnen ↔ Grindelwald</h3><p>25 min en coche o en tren (perros gratis). Con nieve, el tren evita cadenas, parking y estrés.</p></div>
    <div class="card"><span class="tag warn">Parkings</span><h3>Grindelwald: solo de día</h3><p>Terminal y Teufiweg para autocaravanas solo de día y de pago. Parking Eiger+ de pago.</p></div>
    <div class="card"><span class="tag">Apps</span><h3>Instálalas ya</h3>${ui.links([['SBB Mobile', 'https://www.sbb.ch/en/'], ['Jungfrau app', 'https://www.jungfrau.ch/'], ['MeteoSwiss', 'https://www.meteoswiss.admin.ch/'], ['White Risk', 'https://whiterisk.ch/'], ['Rega', 'https://www.rega.ch/en/'], ['QuickZoll', 'https://www.bazg.admin.ch/'], ['park4night', 'https://park4night.com/'], ['Camping-Car Park', 'https://www.campingcarpark.com/']])}</div>
  </div>

  <div class="callout ok"><h3>Rutina eficiente</h3><p><b>Todos los días:</b> secado de botas, comprobación de hielo, agua potable y batería. <b>Mitad de estancia:</b> una colada y limpieza de textiles de perros. <b>Día previo a la vuelta:</b> grises vacío, ropa seca, combustible y cadenas accesibles.</p></div>`,

  async mount(el, { ui, live }) {
    const m = ui.makeMap(el.querySelector('#life-map'), [46.64, 7.93], 12);
    SHOPS.forEach(s => L.marker(s.pos, { icon: ui.pin('🛒', s.tier === '€' ? '#1fae78' : '#d39a1c') }).addTo(m).bindPopup(`<b>${s.name}</b><br>${s.addr}<br>${s.note}`));
    L.marker(P.campingJungfrau, { icon: ui.pin('🏕️') }).addTo(m).bindPopup('Camping Jungfrau');
    L.marker(P.sportzentrum, { icon: ui.pin('🏊', '#0aa3c2') }).addTo(m).bindPopup('Sportzentrum Grindelwald · duchas/piscina');
    ui.osmLayer(el.querySelector('#osm-st'), async () => {
      const bb = '(46.54,7.80,46.72,8.10)';
      const d = await live.overpass(`[out:json][timeout:25];(nwr["shop"~"supermarket|convenience"]${bb};nwr["shop"="laundry"]${bb};nwr["amenity"="sanitary_dump_station"]${bb};nwr["amenity"="shower"]${bb};nwr["amenity"="fuel"]${bb};nwr["amenity"="drinking_water"]["access"!="private"](46.58,7.88,46.64,8.06););out center tags;`);
      const ico = t => t.shop === 'laundry' ? ['🧺', '#7c5cff'] : t.amenity === 'sanitary_dump_station' ? ['🚽', '#0aa3c2'] : t.amenity === 'shower' ? ['🚿', '#0aa3c2'] : t.amenity === 'fuel' ? ['⛽', '#c24040'] : t.amenity === 'drinking_water' ? ['🚰', '#5ee7ff'] : ['🛒', '#1fae78'];
      let c = {};
      d.elements.forEach(e => { const la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon, t = e.tags || {}; if (!la) return; const [k, col] = ico(t); c[k] = (c[k] || 0) + 1;
        L.circleMarker([la, lo], { radius: 6, color: col, fillColor: col, fillOpacity: .75, weight: 1 }).addTo(m).bindPopup(`${k} <b>${ui.esc(t.name || t.brand || '')}</b>${t.opening_hours ? '<br>🕑 ' + ui.esc(t.opening_hours) : ''}${t['addr:street'] ? '<br>' + ui.esc(t['addr:street'] + ' ' + (t['addr:housenumber'] || '')) : ''}`); });
      return Object.entries(c).map(([k, v]) => `${k} ${v}`).join(' · ') + ' — horarios de OSM: confirma los de Navidad.';
    });
  },
};
