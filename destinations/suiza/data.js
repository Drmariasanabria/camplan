// ═══════════════════════════════════════════════════════════════════
//  SUIZA · GRINDELWALD — todos los datos del destino.
//  El motor (engine.js) combina estos datos con tu configuración.
// ═══════════════════════════════════════════════════════════════════

const T = p => `https://upload.wikimedia.org/wikipedia/commons/thumb/${p}/1920px-${p.split('/').pop()}`;
export const IMG = {
  grindelwald: T('b/ba/Grindelwald_View_02.jpg'), lauterbrunnen: T('2/29/1_lauterbrunnen_valley_wengen_2022.jpg'),
  eiger: T('f/fc/North_face.jpg'), jungfrau: T('d/d7/Jungfrau03.jpg'), murren: T('e/eb/1_M%C3%BCrren_2022.jpg'),
  kleine: T('7/76/Eiger%2C_M%C3%B6nch_and_Jungfrau.jpg'), bachalpsee: T('8/8f/Bachalpsee_reflection.jpg'),
  interlaken: T('1/14/Goldswil-Viadukt_Panorama_mit_Interlaken_im_Hintergrund_2.jpg'), faulhorn: T('e/e9/Faulhorn.jpeg'),
  mannlichen: T('8/8e/LWM1.JPG'), thun: T('6/65/Aerial_image_of_Lake_Thun_%28view_from_the_east%29.jpg'),
  geneva: T('a/ab/Geneve_2005_001_Ork.ch.jpg'), bern: T('4/45/Bundeshaus_Bern_2009%2C_Flooffy.jpg'),
  jungfraujoch: T('0/0e/Sphinx_et_Jungfrau_-_img_06980.jpg'), wengen: T('c/c1/1_wengen_2012.jpg'),
  bourg: T('e/ed/Monast%C3%A8re_royal_de_Brou_%28%C3%A9glise%29_%281%29.JPG'), limoges: T('f/f2/Centre-ville_et_champ_de_Juillet.JPG'),
  collie: T('e/e4/Border_Collie_600.jpg'),
};

/* ─────────────── Configuración por defecto (todo editable en «Mi viaje») ─────────────── */
export const DEFAULT_CFG = {
  depart: '2026-12-17', departTime: '06:30', homeBy: '2026-12-29', bufferDay: false,
  origin: { name: 'Torrelavega', pos: [43.3494, -4.0479] },
  adults: 2, skiers: 1, dogs: 2, dogNames: 'West y su compañero', dogKg: 20,
  van: { name: 'Ford Transit Custom Trail L1H1', height: 1.99, length: 4.97, cons: 9.5, tank: 70, fuel: 'diesel' },
  outStrategy: 'A', retStrategy: 'IT', maxHours: 10, stopsOut: {}, stopsRet: {}, vignette: false,
  // Itinerario «Alpes low-cost»: Chamonix → Interlaken → Valle de Aosta (Monte Rosa)
  stays: [{ base: 'deuxglaciers', nights: 2, price: 0 }, { base: 'alpenblick', nights: 4, price: 0 }, { base: 'champoluc', nights: 0, price: 0 }],
  skiDays: 4, halfDays: 0, winterPassDays: 3, sledRides: 0, sitterHours: 0,
  interests: { ski: true, tour: false, trail: true, snowshoe: true, sled: false, pool: true },
  foodPerDay: 28, localKm: 150, laundryLoads: 2, insurance: 0, contingencyPct: 7, eatOutMeals: 0,
  fuelES: 0, fuelFR: 0, // 0 = usar precio en vivo
  skiDayOther: 80, // CHF/día de forfait fuera de la Jungfrau (editable)
};

/* ─────────────── Puntos ─────────────── */
export const P = {
  oulx: [45.0329, 6.8336], montgenevre: [44.9312, 6.7231], gap: [44.5594, 6.0786], nimes: [43.8367, 4.3601], narbonne: [43.1843, 3.0042], toulouse: [43.6047, 1.4442],
  chamonix: [45.9237, 6.8694], martigny: [46.1028, 7.0727], goppenstein: [46.3683, 7.7543], kandersteg: [46.4947, 7.6731],
  irun: [43.339, -1.789], bordeaux: [44.8378, -0.5792], angouleme: [45.6484, 0.1562], brive: [45.1589, 1.5332], ussel: [45.5476, 2.284219],
  clermont: [45.7772, 3.087], thiers: [45.871103, 3.48427], lyonA46: [45.86, 4.93], pontdain: [46.0533, 5.3389],
  chaptelat: [45.93167, 1.26593], montlucon: [46.3401, 2.6026], digoin: [46.4811, 3.9839], macon: [46.3069, 4.8287],
  bourg: [46.2091, 5.239], saintamour: [46.437, 5.342], bardonnex: [46.1466, 6.1003], grauholz: [46.996, 7.497],
  interlaken: [46.6863, 7.8632], lauterbrunnen: [46.5935, 7.9091], grindelwald: [46.6242, 8.0414], first: [46.6597, 8.0545],
  kleine: [46.5853, 7.9614], mannlichen: [46.6125, 7.9417], murren: [46.559, 7.892], grutschalp: [46.5743, 7.886],
  bachalpsee: [46.6697, 8.0228], faulhorn: [46.6767, 8.0153], bussalp: [46.6527, 8.005], bort: [46.6425, 8.0447],
  stechelberg: [46.545, 7.902], lidlMatten: [46.6765, 7.8735], aldiInterlaken: [46.6905, 7.871], coopGrindelwald: [46.6245, 8.04],
  coopLauterbrunnen: [46.5935, 7.909], tierklinik: [46.6853, 7.858], sportzentrum: [46.6236, 8.0374],
};

/* ─────────────── Estrategias de ruta ───────────────
   chain = puntos por los que pasa la ruta (en orden de ida). Las paradas
   posibles cuelgan de un punto de la cadena (at) con un desvío (detourKm). */
export const STRATEGIES = {
  A: { name: 'Autopista', short: 'Autopista', color: '#5ee7ff', vanFactor: 1.0,
       chain: ['ORIGIN', 'irun', 'bordeaux', 'brive', 'ussel', 'clermont', 'thiers', 'lyonA46', 'pontdain', 'bardonnex', 'BASE'],
       tollsC1: 110, tollsC2: 165,
       what: 'Todo por autopista: A-8/AP-8 → Irún → A63 → Burdeos → A89 por el Macizo Central → rodea Lyon por la A46 → A42/A40 → Ginebra → autopistas suizas.',
       pros: ['La más rápida y predecible', 'Menos fatiga en invierno', 'Más paradas seguras (áreas vigiladas)'], cons: ['Peajes más caros (A89 Burdeos–Lyon ≈59 € solo ese tramo)'] },
  B: { name: 'Mixta por la RCEA (ahorro)', short: 'Mixta', color: '#ff5ea8', vanFactor: 1.04,
       chain: ['ORIGIN', 'irun', 'bordeaux', 'angouleme', 'chaptelat', 'montlucon', 'digoin', 'macon', 'bourg', 'bardonnex', 'BASE'],
       tollsC1: 55, tollsC2: 83, rcea: true,
       what: 'Peaje solo donde compensa (AP-8, A63, A40) y el resto por la RCEA, una nacional casi toda a 2×2 carriles y gratis: Burdeos → Limoges → Montluçon → A79 → Digoin → Mâcon → Bourg-en-Bresse.',
       pros: ['Ahorra ≈100–120 € de peajes ida y vuelta', 'Gasóleo algo menor a 90–110 km/h'], cons: ['≈2 h más por trayecto', 'Tramo A79 sin barreras: hay que pagar online en 72 h', 'Camiones; atención con niebla y hielo'] },
  IT: { name: 'Vuelta por Italia y Montgenèvre (sin túneles)', short: 'Montgenèvre', color: '#3ee6a1', vanFactor: 1.05, onlyRet: true, needs: 'IT',
       chain: ['ORIGIN', 'irun', 'toulouse', 'narbonne', 'nimes', 'gap', 'montgenevre', 'oulx', 'BASE'],
       tollsC1: 125, tollsC2: 185, estTolls: true,
       what: 'Desde el Valle de Aosta hacia Turín, Oulx y el puerto de Montgenèvre (1.850 m, gratuito, abierto en invierno salvo temporal), Briançon, Gap y autopistas del sur de Francia (Nîmes, Narbonne, Toulouse) hasta Irún. Evita pagar otra vez un túnel alpino.',
       pros: ['Sin túneles de pago', 'No repite ruta'], cons: ['Más km (≈1.550)', 'Puerto a 1.850 m: cadenas a mano', 'Peajes italianos y del sur de Francia (estimados)'] },
  MB: { name: 'Vuelta por el túnel del Mont Blanc', short: 'Mont Blanc', color: '#b388ff', vanFactor: 1.0, onlyRet: true, needs: 'IT',
       chain: ['ORIGIN', 'irun', 'bordeaux', 'brive', 'ussel', 'clermont', 'thiers', 'lyonA46', 'pontdain', 'chamonix', 'BASE'],
       tollsC1: 166, tollsC2: 236, tunnel: { name: 'Túnel del Mont Blanc (Italia → Francia)', eur: 56.4 },
       what: 'Desde Aosta por Courmayeur y el túnel del Mont Blanc (56,40 € Italia→Francia, clase 1 ≤2 m), Chamonix, A40 y A89 por Ussel hasta Irún.',
       pros: ['La más corta y rápida', 'Áreas conocidas (Ussel, Thiers)'], cons: ['Túnel 56,40 € (Italia→Francia, 2026)'] },
  D: { name: 'Sin ningún peaje', short: 'Sin peajes', color: '#ffc65c', vanFactor: 1.15,
       chain: ['ORIGIN', 'irun', 'bordeaux', 'angouleme', 'chaptelat', 'montlucon', 'digoin', 'macon', 'bourg', 'bardonnex', 'BASE'],
       tollsC1: 0, tollsC2: 0, rcea: true,
       what: 'Igual que la mixta pero evitando también la AP-8, la A63 (Landas por nacional) y la A40 (puerto Nantua–Bellegarde).',
       pros: ['0 € de peajes'], cons: ['≈4 h más por trayecto', 'Puertos con nieve en diciembre (Nantua–Bellegarde)', 'No recomendable en invierno con camper'] },
};

