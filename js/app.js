// Shell de la app: router por hash, navegación y carga de destinos autocontenidos.
import { startParticles, initSound, setBackgrounds, enhance, sfx, toast } from './core/fx.js';
import * as store from './core/store.js';
import * as live from './core/live.js';
import { DESTINATIONS } from '../destinations/registry.js';
import * as ui from './core/ui.js';

const view = document.getElementById('view');
const side = document.getElementById('sidenav');
const loaded = {};

async function loadDest(id) {
  const d = DESTINATIONS.find(x => x.id === id);
  if (!d || d.soon) return null;
  return loaded[id] ||= (await d.load()).default;
}

function renderDestSwitch(active) {
  document.getElementById('dest-switch').innerHTML = DESTINATIONS.map(d =>
    `<a class="dest-chip ${d.id === active ? 'active' : ''} ${d.soon ? 'soon' : ''}" href="#/${d.id}">${d.flag} ${d.name}${d.soon ? ' · pronto' : ''}</a>`).join('');
}

function renderSide(dest, sectionId) {
  if (!dest) {
    side.innerHTML = `<div class="nav-title">Destinos</div>` + DESTINATIONS.map(d =>
      `<a class="nav-link ${d.soon ? 'muted' : ''}" href="#/${d.id}"><span class="ico">${d.flag}</span>${d.name}</a>`).join('') +
      `<div class="nav-title" style="margin-top:26px">Cuenta</div><a class="nav-link" href="#/ajustes"><span class="ico">⚙️</span>Ajustes y nube</a>`;
    return;
  }
  side.innerHTML = `<div class="nav-title">${dest.meta.flag} ${dest.meta.name}</div>` +
    dest.sections.map((s, i) => `<a class="nav-link ${s.id === sectionId ? 'active' : ''}" href="#/${dest.meta.id}/${s.id}"><span class="ico">${s.icon}</span>${s.title}<span class="num">${String(i + 1).padStart(2, '0')}</span></a>`).join('') +
    `<div class="nav-title" style="margin-top:26px">Cuenta</div><a class="nav-link" href="#/ajustes"><span class="ico">⚙️</span>Ajustes y nube</a>`;
}

function ctxFor(destId) {
  return {
    dest: destId, live, ui, toast, sfx,
    get: (k, d) => store.get(destId, k, d),
    set: (k, v) => store.set(destId, k, v),
  };
}

