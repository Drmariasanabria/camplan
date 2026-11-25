// Datos del destino Suiza · Grindelwald (dic 2026). Todo lo editable vive aquí.
// Fuente base: «Grindelwald 2026 Guía PRO» + «Plan viaje Grindelwald dic 2026» (revisados 22/11/2026).

const T = p => { const n = p.split('/').pop(); return `https://upload.wikimedia.org/wikipedia/commons/thumb/${p}/1920px-${n}`; };
export const IMG = {
  grindelwald: T('b/ba/Grindelwald_View_02.jpg'),
  lauterbrunnen: T('2/29/1_lauterbrunnen_valley_wengen_2022.jpg'),
  eiger: T('f/fc/North_face.jpg'),
  jungfrau: T('d/d7/Jungfrau03.jpg'),
  murren: T('e/eb/1_M%C3%BCrren_2022.jpg'),
  kleine: T('7/76/Eiger%2C_M%C3%B6nch_and_Jungfrau.jpg'),
  bachalpsee: T('8/8f/Bachalpsee_reflection.jpg'),
  interlaken: T('1/14/Goldswil-Viadukt_Panorama_mit_Interlaken_im_Hintergrund_2.jpg'),
  faulhorn: T('e/e9/Faulhorn.jpeg'),
  mannlichen: T('8/8e/LWM1.JPG'),
  thun: T('6/65/Aerial_image_of_Lake_Thun_%28view_from_the_east%29.jpg'),
  geneva: T('a/ab/Geneve_2005_001_Ork.ch.jpg'),
  bern: T('4/45/Bundeshaus_Bern_2009%2C_Flooffy.jpg'),
  jungfraujoch: T('0/0e/Sphinx_et_Jungfrau_-_img_06980.jpg'),
  wengen: T('c/c1/1_wengen_2012.jpg'),
  bourg: T('e/ed/Monast%C3%A8re_royal_de_Brou_%28%C3%A9glise%29_%281%29.JPG'),
  limoges: T('f/f2/Centre-ville_et_champ_de_Juillet.JPG'),
  collie: T('e/e4/Border_Collie_600.jpg'),
};

export const TRIP = {
  start: '2026-12-16T06:00:00+01:00', end: '2026-12-29',
  people: 2, dogs: 2, dogNames: ['West', 'Collie nº2'],
  van: 'Ford Transit Custom Trail L1H1 (2021) · diésel Euro 6 · ~5 m',
  eurChfFallback: 0.93,
};

// [lat, lon]
export const P = {
  torrelavega: [43.3494, -4.0479], irun: [43.3390, -1.7890], bordeaux: [44.8378, -0.5792],
  ussel: [45.5476, 2.284219], thiers: [45.871103, 3.48427], chaptelat: [45.93167, 1.26593],
  limoges: [45.8336, 1.2611], montlucon: [46.3401, 2.6026], digoin: [46.4811, 3.9839], macon: [46.3069, 4.8287],
  bourg: [46.2091, 5.2390], saintamour: [46.437, 5.342], lyonA46: [45.86, 4.93], bardonnex: [46.1466, 6.1003],
  geneve: [46.2044, 6.1432], grauholz: [46.9960, 7.4970], bern: [46.948, 7.4474], interlaken: [46.6863, 7.8632],
  campingJungfrau: [46.5913, 7.9104], gletscherdorf: [46.6200, 8.0480], manorFarm: [46.6855, 7.8217], hofRubi: [46.6270, 8.0300],
  lauterbrunnen: [46.5935, 7.9091], grindelwald: [46.6242, 8.0414], first: [46.6597, 8.0545], kleine: [46.5853, 7.9614],
  mannlichen: [46.6125, 7.9417], murren: [46.559, 7.892], grutschalp: [46.5743, 7.886], bachalpsee: [46.6697, 8.0228],
  faulhorn: [46.6767, 8.0153], bussalp: [46.6527, 8.005], bort: [46.6425, 8.0447], stechelberg: [46.545, 7.902],
  lidlMatten: [46.6765, 7.8735], aldiInterlaken: [46.6905, 7.8710], coopGrindelwald: [46.6245, 8.0400], coopLauterbrunnen: [46.5935, 7.9090],
  tierklinik: [46.6853, 7.8580], sportzentrum: [46.6236, 8.0374], laundryGrindelwald: [46.6240, 8.0390],
};

