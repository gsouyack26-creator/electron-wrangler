# LS4000 Profibus Networks — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 2 sections · 19 devices · 13 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| CP3-PLC | plc-io |  |  |  |
| REP-NET01B | network |  |  |  |
| REP-NET02A | network |  |  |  |
| REP-NET2B | network |  |  |  |
| REP-NET03 | network |  |  |  |
| FIELD-NODES-NET01B | network |  |  |  |
| FIELD-NODES-NET02A | network |  |  |  |
| FIELD-NODES-NET2B | network |  |  |  |
| FIELD-NODES-NET03 | network |  |  |  |
| CP41-PLC-PANEL | plc-io |  |  |  |
| REP-NET04-SEG1 | network |  |  |  |
| REP-NET04-SEG2 | network |  |  |  |
| REP-NET04-SEG3 | network |  |  |  |
| REP-NET04-SEG4 | network |  |  |  |
| REP-NET05-SEG1 | network |  |  |  |
| REP-NET05-SEG2 | network |  |  |  |
| SLAVE-NODES-NET04 | network |  |  |  |
| SLAVE-NODES-NET05 | network |  |  |  |
| M12-PROFIBUS-CONNECTOR | other |  |  | PIN1→unreadable; PIN2→unreadable; PIN3→unreadable; PIN4→unreadable |

## Sections

### Section 1 (pages [1, 2, 3, 4]) — confidence: low — network names, master PLC panel (CP#3), device-type abbreviations, cable specs, and topology structure are confirmed legible; all individual node address tags, repeater serial tags, and any wire numbers along the PROFIBUS segments are illegible at this scan resolution and have NOT been fabricated
**Function:** Defines four PROFIBUS DP field-bus networks (NET-01B Sorter, NET-02A Chute, NET-2B Chute, NET-03) all mastered from PLC panel CP#3, with LSM, DDC, IO, SG, CPS, CTB, VIS, CB and CH field devices daisy-chained via M12 PROFIBUS cable and boosted by repeaters at ≤100m (designed 280ft) segment intervals across the ACY1 LS4000 sortation conveyor.

Four-sheet PROFIBUS network topology set (Sheets 02–05 of 07, project M-16-00264, Honeywell Intelligrated). All pages share the same legend block, M12 cable pinout diagram, and five-detail repeater wiring reference. Individual device node address labels, wire numbers, and repeater sub-tags are rendered at too small a scale to resolve reliably in these PNGs — all legible structural information (network names, PLC master identity, device-type abbreviation key, cable rules) is captured above. No terminal wire numbers (5–7 digit format) are present on these network topology diagrams; such numbers appear on the power/control wiring pages of this project.

<details><summary>7 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| CP3-PLC | FIELD-NODES-NET01B | PROFIBUS-NET-01B-SORTER | M12-PROFIBUS |
| CP3-PLC | FIELD-NODES-NET02A | PROFIBUS-NET-02A-CHUTE | M12-PROFIBUS |
| CP3-PLC | FIELD-NODES-NET2B | PROFIBUS-NET-2B-CHUTE | M12-PROFIBUS |
| CP3-PLC | FIELD-NODES-NET03 | PROFIBUS-NET-03 | M12-PROFIBUS |
| REP-NET01B | FIELD-NODES-NET01B | PROFIBUS-NET-01B-SORTER | M12-PROFIBUS |
| REP-NET02A | FIELD-NODES-NET02A | PROFIBUS-NET-02A-CHUTE | M12-PROFIBUS |
| REP-NET03 | FIELD-NODES-NET03 | PROFIBUS-NET-03 | M12-PROFIBUS |

</details>

### Section 2 (pages [5, 6]) — confidence: low — Both pages are small-scale network topology maps rendered at a resolution where all individual node tags, wire labels, repeater tags, and M12 pinout values are illegible. Only the page titles (NET-04, NET-05), source panel label (CP41 PLC PANEL), device abbreviation legend, general repeater/node counts (estimated), and general network structure (dashed-line segments with repeater breakpoints) can be read with confidence. No 5–7 digit wire numbers are present on these pages.
**Function:** These two pages document the physical/logical topology of PROFIBUS DP networks NET-04 and NET-05 on the ACY1 LS4000 sorter, showing how the CP41 PLC master connects through cascaded repeaters (max 100m/328ft per segment) to all slave field devices (LSM drives, DDC nodes, IO blocks, safety gate panels, vision sensors, chute controllers, CTBs, etc.) via M12 4-pin PROFIBUS cable.

PROFIBUS_5.png = PROFIBUS NET-04 topology (sheet 06/07): 5 cable segments, ~4 repeaters, ~40–60 slave nodes of mixed types; all individual node tags illegible at scan resolution. PROFIBUS_6.png = PROFIBUS NET-05 topology (sheet 07/07): 2–3 segments, ~2 repeaters, ~15–25 slave nodes; same illegibility. Both sheets share a common bottom panel containing: (1) a node-numbering legend (DEP.IO.xx format), (2) M12 PROFIBUS cable pinout diagram (4-pin, pin/color/signal table—values unreadable), (3) PROFIBUS REPEATER DETAIL with 5 wiring configurations (Details A–E), and (4) DEVICE ABBREVIATIONS key. No traditional wiring wire-numbers (5–7 digit codes) are present; this is a network-topology/segment map, not a point-to-point wiring diagram.

<details><summary>6 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| CP41-PLC-PANEL | REP-NET04-SEG1 | PROFIBUS-NET04 | dashed-green-segment (wire number  |
| REP-NET04-SEG1 | REP-NET04-SEG2 | PROFIBUS-NET04 | dashed-green-segment (wire number  |
| REP-NET04-SEG2 | REP-NET04-SEG3 | PROFIBUS-NET04 | dashed-green-segment (wire number  |
| REP-NET04-SEG3 | REP-NET04-SEG4 | PROFIBUS-NET04 | dashed-green-segment (wire number  |
| CP41-PLC-PANEL | REP-NET05-SEG1 | PROFIBUS-NET05 | dashed-green-segment (wire number  |
| REP-NET05-SEG1 | REP-NET05-SEG2 | PROFIBUS-NET05 | dashed-green-segment (wire number  |

</details>
