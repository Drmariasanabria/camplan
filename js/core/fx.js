// Efectos: partículas de nieve, sonido sintetizado, fondo en movimiento, reveal y tilt.

/* ---------------- Partículas ---------------- */
export function startParticles() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.getElementById('particles');
  const ctx = c.getContext('2d');
  let W, H, flakes = [], mouse = { x: -999, y: -999 };
  const N = Math.min(innerWidth < 700 ? 45 : 160, Math.floor(innerWidth / 9));
  const resize = () => { W = c.width = innerWidth * devicePixelRatio; H = c.height = innerHeight * devicePixelRatio; c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px'; };
  resize(); addEventListener('resize', resize);
  for (let i = 0; i < N; i++) flakes.push(mk(true));
  function mk(init) {
    const z = Math.random();
    return { x: Math.random() * W, y: init ? Math.random() * H : -10, r: (0.6 + z * 2.4) * devicePixelRatio, vy: (0.25 + z * 1.1) * devicePixelRatio, ph: Math.random() * 6.28, a: 0.25 + z * 0.6, hue: Math.random() < 0.15 ? 270 : 190 };
  }
  addEventListener('pointermove', e => { mouse.x = e.clientX * devicePixelRatio; mouse.y = e.clientY * devicePixelRatio; });
  let t = 0;
  (function loop() {
    t += 0.01;
    ctx.clearRect(0, 0, W, H);
    for (const f of flakes) {
      f.y += f.vy; f.x += Math.sin(t * 2 + f.ph) * 0.4 * devicePixelRatio;
      const dx = f.x - mouse.x, dy = f.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 120 * devicePixelRatio) { f.x += dx / d * 2.2; f.y += dy / d * 1.2; }
      if (f.y > H + 10) Object.assign(f, mk(false));
      ctx.beginPath();
      ctx.fillStyle = `hsla(${f.hue},100%,92%,${f.a})`;
      ctx.shadowBlur = f.r * 4; ctx.shadowColor = `hsla(${f.hue},100%,75%,.8)`;
      ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
    }
    requestAnimationFrame(loop);
  })();
  const glow = document.getElementById('cursor-glow');
  addEventListener('pointermove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });
}

/* ---------------- Sonido (WebAudio, sin ficheros) ---------------- */
let actx = null, soundOn = localStorage.getItem('sfx') !== 'off';
function ac() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx; }
function tone(freq, dur = 0.08, type = 'sine', vol = 0.05, slide = 0) {
  if (!soundOn) return;
  try {
    const a = ac(), o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, a.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + dur + 0.02);
  } catch {}
}
export const sfx = {
  hover: () => tone(1400, 0.04, 'sine', 0.018),
  click: () => { tone(520, 0.09, 'triangle', 0.06, 1.8); },
  check: () => { tone(660, 0.07, 'sine', 0.05); setTimeout(() => tone(990, 0.12, 'sine', 0.05), 70); },
  uncheck: () => tone(420, 0.1, 'sine', 0.04, 0.6),
  page: () => { tone(220, 0.35, 'sine', 0.04, 3); setTimeout(() => tone(880, 0.25, 'triangle', 0.02), 120); },
  success: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.05), i * 80)),
};
export function initSound() {
  const btn = document.getElementById('sound-toggle');
  const paint = () => btn.textContent = soundOn ? '🔊' : '🔇';
  paint();
  btn.addEventListener('click', () => { soundOn = !soundOn; localStorage.setItem('sfx', soundOn ? 'on' : 'off'); paint(); sfx.click(); });
  let last = 0;
  if (matchMedia('(hover: hover)').matches) document.addEventListener('pointerover', e => {
    const el = e.target.closest('a,button,.check,.card');
    if (!el || el === document.lastHover) return; document.lastHover = el;
    const now = performance.now(); if (now - last > 60) { sfx.hover(); last = now; }
  });
  document.addEventListener('click', e => { if (e.target.closest('a,button')) sfx.click(); });
}

/* ---------------- Fondo con crossfade ---------------- */
let bgTimer = null, bgIdx = 0, bgFlip = false;
export function setBackgrounds(urls) {
  clearInterval(bgTimer);
  if (!urls?.length) return;
  const [a, b] = document.querySelectorAll('#bg .bg-img');
  const show = url => {
    const img = new Image();
    img.onload = () => {
      const el = bgFlip ? a : b, other = bgFlip ? b : a;
      el.style.backgroundImage = `url("${url}")`; el.classList.add('on'); other.classList.remove('on'); bgFlip = !bgFlip;
    };
    img.src = url;
  };
  bgIdx = 0; show(urls[0]);
  if (urls.length > 1) bgTimer = setInterval(() => { bgIdx = (bgIdx + 1) % urls.length; show(urls[bgIdx]); }, 12000);
}

/* ---------------- Reveal + tilt ---------------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.08 });
export function enhance(root, instant = false) {
  root.querySelectorAll('.card, h2, .table-wrap, .callout, .map, .day, fieldset').forEach((el, i) => {
    if (el.classList.contains('reveal')) return;
    el.classList.add('reveal'); if (instant) { el.classList.add('in'); return; }
    el.style.transitionDelay = (i % 6) * 60 + 'ms'; io.observe(el);
  });
  root.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', x * 100 + '%'); card.style.setProperty('--my', y * 100 + '%');
      if (!card.classList.contains('no-tilt')) card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
  // Contadores animados
  if (instant) return;
  root.querySelectorAll('[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    const t0 = performance.now();
    const step = t => { const p = Math.min(1, (t - t0) / 1400), v = end * (1 - Math.pow(1 - p, 3)); el.textContent = pre + v.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

export function toast(msg) {
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
}
