#!/usr/bin/env python3
"""Marca todos los módulos JS y el CSS con una versión nueva (mapa de importación en index.html)
para que, tras publicar, el navegador no mezcle archivos viejos y nuevos.
Uso:  python3 tools/stamp.py   (antes de cada commit)"""
import json, pathlib, re, time
root = pathlib.Path(__file__).resolve().parent.parent
v = time.strftime('%Y%m%d%H%M%S')
mods = sorted(str(p.relative_to(root)) for p in root.rglob('*.js') if p.name != 'sw.js' and 'tools' not in p.parts and '.claude' not in p.parts)
imap = {'imports': {f'./{m}': f'./{m}?v={v}' for m in mods}}
html = (root / 'index.html').read_text()
block = f'<script type="importmap" id="versions">{json.dumps(imap, separators=(",", ":"))}</script>'
html = re.sub(r'<script type="importmap" id="versions">.*?</script>', block, html, flags=re.S) if 'id="versions"' in html else html.replace('<script src="https://unpkg.com/leaflet', block + '\n  <script src="https://unpkg.com/leaflet', 1)
html = re.sub(r'href="css/app\.css(\?v=\d+)?"', f'href="css/app.css?v={v}"', html)
html = re.sub(r'src="js/app\.js(\?v=\d+)?"', f'src="js/app.js?v={v}"', html)
(root / 'index.html').write_text(html)
sw = (root / 'sw.js').read_text()
sw = re.sub(r"const V = 'roadbook-[^']+';", f"const V = 'roadbook-{v}';", sw)
(root / 'sw.js').write_text(sw)
print('versión', v, '·', len(mods), 'módulos')
