// Genera un roadbook imprimible (o «Guardar como PDF») a partir del plan calculado.
import { ACTIVITIES, CONTACTS, STRATEGIES } from './data.js';
import { fmtLong, fmtDate, hhmm } from './engine.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const eur = n => (n || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export function openRoadbook(p, ctx) {
  const c = p.cfg, done = ctx.get('prep', {}), notes = ctx.get('notes', '');
  const A = id => ACTIVITIES.find(a => a.id === id);
  const day = d => {
    if (d.travel) { const t = d.travel; return `<tr><td><b>${fmtDate(d.date)}</b></td><td>🚐 ${esc(t.from)} → ${esc(t.to)}<br><small>${Math.round(t.km)} km · ${t.totalH.toFixed(1)} h · salida ${c.departTime} · llegada ≈${hhmm(t.arrival)}${t.stop ? ` · ${esc(t.stop.addr)}` : ''}</small></td></tr>`; }
    if (d.kind === 'buffer') return `<tr><td><b>${fmtDate(d.date)}</b></td><td>Día colchón</td></tr>`;
    const a = A(d.act) || A('rest'), alt = A(d.alt);
    return `<tr><td><b>${fmtDate(d.date)}</b>${d.hol ? `<br><small>${d.hol.name}</small>` : ''}</td><td><b>${a.name}</b>${d.auto ? ` — ${esc(d.auto)}` : ''}<br><small>${esc(a.how)}${a.crit ? ` · ⚠ ${esc(a.crit)}` : ''}${alt && a.type === 'ski' ? ` · Con los perros: ${alt.name}` : ''}${d.note ? ` · Nota: ${esc(d.note)}` : ''}</small></td></tr>`;
  };
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Roadbook ${fmtDate(c.depart)} – ${fmtDate(c.homeBy)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;800&family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    @page{size:A4;margin:14mm}
    body{font-family:Inter,system-ui,sans-serif;color:#14202e;font-size:11.5pt;line-height:1.45;margin:0}
    h1,h2{font-family:Manrope,sans-serif;letter-spacing:-.02em;margin:0}
    h1{font-size:30pt;line-height:1.05} h2{font-size:15pt;margin:22px 0 8px;padding-bottom:4px;border-bottom:2px solid #7c5cff;break-after:avoid}
    .cover{padding:26px;border-radius:14px;background:linear-gradient(120deg,#1b1640,#0b3340);color:#fff;margin-bottom:14px}
    .cover p{margin:6px 0 0;opacity:.9}
    .kv{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}
    .kv div{padding:10px;border:1px solid #dde3ec;border-radius:10px}.kv b{display:block;font-family:Manrope;font-size:14pt}
    table{width:100%;border-collapse:collapse;font-size:10.5pt}td,th{padding:6px 8px;border-bottom:1px solid #e4e8ef;vertical-align:top;text-align:left}
    th{font-size:8.5pt;text-transform:uppercase;letter-spacing:.06em;color:#5b6b80}tr{break-inside:avoid}small{color:#4b5a6e}
    .num{text-align:right}.box{display:inline-block;width:12px;height:12px;border:1.5px solid #333;border-radius:3px;margin-right:6px;vertical-align:-1px}
    .warn{padding:8px 10px;border-radius:8px;background:#fff4dc;margin:4px 0}.sos{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    .sos div{padding:10px;border-radius:10px;background:#fde8ea}.sos b{display:block;font-size:16pt;font-family:Manrope}
    .print{position:fixed;top:12px;right:12px;padding:10px 16px;border-radius:10px;border:0;background:#7c5cff;color:#fff;font-weight:700;cursor:pointer}
    @media print{.print{display:none}}
  </style></head><body>
  <button class="print" onclick="print()">Imprimir / Guardar PDF</button>
  <div class="cover"><small>ROADBOOK · CAMPER</small><h1>${esc(c.origin.name)} → ${p.stays.map(st => esc(st.base.town)).join(' → ')}</h1>
    <p>${fmtLong(c.depart)} – ${fmtLong(c.homeBy)} · ${c.adults} adultos · ${c.dogs} perro${c.dogs === 1 ? '' : 's'} (${esc(c.dogNames)}) · ${esc(c.van.name)}</p></div>
  <div class="kv"><div>Llegada al camping<b>${fmtDate(p.arrive)}</b></div><div>Noches en Suiza<b>${p.nights}</b></div><div>Kilómetros<b>${Math.round(p.budget.km).toLocaleString('es-ES')}</b></div><div>Presupuesto<b>${eur(p.budget.total)}</b></div></div>
  ${p.warn.map(w => `<div class="warn">⚠ ${esc(w.t)}</div>`).join('')}
  <h2>Emergencias</h2>
  <div class="sos"><div>General<b>112</b></div><div>Rescate Rega<b>1414</b><small>+41 333 333 333</small></div><div>Veterinario 24 h<b style="font-size:12pt">+41 33 822 21 41</b></div><div>Avería CH<b>140</b></div></div>
  <h2>Ruta · ida por ${STRATEGIES[c.outStrategy].name}, vuelta por ${STRATEGIES[c.retStrategy].name}</h2>
  <table><tr><th>Día</th><th>Tramo</th><th class="num">Km</th><th class="num">Horas</th><th>Noche</th></tr>
  ${[...p.travelOut, ...p.travelRet].map(t => `<tr><td>${fmtDate(t.date)}</td><td>${esc(t.from)} → ${esc(t.to)}</td><td class="num">${Math.round(t.km)}</td><td class="num">${t.totalH.toFixed(1)}</td><td>${t.stop ? `${esc(t.stop.name)}<br><small>${esc(t.stop.addr)} · ${t.stop.price ? t.stop.price.toFixed(2) + ' €' : 'gratis'}</small>` : '—'}</td></tr>`).join('')}</table>
  <h2>Plan día a día</h2><table>${p.days.map(day).join('')}</table>
  <h2>Dónde dormís en Suiza</h2><table>${p.stays.map(st => `<tr><td>${fmtDate(st.checkin)} → ${fmtDate(st.checkout)}</td><td><b>${esc(st.base.name)}</b> · ${esc(st.base.town)} · ${esc(st.base.tel)}${st.base.mail ? ` · ${esc(st.base.mail)}` : ''}<br><small>${st.nights} noches · ≈${st.np.toFixed(0)} CHF/noche${st.transfer ? ` · traslado ${Math.round(st.transfer.km)} km` : ''}</small></td></tr>`).join('')}</table>
  <h2>Antes de salir</h2><table>${p.prep.map(x => `<tr><td style="width:90px">${fmtDate(x.due)}</td><td><span class="box">${done[x.id] ? '✓' : ''}</span>${esc(x.t)}</td></tr>`).join('')}</table>
  <h2>Presupuesto</h2><table>${p.budget.items.filter(i => i.v > 0.5).map(i => `<tr><td>${esc(i.l)}<br><small>${esc(i.n)}</small></td><td class="num">${eur(i.v)}</td></tr>`).join('')}<tr><td><b>Total</b></td><td class="num"><b>${eur(p.budget.total)}</b></td></tr></table>
  <h2>Contactos</h2><table>${CONTACTS.map(x => `<tr><td>${esc(x[0])}</td><td>${esc(x[1])}</td><td>${esc(x[2])}</td></tr>`).join('')}</table>
  ${notes ? `<h2>Notas</h2><p style="white-space:pre-wrap">${esc(notes)}</p>` : ''}
  <p><small>Generado el ${new Date().toLocaleDateString('es-ES')}. Precios orientativos: confirmar antes de pagar.</small></p>
  </body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); return; }
  // Si el navegador bloquea la ventana, se descarga el roadbook como archivo
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  a.download = `roadbook-${c.depart}.html`; a.click();
  ctx.toast('Roadbook descargado: ábrelo y pulsa «Imprimir / Guardar PDF»');
}