/* Paradas nocturnas posibles en Francia */
export const STOPS = [
  { id: 'ussel', name: 'Camping-Car Park Ussel', at: 'ussel', detourKm: 3, strat: ['A', 'MB'], pos: [45.5476, 2.284219], price: 13.1, card: true,
    addr: 'Route de Ponty, 19200 Ussel (lago de Ponty, salida 23 de la A89)', status: 'ok',
    winter: 'Abierta todo el año. En invierno solo vehículos autónomos. Duchas y aseos SOLO del 1/06 al 31/08 → en diciembre sin ducha. Con helada el agua puede estar cortada.',
    plus: 'Barrera y videovigilancia: de las más seguras de la zona.' },
  { id: 'thiers', name: 'Camping-Car Park Thiers', at: 'thiers', detourKm: 4, strat: ['A', 'MB'], pos: [45.871103, 3.48427], price: 13.5, card: true,
    addr: 'Route du Dorat, 63300 Thiers (junto a la A89)', status: 'ok',
    winter: '10 plazas. Camping «Iloa» anexo. Agua no garantizada con heladas.', plus: '≈170 km más cerca de Suiza que Ussel.' },
  { id: 'bourgA', name: 'Área municipal de Bourg-en-Bresse', at: 'pontdain', detourKm: 22, strat: ['A'], pos: [46.2091, 5.239], price: 0,
    addr: '27 rue du Pré Neuf, 01000 Bourg-en-Bresse (junto a la piscina)', status: 'warn', rating: 2.97,
    winter: 'Gratis, abierta todo el año. Grifo cortado en invierno; vaciado de grises gratis 24 h.', plus: 'Lidl al lado. Opiniones flojas por ruido nocturno.' },
  { id: 'chaptelat', name: 'Camping-Car Park Chaptelat', at: 'chaptelat', detourKm: 3, strat: ['B', 'D'], pos: [45.93167, 1.26593], price: 17.32, card: true,
    addr: 'Route du Mas Éloi, 87270 Chaptelat (norte de Limoges, junto a la A20)', status: 'warn',
    winter: 'Aseos abiertos todo 2026; confirmar ducha en invierno. Solo vehículos autónomos.', plus: '' },
  { id: 'bourg', name: 'Área municipal de Bourg-en-Bresse', at: 'bourg', detourKm: 2, strat: ['B', 'D'], pos: [46.2091, 5.239], price: 0,
    addr: '27 rue du Pré Neuf, 01000 Bourg-en-Bresse (junto a la piscina)', status: 'warn', rating: 2.97,
    winter: 'Gratis, abierta todo el año. Grifo cortado en invierno; vaciado de grises gratis 24 h.', plus: 'Lidl al lado. Ruido nocturno según opiniones.' },
  { id: 'saintamour', name: 'Camping-Car Park Saint-Amour', at: 'bourg', detourKm: 28, strat: ['B', 'D'], pos: [46.437, 5.342], price: 12.44, card: true,
    addr: 'Saint-Amour (Jura), ≈25 km al norte de Bourg', status: 'ok',
    winter: 'Abierta todo el año con electricidad, agua y vaciado.', plus: 'Más tranquila que Bourg.' },
  // Zonas sin área verificada: el enlace abre park4night centrado ahí para elegir una con opiniones recientes.
  ...[['z-bordeaux', 'Zona Burdeos (salida A63/A89)', 'bordeaux', ['A', 'B', 'D']], ['z-brive', 'Zona Brive-la-Gaillarde (A89/A20)', 'brive', ['A']], ['z-clermont', 'Zona Clermont-Ferrand (A89/A71)', 'clermont', ['A']],
      ['z-lyon', 'Zona norte de Lyon (A46)', 'lyonA46', ['A']], ['z-angouleme', 'Zona Angulema (N10)', 'angouleme', ['B', 'D']], ['z-montlucon', 'Zona Montluçon (N145)', 'montlucon', ['B', 'D']],
      ['z-macon', 'Zona Mâcon (N79/A40)', 'macon', ['B', 'D']],
      ['z-gap', 'Zona Gap (tras Montgenèvre)', 'gap', ['IT']], ['z-nimes', 'Zona Nîmes (A9)', 'nimes', ['IT']], ['z-narbonne', 'Zona Narbonne (A9/A61)', 'narbonne', ['IT']], ['z-toulouse', 'Zona Toulouse (A61/A64)', 'toulouse', ['IT']]].map(([id, name, at, strat]) => ({ id, name, at, detourKm: 8, strat, pos: P[at], price: 12, zone: true, status: 'warn',
    addr: 'Área por elegir en park4night', winter: 'Parada de emergencia o para etapas cortas: elegid un área con opiniones recientes de invierno.', plus: '' })),
];

