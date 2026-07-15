# LS4000 Clock Pulse Unit — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 1 sections · 15 devices · 21 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| PE-SYNC | other |  |  | BLK→signal-out; BLU→0V; BRN→24V |
| PJ14003 | other |  |  |  |
| CBL14003 | other |  |  |  |
| TB17D | terminal |  |  | 0V→BLU; 1→WHT; 10→BLU; 2→GRN; 24V→BRN; 3→YEL; 4→GRY; 5→PNK |
| JB1 | other |  |  | JB1.1→PE; JB1.2→PE; JB1.3→PE; JB1.4→PE; JB1.5→PE; JB1.6→PE; JB1.7→PE; JB1.8→PE |
| J14044 | other |  |  |  |
| CBL14044 | other |  |  |  |
| PE 0 | other |  |  | signal→JB1.1 |
| PE 1 | other |  |  | signal→JB1.2 |
| PE 2 | other |  |  | signal→JB1.3 |
| PE 3 | other |  |  | signal→JB1.4 |
| PE 4 | other |  |  | signal→JB1.5 |
| PE 5 | other |  |  | signal→JB1.6 |
| PE 6 | other |  |  | signal→JB1.7 |
| PE 7 | other |  |  | signal→JB1.8 |

## Sections

### Section 1 (pages [1]) — confidence: med
**Function:** This page shows the 24 VDC field-wiring connections for the LS4000 sorter Clock Pulse Unit: one sync photoeye (PE-SYNC) wired directly via CBL14003 to PLC panel terminal block TB17D (input IN:31 plus 24V/0V), and eight clock-pulse photoeyes (PE 0–PE 7) aggregated through junction box JB1 via multi-conductor cable CBL14044 to TB17D inputs 1–8, with shared 24 VDC power and 0 V return on terminals 9–10.

Intelligrated 417D546 pg 140 — CLOCK PULSE LS00-S20 CONNECTION DIAGRAM. Left half: SYNC PHOTOEYE (PE-SYNC) → connector PJ14003 / CBL14003 → PLC panel TB17D (24V, 0V, IN:31). Right half: 8× CLOCK PULSE PHOTOEYES (PE 0–PE 7) → junction box JB1 (ports 1–8) → connector J14044 / CBL14044 → PLC panel TB17D (terminals 1–10). No discrete breakers, fuses, relays, or PLC I/O modules are drawn on this page; it is a pure field-wiring connection diagram. Individual 5–7-digit wire numbers on conductors are not legible at this image resolution; only color-code abbreviations (BRN, BLU, BLK, WHT, GRN, YEL, GRY, PNK, RED, VIO) and row-reference numbers (14000–14080) are readable.

<details><summary>21 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| PE-SYNC.BRN | TB17D.24V | dc24v | BRN/CBL14003 |
| PE-SYNC.BLU | TB17D.0V | dc0v | BLU/CBL14003 |
| PE-SYNC.BLK | TB17D.IN:31 | ctrl | BLK/CBL14003 |
| PE 0.signal | JB1.1 | ctrl | field conductor |
| PE 1.signal | JB1.2 | ctrl | field conductor |
| PE 2.signal | JB1.3 | ctrl | field conductor |
| PE 3.signal | JB1.4 | ctrl | field conductor |
| PE 4.signal | JB1.5 | ctrl | field conductor |
| PE 5.signal | JB1.6 | ctrl | field conductor |
| PE 6.signal | JB1.7 | ctrl | field conductor |
| PE 7.signal | JB1.8 | ctrl | field conductor |
| JB1.1 | TB17D.1 | ctrl | WHT/CBL14044 |
| JB1.2 | TB17D.2 | ctrl | GRN/CBL14044 |
| JB1.3 | TB17D.3 | ctrl | YEL/CBL14044 |
| JB1.4 | TB17D.4 | ctrl | GRY/CBL14044 |
| JB1.5 | TB17D.5 | ctrl | PNK/CBL14044 |
| JB1.6 | TB17D.6 | ctrl | RED/CBL14044 |
| JB1.7 | TB17D.7 | ctrl | BLK/CBL14044 |
| JB1.8 | TB17D.8 | ctrl | VIO/CBL14044 |
| JB1.PWR | TB17D.9 | dc24v | BRN/CBL14044 |
| JB1.COM | TB17D.10 | dc0v | BLU/CBL14044 |

</details>