/* ---------------- RUTAS ---------------- */
export const ROUTES = {
  A: {
    name: 'A · Autopista', color: '#5ee7ff', days: 2, swissNights: 10, buffer: true,
    pts: [P.torrelavega, P.irun, P.bordeaux, P.ussel, P.lyonA46, P.bardonnex, P.bern, P.interlaken, P.campingJungfrau],
    tollsClass1: 220, tollsClass2: 330, frNights: 2, frNightCost: 13.1,
    desc: 'A-8/AP-8 → Irún → A63 → A89 (Ussel) → A46/A42/A40 → Ginebra → A1/A6/A8 → Lauterbrunnen. La referencia: menos incertidumbre y conserva el día colchón del 29.',
    stages: [
      ['Mié 16', 'Torrelavega → Ussel', '≈760 km', 'Camping-Car Park Ussel'],
      ['Jue 17', 'Ussel → Lyon (A46) → Ginebra → Berna → Lauterbrunnen', '≈650 km', 'Camping Jungfrau'],
      ['18–26', 'Región Jungfrau', '—', 'Camping Jungfrau · 9 noches más'],
      ['Dom 27', 'Lauterbrunnen → Ginebra → Ussel (o Thiers)', '≈650 km', 'Ussel / Thiers'],
      ['Lun 28', 'Ussel → Torrelavega', '≈760 km', 'Casa'],
      ['Mar 29', 'Día colchón', '—', '—'],
    ],
  },
  B: {
    name: 'B · Mixta RCEA (ahorro)', color: '#ff5ea8', days: 3, swissNights: 9, buffer: false,
    pts: [P.torrelavega, P.irun, P.bordeaux, P.chaptelat, P.montlucon, P.digoin, P.macon, P.bourg, P.bardonnex, P.bern, P.interlaken, P.campingJungfrau],
    tollsClass1: 110, tollsClass2: 165, frNights: 4, frNightCost: 10,
    desc: 'Irún → A63 → Burdeos → N10/N141 → Limoges → N145 → A79 (flujo libre, pagar en aliae.com en 72 h) → N79 → Mâcon → Bourg → A40 → Ginebra. Ahorra peajes a cambio de ≈2 h más por trayecto y sin día colchón.',
    stages: [
      ['Mié 16', 'Torrelavega → Burdeos → Limoges', '≈700 km · 8 h', 'CCP Chaptelat (≈17,32 €)'],
      ['Jue 17', 'Limoges → Montluçon → Digoin → Mâcon → Bourg', '≈400 km · 5 h', 'Área Bourg (gratis) o CCP Saint-Amour (12,44 €)'],
      ['Vie 18', 'Bourg → Ginebra → Lauterbrunnen', '≈330 km · 4 h', 'Camping Jungfrau (9 noches)'],
      ['Dom 27', 'Lauterbrunnen → Bourg', '≈330 km', 'Bourg / Saint-Amour'],
      ['Lun 28', 'Bourg → Limoges', '≈400 km', 'Chaptelat'],
      ['Mar 29', 'Limoges → Torrelavega', '≈700 km', 'Casa'],
    ],
  },
  C: {
    name: 'C · Híbrida (ida mixta, vuelta autopista)', color: '#ffc65c', days: 2.5, swissNights: 9, buffer: true,
    pts: [P.torrelavega, P.irun, P.bordeaux, P.chaptelat, P.montlucon, P.digoin, P.macon, P.bourg, P.bardonnex, P.bern, P.interlaken, P.campingJungfrau],
    tollsClass1: 165, tollsClass2: 248, frNights: 3, frNightCost: 13,
    desc: 'El punto medio que sugiere el plan: ida tranquila por la RCEA (3 días) y vuelta rápida por autopista (2 días) para recuperar el día colchón del 29.',
    stages: [
      ['16–18', 'Ida por RCEA en 3 etapas (Chaptelat, Bourg)', '≈1.430 km', '2 áreas Francia'],
      ['18–26', 'Región Jungfrau', '—', 'Camping Jungfrau · 9 noches'],
      ['27–28', 'Vuelta por autopista vía Ussel', '≈1.410 km', 'Ussel'],
      ['29', 'Día colchón', '—', '—'],
    ],
  },
};

