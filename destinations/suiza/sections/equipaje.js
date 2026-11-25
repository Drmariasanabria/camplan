import { IMG } from '../data.js';

const DEF = { ski: true, tour: false, trail: true, snowshoe: true, dogs: 2, heater: 'diesel', gas: true, cook: 'gas', minT: -12, route: 'A' };
const OPTS = [
  ['ski', '🎿 Esquí en pista'], ['tour', '⛷️ Esquí de travesía / fuera de pista'], ['trail', '🏃 Trail running'], ['snowshoe', '🥾 Raquetas / hiking invernal'], ['gas', '🔥 Usamos gas a bordo'],
];

// cada item: [id, texto, condición(cfg)]
const ITEMS = {
  '🚐 Camper y carretera': [
    ['docs', 'Documentación, reservas impresas y en el móvil, póliza y asistencia'],
    ['3pmsf', 'Neumáticos 3PMSF revisados (presión en frío)'],
    ['chains', 'Cadenas o fundas compatibles con vuestra medida + guantes y esterilla. Practicad montarlas'],
    ['shovel', 'Pala de nieve, rascador, escoba de mano'],
    ['cee', 'Cable CEE 20–25 m (azul) + adaptador Schuko + adaptador suizo tipo J'],
    ['ext', 'Alargador y regleta (respetad 4–6 A de parcela)'],
    ['heat', 'Calefacción estacionaria revisada y probada a fondo', c => c.heater === 'diesel'],
    ['gasb', 'Bombona llena. Las españolas no se rellenan en Suiza; Campingaz de intercambio en Camping Jungfrau', c => c.gas],
    ['co', 'Detector de CO y de gas', c => c.gas || c.heater !== 'none'],
    ['jump', 'Arrancador de batería / cables, fusibles, cinta americana, bridas'],
    ['level', 'Calzos de nivelación'],
    ['hose', 'Manguera corta, embudo, cubo plegable'],
    ['grey', 'Anticongelante para depósito de grises + cubo bajo la salida', c => c.minT <= -5],
    ['insul', 'Aislar depósitos y toma de grises (se congelan de noche en el valle)', c => c.minT <= -5],
    ['coolant', 'Anticongelante motor y limpiaparabrisas −20 °C, escobillas'],
    ['v16', 'Baliza V-16, triángulos y 2 chalecos'],
    ['dehum', 'Absorbe-humedad / toallas de microfibra para condensación'],
    ['firstaid', 'Botiquín, mantas, linterna frontal de reserva'],
  ],
  '⛷️ Montaña y nieve': [
    ['skis', 'Esquís, botas, bastones, casco, gafas y máscara', c => c.ski],
    ['skins', 'Pieles, cuchillas, fijaciones de travesía', c => c.tour],
    ['dvd', 'ARVA, pala y sonda (y saber usarlos)', c => c.tour || c.snowshoe],
    ['shoes', 'Raquetas (o alquiler en Grindelwald)', c => c.snowshoe],
    ['spikes', 'Zapatillas de trail + microspikes + polainas', c => c.trail || c.snowshoe],
    ['poles', 'Bastones de trekking con rueda de nieve', c => c.trail || c.snowshoe],
    ['layers', 'Capas: térmica, forro/plumas, membrana'],
    ['gloves', 'Guantes y manoplas de repuesto secos'],
    ['head', 'Frontales + pilas, baterías externas (el frío las agota)'],
    ['sun', 'Crema solar, protector labial, gafas de sol'],
    ['thermo', 'Termo y comida de ataque'],
    ['blanket', 'Manta de supervivencia'],
    ['map', 'Mapas offline (Swisstopo / Wikiloc / Komoot) descargados'],
  ],
  '🐕 Perros': [
    ['pass', 'Pasaportes UE y cartilla de cada perro', c => c.dogs > 0],
    ['food', c => `Pienso para ${c.dogs ? 16 : 0} días (14 + 2 de reserva)`, c => c.dogs > 0],
    ['bowls', 'Cuencos plegables y agua para ruta', c => c.dogs > 0],
    ['harness', c => `${c.dogs} arneses de coche + ${c.dogs} arneses con luz/reflectante`, c => c.dogs > 0],
    ['leash', 'Correas cortas y largas, bozal (algunos transportes)', c => c.dogs > 0],
    ['boots', 'Botines o cera para almohadillas', c => c.dogs > 0],
    ['coat', 'Abrigo si lo usan', c => c.dogs > 0 && c.minT <= -8],
    ['towel', 'Toallas, manta y camas', c => c.dogs > 0],
    ['bags', 'Bolsas, antiparasitario, botiquín canino', c => c.dogs > 0],
    ['chip', 'Contactos veterinarios y nº de microchip guardados', c => c.dogs > 0],
  ],
  '🍳 Cocina y despensa (compra en Francia)': [
    ['pasta', 'Pasta, arroz, legumbre, conservas'],
    ['coffee', 'Café, infusiones, cacao para el termo'],
    ['snacks', 'Frutos secos, barritas, chocolate'],
    ['meat', 'Carne: máx. 1 kg por persona (aduana)'],
    ['wine', 'Vino/cerveza: máx. 5 l por persona (aduana)'],
    ['xmas', 'Algo especial para Nochebuena y Navidad'],
    ['stove', c => c.cook === 'gas' ? 'Cocina de gas + cartuchos de repuesto' : 'Placa de inducción baja potencia (ojo amperaje)'],
  ],
};
const PREP = {
  'Del 22 al 30 de noviembre': [
    ['p1', 'Pedir disponibilidad y presupuesto cerrado a Camping Jungfrau (17–27 dic)'],
    ['p2', 'Consultar Gletscherdorf y la excepción de 2 perros en Manor Farm, por escrito'],
    ['p3', 'Revisar pasaportes de ambos perros, microchip y antirrábica'],
    ['p4', 'Revisar cobertura Francia/Suiza: asistencia, rescate, deportes de invierno'],
    ['p5', "Pedir Crit'Air 2 (solo web oficial)", 'https://www.certificat-air.gouv.fr/'],
    ['p6', 'Inspeccionar 3PMSF, cadenas compatibles y altura real de la furgo'],
  ],
  'A partir del 1 de diciembre': [
    ['d1', 'Comprar e-viñeta 2027 · 40 CHF · solo oficial', 'https://via.admin.ch/shop/'],
    ['d2', 'Revisar previsión de apertura del dominio; no comprar pases sin evaluar cancelación'],
    ['d3', 'Probar calefacción, carga 230 V, tomas de agua y vaciado de grises (electroválvula)'],
    ['d4', 'Guardar mapas offline, reservas, documentación y teléfonos de emergencia'],
  ],
  '48 h antes y mañana de salida': [
    ['h1', 'Consultar MeteoSwiss, SLF, carreteras francesas y acceso a Lauterbrunnen', '#/suiza/meteo'],
    ['h2', 'Confirmar plaza en Ussel/alternativa y horario de recepción en Suiza'],
    ['h3', 'Repostar en España; agua y comida para una etapa extra'],
    ['h4', 'Batería de arranque, refrigerante, líquido −20 °C y presión de neumáticos'],
  ],
};

