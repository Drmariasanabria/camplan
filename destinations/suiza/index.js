// Módulo autocontenido del destino Suiza: datos + motor + secciones.
import { IMG, INFO } from './data.js';
import { prepare, plan } from './engine.js';
import { bar } from './common.js';
import { setTerms } from '../../js/core/ui.js';
import viaje from './sections/viaje.js';
import itinerario from './sections/itinerario.js';
import preparar from './sections/preparar.js';
import ruta from './sections/ruta.js';
import dormir from './sections/dormir.js';
import tiempo from './sections/tiempo.js';
import actividades from './sections/actividades.js';
import perros from './sections/perros.js';
import destino from './sections/destino.js';
import presupuesto from './sections/presupuesto.js';
import equipaje from './sections/equipaje.js';
import emergencias from './sections/emergencias.js';

setTerms(INFO);

export default {
  meta: {
    id: 'suiza', name: 'Suiza · Alpes', flag: '🇨🇭',
    backgrounds: [IMG.grindelwald, IMG.lauterbrunnen, IMG.eiger],
    footer: 'Precios y horarios orientativos comprobados en noviembre de 2026: confirmad antes de pagar. Que un sitio aparezca aquí no es una reserva.',
  },
  prepare, plan, bar,
  sections: [viaje, itinerario, preparar, ruta, dormir, tiempo, actividades, perros, destino, presupuesto, equipaje, emergencias],
};
