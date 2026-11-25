# Roadbook · Grindelwald en camper (dic 2026)

Web estática (HTML + JS modules, sin build). Unifica la *Guía PRO* y el *Plan de viaje* y añade datos en vivo.

## Arrancar en local

```bash
python3 -m http.server 5173
```

Abre http://localhost:5173 (los módulos JS no funcionan abriendo el `index.html` con doble clic).

## Estructura

```
index.html · css/app.css
js/app.js              router, navegación, shell
js/core/fx.js          partículas, sonido WebAudio, fondos en movimiento, animaciones
js/core/live.js        APIs en vivo (meteo, SLF, gasóleo, cambio, rutas, OSM, fotos)
js/core/store.js       guardado local + Firebase (Google login + Firestore)
js/core/ui.js          componentes reutilizables (tablas, checklists, mapas…)
js/firebase-config.js  ← pega aquí tu config de Firebase
destinations/registry.js           lista de destinos
destinations/suiza/data.js         datos del destino: rutas, paradas, campings, actividades, explicaciones
destinations/suiza/engine.js       motor: fechas → etapas, itinerario, plazos y presupuesto
destinations/suiza/sections/*.js   una sección = un fichero (todas leen el plan calculado)
```

**Añadir otro destino:** copia `destinations/suiza/` a `destinations/<nuevo>/`, cambia `data.js`/secciones y añade una entrada en `registry.js`. El resto de la app no se toca.

## Publicar cambios

Antes de cada commit ejecuta `python3 tools/stamp.py`: marca todos los archivos con una versión nueva
para que nadie vea una mezcla de archivos viejos y nuevos justo después de publicar.

## Activar el login con Google (Firebase, gratis)

1. https://console.firebase.google.com → *Add project* (puedes desactivar Analytics).
2. *Build → Authentication → Get started → Sign-in method → Google → Enable*.
3. *Authentication → Settings → Authorized domains*: añade `localhost` (ya viene) y el dominio donde publiques.
4. *Build → Firestore Database → Create database* (modo producción, región `eur3`).
5. Firestore → *Rules*, pega y publica:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       match /users/{uid}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
6. *Project settings → Your apps → Web (</>)* → registra la app → copia el objeto `firebaseConfig` en `js/firebase-config.js`.

Sin config, todo se guarda en el navegador (y puedes exportar/importar JSON en *Ajustes*).

## Publicarlo gratis

`firebase init hosting` + `firebase deploy`, o arrastra la carpeta a Netlify Drop. Recuerda añadir el dominio en *Authorized domains*.

## Fuentes en vivo

Open-Meteo (MeteoSwiss ICON-CH2, ECMWF, DWD ICON, GFS, Météo-France + ERA5), SLF (boletín de aludes), data.economie.gouv.fr (gasóleo FR), Ministerio (gasóleo ES), Frankfurter/BCE (EUR→CHF), OSRM (rutas), Overpass/OSM (súper, lavanderías, vaciados, veterinarios), Wikimedia Commons (fotos).
park4night, Instagram, Wikiloc, Komoot, Strava y las webcams no tienen API pública abierta: se enlazan con búsquedas ya centradas en cada punto.
