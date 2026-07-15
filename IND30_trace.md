# Standard 30A 12-Belt Induction Power — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 2 sections · 69 devices · 78 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| DS06103 | disconnect | 3 | 30A 480VAC | aux-ctrl→14213A; gnd→06106; line-L1→06103A; line-L2→06104A; line-L3→06105A; load-L1-BFB200→06202; load-L1-BFB300→06302; load-L2-BFB200→06201 |
| BFB06200 | pdb | 3 |  | in-L1→06103A; in-L2→06104A; in-L3→06105A |
| FU06200 | fuse | 3 | 15A (fuse-element label reads '15E'; exact class partially legible at scan resolution) | T1-in-L3→06105A; T2-in-L2→06104A; T3-in-L1→06103A |
| CB06204 | breaker | 3 | 2.5–4A (set 2.5A) | aux→14219A; out-L1→06202A; out-L2→06203A; out-L3→06204A |
| J06204 | terminal | 4 |  | 1→06202A; 2→06203A; 3→06204A; 4→GN |
| CB06209 | breaker | 3 | 2.5–4A (set 2.5A) | aux→14221A; out-L1→06207A; out-L2→06208A; out-L3→06209A |
| J06209 | terminal | 4 |  | 1→06207A; 2→06208A; 3→06209A; 4→GN |
| CB06214 | breaker | 3 | 2.5–4A (set 2.5A) | aux→14223A; out-L1→06212A; out-L2→06213A; out-L3→06214A |
| J06214 | terminal | 4 |  | 1→06212A; 2→06213A; 3→06214A; 4→GN |
| CB06219 | breaker | 3 | 2.5–4A (set 2.5A) | aux→14225A; out-L1→06217A; out-L2→06220A; out-L3→06221A |
| J06219 | terminal | 4 |  | 1→06217A; 2→06220A; 3→06221A; 4→GN |
| CB06224 | breaker | 3 | 2.5–4A (set 2.5A) | aux→14227A; out-L1→06222A; out-L2→06223A; out-L3→06224A |
| J06224 | terminal | 4 |  | 1→06222A; 2→06223A; 3→06224A; 4→GN |
| CB06229 | breaker | 3 | 2.5–4A (set 2.5A) | aux→14229A; out-L1→06227A; out-L2→06228A; out-L3→06229A |
| J06229 | terminal | 4 |  | 1→06227A; 2→06228A; 3→06229A; 4→GN |
| BFB06300 | pdb | 3 |  | in-L1→06103A; in-L2→06104A; in-L3→06105A |
| FU06300 | fuse | 3 | 15A (fuse-element label reads '15E'; exact class partially legible at scan resolution) | T1-in-L3→06105A; T2-in-L2→06104A; T3-in-L1→06103A |
| CB06304 | breaker | 3 | 2.5–4A (set 2.5A) | aux→14231A; out-L1→06302A; out-L2→06303A; out-L3→06304A |
| J06304 | terminal | 4 |  | 1→06302A; 2→06303A; 3→06304A; 4→GN |
| CB06309 | breaker | 3 | 2.5–4A (set 2.5A) | aux→14233A; out-L1→06308A; out-L2→06309A; out-L3→06310A |
| J06309 | terminal | 4 |  | 1→06308A; 2→06309A; 3→06310A; 4→GN |
| CB06314 | breaker | 3 | 2.5–4A (set 2.5A) | aux→14235A; out-L1→06312A; out-L2→06313A; out-L3→06314A |
| J06314 | terminal | 4 |  | 1→06312A; 2→06313A; 3→06314A; 4→GN |
| CB06319 | breaker | 3 | 2.5–4A (set 2.5A) | aux→14237A; out-L1→06317A; out-L2→06318A; out-L3→06319A |
| J06319 | terminal | 4 |  | 1→06317A; 2→06318A; 3→06319A; 4→GN |
| CB06324 | breaker | 3 | 2.5–4A (set 2.5A) | aux→14239A; out-L1→06322A; out-L2→06323A; out-L3→06324A |
| J06324 | terminal | 4 |  | 1→06322A; 2→06323A; 3→06324A; 4→GN |
| CB06329 | breaker | 3 | 2.5–4A (set 2.5A) | aux→14241A; out-L1→06327A; out-L2→06328A; out-L3→06329A |
| J06329 | terminal | 4 |  | 1→06327A; 2→06328A; 3→06329A; 4→GN |
| P14201 | other |  |  | 0vdc-out→14206A; 24vdc-out→14201A; pe-out→14211A |
| TB14201 | terminal |  |  | in→14201A; rail→24VDC |
| TB14206 | terminal |  |  | in→14206A; rail→0VDC |
| TB14211 | terminal |  |  | in→14211A; rail→PE |
| GND06106 | terminal | 1 | None |  |
| TB06106 | terminal |  | None |  |
| J14201 | other | 19 | None |  |
| ENCL259 | other |  | 24x30x8 in / 480V |  |