/* ---------------- PERNOCTAS ---------------- */
export const STOPS_FR = [
  { id: 'ussel', name: 'Camping-Car Park Ussel', sub: 'Lac de Ponty · Corrèze', pos: P.ussel, price: '≈13,10 €/24 h + tarjeta CCP 5 € (de por vida)', status: 'ok',
    notes: 'Barrera y videovigilancia. En invierno solo vehículos autónomos. Duchas/sanitarios solo 01/06–31/08: en diciembre SIN ducha. Con helada el agua puede estar cortada: llegad con el depósito lleno.',
    p4n: 'https://park4night.com/en/search?lat=45.5476&lng=2.2842&z=14', web: 'https://www.campingcarpark.com/', route: 'A' },
  { id: 'thiers', name: 'Camping-Car Park Thiers', sub: 'Puy-de-Dôme · ≈170 km más cerca de Suiza', pos: P.thiers, price: '≈13,5 €/24 h · 10 plazas', status: 'ok',
    notes: 'Acceso fácil desde la A89; camping «Iloa» anexo. Útil para acortar la vuelta del 27. No dar por seguro el agua con heladas.',
    p4n: 'https://park4night.com/en/search?lat=45.8711&lng=3.4843&z=14', web: 'https://www.campingcarpark.com/', route: 'A' },
  { id: 'chaptelat', name: 'Camping-Car Park Chaptelat', sub: 'Norte de Limoges, junto a la A20', pos: P.chaptelat, price: '≈17,32 €/24 h con tasa', status: 'warn',
    notes: 'Sanitarios abiertos todo 2026 (confirmar ducha en invierno). Solo vehículos autónomos.',
    p4n: 'https://park4night.com/en/search?lat=45.9317&lng=1.2659&z=14', web: 'https://www.campingcarpark.com/', route: 'B' },
  { id: 'bourg', name: 'Área municipal Bourg-en-Bresse', sub: '27 rue du Pré Neuf, junto a la piscina', pos: P.bourg, price: 'Gratis · abierta todo el año', status: 'warn', rating: 2.97,
    notes: 'Lidl al lado. Opiniones flojas (2,97/5): ruido nocturno. El grifo no funciona en invierno; vaciado de grises gratis 24 h. No equiparar a camping vigilado.',
    p4n: 'https://park4night.com/en/place/28798', web: 'https://park4night.com/en/place/28798', route: 'B' },
  { id: 'saintamour', name: 'Camping-Car Park Saint-Amour', sub: 'Jura · ≈25 km al norte de Bourg', pos: P.saintamour, price: '12,44 €/noche · electricidad, agua, vaciado', status: 'ok',
    notes: 'Más tranquila que Bourg. Abierta todo el año.',
    p4n: 'https://park4night.com/en/search?lat=46.437&lng=5.342&z=13', web: 'https://www.campingcarpark.com/', route: 'B' },
];

