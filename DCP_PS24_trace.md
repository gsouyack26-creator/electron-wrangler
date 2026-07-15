# DCP 24V Distributed Control — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 4 sections · 35 devices · 63 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| TB1A | terminal | 6 | 480V AC | GND→GND; L1→06105A; L2→06106A; L3→06107A |
| DS06105 | disconnect | 3 | 30A / 480V AC; 3× 10A Bussmann LPJ-10SP fuses internal | AUX_in→06123A; AUX_out→06123B; L1_in→06105A; L1_out→06105B; L2_in→06106A; L2_out→06106B; L3_in→06107A; L3_out→06107B |
| PWS06105 | psu | 2 | 480V AC → 24VDC / 4A / Class 2 (AB 1606-XLP90E-2) | DC_pos→06109A; GND→GND; L1_in→06105B; L2_in→06106B |
| PWS06115 | psu | 2 | 480V AC → 24VDC / 4A / Class 2 (AB 1606-XLP90E-2) | DC_pos→06119A; GND→GND; L1_in→06112A |
| PWS06125 | psu | 2 | 480V AC → 24VDC / 4A / Class 2 (AB 1606-XLP90E-2) | DC_pos→06129A; GND→GND; L1_in→06122A |
| CR06105 | relay | 1 | 24VDC coil / 1PDT (Phoenix Contact PLC-RSC-24DC/21) | A1→06109A; A2→GND; NO_out→06102A; monitor_in→06127A; monitor_out→06127B |
| CR06115 | relay | 1 | 24VDC coil / 1PDT (Phoenix Contact PLC-RSC-24DC/21) | A1→06119A; A2→GND; monitor_in→06133A; monitor_out→06132B |
| CR06125 | relay | 1 | 24VDC coil / 1PDT (Phoenix Contact PLC-RSC-24DC/21) | A1→06129A; A2→GND; monitor_in→06136A; monitor_out→06136B |
| TB1D | terminal | 4 | 24VDC | 1→06102A |
| TB2D | terminal | 4 | 24VDC | 1→06112A |
| TB3D | terminal | 4 | 24VDC | 1→06122A |
| TB4D | terminal | 8 | 24VDC / DC control | MAIN_SW_in→06123A; MAIN_SW_out→06123B; PS1_in→06127A; PS1_out→06127B; PS2_in→06133A; PS2_out→06132B; PS3_in→06136A; PS3_out→06136B |
| GND | terminal | 6 |  |  |
| IL2301-B318 | network |  | 24VDC |  |
| IE2401 | plc-io |  | 24VDC |  |
| IE2002 | plc-io |  | 24VDC |  |
| CABINET-PB12-12 | other |  | None |  |
| CABINET-PB4-12 | other |  | None |  |
| CABINET-PB20-20 | other |  | None |  |
| CABINET-JCT-TB | other |  | None |  |
| JB-SORTER-IO-LS4000 | terminal |  |  | 0V-BUS→0V; 24V-BUS→24V; TB-1→1; TB-10→10; TB-11→11; TB-12→12; TB-13→13; TB-14→14 |
| JB-CTB-CRB-IO-IS4000 | terminal |  |  | 0V-BUS→0V; 24V-BUS→24V; TB-1→1; TB-10→10; TB-11→11; TB-12→12; TB-13→13; TB-14→14 |
| PLUG1-PORT0 | other | 4 |  | pin1-BR→24V; pin2-WH→1; pin3-BLU→0V; pin4-BLK→9 |
| PLUG2-PORT1 | other | 4 |  | pin2-WH→2; pin4-BLK→10 |
| PLUG3-PORT2 | other | 4 |  | pin2-WH→3; pin4-BLK→11 |
| PLUG4-PORT3 | other | 4 |  | pin2-WH→4; pin4-BLK→12 |
| PLUG5-PORT4 | other | 4 |  | pin2-WH→5; pin4-BLK→13 |
| PLUG6-PORT5 | other | 4 |  | pin2-WH→6; pin4-BLK→14 |
| PLUG7-PORT6 | other | 4 |  | pin2-WH→7; pin4-BLK→15 |
| PLUG8-PORT7 | other | 4 |  | pin2-WH→8 |
| PLUG9-COUPLER-PORT7 | other | 3 |  | pin4-BLK→16 |

