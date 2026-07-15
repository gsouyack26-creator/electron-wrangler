# ACY1 RME — Panel Path Tracer

Offline, single-file interactive electrical-panel simulator for troubleshooting.
Recreate a control panel as a live graph, then trace complete power/control paths,
operate devices, inject faults, and auto-diagnose dead loads.

## Run
Open `ACY1_Panel_Tracer.html` in any browser (Chrome/Edge). No install, no server.
Keep `panel_tracer.js` in the same folder. Ships with a demo conveyor motor-starter panel.

## Two modes
- **🔧 Build** — pick a part from the left palette, click canvas to place it. Click a terminal
  then another terminal (or use *Draw wire*) to connect. Edit tags/poles/state in the right panel.
- **▶ Simulate** — click devices to operate them; the live current path animates in gold.

## Three troubleshooting layers
1. **Energize** — solver flood-fills live potential; energized wires glow and animate current flow,
   motors spin, pilot lights illuminate, coils pull in their contacts.
2. **State sim** — click breakers / disconnects / E-stops / push-buttons / selectors to open/close;
   contactor & relay coils drive their power poles and NO/NC contacts automatically.
3. **Fault inject + diagnose** — trip a breaker, blow a fuse, trip an overload, or "Inject fault" on any
   device / cut a wire. Then click a **dead motor or light** → *Diagnose* walks the intended path back
   to source and lists every break, closest-first. Click a suspect to jump to it.

## Hybrid drawing workflow (trace + AI)
1. **🖼 Drawing** — drop a panel photo, PDF page, or hand sketch as a backdrop (opacity slider on the left).
2. Trace components + wires over it, **or** send the same image to Aki: *"extract this panel to
   Panel Tracer JSON"* → Aki returns a `.panel.json` → **📂 Load** it, then nudge parts to line up.

## Save / load
- **💾 Save** downloads a `.panel.json`; **📂 Load** re-imports. Auto-saves to browser storage.
- Build a library of your ACY1 panels over time (MCPs, VFD cabinets, sorter controls, etc.).

## Component library
Power source (1Ø/3Ø), **DC power supply** (AC-in → 24/75V DC-out, output live only when fed),
disconnect, breaker, fuse, contactor, overload, relay, **safety relay** (dual-channel — outputs
close only when coil powered *and* the E-stop loop is intact), VFD, motor, pilot light, E-stop,
start/stop push-buttons, selector, sensor/photo-eye, PLC in/out, **8-ch PLC input card**,
**8-ch PLC output card**, single terminal, **multi-position terminal strip**, **fused terminal**,
**ground/PE bar**.

Bundled panel library includes the ACY1 13XP33/CC566 set plus representative **BEUMER/Intelligrated
LS4000 sorter** panels (DCP 24VDC control power, 6-belt induction power, E-stop safety chain).

## JSON format (for AI extraction)
```json
{ "name":"...", "backdrop":null,
  "components":[{"id":"breaker1","type":"breaker","x":300,"y":80,"label":"CB-1","poles":3,"state":"closed"}],
  "wires":[{"id":"w1","a":"source1|L1","b":"breaker1|in0","net":"hot"}] }
```
Wire endpoints are `"<componentId>|<terminalId>"`. Net = `hot` | `ret` | `ctrl`.

## Feature set (49)
**Advanced electrical model:** single-phasing / **phase-loss** detection (L1/L2/L3 tracking, motor hums) ·
**continuity / ohmmeter** dead-test mode · **short-circuit / coordination** study + bolted-fault injection ·

**Dynamic simulation:** time-based sequence playback with **TON/TOF timers** (▶ Play / Space) ·
live-voltage overlay · running-**amps** display + breaker/wire **load sizing** check ·
**high-resistance / voltage-drop** faults (partial sag, not just open).

**Troubleshooting (round 1-2):**
**Troubleshooting:** panel-wide *What's dead?* report · meter probe (click 2 terminals → expected V) ·
hover live-path highlight · fault-inject quiz/training mode · guided fault walk-through ·
live-voltage overlay · as-found measurement log (compare model vs your real readings).

**Build & edit:** component search / jump-to · multi-select + bulk edit (Shift+drag marquee) ·
right-click quick-menu · undo/redo (`Ctrl+Z` / `Ctrl+Y`) · ortho (right-angle) wire routing ·
pre-wired templates (motor starter / E-stop string / 24V PLC rung) · photo pin-drop ·
notes/annotations pinned to components · wire numbers/labels.

**Multi-panel & docs:** project mode with panel **tabs** · in-panel named **snapshots** + diff ·
**ladder-diagram** auto-layout · **terminal-strip** view · **wire schedule** CSV ·
printable **troubleshooting worksheet** · part-number (APN) + Parts Search link.

**Build speed:** copy/paste (Ctrl+C/V) · grid snap · **command palette** (Ctrl+K).

**Correctness:** E-stop chain validator · interlock / sequence checker · net highlight ·
panel diff (vs saved file).

**Output & share:** BOM (+ CSV) · print / PNG / SVG export with title block ·
deep-link share URL · self-contained QR code (no CDN) · cross-panel jump links.

**Maintenance & training:** component **health tags** + thermal overlay · per-panel **PM checklist** ·
**training scenarios** with scoring · **read-aloud** diagnosis.

**Platform & accessibility:** **PWA install** (offline service worker) · touch **pinch-zoom** ·
**colorblind-safe** mode · searchable **panel-library manager** + folder import · **QR-scan** to open.

## Repo layout
```
ACY1_Panel_Tracer.html       shell + styles (edit this + panel_tracer.js)
panel_tracer.js              the engine (~100 KB)
ACY1_Panel_Tracer_dist.html  BUILT single-file distributable (do not hand-edit)
build.py                     inlines JS + all *.panel.json + layout into the dist
extract_layout.py            helper: derive a physical-layout map from a drawing
layout_cc566.json            physical backplate layout (embedded by build)
*.panel.json                 real ACY1 13XP33 / CC566 panel definitions (the library)
manifest.json / sw.js       PWA manifest + offline service worker
EXTRACTION_SPEC.md           schema/spec for AI panel extraction
```

## Build
After editing `ACY1_Panel_Tracer.html` or `panel_tracer.js`:
```
python build.py
```
regenerates `ACY1_Panel_Tracer_dist.html` with the JS and the whole panel library inlined —
a single portable file you can email, drop on a share, or open offline.

Ship either the two-file version (HTML + JS in the same folder) or just the single `_dist.html`.