export const CAMPINGS_CH = [
  { id: 'jungfrau', name: 'Camping Jungfrau', sub: 'Weid 406, 3822 Lauterbrunnen', pos: P.campingJungfrau, img: IMG.lauterbrunnen, decision: 'Primera opción', status: 'ok',
    dogs: 'Sí · 5 CHF/perro/día', winter: 'Abre el 13/12', priceCHF: 80,
    price: 'Parcela invierno ≈43–46 CHF + 9,90 CHF/adulto + tasa 2,80 CHF + perros → ≈75–85 CHF/noche',
    pros: ['5 estrellas, duchas calientes', 'Vaciado y agua gratis', 'Intercambio de gas (Campingaz)', 'Ducha para perros, tienda, lavandería', 'Tren a 15 min andando'],
    tel: '+41 33 856 20 10', mail: 'info@campingjungfrau.swiss', web: 'https://www.camping-lodge.com/de-ch/jungfrau/winter' },
  { id: 'gletscherdorf', name: 'Camping Gletscherdorf', sub: 'Locherbodenstrasse 29, 3818 Grindelwald', pos: P.gletscherdorf, img: IMG.grindelwald, decision: 'Solo si confirman', status: 'warn',
    dogs: 'Sí según ADAC/ANWB', winter: 'Apertura publicada 18/12', priceCHF: 60,
    price: '≈56–65 €/noche (2 adultos + electricidad)',
    pros: ['Ubicación ideal para First y Männlichen', 'Gästekarte con bus/skibús gratis', 'Llegada solo por el este (Mettenbergstrasse)', '⚠️ Una ficha dice que en invierno solo hay parcelas de temporada'],
    tel: '+41 33 853 14 29', mail: 'info@gletscherdorf.ch', web: 'https://www.gletscherdorf.ch/' },
  { id: 'manor', name: 'Camping Manor Farm', sub: 'Seestrasse 201, 3800 Unterseen (Interlaken)', pos: P.manorFarm, img: IMG.thun, decision: 'No presupuestar sin excepción escrita', status: 'bad',
    dogs: 'Tarifa 2027: «dog (max. 1)»', winter: 'Todo el año', priceCHF: 55,
    price: '12,50 CHF/adulto + tasa 1,80 + luz 5 CHF/día + parcela',
    pros: ['La más barata con todos los servicios', '≈35 min en coche de Grindelwald', 'Recepción invierno 9–10 h y 16–17 h', 'Gästekarte Interlaken: transporte local incluido hasta 31/12/2026'],
    tel: '+41 33 822 22 64', mail: 'info@manorfarm.ch', web: 'https://www.manorfarm.ch/' },
  { id: 'rubi', name: 'Stellplatz Hof Rubi', sub: 'Granja en Grindelwald · 8 plazas', pos: P.hofRubi, img: IMG.eiger, decision: 'Preguntar', status: 'warn',
    dogs: 'Preguntar', winter: 'Preguntar', priceCHF: 50,
    price: '50 CHF/noche 2 personas, ducha incluida',
    pros: ['Sin vaciado de grises', 'Ambiente granja', 'Ubicación aproximada en el mapa'],
    tel: '+41 79 434 43 85', mail: '', web: 'https://www.google.com/maps/search/?api=1&query=Hof+Rubi+Grindelwald' },
  { id: 'eiger', name: 'Camping Eigernordwand', sub: 'Grindelwald', pos: [46.6215, 8.0278], img: IMG.eiger, decision: 'Descartado', status: 'bad',
    dogs: 'NO admite perros', winter: 'Desde 18/12', priceCHF: 0, price: '—',
    pros: ['Aparece en todas las guías pero su web lo dice expresamente: sin perros'],
    tel: '', mail: '', web: 'https://www.camping-eigernordwand.ch/' },
];

export const EMAILS = [
  { id: 'em1', to: 'info@campingjungfrau.swiss', title: 'E-mail · Camping Jungfrau', subject: 'Winter pitch enquiry | 17–27 December 2026 | campervan + 2 dogs',
    body: `Hello,

We are planning a stay from 17 to 27 December 2026 with two adults and two Border Collies (approximately 20 kg each), travelling in a Ford Transit Custom campervan (around 5 m).

Could you please confirm availability for a winter pitch, whether both dogs are accepted, the total price including tourist tax and electricity (and the amperage of the pitch), and whether freshwater, grey-water disposal and hot showers remain available in winter? We may arrive in the evening of the 17th — is late check-in possible?

Many thanks in advance.` },
  { id: 'em2', to: 'info@gletscherdorf.ch', title: 'E-mail · Gletscherdorf / Manor Farm', subject: 'Two dogs and winter touring pitch – 18–27 December 2026',
    body: `Hello,

Could you confirm whether a short-stay campervan pitch is available from 18 to 27 December 2026 for two adults and two dogs? We are aware that some winter or tariff conditions may limit touring pitches or the number of dogs.

Please confirm this in writing, together with the full price and the winter facilities.

Kind regards.` },
];

