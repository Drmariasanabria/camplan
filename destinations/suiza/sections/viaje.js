import { IMG, STRATEGIES, BASES, REGIONS } from '../data.js';
import { fmtDate, fmtLong, hhmm, nightPrice, diffDays, getCfg, staysOf, actById, money, curOf, countryOf } from '../engine.js';
import { bindCfg, warnList } from '../common.js';
import { openRoadbook } from '../roadbook.js';

/* Panel «Ahora»: antes del viaje, tareas urgentes; durante, el plan de hoy */
function nowPanel(ctx) {
  const { ui, plan: p } = ctx, c = p.cfg, today = new Date().toISOString().slice(0, 10), done = ctx.get('prep', {});
  const ACT = id => actById(id);
  if (today >= c.depart && today <= c.homeBy) {
    const d = p.days.find(x => x.date === today), nx = p.days.find(x => x.date > today);
    const what = d => d.travel ? `🚐 ${ui.esc(d.travel.from)} → ${ui.esc(d.travel.to)} · ${Math.round(d.travel.km)} km` : d.kind === 'buffer' ? 'Día colchón' : (ACT(d.act)?.name || 'Día libre');
    return `<div class="callout ok"><p class="kicker" style="margin:0 0 6px">Hoy · ${fmtLong(today)}</p><h3 style="font-size:26px">${what(d)}</h3>
      ${nx ? `<p>Mañana: ${what(nx)}</p>` : ''}<div class="btn-row"><a class="btn primary sm" href="#/suiza/plan">Ver el día completo</a><a class="btn sm" href="#/suiza/tiempo">Tiempo y aludes</a><a class="btn sm" href="#/suiza/emergencias">Emergencias</a></div></div>`;
  }
  if (today > c.homeBy) return '';
  const days = diffDays(today, c.depart);
  const pend = p.prep.filter(x => !done[x.id]).slice(0, 4);
  const camp = ctx.get('campStatus', {})[p.base.id] || 'Sin contactar';
  return `<div class="grid g3" style="margin-bottom:26px">
    <div class="stat" style="background:linear-gradient(120deg,rgba(124,92,255,.25),rgba(94,231,255,.08))"><div class="l">Faltan</div><div class="v grad-text" style="font-size:54px">${days} días</div><div class="l">para salir de ${ui.esc(c.origin.name)}</div></div>
    <div class="stat"><div class="l">Lo próximo por hacer</div>${pend.map(x => { const dd = diffDays(today, x.due); return `<div style="margin-top:8px;font-size:15px"><span class="badge ${dd < 0 ? 'bad' : dd <= 3 ? 'warn' : ''}">${dd < 0 ? 'Atrasado' : dd === 0 ? 'Hoy' : fmtDate(x.due)}</span> ${x.t}</div>`; }).join('') || '<div class="v">Todo hecho ✅</div>'}
      <a class="btn sm" style="margin-top:12px" href="#/suiza/preparar">Ver todas</a></div>
    <div class="stat"><div class="l">Reserva del camping</div><div class="v" style="font-size:24px">${ui.esc(camp)}</div><div class="l">${ui.esc(p.base.name)}</div><a class="btn sm" style="margin-top:12px" href="#/suiza/plan">Correo y estado</a></div>
  </div>`;
}

