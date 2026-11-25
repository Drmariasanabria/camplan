import { IMG, STRATEGIES, BASES, DEFAULT_CFG } from '../data.js';
import { fmtDate, fmtLong, hhmm, nightPrice, diffDays } from '../engine.js';
import { bindCfg, warnList } from '../common.js';

export default {
  id: 'viaje', title: 'Mi viaje', icon: '⚙️',
  bg: [IMG.grindelwald, IMG.eiger, IMG.kleine],
  render(ctx) {
    const { ui, plan: p } = ctx, c = p.cfg, t = ui.term;
    const driveOut = p.travelOut.reduce((a, d) => a + d.totalH, 0), driveRet = p.travelRet.reduce((a, d) => a + d.totalH, 0);
    const seg = (n, cls, label) => n > 0 ? `<div style="flex:${n};padding:12px 10px;border-radius:12px;background:${cls};font-weight:700;font-size:14px;text-align:center;min-width:60px">${label}</div>` : '';
    return `
    <p class="kicker">Torrelavega → Grindelwald · camper</p>
    <h1 class="title">Configura <span class="grad-text">tu viaje</span></h1>
    <p class="lead">Cambia cualquier dato y todo se recalcula: etapas, paradas, días en Suiza, plan de cada día, plazos de los trámites, tiempo previsto, presupuesto y equipaje.</p>

    <div class="grid g4">
      <div class="stat"><div class="l">Salida</div><div class="v">${fmtDate(c.depart)}</div><div class="l">${c.departTime} desde ${ui.esc(c.origin.name)}</div></div>
      <div class="stat"><div class="l">Llegada al camping</div><div class="v">${fmtDate(p.arrive)}</div><div class="l">≈${hhmm(p.travelOut.at(-1)?.arrival || 0)} · ${p.travelOut.length} día${p.travelOut.length > 1 ? 's' : ''} de carretera</div></div>
      <div class="stat"><div class="l">En Suiza</div><div class="v">${p.nights} noches</div><div class="l">${ui.esc(p.base.name)}</div></div>
      <div class="stat"><div class="l">Salida de Suiza</div><div class="v">${fmtDate(p.leave)}</div><div class="l">En casa el ${fmtDate(p.homeArrive)}${c.bufferDay ? ` · colchón el ${fmtDate(c.homeBy)}` : ''}</div></div>
      <div class="stat"><div class="l">Kilómetros</div><div class="v">${Math.round(p.budget.km).toLocaleString('es-ES')}</div><div class="l">${p.approx ? 'estimados (cargando rutas reales)' : 'calculados sobre la ruta real'}</div></div>
      <div class="stat"><div class="l">Horas al volante</div><div class="v">${Math.round(driveOut + driveRet)} h</div><div class="l">ida ${driveOut.toFixed(1)} h · vuelta ${driveRet.toFixed(1)} h (con pausas)</div></div>
      <div class="stat"><div class="l">Presupuesto</div><div class="v grad-text">${ui.eur(p.budget.total)}</div><div class="l">${ui.eur(p.budget.total / Math.max(1, c.adults))} por persona · <a href="#/suiza/presupuesto">desglose</a></div></div>
      <div class="stat"><div class="l">Cambio hoy</div><div class="v">${p.fx.toFixed(3)}</div><div class="l">CHF por 1 € (Banco Central Europeo)</div></div>
    </div>

    <div style="display:flex;gap:6px;margin:22px 0 8px">
      ${seg(p.travelOut.length, 'rgba(94,231,255,.25)', `🚐 Ida · ${p.travelOut.length} d`)}
      ${seg(p.nights - 1, 'rgba(62,230,161,.22)', `🏔️ Suiza · ${p.nights} noches`)}
      ${seg(p.travelRet.length, 'rgba(255,94,168,.22)', `🚐 Vuelta · ${p.travelRet.length} d`)}
      ${seg(c.bufferDay ? 1 : 0, 'rgba(255,255,255,.08)', 'Colchón')}
    </div>
    <p class="small muted" style="margin-bottom:26px">Del ${fmtLong(c.depart)} al ${fmtLong(c.homeBy)} · ${p.totalDays} días · <a href="#/suiza/itinerario">ver el plan de cada día →</a></p>
    ${warnList(p)}

    <form onsubmit="return false">
    <fieldset><legend>📅 Fechas y ritmo</legend><div class="form-grid">
      ${ui.dateIn('depart', 'Día de salida', c.depart)}
      ${ui.timeIn('departTime', 'Hora de salida', c.departTime, 'Afecta a la hora de llegada de cada etapa')}
      ${ui.dateIn('homeBy', 'Tenemos que estar en casa como tarde', c.homeBy)}
      ${ui.num('maxHours', 'Máximo de horas al volante por día', c.maxHours, { min: 3, max: 14, step: 0.5, hint: 'Incluye pausas para los perros. Con menos horas salen más etapas y más paradas.' })}
    </div><div class="btn-row">${ui.tog('bufferDay', 'Guardar un día colchón al final (nevadas, cortes, cansancio)', c.bufferDay)}</div></fieldset>

    <fieldset><legend>📍 Desde dónde salís</legend><div class="form-grid">
      <label class="field">Origen<input type="text" id="origin-q" value="${ui.esc(c.origin.name)}"><small>Escribe una ciudad y pulsa Buscar</small></label>
      <div style="display:flex;align-items:flex-end"><button class="btn" id="origin-go" type="button">🔎 Buscar</button></div>
    </div><div id="origin-res" class="link-list" style="margin-top:12px"></div></fieldset>

    <fieldset><legend>👥 Quién viaja</legend><div class="form-grid">
      ${ui.num('adults', 'Adultos', c.adults, { min: 1, max: 6 })}
      ${ui.num('skiers', 'De ellos, esquían', c.skiers, { min: 0, max: c.adults, hint: 'Cambia forfaits, cuidador y plan de los días de esquí' })}
      ${ui.num('dogs', 'Perros', c.dogs, { min: 0, max: 5, hint: 'Cambia campings válidos, precio, equipaje y transporte' })}
      ${ui.txt('dogNames', 'Nombres de los perros', c.dogNames)}
      ${ui.num('dogKg', 'Peso aproximado por perro (kg)', c.dogKg, { min: 1, max: 80 })}
    </div></fieldset>

    <fieldset><legend>🚐 Vuestra camper</legend><div class="form-grid">
      ${ui.txt('van.name', 'Modelo', c.van.name)}
      <label class="field">Altura total con todo montado (m)<input type="number" data-cfg="van.height" value="${c.van.height}" step="0.01" min="1.5" max="4"><small>≤ 2,00 m = ${t('clase de peaje', 'clase 1')} · ahora: <b>clase ${c.van.height > 2 ? 2 : 1}</b></small></label>
      ${ui.num('van.length', 'Longitud (m)', c.van.length, { min: 3, max: 10, step: 0.01, hint: 'Se usa en los correos al camping' })}
      ${ui.num('van.cons', 'Consumo real (l/100 km)', c.van.cons, { min: 4, max: 20, step: 0.1, hint: 'Cargada y en invierno suele subir 1 l' })}
      ${ui.num('van.tank', 'Depósito (l)', c.van.tank, { min: 30, max: 200 })}
      ${ui.sel('van.fuel', 'Combustible', c.van.fuel, [['diesel', 'Diésel'], ['gasolina', 'Gasolina']])}
    </div></fieldset>

    <fieldset><legend>🛣️ Ruta</legend>
      <div class="grid g3" style="margin-bottom:18px">${Object.entries(STRATEGIES).map(([k, s]) => `<div class="card no-tilt" style="padding:18px"><span class="tag" style="color:${s.color}">${s.name}</span><p class="small">${s.what.replace('RCEA', t('RCEA')).replace('A79', t('A79'))}</p><p class="small" style="color:var(--ok)">✓ ${s.pros.join(' · ')}</p><p class="small" style="color:var(--warn)">✗ ${s.cons.join(' · ')}</p></div>`).join('')}</div>
      <div class="form-grid">
      ${ui.sel('outStrategy', 'Ruta de ida', c.outStrategy, Object.entries(STRATEGIES).map(([k, s]) => [k, s.name]))}
      ${ui.sel('retStrategy', 'Ruta de vuelta', c.retStrategy, Object.entries(STRATEGIES).map(([k, s]) => [k, s.name]), 'Ida tranquila por la mixta y vuelta por autopista es buen equilibrio')}
      </div><p class="small muted" style="margin-top:12px">Las paradas de cada noche se eligen solas según tus horas máximas. Puedes fijarlas a mano en <a href="#/suiza/ruta">Ruta</a>.</p></fieldset>

    <fieldset><legend>🏕️ Dónde dormir en Suiza</legend><div class="form-grid">
      ${ui.sel('base', 'Camping base', c.base, BASES.map(b => [b.id, `${b.name} (${b.town}) · ≈${nightPrice({ ...c, nightPriceOverride: 0 }, b).toFixed(0)} CHF/noche`]))}
      ${ui.num('nightPriceOverride', 'Precio real por noche (CHF)', c.nightPriceOverride, { min: 0, max: 400, hint: 'Cuando el camping te conteste, ponlo aquí. 0 = usar la estimación.' })}
    </div><p class="small muted" style="margin-top:12px">Comparativa completa y correos para reservar en <a href="#/suiza/dormir">Dónde dormir</a>.</p></fieldset>

    <fieldset><legend>🎿 Qué queréis hacer</legend>
      <div class="btn-row">${[['ski', 'Esquí en pista'], ['tour', 'Esquí de travesía / fuera de pista'], ['trail', 'Trail running'], ['snowshoe', 'Raquetas y senderismo invernal'], ['sled', 'Trineo'], ['pool', 'Piscina y pueblo los días malos']].map(([k, l]) => ui.tog('interests.' + k, l, c.interests[k])).join('')}</div>
      <div class="form-grid">
      ${ui.num('skiDays', 'Días de esquí (por esquiador)', c.skiDays, { min: 0, max: 12, hint: 'Se reparten solos en días con remontes abiertos' })}
      ${ui.num('halfDays', 'Medios días de esquí extra', c.halfDays, { min: 0, max: 6 })}
      ${ui.num('winterPassDays', 'Días de pase invernal (días × personas)', c.winterPassDays, { min: 0, max: 30, hint: '61 CHF por persona y día. Para quien no esquía.' })}
      ${ui.num('sledRides', 'Bajadas en trineo (billetes)', c.sledRides, { min: 0, max: 10 })}
      ${ui.num('sitterHours', 'Horas de cuidador de perros', c.sitterHours, { min: 0, max: 80, hint: 'Si esquiáis los dos a la vez' })}
    </div></fieldset>

    <fieldset><legend>💶 Gastos del día a día</legend><div class="form-grid">
      ${ui.num('foodPerDay', 'Comida y compra (€/día, todo el grupo)', c.foodPerDay, { min: 5, max: 200 })}
      ${ui.num('eatOutMeals', 'Comidas en restaurante (total)', c.eatOutMeals, { min: 0, max: 40, hint: '≈30 CHF por persona y comida en montaña' })}
      ${ui.num('localKm', 'Km con la furgo dentro de Suiza', c.localKm, { min: 0, max: 2000, step: 10 })}
      ${ui.num('laundryLoads', 'Coladas', c.laundryLoads, { min: 0, max: 10 })}
      ${ui.num('insurance', 'Seguro de montaña a contratar (€)', c.insurance, { min: 0, max: 1000, step: 5, hint: '0 si ya lo tenéis' })}
      ${ui.num('contingencyPct', 'Margen para imprevistos (%)', c.contingencyPct, { min: 0, max: 40 })}
      ${ui.num('fuelES', 'Precio combustible España (€/l)', c.fuelES, { min: 0, max: 3, step: 0.001, hint: `0 = precio de hoy (${p.budget.fuelPrices.pES.toFixed(3)} €)` })}
      ${ui.num('fuelFR', 'Precio combustible Francia (€/l)', c.fuelFR, { min: 0, max: 3, step: 0.001, hint: `0 = precio de hoy (${p.budget.fuelPrices.pFR.toFixed(3)} €)` })}
    </div></fieldset>
    </form>
    <div class="btn-row"><button class="btn" id="reset">↺ Volver a los valores iniciales</button></div>`;
  },
  mount(el, ctx) {
    bindCfg(el, ctx);
    const res = el.querySelector('#origin-res');
    const go = async () => {
      const q = el.querySelector('#origin-q').value.trim(); if (!q) return;
      res.innerHTML = '<span class="loader"></span>';
      try {
        const list = await ctx.live.geocode(q);
        res.innerHTML = list.map((r, i) => `<a href="#" data-i="${i}">${ctx.ui.esc(r.name)}</a>`).join('') || 'Sin resultados';
        res.querySelectorAll('a').forEach(a => a.onclick = e => { e.preventDefault(); const r = list[+a.dataset.i];
          const cfg = ctx.get('cfg', {}); cfg.origin = { name: r.name.split(',')[0], pos: r.pos }; ctx.set('cfg', cfg); ctx.rerender(); });
      } catch { res.textContent = 'No se pudo buscar ahora.'; }
    };
    el.querySelector('#origin-go').onclick = go;
    el.querySelector('#origin-q').addEventListener('keydown', e => e.key === 'Enter' && go());
    el.querySelector('#reset').onclick = () => { if (confirm('¿Volver a la configuración inicial? Tus marcas de listas no se borran.')) { ctx.set('cfg', {}); ctx.set('dayplan', {}); ctx.rerender(); } };
  },
};
