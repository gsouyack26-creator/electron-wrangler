# Standard Induction I/O Control — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 4 sections · 77 devices · 135 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| TOC-001 | other |  |  |  |
| CB06302 | breaker | 2 | 4A | IN→06302A; OUT→06302B |
| TB1D | terminal |  |  | 1→06302A; 2→06304A |
| TB4D | terminal |  |  | ckt1-pos→06302B; ckt2-pos→06304A |
| TB3D | terminal |  |  | GND-1→GND; GND-2→GND |
| TB2D | terminal |  |  | 1→06325A; 2→06326A; 3→06327A; 4→06328A |
| J06324 | other |  |  | 1-BN-24VDC→24VDC; 2-WH-STO_DIAG_B→06325A; 3-BU-STO_DIAG_A→06326A; 4-BK-SIA→06327A; 5-GY-SIB→06328A |
| TB6D | terminal |  |  | S11A→S11A; S12A→S12A; S21A→S21A; S22A→S22A |
| TB7D | terminal |  |  | S11D→S11D; S12A→S12A; S21D→S21D; S22A→S22A |
| TB8D | terminal |  |  | 1-S11A→S11A; 2-S11B→S11B; 3-S12A→S12A; 4-S21A→S21A; 5-S21B→S21B; 6-LCP_ESTOP_24V→14506A; 7-LCP_ESTOP_SIG→15015A; 8-LCP_LAMP_24V→14549A |
| TB9D | terminal |  |  | 1-S11B→S11B; 2-S11C→S11C; 3-S21B→S21B; 4-S21C→S21C; 5-LEFTPC_ESTOP_24V→14509A; 6-LEFTPC_ESTOP_SIG→13025A; 7-LEFTPC_LAMP_24V→14552A; 8-LEFTPC_LAMP_0V→14550A |
| TB10D | terminal |  |  | 1-S11C→S11C; 2-S11D→S11D; 3-S21C→S21C; 4-S21D→S21D; 5-RIGHTPC_ESTOP_24V→14512A; 6-RIGHTPC_ESTOP_SIG→13035A; 7-RIGHTPC_LAMP_24V→14555A; 8-RIGHTPC_LAMP_0V→14555A |
| J13010 | estop |  |  | 1-GN→S11A; 2-YE→S11B; 3-CY→S21A; 4-PK→S21B; 5-BU→14506A; 6-RD→15015A; 7-BN→14549A; 8-WH→14547A |
| PLC14002 | plc-io |  | 24VDC | I0-0VDC→0VDC; I0-24VDC→24VDC; I0-INPUT→SYNC_PEC; I1-INPUT→SPARE; I2-INPUT→SPARE; I3-INPUT→SPARE; O4-0VDC→0VDC; O4-24VDC→24VDC |
| PLC14102 | plc-io | 16 | 24VDC | 0VDC_supply→14105A; 24VDC_supply→14106A; I:0→14107A; I:1→14110A; I:2→14113A; I:3→14116A; I:4→14119A; I:5→14122A |
| PLC14202 | plc-io | 16 | 24VDC | I:0→14207A; I:1→14210A; I:2→14213A; I:3→14216A; I:4→14219A; I:5→14222A; I:6→14225A; I:7→14228A |
| PLC14302 | plc-io | 16 | 24VDC | I:0→14307A; I:1→14310A; I:2→14313A; I:3→14316A; O:0_ret→14350A; O:0_sig→14349A; O:1→14352A; O:4→14361A |
| PLC14402 | plc-io | 16 | 24VDC | I:4→14419A; I:5→14422A; I:6→14425A; I:7→14428A; O:6→14467B; O:7→14470B |
| J14105 | terminal |  |  | pin_1→14110A; pin_10→14125A; pin_11→14128A; pin_12→GN-YE; pin_13→14207A; pin_14→14210A; pin_15→14213A; pin_16→14216A |
| J14147 | terminal |  |  | C→14155A; E→14149A; G→14167A; M→14147A; N→14158A; O→14152A; P→14148A; R→14164A |
| J14247 | terminal |  |  | C→14255A; E→14249A; G→14267A; M→14247A; N→14258A; O→14252A; P→14248A; R→14264A |
| J14306 | terminal |  |  | LCP_error→14313A; LCP_lamp_test→14316A; LCP_start→14307A; LCP_stop→14310A; common→14306A |
| SS14419 | other |  |  | BIT1_out→14419A; BIT2_out→14422A; BIT3_out→14425A; BIT4_out→14428A; common_supply→14418A |
| AH14361 | other |  |  | A1→14361A; A2→14362A |
| LT14364 | other |  |  | A1→14364A |
| LT14367 | other |  |  | A1→14367A; A2→14367B |
| LT14370 | other |  |  | A1→14370A |
| CR14467 | relay |  |  | A1→14467A; A2→14467B |
| CR14470 | relay |  |  | A1→14470A; A2→14470B |
| PLC14502 | plc-io |  | 24VDC | I:0_24V→14506A; I:0_SIG→13015A; I:1_24V→14509A; I:1_SIG→13025A; I:2_24V→14512A; I:2_SIG→13035A; I:3_A→14515A; I:3_B→14515B |
| CR14515 | relay |  |  | 11→14515A; 14→14515B |
| J14523 | other |  |  | pin_A→14524A; pin_B→14523A; pin_C→14528A |
| P14523 | other |  |  |  |
| ENCL259 | other |  |  |  |

