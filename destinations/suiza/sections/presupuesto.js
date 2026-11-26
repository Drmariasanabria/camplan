import { IMG, STRATEGIES, BASES } from '../data.js';
import { plan as computePlan, getCfg } from '../engine.js';
import { bindCfg } from '../common.js';

let chart;
const alt = (ctx, patch) => { const cfg = { ...getCfg(ctx), ...patch }; return computePlan({ ...ctx, get: (k, d) => k === 'cfg' ? cfg : ctx.get(k, d) }); };

export default {
  id: 'presupuesto', title: 'Presupuesto', icon: '💶',
  bg: [IMG.thun, IMG.interlaken],
  render(ctx) {
    const { ui, plan: p } = ctx, c = p.cfg, b = p.budget;
    const fromIT = p.stays.at(-1)?.country === 'IT';
    const scen = (fromIT ? [['A', 'IT', 'Autopista ida · vuelta por Montgenèvre'], ['A', 'MB', 'Autopista ida · vuelta por el túnel del Mont Blanc'], ['B', 'IT', 'Mixta ida · vuelta por Montgenèvre']]
      : [['A', 'A', 'Autopista ida y vuelta'], ['B', 'B', 'Mixta ida y vuelta'], ['B', 'A', 'Mixta ida, autopista vuelta']]).map(([o, r, l]) => {
      const q = alt(ctx, { outStrategy: o, retStrategy: r, stopsOut: {}, stopsRet: {} });
      return { l, q, cur: o === c.outStrategy && r === c.retStrategy };
    });
    const bases = BASES.filter(x => c.dogs <= x.maxDogs).map(x => ({ x, q: alt(ctx, { stays: [{ base: x.id, nights: 0, price: p.stays.find(st => st.base.id === x.id)?.price || 0 }] }) }));
    return `<p class="kicker">Presupuesto vivo</p><h1 class="title">Cuánto cuesta <span class="grad-text">de verdad</span></h1>
    <p class="lead">Calculado con vuestras fechas, kilómetros reales, el combustible de hoy, el cambio del día (1 € = ${p.fx.toFixed(3)} CHF) y lo que hayáis elegido. Cambia cualquier cifra aquí o en <a href="#/suiza/viaje">Mi viaje</a>.</p>
    <div class="grid g2">
      <div class="card no-tilt" style="text-align:center"><span class="tag"><span class="live-dot"></span>Total estimado</span>
        <div class="big-num grad-text" style="font-size:clamp(52px,6vw,84px)">${ui.eur(b.total)}</div>
        <p>${ui.eur(b.total / c.adults)} por persona · ${ui.eur(b.total / p.totalDays)} al día · ${p.totalDays} días</p>
        <div class="chart-box" style="height:300px"><canvas id="b-chart"></canvas></div></div>
      <div class="table-wrap"><table><thead><tr><th>Partida</th><th class="num">€</th><th>Cómo se calcula</th></tr></thead><tbody>
        ${b.items.filter(i => i.v > 0.5).map(i => `<tr><td><b>${i.l}</b></td><td class="num">${ui.eur(i.v)}</td><td class="small muted">${i.n}</td></tr>`).join('')}
        <tr class="total"><td>Total</td><td class="num">${ui.eur(b.total)}</td><td></td></tr></tbody></table></div>
    </div>

    <h2>Ajusta <span class="grad-text">aquí mismo</span></h2>
    <fieldset><div class="form-grid">
      ${ui.num('foodPerDay', 'Comida y compra (€/día)', c.foodPerDay, { min: 5, max: 200 })}
      ${ui.num('eatOutMeals', 'Comidas en restaurante', c.eatOutMeals, { min: 0, max: 40 })}
      ${ui.num('skiers', 'Personas que esquían', c.skiers, { min: 0, max: c.adults })}
      ${ui.num('skiDays', 'Días de esquí', c.skiDays, { min: 0, max: 12 })}
      ${ui.num('winterPassDays', 'Días de pase invernal', c.winterPassDays, { min: 0, max: 30 })}
      ${ui.num('sitterHours', 'Horas de cuidador', c.sitterHours, { min: 0, max: 80 })}
      
      ${ui.num('contingencyPct', 'Imprevistos (%)', c.contingencyPct, { min: 0, max: 40 })}
    </div></fieldset>

    <h2>Comparar <span class="grad-text">rutas</span></h2>
    ${ui.table(['Opción', 'Días en Suiza', 'Km', 'Peajes', 'Total', 'Diferencia'], scen.map(s => [`<b>${s.l}</b>${s.cur ? ' <span class="badge ok">Actual</span>' : ''}`, s.q.nights, Math.round(s.q.budget.km).toLocaleString('es-ES'), ui.eur(s.q.budget.items.find(i => i.k === 'tolls').v), `<b>${ui.eur(s.q.budget.total)}</b>`, s.cur ? '—' : `<span style="color:${s.q.budget.total < b.total ? 'var(--ok)' : 'var(--warn)'}">${s.q.budget.total < b.total ? '' : '+'}${ui.eur(s.q.budget.total - b.total)}</span>`]), { num: [1, 2, 3, 4, 5] })}
    <p class="small muted">La mixta tarda más: con las mismas fechas puede quedar una noche menos en Suiza, y eso también cambia el total.</p>

    <h2>Si estuvierais todo el tiempo <span class="grad-text">en un solo camping</span></h2>
    ${ui.table(['Camping', 'Noches', 'Total viaje', 'Diferencia con tu plan'], bases.map(({ x, q }) => [`<b>${x.name}</b>${q.warn.some(w => w.lvl === 'bad') ? ' <span class="badge bad">no encaja</span>' : ''}`, q.nights, `<b>${ui.eur(q.budget.total)}</b>`, `<span style="color:${q.budget.total < b.total ? 'var(--ok)' : 'var(--warn)'}">${q.budget.total < b.total ? '' : '+'}${ui.eur(q.budget.total - b.total)}</span>`]), { num: [1, 2, 3] })}

    <h2>Dónde <span class="grad-text">se recorta de verdad</span></h2>
    <div class="grid g3">
      <div class="card"><h3>Llenar en España y en súper franceses</h3><p>Las gasolineras de autopista francesas cobran ≈14 cts/l más que las de supermercado (Leclerc, Intermarché, Carrefour). En Suiza, no repostéis.</p></div>
      <div class="card"><h3>Sin parking los días de esquí</h3><p>El forfait incluye los trenes desde Interlaken Ost: la furgo se queda en el camping.</p></div>
      <div class="card"><h3>Menos días de forfait</h3><p>Cada día de esquí menos ahorra ≈${ui.eur(70 / p.fx)} por esquiador. Antes del 19/12 el día cuesta 79 CHF en vez de 83.</p></div>
      <div class="card"><h3>Rutas desde el valle</h3><p>Lauterbrunnen–Stechelberg, Grütschalp–Mürren o el Aar no necesitan remonte.</p></div>
      <div class="card"><h3>Termo y bocadillo</h3><p>Un menú en restaurante de montaña: 25–35 CHF por persona.</p></div>
      <div class="card"><h3>Altura de la furgo</h3><p>${c.van.height > 2 ? 'Con más de 2 m pagáis clase 2 (≈50 % más). Si con el techo cerrado bajáis de 2 m, ahorráis.' : 'Con ≤2 m pagáis clase 1. Comprobadlo con el cofre puesto.'}</p></div>
    </div>`;
  },
  mount(el, ctx) {
    bindCfg(el, ctx);
    const its = ctx.plan.budget.items.filter(i => i.v > 0.5), colors = ['#5ee7ff', '#7c5cff', '#ff5ea8', '#ffc65c', '#3ee6a1', '#ff8a5c', '#b388ff', '#4fc3f7', '#f06292', '#aed581', '#90a4ae', '#ffd54f', '#80cbc4'];
    chart?.destroy?.();
    chart = new Chart(el.querySelector('#b-chart'), { type: 'doughnut', data: { labels: its.map(i => i.l), datasets: [{ data: its.map(i => Math.round(i.v)), backgroundColor: colors, borderColor: '#070b14', borderWidth: 3 }] },
      options: { maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'right', labels: { color: '#d0dbeb', boxWidth: 12 } } } } });
  },
};
