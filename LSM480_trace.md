# LS4000 LSM 480VAC (Profibus) — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 3 sections · 65 devices · 52 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| DS06103 | disconnect | 3 | 480VAC 30A | L1_line→06103; L1_load→06103A; L2_line→06104; L2_load→06104A; L3_line→06105; L3_load→06105A |
| VFD06114 | other | 3 | 480VAC | L1→06103A; L2→06104A; L3→06105A; PE→GND; X10_0V→06704A; X10_24V→06703A; X10_24VDC_ref→from_14329; X10_AGND_ref→from_14328 |
| REG06118 | other |  | 72 ohms 500W; WARNING voltage up to 800V | T1→BROWN; T2→WHITE |
| TB_JBLSM | terminal |  |  | L1→06103B; L2→06104B; L3→06105B |
| INT06605 | network |  |  | 0V_in→06704A; 24V_in→06703A; X26_DB9M→encoder_from_LSM; X30_DB9F→PL06622; ctrl_out→06611A |
| PL06622 | network |  |  | DB9M→Profibus_network |
| CB06703 | breaker |  | 4A | N_contact_out→06703; in→06703A; out→06703B |
| TB1D | terminal |  |  | 0V_in→06704A; 24V_in→06703A |
| TB2D | terminal |  |  | 0V_neg→06704A; 24V_pos→06703B |
| FAN06708 | other |  |  | neg→06704A; pos→06703B |
| CR13102 | relay |  |  | A1→14226A; A2→0VDC; NO_in_loop1_a→13110A; NO_in_loop1_b→13111A; NO_out_loop1_a→13110B; NO_out_loop1_b→13111A |
| CR13105 | relay |  |  | A1→13105A; A2→0VDC |
| CR13108 | relay |  |  | A1→13108A; A2→0VDC; NO_loop3_in→13108A; NO_loop3_out→13108B |
| TB3D | terminal | 6 |  | 1_LOOP1_A→13110A; 2_LOOP1_B→13111A; 3_LOOP2_A→14221A; 4_LOOP2_B→06704A; 5_LOOP3_A→13108A; 6_LOOP3_B→13108B; GND→GND |
| TB4D | terminal | 6 |  | 1_LOOP1_A→13110B; 2_LOOP1_B→13111A; 3_LOOP2_A→14221A; 4_LOOP2_B_to14322→06704A; 5_LOOP3_A→13108A; 6_LOOP3_B→13108B; GND→GND |
| TB5D | terminal |  |  | (+)_bus→06703B; (-)_bus→06704A; ch1_field→14203A; ch2_field→14207A; ch3_field→14211A; ch4_field→14215A; ch5_field→14219A; ch6_field→14221A |
| TB6D | terminal |  |  | (+)_bus→06703B; (-)_bus→06704A; out1→14315A; out2→14319A; out3→14322B; out4_spare→14327A; out5_spare→14330A |
| P14218B | other |  |  | pin→14217 |
| J14218B | other |  |  | pin1→14219A; pin2→14221A |
| LT14319 | other |  |  | A1→14319A; A2→06704A |
| D14322 | other |  |  | anode→14322B; cathode→14323A |
| CR1310A | relay |  |  | A1→14322B; A2→14221A |
| AH14323 | other |  |  | A1→14323A; A2→06704A |
| TB10 | terminal |  |  |  |
| TB20 | terminal |  |  |  |
| TB30 | terminal |  |  |  |
| TB40 | terminal |  |  |  |
| TB50 | terminal |  |  |  |
| TB60 | terminal |  |  |  |
| TB4322 | terminal |  |  |  |
| RE06118 | other |  |  |  |
| DS06105 | disconnect |  | 480 V |  |
| J14218 | other |  |  |  |
| DCP_LSM | other |  |  |  |
| CBL06633 | other |  |  |  |
| EA251 | other |  |  |  |
| EN259 | other |  |  |  |
| GND06106 | other |  |  |  |

## Sections

### Section 1 (pages [2, 3, 4, 5]) — confidence: med
**Function:** This section of the LSM panel distributes 3-phase 480VAC from main power through a 30A fused disconnect (DS06103) to a variable-frequency drive (VFD06114) that runs the LSM rotary-disc sorter motor, with a dynamic brake resistor (REG06118) and a Profibus gateway module (INT06605) interfacing the VFD to the plant Profibus network; additionally it provides 24VDC distribution with circuit breaker protection (CB06703) for cabinet cooling fan power and I/O monitoring, and implements relay logic (CR13102/CR13105/CR13108) to route and condition the Main-Switch-ON, Remote-Jog, and OK-to-Start-Jog safety-loop chains passed between adjacent DCP_LSM panels.

