import { IMG, LIFTS } from '../data.js';
import { D, fmtLong, hhmm, liftOpen, isHigh, addDays, actById, activitiesFor, regionOf } from '../engine.js';
import { warnList } from '../common.js';
import { openRoadbook } from '../roadbook.js';

const A = id => actById(id);
const TYPE = { ski: '🎿 Esquí', hike: '🥾 Ruta', valley: '🏃 Valle', rest: '😌 Descanso', shop: '🛒 Logística', town: '🏊 Pueblo' };

function travelCard(ctx, d) {
  const { ui } = ctx, t = d.travel, s = t.stop, c = ctx.plan.cfg, first = d.date === c.depart, last = t.dir === 'ret' && !s;
  const tips = [];
  if (t.dir === 'out' && first) tips.push(`Llenad el depósito en España antes de Irún: es bastante más barato que en Francia.`);
  if (t.dir === 'out' && !s) tips.push(`Cruzad la ${ui.term('Bardonnex', 'aduana de Bardonnex')} a media mañana o mediodía, nunca de 5:30 a 9:30.`, ...(ctx.plan.base.pos[0] > 46.45 ? [`Si pasáis por Berna, parada técnica en el ${ui.term('Grauholz', 'área de Grauholz')}: agua y vaciado gratis.`] : []), `Últimos 20 km por el valle: con nieve, cadenas a mano.`);
  if (t.dir === 'ret' && d.date === ctx.plan.leave) tips.push(`Antes de salir: vaciado de ${ui.term('grises')} y agua en el camping. Llenad depósito en Francia (en Suiza es más caro).`);
  if (last) tips.push('Repostad en España nada más cruzar Irún.');
  if (s) tips.push(`${ui.term('Camping-Car Park')}${s.card ? '' : ''}: ${s.winter}`);
  return `<div class="day travel" id="d-${d.date}"><div class="dd"><b>${D(d.date).getDate()}</b><span>${D(d.date).toLocaleDateString('es-ES', { weekday: 'long' })}</span></div>
  <div><div class="badges"><span class="badge info">🚐 ${t.dir === 'out' ? 'Ida' : 'Vuelta'}</span>${t.over ? '<span class="badge warn">Etapa larga</span>' : ''}${t.late ? '<span class="badge warn">Llegada de noche</span>' : ''}${d.hol ? `<span class="badge warn">${d.hol.name}</span>` : ''}</div>
    <h3>${ui.esc(t.from)} → ${ui.esc(t.to)}</h3>
    <p><b>${Math.round(t.km)} km</b> · ≈${t.totalH.toFixed(1)} h con pausas · salida ${c.departTime} → llegada ≈${hhmm(t.arrival)}</p>
    ${s ? `<p class="small">🌙 Noche en <b>${s.name}</b> · ${s.price ? s.price.toFixed(2) + ' €' : 'gratis'} · ${s.addr} · <a href="https://www.google.com/maps/dir/?api=1&destination=${s.pos[0]},${s.pos[1]}" target="_blank">navegar ↗</a></p>` : ''}
    <ul class="small" style="margin:8px 0 0;padding-left:18px">${tips.map(x => `<li>${x}</li>`).join('')}</ul></div></div>`;
}

