import { IMG, EMERG, CONTACTS } from '../data.js';

export default {
  id: 'seguridad', title: 'Seguridad y contactos', icon: '🆘',
  bg: [IMG.eiger, IMG.jungfraujoch],
  render: ({ ui, get }) => `
  ${ui.header('Montaña y emergencias', 'Volver <span class="grad-text">sin improvisar</span>', 'Tres niveles de decisión: apertura del itinerario, exposición real y capacidad de evacuación.')}
  <div class="grid g4">${EMERG.map(e => `<a class="card" href="tel:${e.n.replace(/\s/g, '')}" style="color:inherit;text-decoration:none"><span class="tag bad">Llamar</span><div class="big-num grad-text" style="font-size:${e.n.length > 6 ? '30px' : '64px'}">${e.n}</div><h3 style="margin-top:10px">${e.t}</h3><p class="small">${e.d}</p></a>`).join('')}</div>

  <h2>Umbral práctico <span class="grad-text">de cancelación</span></h2>
  <div class="grid g2">
    <div class="card"><span class="tag bad">Se descarta</span><h3>Sendero cerrado o sin confirmar</h3><p>Aunque el track exista en internet.</p></div>
    <div class="card"><span class="tag warn">Nivel 3</span><h3>«Notable», no «apto con cuidado»</h3><p>El riesgo depende de terreno, cota, orientación y situación. No basta un número.</p></div>
    <div class="card"><span class="tag">Seguro</span><h3>Suiza + rescate + modalidad exacta</h3><p>Esquí en pista, fuera de pista o travesía. La TSE no sustituye esa cobertura.</p></div>
    <div class="card"><span class="tag">Aviso</span><h3>Ruta, horario y hora límite</h3><p>Teléfono cargado, frontal, capa de abrigo y orientación offline. Puesta de sol ≈16:45.</p></div>
  </div>

  <h2>Contactos <span class="grad-text">del viaje</span></h2>
  ${ui.table(['Quién', 'Dirección', 'Teléfono', 'Email'], CONTACTS.map(c => [`<b>${c[0]}</b>`, `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c[1])}" target="_blank">${c[1]}</a>`, c[2] ? `<a href="tel:${c[2].replace(/\s/g, '')}">${c[2]}</a>` : '', c[3] ? `<a href="mailto:${c[3]}">${c[3]}</a>` : '']))}

  <h2>Mis notas <span class="grad-text">(se guardan)</span></h2>
  <textarea id="notes" rows="8" placeholder="Nº de póliza, teléfono de la aseguradora, matrícula, nº de microchip de West…">${ui.esc(get('notes', ''))}</textarea>

  <h2>Todas <span class="grad-text">las fuentes</span></h2>
  <div class="grid g3">
    <div class="card"><span class="tag">Campings</span>${ui.links([['Camping Jungfrau invierno', 'https://www.camping-lodge.com/de-ch/jungfrau/winter'], ['Gletscherdorf', 'https://www.gletscherdorf.ch/'], ['Manor Farm', 'https://www.manorfarm.ch/'], ['Eigernordwand (sin perros)', 'https://www.camping-eigernordwand.ch/'], ['Camping-Car Park', 'https://www.campingcarpark.com/'], ['Grauholz park4night', 'https://park4night.com/en/place/6056'], ['Bourg park4night', 'https://park4night.com/en/place/28798']])}</div>
    <div class="card"><span class="tag">Movilidad</span>${ui.links([['Viñeta (via.admin.ch)', 'https://via.admin.ch/shop/'], ["Crit'Air", 'https://www.certificat-air.gouv.fr/'], ['Crit\'Air extranjeros', 'https://www.service-public.gouv.fr/particuliers/vosdroits/R59473'], ['Loi Montagne', 'https://www.service-public.gouv.fr/particuliers/actualites/A14389'], ['A79 aliae', 'https://www.aliae.com/en/home.html'], ['Bison Futé', 'https://www.bison-fute.gouv.fr/'], ['Mappy', 'https://fr.mappy.com/'], ['prix-carburants', 'https://www.prix-carburants.gouv.fr/'], ['Geoportal gasolineras', 'https://geoportalgasolineras.es/']])}</div>
    <div class="card"><span class="tag">Perros y aduana</span>${ui.links([['BLV viajar con perros', 'https://www.blv.admin.ch/en/travelling-with-dogs-cats-and-ferrets'], ['BLV alimentos', 'https://www.blv.admin.ch/de/lebensmittel-im-privaten-reiseverkehr'], ['BAZG aduana', 'https://www.bazg.admin.ch/'], ['FAQ Jungfraubahnen', 'https://www.jungfrau.ch/de-ch/faq/'], ['SBB perros', 'https://www.sbb.ch/de/abos-billette/billette-schweiz/hunde.html'], ['petsitting24', 'https://petsitting24.ch/en/dog-sitter/be/grindelwald'], ['Zonas de fauna', 'https://natur-freizeit.ch/karte']])}</div>
    <div class="card"><span class="tag">Montaña</span>${ui.links([['Pistas en vivo', 'https://www.jungfrau.ch/de-ch/live/Pistendaten/'], ['Forfaits', 'https://www.jungfrau.ch/de-ch/jungfrau-ski-region/skipass-kaufen/'], ['White Risk', 'https://whiterisk.ch/en/conditions'], ['SLF', 'https://www.slf.ch/en/'], ['MeteoSwiss', 'https://www.meteoswiss.admin.ch/'], ['Rega', 'https://www.rega.ch/en/'], ['Sportzentrum', 'https://www.sportzentrum-grindelwald.ch/'], ['Swisstopo mapa', 'https://map.geo.admin.ch/']])}</div>
    <div class="card"><span class="tag">Salud y seguros</span>${ui.links([['TSE', 'https://sede.seg-social.gob.es/'], ['FCDME licencias', 'https://www.fcdme.es/'], ['DGT V-16', 'https://www.dgt.es/']])}</div>
  </div>
  <div class="callout ok"><h3>Información que aún debe confirmarse</h3><p>Disponibilidad y total de campings para 2 perros · altura real y clase de la Transit · coste exacto de peajes · cobertura contractual de seguros · funcionamiento de grises · apertura de remontes y senderos · horarios especiales del 24–26 de diciembre.</p></div>`,
  mount(el, { set, toast }) {
    const t = el.querySelector('#notes'); let h;
    t.addEventListener('input', () => { clearTimeout(h); h = setTimeout(() => { set('notes', t.value); toast('💾 Notas guardadas'); }, 700); });
  },
};
