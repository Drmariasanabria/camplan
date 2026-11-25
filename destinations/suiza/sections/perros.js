import { IMG, P, ACTIVITIES } from '../data.js';
import { fmtDate, actById } from '../engine.js';

export default {
  id: 'perros', title: 'Con los perros', icon: '🐕',
  bg: [IMG.collie, IMG.lauterbrunnen],
  render(ctx) {
    const { ui, plan: p } = ctx, c = p.cfg, t = ui.term, n = c.dogs;
    if (!n) return `<p class="kicker">Perros</p><h1 class="title">Sin perros en este viaje</h1><p class="lead">Si viajáis con perros, indícalo en <a href="#/suiza/viaje">Mi viaje</a> y esta sección se rellena sola.</p>`;
    const kgFood = n * c.dogKg * 0.015 * (p.totalDays + 2);
    const noDogDays = p.days.filter(d => d.kind === 'base' && actById(d.act)?.dogs === false);
    return `<p class="kicker">${n} perro${n > 1 ? 's' : ''} · ${ui.esc(c.dogNames)}</p><h1 class="title">Viajar <span class="grad-text">con los perros</span></h1>
    <p class="lead">El plan tiene que funcionar también los días de esquí. Aquí tienes requisitos, transporte, normas, cuidadores y veterinario.</p>

    <div class="grid g3">
      <div class="stat"><div class="l">Pienso para el viaje</div><div class="v">≈${Math.ceil(kgFood)} kg</div><div class="l">${p.totalDays} días + 2 de reserva · ≈${Math.round(c.dogKg * 15)} g/día por perro (ajusta a su ración real)</div></div>
      <div class="stat"><div class="l">Días con plan sin perros</div><div class="v">${noDogDays.length}</div><div class="l">${noDogDays.map(d => fmtDate(d.date)).join(', ') || 'Ninguno'}${noDogDays.length && c.adults <= c.skiers ? ' · necesitáis cuidador' : ''}</div></div>
      <div class="stat"><div class="l">Entrada en Suiza</div><div class="v">Chip + rabia</div><div class="l">+ pasaporte europeo (${t('BLV', 'requisitos')})</div></div>
    </div>

    <h2>Transporte <span class="grad-text">con perro</span></h2>
    ${ui.table(['Trayecto', 'Perro', 'Nota'], [
      ['Interlaken ↔ Lauterbrunnen / Grindelwald (tren)', '<b style="color:var(--ok)">Gratis</b>', t('Jungfraubahnen')],
      ['Lauterbrunnen ↔ Grütschalp ↔ Mürren', '<b style="color:var(--ok)">Gratis</b>', ''],
      ['Lauterbrunnen ↔ Kleine Scheidegg ↔ Grindelwald (tren)', '<b style="color:var(--ok)">Gratis</b>', ''],
      ['Telecabina Firstbahn', '<b style="color:var(--ok)">Gratis</b>', ''],
      ['Eigergletscher ↔ Jungfraujoch', '30 CHF por perro', 'Caro y sin interés con perros'],
      ['Telecabina de Männlichen', 'Preguntar en taquilla', 'Es de otra empresa'],
      ['Trenes fuera de la región', '25 CHF pase de día', t('SBB')],
      ['Pistas de esquí y trineos', '<b style="color:var(--bad)">Prohibido</b>', '']])}
    <p class="small muted">Confirmad siempre en la taquilla: las condiciones cambian según el trayecto.</p>

    <h2>Normas <span class="grad-text">y cuidados</span></h2>
    <div class="grid g3">
      <div class="card"><span class="tag warn">Fauna</span><h3>Correa en zonas protegidas</h3><p>En las ${t('zona de fauna', 'zonas de reposo de fauna')} correa obligatoria y prohibido salir del camino. En invierno no hay vacas, pero sí rebecos y urogallos.</p></div>
      <div class="card"><span class="tag">Almohadillas</span><h3>Hielo y sal</h3><p>Bolas de hielo entre los dedos, sal en la carretera, resbalones y cansancio en nieve profunda. Botines o cera y secar al volver.</p></div>
      <div class="card"><span class="tag bad">La furgo</span><h3>Nunca horas solos</h3><p>De noche baja de −10 °C. Una avería de batería o de calefacción tiene consecuencias rápidas.</p></div>
      <div class="card"><span class="tag">Higiene</span><h3>Papeleras ${t('Robidog')}</h3><p>Con bolsas, por todas partes. Llevad las vuestras igualmente.</p></div>
      <div class="card"><span class="tag">Restaurantes</span><h3>Casi todos los admiten</h3><p>En montaña, preguntad al entrar.</p></div>
      <div class="card"><span class="tag">Salud</span><h3>Antiparasitario</h3><p>No es obligatorio para Suiza ni Francia, pero conviene desparasitar antes y llevar antiparasitario externo.</p></div>
    </div>

    <h2>Cuidador <span class="grad-text">y veterinario</span></h2>
    <div class="grid g2">
      <div class="card"><span class="tag">Cuidador</span><h3>${t('petsitting24')}</h3><p>Desde ≈10–30 CHF/h en Grindelwald. Tu presupuesto incluye ${c.sitterHours} h.</p>${ui.links([['Buscar cuidador', 'https://petsitting24.ch/en/dog-sitter/be/grindelwald'], ['Pawshake', 'https://www.pawshake.ch/']])}</div>
      <div class="card"><span class="tag bad">Urgencias 24 h</span><h3>${t('Tierklinik', 'Tierklinik Interlaken')}</h3><p>General-Guisanstrasse 39, Interlaken</p><a class="big-num" style="font-size:30px" href="tel:+41338222141">+41 33 822 21 41</a><p class="small muted">Llamad antes de ir.</p></div>
    </div>
    <h2>Veterinarios, tiendas <span class="grad-text">y parques</span></h2>
    <p class="small muted" id="dog-status"></p><div class="map" id="dog-map"></div>`;
  },
  mount(el, { ui, live, plan }) {
    if (!el.querySelector('#dog-map')) return;
    const m = ui.makeMap(el.querySelector('#dog-map'), P.interlaken, 11);
    L.marker(P.tierklinik, { icon: ui.pin('🏥', '#c24040') }).addTo(m).bindPopup('<b>Tierklinik Interlaken 24 h</b><br>+41 33 822 21 41');
    L.marker(plan.base.pos, { icon: ui.pin('🏕️', '#1fae78') }).addTo(m).bindPopup(plan.base.name);
    ui.osmLayer(el.querySelector('#dog-status'), async () => {
      const d = await live.overpass('[out:json][timeout:25];(nwr["amenity"="veterinary"](46.50,7.70,46.78,8.20);nwr["shop"="pet"](46.50,7.70,46.78,8.20);nwr["leisure"="dog_park"](46.50,7.70,46.78,8.20););out center tags;');
      let n = 0; d.elements.forEach(e => { const la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon, t = e.tags || {}; if (!la) return; n++;
        const k = t.amenity === 'veterinary' ? '🩺 Veterinario' : t.shop === 'pet' ? '🦴 Tienda de mascotas' : '🌳 Parque para perros';
        L.circleMarker([la, lo], { radius: 7, color: '#ffc65c', fillColor: '#ff5ea8', fillOpacity: .8, weight: 2 }).addTo(m).bindPopup(`${k}<br><b>${ui.esc(t.name || '')}</b>${t.phone ? '<br>' + t.phone : ''}${t.opening_hours ? '<br>' + ui.esc(t.opening_hours) : ''}`); });
      return `${n} veterinarios, tiendas y parques para perros (OpenStreetMap).`;
    });
  },
};
