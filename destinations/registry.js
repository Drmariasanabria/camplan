// Registro de destinos. Para añadir uno nuevo: crea destinations/<id>/index.js
// (copiando la estructura de suiza/) y añade una entrada aquí. Nada más.
const T = p => `https://upload.wikimedia.org/wikipedia/commons/thumb/${p}/1920px-${p.split('/').pop()}`;

export const DESTINATIONS = [
  {
    id: 'suiza', name: 'Alpes · Francia, Suiza e Italia', flag: '🇨🇭', when: 'Diciembre 2026 · fechas configurables',
    tagline: 'Desde España a los Alpes en camper: Chamonix, Interlaken, Valle de Aosta o cualquier zona de montaña suiza. Varias estancias, perros, esquí y nieve.',
    cover: T('b/ba/Grindelwald_View_02.jpg'),
    load: () => import('./suiza/index.js'),
  },
  {
    id: 'proximo', name: 'Próximo destino', flag: '🧭', soon: true,
    tagline: 'Plantilla lista: duplica la carpeta suiza/, cambia data.js y añádelo aquí.',
    cover: T('d/d7/Jungfrau03.jpg'),
  },
];
