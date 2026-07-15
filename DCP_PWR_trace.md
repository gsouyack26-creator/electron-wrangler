# DCP Power Distribution — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 2 sections · 63 devices · 68 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| CP82 | other |  |  |  |
| PGMBD5T3CH | pdb |  |  |  |
| DCP-LMI-01 | breaker | 3 | 15A 480VAC |  |
| DCP-LMI-02 | breaker | 3 | 15A 480VAC |  |
| DCP-LMI-03 | breaker | 3 | 15A 480VAC |  |
| DCP-LMI-04 | breaker | 3 | 15A 480VAC |  |
| DCP-LMI-05 | breaker | 3 | 15A 480VAC |  |
| DCP-LMI-06 | breaker | 3 | 15A 480VAC |  |
| DCP-LMI-07 | breaker | 3 | 15A 480VAC |  |
| TB24 | terminal | 3 |  | L1→illegible; L2→illegible; L3→illegible |
| DCP-LGN-xx (typical) | other |  |  |  |
| LINE-ESTOP (implied) | estop |  |  |  |
| PGMBD4T3CH (or similar) | pdb |  |  |  |
| DCP-LMI-CH-xx (multiple, sheets 4–5) | breaker | 3 | 15A 480VAC |  |
| CB8206124 | breaker | 3 | 30A 480VAC |  |
| MS8202125 | estop |  |  |  |
| PDB8208001 | pdb |  | 480VAC 3-phase |  |
| CBR208001 | breaker | 3 | 30A 480VAC |  |
| TB8001A | terminal |  |  |  |
| DS06103-IND01 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208011 | breaker | 3 | 30A 480VAC |  |
| TB8011A | terminal |  |  |  |
| DS06103-IND02 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208021 | breaker | 3 | 30A 480VAC |  |
| TB8021A | terminal |  |  |  |
| DS06103-IND03 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208031 | breaker | 3 | 30A 480VAC |  |
| TB8031A | terminal |  |  |  |
| DS06103-IND04 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208041 | breaker | 3 | 30A 480VAC |  |
| TB8041A | terminal |  |  |  |
| DS06103-IND05 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208051 | breaker | 3 | 30A 480VAC |  |
| TB8051A | terminal |  |  |  |
| DS06103-IND06 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208061 | breaker | 3 | 30A 480VAC |  |
| TB8061A | terminal |  |  |  |
| DS06103-IND07 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208071 | breaker | 3 | 30A 480VAC |  |
| TB8071A | terminal |  |  |  |
| DS06103-IND08 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208101 | breaker | 3 | 30A 480VAC |  |
| TB8101A | terminal |  |  |  |
| DS06103-IND09 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208111 | breaker | 3 | 30A 480VAC |  |
| TB8111A | terminal |  |  |  |
| DS06103-IND10 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208121 | breaker | 3 | 30A 480VAC |  |
| TB8121A | terminal |  |  |  |
| DS06103-IND11 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208131 | breaker | 3 | 30A 480VAC |  |
| TB8131A | terminal |  |  |  |
| DS06103-IND12 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208141 | breaker | 3 | 30A 480VAC |  |
| TB8141A | terminal |  |  |  |
| DS06103-IND13 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208151 | breaker | 3 | 30A 480VAC |  |
| TB8151A | terminal |  |  |  |
| DS06103-IND14 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CBR208161 | breaker | 3 | 30A 480VAC |  |
| TB8161A | terminal |  |  |  |
| DS06103-IND15 | disconnect | 3 | 60A 480VAC, 30A fuses |  |
| CTRL-CBs-DCP_PWR_5 | breaker |  |  |  |

## Sections

