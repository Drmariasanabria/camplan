import { IMG, CONTACTS } from '../data.js';

export default {
  id: 'emergencias', title: 'Emergencias y notas', icon: '🆘',
  bg: [IMG.eiger, IMG.jungfraujoch],
  render(ctx) {
    const { ui, plan: p } = ctx, t = ui.term;
    const call = (n, title, d) => `<a class="card" href="tel:${n.replace(/\s/g, '')}" style="color:inherit;text-decoration:none"><span class="tag bad">Llamar</span><div class="big-num grad-text" style="font-size:${n.length > 6 ? '28px' : '58px'}">${n}</div><h3 style="margin-top:8px">${title}</h3><p class="small">${d}</p></a>`;
    return `<p class="kicker">Seguridad</p><h1 class="title">Emergencias <span class="grad-text">y contactos</span></h1>
    <p class="lead">Con perros y una camper, el mejor plan de montaña es el que permite volver sin improvisar transporte, rescate ni noche en la nieve.</p>
    <div class="grid g4">
      ${call('112', 'Emergencias', 'Europeo. En Suiza también 144 ambulancia, 117 policía, 118 bomberos.')}
      ${call('1414', 'Rescate en montaña', `${t('Rega')}. Desde móvil español: +41 333 333 333.`)}
      ${call('+41 33 822 21 41', 'Veterinario 24 h', `${t('Tierklinik', 'Tierklinik Interlaken')}. Llamad antes de ir.`)}
      ${call('140', 'Avería en Suiza', 'Asistencia en carretera del TCS (además de la vuestra).')}
    </div>
    <h2>Cuándo <span class="grad-text">no salir</span></h2>
    <div class="grid g2">
      <div class="card"><span class="tag bad">Se descarta</span><h3>Sendero cerrado o sin confirmar</h3><p>Aunque la ruta exista en internet.</p></div>
      <div class="card"><span class="tag warn">Aludes nivel 3</span><h3>«Notable» ya es serio</h3><p>Depende de la orientación, la altura y el terreno; un número solo no basta. ${t('SLF', 'Qué significa')}.</p></div>
      <div class="card"><span class="tag">Seguro</span><h3>Que cubra Suiza, rescate y la actividad exacta</h3><p>Pista, fuera de pista o travesía. La ${t('TSE')} no cubre rescates.</p></div>
      <div class="card"><span class="tag">Aviso</span><h3>Decid a alguien la ruta y la hora de vuelta</h3><p>Móvil cargado, frontal, capa de abrigo, mapa offline. Anochece ≈16:45 en el valle.</p></div>
    </div>
    <h2>Contactos</h2>
    ${ui.table(['Quién', 'Dirección', 'Teléfono'], CONTACTS.map(c => [`<b>${c[0]}</b>${c[0].startsWith(p.base.name) ? ' <span class="badge ok">Vuestra base</span>' : ''}`, `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c[1])}" target="_blank">${c[1]}</a>`, `<a href="tel:${c[2].replace(/\s/g, '')}">${c[2]}</a>`]))}
    <h2>Mis notas</h2>
    <textarea id="notes" rows="8" placeholder="Nº de póliza y teléfono de la aseguradora, matrícula, microchips, códigos de reserva…">${ui.esc(ctx.get('notes', ''))}</textarea>`;
  },
  mount(el, ctx) {
    const n = el.querySelector('#notes'); let h;
    n.addEventListener('input', () => { clearTimeout(h); h = setTimeout(() => { ctx.set('notes', n.value); ctx.toast('Notas guardadas'); }, 700); });
  },
};
