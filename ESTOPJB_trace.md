# LS4000 E-Stop Junction Box — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 1 sections · 17 devices · 21 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| TB1 | terminal | 4 |  | 1→S11A; 2→S12A; 3→S21A; 4→S22A |
| TB2 | terminal | 4 |  | 1→S11B; 2→S12B; 3→S21B; 4→S22B |
| TB1213 | terminal | 8 |  | 1→12111A; 3→12113A; 4→12114A; 5→12115A; 6→12116A; 7→12117A |
| TB1214 | terminal | 8 |  | 4→12124A; 5→12125A; 6→12126A; 7→12127A |
| TB1215 | terminal | 4 |  | 1→TB1215-1; 2→TB1215-2; 3→TB1215-3; 4→TB1215-4 |
| TB1216 | terminal | 4 |  | 1→TB1216-1; 2→TB1216-2; 3→TB1216-3; 4→TB1216-4 |
| PB12111 | estop | 2 |  | DIAG→12115A; SAFETY-CH1-IN→12111A; SAFETY-CH1-OUT→12113A; SAFETY-CH2-IN→12114A |
| PB12121 | estop | 2 |  | DIAG→12125A; SAFETY-CH1-IN→12124A; SAFETY-CH1-OUT→12125A; SAFETY-CH2-IN→12126A |
| LT12117 | other |  |  | A1→12117A |
| LT12127 | other |  |  | A1→12127A |
| ENC401 | other |  |  |  |
| CO1 | other |  |  |  |
| CO2 | other |  |  |  |
| CO1213 | other |  |  |  |
| CO1214 | other |  |  |  |
| CO1215 | other |  |  |  |
| CO1216 | other |  |  |  |

## Sections

### Section 1 (pages [1, 2, 3, 4]) — confidence: med
**Function:** This junction box accepts the 4-channel (S11/S12/S21/S22) dual-channel safety E-stop loop from an upstream source, passes it through two local E-stop push button devices (PB12111, PB12121) wired via terminal blocks TB1213/TB1214 with indicator lamps and diagnostic contacts, then continues the loop downstream via TB2; I/O status connections to the nearest PLC I/O panel are provided via TB1215 and TB1216, and field jumpers at TB2 terminate the loop if this is the last box in the daisy-chain.

Page 1 is table of contents (no devices). Page 2 (pg 121) is the E-STOP CIRCUIT schematic — the primary source for all devices and connections above. Page 3 (pg 259) is an external mechanical layout drawing showing the Hoffman ENC401 enclosure with 6 M20 cable glands and DIN-rail-mounted terminal block groups TB1, TB2, TB1213–TB1216 — no new schematic devices. Page 4 (pg 970) is the Bill of Material (BOM) confirming AB 1492-J4 screw terminals, Olflex M20×1.5 strain reliefs, and Hoffman Q302013PCI enclosure — BOM page, no schematic devices. Wire numbers with 'A' suffix (12111A–12117A, 12124A–12127A) are legible on TB1213/TB1214 device circuits; loop signal names S11A/B, S12A/B, S21A/B, S22A/B are legible at TB1/TB2. Fine terminal-to-terminal routing inside TB1213/TB1214 (especially the removable jumper positions and exact pin numbers for CH2 contacts) is partially illegible at scan resolution.

<details><summary>21 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| TB1:1(S11A) | TB1213:1 | estop-loop-ch1-in | 12111A |
| TB1:2(S12A) | TB1213:2 | estop-loop-ch2-in | S12A |
| TB1:3(S21A) | TB1213:3-area | estop-loop-ch3-in | S21A |
| TB1:4(S22A) | TB1213:4-area | estop-loop-ch4-in | S22A |
| TB1213:1 | PB12111:SAFETY-CH1-IN | estop-loop-ch1-in | 12111A |
| PB12111:SAFETY-CH1-OUT | TB1213:3 | estop-loop-ch1-switched | 12113A |
| TB1213:4 | PB12111:SAFETY-CH2 | estop-loop-ch2-switched | 12114A |
| PB12111:DIAG | TB1213:5 | diag-ch1 | 12115A |
| TB1213:6 | TB1213-loop-return | estop-loop-ch2-out | 12116A |
| TB1213:7 | LT12117:A1 | lamp1-ctrl | 12117A |
| TB1213:loop-out | TB1214:1 | estop-loop-ch1-daisy | S11A-thru |
| TB1214:1 | PB12121:SAFETY-CH1-IN | estop-loop-ch1-dev2-in | 12124A |
| PB12121:SAFETY-CH1-OUT | TB1214:5 | estop-loop-ch1-dev2-switched | 12125A |
| TB1214:6 | PB12121:DIAG | diag-ch2 | 12126A |
| TB1214:7 | LT12127:A1 | lamp2-ctrl | 12127A |
| TB1214:loop-out(S11B) | TB2:1(S11B) | estop-loop-ch1-out | S11B |
| TB1214:loop-out(S12B) | TB2:2(S12B) | estop-loop-ch2-out | S12B |
| TB1214:loop-out(S21B) | TB2:3(S21B) | estop-loop-ch3-out | S21B |
| TB1214:loop-out(S22B) | TB2:4(S22B) | estop-loop-ch4-out | S22B |
| TB1215:1-4 | NEAREST-IO-PANEL-1 | io-estop1-status | TB1215-field |
| TB1216:1-4 | NEAREST-IO-PANEL-2 | io-estop2-status | TB1216-field |

</details>
