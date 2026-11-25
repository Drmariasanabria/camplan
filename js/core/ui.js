// Componentes reutilizables por cualquier destino.
import { sfx, toast } from './fx.js';

export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const eur = (n, d = 0) => (isFinite(n) ? n : 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: d, minimumFractionDigits: d });
export const chf = (n, d = 0) => 'CHF ' + (isFinite(n) ? n : 0).toLocaleString('es-ES', { maximumFractionDigits: d, minimumFractionDigits: d });
export const hrs = h => `${Math.floor(h)} h ${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
export const link = (href, txt) => `<a href="${href}" target="_blank" rel="noopener">${txt} ↗</a>`;
export const links = arr => `<div class="link-list">${arr.map(([t, h]) => `<a href="${h}" target="_blank" rel="noopener">${t} ↗</a>`).join('')}</div>`;

export const header = (kicker, title, lead) => `<p class="kicker">${kicker}</p><h1 class="title">${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}`;

export function table(cols, rows, opts = {}) {
  return `<div class="table-wrap"><table><thead><tr>${cols.map((c, i) => `<th class="${opts.num?.includes(i) ? 'num' : ''}">${c}</th>`).join('')}</tr></thead>
  <tbody>${rows.map(r => `<tr class="${r._cls || ''}">${(r.cells || r).map((c, i) => `<td class="${opts.num?.includes(i) ? 'num' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export const photoCard = ({ img, tag, tagCls = '', title, text = '', extra = '', href }) =>
  `<${href ? `a href="${href}" target="_blank" rel="noopener"` : 'div'} class="card photo"><div class="ph" style="background-image:url('${img}')"></div>
   <div class="body">${tag ? `<span class="tag ${tagCls}">${tag}</span>` : ''}<h3>${title}</h3>${text ? `<p>${text}</p>` : ''}${extra}</div></${href ? 'a' : 'div'}>`;

/* Checklist persistente. items: [{id, t, link?}] */
export function checklist(id, items, ctx) {
  const st = ctx.get('chk:' + id, {});
  const done = items.filter(i => st[i.id]).length;
  return `<div class="checklist" data-chk="${id}">
    <div class="progress"><i style="width:${items.length ? done / items.length * 100 : 0}%"></i></div>
    ${items.map(i => `<div class="check ${st[i.id] ? 'done' : ''}" data-id="${i.id}" tabindex="0" role="checkbox" aria-checked="${!!st[i.id]}"><span class="box"></span><span class="txt">${i.t}${i.link ? ` <a href="${i.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()">abrir ↗</a>` : ''}</span></div>`).join('')}
  </div>`;
}
export function mountChecklists(el, ctx) {
  el.querySelectorAll('[data-chk]').forEach(box => {
    const id = box.dataset.chk;
    box.addEventListener('click', e => {
      const row = e.target.closest('.check'); if (!row) return;
      const st = ctx.get('chk:' + id, {}); st[row.dataset.id] = !st[row.dataset.id];
      ctx.set('chk:' + id, st);
      row.classList.toggle('done', st[row.dataset.id]); row.setAttribute('aria-checked', !!st[row.dataset.id]);
      st[row.dataset.id] ? sfx.check() : sfx.uncheck();
      const all = box.querySelectorAll('.check').length, n = box.querySelectorAll('.check.done').length;
      box.querySelector('.progress i').style.width = n / all * 100 + '%';
      if (n === all) { sfx.success(); toast('🎉 ¡Lista completa!'); }
    });
  });
}

export function copyButtons(el) {
  el.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById(b.dataset.copy).innerText).then(() => { toast('📋 Copiado'); sfx.success(); });
  }));
}

export function segmented(name, options, value) {
  return `<div class="seg" data-seg="${name}">${options.map(([v, t]) => `<button data-v="${v}" class="${v === value ? 'on' : ''}">${t}</button>`).join('')}</div>`;
}

/* Mapa Leaflet con estilo oscuro */
export function makeMap(el, center, zoom) {
  const m = L.map(el, { scrollWheelZoom: false, zoomControl: true }).setView(center, zoom);
  const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap © CARTO', maxZoom: 19 });
  const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '© OpenTopoMap (CC-BY-SA)', maxZoom: 17 });
  const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri World Imagery', maxZoom: 19 });
  const ski = L.tileLayer('https://tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png', { attribution: 'OpenSnowMap', maxZoom: 18 });
  dark.addTo(m);
  L.control.layers({ 'Oscuro': dark, 'Topográfico': topo, 'Satélite': sat }, { 'Pistas de esquí': ski }).addTo(m);
  return m;
}
/* Carga una capa de OSM con estado y botón de reintento (Overpass a veces se satura) */
export async function osmLayer(statusEl, run) {
  statusEl.innerHTML = '<span class="loader"></span> cargando OpenStreetMap en vivo…';
  try { statusEl.innerHTML = '<span class="live-dot"></span>' + await run(); }
  catch {
    statusEl.innerHTML = 'OpenStreetMap (Overpass) está saturado ahora mismo. <button class="btn sm">↻ Reintentar</button>';
    statusEl.querySelector('button').onclick = () => osmLayer(statusEl, run);
  }
}
export const pin =(emoji, color = '#7c5cff') => L.divIcon({ className: '', iconSize: [38, 38], iconAnchor: [19, 19],
  html: `<div style="width:38px;height:38px;border-radius:50%;background:${color};display:grid;place-items:center;font-size:19px;box-shadow:0 0 0 4px rgba(255,255,255,.15),0 6px 20px ${color}">${emoji}</div>` });