## Sections

### Section 1 (pages [1, 2, 3, 4]) — confidence: med
**Function:** This section distributes Class 2 24VDC power from an upstream panel through CB06302 (4A) into five labeled circuits (Circuit 1=Remote PEC I/O, Circuit 3=VFD External, Circuits 2/4/5=Spare) with an optional Safe Torque Off connector (J06324), routes a dual-channel safety e-stop loop through three daisy-chained e-stop device terminal blocks (TB8D=LCP, TB9D=Left Pullcord optional, TB10D=Right Pullcord optional) between loop-in (TB6D) and loop-out (TB7D), and provides a Beckhoff Profibus/IP coupler-box I/O module (PLC14002) with one SYNC PEC digital input and seven spare 24VDC I/O channels.

Four pages scanned. p001: Table of Contents only — no devices. p063: 24VDC power distribution; CB06302 (4A) feeds TB4D rail → 5 circuits; TB3D is 0VDC return; TB2D + J06324 provide optional Safe Torque Off (STO) signals (06325A–06328A). p130: Dual-channel e-stop safety loop (S11/S12 ch1, S21/S22 ch2) enters TB6D, daisy-chains through TB8D (LCP via J13010 8-pin), TB9D (Left Pullcord, optional, yellow jumpered), TB10D (Right Pullcord, optional, yellow jumpered), exits TB7D; each device block also carries 24VDC supply, e-stop signal, and lamp wires (14506A/15015A/14549A/14547A for LCP; 14509A/13025A/14552A/14550A for left pullcord; 14512A/13035A/14555A for right pullcord). p140: PLC14002 coupler-box I/O — I:0=SYNC PEC, I:1–I:3 spare inputs, O:4–O:7 spare outputs, 24VDC, Profibus/IP reference pg 19000. Illegible: some small wire numbers on TB4D/TB3D internal return connections; exact pole-count on CB06302 (shown as 2-pole symbol but 24VDC may be 1-pole); last right-pullcord lamp 0VDC wire number (14555A listed twice — second may be 14553A, partially legible).

