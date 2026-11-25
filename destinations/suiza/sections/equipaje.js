import { IMG } from '../data.js';

const EXTRA_DEF = { heater: 'diesel', gas: true, cook: 'gas', minT: -12 };

const ITEMS = (c, x, ui, days) => ({
  '🚐 Camper y carretera': [
    ['docs', 'Documentación, reservas y teléfonos de asistencia (en papel y en el móvil)'],
    ['3pmsf', `4 neumáticos ${ui.term('3PMSF')} revisados (presión en frío)`],
    ['chains', 'Cadenas o fundas de vuestra medida + guantes y esterilla para montarlas'],
    ['shovel', 'Pala de nieve, rascador, escoba de mano'],
    ['cee', `${ui.term('cable CEE', 'Cable CEE')} de 20–25 m + adaptador Schuko + adaptador suizo tipo J`],
    ['ext', `Regleta (sin pasar del ${ui.term('amperaje')} de la parcela)`],
    ['heat', 'Calefacción estacionaria revisada y probada a fondo', x.heater !== 'none'],
    ['gasb', 'Bombona llena (las españolas no se rellenan en Suiza)', x.gas],
    ['co', 'Detector de monóxido (CO) y de gas', x.gas || x.heater === 'gas'],
    ['jump', 'Arrancador de batería o pinzas, fusibles, cinta americana, bridas'],
    ['level', 'Calzos de nivelación'],
    ['hose', 'Manguera corta, embudo y cubo plegable'],
    ['grey', `Anticongelante para el depósito de ${ui.term('grises')} + cubo bajo la salida`, x.minT <= -3],
    ['insul', 'Aislante para depósitos y toma de grises', x.minT <= -5],
    ['coolant', 'Anticongelante del motor y limpiaparabrisas −20 °C, escobillas'],
    ['v16', `${ui.term('V-16', 'Baliza V-16')}, 2 triángulos y ${c.adults} chalecos`],
    ['dehum', 'Absorbe-humedad y microfibras contra la condensación'],
    ['kit', 'Botiquín, mantas, frontal de repuesto'],
  ],
  '⛷️ Montaña y nieve': [
    ['skis', `Esquís, botas, bastones, casco y máscara × ${c.skiers}`, c.interests.ski && c.skiers > 0],
    ['skins', 'Pieles, cuchillas y fijaciones de travesía', c.interests.tour],
    ['dva', `${ui.term('ARVA')}, pala y sonda por persona`, c.interests.tour],
    ['shoes', 'Raquetas (o alquiler en Grindelwald)', c.interests.snowshoe],
    ['spikes', 'Zapatillas de trail + microspikes + polainas', c.interests.trail || c.interests.snowshoe],
    ['poles', 'Bastones con rueda de nieve', c.interests.trail || c.interests.snowshoe],
    ['layers', `Capas por persona: térmica, plumas, membrana (mínimas de ${x.minT} °C)`],
    ['gloves', 'Guantes y manoplas de repuesto secos'],
    ['head', 'Frontales y baterías externas (el frío las agota)'],
    ['sun', 'Crema solar, protector labial y gafas de sol'],
    ['swim', 'Bañador y chanclas para la piscina', c.interests.pool],
    ['thermo', 'Termo y comida para la montaña'],
    ['blanket', 'Manta de supervivencia'],
    ['map', 'Mapas offline descargados (Swisstopo, Wikiloc o Komoot)'],
  ],
  [`🐕 Perros (${c.dogs})`]: c.dogs ? [
    ['pass', `${c.dogs} pasaporte${c.dogs > 1 ? 's' : ''} europeo${c.dogs > 1 ? 's' : ''} y cartilla`],
    ['food', `Pienso: ≈${Math.ceil(c.dogs * c.dogKg * 0.015 * (days + 2))} kg (${days} días + 2 de reserva)`],
    ['bowls', 'Cuencos plegables y agua para el camino'],
    ['harness', `${c.dogs} arneses de coche + ${c.dogs} con luz o reflectante`],
    ['leash', 'Correas cortas y largas, bozal'],
    ['boots', 'Botines o cera para almohadillas'],
    ['coat', 'Abrigo si lo usan', x.minT <= -8],
    ['towel', 'Toallas, manta y camas'],
    ['bags', 'Bolsas, antiparasitario y botiquín canino'],
    ['chip', 'Número de microchip y teléfono del veterinario guardados'],
  ] : [],
  '🍳 Despensa (compra en Francia)': [
    ['pasta', 'Pasta, arroz, legumbre, conservas'],
    ['coffee', 'Café, infusiones, cacao para el termo'],
    ['snacks', 'Frutos secos, barritas, chocolate'],
    ['meat', `Carne: máximo ${c.adults} kg entre todos (${ui.term('aduana suiza', 'aduana')})`],
    ['wine', `Vino o cerveza: máximo ${5 * c.adults} l entre todos`],
    ['xmas', 'Algo especial para los días de fiesta'],
    ['stove', x.cook === 'gas' ? 'Cocina de gas + cartuchos de repuesto' : 'Placa de inducción de baja potencia'],
  ],
});