export default {
  id: 'viaje', title: 'Mi viaje', icon: '⚙️',
  bg: [IMG.grindelwald, IMG.eiger, IMG.kleine],
  render(ctx) {
    const { ui, plan: p } = ctx, c = p.cfg, t = ui.term;
    const driveOut = p.travelOut.reduce((a, d) => a + d.totalH, 0), driveRet = p.travelRet.reduce((a, d) => a + d.totalH, 0);
    const seg = (n, cls, label) => n > 0 ? `<div style="flex:${n};padding:12px 10px;border-radius:12px;background:${cls};font-weight:700;font-size:14px;text-align:center;min-width:60px">${label}</div>` : '';
    return `
    <p class="kicker">${ui.esc(c.origin.name)} → ${p.stays.map(st => ui.esc(st.base.short || st.base.town)).join(' → ')} · camper</p>
    <h1 class="title">Configura <span class="grad-text">tu viaje</span></h1>
    <p class="lead">Cambia cualquier dato y todo se recalcula: etapas, paradas, noches en cada zona, plan de cada día, plazos de los trámites, tiempo previsto, presupuesto y equipaje.</p>
    ${nowPanel(ctx)}

    <div class="grid g4">
      <div class="stat"><div class="l">Salida</div><div class="v">${fmtDate(c.depart)}</div><div class="l">${c.departTime} desde ${ui.esc(c.origin.name)}</div></div>
      <div class="stat"><div class="l">Llegada al camping</div><div class="v">${fmtDate(p.arrive)}</div><div class="l">≈${hhmm(p.travelOut.at(-1)?.arrival || 0)} · ${p.travelOut.length} día${p.travelOut.length > 1 ? 's' : ''} de carretera</div></div>
      <div class="stat"><div class="l">En destino</div><div class="v">${p.nights} noches</div><div class="l">${p.stays.map(st => `${ui.esc(st.base.short || st.base.town)} ${st.nights} n`).join(' → ')}</div></div>
      <div class="stat"><div class="l">Empezáis la vuelta</div><div class="v">${fmtDate(p.leave)}</div><div class="l">En casa el ${fmtDate(p.homeArrive)}${c.bufferDay ? ` · colchón el ${fmtDate(c.homeBy)}` : ''}</div></div>
      <div class="stat"><div class="l">Kilómetros</div><div class="v">${Math.round(p.budget.km).toLocaleString('es-ES')}</div><div class="l">${p.approx ? 'estimados (cargando rutas reales)' : 'calculados sobre la ruta real'}</div></div>
      <div class="stat"><div class="l">Horas al volante</div><div class="v">${Math.round(driveOut + driveRet)} h</div><div class="l">ida ${driveOut.toFixed(1)} h · vuelta ${driveRet.toFixed(1)} h (con pausas)</div></div>
      <div class="stat"><div class="l">Presupuesto</div><div class="v grad-text">${ui.eur(p.budget.total)}</div><div class="l">${ui.eur(p.budget.total / Math.max(1, c.adults))} por persona · <a href="#/suiza/presupuesto">desglose</a></div></div>
      <div class="stat"><div class="l">Cambio hoy</div><div class="v">${p.fx.toFixed(3)}</div><div class="l">CHF por 1 € (Banco Central Europeo)</div></div>
    </div>

    <div style="display:flex;gap:6px;margin:22px 0 8px">
      ${seg(p.travelOut.length, 'rgba(94,231,255,.25)', `🚐 Ida · ${p.travelOut.length} d`)}
      ${p.stays.map((st, i) => seg(Math.max(1, st.nights), ['rgba(62,230,161,.22)', 'rgba(124,92,255,.25)', 'rgba(255,198,92,.22)', 'rgba(94,231,255,.2)'][i % 4], `${{ FR: '🇫🇷', CH: '🇨🇭', IT: '🇮🇹' }[st.country] || '🏔️'} ${st.base.short || st.base.town} · ${st.nights} n`)).join('')}
      ${seg(p.travelRet.length, 'rgba(255,94,168,.22)', `🚐 Vuelta · ${p.travelRet.length} d`)}
      ${seg(c.bufferDay ? 1 : 0, 'rgba(255,255,255,.08)', 'Colchón')}
    </div>
    <p class="small muted" style="margin-bottom:14px">Del ${fmtLong(c.depart)} al ${fmtLong(c.homeBy)} · ${p.totalDays} días · <a href="#/suiza/plan">ver el plan de cada día →</a></p>
    <div class="btn-row" style="margin-top:0"><button class="btn primary" id="rb">📄 Descargar el plan en PDF</button><a class="btn" href="#/suiza/plan">🗓️ Plan día a día</a><a class="btn" href="#/suiza/preparar">✅ Antes de salir</a></div>
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
      ${ui.sel('outStrategy', 'Ruta de ida', c.outStrategy, Object.entries(STRATEGIES).filter(([, s]) => !s.onlyRet).map(([k, s]) => [k, s.name]))}
      ${ui.sel('retStrategy', 'Ruta de vuelta', c.retStrategy, Object.entries(STRATEGIES).map(([k, s]) => [k, s.name]), countryOf(p.endBase) === 'IT' ? 'Saliendo de Italia: por Montgenèvre (sin túneles) o por el túnel del Mont Blanc' : 'Ida tranquila por la mixta y vuelta por autopista es buen equilibrio')}
      </div><div class="btn-row">${ui.tog('vignette', 'Comprar viñeta suiza (40 CHF) para usar autopistas en Suiza', c.vignette !== false)}</div>
      <p class="small muted">${c.vignette !== false ? 'Con viñeta podéis usar autopistas suizas.' : `Sin viñeta: por Suiza solo carreteras cantonales; entre el Valais e Interlaken, el ${t('Lötschberg', 'tren del Lötschberg')}. Ojo: la autopista Martigny–Sion sí la exige.`}</p>
      <p class="small muted" style="margin-top:12px">Las paradas de cada noche se eligen solas según tus horas máximas. Puedes fijarlas a mano en <a href="#/suiza/plan">Ruta</a>.</p></fieldset>

    <fieldset><legend>🏕️ Dónde dormís en Suiza</legend>
      <p class="small muted" style="margin-top:0">Divide la estancia en tantas paradas como queráis. La última se queda con las noches que sobren. Entre una y otra se añade un día de traslado.</p>
      ${p.stays.map((st, i) => `<div class="form-grid" style="align-items:end;padding:14px 0;border-top:${i ? '1px solid var(--line)' : '0'}">
        <label class="field">Estancia ${i + 1} · ${fmtDate(st.checkin)} → ${fmtDate(st.checkout)}<select data-stay="${i}" data-k="base">
          ${[['FR', '🇫🇷 Francia · campings comprobados'], ['CH', '🇨🇭 Suiza · campings comprobados'], ['IT', '🇮🇹 Italia · áreas comprobadas']].map(([cc, lab]) => `<optgroup label="${lab}">${BASES.filter(b => countryOf(b) === cc).map(b => `<option value="${b.id}" ${b.id === st.base.id ? 'selected' : ''}>${b.name} (${b.town}) · ≈${money(nightPrice(c, b), curOf(b))}/noche</option>`).join('')}</optgroup>`).join('')}
          <optgroup label="Otras zonas de montaña (camping por elegir)">${REGIONS.filter(r => !r.detailed).map(r => `<option value="zone:${r.id}" ${st.base.key === 'zone:' + r.id ? 'selected' : ''}>${r.name} · ${r.canton}</option>`).join('')}</optgroup>
          ${st.base.key === 'place' ? `<option value="place" selected>📍 ${ui.esc(st.base.name)}</option>` : ''}
        </select>${st.base.generic ? `<small>${st.base.verdict === 'Elige un camping' ? '⚠ Elige el camping concreto en «Dónde dormir»' : '📍 ' + ui.esc(st.base.name)}${st.base.cons[0] ? ` · 🚗 ${st.base.cons[0]}` : ''}</small>` : ''}</label>
        <label class="field">Noches${i === p.stays.length - 1 ? ' (las que quedan)' : ''}<input type="number" min="1" max="30" data-stay="${i}" data-k="nights" value="${st.nights}" ${i === p.stays.length - 1 ? 'disabled' : ''}></label>
        <label class="field">Precio real por noche (${st.cur === 'EUR' ? '€' : 'CHF'})<input type="number" min="0" max="400" data-stay="${i}" data-k="price" value="${st.price}"><small>0 = estimado (${money(st.np, st.cur)})</small></label>
        <div>${p.stays.length > 1 ? `<button type="button" class="btn sm" data-stay-del="${i}">✕ Quitar</button>` : ''}${st.transfer ? `<p class="small muted" style="margin:6px 0 0">🚐 Traslado desde ${st.transfer.from.town}: ${Math.round(st.transfer.km)} km${st.transfer.crossings.length ? ' · ' + st.transfer.crossings.map(x => x.name.split(' (')[0] + ' ' + x.label).join(' + ') : ''}</p>` : ''}</div>
      </div>`).join('')}
      <div class="form-grid" style="margin-top:10px"><label class="field">¿Otro lugar que no está en la lista?<input type="text" id="place-q" placeholder="Pueblo o valle de Suiza, p. ej. Arolla"></label><div style="display:flex;align-items:flex-end"><button type="button" class="btn" id="place-go">🔎 Buscar y añadir</button></div></div>
      <div id="place-res" class="link-list" style="margin-top:10px"></div>
      <div class="btn-row"><button type="button" class="btn" id="stay-add">＋ Añadir otra estancia</button><a class="btn" href="#/suiza/plan">Comparar campings y correos</a></div></fieldset>

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
    el.querySelector('#rb').onclick = () => openRoadbook(ctx.plan, ctx);
    const saveStays = fn => { const cfg = getCfg(ctx); const st = staysOf(cfg); fn(st); cfg.stays = st; delete cfg.base; delete cfg.nightPriceOverride; ctx.set('cfg', cfg); ctx.toast('Viaje recalculado'); ctx.rerender(); };
    el.querySelectorAll('[data-stay]').forEach(i => i.addEventListener('change', () => saveStays(st => { const x = st[+i.dataset.stay];
      if (i.dataset.k === 'base') { if (i.value !== 'place') { x.base = i.value; x.place = null; x.price = 0; } } else x[i.dataset.k] = +i.value; })));
    const pres = el.querySelector('#place-res'), pgo = async () => {
      const q = el.querySelector('#place-q').value.trim(); if (!q) return; pres.innerHTML = '<span class="loader"></span>';
      try {
        const list = (await ctx.live.geocode(q + ' Switzerland')).filter(r => r.pos[0] > 45.8 && r.pos[0] < 47.9 && r.pos[1] > 5.9 && r.pos[1] < 10.6);
        pres.innerHTML = list.map((r, k) => `<a href="#" data-k="${k}">${ctx.ui.esc(r.name)}</a>`).join('') || 'No encuentro ese lugar en Suiza.';
        pres.querySelectorAll('a').forEach(a => a.onclick = e => { e.preventDefault(); const r = list[+a.dataset.k];
          saveStays(st => { const l = st.at(-1); if (l) l.nights = Math.max(1, Math.floor((ctx.plan.stays.at(-1).nights || 2) / 2)); st.push({ base: 'place', nights: 0, price: 0, place: { name: r.name.split(',')[0], pos: r.pos } }); }); });
      } catch { pres.textContent = 'No se pudo buscar ahora.'; }
    };
    el.querySelector('#place-go').onclick = pgo; el.querySelector('#place-q').addEventListener('keydown', e => e.key === 'Enter' && (e.preventDefault(), pgo()));
    el.querySelectorAll('[data-stay-del]').forEach(b => b.onclick = () => saveStays(st => st.splice(+b.dataset.stayDel, 1)));
    el.querySelector('#stay-add').onclick = () => saveStays(st => { const l = st.at(-1); if (l) l.nights = Math.max(1, Math.floor((ctx.plan.stays.at(-1).nights || 2) / 2)); st.push({ base: 'gletscherdorf', nights: 0, price: 0 }); });
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