<details><summary>37 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| TB1D.1 | CB06302.IN | dc | 06302A |
| CB06302.OUT | TB4D.ckt1-pos | dc | 06302B |
| TB4D.ckt1-pos | 19028 | 24vdc-ckt1-remote-pec | 06302B |
| TB3D.GND-1 | 19029 | ret | 0VDC |
| TB3D.GND-1 | 19030 | ret | 0VDC |
| TB1D.2 | TB4D.ckt2-pos | dc | 06304A |
| TB4D.ckt2-pos | 19031 | 24vdc-ckt2-spare | 06304A |
| TB2D.1 | J06324.2-WH-STO_DIAG_B | ctrl | 06325A |
| TB2D.2 | J06324.3-BU-STO_DIAG_A | ctrl | 06326A |
| TB2D.3 | J06324.4-BK-SIA | ctrl | 06327A |
| TB2D.4 | J06324.5-GY-SIB | ctrl | 06328A |
| TB6D.S11A | TB8D.1-S11A | estop | S11A |
| TB6D.S12A | TB8D.3-S12A | estop | S12A |
| TB6D.S21A | TB8D.4-S21A | estop | S21A |
| TB6D.S22A | TB7D.S22A | estop | S22A |
| TB8D.2-S11B | TB9D.1-S11B | estop | S11B |
| TB8D.5-S21B | TB9D.3-S21B | estop | S21B |
| TB9D.2-S11C | TB10D.1-S11C | estop | S11C |
| TB9D.4-S21C | TB10D.3-S21C | estop | S21C |
| TB10D.2-S11D | TB7D.S11D | estop | S11D |
| TB10D.4-S21D | TB7D.S21D | estop | S21D |
| J13010.1-GN | TB8D.1-S11A | estop | S11A |
| J13010.2-YE | TB8D.2-S11B | estop | S11B |
| J13010.3-CY | TB8D.4-S21A | estop | S21A |
| J13010.4-PK | TB8D.5-S21B | estop | S21B |
| J13010.5-BU | TB8D.6-LCP_ESTOP_24V | dc | 14506A |
| J13010.6-RD | TB8D.7-LCP_ESTOP_SIG | ctrl | 15015A |
| J13010.7-BN | TB8D.8-LCP_LAMP_24V | dc | 14549A |
| J13010.8-WH | TB8D.9-LCP_LAMP_0V | ret | 14547A |
| TB9D.5-LEFTPC_ESTOP_24V | 14509 | dc | 14509A |
| TB9D.6-LEFTPC_ESTOP_SIG | 14510 | ctrl | 13025A |
| TB9D.7-LEFTPC_LAMP_24V | 14552 | dc | 14552A |
| TB9D.8-LEFTPC_LAMP_0V | 14550 | ret | 14550A |
| TB10D.5-RIGHTPC_ESTOP_24V | 14512 | dc | 14512A |
| TB10D.6-RIGHTPC_ESTOP_SIG | 14513 | ctrl | 13035A |
| TB10D.7-RIGHTPC_LAMP_24V | 14555 | dc | 14555A |
| TB10D.8-RIGHTPC_LAMP_0V | 14553 | ret | 14555A |

</details>

### Section 2 (pages [5, 6, 7, 8]) — confidence: med
**Function:** Four Profibus-connected 24VDC I/O extension boxes that digitally monitor circuit breaker trip status for belts 1–12, main disconnect and 24VDC supply health, LCP operator pushbuttons, and a 16-position mode-selector switch, while outputting belt control data bits (CTB.IC.C / CTB.IC.I), LCP status lamps, optional audible/visual stack-light signals, and 24VDC relay coils for the Induction Ready Next Item (RNI) and Induction Running (IR) status outputs to the sorter control system.

Pages 141–144 (revision 8, project M-16-00264, ACY1 BEUMER/Intelligrated LS4000 sorter). Devices: four Profibus remote I/O modules PLC14102/14202/14302/14402 (each 8 DI + 8 DO at 24VDC, all referencing Profibus power/IP reference 19000). Box 1 (pg 141): 8 inputs from multi-pin connector J14105 for main disconnect, 24V supply, and CB-trip supervision on belts 1–6; 8 outputs (CTB.IC.C BIT 0–7) routed to terminal block J14147 (pins M/O/C/N/U/R/G/S). Box 2 (pg 142): 8 inputs continuing from J14105 (pins 3,4,13–18) for CB supervision belts 7–12 plus 2 spare; 8 outputs (CTB.IC.I BIT 0–7) to J14247. Box 3 (pg 143): 4 inputs from J14306 connector for LCP pushbuttons (Start/Stop/Error/Lamp Test); outputs drive LCP In-Operation signal (14349A xref to sheet 14306), LCP Error Lamp (14352A), and optional field-wired alarm horn AH14361 (14361A), E-Stop stack lamp LT14364 (14364A), Induction Running stack lamp LT14367 (14367A/B), and Induction Error stack lamp LT14370 (14370A). Box 4 (pg 144): 4 inputs from 16-position 4-bit encoded selector switch SS14419 (wire 14418A common, BIT1–4 on 14419A/14422A/14425A/14428A, truth table positions AUTO/M1–M12 for testing); 2 used outputs drive relay coils CR14467 (RNI, 14467B→A2) and CR14470 (IR, 14470B→A2); all other I/O channels spare. All internal 24V wiring is 18 AWG; 24V=blue wires, 0V=white/blue-stripe per panel spec ENC-149.

