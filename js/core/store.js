// Estado persistente por destino. Local siempre; nube (Firestore) si hay sesión de Google.
import { firebaseConfig } from '../firebase-config.js';
import { toast, sfx } from './fx.js';

const LS = 'roadbook:v1';
// Si el navegador bloquea el almacenamiento (modo privado estricto), se trabaja en memoria
const store = (() => { try { const k = '__t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; } catch { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), key: i => [...m.keys()][i], get length() { return m.size; } }; } })();
export const storageOK = store !== null && (() => { try { return store === localStorage; } catch { return false; } })();
let data = (() => { try { return JSON.parse(store.getItem(LS) || '{}'); } catch { return {}; } })();
let fb = null, user = null, saveTimer = null, syncState = 'idle';
const listeners = new Set();

export const cloudReady = () => !!firebaseConfig.apiKey;
export const currentUser = () => user;
export const onChange = fn => listeners.add(fn);
const emit = () => listeners.forEach(fn => fn({ user, data }));

export function get(dest, key, def) { return data[dest]?.[key] ?? def; }
export function set(dest, key, val) {
  (data[dest] ||= {})[key] = val;
  data[dest]._updated = Date.now();
  const s = JSON.stringify(data);
  // Tus datos tienen prioridad: si no cabe, se borra la caché de datos en vivo y se reintenta
  try { store.setItem(LS, s); }
  catch { try { Object.keys(localStorage).filter(k => k.startsWith('live:')).forEach(k => localStorage.removeItem(k)); store.setItem(LS, s); } catch (e) { console.error(e); } }
  if (user) { setSync('pending'); clearTimeout(saveTimer); saveTimer = setTimeout(() => pushCloud(dest), 800); }
}

async function loadFirebase() {
  if (fb) return fb;
  const v = '10.12.2', base = `https://www.gstatic.com/firebasejs/${v}/`;
  const [app, auth, fs] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]);
  const a = app.initializeApp(firebaseConfig);
  fb = { auth, fs, A: auth.getAuth(a), D: fs.getFirestore(a) };
  return fb;
}

function setSync(s) {
  syncState = s;
  const el = document.querySelector('#auth-btn .sync'); if (!el) return;
  el.textContent = { pending: '⟳ Guardando…', ok: '☁️ Guardado', error: '⚠ Sin sincronizar', idle: '' }[s] || '';
  el.dataset.s = s;
}
async function pushCloud(dest) {
  if (!user) return;
  const { fs, D } = fb;
  try {
    await fs.setDoc(fs.doc(D, 'users', user.uid, 'trips', dest), { json: JSON.stringify(data[dest] || {}), updated: fs.serverTimestamp() });
    setSync('ok');
  } catch (e) { console.warn(e); setSync('error'); }
}
addEventListener('online', () => { if (user && syncState === 'error') Object.keys(data).forEach(pushCloud); });
async function pullCloud() {
  const { fs, D } = fb;
  const snap = await fs.getDocs(fs.collection(D, 'users', user.uid, 'trips'));
  snap.forEach(d => {
    const remote = JSON.parse(d.data().json || '{}'), local = data[d.id] || {};
    // gana el más reciente
    data[d.id] = (remote._updated || 0) >= (local._updated || 0) ? remote : local;
  });
  store.setItem(LS, JSON.stringify(data));
  for (const k of Object.keys(data)) pushCloud(k);
}

export async function initAuth() {
  renderAuth();
  if (!cloudReady()) return;
  try {
    const { auth, A } = await loadFirebase();
    auth.onAuthStateChanged(A, async u => {
      user = u;
      if (u) { await pullCloud(); toast(`☁️ Sincronizado como ${u.displayName?.split(' ')[0] || 'tú'}`); sfx.success(); }
      renderAuth(); emit();
    });
  } catch (e) { console.warn('Firebase no disponible', e); }
}

export async function signIn() {
  if (!cloudReady()) { location.hash = '#/ajustes'; toast('Configura Firebase para activar el login con Google'); return; }
  const { auth, A } = await loadFirebase();
  await auth.signInWithPopup(A, new auth.GoogleAuthProvider());
}
export async function signOut() { if (fb) await fb.auth.signOut(fb.A); }

function renderAuth() {
  const slot = document.getElementById('auth-slot');
  if (user) {
    slot.innerHTML = `<button class="auth-btn" id="auth-btn" title="Cerrar sesión">${user.photoURL ? `<img src="${user.photoURL}" alt="">` : '<span class="g">✓</span>'}<span>${user.displayName?.split(' ')[0] || 'Cuenta'}<small class="sync" style="display:block;font-size:11px;opacity:.75;font-weight:500"></small></span></button>`;
    slot.querySelector('button').onclick = () => { location.hash = '#/ajustes'; };
    setSync(syncState === 'idle' ? 'ok' : syncState);
  } else {
    slot.innerHTML = `<button class="auth-btn" id="auth-btn"><span class="g">G</span><span>${cloudReady() ? 'Entrar con Google' : 'Guardado local'}</span></button>`;
    slot.querySelector('button').onclick = signIn;
  }
}

export function exportJSON() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'camplan-copia.json'; a.click();
}
export function importJSON(file) {
  return file.text().then(t => { data = JSON.parse(t); store.setItem(LS, t); if (user) Object.keys(data).forEach(pushCloud); emit(); });
}