Four pages: pg 061 — 480VAC main power feed via DS06103 fused disconnect to VFD06114 and JB-LSM junction box, with REG06118 brake resistor; pg 066 — Profibus gateway INT06605 wiring to VFD X10/X15 control connectors and PL06622 Profibus field plug; pg 067 — 24VDC incoming via TB1D, CB06703 (4A) protecting fan/control circuit with FAN06708 cooling fan, N-contact to I/O box; pg 131 — control relays CR13102/CR13105/CR13108 implementing incoming (TB3D) and outgoing (TB4D) 6-point safety loop chains for jog-mode signaling between chained LSM panels. Illegible: individual VFD X10 pin signal labels (many too small at scan resolution); CR13108 A1 coil wire number uncertain; exact routing of wire 06602A within VFD X10 bank unconfirmed.

<details><summary>35 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| MAIN_POWER_L1 | DS06103.L1_line | hot | 06103 |
| MAIN_POWER_L2 | DS06103.L2_line | hot | 06104 |
| MAIN_POWER_L3 | DS06103.L3_line | hot | 06105 |
| DS06103.L1_load | VFD06114.L1 | hot | 06103A |
| DS06103.L2_load | VFD06114.L2 | hot | 06104A |
| DS06103.L3_load | VFD06114.L3 | hot | 06105A |
| DS06103.L1_load | TB_JBLSM.L1 | hot | 06103B |
| DS06103.L2_load | TB_JBLSM.L2 | hot | 06104B |
| DS06103.L3_load | TB_JBLSM.L3 | hot | 06105B |
| VFD06114.brk_pos | REG06118.T1 | hot | BROWN |
| VFD06114.brk_neg | REG06118.T2 | ret | WHITE |
| VFD06114.X10_24V | INT06605.24V_in | dc | 06703A |
| VFD06114.X10_0V | INT06605.0V_in | dc | 06704A |
| VFD06114.X10_ctrl | INT06605.ctrl_in | ctrl | 06602A |
| INT06605.X26_DB9M | VFD06114.X15_DB9F | ctrl | encoder_cable |
| INT06605.X30_DB9F | PL06622.DB9M | network | Profibus_cable_CBL06633 |
| INT06605.ctrl_out | VFD06114.X10_in | ctrl | 06611A |
| TB1D.24V_in | CB06703.in | dc | 06703A |
| CB06703.out | TB2D.24V_pos | dc | 06703B |
| TB1D.0V_in | TB2D.0V_neg | dc | 06704A |
| TB2D.24V_pos | FAN06708.pos | dc | 06703B |
| TB2D.0V_neg | FAN06708.neg | dc | 06704A |
| CB06703.N_contact_out | IO_BOX | ctrl | 06703 |
| CR13102.A1 | pg14226_source | ctrl | 14226A |
| CR13102.A2 | 0VDC_bus | dc | 06739 |
| TB3D.1_LOOP1_A | CR13102.NO_in_a | ctrl | 13110A |
| CR13102.NO_out_a | TB4D.1_LOOP1_A | ctrl | 13110B |
| TB3D.2_LOOP1_B | TB4D.2_LOOP1_B | ctrl | 13111A |
| pg14225_source | CR13105.A1_path | ctrl | 14221A |
| CR13105.A1 | CR13108_interlock_contact | ctrl | 13105A |
| CR13105.A2 | 0VDC_bus | dc | 06739 |
| CR13108.A2 | 0VDC_bus | dc | 06739 |
| TB3D.5_LOOP3_A | TB4D.5_LOOP3_A | ctrl | 13108A |
| TB3D.6_LOOP3_B | TB4D.6_LOOP3_B | ctrl | 13108B |
| TB4D.4_LOOP2_B | pg14322_dest | ctrl | 06704A |

</details>

