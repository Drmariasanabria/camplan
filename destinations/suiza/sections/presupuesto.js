import { IMG, SKIPASS } from '../data.js';

// Escenarios de la guía PRO (revisados, sin Manor Farm)
const PRESETS = {
  A: { label: 'A · Autopista', fuel: 650, tolls: 230, vignette: 50, frNights: 30, nights: 10, chfNight: 80, foodDay: 32, skiDays: 4, skiPeople: 1, winterPass: 195, parking: 70, laundry: 30, insurance: 0, contingency: 180 },
  B: { label: 'B · Mixta', fuel: 620, tolls: 130, vignette: 50, frNights: 60, nights: 9, chfNight: 80, foodDay: 28, skiDays: 4, skiPeople: 1, winterPass: 195, parking: 50, laundry: 30, insurance: 0, contingency: 180 },
  C: { label: 'C · Ahorro', fuel: 620, tolls: 130, vignette: 50, frNights: 60, nights: 9, chfNight: 80, foodDay: 26, skiDays: 2, skiPeople: 1, winterPass: 65, parking: 40, laundry: 20, insurance: 0, contingency: 180 },
};
const FIELDS = [
  ['fuel', '⛽ Gasóleo i/v', '€', 0, 1200, 10], ['tolls', '🛣️ Peajes España + Francia', '€', 0, 500, 5], ['vignette', "🏷️ Viñeta + Crit'Air", '€', 0, 100, 1],
  ['frNights', '🌙 Áreas en Francia', '€', 0, 150, 1], ['nights', '🏕️ Noches camping Suiza', 'noches', 0, 12, 1], ['chfNight', '💶 Precio/noche (2 perros, luz)', 'CHF', 30, 130, 1],
  ['foodDay', '🍝 Comida y compra / día', '€', 10, 70, 1], ['skiDays', '🎿 Días de forfait', 'días', 0, 5, 1], ['skiPeople', '👥 Personas que esquían', 'pers.', 0, 2, 1],
  ['winterPass', '🥾 Pases invernales (no esquiador)', '€', 0, 400, 5], ['parking', '🅿️ Parking, lavado y servicios', '€', 0, 200, 5], ['laundry', '🧺 Lavandería', '€', 0, 80, 5],
  ['insurance', '🚁 Seguro montaña (si no lo tenéis)', '€', 0, 400, 10], ['contingency', '🧯 Fondo de contingencia', '€', 0, 500, 10],
];
let chart;

