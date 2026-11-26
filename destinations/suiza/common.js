// Utilidades compartidas por las secciones de Suiza.
import { getCfg, fmtDate } from './engine.js';

/* Enlaza todos los [data-cfg] de un contenedor con la configuración guardada */
export function bindCfg(el, ctx, after) {
  el.querySelectorAll('[data-cfg]').forEach(inp => {
    const ev = inp.type === 'checkbox' || inp.tagName === 'SELECT' || inp.type === 'date' || inp.type === 'time' ? 'change' : 'change';
    inp.addEventListener(ev, () => {
      const cfg = getCfg(ctx), path = inp.dataset.cfg;
      let v = inp.type === 'checkbox' ? inp.checked : inp.type === 'number' ? +inp.value : inp.value;
      if (inp.dataset.num !== undefined) v = +v;
      ctx.ui.setPath(cfg, path, v);
      ctx.set('cfg', cfg); after?.(path, v); ctx.toast('Viaje recalculado'); ctx.rerender();
    });
  });
}

/* Barra fija con el resumen del viaje en todas las secciones */
export function bar(ctx, sec) {
  const p = ctx.plan; if (!p) return '';
  return `<div class="tripbar">
    <span>📅 <b>${fmtDate(p.cfg.depart)} → ${fmtDate(p.cfg.homeBy)}</b></span><span class="sep"></span>
    <span>🏔️ <b>${p.nights}</b> noches · ${p.stays.map(st => st.base.short || st.base.town.split(' (')[0]).join(' → ')}</span><span class="sep"></span>
    <span>🚐 <b>${Math.round(p.budget.km).toLocaleString('es-ES')}</b> km</span><span class="sep"></span>
    <span>💶 <b>${ctx.ui.eur(p.budget.total)}</b></span>
    ${p.warn.length ? `<span class="badge ${p.warn.some(w => w.lvl === 'bad') ? 'bad' : 'warn'}">⚠ ${p.warn.length} aviso${p.warn.length > 1 ? 's' : ''}</span>` : ''}
    ${sec.id !== 'viaje' ? '<a class="btn sm" href="#/suiza/viaje">⚙️ Cambiar viaje</a>' : ''}
  </div>`;
}

export const warnList = p => p.warn.length ? `<div class="warn-list">${p.warn.map(w => `<div class="warn-item ${w.lvl}">${w.lvl === 'bad' ? '⛔' : '⚠️'} ${w.t}</div>`).join('')}</div>` : '';