/* ---------------- TRÁMITES ---------------- */
export const PAPERS = [
  { id: 'vin', icon: '🛣️', title: 'Viñeta suiza 2027 (e-vignette)', when: 'Desde 1/12/2026', cost: '40 CHF', status: 'todo',
    text: 'Digital, vinculada a la matrícula. Válida 1/12/2026 – 31/01/2028. Sin viñeta: multa 200 CHF. Solo en el portal oficial: los intermediarios cobran recargo.',
    links: [['Comprar (oficial via.admin.ch)', 'https://via.admin.ch/shop/'], ['Info BAZG', 'https://www.bazg.admin.ch/']] },
  { id: 'crit', icon: '🌫️', title: "Crit'Air (Francia)", when: 'YA · tarda en llegar', cost: '≈3,8 € + envío (≈5 €)', status: 'todo',
    text: "Vuestra Transit diésel Euro 6 → Crit'Air 2. No es universal: obligatoria en ZFE (Lyon) y en episodios de «circulation différenciée». La ruta evita Lyon por la A46 pero desvíos/episodios pueden aplicar. Desconfía de webs que cobran 20–30 €.",
    links: [['Pedir (certificat-air.gouv.fr)', 'https://www.certificat-air.gouv.fr/'], ['Ayuda vehículos extranjeros', 'https://www.service-public.gouv.fr/particuliers/vosdroits/R59473']] },
  { id: 'tse', icon: '🏥', title: 'Tarjeta Sanitaria Europea (x2)', when: 'Esta semana', cost: 'Gratis', status: 'todo',
    text: 'Vale en Suiza. NO cubre rescate ni repatriación.',
    links: [['Solicitar TSE (Seguridad Social)', 'https://sede.seg-social.gob.es/']] },
  { id: 'seg', icon: '🚁', title: 'Seguro de montaña con Europa (rescate)', when: 'Esta semana', cost: '≈150 €/adulto (FCDME mod. C)', status: 'todo',
    text: 'Rescate en helicóptero en Suiza = miles de CHF. La licencia básica no vale en Suiza: en la Federación Cántabra la modalidad C es «B + Europa». Comprobar que la de 2026 cubre hasta el 31/12 y la modalidad exacta (pista / fuera de pista / travesía).',
    links: [['FCDME licencias', 'https://www.fcdme.es/'], ['Rega (patronazgo)', 'https://www.rega.ch/en/']] },
  { id: 'perros', icon: '🐕', title: 'Pasaportes UE de los perros', when: 'Esta semana', cost: '—', status: 'todo',
    text: 'Microchip legible + antirrábica en vigor (si es primovacunación, ≥21 días antes de cruzar) + pasaporte europeo. Máx. 5 animales/persona. Prohibidos perros con orejas/cola amputadas. No hay que registrarlos en AMICUS ni pagar impuesto canino.',
    links: [['BLV requisitos', 'https://www.blv.admin.ch/en/travelling-with-dogs-cats-and-ferrets'], ['Comprobador oficial', 'https://www.egov.swiss/en/import-export/']] },
  { id: 'asist', icon: '🧰', title: 'Asistencia en carretera Europa', when: 'Esta semana', cost: 'Según póliza', status: 'todo',
    text: 'Carta verde no obligatoria para Francia/Suiza, pero confirmad grúa en montaña y cobertura en Suiza con la aseguradora.',
    links: [] },
  { id: 'altura', icon: '📏', title: 'Medir altura real de la furgo', when: 'Esta semana', cost: 'Clase 1 vs clase 2 ≈ +50 % peajes', status: 'todo',
    text: 'Con todo montado (cofre de esquís, techo cerrado). ≤2,00 m = peaje clase 1; >2 m = clase 2 (A +≈110 €, B +≈55 €). Si el arco te clasifica mal, pulsa asistencia y no des marcha atrás.',
    links: [['Clases de peaje (Sanef)', 'https://www.sanef.com/'], ['Calcular con ViaMichelin', 'https://www.viamichelin.es/']] },
  { id: 'v16', icon: '🔶', title: 'Baliza V-16 + triángulos + chalecos', when: 'Antes de salir', cost: '≈30–50 €', status: 'todo',
    text: 'V-16 obligatoria en España. Triángulos y chalecos recomendados en Francia y Suiza (un agente puede no reconocer la V-16).',
    links: [['DGT', 'https://www.dgt.es/']] },
  { id: 'a79', icon: '💳', title: 'A79 flujo libre (solo ruta B/C)', when: 'En las 72 h tras pasar', cost: 'Pocos €', status: 'todo',
    text: 'Sin barreras ≠ gratis. Pagad o registrad la matrícula; si no, multa 90 € (hasta 375 €).',
    links: [['aliae.com', 'https://www.aliae.com/en/home.html']] },
  { id: 'ccp', icon: '🅿️', title: 'Tarjeta Camping-Car Park', when: 'Antes de salir (app)', cost: '5 € de por vida', status: 'todo',
    text: 'Necesaria para Ussel, Thiers, Chaptelat, Saint-Amour. Se saca en el terminal o en la app.',
    links: [['Camping-Car Park', 'https://www.campingcarpark.com/']] },
  { id: 'forfait', icon: '🎿', title: 'Forfaits Jungfrau (online)', when: 'Desde 1/12, sin prisa', cost: 'Desde 83 CHF/día alta', status: 'todo',
    text: 'Mismo precio online y sin colas. No comprar sin evaluar apertura real y cancelación.',
    links: [['Jungfrau Ski Region', 'https://www.jungfrau.ch/de-ch/jungfrau-ski-region/skipass-kaufen/']] },
  { id: 'quickzoll', icon: '🛃', title: 'App QuickZoll (aduana suiza)', when: 'Solo si superáis franquicias', cost: 'Gratis', status: 'todo',
    text: 'Para declarar online si os pasáis de 1 kg carne / 5 l vino por persona o 150 CHF/persona/día.',
    links: [['BAZG', 'https://www.bazg.admin.ch/']] },
];

