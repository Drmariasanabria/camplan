import { IMG } from '../data.js';
import { fmtDate, diffDays, iso } from '../engine.js';

export default {
  id: 'preparar', title: 'Antes de salir', icon: '✅',
  bg: [IMG.bern, IMG.geneva],
  render(ctx) {
    const { ui, plan: p } = ctx, t = ui.term, today = iso(new Date()), done = ctx.get('prep', {});
    const n = p.prep.filter(x => done[x.id]).length;
    const status = x => { if (done[x.id]) return ['ok', 'Hecho']; const dd = diffDays(today, x.due);
      return dd < 0 ? ['bad', `Atrasado ${-dd} d`] : dd === 0 ? ['bad', 'Hoy'] : dd <= 3 ? ['warn', `En ${dd} d`] : ['', `En ${dd} d`]; };
    const txt = x => x.term ? `${x.t} · ${t(x.term, 'qué es')}` : x.go ? `${x.t} · <a href="#/suiza/${x.go}" onclick="event.stopPropagation()">ir →</a>` : x.t;
    return `<p class="kicker">Preparación</p><h1 class="title">Antes <span class="grad-text">de salir</span></h1>
    <p class="lead">Cada tarea tiene fecha límite calculada desde tu día de salida (${fmtDate(p.cfg.depart)}). Si cambias la fecha, los plazos se mueven solos. Pincha una tarea para marcarla.</p>
    <div class="card no-tilt"><span class="tag">Progreso</span><div class="big-num">${n} / ${p.prep.length}</div><div class="progress"><i style="width:${n / p.prep.length * 100}%"></i></div></div>
    <div style="margin-top:20px">${p.prep.map(x => { const [cls, lab] = status(x); return `<div class="prep-row ${done[x.id] ? 'done' : ''}" data-prep="${x.id}">
      <span class="check ${done[x.id] ? 'done' : ''}" style="padding:0"><span class="box"></span></span>
      <span class="due">${fmtDate(x.due)} <span class="badge ${cls}">${lab}</span></span>
      <span class="t">${txt(x)}</span><span class="badge">${x.cat}</span></div>`; }).join('')}</div>

    <h2>Documentos <span class="grad-text">que hay que llevar</span></h2>
    <div class="grid g3">
      <div class="card"><span class="tag">👥 Cada persona</span><ul><li>DNI o pasaporte en vigor (Suiza es Schengen pero hay control aduanero)</li><li>Carné de conducir español</li><li>${t('TSE', 'Tarjeta Sanitaria Europea')}</li><li>Seguro con rescate: ${t('licencia FCDME', 'licencia de montaña con Europa')} o seguro de viaje</li></ul></div>
      <div class="card"><span class="tag">🚐 La furgoneta</span><ul><li>Permiso de circulación y ficha técnica con ITV en vigor</li><li>Póliza del seguro y teléfono de asistencia</li><li>${t("Crit'Air", "Pegatina Crit'Air 2")} en el parabrisas</li><li>${t('e-viñeta', 'Viñeta suiza')} (digital, va con la matrícula)</li><li>${t('V-16', 'Baliza V-16')}, triángulos y chalecos</li></ul></div>
      <div class="card"><span class="tag">🐕 ${p.cfg.dogs} perro${p.cfg.dogs === 1 ? '' : 's'} (${ui.esc(p.cfg.dogNames)})</span><ul><li>Pasaporte europeo de cada uno</li><li>Microchip legible + antirrábica vigente (${t('BLV', 'requisitos suizos')})</li><li>Cartilla y medicación</li><li>Bozal: algunos transportes lo piden</li></ul></div>
    </div>

    <h2>Lo que se puede <span class="grad-text">pasar por la aduana</span></h2>
    <p>Suiza no está en la unión aduanera de la UE. Límites <b>por persona y día</b> (${t('aduana suiza', 'más info')}). Para vosotros (${p.cfg.adults} adultos) el día que cruzáis:</p>
    ${ui.table(['Producto', 'Por persona', `Total ${p.cfg.adults} adultos`, 'Si os pasáis'], [
      ['Valor total de lo que lleváis comprado', '150 CHF', `${150 * p.cfg.adults} CHF`, 'IVA suizo sobre todo'],
      ['Carne y embutido (no caza)', '1 kg', `${p.cfg.adults} kg`, '17 CHF/kg'],
      ['Mantequilla o nata', '1 kg', `${p.cfg.adults} kg`, '16 CHF/kg'],
      ['Vino y cerveza (≤18 %)', '5 l', `${5 * p.cfg.adults} l`, '2 CHF/l'],
      ['Licores (>18 %)', '1 l', `${p.cfg.adults} l`, 'Según tarifa'],
      ['Aceite y grasas', '5 kg', `${5 * p.cfg.adults} kg`, '2 CHF/kg']])}
    <p class="small muted">El pienso envasado de la UE entra sin restricción veterinaria, pero cuenta en los 150 CHF. Si os pasáis, declaradlo con la app ${t('QuickZoll')}.</p>

    <h2>Normas <span class="grad-text">al volante</span></h2>
    <div class="grid g3">
      <div class="card"><span class="tag">🇫🇷 Francia</span><h3>130 km/h (110 con lluvia)</h3><p>${t('Loi Montagne', 'Ley de montaña')}: del 1/11 al 31/03, 4 neumáticos ${t('3PMSF')} o cadenas a bordo. ${t('M+S')} ya no vale. Rodear Lyon por la A46 (${t('ZFE', 'zona de bajas emisiones')}).</p></div>
      <div class="card"><span class="tag">🇨🇭 Suiza</span><h3>120 · 80 · 50 km/h</h3><p>Luces encendidas siempre. Detectores de radar prohibidos (también apps que avisan). Cadenas obligatorias donde lo indique la señal. Prohibido dormir fuera de campings y áreas en el cantón de Berna: multas de 200 a 2.000 CHF.</p></div>
      <div class="card"><span class="tag">🇪🇸 España</span><h3>${t('V-16', 'Baliza V-16')} obligatoria</h3><p>Repostad aquí: el combustible es bastante más barato que en Francia y mucho más que en Suiza.</p></div>
    </div>`;
  },
  mount(el, ctx) {
    el.querySelectorAll('[data-prep]').forEach(r => r.addEventListener('click', e => {
      if (e.target.closest('.term,a')) return;
      const d = ctx.get('prep', {}); d[r.dataset.prep] = !d[r.dataset.prep]; ctx.set('prep', d);
      d[r.dataset.prep] ? ctx.sfx.check() : ctx.sfx.uncheck(); ctx.rerender();
    }));
  },
};
