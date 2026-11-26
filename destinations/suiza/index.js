// Módulo autocontenido del destino Suiza: datos + motor + secciones.
import { IMG, INFO } from './data.js';
import { prepare, plan } from './engine.js';
import { bar } from './common.js';
import { setTerms } from '../../js/core/ui.js';
import planView from './sections/plan.js';
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
    id: 'suiza', name: 'Alpes · Francia, Suiza e Italia', flag: '🇨🇭',
    backgrounds: [IMG.chamonix, IMG.montblanc, IMG.champoluc],
    footer: 'Precios y horarios orientativos comprobados en noviembre de 2026: confirmad antes de pagar. Que un sitio aparezca aquí no es una reserva.',
  },
  prepare, plan, bar,
  // Pantalla principal: el itinerario. El resto, solo lo que no cabe en él.
  sections: [planView, preparar, presupuesto, tiempo, equipaje, emergencias],
};