export const CUSTOMS = [
  ['Valor total de compras', '150 CHF', 'IVA suizo sobre el total'],
  ['Carne y preparados (excepto caza)', '1 kg', '17 CHF/kg (hasta 10 kg)'],
  ['Mantequilla / nata', '1 kg o 1 l', '16 CHF/kg'],
  ['Bebidas ≤18 % (vino, cerveza)', '5 l', '2 CHF/l'],
  ['Bebidas >18 %', '1 l', 'Según tarifa'],
  ['Aceites y grasas', '5 kg/l', '2 CHF/kg'],
];

/* ---------------- METEO ---------------- */
export const WX_POINTS = [
  { id: 'lb', name: 'Lauterbrunnen (camping)', pos: P.lauterbrunnen, elev: 800, img: IMG.lauterbrunnen },
  { id: 'gw', name: 'Grindelwald pueblo', pos: P.grindelwald, elev: 1034, img: IMG.grindelwald },
  { id: 'first', name: 'First', pos: P.first, elev: 2168, img: IMG.bachalpsee },
  { id: 'ks', name: 'Kleine Scheidegg', pos: P.kleine, elev: 2061, img: IMG.kleine },
  { id: 'mu', name: 'Mürren', pos: P.murren, elev: 1638, img: IMG.murren },
  { id: 'fh', name: 'Faulhorn', pos: P.faulhorn, elev: 2681, img: IMG.faulhorn },
];
export const WX_ROUTE = [
  { id: 'r1', name: 'Ussel (A89)', pos: P.ussel, elev: 630 },
  { id: 'r2', name: 'A89 Monts Dômes', pos: [45.78, 2.72], elev: 900 },
  { id: 'r3', name: 'Bourg-en-Bresse', pos: P.bourg, elev: 230 },
  { id: 'r4', name: 'A40 Nantua', pos: [46.15, 5.6], elev: 500 },
  { id: 'r5', name: 'Ginebra (Bardonnex)', pos: P.bardonnex, elev: 450 },
  { id: 'r6', name: 'Berna (A1)', pos: P.bern, elev: 540 },
];
// Microrregiones SLF: 1233 Lauterbrunnen · 1234 Jungfrau-Schilthorn · 1241 Brienz-Interlaken · 1242 Grindelwald · 1243 Schreckhorn
export const SLF_MATCH = /^CH-(1233|1234|1241|1242|1243)$/;

