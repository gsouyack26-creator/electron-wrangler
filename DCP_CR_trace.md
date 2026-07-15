# DCP Conductor Rail 75V — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 2 sections · 34 devices · 42 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| DS06100 | disconnect | 3 | 480VAC | L1→incoming-L1-unla; L2→incoming-L2-unla; L3→incoming-L3-unla; T1→06100A; T2→06101A; T3→06102A |
| DB06100 | pdb | 3 | 480VAC | L1-in→06100A; L2-in→06101A; L3-in→06102A |
| PWS06110-1 | psu |  | 480VAC input / 75VDC output, 40A | 0V→06112B; GND→06112B; L1→06100A; L2→06101A; L3→06102A; monitor-13→13111A |
| PWS06110-2 | psu |  | 480VAC input / 75VDC output, 40A | 0V→06112B; GND→06112B; L1→06100A; L2→06101A; L3→06102A; monitor-13→13113A |
| PWS06110-3 | psu |  | 480VAC input / 75VDC output, 40A | 0V→06112C; GND→06112C; L1→06100A; L2→06101A; L3→06102A; monitor-13→13115A |
| TB1D | terminal |  |  | 1→06127A; 2→06127B; GND-bus→06112A |
| D06119 | other |  |  | anode→psu-positive-bus; cathode→06119A |
| CB06127 | breaker |  |  | 1→06127A; 2→06127B; NO→06127B; c→06127A; line→06119A |
| CB13102 | breaker |  | 4A | 1→13103A; 14→13119A; out→13100A; supply→24VDC-bus |
| TB2D | terminal |  |  | 1→13100A |
| CR13132 | relay |  |  | 1→13109A; 2→13109A-common; coil-3→13132C; coil-4→13132C-ret |
| RE13132 | other |  | 1K OHM, 5W | 1→13132A; 2→13132B |
| RE13135 | other |  | 470 OHM, 2W | 1→CR13132-coil-3; 2→CR13132-coil-4 |
| TB30 | terminal |  |  | 1→13132A; 2→13132B; 3→conductor-rail-r |
| CB13102-BASE | breaker | 1 | 4A |  |
| F06100 | fuse | 3 | 20A (LPJ-20SP, Bussmann) |  |
| DS06105 | disconnect |  | 480V |  |
| ENCL1259 | other |  |  |  |
| TB3D | terminal |  |  |  |
| GND | terminal |  |  |  |
| GND251 | other |  |  |  |

## Sections

### Section 1 (pages [1, 2, 3, 4]) — confidence: med — Device tags, most wire numbers (06100A/06101A/06102A/06112A/06112B/06112C/06119A/06127A/06127B, 13100A/13103A/13107A/13109A/13111A/13113A/13115A/13117A/13119A, 13132A/13132B/13132C), and resistor ratings (1KΩ 5W, 470Ω 2W) are clearly legible. Power supply output voltage label is ambiguous at scan resolution ('25VDC' vs '75VDC') but context (panel title '75 VDC CONDUCTOR RAIL POWER PANEL', NOTE 1 'adjust to exactly 75 volts') confirms 75VDC output. D06119 anode-side topology is partially obscured — diode OR-ing function is inferred from circuit context and layout. TB30 tag in bottom section of page 131 may be misread 'TB3D'; only two characters are clear. DS06100 ampere rating ('25A' on switch handle) is low-confidence due to resolution. Positive-bus wire numbers between PSU outputs and D06119 anode were not individually labeled on page 061 and are noted as unlabeled bus.
**Function:** This panel converts 3-phase 480VAC incoming power through three paralleled 40A adjustable power supplies (output trimmed to exactly 75VDC per NOTE 1), routes the combined positive output through an OR-diode and output circuit breaker to the 75VDC conductor rail terminals, and wires eight status signals — main disconnect auxiliary, rail-voltage presence relay, three PSU OK contacts, 75VDC breaker position, and 24VDC breaker position — as digital inputs to the DCP_CR PLC I/O card for system health monitoring.

Page 001 (sheet 001): Table of contents only — no schematic devices. Page 061 (sheet 061): 480VAC power distribution schematic — INCOMING MAIN SUPPLY 3×480VAC enters DS06100 3-pole disconnect (wires 06100A/06101A/06102A), feeds DB06100 power distribution block, which supplies three parallel PWS06110-1/2/3 power supplies (480VAC in / 75VDC out, 40A each, NOTE 1 adjust output to exactly 75V); all three PSU 0V outputs tied to TB1D GND bus (wires 06112A/B/C); positive outputs combined through D06119 diode (with heat sink, wire 06119A) then through CB06127 output circuit breaker to TB1D terminals 1 and 2 (06127A = RAIL 0VDC LOWER RAIL, 06127B = RAIL 75VDC+ UPPER RAIL). Page 131 (sheet 131): Control power distribution — CB13102 (4A, 24VDC) feeds TB2D (wire 13100A); eight monitor signals wired to DCP_CR_IO: (1) 13100A 24VDC common, (2) DS06100 aux contact wire 13107A MAIN SWITCH, (3) CR13132 NO contact wire 13109A 75V CONDUCTOR RAIL MONITOR, (4-6) PWS06110-1/2/3 monitor contacts wires 13111A/13113A/13115A PWS1-3 MONITOR, (7) CB06127 c/NO wire 13117A 75VDC CIRCUIT BREAKER MONITOR, (8) CB13102 aux wire 13119A 24V CIRCUIT BREAKER MONITOR; bottom section shows conductor rail voltage presence circuit: cable from conductor rail → TB30 → RE13132 (1KΩ/5W, wire 13132A/13132B) → CR13132 relay coil (terminals 3/4, wire 13132C) with RE13135 (470Ω/2W) across coil. Page 251 (sheet 251): Internal panel layout — physical placement shows CB13102+TB2D in WIREWAY 24VDC 1x3; CR13132+TB1D+CB06127+RE13132 in WIREWAY 75VDC 1x3; DS06100+DB06100 in WIREWAY 480VAC 1x3; D06119 with heat sink and PWS06110-1/2/3 on main DIN rail in 480VAC area; NOTE 1 on layout confirms RE13135 installed across CR13132 coil terminals 3 & 4.

