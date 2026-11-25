// Módulo autocontenido del destino Suiza. Exporta meta + secciones en orden.
import { IMG } from './data.js';
import inicio from './sections/inicio.js';
import ruta from './sections/ruta.js';
import pernoctas from './sections/pernoctas.js';
import tramites from './sections/tramites.js';
import meteo from './sections/meteo.js';
import actividades from './sections/actividades.js';
import perros from './sections/perros.js';
import diaria from './sections/diaria.js';
import presupuesto from './sections/presupuesto.js';
import equipaje from './sections/equipaje.js';
import seguridad from './sections/seguridad.js';

export default {
  meta: {
    id: 'suiza', name: 'Suiza · Grindelwald', flag: '🇨🇭',
    backgrounds: [IMG.grindelwald, IMG.lauterbrunnen, IMG.eiger],
    footer: 'Roadbook Grindelwald 2026 · basado en la Guía PRO y el Plan de viaje (revisados 22/11/2026). Precios orientativos: confirmar antes de pagar. La información publicada no es una reserva.',
  },
  sections: [inicio, ruta, pernoctas, tramites, meteo, actividades, perros, diaria, presupuesto, equipaje, seguridad],
};