<details><summary>54 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| J14105.pin_6 | PLC14102.0VDC_supply | ret | 14105A |
| J14105.pin_19 | PLC14102.24VDC_supply | dc | 14106A |
| J14105.pin_2 | PLC14102.I:0 | ctrl | 14107A |
| J14105.pin_1 | PLC14102.I:1 | ctrl | 14110A |
| J14105.pin_5 | PLC14102.I:2 | ctrl | 14113A |
| J14105.pin_7 | PLC14102.I:3 | ctrl | 14116A |
| J14105.pin_8 | PLC14102.I:4 | ctrl | 14119A |
| J14105.pin_9 | PLC14102.I:5 | ctrl | 14122A |
| J14105.pin_10 | PLC14102.I:6 | ctrl | 14125A |
| J14105.pin_11 | PLC14102.I:7 | ctrl | 14128A |
| PLC14102.O:0 | J14147.M | ctrl | 14147A |
| PLC14102.O:1 | J14147.O | ctrl | 14152A |
| PLC14102.O:2 | J14147.C | ctrl | 14155A |
| PLC14102.O:3 | J14147.N | ctrl | 14158A |
| PLC14102.O:4 | J14147.U | ctrl | 14161A |
| PLC14102.O:5 | J14147.R | ctrl | 14164A |
| PLC14102.O:6 | J14147.G | ctrl | 14167A |
| PLC14102.O:7 | J14147.S | ctrl | 14170A |
| J14105.pin_13 | PLC14202.I:0 | ctrl | 14207A |
| J14105.pin_14 | PLC14202.I:1 | ctrl | 14210A |
| J14105.pin_15 | PLC14202.I:2 | ctrl | 14213A |
| J14105.pin_16 | PLC14202.I:3 | ctrl | 14216A |
| J14105.pin_17 | PLC14202.I:4 | ctrl | 14219A |
| J14105.pin_18 | PLC14202.I:5 | ctrl | 14222A |
| J14105.pin_3 | PLC14202.I:6 | ctrl | 14225A |
| J14105.pin_4 | PLC14202.I:7 | ctrl | 14228A |
| PLC14202.O:0 | J14247.M | ctrl | 14247A |
| PLC14202.O:1 | J14247.O | ctrl | 14252A |
| PLC14202.O:2 | J14247.C | ctrl | 14255A |
| PLC14202.O:3 | J14247.N | ctrl | 14258A |
| PLC14202.O:4 | J14247.U | ctrl | 14261A |
| PLC14202.O:5 | J14247.R | ctrl | 14264A |
| PLC14202.O:6 | J14247.G | ctrl | 14267A |
| PLC14202.O:7 | J14247.S | ctrl | 14270A |
| J14306.LCP_start | PLC14302.I:0 | ctrl | 14307A |
| J14306.LCP_stop | PLC14302.I:1 | ctrl | 14310A |
| J14306.LCP_error | PLC14302.I:2 | ctrl | 14313A |
| J14306.LCP_lamp_test | PLC14302.I:3 | ctrl | 14316A |
| PLC14302.O:0_sig | XREF_14306 | ctrl | 14349A |
| PLC14302.O:0_ret | XREF_14306_ret | ret | 14350A |
| PLC14302.O:1 | XREF_LCP_error_lamp | ctrl | 14352A |
| PLC14302.O:4 | AH14361.A1 | ctrl | 14361A |
| PLC14302.O:5 | LT14364.A1 | ctrl | 14364A |
| PLC14302.O:6 | LT14367.A1 | ctrl | 14367A |
| PLC14302.O:7 | LT14370.A1 | ctrl | 14370A |
| SS14419.common_supply | PLC14402_24V_bus | dc | 14418A |
| SS14419.BIT1_out | PLC14402.I:4 | ctrl | 14419A |
| SS14419.BIT2_out | PLC14402.I:5 | ctrl | 14422A |
| SS14419.BIT3_out | PLC14402.I:6 | ctrl | 14425A |
| SS14419.BIT4_out | PLC14402.I:7 | ctrl | 14428A |
| PLC14402.O:6 | CR14467.A2 | ctrl | 14467B |
| CR14467.A1 | 0VDC_return | ret | 14467A |
| PLC14402.O:7 | CR14470.A2 | ctrl | 14470B |
| CR14470.A1 | 0VDC_return | ret | 14470A |

