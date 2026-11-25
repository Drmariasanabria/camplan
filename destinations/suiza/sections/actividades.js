import { IMG, ACTIVITIES, LIFTS, SKIPASS, P } from '../data.js';
import { fmtDate, liftOpen, skipassCHF, isHigh } from '../engine.js';

const wikiloc = ([la, lo]) => `https://www.wikiloc.com/wikiloc/map.do?sw=${(la - .04).toFixed(3)}%2C${(lo - .06).toFixed(3)}&ne=${(la + .04).toFixed(3)}%2C${(lo + .06).toFixed(3)}`;
const komoot = ([la, lo]) => `https://www.komoot.com/discover/Location/@${la},${lo}/tours`;
const strava = ([la, lo]) => `https://www.strava.com/maps/global-heatmap?sport=All&style=dark#13/${la}/${lo}`;
const ig = t => `https://www.instagram.com/explore/tags/${t}/`;

export default {
  id: 'actividades', title: 'Esquí y rutas', icon: '🎿',
  bg: [IMG.bachalpsee, IMG.faulhorn, IMG.kleine, IMG.murren],
  render(ctx) {
    const { ui, plan: p } = ctx, c = p.cfg, t = ui.term, base = p.days.filter(d => d.kind === 'base');
    const planned = id => base.filter(d => d.act === id).map(d => fmtDate(d.date));
    const skiCHF = skipassCHF(c.skiDays, p.skiDates);
    return `<p class="kicker">Región Jungfrau</p><h1 class="title">Esquí <span class="grad-text">y rutas</span></h1>
    <p class="lead">Qué está abierto en vuestros días (${fmtDate(base[0]?.date || p.arrive)} → ${fmtDate(base.at(-1)?.date || p.leave)}), cuánto cuesta y cómo combinarlo con los perros. Un sendero cerrado o sin confirmar se descarta aunque la ruta exista en internet.</p>

    <h2>Remontes abiertos <span class="grad-text">en tus fechas</span></h2>
    ${ui.table(['Zona', 'Temporada', 'Días abiertos durante vuestra estancia'], Object.values(LIFTS).map(l => {
      const n = base.filter(d => liftOpen(Object.keys(LIFTS).find(k => LIFTS[k] === l), d.date)).length;
      return [`<b>${l.name}</b>`, `${fmtDate(l.from)} – ${fmtDate(l.to)}`, `<span class="badge ${n === base.length ? 'ok' : n ? 'warn' : 'bad'}">${n} de ${base.length}</span>${n && n < base.length ? ` desde el ${fmtDate(l.from)}` : ''}`]; }))}
    <div class="btn-row"><a class="btn primary" href="https://www.jungfrau.ch/de-ch/live/Pistendaten/" target="_blank"><span class="live-dot"></span>Ver qué está abierto hoy ↗</a></div>

    <h2>Forfaits <span class="grad-text">para vosotros</span></h2>
    <div class="grid g2">
      <div>${ui.table(['Días', 'Baja (CHF)', 'Alta (CHF)'], Object.keys(SKIPASS.low).map(k => [k === '0.5' ? '½ día' : `${k} día${k > 1 ? 's' : ''}`, SKIPASS.low[k], SKIPASS.high[k]]), { num: [1, 2] })}
        <p class="small muted">Temporada alta: 19/12/2026 – 03/01/2027. En baja, sábados y domingos se cobra tarifa alta. Un ${t('forfait')} cubre toda la Jungfrau Ski Region, con los trenes de la región.</p></div>
      <div class="card no-tilt"><span class="tag">Según tu configuración</span>
        <div class="big-num grad-text">${c.interests.ski && c.skiers ? ui.chf(skiCHF * c.skiers) : '—'}</div>
        <p>${c.interests.ski && c.skiers ? `${c.skiers} esquiador${c.skiers > 1 ? 'es' : ''} × ${c.skiDays} días · tarifa ${p.skiDates.some(isHigh) ? 'alta' : 'baja'} · ${ui.eur(skiCHF * c.skiers / p.fx)}` : 'Sin esquí en tu configuración.'}</p>
        <p class="small">Días de esquí del plan: ${p.skiDates.map(fmtDate).join(', ') || 'ninguno'}.</p>
        <p class="small">Quien no esquía: ${t('pase invernal')} 61 CHF/día (${c.winterPassDays} días-persona en tu presupuesto). Trineo ${t('Big Pintenfritz')}: 55 CHF.</p>
        <a class="btn sm" href="#/suiza/viaje">Cambiar días y esquiadores</a></div>
    </div>
    <div class="callout warn"><h3>Días de esquí con perros</h3><p>${c.adults > c.skiers ? `Esquía ${c.skiers === 1 ? 'una persona' : c.skiers + ' personas'} y ${c.adults - c.skiers === 1 ? 'la otra va' : 'el resto va'} con los perros: el plan ya propone una ruta con perros para esos días.` : `Esquiáis todos: necesitáis ${t('petsitting24', 'cuidador de perros')} esos días.`} Los perros no pueden entrar en pistas ni en trineos. No planifiquéis horas de perros solos en la furgo.</p></div>

    <h2>Rutas, pistas <span class="grad-text">y planes</span></h2>
    <div class="grid g3">${ACTIVITIES.filter(a => !['rest', 'shop'].includes(a.type)).map(a => {
      const open = base.filter(d => liftOpen(a.lift, d.date)).length, pl = planned(a.id);
      return ui.photoCard({ img: a.img, tag: pl.length ? `En tu plan: ${pl.join(', ')}` : open < base.length ? `Abierto ${open}/${base.length} días` : (a.level || 'Esquí'), tagCls: pl.length ? 'ok' : open ? '' : 'bad', title: a.name,
        text: `${a.text}${a.km ? `<br><b>${a.km} km · ${a.time} · ${a.up}</b>` : ''}<br>${a.dogs ? '🐕 Con perros' : '🚫 Sin perros'} · ${a.cost}${a.crit ? `<br><span style="color:var(--warn)">⚠ ${a.crit}</span>` : ''}`,
        extra: a.pos ? `<div class="link-list" style="margin-top:10px"><a href="${wikiloc(a.pos)}" target="_blank">Wikiloc</a><a href="${komoot(a.pos)}" target="_blank">Komoot</a><a href="${strava(a.pos)}" target="_blank">Strava</a><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(a.name + ' winter')}" target="_blank">Vídeos</a></div>` : '' }); }).join('')}</div>
    <div class="map" id="hike-map" style="margin-top:22px"></div>

    <div class="grid g2" style="margin-top:28px">
      <div class="card"><span class="tag">🏃 Trail running</span><h3>Mejor en el fondo del valle</h3><p>Solo por senderos invernales pisados (Grindelwald tiene ≈70 km), con microspikes y frontal, sin pisar pistas. Para rodajes: Lauterbrunnen → Stechelberg y la orilla del Aar en Interlaken. Volved antes de que anochezca.</p></div>
      <div class="card"><span class="tag ${c.interests.tour ? 'warn' : ''}">⛷️ Travesía y fuera de pista</span><h3>Solo con todo el material</h3><p>Boletín de ${t('SLF', 'aludes')} consultado, ${t('ARVA')}, pala y sonda, experiencia o guía de montaña, y respetando las ${t('zona de fauna', 'zonas de reposo de fauna')}.</p>${ui.links([['Skitourenguru', 'https://www.skitourenguru.ch/'], ['Guías de Grindelwald', 'https://www.grindelwaldsports.ch/']])}</div>
    </div>

    <h2>Fotos <span class="grad-text">e ideas</span></h2>
    <div class="gallery" id="gal"><span class="loader"></span></div>
    <div style="margin-top:18px">${ui.links([['Instagram #grindelwald', ig('grindelwald')], ['#lauterbrunnen', ig('lauterbrunnen')], ['#jungfrauregion', ig('jungfrauregion')], ['#bachalpsee', ig('bachalpsee')], ['#wintervanlife', ig('wintervanlife')], ['Wikiloc: toda la zona', wikiloc(P.grindelwald)], ['Strava: por dónde corre la gente', strava(P.grindelwald)]])}</div>`;
  },
  async mount(el, { ui, live }) {
    const m = ui.makeMap(el.querySelector('#hike-map'), [46.62, 7.98], 12);
    ACTIVITIES.filter(a => a.pos).forEach(a => L.marker(a.pos, { icon: ui.pin(a.type === 'valley' ? '🏃' : '🥾', '#1fae78') }).addTo(m).bindPopup(`<b>${a.name}</b><br>${a.km} km · ${a.time}`));
    [['🚡', P.first, 'First'], ['🚡', P.mannlichen, 'Männlichen'], ['🚂', P.kleine, 'Kleine Scheidegg']].forEach(([e, pos, n]) => L.marker(pos, { icon: ui.pin(e) }).addTo(m).bindPopup(n));
    try {
      const imgs = (await Promise.all(['Grindelwald winter', 'Lauterbrunnen snow', 'Bachalpsee winter', 'Kleine Scheidegg winter', 'Mürren winter'].map(q => live.commons(q, 4).catch(() => [])))).flat();
      el.querySelector('#gal').innerHTML = imgs.map(i => `<a href="${i.page}" target="_blank" title="${ui.esc(i.title)}" style="background-image:url('${i.src}')"></a>`).join('');
    } catch { el.querySelector('#gal').innerHTML = ''; }
  },
};