/* Campings base en Suiza. Precio/noche = parcela + adultos×(adulto+tasa) + perros×perro + luz */
export const BASES = [
  { id: 'jungfrau', short: 'Lauterbrunnen', region: 'jungfrau', name: 'Camping Jungfrau', town: 'Lauterbrunnen', pos: [46.5913, 7.9104], img: IMG.lauterbrunnen,
    pitch: 45, adult: 9.9, tax: 2.8, dog: 5, elec: 0, maxDogs: 9, opens: '2026-12-13', status: 'ok', verdict: 'Recomendado',
    toGrindelwald: '25 min en coche · tren con transbordo (perros gratis)', toInterlaken: '20 min',
    pros: ['Admite perros (5 CHF/perro/día)', 'Abre en invierno desde el 13/12', 'Duchas calientes, agua y vaciado gratis', 'Intercambio de bombonas Campingaz', 'Ducha para perros, tienda, lavandería', 'Estación de tren a 15 min andando'],
    cons: ['A 20 km de Grindelwald'], tel: '+41 33 856 20 10', mail: 'info@campingjungfrau.swiss', web: 'https://www.camping-lodge.com/de-ch/jungfrau/winter', estimate: 'Parcela ≈43–46 CHF + 9,90/adulto + tasa 2,80 + perros' },
  { id: 'gletscherdorf', short: 'Grindelwald', region: 'jungfrau', name: 'Camping Gletscherdorf', town: 'Grindelwald', pos: [46.62, 8.048], img: IMG.grindelwald,
    pitch: 32, adult: 12, tax: 3, dog: 4, elec: 5, maxDogs: 9, opens: '2026-12-18', status: 'warn', verdict: 'Solo si confirman por escrito',
    toGrindelwald: 'En el pueblo, bus gratis con la tarjeta de huésped', toInterlaken: '30 min',
    pros: ['Ubicación ideal para First y Männlichen', 'Tarjeta de huésped: bus y bus de esquí gratis', '50 % en la piscina del Sportzentrum'],
    cons: ['Abre el 18/12', 'Una ficha dice que en invierno solo alquila parcelas de temporada', 'Acceso solo por el este (Mettenbergstrasse)'], tel: '+41 33 853 14 29', mail: 'info@gletscherdorf.ch', web: 'https://www.gletscherdorf.ch/', estimate: '≈56–65 €/noche 2 adultos + luz (estimación)' },
  { id: 'manor', short: 'Interlaken', region: 'jungfrau', name: 'Camping Manor Farm', town: 'Unterseen (Interlaken)', pos: [46.6855, 7.8217], img: IMG.thun,
    pitch: 25, adult: 12.5, tax: 1.8, dog: 4, elec: 5, maxDogs: 1, opens: '2026-01-01', status: 'bad', verdict: 'Solo 1 perro según tarifa 2027',
    toGrindelwald: '35 min en coche', toInterlaken: '5 min · transporte local gratis hasta el 31/12/2026',
    pros: ['La más barata con todos los servicios', 'Abierta todo el año', 'Tarjeta de huésped de Interlaken: transporte local incluido hasta el 31/12/2026'],
    cons: ['Su tarifa 2027 dice «dog (max. 1)»', 'Recepción en invierno solo 9–10 h y 16–17 h'], tel: '+41 33 822 22 64', mail: 'info@manorfarm.ch', web: 'https://www.manorfarm.ch/', estimate: '12,50/adulto + tasa 1,80 + luz 5 + parcela' },
  { id: 'rubi', short: 'Grindelwald', region: 'jungfrau', name: 'Stellplatz Hof Rubi', town: 'Grindelwald', pos: [46.627, 8.03], img: IMG.eiger,
    pitch: 50, adult: 0, tax: 0, dog: 0, elec: 0, maxDogs: 9, opens: '2026-01-01', status: 'warn', verdict: 'Preguntar',
    toGrindelwald: 'En Grindelwald', toInterlaken: '30 min',
    pros: ['Granja con 8 plazas', 'Ducha incluida', 'Precio cerrado ≈50 CHF/noche 2 personas'],
    cons: ['Sin vaciado de grises', 'Perros e invierno: preguntar', 'Ubicación aproximada'], tel: '+41 79 434 43 85', mail: '', web: 'https://www.google.com/maps/search/?api=1&query=Hof+Rubi+Grindelwald', estimate: '50 CHF/noche 2 personas' },
  // ── Francia · Chamonix ── fuente: les2glaciers.com/tarifs.html (invierno 2026/27, 17/12/2026–30/04/2027)
  { id: 'deuxglaciers', short: 'Chamonix', elev: 1010, region: 'chamonix', country: 'FR', cur: 'EUR', name: 'Camping Les Deux Glaciers', town: 'Les Bossons (Chamonix)', pos: [45.9049, 6.8395], img: IMG.jungfrau,
    pitch: 26.5, incl: 2, extraAdult: 9, adult: 0, tax: 0.6, dog: 1, dogFree: 1, elec: 7, maxDogs: 9, opens: '2026-12-15', status: 'ok', verdict: 'Recomendado · invierno desde el 15–17/12',
    toGrindelwald: '', toInterlaken: '',
    pros: ['Forfait 26,50 €/noche: parcela + vehículo + 2 personas', 'Luz 6 A: 7 € · 10 A: 11 €', 'Tasa 0,60 €/adulto · 1 perro gratis, el 2.º 1 €/día', 'Aseos calefactados con agua caliente incluida, sala de secado', 'Lavadora 6 € · secadora 3,80 €', 'Tarjeta de huésped con descuentos en el valle', 'Bus del valle muy cerca: no hace falta mover la furgo'],
    cons: ['La web dice «abierto desde el 15/12» y la tarifa de invierno empieza el 17/12: confirmad la fecha de llegada'],
    tel: '+33 4 50 53 15 84', mail: 'les2glaciers@gmail.com', web: 'https://www.les2glaciers.com/', estimate: '26,50 € (2 pers.) + luz 7 € + tasa 2×0,60 € + 2.º perro 1 €' },
  // ── Suiza · Interlaken ── fuentes: camping-lodge.com (Alpenblick), campinginterlaken.ch, campingberneroberland.ch
  { id: 'alpenblick', short: 'Interlaken', elev: 565, region: 'jungfrau', country: 'CH', name: 'Camping Alpenblick', town: 'Unterseen (Interlaken)', pos: [46.6862, 7.8384], img: IMG.thun,
    pitch: 32.3, adult: 0, tax: 2.8, dog: 5, elec: 0, maxDogs: 2, opens: '2026-01-01', status: 'warn', verdict: 'Abierto en invierno · precio por confirmar',
    toGrindelwald: '35 min en coche · tren desde Interlaken Ost', toInterlaken: '5 min',
    pros: ['Abierto todo el año con self check-in (recepción sin personal desde el 25/10)', 'Aseos y duchas calefactados', 'Hasta 2 perros por parcela, con correa', 'Lavadora y secadora · vaciado de químico', 'Reserva online'],
    cons: ['No publica tarifa de invierno: «Comfort» desde 32,30 CHF/noche (tarifa general); el resto es estimación', 'La parcela «Classic» no está disponible en invierno', 'Para reservar el mismo día no hay reserva online'],
    tel: '+41 33 822 77 57', mail: 'info@camping-alpenblick.ch', web: 'https://campinglodge.934hospitality.com/availability?property=4', estimate: 'Comfort desde 32,30 CHF + tasa y perros estimados' },
  // ── Italia · Valle de Aosta (Monte Rosa) ── fuentes: areacamperchampoluc.com, lovevda.it, campercontact
  { id: 'champoluc', short: 'Champoluc', elev: 1568, region: 'monterosa', country: 'IT', cur: 'EUR', name: 'Area Camper Champoluc', town: 'Champoluc (Val d’Ayas)', pos: [45.8266, 7.7164], img: IMG.jungfrau,
    pitch: 20, adult: 0, tax: 0, dog: 0, elec: 0, maxDogs: 9, opens: '2026-01-01', status: 'ok', verdict: 'Recomendado · abierta todo el año',
    toGrindelwald: '', toInterlaken: '',
    pros: ['20 €/24 h con luz (6 A) y tasa turística incluidas', 'Duchas calientes de pago (≈1 € por 1,5 min: llevad monedas)', 'Lavadora de pago · carga y descarga', 'Agua y descarga funcionando incluso a −5 °C (opiniones)', 'Bus lanzadera gratuito en temporada alta', 'Admite perros'],
    cons: ['No se aceptan reservas: llegad pronto el 24/12'],
    tel: '+39 351 603 2632', mail: 'info@areacamperchampoluc.com', web: 'https://www.areacamperchampoluc.com', estimate: '20 € todo incluido' },
  { id: 'tschaval', short: 'Gressoney', elev: 1825, region: 'monterosa', country: 'IT', cur: 'EUR', name: 'Area Camper Tschaval', town: 'Gressoney-La-Trinité (Staffal)', pos: [45.8561, 7.8138], img: IMG.jungfrau,
    pitch: 12, adult: 0, tax: 0, vehicleTax: 1.5, dog: 0, elec: 3, maxDogs: 9, opens: '2026-01-01', status: 'warn', verdict: 'Muy barata pero SIN duchas',
    toGrindelwald: '', toInterlaken: '',
    pros: ['12 €/24 h + luz 3 € (3 A) + tasa 1,50 €/vehículo', 'Abierta todo el año y siempre despejada de nieve', 'A 1.825 m, a pie de remontes', 'Locales calefactados · admite perros'],
    cons: ['NO tiene duchas (lo dice la propia web del área)', 'En pleno invierno el vaciado puede no funcionar', 'Luz de solo 3 A (650 W)', 'Sin reservas'],
    tel: '+39 347 846 6336', mail: 'area.camper.tschaval@gmail.com', web: 'https://www.sostatschaval.altervista.org/joomla/', estimate: '12 € + 3 € luz + 1,50 € tasa' },
  { id: 'grandassaly', short: 'La Thuile', elev: 1441, region: 'lathuile', country: 'IT', cur: 'EUR', name: 'Area Camper Grand Assaly (ex Azzurra)', town: 'La Thuile (Villaret)', pos: [45.7186, 6.9525], img: IMG.jungfrau,
    pitch: 22, adult: 0, tax: 0, dog: 1, elec: 0, maxDogs: 9, opens: '2026-01-01', status: 'warn', verdict: 'Confirmar que sigue abierta',
    toGrindelwald: '', toInterlaken: '',
    pros: ['22 €/24 h · perros 1 €/día', 'Duchas con agua caliente', '75 plazas, con recepción', 'A ≈400 m del teleférico; Courmayeur cerca'],
    cons: ['La página de Facebook de «Azzurra» anunció su último día de actividad; el registro regional la sigue dando abierta como «Grand Assaly». Llamad antes de ir', 'Precio de luz y tasa no publicados'],
    tel: '+39 333 137 2961', mail: 'areacampergrandassaly@gmail.com', web: 'https://www.lovevda.it/it/banca-dati/22/aree-di-sosta/la-thuile/area-di-sosta-camper-azzurra-localita-villaret/9000935', estimate: '22 € + perros' },
];
export const DISCARDED = { name: 'Camping Eigernordwand (Grindelwald)', why: 'No admite perros (lo dice su web) y en invierno abre el 18/12.', web: 'https://www.camping-eigernordwand.ch/' };