async function route() {
  document.body.classList.remove('nav-open');
  const [, a, b] = location.hash.replace(/^#/, '').split('/');
  let html, mount, bgs;

  if (!a) {
    renderDestSwitch(null); renderSide(null);
    bgs = DESTINATIONS.filter(d => d.cover).map(d => d.cover);
    html = homeHTML();
  } else if (a === 'ajustes') {
    renderDestSwitch(null); renderSide(null);
    html = settingsHTML(); mount = mountSettings;
  } else {
    const dest = await loadDest(a);
    if (!dest) { location.hash = '#/'; return; }
    const sec = dest.sections.find(s => s.id === b) || dest.sections[0];
    renderDestSwitch(a); renderSide(dest, sec.id);
    const ctx = ctxFor(a);
    html = `<div class="page" data-section="${sec.id}">${sec.render(ctx)}${pager(dest, sec)}${footer(dest)}</div>`;
    mount = el => sec.mount?.(el, ctx);
    bgs = sec.bg || dest.meta.backgrounds;
  }
  view.innerHTML = html.startsWith('<div class="page"') ? html : `<div class="page">${html}</div>`;
  scrollTo({ top: 0, behavior: 'instant' });
  setBackgrounds(bgs);
  sfx.page();
  try { await mount?.(view); } catch (e) { console.error(e); }
  enhance(view);
}

function pager(dest, sec) {
  const i = dest.sections.indexOf(sec), prev = dest.sections[i - 1], next = dest.sections[i + 1];
  return `<div class="btn-row" style="justify-content:space-between;margin-top:80px">
    ${prev ? `<a class="btn" href="#/${dest.meta.id}/${prev.id}">← ${prev.icon} ${prev.title}</a>` : '<span></span>'}
    ${next ? `<a class="btn primary" href="#/${dest.meta.id}/${next.id}">${next.icon} ${next.title} →</a>` : ''}</div>`;
}
const footer = dest => `<div class="foot">${dest.meta.footer || ''}<br>Datos en vivo: Open-Meteo (ECMWF, DWD, NOAA, MeteoSwiss, Météo-France) · SLF · data.economie.gouv.fr · Ministerio para la Transición Ecológica · BCE/Frankfurter · OSRM · OpenStreetMap · Wikimedia Commons.</div>`;

function homeHTML() {
  return `<section class="hero" style="min-height:60vh">
    <p class="kicker">Roadbook · camper edition</p>
    <h1 class="title">Viajes que <span class="grad-text">se planifican</span> solos.</h1>
    <p class="lead">Cada destino es un módulo autocontenido con su ruta, pernoctas, papeles, meteo en vivo, presupuesto y equipaje. Elige uno.</p>
  </section>
  <div class="grid g2 home-dests">${DESTINATIONS.map(d => `
    <a class="card photo" href="#/${d.id}" style="${d.soon ? 'opacity:.55' : ''}">
      <div class="ph" style="background-image:url('${d.cover}')"></div>
      <div class="body"><span class="tag ${d.soon ? 'warn' : 'ok'}">${d.soon ? 'Próximamente' : d.when}</span>
      <h2 style="margin:6px 0 8px">${d.flag} ${d.name}</h2><p>${d.tagline}</p></div></a>`).join('')}
  </div>`;
}

function settingsHTML() {
  const u = store.currentUser();
  return `<p class="kicker">Cuenta</p><h1 class="title">Ajustes <span class="grad-text">& nube</span></h1>
  <div class="grid g2">
    <div class="card no-tilt"><span class="tag ${store.cloudReady() ? 'ok' : 'warn'}">${store.cloudReady() ? 'Firebase configurado' : 'Firebase sin configurar'}</span>
      <h3>Sesión de Google</h3>
      <p>${u ? `Conectada como <b>${u.email}</b>. Checklists, equipaje, presupuesto y notas se sincronizan en Firestore.` :
        store.cloudReady() ? 'Inicia sesión para guardar tu progreso en la nube y verlo en el móvil.' :
        'Ahora mismo todo se guarda en este navegador. Para sincronizar entre móvil y ordenador, crea un proyecto Firebase (gratis) y pega la config en <code>js/firebase-config.js</code>. Instrucciones en <code>README.md</code>.'}</p>
      <div class="btn-row">${u ? '<button class="btn" id="so">Cerrar sesión</button>' : `<button class="btn primary" id="si">Entrar con Google</button>`}</div></div>
    <div class="card no-tilt"><span class="tag">Copia de seguridad</span><h3>Exportar / importar</h3>
      <p>Descarga todo lo que has marcado como JSON, o restáuralo.</p>
      <div class="btn-row"><button class="btn" id="ex">⬇️ Exportar</button><label class="btn">⬆️ Importar<input type="file" id="im" accept=".json" hidden></label></div></div>
  </div>`;
}
function mountSettings(el) {
  el.querySelector('#si')?.addEventListener('click', store.signIn);
  el.querySelector('#so')?.addEventListener('click', store.signOut);
  el.querySelector('#ex').addEventListener('click', store.exportJSON);
  el.querySelector('#im').addEventListener('change', e => store.importJSON(e.target.files[0]).then(() => toast('Datos importados')));
}

document.getElementById('menu-toggle').addEventListener('click', () => document.body.classList.toggle('nav-open'));
store.onChange(() => route());
addEventListener('hashchange', route);
startParticles(); initSound(); store.initAuth(); route();
