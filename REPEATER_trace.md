# LS4000 Profibus Repeater Box — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 1 sections · 4 devices · 7 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| CB06103 | breaker | 2 | 24VDC (rating value not legible) | line→06103; load_A→06103A; load_B→06103B |
| TB10 | terminal |  |  | 0V_in→06104; 0V_out→06104; L+_in→06103; L+_out→06103 |
| TB1D | terminal |  |  |  |
| REP06107 | network |  |  | A1_in→PROFIBUS_A_IN; A2_out→PROFIBUS_A_OUT; B1_in→PROFIBUS_B_IN; B2_out→PROFIBUS_B_OUT; L+→06103B; M→06104A; MS.2→not; PE→GND |

## Sections

### Section 1 (pages [2, 3, 4]) — confidence: med — wire numbers 06103/06103A/06103B/06104/06104A and terminal labels L+/M/PE/A1/B1/A2/B2 are clearly legible; CB06103 ampere rating and TB1D individual terminal wire numbers are not readable at this scan resolution; Profibus signal wire numbers (if assigned) are not visible; pg 259 is a mechanical drawing only
**Function:** This panel section supplies and protects 24VDC power (via CB06103) to an RS-485 Profibus DP repeater (REP06107) that bridges two Profibus cable segments (IN and OUT) to extend network reach on the ACY1 LS4000 sorter.

Pg 061 is the wiring schematic: 24VDC enters on TB10, passes through 2-pole breaker CB06103 (wires 06103→06103A/B), powers REP06107 (L+ and M/0V on wires 06104/06104A), and REP06107 connects Profibus A/B IN to A/B OUT (GRN=A, RED=B per color notes). Pg 251 is the interior layout showing DIN-rail mounting of TB1D, CB06103, and REP06107 in a 1"x3" wireway enclosure, with DIP switch settings for typical RS-485 repeater operation (S1 ON, MODE OFF, S2 ON). Pg 259 is a mechanical exterior enclosure drawing (12"×12" enclosure labeled DCP_REP, PN#405D373) with no electrical content to extract.

<details><summary>7 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| TB10.L+_in | CB06103.line | dc | 06103 |
| CB06103.load_A | REP06107.L+ | dc | 06103A/06103B |
| TB10.0V_in | REP06107.M | ret | 06104/06104A |
| REP06107.A1_in | PROFIBUS_SEGMENT_1_A | ctrl | PROFIBUS_A_IN |
| REP06107.B1_in | PROFIBUS_SEGMENT_1_B | ctrl | PROFIBUS_B_IN |
| REP06107.A2_out | PROFIBUS_SEGMENT_2_A | ctrl | PROFIBUS_A_OUT |
| REP06107.B2_out | PROFIBUS_SEGMENT_2_B | ctrl | PROFIBUS_B_OUT |

</details>