export default {
  id: 'presupuesto', title: 'Presupuesto', icon: '💶',
  bg: [IMG.thun, IMG.interlaken],
  render: ({ ui, get }) => {
    const v = get('budget', PRESETS.A);
    return `${ui.header('Presupuesto vivo', 'Cuánto cuesta <span class="grad-text">de verdad</span>', 'Para 2 personas, 2 perros y la camper. Mueve cada partida; los CHF se convierten con el cambio del BCE de hoy. Se guarda en tu cuenta.')}
    <div class="btn-row">${Object.entries(PRESETS).map(([k, p]) => `<button class="btn" data-preset="${k}">${p.label}</button>`).join('')}<button class="btn" id="b-two">⛷️⛷️ Esquían los dos</button></div>
    <div class="grid g2">
      <div class="card no-tilt">${FIELDS.map(([k, l, u, mn, mx, st]) => `
        <label class="field" style="margin-bottom:14px"><span style="display:flex;justify-content:space-between">${l}<b><span id="o-${k}">${v[k]}</span> ${u}</b></span>
        <input type="range" min="${mn}" max="${mx}" step="${st}" value="${v[k]}" data-k="${k}"></label>`).join('')}</div>
      <div>
        <div class="card no-tilt" style="text-align:center"><span class="tag"><span class="live-dot"></span>Total estimado</span>
          <div class="big-num grad-text" id="b-total" style="font-size:clamp(56px,7vw,96px)">—</div>
          <p class="lead" style="margin:8px auto" id="b-sub"></p>
          <div class="chart-box" style="height:300px"><canvas id="b-chart"></canvas></div></div>
        <div class="table-wrap" style="margin-top:20px" id="b-table"></div>
      </div>
    </div>

    <h2>Escenarios <span class="grad-text">de la guía</span></h2>
    ${ui.table(['Concepto', 'A / Autopista', 'B / Mixta', 'C / Ahorro'], [
      ['Gasóleo', '650 €', '620 €', '620 €'], ['Peajes ES + FR', '230 €', '130 €', '130 €'], ["Viñeta + Crit'Air", '50 €', '50 €', '50 €'], ['Áreas francesas', '30 €', '60 €', '60 €'],
      ['Camping Jungfrau', '850 € · 10 n', '765 € · 9 n', '765 € · 9 n'], ['Comida y compra', '450 €', '400 €', '370 €'], ['Esquí · una persona', '330 € · 4 d', '330 € · 4 d', '175 € · 2 d'],
      ['Pases invernales · una persona', '195 €', '195 €', '65 €'], ['Parking, lavado, servicios', '70 €', '50 €', '40 €'], ['Contingencia', '180 €', '180 €', '180 €'],
      { _cls: 'total', cells: ['TOTAL ORIENTATIVO', '3.035 €', '2.780 €', '2.455 €'] }])}
    <p class="source">Precio de parcela como hipótesis (~85 €/noche con 2 perros), nunca tarifa confirmada. No incluye: segundo forfait, seguro, material/guía de travesía, restaurantes (25–35 CHF/menú), reparaciones, suplementos eléctricos. Pienso: ya lo tenéis.</p>

    <h2>Dónde <span class="grad-text">se recorta de verdad</span></h2>
    <div class="grid g3">
      <div class="card"><div class="big-num grad-text">−180–230 €</div><h3>Ruta mixta RCEA</h3><p>A cambio de ≈2 h más por trayecto y perder el día colchón.</p></div>
      <div class="card"><div class="big-num grad-text">−155 €</div><h3>2 días de esquí en vez de 4</h3><p>Y antes del 19/12 el forfait es 79 vs 83 CHF.</p></div>
      <div class="card"><div class="big-num grad-text">−40 €</div><h3>Cero parking</h3><p>El forfait incluye el tren desde Interlaken Ost.</p></div>
      <div class="card"><div class="big-num grad-text">−14 cts/l</div><h3>Gasolineras de súper</h3><p>Leclerc/Intermarché/Carrefour frente a autopista. En Suiza, nada.</p></div>
      <div class="card"><div class="big-num grad-text">−25 CHF</div><h3>Por comida en montaña</h3><p>Termo y bocadillo. Compra grande en Francia + Lidl/Aldi.</p></div>
      <div class="card"><div class="big-num grad-text">+110 €</div><h3>Ojo: clase 2</h3><p>Si la furgo pasa de 2 m, la ruta A sube ≈110 € y la B ≈55 €.</p></div>
    </div>`;
  },

  async mount(el, { ui, live, get, set, sfx }) {
    const fx = await live.eurChf();
    let v = { ...PRESETS.A, ...get('budget', {}) };
    const apply = () => {
      const ski = (SKIPASS.find(r => r[0] === `${v.skiDays} día${v.skiDays > 1 ? 's' : ''}`)?.[2] || 0) * v.skiPeople / fx.rate;
      const camp = v.nights * v.chfNight / fx.rate;
      const food = v.foodDay * 14;
      const parts = [['Gasóleo', v.fuel], ['Peajes', v.tolls], ["Viñeta/Crit'Air", v.vignette], ['Áreas FR', v.frNights], ['Camping CH', camp], ['Comida', food], ['Forfaits', ski], ['Pases invernales', v.winterPass], ['Parking/servicios', v.parking], ['Lavandería', v.laundry], ['Seguro', v.insurance], ['Contingencia', v.contingency]].filter(p => p[1] > 0);
      const total = parts.reduce((a, p) => a + p[1], 0);
      el.querySelector('#b-total').textContent = ui.eur(total);
      el.querySelector('#b-sub').textContent = `${ui.eur(total / 2)} por persona · ${ui.eur(total / 14)} al día · 1 € = ${fx.rate.toFixed(3)} CHF`;
      el.querySelector('#b-table').innerHTML = `<table><tbody>${parts.map(p => `<tr><td>${p[0]}</td><td class="num">${ui.eur(p[1])}</td><td class="num muted">${(p[1] / total * 100).toFixed(0)} %</td></tr>`).join('')}<tr class="total"><td>Total</td><td class="num">${ui.eur(total)}</td><td></td></tr></tbody></table>`;
      const colors = ['#5ee7ff', '#7c5cff', '#ff5ea8', '#ffc65c', '#3ee6a1', '#ff8a5c', '#a0f', '#4fc3f7', '#f06292', '#aed581', '#90a4ae', '#ffd54f'];
      if (!chart) chart = null;
      if (chart && document.body.contains(chart.canvas)) { chart.data.labels = parts.map(p => p[0]); chart.data.datasets[0].data = parts.map(p => Math.round(p[1])); chart.update(); }
      else chart = new Chart(el.querySelector('#b-chart'), { type: 'doughnut', data: { labels: parts.map(p => p[0]), datasets: [{ data: parts.map(p => Math.round(p[1])), backgroundColor: colors, borderColor: '#070b14', borderWidth: 3 }] }, options: { maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'right', labels: { color: '#d0dbeb', boxWidth: 12 } } } } });
      set('budget', v);
    };
    const sync = () => FIELDS.forEach(([k]) => { el.querySelector(`[data-k=${k}]`).value = v[k]; el.querySelector('#o-' + k).textContent = v[k]; });
    el.querySelectorAll('[data-k]').forEach(i => i.addEventListener('input', () => { v[i.dataset.k] = +i.value; el.querySelector('#o-' + i.dataset.k).textContent = i.value; apply(); }));
    el.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => { v = { ...PRESETS[b.dataset.preset] }; sync(); apply(); sfx.success(); }));
    el.querySelector('#b-two').addEventListener('click', () => { v.skiPeople = 2; v.winterPass = 0; sync(); apply(); });
    sync(); apply();
  },
};