/* ---------------- ACTIVIDADES ---------------- */
export const LIFTS = [
  ['Kleine Scheidegg', '28/11/2026 – 25/04/2027'],
  ['Männlichen', '12/12/2026 – 04/04/2027'],
  ['Grindelwald-First', '19/12/2026 – 29/03/2027'],
  ['Mürren-Schilthorn', '21/11/2026 – 02/05/2027'],
];
export const SKIPASS = [ // [label, baja, alta]
  ['½ día', 62, 65], ['1 día', 79, 83], ['2 días', 156, 164], ['3 días', 232, 244], ['4 días', 299, 314], ['5 días', 354, 372],
];
export const HIKES = [
  { id: 'h1', name: 'First → Bachalpsee', km: 3.3, time: '≈1 h ida', up: '+152 m', level: 'Fácil', dogs: 'Sí (Firstbahn gratis)', img: IMG.bachalpsee, pos: P.bachalpsee,
    text: 'Clásica, vistas a Schreckhorn y Wetterhorn.', crit: 'Remonte operativo, camino pisado y abierto.' },
  { id: 'h2', name: 'Männlichen → Kleine Scheidegg', km: 4.5, time: '≈1 h 30', up: 'casi llano', level: 'Fácil', dogs: 'Tren gratis · telecabina Männlichen: preguntar', img: IMG.kleine, pos: P.mannlichen,
    text: 'Eiger, Mönch y Jungfrau todo el camino. Bajada en tren a Grindelwald.', crit: 'Solo sendero invernal habilitado; viento y hielo.' },
  { id: 'h3', name: 'Grütschalp → Mürren', km: 4.3, time: '≈1 h 15', up: 'suave', level: 'Fácil', dogs: 'Tren Lauterbrunnen–Mürren gratis', img: IMG.murren, pos: P.grutschalp,
    text: 'Lado Lauterbrunnen, pueblo sin coches.', crit: 'Revisar conexión y condiciones.' },
  { id: 'h4', name: 'Lauterbrunnen → Stechelberg', km: 6, time: '≈1 h 30', up: 'llano', level: 'Valle · trail', dogs: 'Sí', img: IMG.lauterbrunnen, pos: P.stechelberg,
    text: 'Fondo de valle, perfecto para rodaje de trail o paseo largo. Gratis, sin remontes.', crit: 'Hielo en zonas sombrías.' },
  { id: 'h5', name: 'First → Waldspitz → Bort', km: 7, time: '≈3 h', up: 'descendente', level: 'Media', dogs: 'Sí', img: IMG.grindelwald, pos: P.bort,
    text: 'Bajada larga y variada.', crit: 'No confundir tramo señalizado con entorno de pistas.' },
  { id: 'h6', name: 'First → Faulhorn → Bussalp', km: 10, time: '≈4 h 35', up: '+585 / −959 m · 2.681 m', level: 'Exigente', dogs: 'Sí (NO en el trineo)', img: IMG.faulhorn, pos: P.faulhorn,
    text: 'La mejor travesía invernal de la zona. Desde Faulhorn sale el trineo «Big Pintenfritz». Bus de vuelta desde Bussalp.', crit: 'Solo con ruta oficial abierta. No subir con viento fuerte, niebla o nevada reciente.' },
];
export const DAYPLAN = [
  ['Jue 17', 'Llegada, registro, compra pequeña, comprobar servicios', 'Paseo largo de estiramiento'],
  ['Vie 18', 'Rodaje Lauterbrunnen–Stechelberg + visita Grindelwald. Sacar forfaits/pases, boletín aludes', 'Con vosotros todo el día'],
  ['Sáb 19', 'Abre First: esquí en First (si abre según parte). Quien no esquíe: First–Bachalpsee con los perros', 'Firstbahn gratis'],
  ['Dom 20', 'Männlichen–Kleine Scheidegg a pie los dos, bajada en tren', 'Tren gratis; Männlichen: preguntar'],
  ['Lun 21', 'Esquí Kleine Scheidegg–Männlichen–Lauberhorn. Tarde: piscina + ducha Sportzentrum', 'Paseo, siesta con calefacción o cuidador'],
  ['Mar 22', 'Gran travesía First–Faulhorn–Bussalp (solo si está abierta). Opcional trineo Big Pintenfritz', 'Sí (no en el trineo)'],
  ['Mié 23', 'Compras grandes Interlaken (Lidl/Aldi), lavandería, vaciado/llenado, rodaje junto al Aar', 'Sí'],
  ['Jue 24', 'Media jornada de esquí. Nochebuena. Cierre temprano de tiendas', 'Mañana con quien no esquíe'],
  ['Vie 25', 'Navidad: First–Waldspitz–Bort o Bussalp + trineo. Ocio autosuficiente', 'Sí'],
  ['Sáb 26', 'Lado Mürren: Grütschalp–Mürren o último día de esquí. Preparar salida', 'Tren gratis'],
  ['Dom 27', 'Salida 7–8 h. Vaciado/llenado. Ginebra a media mañana', '—'],
];