/* ─────────────── Remontes, forfaits, festivos ─────────────── */
export const LIFTS = {
  kleine: { name: 'Kleine Scheidegg', from: '2026-11-28', to: '2027-04-25' },
  mannlichen: { name: 'Männlichen', from: '2026-12-12', to: '2027-04-04' },
  first: { name: 'Grindelwald-First', from: '2026-12-19', to: '2027-03-29' },
  murren: { name: 'Mürren-Schilthorn', from: '2026-11-21', to: '2027-05-02' },
};
export const HIGH_SEASON = ['2026-12-19', '2027-01-03'];
export const SKIPASS = { low: { 0.5: 62, 1: 79, 2: 156, 3: 232, 4: 299, 5: 354 }, high: { 0.5: 65, 1: 83, 2: 164, 3: 244, 4: 314, 5: 372 } };
export const WINTER_PASS_CHF = 61, SLED_CHF = 55, SITTER_CHF_H = 20, VIGNETTE_CHF = 40, CRITAIR_EUR = 5, CCP_CARD_EUR = 5;
export const HOLIDAYS = { // cantón de Berna
  '2026-12-24': { name: 'Nochebuena', kind: 'half', note: 'Tiendas cierran 16–17 h' },
  '2026-12-25': { name: 'Navidad', kind: 'closed', note: 'Festivo: casi todo cerrado' },
  '2026-12-26': { name: 'San Esteban', kind: 'closed', note: 'Festivo en Berna: casi todo cerrado' },
  '2026-12-31': { name: 'Nochevieja', kind: 'half', note: 'Cierre temprano' },
  '2027-01-01': { name: 'Año Nuevo', kind: 'closed', note: 'Festivo' },
  '2027-01-02': { name: 'Berchtoldstag', kind: 'closed', note: 'Festivo en Berna' },
};

/* ─────────────── Actividades (pool del planificador) ─────────────── */
// lift: remonte que debe estar abierto · dogs: apto perros · type: ski|hike|valley|rest|shop|town
export const ACTIVITIES = [
  { id: 'ski-first', type: 'ski', name: 'Esquí en First', lift: 'first', dogs: false, img: IMG.bachalpsee, cost: 'Forfait',
    how: 'Telecabina Firstbahn desde Grindelwald pueblo.', text: 'Pistas soleadas y variadas sobre Grindelwald. Quien no esquíe puede subir con los perros a Bachalpsee.' },
  { id: 'ski-kleine', type: 'ski', name: 'Esquí Kleine Scheidegg – Männlichen – Lauberhorn', lift: 'kleine', dogs: false, img: IMG.kleine, cost: 'Forfait',
    how: 'Tren desde Lauterbrunnen o Grindelwald Grund (incluido en el forfait).', text: 'El gran dominio bajo el Eiger. La pista del Lauberhorn es la de la Copa del Mundo.' },
  { id: 'ski-murren', type: 'ski', name: 'Esquí Mürren – Schilthorn', lift: 'murren', dogs: false, img: IMG.murren, cost: 'Forfait',
    how: 'Teleférico/tren desde Lauterbrunnen o Stechelberg.', text: 'Lado tranquilo del valle de Lauterbrunnen, con vistas al Eiger, Mönch y Jungfrau.' },
  { id: 'hike-bachalp', type: 'hike', name: 'First → Bachalpsee', lift: 'first', dogs: true, km: 3.3, time: '≈1 h ida', up: '+152 m', level: 'Fácil', img: IMG.bachalpsee, pos: P.bachalpsee, cost: 'Pase invernal o billete; perros gratis en Firstbahn',
    how: 'Firstbahn a First y sendero invernal pisado.', text: 'El lago helado con Schreckhorn y Wetterhorn de fondo. La ruta clásica.', crit: 'Solo si la telecabina y el sendero están abiertos.' },
  { id: 'hike-mannlichen', type: 'hike', name: 'Männlichen → Kleine Scheidegg', lift: 'mannlichen', dogs: true, km: 4.5, time: '≈1 h 30', up: 'Casi llano', level: 'Fácil', img: IMG.kleine, pos: P.mannlichen, cost: 'Pase invernal; telecabina Männlichen: preguntar tarifa perro',
    how: 'Telecabina de Männlichen desde Grindelwald Terminal; bajada en tren (perros gratis).', text: 'Eiger, Mönch y Jungfrau delante todo el camino.', crit: 'Viento y hielo; solo sendero invernal señalizado.' },
  { id: 'hike-murren', type: 'hike', name: 'Grütschalp → Mürren', lift: null, dogs: true, km: 4.3, time: '≈1 h 15', up: 'Suave', level: 'Fácil', img: IMG.murren, pos: P.grutschalp, cost: 'Tren Lauterbrunnen–Mürren (perros gratis)',
    how: 'Funicular de Lauterbrunnen a Grütschalp y a pie a Mürren (pueblo sin coches).', text: 'Paseo panorámico frente a la gran pared del valle.', crit: 'Confirmar que el sendero está pisado.' },
  { id: 'valley-stechelberg', type: 'valley', name: 'Lauterbrunnen → Stechelberg (valle)', lift: null, dogs: true, km: 6, time: '≈1 h 30', up: 'Llano', level: 'Fácil · trail', img: IMG.lauterbrunnen, pos: P.stechelberg, cost: 'Gratis',
    how: 'Desde el camping a pie.', text: 'Fondo del valle entre cascadas. Ideal para rodaje de trail o paseo largo con los perros.', crit: 'Hielo en las zonas de sombra.' },
  { id: 'hike-bort', type: 'hike', name: 'First → Waldspitz → Bort', lift: 'first', dogs: true, km: 7, time: '≈3 h', up: 'Bajada', level: 'Media', img: IMG.grindelwald, pos: P.bort, cost: 'Pase invernal',
    how: 'Firstbahn arriba y bajada a pie por senderos invernales.', text: 'Bajada larga y variada con vistas al valle de Grindelwald.', crit: 'No confundir el sendero con las pistas.' },
  { id: 'hike-faulhorn', type: 'hike', name: 'First → Faulhorn → Bussalp', lift: 'first', dogs: true, km: 10, time: '≈4 h 35', up: '+585 / −959 m · cima 2.681 m', level: 'Exigente', img: IMG.faulhorn, pos: P.faulhorn, cost: 'Pase invernal + bus de vuelta',
    how: 'Firstbahn, subida al Faulhorn y bajada a Bussalp; bus a Grindelwald.', text: 'La gran travesía invernal de la zona. Desde el Faulhorn sale el trineo Big Pintenfritz (sin perros).', crit: 'Solo con la ruta oficial abierta. Nunca con viento fuerte, niebla o nevada reciente.' },
  { id: 'valley-aar', type: 'valley', name: 'Rodaje por la orilla del Aar (Interlaken)', lift: null, dogs: true, km: 8, time: '≈1 h', up: 'Llano', level: 'Fácil · trail', img: IMG.interlaken, pos: P.interlaken, cost: 'Gratis',
    how: '20 min en coche desde Lauterbrunnen.', text: 'Llano entre los lagos de Thun y Brienz. Combina con compras en Lidl/Aldi.', crit: '' },
  { id: 'sled-pintenfritz', type: 'hike', name: 'Trineo Big Pintenfritz (Faulhorn → Grindelwald)', lift: 'first', dogs: false, img: IMG.faulhorn, cost: '55 CHF/adulto',
    how: 'Billete específico; se sube a pie al Faulhorn.', text: 'Uno de los descensos en trineo más largos de Europa.', crit: 'Sin perros.' },
  { id: 'town-grindelwald', type: 'town', name: 'Paseo por Grindelwald + piscina', lift: null, dogs: true, img: IMG.grindelwald, cost: 'Piscina con descuento si tienes tarjeta de huésped',
    how: '25 min en coche o tren.', text: 'Pueblo, Sportzentrum (piscina cubierta, rocódromo, pista de hielo) y ducha caliente.', crit: '' },
  { id: 'shop', type: 'shop', name: 'Compra grande + lavandería + vaciado', lift: null, dogs: true, img: IMG.interlaken, cost: '≈150–250 € compra',
    how: 'Lidl Matten y Aldi Interlaken (20 min).', text: 'Compra para los días festivos, una colada, vaciar grises y llenar agua.', crit: '' },
  { id: 'rest', type: 'rest', name: 'Día tranquilo', lift: null, dogs: true, img: IMG.lauterbrunnen, cost: 'Gratis',
    how: '—', text: 'Paseo corto por el valle, secar material, descansar.', crit: '' },
];