## Sections

### Section 1 (pages [2, 3, 4, 5]) — confidence: med
**Function:** Three independent 480V-AC-to-24VDC/4A Class 2 power supplies (PWS06105/115/125) are fed through a single 3-pole 30A fused main disconnect (DS06105), each PSU energizing one sorter 24VDC I/O supply zone through an output relay module (CR06105/115/125), while auxiliary contacts from the main switch and all three PS relays provide powered/healthy status signals back to PLC monitoring inputs at TB4D.

Page 061 is the functional schematic (primary source). Pages 251 and 259 are mechanical internal and external layout drawings for an Intelligrated-branded Hoffman CSD16208 wall-mount enclosure (EN259); they confirm physical positions of PWS, TB, CR, and DS devices but add no new wire data. Page 970 is the Bill of Material confirming: DS06105 = AB 194R-J30-1753 30A disconnect with 3× Bussmann LPJ-10SP 10A fuses; PWS = AB 1606-XLP90E-2 2-phase PSU; CR = Phoenix Contact PLC-RSC-24DC/21 relay module; TB1D/2D/3D = 4-pos AB 1492-J4; TB4D = 8-pos AB 1492-J4 with end barrier. Wire numbers on the 24VDC output sides of PSUs (06109A, 06119A, 06129A) and the second wire of the CR06115/CR06125 monitor pairs (06132B, 06136B) are partially obscured by print scale; values reported are read from row-reference positions and should be field-verified. The DS06105 L3 output wire label reads ambiguously as 06107B or 08107B — likely 06107B. Pages 251/259/970 contain no point-to-point schematic connections.

<details><summary>19 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| TB1A-L1 | DS06105-L1_in | 480V-L1 | 06105A |
| TB1A-L2 | DS06105-L2_in | 480V-L2 | 06106A |
| TB1A-L3 | DS06105-L3_in | 480V-L3 | 06107A |
| DS06105-L1_out | PWS06105-L1_in | 480V-L1-switched | 06105B |
| DS06105-L2_out | PWS06105-L2_in | 480V-L2-switched | 06106B |
| DS06105-bus | PWS06115-L1_in | 480V-switched-to-PS2 | 06112A |
| DS06105-bus | PWS06125-L1_in | 480V-switched-to-PS3 | 06122A |
| PWS06105-DC_pos | CR06105-A1 | 24VDC-PS1 | 06109A |
| CR06105-NO_out | TB1D-1 | 24VDC-zone1-output | 06102A |
| PWS06115-DC_pos | CR06115-A1 | 24VDC-PS2 | 06119A |
| PWS06125-DC_pos | CR06125-A1 | 24VDC-PS3 | 06129A |
| DS06105-AUX_in | TB4D-MAIN_SW_in | monitor-main-switch | 06123A |
| DS06105-AUX_out | TB4D-MAIN_SW_out | monitor-main-switch | 06123B |
| CR06105-monitor_in | TB4D-PS1_in | monitor-PS1 | 06127A |
| CR06105-monitor_out | TB4D-PS1_out | monitor-PS1 | 06127B |
| CR06115-monitor_in | TB4D-PS2_in | monitor-PS2 | 06133A |
| CR06115-monitor_out | TB4D-PS2_out | monitor-PS2 | 06132B |
| CR06125-monitor_in | TB4D-PS3_in | monitor-PS3 | 06136A |
| CR06125-monitor_out | TB4D-PS3_out | monitor-PS3 | 06136B |

</details>

