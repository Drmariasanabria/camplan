import { IMG, P } from '../data.js';
import { fmtDate, diffDays, iso, addDays } from '../engine.js';

const LVL = { low: 1, moderate: 2, considerable: 3, high: 4, very_high: 5 }, LVL_ES = ['', 'Débil', 'Limitado', 'Notable', 'Fuerte', 'Muy fuerte'];
const PROB = { new_snow: 'Nieve reciente', wind_slab: 'Placas de viento', persistent_weak_layers: 'Capas débiles persistentes', wet_snow: 'Nieve húmeda', gliding_snow: 'Deslizamiento del manto', favourable_situation: 'Situación favorable', no_distinct_avalanche_problem: 'Sin problema marcado' };
const ASP = { N: 'N', NE: 'NE', E: 'E', SE: 'SE', S: 'S', SW: 'SO', W: 'O', NW: 'NO' };
let charts = [];

const POINTS = ctx => {
  const p = ctx.plan, elev = b => b.elev || (b.town.startsWith('Grindelwald') ? 1034 : b.id === 'manor' ? 570 : 800);
  const seen = new Set(), bases = p.stays.map(st => st.base).filter(b => !seen.has(b.id) && seen.add(b.id));
  return [
    ...bases.map((b, i) => ({ id: i ? 'base-' + b.id : 'base', name: `${b.town} (camping)`, pos: b.pos, elev: elev(b) })),
    ...(bases.some(b => b.region === 'jungfrau') ? [
      { id: 'first', name: 'First (2.168 m)', pos: P.first, elev: 2168 },
      { id: 'kleine', name: 'Kleine Scheidegg (2.061 m)', pos: P.kleine, elev: 2061 },
      { id: 'murren', name: 'Mürren (1.638 m)', pos: P.murren, elev: 1638 },
      { id: 'faulhorn', name: 'Faulhorn (2.681 m)', pos: P.faulhorn, elev: 2681 }] : []),
    ...bases.filter(b => b.regionObj && !b.regionObj.detailed).map(b => ({ id: 'top-' + b.regionObj.id, name: `${b.regionObj.short} en cota alta (≈${b.regionObj.top} m)`, pos: b.regionObj.pos, elev: b.regionObj.top })),
    ...[...p.travelOut, ...p.travelRet].filter(t => t.stop).map(t => ({ id: 'st-' + t.stop.id, name: `${t.stop.name.replace('Camping-Car Park ', '')} · noche del ${fmtDate(t.date)}`, pos: t.stop.pos, elev: 500, date: t.date })),
    { id: 'massif', name: 'A89 Macizo Central (≈900 m)', pos: [45.78, 2.72], elev: 900 },
    { id: 'geneva', name: 'Ginebra · aduana', pos: P.bardonnex, elev: 450 },
  ];
};