/* ─────────────── Explicaciones (se abren al pinchar un término) ─────────────── */
export const INFO = {
  'Lötschberg': { t: 'Tren con coches del Lötschberg', d: 'Lanzadera ferroviaria que lleva coches y autocaravanas por el túnel entre Kandersteg (Oberland bernés) y Goppenstein (Valais). Sale cada 30 minutos, tarda 15 y no se reserva. Cuesta 28 CHF de lunes a jueves y 31 CHF de viernes a domingo y festivos; comprado online, 2 CHF menos. Es la forma de ir de Martigny o el Valais a Interlaken sin dar la vuelta por Lausana y Berna, y sin usar autopista.', l: [['Precios BLS', 'https://www.bls.ch/en/fahren/autoverlad/preise-und-tickets']] },
  'Gran San Bernardo': { t: 'Túnel del Gran San Bernardo', d: 'Une Martigny (Suiza) con Aosta (Italia). En clase A2 (hasta 2 m de altura y menos de 1,30 m en el eje delantero): 33,50 € o 32 CHF por trayecto, 53,50 € ida y vuelta. Si en el eje delantero mide 1,30 m o más, pasa a clase B1 (50 CHF). El puerto de montaña está cerrado en invierno, pero el túnel está abierto.', l: [['letunnel.com', 'https://www.letunnel.com/']] },
  'túnel del Mont Blanc': { t: 'Túnel del Mont Blanc', d: 'Une Chamonix con Courmayeur. Clase 1 (≤2 m y ≤3,5 t): 55,50 € de Francia a Italia y 56,40 € de Italia a Francia (2026). Ida y vuelta: 69,20 €, válida hasta el 7.º día. Hay cierres nocturnos programados: consultad el calendario de ATMB.', l: [['Tarifas ATMB', 'https://www.atmb.com/telepeage-tarifs/les-tarifs-au-tunnel-du-mont-blanc-pour-les-vehicules-legers/'], ['Cierres', 'https://www.atmb.com/info-trafic-a40-rn205/calendrier-des-nuits-de-fermeture-sur-la40-et-la-rn205/']] },
  'Montgenèvre': { t: 'Puerto de Montgenèvre (1.850 m)', d: 'Paso fronterizo gratuito entre Oulx (Italia) y Briançon (Francia). Es carretera nacional y se mantiene abierta en invierno, pero puede cerrar o exigir cadenas durante temporales. Miradlo el mismo día.', l: [['Bison Futé (Francia)', 'https://www.bison-fute.gouv.fr/'], ['ANAS (Italia)', 'https://www.stradeanas.it/']] },
  'Forclaz': { t: 'Col de la Forclaz', d: 'Carretera Chamonix–Martigny por Trient. El TCS la da como abierta todo el año. El vecino Col des Montets puede cerrar por riesgo de aludes: mirad el estado antes de salir.', l: [['Puertos TCS', 'https://www.tcs.ch/de/tools/verkehrsinfo-verkehrslage/paesse-in-der-schweiz.php']] },
  'invierno en Italia': { t: 'Equipamiento de invierno en el Valle de Aosta', d: 'En las carreteras estatales del Valle de Aosta, la ordenanza de ANAS de la temporada pasada obligó a llevar neumáticos de invierno o cadenas del 15/10 al 15/04, antes que en el resto de Italia (15/11). Con 3PMSF y cadenas a bordo vais en regla; confirmad la ordenanza de 2026/27.', l: [['ANAS', 'https://www.stradeanas.it/']] },
  'carte d’hôte': { t: 'Carte d’hôte de Chamonix', d: 'El camping os la da al llegar. Incluye descuentos en el valle, por ejemplo en el centro deportivo Richard Bozon.', l: [['chamonix.com', 'https://www.chamonix.com/']] },
  'e-viñeta': { t: 'Viñeta suiza (e-vignette)', d: 'Pegatina digital obligatoria para circular por autopistas y autovías suizas. Va asociada a tu matrícula; no hay nada que pegar. Cuesta 40 CHF y la de cada año vale del 1 de diciembre del año anterior al 31 de enero del siguiente (la «2027» vale del 1/12/2026 al 31/01/2028). Sin ella, multa de 200 CHF. Cómprala solo en la web oficial: las intermediarias cobran recargo.', l: [['Comprar en via.admin.ch', 'https://via.admin.ch/shop/']] },
  "Crit'Air": { t: "Crit'Air (pegatina medioambiental francesa)", d: "Pegatina que clasifica tu vehículo por emisiones. Solo se exige en zonas de bajas emisiones (ZFE, como Lyon) o cuando una prefectura activa restricciones por contaminación. Vuestra Transit diésel Euro 6 es Crit'Air 2. Precio oficial ≈3,80 € + envío (≈5 € a España) y tarda semanas. Webs que cobran 20–30 € son intermediarias.", l: [['Pedir en certificat-air.gouv.fr', 'https://www.certificat-air.gouv.fr/'], ['Ayuda para vehículos extranjeros', 'https://www.service-public.gouv.fr/particuliers/vosdroits/R59473']] },
  'ZFE': { t: 'ZFE · Zona de bajas emisiones', d: "Zonas urbanas francesas con acceso restringido según la pegatina Crit'Air. La ruta rodea Lyon por la A46 para no entrar.", l: [] },
  '3PMSF': { t: '3PMSF · neumático de invierno homologado', d: 'Marca de una montaña con tres picos y un copo de nieve en el flanco del neumático. Es la única que vale como neumático de invierno en Francia desde noviembre de 2024. La marca M+S sola ya no sirve.', l: [] },
  'M+S': { t: 'M+S', d: '«Mud and Snow»: marca antigua de neumático de barro y nieve. Desde noviembre de 2024 ya no cuenta como equipamiento de invierno en Francia si no lleva también el 3PMSF.', l: [] },
  'Loi Montagne': { t: 'Ley de montaña francesa (Loi Montagne)', d: 'Del 1 de noviembre al 31 de marzo, en los municipios de montaña señalizados (Puy-de-Dôme, Allier, Creuse, Ain, Haute-Savoie… por donde pasáis) hay que llevar 4 neumáticos 3PMSF o cadenas/fundas en el vehículo. Si aparece la señal B26 «équipements spéciaux obligatoires», hay que montarlas. Multa: 135 €.', l: [['Service-Public', 'https://www.service-public.gouv.fr/particuliers/actualites/A14389']] },
  'RCEA': { t: 'RCEA · Route Centre-Europe Atlantique', d: 'Eje de nacionales francesas (N10, N141, N145, N79) que cruza el centro de Francia de oeste a este. Casi todo a 2×2 carriles y gratis, pero con límites de 80–110 km/h y muchos camiones.', l: [] },
  'A79': { t: 'A79 · autopista sin barreras', d: 'Tramo Montmarault–Digoin con peaje en «flujo libre»: no hay cabinas, unas cámaras leen la matrícula. Hay que pagar online en 72 h o registrar la matrícula antes. Si no, multa de 90 € (hasta 375 €).', l: [['Pagar en aliae.com', 'https://www.aliae.com/en/home.html']] },
  'clase de peaje': { t: 'Clase de peaje en Francia', d: 'Depende de la altura total del vehículo con todo montado (cofre, techo cerrado). Hasta 2,00 m = clase 1. Más de 2 m = clase 2, ≈50 % más cara. Si la cabina te clasifica mal, pulsa el botón de asistencia y no des marcha atrás.', l: [] },
  'Camping-Car Park': { t: 'Camping-Car Park', d: 'Red francesa de áreas de autocaravanas con barrera. Se entra con su tarjeta (5 €, válida de por vida), que se saca en el terminal de la entrada o en su app. Se paga por 24 h.', l: [['campingcarpark.com', 'https://www.campingcarpark.com/']] },
  'park4night': { t: 'park4night', d: 'App y web colaborativa con miles de áreas, campings y aparcamientos para autocaravanas, con opiniones y fotos de otros viajeros. Útil para ver cómo está un sitio en invierno.', l: [['park4night.com', 'https://park4night.com/']] },
  'tarjeta de huésped': { t: 'Tarjeta de huésped (Gästekarte)', d: 'Te la da gratis el camping al pagar la tasa turística. En Grindelwald incluye bus y bus de esquí y 50 % en el Sportzentrum. En Interlaken incluye el transporte público local hasta el 31/12/2026 (desde 2027 ya no).', l: [] },
  'forfait': { t: 'Forfait (pase de esquí)', d: 'Billete de remontes. El de la Jungfrau Ski Region cubre Kleine Scheidegg–Männlichen, First y Mürren-Schilthorn, e incluye los trenes desde Interlaken Ost dentro de la región. Temporada alta: 19/12/2026–03/01/2027; en temporada baja los fines de semana se cobra tarifa alta.', l: [['Comprar online', 'https://www.jungfrau.ch/de-ch/jungfrau-ski-region/skipass-kaufen/']] },
  'pase invernal': { t: 'Pase de senderismo invernal y trineo', d: 'Para quien no esquía: remontes y trenes para hacer las rutas invernales y bajar en trineo. Desde 61 CHF/día.', l: [['Jungfrau', 'https://www.jungfrau.ch/de-ch/jungfrau-ski-region/']] },
  'Jungfraubahnen': { t: 'Jungfraubahnen', d: 'La empresa de trenes y telecabinas de la región (Interlaken–Lauterbrunnen–Grindelwald–Kleine Scheidegg, Mürren, Firstbahn). En casi todos sus trenes los perros viajan gratis; solo Eigergletscher–Jungfraujoch cobra 30 CHF por perro.', l: [['FAQ', 'https://www.jungfrau.ch/de-ch/faq/']] },
  'SBB': { t: 'SBB', d: 'Ferrocarriles federales suizos. Fuera de la región Jungfrau, un perro necesita pase de día (25 CHF).', l: [['SBB perros', 'https://www.sbb.ch/de/abos-billette/billette-schweiz/hunde.html']] },
  'SLF': { t: 'SLF · Instituto suizo de nieve y aludes', d: 'Publica cada día a las 17 h (y actualiza a las 8 h) el boletín de peligro de aludes por zonas, en una escala de 1 (débil) a 5 (muy fuerte). Nivel 3 = «notable»: ya es peligroso fuera de pistas.', l: [['White Risk', 'https://whiterisk.ch/en/conditions']] },
  'ARVA': { t: 'ARVA / DVA', d: 'Aparato emisor-receptor para buscar personas sepultadas por un alud. Se lleva siempre junto con pala y sonda fuera de pistas. Hay que saber usarlo.', l: [] },
  'Foehn': { t: 'Foehn', d: 'Viento cálido y seco del sur que baja por los valles del norte de los Alpes. Dispara la temperatura, cierra remontes y empeora la nieve.', l: [] },
  'Rega': { t: 'Rega', d: 'Servicio suizo de rescate aéreo. Teléfono 1414 (desde móvil extranjero +41 333 333 333). Su app envía tu posición. Un rescate puede costar miles de francos si tu seguro no lo cubre.', l: [['rega.ch', 'https://www.rega.ch/en/']] },
  'TSE': { t: 'Tarjeta Sanitaria Europea', d: 'Te da asistencia sanitaria pública en Suiza como a un residente. NO cubre rescate en montaña ni repatriación. Gratis.', l: [['Seguridad Social', 'https://sede.seg-social.gob.es/']] },
  'licencia FCDME': { t: 'Licencia de montaña (Federación Cántabra)', d: 'Seguro federativo que cubre rescate en montaña. Para Suiza hace falta la modalidad con Europa (en la FCDME, modalidad C = B + Europa, ≈150 €/adulto en 2026). Comprobad que la de 2026 cubre hasta el 31/12 y la actividad exacta (pista, fuera de pista, travesía).', l: [['fcdme.es', 'https://www.fcdme.es/']] },
  'aduana suiza': { t: 'Aduana suiza: qué se puede entrar', d: 'Suiza no está en la unión aduanera de la UE. Por persona y día: compras hasta 150 CHF en total; carne 1 kg; mantequilla/nata 1 kg; vino/cerveza 5 l; licores 1 l; aceites 5 kg. Si te pasas, declara con la app QuickZoll o por el canal rojo.', l: [['BAZG', 'https://www.bazg.admin.ch/']] },
  'QuickZoll': { t: 'QuickZoll', d: 'App oficial de la aduana suiza para declarar y pagar online si superas las franquicias.', l: [] },
  'BLV': { t: 'BLV · Oficina veterinaria suiza', d: 'Fija los requisitos para entrar con perros: microchip, vacuna antirrábica válida (la primera al menos 21 días antes) y pasaporte europeo. Prohibidos perros con orejas o cola cortadas.', l: [['Requisitos', 'https://www.blv.admin.ch/en/travelling-with-dogs-cats-and-ferrets']] },
  'Robidog': { t: 'Robidog', d: 'Papeleras verdes con bolsas para excrementos de perro. Están por todas partes en Suiza.', l: [] },
  'zona de fauna': { t: 'Zonas de reposo de fauna (Wildruhezonen)', d: 'Áreas protegidas en invierno para rebecos, ciervos y urogallos. Perros siempre con correa y prohibido salir de los caminos marcados. Grindelwald tiene una zona protegida cantonal.', l: [['Mapa oficial', 'https://natur-freizeit.ch/karte']] },
  'cable CEE': { t: 'Cable CEE (enchufe azul de camping)', d: 'Enchufe redondo azul de 3 pines que usan los campings europeos. Lleva un cable de 20–25 m. El enchufe doméstico suizo (tipo J) es distinto del Schuko español: lleva adaptador por si acaso.', l: [] },
  'grises': { t: 'Aguas grises', d: 'Agua usada del fregadero y la ducha. Solo se vacía en puntos autorizados. En Suiza está prohibido vaciarla en la calle o en el campo. Con −10 °C la salida se congela: cubo debajo o un poco de anticongelante en el depósito.', l: [] },
  'amperaje': { t: 'Amperaje de la parcela', d: 'Límite de corriente de la toma del camping, a menudo 4–6 A en invierno (≈900–1.300 W). Si pasas de ahí salta el diferencial. No encendáis a la vez calefacción eléctrica, hervidor o inducción.', l: [] },
  'V-16': { t: 'Baliza V-16', d: 'Luz de emergencia conectada obligatoria en España. En Francia y Suiza llevad también triángulos y chalecos: un agente puede no reconocerla.', l: [['DGT', 'https://www.dgt.es/']] },
  'Bardonnex': { t: 'Aduana de Bardonnex', d: 'Paso fronterizo Francia–Suiza en la autopista al sur de Ginebra. Atasco habitual de trabajadores de 5:30 a 9:30: crúzala a media mañana o mediodía.', l: [] },
  'Grauholz': { t: 'Área de Grauholz (A1, Berna)', d: 'Área de servicio en ambos sentidos con vaciado de grises y agua gratis. Buena parada técnica al llegar y al irte.', l: [['park4night', 'https://park4night.com/en/place/6056']] },
  'Bison Futé': { t: 'Bison Futé', d: 'Servicio oficial francés de previsión de tráfico (días rojos y negros, cortes, nieve).', l: [['bison-fute.gouv.fr', 'https://www.bison-fute.gouv.fr/']] },
  'Sportzentrum': { t: 'Sportzentrum Grindelwald', d: 'Polideportivo con piscina cubierta, rocódromo y pista de hielo. Duchas con la entrada. 50 % con la tarjeta de huésped de Grindelwald. Tel. +41 33 854 12 30.', l: [['Web', 'https://www.sportzentrum-grindelwald.ch/']] },
  'Tierklinik': { t: 'Tierklinik Interlaken (veterinario 24 h)', d: 'General-Guisanstrasse 39, 3800 Interlaken. Urgencias 24 h: +41 33 822 21 41. Llama antes de ir.', l: [] },
  'petsitting24': { t: 'petsitting24', d: 'Plataforma suiza de cuidadores de perros. En Grindelwald desde ≈10–30 CHF/h. Resérvalo con antelación si esquiáis los dos.', l: [['Cuidadores en Grindelwald', 'https://petsitting24.ch/en/dog-sitter/be/grindelwald']] },
  'Big Pintenfritz': { t: 'Big Pintenfritz', d: 'Bajada en trineo de ≈15 km desde el Faulhorn hasta Grindelwald. Billete específico 55 CHF/adulto. Sin perros.', l: [] },
};