</details>

### Section 3 (pages [9, 10, 11, 12]) — confidence: med — device tags, module model numbers, wire numbers, and cross-reference page numbers are all clearly legible on pages 145 and 190; terminal-pin assignments for I:6/I:7 test-plug wiring involve small annotation text and are partially inferred from wire-label layout; cable designator boundary between CBL19014.5 and .6 is inferred from module count; page 251 terminal-block sub-labels are only partially legible at print scale; page 255 contains no electrical wiring data (physical layout detail only)
**Function:** This section documents the complete Beckhoff Profibus/IP-Link remote I/O subsystem — bus coupler PLC14002 (IL2301-B318) chained to five IE2403 I/O modules PLC14102–PLC14502 — providing 24 VDC discrete inputs for e-stop pushbuttons, pullcord switches, a NIP relay contact, and a test plug, plus discrete outputs driving e-stop status lamps, all mounted inside the Extension Box 5 enclosure of the ACY1 LS4000 induction sorter control panel.

Four pages covering the Beckhoff remote I/O chain for the Standard Induction I/O Control Panel. Page 145 (schematic, p.145): PLC14502 (IE2403) inputs I:0–I:2 monitor the LCP e-stop pushbutton and left/right e-stop pullcords via 24 VDC supply + signal wire pairs cross-referenced to pages 130xx; I:3 reads NIP relay CR14515 contact 11-14 (wires 14515A/B); I:6 and I:7 connect test plug jack J14523 (wires 14523A/14524A/14528A). Outputs O:0–O:2 drive LCP lamp and left/right pullcord lamps via 24 VDC/0 VDC pairs back-referenced to pages 130xx; O:3–O:7 spare. Page 190 (module overview, p.190): system view of coupler PLC14002 (IL2301-B318) daisy-chained via CBL19014.1–.5 through PLC14102, PLC14202, PLC14302, PLC14402, PLC14502 (all IE2403); DC supply enters coupler from wires 06302/06303 (24 VDC) and 06304/06305 (0 VDC) via CBL19028.x harness. Page 251 (internal layout, p.251): physical layout — Beckhoff six-module rack in upper 1×3 wireway with optional Profibus repeater footprint, SS14419 selector switch, and J14523 test plug; terminal blocks TB1D–TB10D and CB06302 in lower 2×3 wireway; TB sub-labels partially legible (PROFIBUS OPTIONAL, LCP E-STOP, E-STOP INTERNAL, SAFEON INTERNAL, DOOR INTERNAL, SAFE 0VDC). Page 255 (layout details, p.255): enlarged physical rendering of PLC14002 coupler and PLC14102–PLC14502 modules; no new wiring data.

<details><summary>26 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| PLC14502.I:0_24V | xref_pg13014 | dc | 14506A |
| PLC14502.I:0_SIG | xref_pg13015 | ctrl | 13015A |
| PLC14502.I:1_24V | xref_pg13024 | dc | 14509A |
| PLC14502.I:1_SIG | xref_pg13025 | ctrl | 13025A |
| PLC14502.I:2_24V | xref_pg13034 | dc | 14512A |
| PLC14502.I:2_SIG | xref_pg13035 | ctrl | 13035A |
| PLC14502.I:3_A | CR14515.11 | ctrl | 14515A |
| CR14515.14 | PLC14502.I:3_B | ctrl | 14515B |
| J14523.pin_A | PLC14502.I:6_A | ctrl | 14524A |
| J14523.pin_B | PLC14502.I:6_B | ctrl | 14523A |
| J14523.pin_C | PLC14502.I:7_A | ctrl | 14528A |
| PLC14502.O:0_0V | xref_pg13017_LCP_LAMP_0VDC | ret | 14547A |
| PLC14502.O:0_24V | xref_pg13016_LCP_LAMP_24VDC | dc | 14549A |
| PLC14502.O:0_com | xref_14550A | dc | 14550A |
| PLC14502.O:1_0V | xref_pg13027_LEFTPULLCORD_LAMP_0VDC | ret | 14552A |
| PLC14502.O:1_24V | xref_pg13026_LEFTPULLCORD_LAMP_24VDC | dc | 14553A |
| PLC14502.O:2_com | xref_pg13036_RIGHTPULLCORD_LAMP | dc | 14555A |
| PLC14002.IP_OUT | PLC14102.IP_IN | network | CBL19014.1 |
| PLC14102.IP_OUT | PLC14202.IP_IN | network | CBL19014.2 |
| PLC14202.IP_OUT | PLC14302.IP_IN | network | CBL19014.3 |
| PLC14302.IP_OUT | PLC14402.IP_IN | network | CBL19014.4 |
| PLC14402.IP_OUT | PLC14502.IP_IN | network | CBL19014.5 |
| PLC14002.24VDC_1 | xref_06302 | dc | 06302 |
| PLC14002.24VDC_2 | xref_06303 | dc | 06303 |
| PLC14002.0VDC_1 | xref_06304 | ret | 06304 |
| PLC14002.0VDC_2 | xref_06305 | ret | 06305 |