### Section 1 (pages [1, 2, 3, 4]) — confidence: low – circuit topology and device types are readable; rated values (15A, 480VAC, 1–3HP) are legible on sheet 2; individual device tag suffixes beyond DCP-LMI-01 through -07, all 7-digit wire numbers, and all text on sheet 3 (DCP_PWR_2, very faint) are not reliably legible. Sheets 4–5 text is marginally better but zone-suffix numbers and terminal wire labels remain unreadable. No wire numbers confirmed.
**Function:** Panel CP82 receives customer-supplied 3-phase 480VAC and distributes it through multiple groups of 3-pole 15A branch circuit breakers to DCP-LGN motor junction boxes, each supplying three 1–3 HP conveyor/sorter drive motors across the ACY1 LS4000 sorter zones.

Sheets 2–5 (of 9) are a multi-page one-line/schematic for the DCP motor power distribution panel CP82. Sheet 2 (DCP_PWR_1) is the most legible: a main 3-phase 480VAC bus (partially read as PGMBD5T3CH) feeds at least three rows totalling ~14+ three-pole 15A CBs assigned to DCP-LMI zones 01–07 (first row) and additional zones in lower rows. Each CB load side connects to a DCP-LGN junction box containing a 3-pole terminal block (TB24) that feeds up to three 1–3 HP motors. An E-stop reference appears in the main supply entry block. Sheet 3 (DCP_PWR_2) is extremely faint but continues the same pattern with more zones. Sheets 4–5 (DCP_PWR_3, DCP_PWR_4) show a similar but slightly different layout with individual T1/T2/T3 terminal groups per zone rather than a shared TB24 block, and at least one additional distribution bus. No PLC I/O cards, contactors, overloads, transformers, power supplies, or Profibus devices are visible on any of these four pages. All 7-digit wire numbers are illegible at this scan resolution.