/* ---------------- VIDA DIARIA ---------------- */
export const SHOPS = [
  { name: 'Lidl Matten', addr: 'Wychelstrasse 1, 3800 Matten b. Interlaken', pos: P.lidlMatten, note: 'El más barato. Parking con barrera fuera de horario.', tier: '€' },
  { name: 'Aldi Suisse Interlaken', addr: 'Interlaken Ost, junto a Landi (Mittleres Moos)', pos: P.aldiInterlaken, note: 'Barato. Landi al lado: bricolaje, gas, comida perros.', tier: '€' },
  { name: 'Coop Grindelwald', addr: 'Dorfstrasse 101 (Eiger+)', pos: P.coopGrindelwald, note: 'En temporada abre 7 días. Parking Eiger+ de pago.', tier: '€€€' },
  { name: 'Coop Lauterbrunnen / tienda camping', addr: 'Lauterbrunnen', pos: P.coopLauterbrunnen, note: 'Pan y básicos.', tier: '€€€' },
];
export const SERVICES = [
  ['Camping Jungfrau', 'Sí', 'Sí', 'Sí, caliente', 'Incluido'],
  ['Manor Farm (Interlaken)', 'Sí', 'Sí', 'Sí', 'Incluido'],
  ['Área Grauholz (A1 Berna, ambos sentidos)', 'Sí', 'Sí', 'No', 'Gratis'],
  ['Sportzentrum Grindelwald (piscina)', '—', '—', 'Sí, con la entrada', '50 % dto. con Gästekarte'],
  ['Camping-Car Park Ussel', 'Si no hiela', 'Sí', 'No en invierno', 'Incluido'],
  ['Área Bourg-en-Bresse', 'No en invierno', 'Sí, 24 h', 'No', 'Gratis'],
];
export const LAUNDRY = [
  ['Camping Jungfrau', 'Lavadoras y secadoras', 'Preguntar en recepción', 'La más cómoda'],
  ['Manor Farm', 'Lavadoras y secadoras', 'Preguntar', ''],
  ['Lauterbrunnen, calle principal (frente al Valley Hostel)', 'Autoservicio', '≈5 CHF lavado + 5 CHF secado', 'Programa corto'],
  ['Grindelwald · Laundry & Game Lounge, Dorfstrasse 85', 'Autoservicio, ciclos cortos', 'Pago con tarjeta', ''],
  ['Francia (ruta)', 'Laveries en parkings de súper', '≈6–10 €/carga', 'Busca «laverie»'],
];

/* ---------------- EMERGENCIAS / CONTACTOS ---------------- */
export const EMERG = [
  { n: '112', t: 'Emergencias generales', d: 'Europeo. En Suiza también 144 (ambulancia) y 117 (policía), 118 (bomberos).' },
  { n: '1414', t: 'REGA · rescate aéreo', d: 'Desde móvil extranjero: +41 333 333 333. Instalad la app Rega (envía posición).' },
  { n: '+41 33 822 21 41', t: 'Tierklinik Interlaken 24 h', d: 'General-Guisanstrasse 39, Interlaken. Llamar antes de ir.' },
  { n: '140', t: 'TCS / asistencia carretera CH', d: 'Averías en Suiza (además de vuestra asistencia).' },
];
export const CONTACTS = [
  ['Camping Jungfrau', 'Weid 406, 3822 Lauterbrunnen', '+41 33 856 20 10', 'info@campingjungfrau.swiss'],
  ['Gletscherdorf', 'Locherbodenstrasse 29, 3818 Grindelwald', '+41 33 853 14 29', 'info@gletscherdorf.ch'],
  ['Manor Farm', 'Seestrasse 201, 3800 Unterseen', '+41 33 822 22 64', 'info@manorfarm.ch'],
  ['Hof Rubi (Stellplatz)', 'Grindelwald', '+41 79 434 43 85', ''],
  ['Tierklinik Interlaken (24 h)', 'General-Guisanstrasse 39, 3800 Interlaken', '+41 33 822 21 41', ''],
  ['Sportzentrum Grindelwald', 'Grindelwald', '+41 33 854 12 30', ''],
];