### Section 2 (pages [6, 7, 8, 9]) — confidence: med — all four pages are legible and the BOM/component data is clear, but these are mechanical assembly drawings only; no electrical wiring diagram data (wire numbers, terminal assignments, CB/fuse tags) is present to extract
**Function:** These four pages are mechanical/assembly installation drawings for distributed Beckhoff IP67 Profibus I/O cabinet modules (types PB12-12, PB4-12, PB20-20, and W/Terminal Blocks), each comprising an IL2301-B318 Profibus coupler mated to one or two IE2401/IE2002 field I/O modules, providing the LS4000 sorter's distributed 24VDC I/O nodes on the Profibus network.

Pages 6–9 are cabinet assembly/installation drawings (not point-to-point electrical schematics). They define four variants of Beckhoff Profibus I/O field cabinets: PB12-12 (1 coupler + 1× IE2401), PB4-12 (1 coupler + 1× IE2002 output module), PB20-20 (1 coupler + 2× IE2401), and a junction/terminal-block variant (1 coupler + 1× IE2401 + LS4000 junction box). No 5–7-digit wire numbers, CB/DS/F/K/OL/TB/PDB/PS/T field tags, or terminal block wiring details are present on any of these pages. Connections are represented by prefabricated Beckhoff cables (orange Profibus, blue IP Link ZK1020-0101-0003, and 24VDC power ZK2020-3132-0005). All drawings are Intelligrated/Intelligrated project M-16-00264, rev 2B.

