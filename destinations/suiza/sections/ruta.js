import { IMG, ROUTES, P, STOPS_FR } from '../data.js';

const FUEL_SPOTS = [
  { id: 'es39', country: 'ES', name: 'Cantabria (salida)', prov: '39' },
  { id: 'es20', country: 'ES', name: 'Gipuzkoa (último antes de Irún)', prov: '20' },
  { id: 'fr1', country: 'FR', name: 'Ussel (A89)', pos: P.ussel },
  { id: 'fr2', country: 'FR', name: 'Bourg-en-Bresse (RCEA)', pos: P.bourg },
  { id: 'fr3', country: 'FR', name: 'Saint-Julien (antes de Ginebra)', pos: [46.144, 6.081] },
];

export default {
  id: 'ruta', title: 'Ruta y costes', icon: '🛣️',
  bg: [IMG.geneva, IMG.bourg, IMG.limoges, IMG.bern],
  render: ({ ui, get }) => {
    const sel = get('route', 'A');
    return `${ui.header('Por carretera', 'Tres formas <span class="grad-text">de llegar</span>', 'Distancia y tiempo calculados en vivo con OSRM sobre OpenStreetMap. Coste recalculado con el gasóleo de hoy, tu consumo y tu clase de peaje.')}
    <div class="btn-row">${ui.segmented('route', Object.entries(ROUTES).map(([k, r]) => [k, r.name]), sel)}</div>
    <div class="map" id="route-map"></div>

    <h2>Calculadora <span class="grad-text">de trayecto</span></h2>
    <div class="grid g4">
      <label class="field">Consumo (l/100 km)<input type="number" step="0.1" id="c-cons" value="${get('cons', 9.5)}"><small>Transit Custom cargada ≈9–10,5</small></label>
      <label class="field">Gasóleo España (€/l)<input type="number" step="0.001" id="c-es" value="${get('fuelES', 1.82)}"><small id="c-es-live">cargando precio real…</small></label>
      <label class="field">Gasóleo Francia (€/l)<input type="number" step="0.001" id="c-fr" value="${get('fuelFR', 2.05)}"><small id="c-fr-live">cargando precio real…</small></label>
      <label class="field">Clase de peaje<select id="c-class"><option value="1">Clase 1 (≤2,00 m)</option><option value="2" ${get('tollClass', '1') === '2' ? 'selected' : ''}>Clase 2 (>2 m)</option></select><small>Mide la altura real con todo montado</small></label>
    </div>
    <div class="table-wrap" style="margin-top:22px" id="cmp"></div>
    <p class="source">Peajes: estimaciones del plan (A89 Burdeos–Lyon ≈59 € clase 1, Atlandes ≈4,40 €). Calcúlalos exactos con tu matrícula en ${ui.link('https://www.viamichelin.es/', 'ViaMichelin')} o ${ui.link('https://www.autoroutes.fr/es/itineraires.htm', 'autoroutes.fr')}. Km de Francia ≈60 % del total; el resto se reparte entre España y Suiza.</p>

    <h2>Etapas <span class="grad-text" id="stg-name"></span></h2>
    <p class="lead" id="stg-desc"></p>
    <div id="stg"></div>

    <h2>Gasóleo <span class="grad-text">en vivo</span></h2>
    <p class="lead">Las gasolineras más baratas en cada punto clave, desde las APIs oficiales de España y Francia. Llena en España antes de Irún, sal de la autopista a súper (Leclerc, Intermarché, Carrefour) en Francia y llega a Suiza con el depósito lleno (≈2,4 CHF/l allí).</p>
    <div class="grid g3" id="fuel"></div>

    <h2>Reglas <span class="grad-text">al volante</span></h2>
    <div class="grid g3">
      <div class="card"><span class="tag">🇫🇷 Francia</span><h3>130 / 110 con lluvia</h3><p>Loi Montagne 1/11–31/03: 4 neumáticos 3PMSF o cadenas/fundas a bordo en municipios señalizados. Panel B26 = montar cadenas. Anochece ≈17:15.</p></div>
      <div class="card"><span class="tag">🇨🇭 Suiza</span><h3>120 · 80 · 50</h3><p>Luces encendidas también de día. Detectores de radar prohibidos. Cadenas obligatorias donde lo indique la señal; si bloqueas la vía por ir mal equipado, multa.</p></div>
      <div class="card"><span class="tag warn">Aduana Bardonnex</span><h3>Evita 5:30–9:30</h3><p>Atasco habitual de trabajadores fronterizos. Cruzad a media mañana o mediodía.</p></div>
      <div class="card"><span class="tag">Lyon</span><h3>Circunvalación A46</h3><p>Evita la ZFE de Lyon. Crit'Air 2 autorizada en episodios de contaminación.</p></div>
      <div class="card"><span class="tag ok">Grauholz (A1, Berna)</span><h3>Vaciado y agua gratis</h3><p>Ambos sentidos. ${ui.link('https://park4night.com/en/place/6056', 'park4night')}</p></div>
      <div class="card"><span class="tag warn">Últimos 20 km</span><h3>Interlaken → Lauterbrunnen</h3><p>Carretera de Lütschine: con nieve, prudencia y cadenas a mano.</p></div>
    </div>

    <h2>Tráfico, puertos <span class="grad-text">y cadenas</span></h2>
    ${ui.links([['Bison Futé (FR)', 'https://www.bison-fute.gouv.fr/'], ['VINCI Autoroutes tráfico', 'https://www.vinci-autoroutes.com/fr/trafic'], ['Autoroutes.fr itinerarios', 'https://www.autoroutes.fr/'], ['DGT Infocar (ES)', 'https://infocar.dgt.es/etraffic/'], ['TCS tráfico (CH)', 'https://www.tcs.ch/de/tools/verkehrsinfo/'], ['Viasuisse', 'https://www.viasuisse.ch/'], ['Estado puertos alpinos', 'https://www.alpen-paesse.ch/'], ['Mappy sin peajes', 'https://fr.mappy.com/'], ['ViaMichelin', 'https://www.viamichelin.es/'], ['Google Maps ruta', 'https://www.google.com/maps/dir/Torrelavega/Ussel/Lauterbrunnen'], ['aliae A79', 'https://www.aliae.com/en/home.html'], ['prix-carburants', 'https://www.prix-carburants.gouv.fr/'], ['Geoportal gasolineras', 'https://geoportalgasolineras.es/']])}

    <div class="callout warn"><h3>Plan B de conducción</h3><p>No es obligatorio «cumplir» 650–760 km diarios. Si la meteo complica, fragmentad, aceptad llegar más tarde y usad el 29 como margen. La fatiga invernal es una variable logística.</p></div>`;
  },

  async mount(el, ctx) {
    const { ui, live, get, set } = ctx;
    const map = ui.makeMap(el.querySelector('#route-map'), [45.5, 2.5], 6);
    const layers = {}, stats = {};
    STOPS_FR.forEach(s => L.marker(s.pos, { icon: ui.pin('🌙', s.route === 'A' ? '#0aa3c2' : '#c23a7a') }).addTo(map).bindPopup(`<b>${s.name}</b><br>${s.price}<br><a href="${s.p4n}" target="_blank">park4night ↗</a>`));
    [['🏠', P.torrelavega, 'Torrelavega'], ['🛃', P.bardonnex, 'Aduana Bardonnex'], ['💧', P.grauholz, 'Área Grauholz · vaciado gratis'], ['🏕️', P.campingJungfrau, 'Camping Jungfrau']].forEach(([e, p, n]) => L.marker(p, { icon: ui.pin(e, '#5b46d6') }).addTo(map).bindPopup(n));

    const cmpEl = el.querySelector('#cmp');
    const calc = () => {
      const cons = +el.querySelector('#c-cons').value, pes = +el.querySelector('#c-es').value, pfr = +el.querySelector('#c-fr').value, cls = el.querySelector('#c-class').value;
      set('cons', cons); set('fuelES', pes); set('fuelFR', pfr); set('tollClass', cls);
      const rows = Object.entries(ROUTES).map(([k, r]) => {
        const s = stats[k], mixed = k === 'C' && stats.A && stats.B;
        const km = mixed ? stats.A.km + stats.B.km : s ? s.km * 2 : (k === 'A' ? 2900 : 2950);
        const h = mixed ? stats.A.h + stats.B.h : s ? s.h * 2 : 0;
        // Reparto aproximado: 15 % España, 60 % Francia, 25 % Suiza (repostando solo ES/FR)
        const fuel = km * cons / 100 * (0.45 * pes + 0.55 * pfr);
        const tolls = cls === '2' ? r.tollsClass2 : r.tollsClass1;
        const nights = r.frNights * r.frNightCost;
        const extraSwiss = (10 - r.swissNights) * -80 / 0.93; // noches menos en camping suizo = ahorro
        const total = fuel + tolls + nights + 47;
        return { k, r, km, h, fuel, tolls, nights, total, extraSwiss };
      });
      const base = rows[0];
      cmpEl.innerHTML = `<table><thead><tr><th>Ruta</th><th class="num">Km i/v</th><th class="num">Conducción i/v</th><th class="num">Gasóleo</th><th class="num">Peajes</th><th class="num">Noches FR</th><th class="num">Total trayecto*</th><th class="num">vs A (con camping)</th><th>Día colchón</th></tr></thead><tbody>
      ${rows.map(x => `<tr><td><b style="color:${x.r.color}">${x.r.name}</b></td><td class="num">${Math.round(x.km).toLocaleString('es-ES')}</td><td class="num">${x.h ? ui.hrs(x.h) : '…'}</td><td class="num">${ui.eur(x.fuel)}</td><td class="num">${ui.eur(x.tolls)}</td><td class="num">${ui.eur(x.nights)}</td><td class="num"><b>${ui.eur(x.total)}</b></td><td class="num">${x === base ? '—' : `<span style="color:var(--ok)">${ui.eur((x.total + x.extraSwiss) - base.total)}</span>`}</td><td>${x.r.buffer ? '✅' : '❌'}</td></tr>`).join('')}
      </tbody></table>`;
      cmpEl.insertAdjacentHTML('beforeend', `<p class="source" style="padding:0 18px 14px">*Gasóleo + peajes + pernoctas Francia + viñeta/Crit'Air (47 €). «vs A» incluye la noche de camping suizo que se ahorra (≈80 CHF).</p>`);
    };
    el.querySelectorAll('#c-cons,#c-es,#c-fr,#c-class').forEach(i => i.addEventListener('input', calc));

    const showStages = k => {
      const r = ROUTES[k];
      el.querySelector('#stg-name').textContent = r.name;
      el.querySelector('#stg-desc').textContent = r.desc;
      const legs = stats[k]?.legs;
      el.querySelector('#stg').innerHTML = ui.table(['Día', 'Etapa', 'Distancia', 'Noche'], r.stages);
      Object.entries(layers).forEach(([kk, l]) => l.setStyle({ opacity: kk === k ? 1 : 0.25, weight: kk === k ? 7 : 4 }));
      if (layers[k]) { layers[k].bringToFront(); map.fitBounds(layers[k].getBounds(), { padding: [30, 30] }); }
    };
    el.querySelector('[data-seg=route]').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      el.querySelectorAll('[data-seg=route] button').forEach(x => x.classList.toggle('on', x === b));
      set('route', b.dataset.v); showStages(b.dataset.v);
    });

    calc(); showStages(get('route', 'A'));
    await Promise.all(Object.entries(ROUTES).map(async ([k, r]) => {
      try {
        const s = await live.route(r.pts); stats[k] = s;
        layers[k] = L.geoJSON(s.geo, { style: { color: r.color, weight: 5, opacity: .8, dashArray: k === 'C' ? '10 8' : null } }).addTo(map)
          .bindPopup(`<b>${r.name}</b><br>${Math.round(s.km)} km · ${ui.hrs(s.h)} (solo ida, sin paradas)`);
      } catch (e) { console.warn(e); }
    }));
    calc(); showStages(get('route', 'A'));

    // Gasóleo live
    const fuelEl = el.querySelector('#fuel');
    fuelEl.innerHTML = FUEL_SPOTS.map(f => `<div class="card" id="f-${f.id}"><span class="tag">${f.country === 'ES' ? '🇪🇸' : '🇫🇷'} ${f.name}</span><div class="big-num"><span class="loader"></span></div></div>`).join('');
    const minES = [], minFR = [];
    await Promise.all(FUEL_SPOTS.map(async f => {
      const card = el.querySelector('#f-' + f.id);
      try {
        let list;
        if (f.country === 'ES') list = (await live.fuelES(f.prov)).slice(0, 4).map(s => ({ p: s.price, n: `${s.name} · ${s.town}`, a: s.addr, lat: s.lat, lon: s.lon }));
        else list = (await live.fuelFR(f.pos[0], f.pos[1], 20)).slice(0, 4).map(s => ({ p: s.gazole_prix, n: s.ville, a: s.adresse, lat: s.geom.lat, lon: s.geom.lon, u: s.gazole_maj }));
        (f.country === 'ES' ? minES : minFR).push(list[0].p);
        card.innerHTML = `<span class="tag ok"><span class="live-dot"></span>${f.country === 'ES' ? '🇪🇸' : '🇫🇷'} ${f.name}</span>
          <div class="big-num">${list[0].p.toFixed(3)}<span class="small muted"> €/l</span></div>
          ${list.map(s => `<p class="small" style="margin:8px 0 0"><b>${s.p.toFixed(3)}</b> · <a href="https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lon}" target="_blank">${ui.esc(s.n)}</a><br><span class="muted">${ui.esc(s.a)}</span></p>`).join('')}`;
      } catch (e) { card.innerHTML += '<p class="small muted">Sin datos ahora</p>'; card.querySelector('.loader')?.remove(); }
    }));
    if (minES.length) { const v = Math.min(...minES); el.querySelector('#c-es-live').innerHTML = `<span class="live-dot"></span>Hoy desde ${v.toFixed(3)} € <a href="#" id="use-es">usar</a>`; el.querySelector('#use-es').onclick = e => { e.preventDefault(); el.querySelector('#c-es').value = v; calc(); }; }
    if (minFR.length) { const v = Math.min(...minFR); el.querySelector('#c-fr-live').innerHTML = `<span class="live-dot"></span>Hoy desde ${v.toFixed(3)} € <a href="#" id="use-fr">usar</a>`; el.querySelector('#use-fr').onclick = e => { e.preventDefault(); el.querySelector('#c-fr').value = v; calc(); }; }
  },
};