/* ─────────────── Tareas de preparación (plazo relativo a la salida) ─────────────── */
// daysBefore: cuántos días antes de salir, como tarde · notBefore: fecha mínima
export const PREP = [
  { id: 'camping', days: 25, cat: 'Reservas', t: 'Pedir disponibilidad y precio total por escrito a cada camping (perros, luz, grises en invierno)', go: 'dormir' },
  { id: 'alt', days: 25, cat: 'Reservas', t: 'Tener una alternativa en cada zona por si alguno no confirma (en «Dónde dormir» hay varias)' , go: 'dormir'},
  { id: 'critair', days: 21, cat: 'Vehículo', t: "Pedir la pegatina Crit'Air (tarda en llegar a España)", term: "Crit'Air" },
  { id: 'dogs', days: 21, cat: 'Perros', t: 'Revisar pasaportes de los perros: chip legible y antirrábica en vigor', term: 'BLV' },
  { id: 'insurance', days: 20, cat: 'Seguros', t: 'Seguro de montaña con Europa para los dos (licencia o seguro de viaje con rescate)', term: 'licencia FCDME' },
  { id: 'tse', days: 20, cat: 'Seguros', t: 'Tarjeta Sanitaria Europea en vigor para cada uno', term: 'TSE' },
  { id: 'assist', days: 18, cat: 'Seguros', t: 'Confirmar con la aseguradora de la furgo: asistencia en carretera y grúa en Francia/Suiza' },
  { id: 'height', days: 18, cat: 'Vehículo', t: 'Medir la altura real de la furgo con todo montado', term: 'clase de peaje' },
  { id: 'tyres', days: 15, cat: 'Vehículo', t: 'Neumáticos 3PMSF revisados + cadenas o fundas de tu medida (y practicar montarlas)', term: '3PMSF' },
  { id: 'v16', days: 12, cat: 'Vehículo', t: 'Baliza V-16, triángulos y chalecos a bordo', term: 'V-16' },
  { id: 'vignette', days: 7, notBefore: '2026-12-01', cat: 'Trámites', t: 'Comprar la viñeta suiza (40 CHF) en la web oficial', term: 'e-viñeta' },
  { id: 'ccp', days: 7, cat: 'Trámites', t: 'Sacar la tarjeta Camping-Car Park en su app (5 €)', term: 'Camping-Car Park' },
  { id: 'heater', days: 7, cat: 'Vehículo', t: 'Probar a fondo calefacción, carga a 230 V, agua y vaciado de grises (electroválvula)', term: 'grises' },
  { id: 'gas', days: 7, cat: 'Vehículo', t: 'Bombona llena: las españolas no se rellenan en Suiza' },
  { id: 'sitter', days: 7, cat: 'Perros', t: 'Reservar cuidador si vais a esquiar los dos el mismo día', term: 'petsitting24' },
  { id: 'campitinerary', days: 20, cat: 'Reservas', t: 'Escribir a Les Deux Glaciers (llegada 18/12) y a Alpenblick (reserva obligatoria, mínimo 2 noches en invierno, self check-in) con 2 perros', go: 'dormir' },
  { id: 'grandassaly', days: 10, cat: 'Reservas', t: 'Si pensáis ir a La Thuile: llamar a Grand Assaly para confirmar que sigue abierta (+39 333 137 2961)' },
  { id: 'frontaxle', days: 10, cat: 'Vehículo', t: 'Medir la altura en el eje delantero: menos de 1,30 m = 33,50 € en el Gran San Bernardo; si no, 50 CHF', term: 'Gran San Bernardo' },
  { id: 'coins', days: 2, cat: 'Salida', t: 'Monedas de 1 € para las duchas y el agua caliente de las áreas italianas' },
  { id: 'loetschberg', days: 2, cat: 'Trámites', t: 'Comprar online los billetes del tren del Lötschberg (2 CHF menos cada uno)', term: 'Lötschberg' },
  { id: 'skipass', days: 3, cat: 'Trámites', t: 'Comprar forfaits online (mismo precio, sin colas), solo con la apertura confirmada', term: 'forfait' },
  { id: 'offline', days: 2, cat: 'Salida', t: 'Mapas offline, reservas y documentación descargados en ambos móviles' },
  { id: 'apps', days: 2, cat: 'Salida', t: 'Instalar apps: Rega, MeteoSwiss, White Risk, SBB, park4night, Camping-Car Park', term: 'Rega' },
  { id: 'weather', days: 1, cat: 'Salida', t: 'Mirar meteo, aludes, tráfico en Francia y el acceso a Lauterbrunnen', go: 'tiempo' },
  { id: 'firstnight', days: 1, cat: 'Salida', t: 'Confirmar la primera parada y el horario de recepción del camping suizo' },
  { id: 'fuel', days: 0, cat: 'Salida', t: 'Depósito lleno en España, agua y comida para una etapa extra' },
  { id: 'check', days: 0, cat: 'Salida', t: 'Batería, refrigerante, limpiaparabrisas −20 °C y presión de neumáticos' },
];