## Sections

### Section 1 (pages [2, 3, 4, 5]) — confidence: med
**Function:** Receives 480VAC 3-phase from the main power single-line through a 30A fused disconnect (DS06103), then distributes via two parallel fused buss-bar assemblies (BFB06200, BFB06300 each with ~15A fuse blocks) to twelve individual 3-pole motor branch circuit breakers (set 2.5A) that feed 4-wire (L1/L2/L3/PE) connectors for twelve induction belt motors; CB auxiliary contacts are monitored over a 24VDC control bus (page 142) for trip status.

Pages 061–063 show the 480VAC power distribution path: DS06103 (30A fused disconnect, 3-pole) → BFB06200 + BFB06300 (dual buss-bar terminal blocks with integral 3-pole fuse assemblies FU06200/FU06300, ~15A) → 12× 3-pole adjustable motor branch CBs (CB06204/09/14/19/24/29 and CB06304/09/14/19/24/29, all set 2.5A) → 12× 4-pin motor connectors (J06204–J06329, BK/WH/RD/GN = L1/L2/L3/PE). Page 142 shows the corresponding 24VDC control section: P14201 harness feeds TB14201 (24V+), TB14206 (0V), TB14211 (PE); individual wires 14213A–14241A connect to DS06103 and all 12 CB auxiliary contacts for trip monitoring. Illegible areas: exact fuse class/type in FU06200 and FU06300 (label reads '15E' at scan resolution — value uncertain); TYPE/REF annotation boxes on CB06324 and CB06329 contain apparent cross-reference labels ('CB06308'/'CB06309') that do not match blue device tags and are likely internal part-reference annotations, not device tags.

<details><summary>58 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| DS06103:load-L1 | BFB06200:in-L1 | hot-L1 | 06103A |
| DS06103:load-L2 | BFB06200:in-L2 | hot-L2 | 06104A |
| DS06103:load-L3 | BFB06200:in-L3 | hot-L3 | 06105A |
| DS06103:load-L1 | BFB06300:in-L1 | hot-L1 | 06103A |
| DS06103:load-L2 | BFB06300:in-L2 | hot-L2 | 06104A |
| DS06103:load-L3 | BFB06300:in-L3 | hot-L3 | 06105A |
| CB06204:out-L1 | J06204:1 | hot | 06202A |
| CB06204:out-L2 | J06204:2 | hot | 06203A |
| CB06204:out-L3 | J06204:3 | hot | 06204A |
| CB06209:out-L1 | J06209:1 | hot | 06207A |
| CB06209:out-L2 | J06209:2 | hot | 06208A |
| CB06209:out-L3 | J06209:3 | hot | 06209A |
| CB06214:out-L1 | J06214:1 | hot | 06212A |
| CB06214:out-L2 | J06214:2 | hot | 06213A |
| CB06214:out-L3 | J06214:3 | hot | 06214A |
| CB06219:out-L1 | J06219:1 | hot | 06217A |
| CB06219:out-L2 | J06219:2 | hot | 06220A |
| CB06219:out-L3 | J06219:3 | hot | 06221A |
| CB06224:out-L1 | J06224:1 | hot | 06222A |
| CB06224:out-L2 | J06224:2 | hot | 06223A |
| CB06224:out-L3 | J06224:3 | hot | 06224A |
| CB06229:out-L1 | J06229:1 | hot | 06227A |
| CB06229:out-L2 | J06229:2 | hot | 06228A |
| CB06229:out-L3 | J06229:3 | hot | 06229A |
| CB06304:out-L1 | J06304:1 | hot | 06302A |
| CB06304:out-L2 | J06304:2 | hot | 06303A |
| CB06304:out-L3 | J06304:3 | hot | 06304A |
| CB06309:out-L1 | J06309:1 | hot | 06308A |
| CB06309:out-L2 | J06309:2 | hot | 06309A |
| CB06309:out-L3 | J06309:3 | hot | 06310A |
| CB06314:out-L1 | J06314:1 | hot | 06312A |
| CB06314:out-L2 | J06314:2 | hot | 06313A |
| CB06314:out-L3 | J06314:3 | hot | 06314A |
| CB06319:out-L1 | J06319:1 | hot | 06317A |
| CB06319:out-L2 | J06319:2 | hot | 06318A |
| CB06319:out-L3 | J06319:3 | hot | 06319A |
| CB06324:out-L1 | J06324:1 | hot | 06322A |
| CB06324:out-L2 | J06324:2 | hot | 06323A |
| CB06324:out-L3 | J06324:3 | hot | 06324A |
| CB06329:out-L1 | J06329:1 | hot | 06327A |
| CB06329:out-L2 | J06329:2 | hot | 06328A |
| CB06329:out-L3 | J06329:3 | hot | 06329A |
| P14201:24vdc-out | TB14201:in | dc-24v | 14201A |
| P14201:0vdc-out | TB14206:in | dc-ret | 14206A |
| P14201:pe-out | TB14211:in | pe | 14211A |
| TB14201:rail | DS06103:aux-ctrl | ctrl | 14213A |
| TB14201:rail | CB06204:aux | ctrl | 14219A |
| TB14201:rail | CB06209:aux | ctrl | 14221A |
| TB14201:rail | CB06214:aux | ctrl | 14223A |
| TB14201:rail | CB06219:aux | ctrl | 14225A |
| TB14201:rail | CB06224:aux | ctrl | 14227A |
| TB14201:rail | CB06229:aux | ctrl | 14229A |
| TB14201:rail | CB06304:aux | ctrl | 14231A |
| TB14201:rail | CB06309:aux | ctrl | 14233A |
| TB14201:rail | CB06314:aux | ctrl | 14235A |
| TB14201:rail | CB06319:aux | ctrl | 14237A |
| TB14201:rail | CB06324:aux | ctrl | 14239A |
| TB14201:rail | CB06329:aux | ctrl | 14241A |