export default {
  id: 'tiempo', title: 'Tiempo, nieve y aludes', icon: '❄️',
  bg: [IMG.jungfraujoch, IMG.kleine, IMG.eiger],
  render(ctx) {
    const { ui, plan: p } = ctx, today = iso(new Date()), until = diffDays(today, p.cfg.depart), sel = ctx.get('wxp', 'base');
    return `<p class="kicker">Condiciones</p><h1 class="title">Tiempo <span class="grad-text">en tus fechas</span></h1>
    <p class="lead">${until > 15 ? `Faltan <b>${until} días</b> para salir: los modelos aún no llegan a tus fechas (máximo 16 días). Mientras, ves los próximos días y cómo fue <b>el mismo periodo del año pasado</b>. Desde el ${fmtDate(addDays(p.cfg.depart, -15))} aparecerá la previsión de tu viaje.` : `Previsión para tu viaje (${fmtDate(p.cfg.depart)} → ${fmtDate(p.cfg.homeBy)}) comparando cinco modelos meteorológicos.`}</p>
    <div class="btn-row">${ui.segmented('wxp', POINTS(ctx).map(x => [x.id, x.name]), sel)}</div>
    <div class="grid g4" id="now"></div>
    <h2 id="fc-title">Previsión <span class="grad-text">por modelo</span></h2>
    <p class="small muted">Cinco modelos: MeteoSwiss (el más fino para los Alpes), ECMWF (europeo), ICON (alemán), GFS (EE. UU.) y Météo-France. Si discrepan mucho, la previsión es poco fiable.</p>
    <div class="grid g2"><div class="card no-tilt"><span class="tag">Máximas y mínimas</span><div class="chart-box"><canvas id="ch-t"></canvas></div></div>
      <div class="card no-tilt"><span class="tag">Nieve nueva (cm/día)</span><div class="chart-box"><canvas id="ch-s"></canvas></div></div></div>
    <div class="table-wrap" id="tbl" style="margin-top:20px"></div>
    <h2>El año pasado <span class="grad-text">en esas fechas</span></h2>
    <div class="card no-tilt" id="hist"><span class="loader"></span></div>

    <h2>Peligro de aludes <span class="grad-text">hoy</span></h2>
    <p>Boletín oficial del ${ui.term('SLF')} para las zonas donde dormís (${p.stays.map(st => ui.esc(st.base.town)).join(', ')}). Escala de 1 a 5; desde el <b>3 (notable)</b> el terreno fuera de pistas ya es peligroso.</p>
    <div class="grid g2" id="slf"><div class="card"><span class="loader"></span></div></div>
    ${p.stays.some(st => st.country === 'FR') ? `<div class="callout"><h3>🇫🇷 Aludes en Chamonix</h3><p>El boletín suizo no cubre Francia. Usad el BRA (boletín de riesgo de aludes) de Météo-France para el macizo del Mont Blanc.</p>${ui.links([['Météo-France montaña', 'https://meteofrance.com/meteo-montagne'], ['Chamonix: tiempo y nieve', 'https://www.chamonix.com/']])}</div>` : ''}
    ${p.stays.some(st => st.country === 'IT') ? `<div class="callout"><h3>🇮🇹 Aludes en el Valle de Aosta</h3><p>Boletín regional de nieve y aludes del Valle de Aosta y boletines AINEVA de los Alpes italianos.</p>${ui.links([['AINEVA boletines', 'https://bollettini.aineva.it/'], ['Valle de Aosta: tiempo', 'https://www.regione.vda.it/'], ['Monte Rosa: pistas abiertas', 'https://www.monterosaski.com/']])}</div>` : ''}

    <h2>Antes de subir, <span class="grad-text">mira esto</span></h2>
    <div class="grid g3">
      <div class="card"><span class="tag">En vivo</span><h3>Pistas, remontes y senderos abiertos hoy</h3>${ui.links([['Jungfrau · estado en vivo', 'https://www.jungfrau.ch/de-ch/live/Pistendaten/'], ['Webcams Jungfrau', 'https://www.jungfrau.ch/de-ch/live/webcams/'], ['Webcams Grindelwald', 'https://grindelwald.roundshot.com/']])}</div>
      <div class="card"><span class="tag">Meteo</span><h3>Previsión oficial y radar</h3>${ui.links([['MeteoSwiss', 'https://www.meteoswiss.admin.ch/'], ['Meteoblue (comparador)', 'https://www.meteoblue.com/en/weather/forecast/multimodel/grindelwald_switzerland_2660253'], ['Windy', 'https://www.windy.com/46.624/8.041?46.55,8.04,10']])}</div>
      <div class="card"><span class="tag">Nieve</span><h3>Partes de nieve</h3>${ui.links([['White Risk (aludes)', 'https://whiterisk.ch/en/conditions'], ['Snow-Forecast', 'https://www.snow-forecast.com/resorts/Grindelwald/6day/mid'], ['Bergfex', 'https://www.bergfex.com/grindelwald/'], ['Skitourenguru (travesía)', 'https://www.skitourenguru.ch/']])}</div>
    </div>
    <div class="callout warn"><h3>Viento del sur: ${ui.term('Foehn')}</h3><p>Si veis subida brusca de temperatura y rachas de más de 60 km/h en cumbres, cambiad a plan de valle: los remontes cierran y la nieve se estropea.</p></div>`;
  },
  async mount(el, ctx) {
    const { live, ui, plan: p } = ctx, pts = POINTS(ctx);
    const load = async id => {
      const pt = pts.find(x => x.id === id) || pts[0];
      charts.forEach(c => c.destroy()); charts = [];
      el.querySelector('#now').innerHTML = '<div class="card"><span class="loader"></span></div>';
      const [w, s] = await Promise.all([
        live.cachedJSON(`https://api.open-meteo.com/v1/forecast?latitude=${pt.pos[0]}&longitude=${pt.pos[1]}&elevation=${pt.elev}&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_sum,wind_gusts_10m_max,weather_code&models=${live.MODELS.map(m => m.id).join(',')}&forecast_days=16&timezone=Europe%2FZurich`),
        live.snowNow(pt.pos[0], pt.pos[1], pt.elev)]);
      const d = w.daily, tripDays = d.time.map((t, i) => [t, i]).filter(([t]) => t >= p.cfg.depart && t <= p.cfg.homeBy);
      const idx = tripDays.length ? tripDays.map(x => x[1]) : d.time.map((_, i) => i).slice(0, 10);
      el.querySelector('#fc-title').innerHTML = tripDays.length ? 'Previsión <span class="grad-text">de tus días de viaje</span>' : 'Próximos días <span class="grad-text">por modelo</span>';
      const ms = live.MODELS.filter(m => (d['temperature_2m_max_' + m.id] || []).some(v => v != null));
      const labels = idx.map(i => fmtDate(d.time[i]));
      el.querySelector('#now').innerHTML = `
        <div class="card"><span class="tag"><span class="live-dot"></span>Ahora</span><div class="big-num">${Math.round(s.current.temperature_2m)}° ${live.WMO(s.current.weather_code)}</div><p class="small muted">Viento ${Math.round(s.current.wind_speed_10m)} km/h</p></div>
        <div class="card"><span class="tag">Nieve en el suelo</span><div class="big-num">${Math.round((s.current.snow_depth || 0) * 100)} cm</div><p class="small muted">Según modelo</p></div>
        <div class="card"><span class="tag">Mínima más baja</span><div class="big-num">${Math.round(Math.min(...ms.flatMap(m => idx.map(i => d['temperature_2m_min_' + m.id][i])).filter(v => v != null)))}°</div><p class="small muted">${tripDays.length ? 'en tus días' : 'próximos días'}</p></div>
        <div class="card"><span class="tag">Nieve nueva total</span><div class="big-num">${Math.round(idx.reduce((a, i) => a + (ms.map(m => d['snowfall_sum_' + m.id][i] || 0).reduce((x, y) => x + y, 0) / ms.length), 0))} cm</div><p class="small muted">media de modelos</p></div>`;
      Chart.defaults.color = '#9fb0c8'; Chart.defaults.borderColor = 'rgba(255,255,255,.08)'; Chart.defaults.font.family = 'Inter';
      charts.push(new Chart(el.querySelector('#ch-t'), { type: 'line', data: { labels, datasets: ms.flatMap(m => [
        { label: m.name, data: idx.map(i => d['temperature_2m_max_' + m.id][i]), borderColor: m.color, backgroundColor: m.color, tension: .35, pointRadius: 2 },
        { label: m.name + ' (mín)', data: idx.map(i => d['temperature_2m_min_' + m.id][i]), borderColor: m.color, borderDash: [4, 4], tension: .35, pointRadius: 0 }]) },
        options: { maintainAspectRatio: false, plugins: { legend: { labels: { filter: i => !i.text.includes('(mín)'), boxWidth: 10 } } }, scales: { y: { ticks: { callback: v => v + '°' } } } } }));
      charts.push(new Chart(el.querySelector('#ch-s'), { type: 'bar', data: { labels, datasets: ms.map(m => ({ label: m.name, data: idx.map(i => d['snowfall_sum_' + m.id][i]), backgroundColor: m.color, borderRadius: 4 })) },
        options: { maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 10 } } } } }));
      el.querySelector('#tbl').innerHTML = `<table><thead><tr><th>Día</th>${ms.map(m => `<th style="color:${m.color}">${m.name}</th>`).join('')}</tr></thead><tbody>${idx.map(i => `<tr><td><b>${fmtDate(d.time[i])}</b></td>${ms.map(m => {
        const tx = d['temperature_2m_max_' + m.id][i], tn = d['temperature_2m_min_' + m.id][i], sn = d['snowfall_sum_' + m.id][i], g = d['wind_gusts_10m_max_' + m.id][i];
        return tx == null ? '<td class="muted">—</td>' : `<td>${live.WMO(d['weather_code_' + m.id][i])} <b>${Math.round(tx) || 0}°</b> / ${Math.round(tn) || 0}°${sn >= 1 ? ` <b style="color:var(--a1)">❄ ${Math.round(sn)} cm</b>` : ''}${g > 60 ? ` <b style="color:var(--warn)">💨 ${Math.round(g)}</b>` : ''}</td>`; }).join('')}</tr>`).join('')}</tbody></table>`;
      // Mismo periodo del año pasado
      const ly = s => s.replace(/^(\d{4})/, y => +y - 1);
      try {
        const h = await live.cachedJSON(`https://archive-api.open-meteo.com/v1/archive?latitude=${pt.pos[0]}&longitude=${pt.pos[1]}&elevation=${pt.elev}&start_date=${ly(p.cfg.depart)}&end_date=${ly(p.cfg.homeBy)}&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,snow_depth_max&timezone=Europe%2FZurich`);
        const hd = h.daily, mx = v => Math.max(...v.filter(x => x != null)), mn = v => Math.min(...v.filter(x => x != null));
        el.querySelector('#hist').innerHTML = `<span class="tag">${pt.name} · ${fmtDate(ly(p.cfg.depart))} – ${fmtDate(ly(p.cfg.homeBy))} del año pasado</span>
          <div class="grid g4" style="margin-top:12px"><div><div class="big-num">${Math.round(mn(hd.temperature_2m_min))}°</div><p class="muted small">mínima más baja</p></div><div><div class="big-num">${Math.round(mx(hd.temperature_2m_max))}°</div><p class="muted small">máxima más alta</p></div>
          <div><div class="big-num">${Math.round(hd.snowfall_sum.reduce((a, b) => a + (b || 0), 0))} cm</div><p class="muted small">nieve caída</p></div><div><div class="big-num">${Math.round(mx(hd.snow_depth_max || [0]) * 100)} cm</div><p class="muted small">nieve en el suelo (máx.)</p></div></div>`;
      } catch { el.querySelector('#hist').innerHTML = '<p class="muted">Histórico no disponible ahora.</p>'; }
    };
    el.querySelector('[data-seg=wxp]').onclick = e => { const b = e.target.closest('button'); if (!b) return; el.querySelectorAll('[data-seg=wxp] button').forEach(x => x.classList.toggle('on', x === b)); ctx.set('wxp', b.dataset.v); load(b.dataset.v).catch(console.error); };
    load(ctx.get('wxp', 'base')).catch(e => { console.error(e); el.querySelector('#now').innerHTML = '<div class="card">Meteo no disponible ahora.</div>'; });
    try {
      const inRing = (pt, ring) => { let ins = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) ins = !ins; } return ins; };
      const inGeo = (pt, g) => !g ? false : g.type === 'Polygon' ? inRing(pt, g.coordinates[0]) : g.type === 'MultiPolygon' ? g.coordinates.some(pl => inRing(pt, pl[0])) : false;
      const pts = [...new Map(p.stays.map(st => [st.base.town, [st.base.pos[1], st.base.pos[0]]])).values()];
      const g = await live.slf(), f = g.features.filter(x => pts.some(pt => inGeo(pt, x.geometry)));
      el.querySelector('#slf').innerHTML = (f.length ? f : g.features.slice(0, 1)).slice(0, 4).map(x => { const pr = x.properties, lv = Math.max(...pr.dangerRatings.map(d => LVL[d.mainValue] || 0));
        return `<div class="card no-tilt"><div style="display:flex;gap:16px;align-items:center"><span class="danger d${lv}">${lv}</span><div><h3 style="margin:0">${LVL_ES[lv]}</h3><p class="small muted" style="margin:0">${pr.regions.slice(0, 6).map(r => r.name).join(' · ')}${pr.regions.length > 6 ? ` y ${pr.regions.length - 6} zonas más` : ''}</p></div></div>
        ${pr.avalancheProblems.map(a => `<p style="margin-top:12px"><b>${PROB[a.problemType] || a.problemType}</b>${a.elevation?.lowerBound ? ` · por encima de ${a.elevation.lowerBound} m` : ''}${a.elevation?.upperBound ? ` · por debajo de ${a.elevation.upperBound} m` : ''}${a.aspects?.length ? ` · laderas ${a.aspects.map(x => ASP[x] || x).join(', ')}` : ''}</p>`).join('')}
        <p class="source">Válido hasta ${new Date(pr.validTime.endTime).toLocaleString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' })} · <a href="https://whiterisk.ch/en/conditions" target="_blank">boletín completo ↗</a></p></div>`; }).join('');
    } catch { el.querySelector('#slf').innerHTML = '<div class="card">Boletín no disponible ahora. <a href="https://whiterisk.ch/en/conditions" target="_blank">White Risk ↗</a></div>'; }
  },
};
