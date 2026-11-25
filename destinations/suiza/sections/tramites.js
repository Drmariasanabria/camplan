import { IMG, PAPERS, CUSTOMS } from '../data.js';

const STATES = [['todo', 'Pendiente', 'warn'], ['doing', 'En curso', ''], ['done', 'Hecho ✅', 'ok'], ['na', 'No aplica', '']];

export default {
  id: 'tramites', title: 'Papeles y trámites', icon: '📄',
  bg: [IMG.bern, IMG.geneva],
  render: ({ ui, get }) => {
    const done = PAPERS.filter(p => get('paper:' + p.id, 'todo') === 'done' || get('paper:' + p.id) === 'na').length;
    return `${ui.header('Legal y fronteras', 'Todo lo que <span class="grad-text">hay que pedir</span>', 'Cada trámite con enlace oficial, cuándo hacerlo y lo que cuesta. Marca el estado: se guarda en tu cuenta.')}
    <div class="card no-tilt"><span class="tag">Progreso</span><div class="big-num"><span data-count="${done}">0</span> / ${PAPERS.length}</div><div class="progress"><i style="width:${done / PAPERS.length * 100}%"></i></div></div>
    <div class="grid g2" style="margin-top:22px">${PAPERS.map(p => {
      const s = get('paper:' + p.id, 'todo'), meta = STATES.find(x => x[0] === s);
      return `<div class="card" data-paper="${p.id}"><span class="tag ${meta[2]}">${meta[1]}</span>
        <h3 style="font-size:26px">${p.icon} ${p.title}</h3>
        <dl class="kv"><dt>Cuándo</dt><dd>${p.when}</dd><dt>Coste</dt><dd>${p.cost}</dd></dl>
        <p style="margin-top:12px">${p.text}</p>
        ${p.links.length ? ui.links(p.links) : ''}
        <div class="btn-row">${ui.segmented('p-' + p.id, STATES.map(x => [x[0], x[1]]), s)}</div></div>`;
    }).join('')}</div>

    <h2>Documentos <span class="grad-text">a llevar</span></h2>
    <div class="grid g3">
      <div class="card"><span class="tag">👥 Personas</span><ul><li>DNI o pasaporte en vigor (Schengen, pero hay control aduanero)</li><li>Carné de conducir español</li><li>TSE de cada uno</li><li>Póliza de rescate/montaña</li></ul></div>
      <div class="card"><span class="tag">🚐 Vehículo</span><ul><li>Permiso de circulación + ficha técnica (ITV)</li><li>Póliza + asistencia internacional</li><li>Crit'Air 2 pegada en el parabrisas</li><li>Viñeta digital (matrícula)</li></ul></div>
      <div class="card"><span class="tag">🐕 Perros</span><ul><li>2 pasaportes UE</li><li>Chip + antirrábica vigente</li><li>Cartilla, bozal (algunos transportes lo piden)</li><li>Datos del microchip en el móvil</li></ul></div>
    </div>

    <h2>Aduana <span class="grad-text">suiza</span></h2>
    <p class="lead">Suiza no está en la unión aduanera de la UE. Franquicias <b>por persona y día</b>. Entre los dos: 2 kg de carne y 10 l de vino sin pagar. El pienso envasado desde la UE no tiene restricción veterinaria pero cuenta para los 150 CHF.</p>
    ${ui.table(['Producto', 'Franquicia / persona', 'Si te pasas'], CUSTOMS)}
    <div class="callout"><h3>Si os pasáis, declaradlo</h3><p>App oficial <b>QuickZoll</b> o canal rojo. No declarar sale mucho más caro. Al salir de Suiza no hay que declarar nada salvo devolución de IVA.</p>
    ${ui.links([['BAZG franquicias', 'https://www.bazg.admin.ch/'], ['Alimentos en viaje (BLV)', 'https://www.blv.admin.ch/de/lebensmittel-im-privaten-reiseverkehr']])}</div>

    <h2>Loi Montagne <span class="grad-text">& Crit'Air</span></h2>
    <div class="grid g2">
      <div class="card"><span class="tag bad">1/11/2026 – 31/03/2027</span><h3>Equipamiento invernal Francia</h3><p>En municipios señalizados: 4 neumáticos 3PMSF o cadenas/fundas a bordo. M+S solo ya NO vale desde nov 2024. Panel B26 = montar cadenas. Multa 135 €. Cruzáis Puy-de-Dôme, Ain, Allier, Creuse, Haute-Savoie…</p>${ui.links([['Service-Public Loi Montagne', 'https://www.service-public.gouv.fr/particuliers/actualites/A14389']])}</div>
      <div class="card"><span class="tag warn">Precisión</span><h3>Crit'Air no es universal</h3><p>Importa en ZFE y bajo restricciones. Pedirla es prudente por desvíos o episodios de contaminación. Confirmad la clase con la ficha técnica, no solo el año.</p>${ui.links([['certificat-air.gouv.fr', 'https://www.certificat-air.gouv.fr/'], ['Ville de Lyon ZFE', 'https://www.lyon.fr/']])}</div>
    </div>`;
  },
  mount(el, { set, sfx, toast }) {
    el.querySelectorAll('[data-paper]').forEach(card => card.addEventListener('click', e => {
      const b = e.target.closest('.seg button'); if (!b) return;
      set('paper:' + card.dataset.paper, b.dataset.v);
      card.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b));
      const meta = STATES.find(x => x[0] === b.dataset.v), tag = card.querySelector('.tag');
      tag.className = 'tag ' + meta[2]; tag.textContent = meta[1];
      if (b.dataset.v === 'done') { sfx.success(); toast('✅ Trámite completado'); }
    }));
  },
};