<details><summary>7 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| Customer 480VAC 3-phase 4-wire supply | Panel CP82 main bus (PGMBD5T3CH) | hot | illegible |
| LINE E-STOP contact(s) | PGMBD5T3CH main bus | hot | illegible |
| PGMBD5T3CH bus | DCP-LMI-01 through DCP-LMI-07 CBs (row | hot | illegible |
| DCP-LMI zone CBs (load side, 3-pole) | TB24 in DCP-LGN junction boxes | hot | illegible |
| TB24 terminals (L1/L2/L3) | Motor leads T1/T2/T3 (3× per zone, 1–3 | hot | illegible |
| Secondary bus (sheet 4, PGMBD4T3CH-typ | DCP-LMI-CH zone CBs (sheets 4–5, multi | hot | illegible |
| DCP-LMI-CH zone CBs | Motor terminal blocks T1/T2/T3 → MV1/M | hot | illegible |

</details>

### Section 2 (pages [5, 6, 7, 8]) — confidence: med
**Function:** Distribute 480 VAC 3-phase power from main distribution block PDB8208001 through individual 30 A feeder CBs and 60 A fused disconnects to fifteen DCP induction-drive sub-panel bus bars, each serving a group of 2 HP conveyor-sortation induction motors.

480 VAC 3-phase power from main feeder breaker CB8206124 (30 A) feeds bus PDB8208001; PDB8208001 distributes via fifteen 30 A feeder breakers (CBR208001–CBR208161) through individual terminal blocks to fifteen induction-motor sub-panels DCP-IND-01 through DCP-IND-15, each protected by a 60 A / 30 A-fused disconnect (tag DS06103 typical) and a BUS BAR serving 10–12 × 2 HP / 3.4 FLA induction sortation motors. Sheet 6 (DCP_PWR_5) also shows control/panel-power-supply branch CBs on the same 480 V bus; those CB tags and all individual wire numbers are illegible at the scan resolution supplied. Induct E-Stop device MS8202125 is cited in the CB8206124 load legend. CB numbering for sub-panels 9–10 (DCP_PWR_7 positions 4–5) is partially illegible and may be CBR208081/091 rather than CBR208101/111 as read.

<details><summary>61 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| CB8206124:load | PDB8208001:line | hot |  |
| PDB8208001 | CBR208001:line | hot |  |
| CBR208001:load | TB8001A:L | hot |  |
| TB8001A:L | DS06103-IND01:line | hot | #10AWG |
| DS06103-IND01:load | DCP-IND-01:BUSBAR | hot |  |
| PDB8208001 | CBR208011:line | hot |  |
| CBR208011:load | TB8011A:L | hot |  |
| TB8011A:L | DS06103-IND02:line | hot | #10AWG |
| DS06103-IND02:load | DCP-IND-02:BUSBAR | hot |  |
| PDB8208001 | CBR208021:line | hot |  |
| CBR208021:load | TB8021A:L | hot |  |
| TB8021A:L | DS06103-IND03:line | hot | #10AWG |
| DS06103-IND03:load | DCP-IND-03:BUSBAR | hot |  |
| PDB8208001 | CBR208031:line | hot |  |
| CBR208031:load | TB8031A:L | hot |  |
| TB8031A:L | DS06103-IND04:line | hot | #10AWG |
| DS06103-IND04:load | DCP-IND-04:BUSBAR | hot |  |
| PDB8208001 | CBR208041:line | hot |  |
| CBR208041:load | TB8041A:L | hot |  |
| TB8041A:L | DS06103-IND05:line | hot | #10AWG |
| DS06103-IND05:load | DCP-IND-05:BUSBAR | hot |  |
| PDB8208001 | CBR208051:line | hot |  |
| CBR208051:load | TB8051A:L | hot |  |
| TB8051A:L | DS06103-IND06:line | hot | #10AWG |
| DS06103-IND06:load | DCP-IND-06:BUSBAR | hot |  |
| PDB8208001 | CBR208061:line | hot |  |
| CBR208061:load | TB8061A:L | hot |  |
| TB8061A:L | DS06103-IND07:line | hot | #10AWG |
| DS06103-IND07:load | DCP-IND-07:BUSBAR | hot |  |
| PDB8208001 | CBR208071:line | hot |  |
| CBR208071:load | TB8071A:L | hot |  |
| TB8071A:L | DS06103-IND08:line | hot | #10AWG |
| DS06103-IND08:load | DCP-IND-08:BUSBAR | hot |  |
| PDB8208001 | CBR208101:line | hot |  |
| CBR208101:load | TB8101A:L | hot |  |
| TB8101A:L | DS06103-IND09:line | hot | #10AWG |
| DS06103-IND09:load | DCP-IND-09:BUSBAR | hot |  |
| PDB8208001 | CBR208111:line | hot |  |
| CBR208111:load | TB8111A:L | hot |  |
| TB8111A:L | DS06103-IND10:line | hot | #10AWG |
| DS06103-IND10:load | DCP-IND-10:BUSBAR | hot |  |
| PDB8208001 | CBR208121:line | hot |  |
| CBR208121:load | TB8121A:L | hot |  |
| TB8121A:L | DS06103-IND11:line | hot | #10AWG |
| DS06103-IND11:load | DCP-IND-11:BUSBAR | hot |  |
| PDB8208001 | CBR208131:line | hot |  |
| CBR208131:load | TB8131A:L | hot |  |
| TB8131A:L | DS06103-IND12:line | hot | #10AWG |
| DS06103-IND12:load | DCP-IND-12:BUSBAR | hot |  |
| PDB8208001 | CBR208141:line | hot |  |
| CBR208141:load | TB8141A:L | hot |  |
| TB8141A:L | DS06103-IND13:line | hot | #10AWG |
| DS06103-IND13:load | DCP-IND-13:BUSBAR | hot |  |
| PDB8208001 | CBR208151:line | hot |  |
| CBR208151:load | TB8151A:L | hot |  |
| TB8151A:L | DS06103-IND14:line | hot | #10AWG |
| DS06103-IND14:load | DCP-IND-14:BUSBAR | hot |  |
| PDB8208001 | CBR208161:line | hot |  |
| CBR208161:load | TB8161A:L | hot |  |
| TB8161A:L | DS06103-IND15:line | hot | #10AWG |
| DS06103-IND15:load | DCP-IND-15:BUSBAR | hot |  |

</details>