/* ─────────────── Vida diaria ─────────────── */
export const SHOPS = [
  { name: 'Lidl Matten', addr: 'Wychelstrasse 1, 3800 Matten bei Interlaken', pos: P.lidlMatten, note: 'El más barato. El parking cierra con barrera fuera del horario.', tier: '€' },
  { name: 'Aldi Interlaken', addr: 'Interlaken Ost, junto a Landi (Mittleres Moos)', pos: P.aldiInterlaken, note: 'Barato. Al lado, Landi: bricolaje, gas y comida de perros.', tier: '€' },
  { name: 'Coop Grindelwald', addr: 'Dorfstrasse 101 (edificio Eiger+)', pos: P.coopGrindelwald, note: 'Abre los 7 días en temporada. Parking de pago.', tier: '€€€' },
  { name: 'Coop Lauterbrunnen / tienda del camping', addr: 'Lauterbrunnen', pos: P.coopLauterbrunnen, note: 'Pan y básicos.', tier: '€€€' },
];
export const CONTACTS = [
  ['Tierklinik Interlaken · veterinario 24 h', 'General-Guisanstrasse 39, 3800 Interlaken', '+41 33 822 21 41'],
  ['Camping Jungfrau', 'Weid 406, 3822 Lauterbrunnen', '+41 33 856 20 10'],
  ['Camping Gletscherdorf', 'Locherbodenstrasse 29, 3818 Grindelwald', '+41 33 853 14 29'],
  ['Camping Manor Farm', 'Seestrasse 201, 3800 Unterseen', '+41 33 822 22 64'],
  ['Stellplatz Hof Rubi', 'Grindelwald', '+41 79 434 43 85'],
  ['Sportzentrum Grindelwald', 'Grindelwald', '+41 33 854 12 30'],
];

/* ═══════════════ Otras zonas de montaña de Suiza ═══════════════
   Datos estables (situación, altitud, web oficial, acceso). Lo que cambia cada día
   (campings abiertos, remontes, tiempo, aludes) se consulta en vivo por coordenadas. */