const build = (c) => Object.entries(ITEMS).map(([cat, list]) => [cat, list.filter(([, , cond]) => !cond || cond(c)).map(([id, t]) => ({ id, t: typeof t === 'function' ? t(c) : t }))]);

export default {
  id: 'equipaje', title: 'Equipaje y preparación', icon: '🎒',
  bg: [IMG.wengen, IMG.jungfrau],
  render: (ctx) => {
    const { ui, get } = ctx, c = { ...DEF, ...get('packcfg', {}) };
    return `${ui.header('Configurador', 'Qué llevar <span class="grad-text">en tu camper</span>', 'Dime qué vais a hacer y la lista se adapta. Cada marca se guarda; si inicias sesión, la ves también en el móvil.')}
    <div class="card no-tilt"><span class="tag">Configuración</span>
      <div class="btn-row">${OPTS.map(([k, l]) => `<button class="btn sm ${c[k] ? 'primary' : ''}" data-opt="${k}">${l}</button>`).join('')}</div>
      <div class="grid g4">
        <label class="field">Perros<input type="number" min="0" max="4" id="cfg-dogs" value="${c.dogs}"></label>
        <label class="field">Calefacción<select id="cfg-heater"><option value="diesel" ${c.heater === 'diesel' ? 'selected' : ''}>Estacionaria diésel</option><option value="gas" ${c.heater === 'gas' ? 'selected' : ''}>Gas (Truma…)</option><option value="none" ${c.heater === 'none' ? 'selected' : ''}>Solo eléctrica</option></select></label>
        <label class="field">Cocina<select id="cfg-cook"><option value="gas" ${c.cook === 'gas' ? 'selected' : ''}>Gas</option><option value="ind" ${c.cook === 'ind' ? 'selected' : ''}>Inducción</option></select></label>
        <label class="field">Mínima prevista<input type="number" id="cfg-minT" value="${c.minT}"><small id="cfg-minT-live">°C</small></label>
      </div></div>
    <div id="pack">${build(c).map(([cat, items]) => `<h2>${cat}</h2>${ui.checklist('pack-' + cat.slice(0, 6), items, ctx)}`).join('')}</div>

    <h2>Calendario <span class="grad-text">de preparación</span></h2>
    ${Object.entries(PREP).map(([t, list], i) => `<h3 style="margin-top:28px">${t}</h3>${ui.checklist('prep' + i, list.map(([id, t, link]) => ({ id, t, link })), ctx)}`).join('')}`;
  },
  async mount(el, ctx) {
    const { ui, live, get, set } = ctx;
    ui.mountChecklists(el, ctx);
    const c = { ...DEF, ...get('packcfg', {}) };
    const save = () => { set('packcfg', c); const pack = el.querySelector('#pack'); pack.innerHTML = build(c).map(([cat, items]) => `<h2 class="reveal in">${cat}</h2>${ui.checklist('pack-' + cat.slice(0, 6), items, ctx)}`).join(''); ui.mountChecklists(pack, ctx); };
    el.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => { c[b.dataset.opt] = !c[b.dataset.opt]; b.classList.toggle('primary', c[b.dataset.opt]); save(); }));
    ['dogs', 'heater', 'cook', 'minT'].forEach(k => el.querySelector('#cfg-' + k).addEventListener('change', e => { c[k] = e.target.type === 'number' ? +e.target.value : e.target.value; save(); }));
    try {
      const w = await live.weather(46.5935, 7.9091, 800), d = w.daily;
      const mins = Object.keys(d).filter(k => k.startsWith('temperature_2m_min_')).flatMap(k => d[k]).filter(v => v != null);
      const m = Math.min(...mins);
      el.querySelector('#cfg-minT-live').innerHTML = `<span class="live-dot"></span>Mínima prevista en Lauterbrunnen 10 días: <b>${m.toFixed(0)} °C</b> · histórico −10/−15`;
    } catch {}
  },
};