<details><summary>5 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| IL2301-B318 (Profibus port) | Profibus network bus | profibus | Orange Profibus cable |
| IL2301-B318 (IP Link port) | IE2401 or IE2002 (IP Link input) | ip-link | ZK1020-0101-0003, L=0.3m, part 174 |
| 24VDC supply | IL2301-B318 / IE2401 power connector ( | dc | ZK2020-3132-0005, L=0.5m, straight |
| IE2401 (IP Link out, PB20-20 only) | Second IE2401 (IP Link in) | ip-link | ZK1020-0101-0003, L=0.3m, second c |
| 24VDC supply (PB20-20, second module) | Second IE2401 power connector | dc | ZK2020-3132-0005, L=0.5m, second c |

</details>

### Section 3 (pages [10, 11, 12, 13]) — confidence: med — drawings are mechanical/wiring-assembly vendor documents, not primary electrical schematics; no 5–7 digit wire numbers present (terminal labels are positional 1–16); some BOM part numbers and dimensional callouts are small but legible at this resolution; device tag labels (IL2301-B318, IE2401) confirmed from both BOM text and cable diagram; port numbering and M8 pin-color assignments clearly legible on pages 11–12
**Function:** These four pages document the distributed Profibus field I/O node for the LS4000/IS4000 sorter: a Beckhoff IL2301-B318 Profibus coupler (4I/4O) linked via IP-Link fiber to a Beckhoff IE2401 extension module (8I/8O), each wired through M8 4-pin plugs to separate Allen-Bradley DIN-rail junction boxes (JB-SORTER-IO for the LS4000 sorter and JB-CTB-CRB-IO for the CTB/CRB sorter) that break out 24 VDC power and per-port signal conductors to field sensors and actuators via terminals 1–16.

Pages 10–13 are vendor mechanical-layout, BOM, wiring-connection, and cable-routing drawings — NOT primary panel schematics. No 5–7 digit wire tags appear; terminal designations are short positional numbers (1–16) plus 24V/0V bus labels. Page 10 (415D481): mechanical views and BOM for the CTB-CRB I/O module cabinet assembly. Page 11 (415D382): wiring connection diagram for Junction Box Sorter I/O LS4000, 8× M8 4P ports, 16-position Allen-Bradley terminal strip. Page 12 (415D383): wiring connection diagram for Junction Box CTB/CRB I/O IS4000, 8× M8 4P + 1× M8 3P ports (9 plugs), 16-position terminal strip. Page 13 (415D720): Sorter I/O cabinet cable diagram showing IL2301-B318 coupler-to-IE2401 IP-Link fiber interconnect and 24V power cable routing.

<details><summary>37 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| IL2301-B318.IP/OUT | IE2401.IP/IN | IP_LINK_FIBER | IP-LINK-FIBER (Beckhoff ZK1020-010 |
| IL2301-B318.24VOUT | IE2401.24VIN | dc | 24V POWER CABLE (Beckhoff M8-F4P–M |
| IL2301-B318.PORT7 | JB-CTB-CRB-IO-IS4000.TB-16 | ctrl | PLUG9-COUPLER-PORT7 (M8 3P, 0.5 m) |
| IL2301-B318.PORT0 | JB-SORTER-IO-LS4000.24V-BUS | dc | PLUG1-PORT0 pin1-BR (24V) |
| IL2301-B318.PORT0 | JB-SORTER-IO-LS4000.0V-BUS | ret | PLUG1-PORT0 pin3-BLU (0V) |
| IL2301-B318.PORT0 | JB-SORTER-IO-LS4000.TB-1 | ctrl | PLUG1-PORT0 pin2-WH |
| IL2301-B318.PORT0 | JB-SORTER-IO-LS4000.TB-9 | ctrl | PLUG1-PORT0 pin4-BLK |
| IL2301-B318.PORT1 | JB-SORTER-IO-LS4000.TB-2 | ctrl | PLUG2-PORT1 pin2-WH |
| IL2301-B318.PORT1 | JB-SORTER-IO-LS4000.TB-10 | ctrl | PLUG2-PORT1 pin4-BLK |
| IL2301-B318.PORT2 | JB-SORTER-IO-LS4000.TB-3 | ctrl | PLUG3-PORT2 pin2-WH |
| IL2301-B318.PORT2 | JB-SORTER-IO-LS4000.TB-11 | ctrl | PLUG3-PORT2 pin4-BLK |
| IL2301-B318.PORT3 | JB-SORTER-IO-LS4000.TB-4 | ctrl | PLUG4-PORT3 pin2-WH |
| IL2301-B318.PORT3 | JB-SORTER-IO-LS4000.TB-12 | ctrl | PLUG4-PORT3 pin4-BLK |
| IL2301-B318.PORT4 | JB-SORTER-IO-LS4000.TB-5 | ctrl | PLUG5-PORT4 pin2-WH |
| IL2301-B318.PORT4 | JB-SORTER-IO-LS4000.TB-13 | ctrl | PLUG5-PORT4 pin4-BLK |
| IL2301-B318.PORT5 | JB-SORTER-IO-LS4000.TB-6 | ctrl | PLUG6-PORT5 pin2-WH |
| IL2301-B318.PORT5 | JB-SORTER-IO-LS4000.TB-14 | ctrl | PLUG6-PORT5 pin4-BLK |
| IL2301-B318.PORT6 | JB-SORTER-IO-LS4000.TB-7 | ctrl | PLUG7-PORT6 pin2-WH |
| IL2301-B318.PORT6 | JB-SORTER-IO-LS4000.TB-15 | ctrl | PLUG7-PORT6 pin4-BLK |
| IL2301-B318.PORT7 | JB-SORTER-IO-LS4000.TB-8 | ctrl | PLUG8-PORT7 pin2-WH |
| IE2401.EXT_PORT0 | JB-CTB-CRB-IO-IS4000.24V-BUS | dc | PLUG1-EXT-PORT0 pin1-BR (24V) |
| IE2401.EXT_PORT0 | JB-CTB-CRB-IO-IS4000.0V-BUS | ret | PLUG1-EXT-PORT0 pin3-BLU (0V) |
| IE2401.EXT_PORT0 | JB-CTB-CRB-IO-IS4000.TB-1 | ctrl | PLUG1-EXT-PORT0 pin2-WH |
| IE2401.EXT_PORT0 | JB-CTB-CRB-IO-IS4000.TB-9 | ctrl | PLUG1-EXT-PORT0 pin4-BLK |
| IE2401.EXT_PORT1 | JB-CTB-CRB-IO-IS4000.TB-2 | ctrl | PLUG2-EXT-PORT1 pin2-WH |
| IE2401.EXT_PORT1 | JB-CTB-CRB-IO-IS4000.TB-10 | ctrl | PLUG2-EXT-PORT1 pin4-BLK |
| IE2401.EXT_PORT2 | JB-CTB-CRB-IO-IS4000.TB-3 | ctrl | PLUG3-EXT-PORT2 pin2-WH |
| IE2401.EXT_PORT2 | JB-CTB-CRB-IO-IS4000.TB-11 | ctrl | PLUG3-EXT-PORT2 pin4-BLK |
| IE2401.EXT_PORT3 | JB-CTB-CRB-IO-IS4000.TB-4 | ctrl | PLUG4-EXT-PORT3 pin2-WH |
| IE2401.EXT_PORT3 | JB-CTB-CRB-IO-IS4000.TB-12 | ctrl | PLUG4-EXT-PORT3 pin4-BLK |
| IE2401.EXT_PORT4 | JB-CTB-CRB-IO-IS4000.TB-5 | ctrl | PLUG5-EXT-PORT4 pin2-WH |
| IE2401.EXT_PORT4 | JB-CTB-CRB-IO-IS4000.TB-13 | ctrl | PLUG5-EXT-PORT4 pin4-BLK |
| IE2401.EXT_PORT5 | JB-CTB-CRB-IO-IS4000.TB-6 | ctrl | PLUG6-EXT-PORT5 pin2-WH |
| IE2401.EXT_PORT5 | JB-CTB-CRB-IO-IS4000.TB-14 | ctrl | PLUG6-EXT-PORT5 pin4-BLK |
| IE2401.EXT_PORT6 | JB-CTB-CRB-IO-IS4000.TB-7 | ctrl | PLUG7-EXT-PORT6 pin2-WH |
| IE2401.EXT_PORT6 | JB-CTB-CRB-IO-IS4000.TB-15 | ctrl | PLUG7-EXT-PORT6 pin4-BLK |
| IE2401.EXT_PORT7 | JB-CTB-CRB-IO-IS4000.TB-8 | ctrl | PLUG8-EXT-PORT7 pin2-WH |

</details>

### Section 4 (pages [14]) — confidence: med
**Function:** This page is a standard CTB-CRB I/O cabinet wiring diagram showing a Profibus coupler module (IL2301-B318, 4in/4out) connected via IP Link Fiber and 24V power cable to an extension I/O module (IE2401, 8in/8out), forming a distributed Profibus I/O node within the DCP_PS 24V panel; the right side shows the corresponding physical panel layout with coupler port and extension ports labeled.

Page DCP_PS24_14 — CTB-CRB I/O Cabinet Wiring Diagram (Standard), drawing 415D721 rev 0, dated 22-07-2012. Shows two inline I/O devices: Profibus coupler IL2301-B318 (4I/4O) and extension module IE2401 (8I/8O), linked by IP Link Fiber and 24V power cable. Right side shows a physical enclosure diagram with COUPLER PORT and multiple EXT PORT connections (fiber cables). Note: 'CONNECT CABLES ACCORDING TO CABLE LABELING' instruction present. No 7-digit wire numbers visible on this page. No circuit breakers, fuses, contactors, or power supplies shown.

<details><summary>2 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| IL2301-B318:IP/OUT | IE2401:IP/IN | fiber | IP_LINK_FIBER |
| IL2301-B318:24VOUT | IE2401:24VIN | dc | 24V_POWER_CABLE |

</details>