export default {
  id: 'equipaje', title: 'Equipaje', icon: '🎒',
  bg: [IMG.wengen, IMG.jungfrau],
  render(ctx) {
    const { ui, plan: p } = ctx, c = p.cfg, x = { ...EXTRA_DEF, ...ctx.get('packx', {}) };
    const groups = Object.entries(ITEMS(c, x, ui, p.totalDays)).map(([k, l]) => [k, l.filter(i => i[2] === undefined || i[2]).map(([id, t]) => ({ id, t }))]).filter(([, l]) => l.length);
    return `<p class="kicker">Configurador</p><h1 class="title">Qué llevar <span class="grad-text">en la camper</span></h1>
    <p class="lead">La lista sale de tu viaje: ${c.adults} adultos, ${c.skiers} esquiando, ${c.dogs} perro${c.dogs === 1 ? '' : 's'}, ${p.totalDays} días y lo que queréis hacer (<a href="#/suiza/viaje">cambiar</a>). Ajusta también tu equipamiento:</p>
    <fieldset><div class="form-grid">
      <label class="field">Calefacción<select data-x="heater">${[['diesel', 'Estacionaria diésel'], ['gas', 'De gas'], ['none', 'Solo eléctrica']].map(([k, l]) => `<option value="${k}" ${x.heater === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="field">Cocina<select data-x="cook">${[['gas', 'Gas'], ['ind', 'Inducción']].map(([k, l]) => `<option value="${k}" ${x.cook === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="field">Mínima prevista (°C)<input type="number" data-x="minT" value="${x.minT}"><small id="mint">Cambia ropa, grises y abrigo de los perros</small></label>
      <div style="display:flex;align-items:flex-end"><label class="toggle"><input type="checkbox" data-x="gas" ${x.gas ? 'checked' : ''}>Llevamos gas a bordo</label></div>
    </div></fieldset>
    ${groups.map(([k, l]) => `<h2>${k}</h2>${ui.checklist('pk-' + k.replace(/[^a-z]/gi, '').slice(0, 12), l, ctx)}`).join('')}`;
  },
  async mount(el, ctx) {
    ctx.ui.mountChecklists(el, ctx);
    el.querySelectorAll('[data-x]').forEach(i => i.addEventListener('change', () => {
      const x = { ...EXTRA_DEF, ...ctx.get('packx', {}) }; x[i.dataset.x] = i.type === 'checkbox' ? i.checked : i.type === 'number' ? +i.value : i.value;
      ctx.set('packx', x); ctx.rerender();
    }));
    try {
      const w = await ctx.live.weather(ctx.plan.base.pos[0], ctx.plan.base.pos[1], 800), d = w.daily;
      const m = Math.min(...Object.keys(d).filter(k => k.startsWith('temperature_2m_min_')).flatMap(k => d[k]).filter(v => v != null));
      el.querySelector('#mint').innerHTML = `<span class="live-dot"></span>Previsión próximos días en el camping: mínima ${Math.round(m)} °C`;
    } catch {}
  },
};