</details>

### Section 2 (pages [6, 7, 8, 9]) — confidence: HIGH for device identification, catalog numbers, ratings, and physical arrangement — all BOM entries and layout labels are sharply legible. LOW for point-to-point connections and wire numbers: these four pages are layout drawings and BOMs only; no wiring diagram or terminal-to-wire-number mapping is shown. Connections listed are inferred from physical position and circuit topology, not read from a schematic. Ambiguity: layout page 251 shows secondary position labels CB06220/CB06226/CB06232/CB06302/CB06308/CB06314 below the bottom device row that do not appear in the BOM; these may be references to loads on another page or partially obscured labels — not included as separate devices. Tag discrepancy: external-layout calls the 19-pin M23 connector J14201 while the BOM calls it P14201.
**Function:** This section provides the internal mechanical layout, external door layout, and full bill of materials for a wall-mount 480VAC 30A induction power panel that distributes three-phase 480V through a single 30A fused main disconnect (DS06103) to twelve individual 3P motor circuit breakers (2.5–4A, with aux contacts) via compact busbars, each breaker feeding a Turck 4-pin power receptacle on the panel face for direct plug-in connection to belt induction motors on the LS4000 sorter.

Pages 251 and 259 are internal and external physical layout drawings for a 24x30x8 Hoffman wall-mount enclosure (ENCL259). Page 251 shows two DIN-rail rows: top row carries FU06200 (3P 15A Class CC fuse block), BFB06200 (3P compact busbar feeder), and six motor circuit breakers CB06204–CB06229; bottom row mirrors with FU06300, BFB06300, and CB06304–CB06329. Both rows are served via 480VAC wireways from main fused disconnect DS06103 (30A, 60A frame, door-mounted). Twelve Turck RKFP46-2.5 4-pin power receptacles (J06204–J06329) are arranged in a 4×3 grid on the external door panel. A Turck 19-pin M23 Multifast receptacle (J14201/P14201) provides the low-voltage control interface. Terminal blocks TB14201, TB14206, TB14211 and ground bus GND06106 complete the low-voltage and grounding infrastructure. Pages 970 and 971 are Bills of Material — no wire numbers are present anywhere in this four-page set; wire numbers reside on the detailed wiring schematic pages not included here.

<details><summary>20 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| DS06103-L1/L2/L3 | BFB06200-in | 480VAC-hot | None |
| DS06103-L1/L2/L3 | BFB06300-in | 480VAC-hot | None |
| BFB06200-out | CB06204-in / CB06209-in / CB06214-in / | 480VAC-hot | None |
| BFB06300-out | CB06304-in / CB06309-in / CB06314-in / | 480VAC-hot | None |
| CB06204-out | J06204-pins1-3 | 480VAC-hot | None |
| CB06209-out | J06209-pins1-3 | 480VAC-hot | None |
| CB06214-out | J06214-pins1-3 | 480VAC-hot | None |
| CB06219-out | J06219-pins1-3 | 480VAC-hot | None |
| CB06224-out | J06224-pins1-3 | 480VAC-hot | None |
| CB06229-out | J06229-pins1-3 | 480VAC-hot | None |
| CB06304-out | J06304-pins1-3 | 480VAC-hot | None |
| CB06309-out | J06309-pins1-3 | 480VAC-hot | None |
| CB06314-out | J06314-pins1-3 | 480VAC-hot | None |
| CB06319-out | J06319-pins1-3 | 480VAC-hot | None |
| CB06324-out | J06324-pins1-3 | 480VAC-hot | None |
| CB06329-out | J06329-pins1-3 | 480VAC-hot | None |
| FU06200-out | TB14201 | ctrl | None |
| FU06300-out | TB14206 | ctrl | None |
| TB14201/TB14206 | J14201 (P14201) pins | ctrl | None |
| GND06106 / ground buses | enclosure ground stud | GND | None |

</details>