function baseCard(ctx, d) {
  const { ui } = ctx, a = A(d.act) || A('rest'), c = ctx.plan.cfg, isSki = a.type === 'ski';
  const LIST = activitiesFor(d.stay?.base.regionObj || regionOf(d.stay?.base.region));
  const opts = LIST.map(x => `<option value="${x.id}" ${x.id === a.id ? 'selected' : ''}>${TYPE[x.type].split(' ')[0]} ${x.name}${liftOpen(x.lift, d.date) ? '' : ' (remonte cerrado)'}${x.dogs ? '' : ' · sin perros'}</option>`).join('');
  const dogOpts = LIST.filter(x => x.dogs && x.type !== 'shop').map(x => `<option value="${x.id}" ${x.id === d.alt ? 'selected' : ''}>${x.name}</option>`).join('');
  const altTxt = isSki ? (c.adults > c.skiers ? (A(d.alt) ? `Quien no esquía, con los perros: <b>${A(d.alt).name}</b>.` : 'Quien no esquía se queda con los perros (elige plan abajo).')
    : `Esquiáis todos: los perros necesitan ${ui.term('petsitting24', 'cuidador')}. No los dejéis horas en la furgo.`) : '';
  const lifts = d.stay?.base.region === 'jungfrau' ? Object.entries(LIFTS).filter(([k]) => liftOpen(k, d.date)).map(([, l]) => l.name) : [`Consultar en ${d.stay?.base.town}`];
  return `<div class="day base" id="d-${d.date}"><div class="dd"><b>${D(d.date).getDate()}</b><span>${D(d.date).toLocaleDateString('es-ES', { weekday: 'long' })}</span></div>
  <div><div class="badges"><span class="badge info">📍 ${d.stay?.base.town || ''}</span>${d.transfer ? '<span class="badge warn">🚐 Día de traslado</span>' : ''}<span class="badge ok">${TYPE[a.type]}</span>${d.hol ? `<span class="badge ${d.hol.kind === 'closed' ? 'bad' : 'warn'}">${d.hol.name}: ${d.hol.note}</span>` : ''}${isHigh(d.date) ? '<span class="badge">Tarifa alta remontes</span>' : ''}${d.liftWarn ? `<span class="badge bad">⚠ ${d.liftWarn}</span>` : ''}${a.dogs ? '<span class="badge info">🐕 Con perros</span>' : '<span class="badge warn">Sin perros</span>'}${d.edited ? '<span class="badge">Editado por ti</span>' : ''}</div>
    <h3>${a.name}</h3>
    ${d.auto ? `<p><b>${d.auto}</b></p>` : ''}
    <p>${a.text}</p>
    <p class="small muted">${a.km ? `${a.km} km · ${a.time} · ${a.up} · ` : ''}Cómo: ${a.how} · Coste: ${a.generic ? a.cost : a.cost.replace('Forfait', ui.term('forfait', 'forfait')).replace('Pase invernal', ui.term('pase invernal', 'pase invernal'))}${a.links ? ` · <a href="${a.links.wikiloc}" target="_blank">rutas en Wikiloc ↗</a>` : ''}</p>
    ${a.crit ? `<p class="small" style="color:var(--warn)">⚠ ${a.crit}</p>` : ''}
    ${altTxt ? `<p class="small">🐕 ${altTxt}</p>` : ''}
    <p class="small muted">Remontes abiertos ese día: ${lifts.join(' · ') || 'ninguno'}</p>
    <div class="day-edit">
      <label class="field">Cambiar plan del día<select data-day="${d.date}" data-k="act">${opts}</select></label>
      ${isSki ? `<label class="field">Plan de quien no esquía + perros<select data-day="${d.date}" data-k="alt"><option value="">— elegir —</option>${dogOpts}</select></label>` : `<label class="field">Nota<input type="text" data-day="${d.date}" data-k="note" value="${ui.esc(d.note || '')}" placeholder="Reserva, hora, idea…"></label>`}
    </div>${isSki && d.note !== undefined ? '' : ''}</div></div>`;
}

function ics(p) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CAMPlan//ES'];
  const ds = s => s.replace(/-/g, '');
  p.days.forEach(d => {
    const title = d.travel ? `🚐 ${d.travel.from} → ${d.travel.to} (${Math.round(d.travel.km)} km)` : d.kind === 'buffer' ? 'Día colchón' : (A(d.act)?.name || 'Día libre');
    lines.push('BEGIN:VEVENT', `UID:${d.date}-roadbook`, `DTSTART;VALUE=DATE:${ds(d.date)}`, `DTEND;VALUE=DATE:${ds(addDays(d.date, 1))}`, `SUMMARY:${title.replace(/[,;]/g, ' ')}`, 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export default {
  id: 'itinerario', title: 'Plan día a día', icon: '🗓️',
  bg: [IMG.kleine, IMG.bachalpsee, IMG.murren],
  render(ctx) {
    const { ui, plan: p } = ctx;
    return `<p class="kicker">Itinerario</p><h1 class="title">Plan <span class="grad-text">día a día</span></h1>
    <p class="lead">Generado con tus fechas, las aperturas de remontes, los festivos de Navidad y vuestros intereses. Cambia cualquier día: se guarda y el presupuesto se ajusta.</p>
    ${warnList(p)}
    <div class="callout"><h3>Rutina cada mañana antes de decidir</h3><p>1) Estado de pistas y senderos · 2) Tiempo, viento y ${ui.term('SLF', 'peligro de aludes')} · 3) Normas para perros en ese transporte · 4) Hora de puesta de sol (≈16:45) · 5) Cómo volvéis al camping.</p></div>
    <div class="btn-row"><button class="btn" id="ics">📆 Añadir al calendario</button><button class="btn primary" id="print">📄 Plan en PDF</button><button class="btn" id="auto">↺ Volver al plan automático</button></div>
    ${p.days.map(d => d.travel ? travelCard(ctx, d) : d.kind === 'buffer'
      ? `<div class="day buffer"><div class="dd"><b>${D(d.date).getDate()}</b><span>${D(d.date).toLocaleDateString('es-ES', { weekday: 'long' })}</span></div><div><h3>Día colchón</h3><p>En casa. Margen por si una nevada o un corte retrasa la vuelta.</p></div></div>`
      : baseCard(ctx, d)).join('')}`;
  },
  mount(el, ctx) {
    el.querySelectorAll('[data-day]').forEach(i => i.addEventListener('change', () => {
      const dp = ctx.get('dayplan', {}); (dp[i.dataset.day] ||= {})[i.dataset.k] = i.value; ctx.set('dayplan', dp); ctx.rerender();
    }));
    el.querySelector('#auto').onclick = () => { ctx.set('dayplan', {}); ctx.rerender(); };
    el.querySelector('#print').onclick = () => openRoadbook(ctx.plan, ctx);
    el.querySelector('#ics').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics(ctx.plan)], { type: 'text/calendar' })); a.download = 'camplan-viaje.ics'; a.click(); };
  },
};