</details>

### Section 4 (pages [13, 14, 15, 16]) — confidence: med — internal layout wire labels are legible at 5–7 digit level for dominant wires but some vertical labels are compressed and partially ambiguous at scan resolution; BOM pages (971–972) are fully legible; no ladder/schematic wiring diagrams are present in this page set so point-to-point connections are inferred from terminal-group labels rather than drawn connection lines
**Function:** These four pages define the physical arrangement of terminal blocks, relays, circuit breaker, PLC I/O nodes, and external connectors inside the 24×24-inch wall-mount enclosure of the Standard Induction I/O Control Panel (project M-16-00264), together with the complete Bill of Material confirming device catalog numbers, manufacturers, and quantities; no ladder-logic schematic connections are drawn on these pages.

Pages INDIO_13–16 are physical/BOM reference pages (not wiring schematics): page 256 is the internal DIN-rail layout showing left-to-right arrangement of three 24VDC terminal-block relays (CR14467/14470/14515, functions RNI/IR/NIP), ten terminal block groups (TB1D–TB10D) segmented into 24VDC supply, 0VDC supply, safe-torque-off, 0VDC/24VDC internal distribution, e-stop-in, e-stop-out, LCP e-stop, and optional left/right pullcord e-stop rails, plus a 4A/1P supply-rail breaker (CB06302); page 259 is the 24×24-inch Hoffman enclosure external layout with six Turck multi-pin gland-plate connectors (J06324/J13010/J14105/J14147/J14247/J14306); pages 971–972 are the full Bill of Material confirming an Allen-Bradley/Beckhoff/Turck component set including a Profibus Beckhoff coupler (PLC14002) with five 8I/8O IP-link extension boxes (PLC14102–14502), five IP-link jumper cables, power cables, a 16-position BCD address selector (SS14419), and AB 1492-J terminal block hardware.

<details><summary>18 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| TB1D.1 | TB1D.2 | 24VDC-supply | 09304A |
| TB1D.3 | TB1D.4 | 0VDC-supply | 05302A/GND |
| CB06302.load | TB4D.1 | 24VDC-internal | 06302B |
| CB06302.aux-NO | TB4D.2 | 24VDC-internal | 06302B |
| CB06302.aux-NC | TB4D.3 | ctrl | 06304A |
| TB3D.1 | TB3D.2 | 0VDC-internal | 05326A |
| TB3D.3 | TB2D.2 | safe-torque-off | 05325A |
| TB6D.1 | TB7D.1 | estop-loop | S22A |
| TB6D.2 | TB7D.3 | estop-loop | S21A |
| TB6D.3 | TB7D.2 | estop-loop | S12A |
| TB6D.4 | TB7D.4 | estop-loop | S11A |
| TB8D.5 | TB9D.1 | estop-loop | S21B |
| TB8D.7 | TB9D.3 | estop-loop | S11B |
| PLC14002.ip-link-out | PLC14102.ip-link-in | ip-link | CBL19014.1 |
| PLC14102.ip-link-out | PLC14202.ip-link-in | ip-link | CBL19014.2 |
| PLC14202.ip-link-out | PLC14302.ip-link-in | ip-link | CBL19014.3 |
| PLC14302.ip-link-out | PLC14402.ip-link-in | ip-link | CBL19014.4 |
| PLC14402.ip-link-out | PLC14502.ip-link-in | ip-link | CBL19014.5 |

</details>
