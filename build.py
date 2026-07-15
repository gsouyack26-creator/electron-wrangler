#!/usr/bin/env python3
"""Bundle Electron Wrangler into a single portable HTML file with the panel library embedded."""
import glob
import json
import os
HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, "ElectronWrangler.html"), encoding="utf-8") as _f:
    html = _f.read()
with open(os.path.join(HERE, "electron_wrangler.js"), encoding="utf-8") as _f:
    js = _f.read()

# B2: neutralize any literal </script> so it cannot terminate the embedded block early
js = js.replace("</script>", "<\\/script>")

# collect panel library (all *.panel.json), keyed by panel name
lib = {}
for fp in sorted(glob.glob(os.path.join(HERE, "*.panel.json"))):
    try:
        with open(fp, encoding="utf-8") as _f:
            p = json.load(_f)
        lib[p.get("name") or os.path.basename(fp)] = p
    except Exception as e:
        print("skip", fp, e)

# optional real backplate layout map
layout_path = os.path.join(HERE, "layout_cc566.json")
layout_js = ""
if os.path.exists(layout_path):
    with open(layout_path, encoding="utf-8") as _f:
        layout = json.load(_f)
    layout_js = "window.PANEL_LAYOUT=" + json.dumps(layout, separators=(",", ":")).replace("</", "<\\/") + ";"
    print("embedded layout map:", len(layout), "devices")

lib_json = json.dumps(lib, separators=(",", ":")).replace("</", "<\\/")
inject = ("<script>window.PANEL_LIBRARY=" + lib_json + ";"
          + layout_js + "</script>\n<script>\n" + js + "\n</script>")
out = html.replace('<script src="electron_wrangler.js"></script>', inject, 1)
if out == html:
    raise SystemExit("ERROR: <script src=\"electron_wrangler.js\"> anchor not found in template")
# inline the PWA manifest as a data URI so the single-file dist stays portable
import base64 as _b64
_mpath = os.path.join(HERE, "manifest.json")
if os.path.exists(_mpath) and '<link rel="manifest" href="manifest.json">' in out:
    with open(_mpath, encoding="utf-8") as _f:
        _mraw = _f.read()
    _durl = "data:application/manifest+json;base64," + _b64.b64encode(_mraw.encode("utf-8")).decode("ascii")
    out = out.replace('<link rel="manifest" href="manifest.json">', '<link rel="manifest" href="' + _durl + '">', 1)

dist = os.path.join(HERE, "ElectronWrangler_dist.html")
with open(dist, "w", encoding="utf-8") as _f:
    _f.write(out)
kb = os.path.getsize(dist) // 1024
print(f"built {os.path.basename(dist)} ({kb} KB) with {len(lib)} panels:")
for k in lib:
    print("  -", k)
