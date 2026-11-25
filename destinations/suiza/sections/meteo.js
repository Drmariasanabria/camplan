import { IMG, WX_POINTS, WX_ROUTE, SLF_MATCH } from '../data.js';

const LVL = { low: 1, moderate: 2, considerable: 3, high: 4, very_high: 5 };
const LVL_ES = ['', 'Débil', 'Limitado', 'Notable', 'Fuerte', 'Muy fuerte'];
const PROB_ES = { new_snow: 'Nieve reciente', wind_slab: 'Placas de viento', persistent_weak_layers: 'Capas débiles persistentes', wet_snow: 'Nieve húmeda', gliding_snow: 'Deslizamiento basal', favourable_situation: 'Situación favorable', no_distinct_avalanche_problem: 'Sin problema marcado' };
let charts = [];

export default {
  id: 'meteo', title: 'Meteo, nieve y aludes', icon: '❄️',
  bg: [IMG.jungfraujoch, IMG.kleine, IMG.eiger],
  render: ({ ui, get }) => `
  ${ui.header('Condiciones en vivo', 'Cinco modelos, <span class="grad-text">una decisión</span>', 'Comparativa en vivo de MeteoSwiss ICON-CH2, ECMWF, DWD ICON, NOAA GFS y Météo-France para cada punto del valle, la montaña y la ruta. Si los modelos discrepan, la incertidumbre es alta: planifica conservador.')}
  <div class="btn-row">${ui.segmented('wxp', [...WX_POINTS, ...WX_ROUTE].map(p => [p.id, p.name]), get('wxp', 'lb'))}</div>
  <div class="grid g4" id="wx-now"></div>
  <h2>Próximos 10 días <span class="grad-text">por modelo</span></h2>
  <div class="grid g2">
    <div class="card no-tilt"><span class="tag">Temperatura máx/mín</span><div class="chart-box"><canvas id="ch-t"></canvas></div></div>
    <div class="card no-tilt"><span class="tag">Nieve nueva (cm/día)</span><div class="chart-box"><canvas id="ch-s"></canvas></div></div>
  </div>
  <div class="table-wrap" id="wx-table" style="margin-top:20px"></div>

  <h2>Manto y <span class="grad-text">cota de nieve</span></h2>
  <div class="card no-tilt"><span class="tag">Espesor de nieve modelado + isoterma 0 °C · 7 días</span><div class="chart-box"><canvas id="ch-d"></canvas></div></div>
  <div class="card no-tilt" style="margin-top:20px" id="hist"><span class="tag">Referencia: 16–29 dic del año pasado (ERA5)</span><p><span class="loader"></span></p></div>

  <h2>Boletín de aludes <span class="grad-text">SLF</span></h2>
  <p class="muted">Oficial, se publica a diario a las 17 h (y actualización 8 h). Nivel 3 es «notable», no «apto con cuidado».</p>
  <div class="grid g2" id="slf"><div class="card"><span class="loader"></span></div></div>

  <h2>Más fuentes <span class="grad-text">(abre y compara)</span></h2>
  <div class="grid g3">
    <div class="card"><span class="tag">Meteo</span><h3>Modelos y radares</h3>${ui.links([['MeteoSwiss', 'https://www.meteoswiss.admin.ch/'], ['Meteoblue multimodelo', 'https://www.meteoblue.com/en/weather/forecast/multimodel/grindelwald_switzerland_2660253'], ['Windy', 'https://www.windy.com/46.624/8.041?46.55,8.04,10'], ['Météo-France montagne', 'https://meteofrance.com/meteo-montagne'], ['AEMET', 'https://www.aemet.es/']])}</div>
    <div class="card"><span class="tag">Nieve</span><h3>Partes y pistas</h3>${ui.links([['Jungfrau live (pistas, remontes, senderos)', 'https://www.jungfrau.ch/de-ch/live/Pistendaten/'], ['SLF nieve', 'https://www.slf.ch/en/'], ['White Risk', 'https://whiterisk.ch/en/conditions'], ['Snow-Forecast Grindelwald', 'https://www.snow-forecast.com/resorts/Grindelwald/6day/mid'], ['Bergfex', 'https://www.bergfex.com/grindelwald/'], ['Skiresort.info', 'https://www.skiresort.info/ski-resort/kleine-scheidegg-maennlichen-grindelwald-wengen/'], ['Skitourenguru', 'https://www.skitourenguru.ch/']])}</div>
    <div class="card"><span class="tag">Webcams</span><h3>Míralo antes de subir</h3>${ui.links([['Webcams Jungfrau', 'https://www.jungfrau.ch/de-ch/live/webcams/'], ['Roundshot Grindelwald', 'https://grindelwald.roundshot.com/'], ['Meteoblue webcams', 'https://www.meteoblue.com/en/weather/webcams/grindelwald_switzerland_2660253'], ['Webcams Mürren-Schilthorn', 'https://schilthorn.ch/']])}</div>
    <div class="card"><span class="tag">Carreteras y cadenas</span><h3>Ruta y accesos</h3>${ui.links([['TCS tráfico', 'https://www.tcs.ch/de/tools/verkehrsinfo/'], ['Viasuisse', 'https://www.viasuisse.ch/'], ['Bison Futé', 'https://www.bison-fute.gouv.fr/'], ['Inforoute Ain/Haute-Savoie', 'https://www.inforoute74.fr/'], ['DGT Infocar', 'https://infocar.dgt.es/etraffic/']])}</div>
    <div class="card"><span class="tag warn">Foehn</span><h3>Viento cálido del sur</h3><p>En Grindelwald dispara la temperatura, cierra remontes y empeora la nieve. Si los modelos muestran rachas >60 km/h en cumbres y subida brusca de temperatura: plan de valle.</p></div>
    <div class="card"><span class="tag bad">No subir a Faulhorn</span><h3>Con viento, niebla o nevada reciente</h3><p>Plan B: senderos de fondo de valle, Interlaken y lagos, Sportzentrum (piscina, rocódromo, hielo).</p></div>
  </div>`,

  async mount(el, ctx) {
    const { live, ui, get, set } = ctx;
    const all = [...WX_POINTS, ...WX_ROUTE];
    const load = async id => {
      const p = all.find(x => x.id === id);
      charts.forEach(c => c.destroy()); charts = [];
      el.querySelector('#wx-now').innerHTML = '<div class="card"><span class="loader"></span></div>';
      const [w, s] = await Promise.all([live.weather(p.pos[0], p.pos[1], p.elev), live.snowNow(p.pos[0], p.pos[1], p.elev)]);
      const d = w.daily, days = d.time.map(t => new Date(t + 'T12:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));
      const avail = live.MODELS.filter(m => (d['temperature_2m_max_' + m.id] || []).some(v => v != null));
      const avg = k => d.time.map((_, i) => { const v = avail.map(m => d[`${k}_${m.id}`]?.[i]).filter(v => v != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; });
      const sn7 = avg('snowfall_sum').slice(0, 7).reduce((a, b) => a + (b || 0), 0);
      const spread = d.time.map((_, i) => { const v = avail.map(m => d['temperature_2m_max_' + m.id]?.[i]).filter(v => v != null); return Math.max(...v) - Math.min(...v); });
      el.querySelector('#wx-now').innerHTML = `
        <div class="card"><span class="tag"><span class="live-dot"></span>Ahora · ${p.elev} m</span><div class="big-num">${s.current.temperature_2m.toFixed(0)}° ${live.WMO(s.current.weather_code)}</div><p class="small muted">Viento ${s.current.wind_speed_10m.toFixed(0)} km/h</p></div>
        <div class="card"><span class="tag">Nieve en el suelo</span><div class="big-num">${Math.round((s.current.snow_depth || 0) * 100)} cm</div><p class="small muted">Modelo, no medición</p></div>
        <div class="card"><span class="tag">Nieve nueva 7 días</span><div class="big-num">${sn7.toFixed(0)} cm</div><p class="small muted">Media de ${avail.length} modelos</p></div>
        <div class="card"><span class="tag ${spread[3] > 6 ? 'warn' : 'ok'}">Acuerdo entre modelos</span><div class="big-num">±${(spread.slice(0, 5).reduce((a, b) => a + b, 0) / 5 / 2).toFixed(1)}°</div><p class="small muted">${spread[3] > 6 ? 'Incertidumbre alta' : 'Modelos coherentes'}</p></div>`;

      Chart.defaults.color = '#9fb0c8'; Chart.defaults.borderColor = 'rgba(255,255,255,.08)'; Chart.defaults.font.family = 'Inter Tight';
      charts.push(new Chart(el.querySelector('#ch-t'), { type: 'line', data: { labels: days, datasets: avail.flatMap(m => [
        { label: m.name + ' máx', data: d['temperature_2m_max_' + m.id], borderColor: m.color, backgroundColor: m.color, tension: .35, pointRadius: 2 },
        { label: m.name + ' mín', data: d['temperature_2m_min_' + m.id], borderColor: m.color, borderDash: [4, 4], tension: .35, pointRadius: 0 }]) },
        options: { maintainAspectRatio: false, plugins: { legend: { labels: { filter: i => i.text.endsWith('máx'), boxWidth: 10 } } }, scales: { y: { ticks: { callback: v => v + '°' } } } } }));
      charts.push(new Chart(el.querySelector('#ch-s'), { type: 'bar', data: { labels: days, datasets: avail.map(m => ({ label: m.name, data: d['snowfall_sum_' + m.id], backgroundColor: m.color, borderRadius: 4 })) },
        options: { maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 10 } } }, scales: { y: { ticks: { callback: v => v + ' cm' } } } } }));
      const hs = s.hourly, lab = hs.time.map(t => t.slice(5, 13).replace('T', ' '));
      charts.push(new Chart(el.querySelector('#ch-d'), { type: 'line', data: { labels: lab, datasets: [
        { label: 'Espesor nieve (cm)', data: hs.snow_depth.map(v => v * 100), borderColor: '#5ee7ff', backgroundColor: 'rgba(94,231,255,.15)', fill: true, pointRadius: 0, yAxisID: 'y' },
        { label: 'Isoterma 0 °C (m)', data: hs.freezing_level_height, borderColor: '#ff5ea8', pointRadius: 0, yAxisID: 'y1' }] },
        options: { maintainAspectRatio: false, scales: { x: { ticks: { maxTicksLimit: 8 } }, y: { position: 'left' }, y1: { position: 'right', grid: { display: false } } } } }));

      el.querySelector('#wx-table').innerHTML = `<table><thead><tr><th>Día</th>${avail.map(m => `<th style="color:${m.color}">${m.name}</th>`).join('')}</tr></thead><tbody>
        ${d.time.map((t, i) => `<tr><td><b>${days[i]}</b></td>${avail.map(m => {
          const tx = d['temperature_2m_max_' + m.id]?.[i], tn = d['temperature_2m_min_' + m.id]?.[i], sn = d['snowfall_sum_' + m.id]?.[i], wg = d['wind_gusts_10m_max_' + m.id]?.[i], wc = d['weather_code_' + m.id]?.[i];
          return tx == null ? '<td class="muted">—</td>' : `<td>${live.WMO(wc)} <b>${Math.round(tx) || 0}°</b>/${Math.round(tn) || 0}°${sn ? ` <span style="color:var(--a1);font-weight:700">❄${sn.toFixed(0)}</span>` : ''}${wg > 60 ? ` <span style="color:var(--warn)">💨${wg.toFixed(0)}</span>` : ''}</td>`;
        }).join('')}</tr>`).join('')}</tbody></table>`;

      // Histórico año pasado
      live.lastYear(p.pos[0], p.pos[1], p.elev).then(h => {
        const dd = h.daily, mx = Math.max(...dd.temperature_2m_max), mn = Math.min(...dd.temperature_2m_min), sn = dd.snowfall_sum.reduce((a, b) => a + (b || 0), 0), sd = Math.max(...(dd.snow_depth_max || [0]).map(v => v || 0));
        el.querySelector('#hist').innerHTML = `<span class="tag">Referencia: 16–29 dic 2025 en ${p.name} (reanálisis ERA5)</span>
          <div class="grid g4" style="margin-top:10px"><div><div class="big-num">${mn.toFixed(0)}°</div><p class="muted small">mínima</p></div><div><div class="big-num">${mx.toFixed(0)}°</div><p class="muted small">máxima</p></div><div><div class="big-num">${sn.toFixed(0)} cm</div><p class="muted small">nieve caída</p></div><div><div class="big-num">${(sd * 100).toFixed(0)} cm</div><p class="muted small">espesor máx</p></div></div>`;
      }).catch(() => el.querySelector('#hist').innerHTML = '<p class="muted">Histórico no disponible.</p>');
    };
    el.querySelector('[data-seg=wxp]').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      el.querySelectorAll('[data-seg=wxp] button').forEach(x => x.classList.toggle('on', x === b));
      set('wxp', b.dataset.v); load(b.dataset.v).catch(console.error);
    });
    load(get('wxp', 'lb')).catch(e => { console.error(e); el.querySelector('#wx-now').innerHTML = '<div class="card">Meteo no disponible ahora.</div>'; });

    // SLF
    try {
      const g = await live.slf();
      const feats = g.features.filter(f => f.properties.regions.some(r => SLF_MATCH.test(r.regionID)));
      const show = (feats.length ? feats : g.features.slice(0, 2)).slice(0, 4);
      el.querySelector('#slf').innerHTML = show.map(f => {
        const pr = f.properties, max = Math.max(...pr.dangerRatings.map(d => LVL[d.mainValue] || 0));
        const sub = pr.dangerRatings[0]?.customData?.CH?.subdivision;
        return `<div class="card no-tilt"><div style="display:flex;gap:16px;align-items:center"><span class="danger d${max}">${max}${sub === 'plus' ? '+' : sub === 'minus' ? '−' : ''}</span>
          <div><h3 style="margin:0">${LVL_ES[max]}</h3><p class="small muted" style="margin:0">${pr.regions.slice(0, 6).map(r => r.name).join(' · ')}${pr.regions.length > 6 ? ` +${pr.regions.length - 6}` : ''}</p></div></div>
          ${pr.avalancheProblems.map(a => `<p style="margin-top:14px"><b>${PROB_ES[a.problemType] || a.problemType}</b> · ${a.elevation?.lowerBound ? '>' + a.elevation.lowerBound + ' m' : ''}${a.elevation?.upperBound ? '<' + a.elevation.upperBound + ' m' : ''} · ${(a.aspects || []).join(' ')}</p><p class="small muted">${(a.comment || '').replace(/<[^>]+>/g, ' ').slice(0, 320)}…</p>`).join('')}
          <p class="source">Válido ${new Date(pr.validTime.startTime).toLocaleString('es-ES')} → ${new Date(pr.validTime.endTime).toLocaleString('es-ES')} · <a href="https://whiterisk.ch/en/conditions" target="_blank">Ver completo ↗</a></p></div>`;
      }).join('');
    } catch { el.querySelector('#slf').innerHTML = '<div class="card">Boletín SLF no disponible ahora. <a href="https://whiterisk.ch/en/conditions" target="_blank">whiterisk.ch ↗</a></div>'; }
  },
};