export const REGIONS = [
  { id: 'chamonix', country: 'FR', side: 'valais', name: 'Chamonix – Mont Blanc (Francia)', short: 'Chamonix', canton: 'Alta Saboya', pos: [45.9237, 6.8694], elev: 1035, top: 3842, web: 'https://www.chamonix.com/',
    note: 'Compra grande antes de subir, en Sallanches o Passy (súper más baratos), y antes de entrar en Suiza. Piscina Richard Bozon: 6,80 € adulto; desde el 19/12 abre de 12 a 19:30 entre semana y de 14 a 19:30 el fin de semana; cerrada el 25/12 (chamonix.com).' },
  { id: 'monterosa', country: 'IT', side: 'valais', name: 'Monte Rosa – Champoluc y Gressoney (Italia)', short: 'Monte Rosa', canton: 'Valle de Aosta', pos: [45.8266, 7.7164], elev: 1568, top: 3275, web: 'https://www.monterosaski.com/',
    note: 'Italia es la parte más barata del viaje: áreas de autocaravanas de 12–20 €. Llevad monedas de 1 € para las duchas.' },
  { id: 'lathuile', country: 'IT', side: 'valais', name: 'La Thuile – cara italiana del Mont Blanc', short: 'La Thuile', canton: 'Valle de Aosta', pos: [45.7136, 6.9519], elev: 1441, top: 2641, web: 'https://www.lathuile.it/' },
  { id: 'jungfrau', country: 'CH', side: 'bern', name: 'Jungfrau e Interlaken (Grindelwald · Lauterbrunnen · Wengen · Mürren)', short: 'Jungfrau', canton: 'Berna', pos: [46.6242, 8.0414], elev: 1034, top: 2970, web: 'https://www.jungfrau.ch/', detailed: true },
  { id: 'zermatt', side: 'valais', name: 'Zermatt – Matterhorn', short: 'Zermatt', canton: 'Valais', pos: [46.0207, 7.7491], elev: 1608, top: 3883, web: 'https://www.zermatt.ch/',
    camper: 'Pueblo sin coches: la camper se queda en Täsch (aparcamiento y tren lanzadera a Zermatt).', camperPos: [46.0684, 7.7778] },
  { id: 'saasfee', side: 'valais', name: 'Saas-Fee – Saastal', short: 'Saas-Fee', canton: 'Valais', pos: [46.1083, 7.9286], elev: 1800, top: 3500, web: 'https://www.saas-fee.ch/',
    camper: 'Saas-Fee es sin coches: aparcamiento a la entrada del pueblo. Saas-Grund y Saas-Almagell sí tienen acceso.' },
  { id: 'aletsch', side: 'valais', name: 'Aletsch Arena (Riederalp · Bettmeralp · Fiesch)', short: 'Aletsch', canton: 'Valais', pos: [46.3556, 8.0447], elev: 760, top: 2869, web: 'https://www.aletscharena.ch/',
    camper: 'Los pueblos de arriba son sin coches: se sube en teleférico desde el valle (Mörel, Betten, Fiesch).' },
  { id: 'verbier', side: 'valais', name: 'Verbier – 4 Vallées', short: 'Verbier', canton: 'Valais', pos: [46.0961, 7.2286], elev: 1500, top: 3330, web: 'https://www.verbier.ch/' },
  { id: 'cransmontana', side: 'valais', name: 'Crans-Montana', short: 'Crans-Montana', canton: 'Valais', pos: [46.3072, 7.4806], elev: 1500, top: 3000, web: 'https://www.crans-montana.ch/' },
  { id: 'anniviers', side: 'valais', name: "Val d'Anniviers (Grimentz · Zinal)", short: 'Anniviers', canton: 'Valais', pos: [46.1797, 7.5761], elev: 1570, top: 2900, web: 'https://www.valdanniviers.ch/' },
  { id: 'leukerbad', side: 'valais', name: 'Leukerbad (esquí y termas)', short: 'Leukerbad', canton: 'Valais', pos: [46.38, 7.6267], elev: 1411, top: 2700, web: 'https://www.leukerbad.ch/' },
  { id: 'champery', side: 'valais', name: 'Champéry – Portes du Soleil', short: 'Champéry', canton: 'Valais', pos: [46.1775, 6.8697], elev: 1050, top: 2400, web: 'https://www.champery.ch/', note: 'La zona más cercana a Ginebra.' },
  { id: 'adelboden', side: 'bern', name: 'Adelboden – Lenk', short: 'Adelboden', canton: 'Berna', pos: [46.492, 7.56], elev: 1350, top: 2360, web: 'https://www.adelboden.ch/' },
  { id: 'kandersteg', side: 'bern', name: 'Kandersteg (senderismo invernal y fondo)', short: 'Kandersteg', canton: 'Berna', pos: [46.4947, 7.6731], elev: 1176, top: 2000, web: 'https://www.kandersteg.ch/' },
  { id: 'gstaad', side: 'bern', name: 'Gstaad – Glacier 3000', short: 'Gstaad', canton: 'Berna', pos: [46.475, 7.2861], elev: 1050, top: 3000, web: 'https://www.gstaad.ch/' },
  { id: 'engelberg', side: 'bern', name: 'Engelberg – Titlis', short: 'Engelberg', canton: 'Obwalden', pos: [46.8197, 8.4036], elev: 1000, top: 3020, web: 'https://www.engelberg.ch/' },
  { id: 'andermatt', name: 'Andermatt – Sedrun', short: 'Andermatt', canton: 'Uri', pos: [46.6356, 8.5939], elev: 1447, top: 2960, web: 'https://www.andermatt.ch/',
    camper: 'Varios puertos alpinos de la zona cierran en invierno: comprobad el acceso antes de ir.' },
  { id: 'laax', name: 'Flims – Laax', short: 'Laax', canton: 'Grisones', pos: [46.8095, 9.258], elev: 1100, top: 3018, web: 'https://www.flimslaax.com/' },
  { id: 'arosa', name: 'Arosa – Lenzerheide', short: 'Arosa', canton: 'Grisones', pos: [46.7783, 9.6794], elev: 1775, top: 2865, web: 'https://arosalenzerheide.swiss/' },
  { id: 'davos', name: 'Davos – Klosters', short: 'Davos', canton: 'Grisones', pos: [46.8027, 9.836], elev: 1560, top: 2840, web: 'https://www.davos.ch/' },
  { id: 'engadin', name: 'Engadina – St. Moritz', short: 'St. Moritz', canton: 'Grisones', pos: [46.4983, 9.839], elev: 1822, top: 3300, web: 'https://www.engadin.ch/',
    note: 'Lejos de Ginebra: desde España compensa entrar a Suiza por Basilea.' },
];
/* Pasos con coste entre zonas (verificado 26/11/2026) */
export const CROSSINGS = {
  loetschberg: { name: 'Tren con coches del Lötschberg (Kandersteg ↔ Goppenstein)', chfWeek: 28, chfWeekend: 31, web: 'https://www.bls.ch/en/fahren/autoverlad/preise-und-tickets',
    note: 'Cada 30 min, 15 min de trayecto, sin reserva. 28 CHF de lunes a jueves y 31 CHF de viernes a domingo y festivos (≤3,5 t o autocaravana ≤5 t). Comprado online, 2 CHF menos.' },
  gsb: { name: 'Túnel del Gran San Bernardo (Suiza ↔ Italia)', eur: 33.5, web: 'https://www.letunnel.com/',
    note: 'Clase A2, para vehículos de hasta 2 m de altura total y menos de 1,30 m en el eje delantero: 33,50 € o 32 CHF por trayecto, 53,50 € ida y vuelta (tarifa desde el 01/02/2026). Si en el eje delantero mide 1,30 m o más, pasa a clase B1: 50 CHF. El puerto está cerrado en invierno; el túnel, abierto.' },
  montblanc: { name: 'Túnel del Mont Blanc', eurFrIt: 55.5, eurItFr: 56.4, web: 'https://www.atmb.com/telepeage-tarifs/les-tarifs-au-tunnel-du-mont-blanc-pour-les-vehicules-legers/',
    note: 'Clase 1 (≤2 m y ≤3,5 t): 55,50 € Francia→Italia y 56,40 € Italia→Francia (tarifa 2026). Ida y vuelta: 69,20 €, con la vuelta antes de las 24 h del 7.º día. Comprobad los cierres nocturnos en atmb.com.' },
};
export const GENERIC_SEASON = { from: '2026-12-05', to: '2027-04-11' };
export const SKI_DAY_OTHER_CHF = 80;
