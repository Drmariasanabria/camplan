// Datos en vivo de APIs públicas con CORS. Todas con caché en sessionStorage.

async function cached(key, ttlMin, fn) {
  const k = 'live:' + key, hit = JSON.parse(sessionStorage.getItem(k) || 'null');
  if (hit && Date.now() - hit.t < ttlMin * 60000) return hit.v;
  const v = await fn();
  try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), v })); } catch {}
  return v;
}
const j = async (url, opts) => { const r = await fetch(url, opts); if (!r.ok) throw new Error(r.status + ' ' + url); return r.json(); };

/* Cambio EUR→CHF (BCE vía Frankfurter) */
export const eurChf = () => cached('fx', 240, async () => {
  const d = await j('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=CHF');
  return { rate: d.rates.CHF, date: d.date };
}).catch(() => ({ rate: 0.93, date: 'fallback' }));

/* Meteo multimodelo (Open-Meteo) */
export const MODELS = [
  { id: 'meteoswiss_icon_ch2', name: 'MeteoSwiss ICON-CH2', color: '#ff5ea8' },
  { id: 'ecmwf_ifs025', name: 'ECMWF IFS', color: '#5ee7ff' },
  { id: 'icon_seamless', name: 'DWD ICON', color: '#ffc65c' },
  { id: 'gfs_seamless', name: 'NOAA GFS', color: '#3ee6a1' },
  { id: 'meteofrance_seamless', name: 'Météo-France', color: '#7c5cff' },
];
export const weather = (lat, lon, elev) => cached(`wx:${lat},${lon},${elev}`, 30, () => j(
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}${elev ? '&elevation=' + elev : ''}` +
  `&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,weather_code,sunrise,sunset` +
  `&models=${MODELS.map(m => m.id).join(',')}&forecast_days=10&timezone=Europe%2FZurich`));
export const snowNow = (lat, lon, elev) => cached(`snow:${lat},${lon},${elev}`, 30, () => j(
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&elevation=${elev}` +
  `&current=temperature_2m,snow_depth,wind_speed_10m,weather_code&hourly=snow_depth,freezing_level_height&forecast_days=7&timezone=Europe%2FZurich`));
// Climatología del mismo periodo del año pasado (para hacerse a la idea en diciembre)
export const lastYear = (lat, lon, elev) => cached(`hist:${lat},${lon}`, 1440, () => j(
  `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&elevation=${elev}&start_date=2025-12-16&end_date=2025-12-29&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,snow_depth_max&timezone=Europe%2FZurich`));

export const WMO = c => ({0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',56:'🌧️',57:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',66:'🌨️',67:'🌨️',71:'🌨️',73:'❄️',75:'❄️',77:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',85:'🌨️',86:'❄️',95:'⛈️',96:'⛈️',99:'⛈️'}[c] || '·');

/* Boletín de aludes SLF (GeoJSON oficial) */
export const slf = () => cached('slf', 60, () => j('https://aws.slf.ch/api/bulletin/caaml/en/geojson'));

/* Gasóleo Francia (flux instantané, gouv) – más barato en radio */
export const fuelFR = (lat, lon, km = 20, type = 'diesel') => cached(`ffr:${lat},${lon},${km},${type}`, 60, async () => {
  const f = type === 'diesel' ? 'gazole' : 'e10';
  const where = encodeURIComponent(`within_distance(geom, geom'POINT(${lon} ${lat})', ${km}km) and ${f}_prix is not null`);
  const d = await j(`https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?select=id,adresse,ville,${f}_prix,${f}_maj,geom&where=${where}&order_by=${f}_prix&limit=5`);
  return d.results.map(r => ({ price: r[f + '_prix'], town: r.ville, addr: r.adresse, lat: r.geom.lat, lon: r.geom.lon, updated: r[f + '_maj'] }));
});

/* Gasóleo España (Ministerio, REST) – por provincia */
export const fuelES = (prov, type = 'diesel') => cached(`fes:${prov}:${type}`, 60, async () => {
  const F = type === 'diesel' ? 'Precio Gasoleo A' : 'Precio Gasolina 95 E5';
  const d = await j(`https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/${prov}`);
  const n = s => parseFloat(String(s).replace(',', '.'));
  return d.ListaEESSPrecio.filter(e => e[F]).map(e => ({
    name: e['Rótulo'], addr: e['Dirección'], town: e['Localidad'], price: n(e[F]),
    lat: n(e['Latitud']), lon: n(e['Longitud (WGS84)']), hours: e['Horario'],
  })).sort((a, b) => a.price - b.price);
});

/* Rutas (OSRM público) */
// El servidor demo falla con muchos puntos de paso: se pide tramo a tramo y se une.
const leg = (a, b) => cached(`osrm1:${a.join(',')};${b.join(',')}`, 1440, async () => {
  const d = await j(`https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=simplified&geometries=geojson`);
  const r = d.routes[0];
  return { km: r.distance / 1000, h: r.duration / 3600, coords: r.geometry.coordinates };
});
export const route = async (pts) => {
  const legs = [];
  for (let i = 0; i < pts.length - 1; i++) legs.push(await leg(pts[i], pts[i + 1]));
  return { km: legs.reduce((a, l) => a + l.km, 0), h: legs.reduce((a, l) => a + l.h, 0), geo: { type: 'LineString', coordinates: legs.flatMap(l => l.coords) }, legs };
};

/* POIs de OpenStreetMap (Overpass) con espejos */
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
export const overpass = (q) => cached('ovp:' + q, 720, async () => {
  for (const u of OVERPASS) {
    try { return await j(u, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: AbortSignal.timeout(20000) }); } catch {}
  }
  throw new Error('Overpass sin respuesta');
});

/* Fotos reales de Wikimedia Commons */
export const commons = (q, n = 8) => cached(`cm:${q}:${n}`, 1440, async () => {
  const d = await j(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q + ' filetype:bitmap')}&gsrlimit=${n * 2}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200`);
  return Object.values(d.query?.pages || {})
    .filter(p => p.imageinfo?.[0]?.thumburl && !/painting|drawing|map|logo|svg|plan|coat/i.test(p.title))
    .slice(0, n)
    .map(p => ({ src: p.imageinfo[0].thumburl, page: p.imageinfo[0].descriptionurl, title: p.title.replace(/^File:|\.\w+$/g, ''), author: (p.imageinfo[0].extmetadata?.Artist?.value || '').replace(/<[^>]+>/g, '') }));
});

/* Buscar un lugar (Photon / OpenStreetMap) */
export const geocode = (q) => cached('geo:' + q, 1440, async () => {
  const d = await j(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=en`);
  return d.features.map(f => ({ name: [f.properties.name, f.properties.city || f.properties.county, f.properties.country].filter(Boolean).join(', '), pos: [f.geometry.coordinates[1], f.geometry.coordinates[0]] }));
});

/* GET JSON con caché */
export const cachedJSON = (url, ttlMin = 30) => cached(url, ttlMin, () => j(url));