/* ─────────── Términos clicables con ficha emergente ─────────── */
let TERMS = {};
export const setTerms = t => { TERMS = t; };
export const term = (key, label) => `<button type="button" class="term" data-term="${esc(key)}">${label ?? esc(key)}</button>`;
/* Ficha libre (no necesita estar en el diccionario) */
export const info = (label, title, body, linksArr = []) => {
  const id = 'i' + Math.random().toString(36).slice(2, 9);
  TERMS[id] = { t: title, d: body, l: linksArr };
  return `<button type="button" class="term" data-term="${id}">${label}</button>`;
};
function closePop() { document.getElementById('pop')?.remove(); }
document.addEventListener('click', e => {
  const b = e.target.closest('.term');
  if (!b) { if (!e.target.closest('#pop')) closePop(); return; }
  e.preventDefault(); e.stopPropagation(); closePop();
  const it = TERMS[b.dataset.term]; if (!it) return;
  const pop = document.createElement('div'); pop.id = 'pop';
  pop.innerHTML = `<button class="x" aria-label="Cerrar">✕</button><h4>${it.t}</h4><p>${it.d}</p>${it.l?.length ? `<div class="link-list">${it.l.map(([t, h]) => `<a href="${h}" target="_blank" rel="noopener">${t} ↗</a>`).join('')}</div>` : ''}`;
  document.body.appendChild(pop);
  const r = b.getBoundingClientRect(), w = Math.min(440, innerWidth - 24);
  pop.style.width = w + 'px';
  pop.style.left = Math.max(12, Math.min(r.left + scrollX, scrollX + innerWidth - w - 12)) + 'px';
  const below = r.bottom + scrollY + 10, h = pop.offsetHeight;
  pop.style.top = (r.bottom + h + 20 > innerHeight && r.top > h + 20 ? r.top + scrollY - h - 10 : below) + 'px';
  pop.querySelector('.x').onclick = closePop;
});
addEventListener('keydown', e => e.key === 'Escape' && closePop());
addEventListener('hashchange', closePop);

/* ─────────── Formularios ─────────── */
export const num = (id, label, v, { min = 0, max = 999, step = 1, hint = '' } = {}) =>
  `<label class="field">${label}<input type="number" data-cfg="${id}" value="${v}" min="${min}" max="${max}" step="${step}">${hint ? `<small>${hint}</small>` : ''}</label>`;
export const txt = (id, label, v, hint = '') => `<label class="field">${label}<input type="text" data-cfg="${id}" value="${esc(v)}">${hint ? `<small>${hint}</small>` : ''}</label>`;
export const dateIn = (id, label, v, hint = '') => `<label class="field">${label}<input type="date" data-cfg="${id}" value="${v}">${hint ? `<small>${hint}</small>` : ''}</label>`;
export const timeIn = (id, label, v, hint = '') => `<label class="field">${label}<input type="time" data-cfg="${id}" value="${v}">${hint ? `<small>${hint}</small>` : ''}</label>`;
export const sel = (id, label, v, opts, hint = '') => `<label class="field">${label}<select data-cfg="${id}">${opts.map(([k, t]) => `<option value="${k}" ${String(k) === String(v) ? 'selected' : ''}>${t}</option>`).join('')}</select>${hint ? `<small>${hint}</small>` : ''}</label>`;
export const tog = (id, label, v) => `<label class="toggle"><input type="checkbox" data-cfg="${id}" ${v ? 'checked' : ''}>${label}</label>`;
/* Lee/escribe rutas tipo "van.height" */
export const getPath = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
export function setPath(o, p, v) { const ks = p.split('.'); let t = o; ks.slice(0, -1).forEach(k => t = (t[k] ||= {})); t[ks.at(-1)] = v; return o; }

/* Teclado: Enter/Espacio marcan casillas y filas de tareas */
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.check[tabindex], .prep-row[tabindex]')) { e.preventDefault(); e.target.click(); }
});