### Section 2 (pages [6, 7, 8, 9]) — confidence: med — schematic text on pages 142–143 is generally legible; most wire numbers (06703B, 06704A, 1420xA series, 1421xA, 14227B, 14230A, 14315A, 14319A, 14322B, 14323A) read with reasonable confidence. Uncertainties: (1) CR1310A contact tag may be CR13108 (second character grouping ambiguous at scan resolution); (2) wire at CR1310A second terminal reads as 14221A but could be 4221A (leading digit cut off); (3) interior layout page 251 device tags are legible but no wiring detail is present; (4) door-layout page 259 DCP part number PM840305196 and main-switch tag DS06105 are readable but small — suffix digits may be off by one.
**Function:** Pages 142–143 provide the discrete PLC I/O interface for the LSM LS4000 sorter drive panel: eight digital inputs (three LSM stator over-temperature sensors, one collision-guard switch, jog-pendant plug-detect, jog switch, main-disconnect auxiliary contact, and remote-control-jog-mode relay contact) wired through terminal block TB5D to the PLC I/O cable, and five digital outputs (VFD auto-mode enable, LINEAR MOTOR ERROR pilot lamp, external alarm horn with diode suppression and interposing relay, plus two spares) wired from the PLC I/O cable through terminal block TB6D to field devices. Pages 251 and 259 are interior and exterior enclosure layout drawings (no wiring connections shown) identifying the physical mounting positions of the SEW Eurodrive 5.5 kW/400 VAC/12.3 A VFD (VFD06114), line reactor (RE06118), control relays (CR13102/13105/13108), circuit breaker (CB06703), main rotary-handle disconnect (DS06103/DS06105), terminal block rows (TB10–TB60, TB4322, TB20), panel cooling fan (FAN06708), door-mounted error lamp (LT14319), jog pendant receptacle (J14218), and LSM DCP operator panel (DCP_LSM).

Four-page set for the LSM 480VAC Profibus panel (project M-16-00264, ACY1 LS4000 sorter). Pages 142–143 are discrete PLC I/O schematics: 8 inputs via TB5D (LSM over-temp ×3, collision guard, jog-pendant detect/switch, disconnect status, jog relay) and 5 outputs via TB6D (VFD auto-mode, error lamp LT14319, alarm horn AH14323 with flyback diode D14322 and interposing contact CR1310A, 2× spare). Control power bus is 240C / 0VDC (cross-ref from pg 06739/13154). Pages 251 and 259 are mechanical layout drawings showing interior component placement and door/exterior hardware.

<details><summary>17 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| control_power_hot_bus | TB5D_(+) | ctrl_240C_hot | 06703B |
| control_power_ret_bus | TB5D_(-) | ctrl_0VDC_ret | 06704A |
| LSM_ASSEMBLY_overtemp_stator1 | TB5D_ch1 | ctrl | 14203A |
| LSM_ASSEMBLY_overtemp_stator2 | TB5D_ch2 | ctrl | 14207A |
| LSM_ASSEMBLY_overtemp_stator3 | TB5D_ch3 | ctrl | 14211A |
| LSM_ASSEMBLY_collision_guard | TB5D_ch4 | ctrl | 14215A |
| J14218B_pin1 | TB5D_ch5 | ctrl | 14219A |
| J14218B_pin2 | TB5D_ch6 | ctrl | 14221A |
| DS06103_aux_contact | TB5D_ch7 | ctrl | 14227B |
| CR13105_contact | TB5D_ch8 | ctrl | 14230A |
| TB6D_out1 | VFD_auto_mode_input_pg06629 | ctrl | 14315A |
| TB6D_out2 | LT14319_A1 | ctrl | 14319A |
| TB6D_out3 | D14322_anode | ctrl | 14322B |
| D14322_cathode | AH14323_A1 | ctrl | 14323A |
| CR1310A_contact_NO | AH14323_in_series | ctrl | 14322B |
| TB6D_(+) | control_power_hot_bus | ctrl_240C_hot | 06703B |
| TB6D_(-) | control_power_ret_bus | ctrl_0VDC_ret | 06704A |

</details>

### Section 3 (pages [10, 11]) — confidence: high
**Function:** These two pages (drawings 970–971) are the Bill of Material (BOM) for the LSM 480VAC Panel with Profibus, listing all panel components — breaker, fused disconnect, relays, terminal blocks, Profibus gateway, SEW Eurodrive VFD, brake resistor, enclosure hardware, and accessories — with catalog numbers, manufacturers, internal part numbers, and quantities; no point-to-point wiring or wire numbers are present.

Pages 970–971 are BOM/parts-list sheets, not wiring diagrams. All 23 tagged line items are extracted above. No wire numbers, terminal assignments, or connection data appear on these pages; all terminals objects are empty accordingly.

