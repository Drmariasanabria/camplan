import { IMG, SHOPS, P, HOLIDAYS } from '../data.js';
import { fmtDate, fmtLong } from '../engine.js';

export default {
  id: 'destino', title: 'Compras, agua y moverse', icon: '🛒',
  bg: [IMG.interlaken, IMG.thun, IMG.wengen],
  render(ctx) {
    const { ui, plan: p } = ctx, c = p.cfg, t = ui.term;
    const hol = Object.entries(HOLIDAYS).filter(([d]) => d >= p.arrive && d <= p.leave);
    const shopDay = p.days.find(d => d.act === 'shop');
    return `<p class="kicker">En destino</p><h1 class="title">Vivir barato <span class="grad-text">en Suiza</span></h1>
    <p class="lead">Compras, festivos que os pillan, agua y vaciados, duchas, lavandería y cómo moveros gastando lo mínimo.</p>

    <h2>Festivos <span class="grad-text">durante vuestra estancia</span></h2>
    ${hol.length ? `<div class="grid g3">${hol.map(([d, h]) => `<div class="card"><span class="tag ${h.kind === 'closed' ? 'bad' : 'warn'}">${fmtDate(d)}</span><h3>${h.name}</h3><p>${h.note}</p></div>`).join('')}</div>
    <div class="callout warn"><h3>Compra grande: ${shopDay ? fmtLong(shopDay.date) : 'antes del primer festivo'}</h3><p>El plan ya la coloca la víspera del primer festivo. Confirmad horarios especiales en la app de cada cadena la semana antes.</p></div>` : '<p>Ningún festivo cae en vuestras fechas en Suiza.</p>'}

    <h2>Dónde comprar</h2>
    <div class="grid g3">
      <div class="card"><span class="tag ok">1 · En Francia</span><h3>Compra grande antes de cruzar</h3><p>Pasta, legumbre, conservas, café, snacks y pienso. Respetad la ${t('aduana suiza', 'franquicia de aduana')}: ${c.adults} kg de carne y ${5 * c.adults} l de vino entre los ${c.adults}.</p></div>
      <div class="card"><span class="tag ok">2 · Lidl y Aldi</span><h3>Reposición en Interlaken</h3><p>Lo más barato de Suiza. Coop y Migros son bastante más caros; Coop Grindelwald para lo del día.</p></div>
      <div class="card"><span class="tag">3 · Comer fuera</span><h3>≈25–35 CHF por persona</h3><p>Un menú en restaurante de montaña. Termo y bocadillo ahorran mucho. Tu presupuesto: ${c.eatOutMeals} comidas fuera.</p></div>
    </div>
    ${ui.table(['Tienda', 'Dirección', 'Precio', 'Nota'], SHOPS.map(s => [`<b>${s.name}</b>`, `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ' ' + s.addr)}" target="_blank">${s.addr}</a>`, s.tier, s.note]))}

    <h2>Agua, ${t('grises', 'aguas grises')} <span class="grad-text">y duchas</span></h2>
    ${ui.table(['Dónde', 'Agua', 'Vaciado', 'Ducha', 'Coste'], [
      [`${p.base.name} (vuestra base)`, 'Sí', p.base.id === 'rubi' ? 'No' : 'Sí', 'Sí', 'Incluido'],
      [t('Grauholz', 'Área Grauholz (A1, Berna)'), 'Sí', 'Sí', 'No', 'Gratis'],
      [t('Sportzentrum', 'Sportzentrum Grindelwald'), '—', '—', 'Con la entrada', '50 % con tarjeta de huésped'],
      ['Paradas en Francia', 'Si no hiela', 'Sí', 'No en invierno', 'Incluido']])}
    <div class="callout bad"><h3>Vaciado solo en punto autorizado</h3><p>Prohibido en la calle o en el campo. Con −10 °C la salida se congela: cubo debajo o un poco de anticongelante en el depósito de grises. Pedid al camping el ${t('amperaje')} de la parcela.</p></div>

    <h2>Lavandería</h2>
    ${ui.table(['Dónde', 'Tipo', 'Precio'], [[p.base.name, 'Lavadoras y secadoras', 'Preguntar en recepción'], ['Lauterbrunnen, calle principal (frente al Valley Hostel)', 'Autoservicio', '≈5 CHF lavar + 5 CHF secar'], ['Grindelwald · Laundry & Game Lounge, Dorfstrasse 85', 'Autoservicio, ciclos cortos', 'Pago con tarjeta'], ['Francia (ruta)', 'Lavanderías en parkings de súper', '≈6–10 € por carga']])}
    <p class="small muted">${c.laundryLoads} coladas en tu presupuesto: ropa interior, capas base y toallas de los perros el día de compras. La ropa técnica se seca dentro con la calefacción.</p>

    <h2>Moverse <span class="grad-text">gastando poco</span></h2>
    <div class="grid g3">
      <div class="card"><span class="tag ok">Gratis</span><h3>${t('tarjeta de huésped', 'Tarjeta de huésped')}</h3><p>Os la da el camping. En Grindelwald: bus gratis. En Interlaken: transporte local gratis hasta el 31/12/2026.</p></div>
      <div class="card"><span class="tag ok">Incluido</span><h3>El ${t('forfait')} es vuestro billete</h3><p>Incluye los trenes de la región: los días de esquí no hace falta mover la furgo ni pagar parking.</p></div>
      <div class="card"><span class="tag">Tren o furgo</span><h3>${p.base.town} → Grindelwald</h3><p>${p.base.toGrindelwald}. Con nieve, el tren evita cadenas, parking y estrés.</p></div>
      <div class="card"><span class="tag warn">Aparcar</span><h3>Grindelwald: solo de día</h3><p>Los parkings de autocaravanas (Terminal, Teufiweg) son de pago y solo de día.</p></div>
      <div class="card"><span class="tag">Apps</span><h3>Instaladlas antes</h3>${ui.links([['SBB', 'https://www.sbb.ch/en/'], ['Jungfrau', 'https://www.jungfrau.ch/'], ['MeteoSwiss', 'https://www.meteoswiss.admin.ch/'], ['White Risk', 'https://whiterisk.ch/'], ['Rega', 'https://www.rega.ch/en/'], ['park4night', 'https://park4night.com/']])}</div>
      <div class="card"><span class="tag">Gas</span><h3>Bombonas</h3><p>Las españolas no se rellenan en Suiza. ${p.base.id === 'jungfrau' ? 'Camping Jungfrau tiene intercambio de Campingaz.' : 'Landi (Interlaken) vende gas.'}</p></div>
    </div>
    <h2>Mapa en vivo: <span class="grad-text">súper, lavanderías, gasolineras</span></h2>
    <p class="small muted" id="osm"></p><div class="map" id="life-map"></div>`;
  },
  mount(el, { ui, live, plan }) {
    const m = ui.makeMap(el.querySelector('#life-map'), [46.64, 7.93], 12);
    SHOPS.forEach(s => L.marker(s.pos, { icon: ui.pin('🛒', s.tier === '€' ? '#1fae78' : '#d39a1c') }).addTo(m).bindPopup(`<b>${s.name}</b><br>${s.note}`));
    L.marker(plan.base.pos, { icon: ui.pin('🏕️') }).addTo(m).bindPopup(plan.base.name);
    ui.osmLayer(el.querySelector('#osm'), async () => {
      const bb = '(46.54,7.80,46.72,8.10)';
      const d = await live.overpass(`[out:json][timeout:25];(nwr["shop"~"supermarket|convenience"]${bb};nwr["shop"="laundry"]${bb};nwr["amenity"="sanitary_dump_station"]${bb};nwr["amenity"="fuel"]${bb};);out center tags;`);
      const ico = t => t.shop === 'laundry' ? ['🧺 Lavandería', '#7c5cff'] : t.amenity === 'sanitary_dump_station' ? ['🚽 Vaciado', '#0aa3c2'] : t.amenity === 'fuel' ? ['⛽ Gasolinera', '#c24040'] : ['🛒 Tienda', '#1fae78'];
      let n = 0; d.elements.forEach(e => { const la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon, t = e.tags || {}; if (!la) return; n++; const [k, col] = ico(t);
        L.circleMarker([la, lo], { radius: 6, color: col, fillColor: col, fillOpacity: .75, weight: 1 }).addTo(m).bindPopup(`${k}<br><b>${ui.esc(t.name || t.brand || '')}</b>${t.opening_hours ? '<br>🕑 ' + ui.esc(t.opening_hours) : ''}`); });
      return `${n} tiendas, lavanderías, vaciados y gasolineras (OpenStreetMap). Horarios de Navidad: confirmar.`;
    });
  },
};