<details><summary>42 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| incoming-3ph-L1 | DS06100:L1 | hot | unlabeled-field |
| incoming-3ph-L2 | DS06100:L2 | hot | unlabeled-field |
| incoming-3ph-L3 | DS06100:L3 | hot | unlabeled-field |
| DS06100:T1 | DB06100:L1 | hot | 06100A |
| DS06100:T2 | DB06100:L2 | hot | 06101A |
| DS06100:T3 | DB06100:L3 | hot | 06102A |
| DB06100:L1-out | PWS06110-1:L1 | hot | 06100A |
| DB06100:L1-out | PWS06110-2:L1 | hot | 06100A |
| DB06100:L1-out | PWS06110-3:L1 | hot | 06100A |
| DB06100:L2-out | PWS06110-1:L2 | hot | 06101A |
| DB06100:L2-out | PWS06110-2:L2 | hot | 06101A |
| DB06100:L2-out | PWS06110-3:L2 | hot | 06101A |
| DB06100:L3-out | PWS06110-1:L3 | hot | 06102A |
| DB06100:L3-out | PWS06110-2:L3 | hot | 06102A |
| DB06100:L3-out | PWS06110-3:L3 | hot | 06102A |
| PWS06110-1:0V | TB1D:GND-bus | ret | 06112B |
| PWS06110-2:0V | TB1D:GND-bus | ret | 06112B |
| PWS06110-3:0V | TB1D:GND-bus | ret | 06112C |
| PWS06110-1:+out | D06119:anode | dc | psu-pos-bus |
| PWS06110-2:+out | D06119:anode | dc | psu-pos-bus |
| PWS06110-3:+out | D06119:anode | dc | psu-pos-bus |
| D06119:cathode | CB06127:line | dc | 06119A |
| CB06127:load | TB1D:2 | dc | 06127B |
| TB1D:1 | RAIL-0VDC-lower-rail-output | ret | 06127A |
| TB1D:2 | RAIL-75VDC-upper-rail-output | dc | 06127B |
| 24VDC-bus | CB13102:1 | dc | 13103A |
| CB13102:out | TB2D:1 | dc | 13100A |
| TB2D:1 | DCP_CR_IO:input-1 | dc | 13100A |
| DS06100:aux-contact | DCP_CR_IO:input-2 | ctrl | 13107A |
| CR13132:NO-1 | DCP_CR_IO:input-3 | ctrl | 13109A |
| PWS06110-1:monitor-13 | DCP_CR_IO:input-4 | ctrl | 13111A |
| PWS06110-2:monitor-13 | DCP_CR_IO:input-5 | ctrl | 13113A |
| PWS06110-3:monitor-13 | DCP_CR_IO:input-6 | ctrl | 13115A |
| CB06127:c-contact | DCP_CR_IO:input-7 | ctrl | 13117A |
| CB13102:aux-14 | DCP_CR_IO:input-8 | ctrl | 13119A |
| conductor-rail-cable | TB30:1 | dc | 13132A |
| TB30:1 | RE13132:1 | dc | 13132A |
| RE13132:2 | TB30:2 | dc | 13132B |
| TB30:2 | CR13132:coil-3 | dc | 13132C |
| RE13135:1 | CR13132:coil-3 | dc | 13132C-junction |
| RE13135:2 | CR13132:coil-4 | ret | conductor-rail-return |
| TB30:3 | CR13132:coil-4 | ret | conductor-rail-return |

</details>

### Section 2 (pages [5, 6]) — confidence: med — device tags, catalog numbers, and ratings read clearly from BOM table; the 'DS06105' tag on the layout image has low confidence on the last digit (could be DS06100 matching the BOM); no wire numbers or schematics present on these pages so connections array is empty by design
**Function:** Page 259 is the exterior mechanical layout of the 75VDC conductor rail power panel enclosure (ENCL1259, Hoffman 24×30×8) showing the door-mounted main rotary disconnect (DS06105, 480V) and safety labels; page 970 is the complete bill of material for the same panel, listing the 30A fused disconnect (DS06100), three 480V→24VDC/40A PULS power supplies (PWS06110-1/2/3), a Square-D 3-pole power distribution block (DB06100), a 30A 2-pole circuit breaker (CB06127), solid-state relay (CR13132), diode (D06119), resistors, and terminal blocks — no point-to-point wiring or wire numbers appear on either of these two pages.

Both pages are non-schematic: pg 259 = exterior panel layout (mechanical/dimensional drawing with main switch callout only); pg 970 = bill of material. No wire numbers, nets, or point-to-point connections are present. All devices are extracted from the BOM text; terminal assignments require the wiring-diagram pages (not shown here). Three PULS QT40.241 480V→24VDC/40A three-phase supplies dominate the load side. Panel is rated 480V input, 24VDC output (120A aggregate), for the conductor rail system.

