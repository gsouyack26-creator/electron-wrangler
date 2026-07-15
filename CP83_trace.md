# CP83 PLC Panel — Trace Reference
*Auto-traced from drawing set M-16-00264 Rev02 (ACY1) via 14-agent page-by-page pass. 7 sections · 284 devices · 383 connections. **Best-effort read of scanned schematics — VERIFY against the source PDF before field use.***

## Device schedule

| Tag | Kind | P | Rating | Section | Terminals (role → wire#) |
|---|---|---|---|---|---|
| TB1D | terminal |  |  | 24VDC PLC Power | A_GND→GND; A_T2_24V_out→8308002A; A_T3_0V→8308003A; A_T4_24V_out→8308004A; B_GND→GND; B_T1_24V_out→8308006A; B_T2_0V→8308007A |
| CBB8308002 | breaker | 1 | 4A | 24VDC PLC Power | line→8308002A; load→8319013 |
| CBB8308003 | breaker | 1 | 4A | 24VDC PLC Power | line→8308004A; load→8308004B |
| CBB8308006 | breaker | 1 | 4A | 24VDC PLC Power | line→8308006A; load→8308006B |
| TB16D | terminal |  |  | 24VDC PLC Power | T_0V_ADD_WRE→8313200; T_0V_L_STRAP→8313100; T_0V_SAFETY_GATE→8320017; T_24V_L_STRAP→8313000; bus_in→8308006B |
| TB2D | terminal |  |  | 24VDC PLC Power | T2_AC_hot→8308030A; T34_AC_N→8308034; T8_DC_0V→8308012A; T8_DC_24V→8308011A |
| CBB8308011 | breaker | 1 | 4A | 24VDC PLC Power | line→8308011A; load→8308011B |
| TB3D | terminal |  |  | 24VDC PLC Power | T1_24V_LAMPS_AR_IO→8313400; T5_24V_BECKHOFF_IO→8317000; T6_0V_BECKHOFF_IO→8317040; T7_24V_BECKHOFF_MOD→8319128; T8_0V_BECKHOFF_MOD→8319130; T9a_0V_PROFIBUS→8319401; T9b_0V_PROFIBUS→8319402; bus_in→8308011B |
| CBB8308023 | breaker | 1 | 1A | 24VDC PLC Power | line→8308023_in; load→8308023A |
| CBB8308030 | breaker | 1 | 4A | 24VDC PLC Power | line→8308030A; load→8308030B |
| LS8308030 | other |  |  | 24VDC PLC Power | in→8308030B; out→8308030B_sw |
| MOT8308030 | other |  |  | 24VDC PLC Power | L1→8308030B_sw; N→TB2D_T5 |
| LTB8308032 | other |  |  | 24VDC PLC Power | L→8308032A; N→TB2D_T6 |
| PBLTB8312102 | other |  |  | 24VDC PLC Power | S11_in→8312103; S12_out→8312110; S21_in→8312104; S22_out→8312111 |
| TB40D | terminal |  |  | 24VDC PLC Power | S11→8312_S11_T40; S12→8312_S12_T40; S21→8312_S21_T40; S22→8312_S22_T40 |
| TB50D | terminal |  |  | 24VDC PLC Power | S11→8312_S11_T50; S12→8312_S12_T50; S21→8312_S21_T50; S22→8312_S22_T50 |
| TB60D | terminal |  |  | 24VDC PLC Power |  |
| TB70D | terminal |  |  | 24VDC PLC Power |  |
| TB80D | terminal |  |  | 24VDC PLC Power |  |
| TB90D | terminal |  |  | 24VDC PLC Power |  |
| CRB313001 | relay |  |  | Control Relays A | A1→8313001; A2→8313040; S11→8313028; S11-out→8317725 |
| CRB313013 | relay | 4 |  | Control Relays A | 13→8313014A; 14→8313015A; 23→8313016A; 24→8313017A; 33→8313018A; 34→8313019A; 43→8313020A; 44→8313021A |
| CRB313121 | relay |  |  | Control Relays A | A1→8313121A; A2→8313100 |
| CRB313101 | relay | 4 |  | Control Relays A | 11→8313162A; 14→8313164A; 21→8313166A; 24→8313168A; 31→8313170A; 34→8313172A; 41→8313174A; 44→8313176A |
| TDB313106 | relay |  |  | Control Relays A | A1→8313106-ctrl; A2→8313140; Y1→8313101A |
| TDB313109 | relay |  |  | Control Relays A | A1→8313109-ctrl; A2→8313140 |
| TDB313125 | relay |  |  | Control Relays A | A1→8313125-ctrl; A2→8313140; Y1→8313121A |
| PBB313114 | other |  |  | Control Relays A | 13→8212614A; 14→8313114-out |
| PBB313118 | other |  |  | Control Relays A |  |
| CRB317253 | relay |  |  | Control Relays A | 11→8313114-out; 14→8313101A |
| TB10D | terminal |  |  | Control Relays A | 19→8320005A; 20→8320005A; 21→8320005A; 22→8320005A; 23→8320005A; 24→8320005A; 25→8320005A; 26→8320005A |
| CRB313335 | relay |  |  | Control Relays A | 21→8313205A; A1→8313335-ctrl; A2→8313200 |
| TDB313331 | relay |  |  | Control Relays A | 5→8313205A; 6→8313205B; A1→8313331-ctrl; A2→8313200 |
| DCP_LSM_XX-1 | other |  |  | Control Relays A | GND→GND; TB11D→8313203A; TB30-O1→8313203A |
| DCP_LSM_XX-2 | other |  |  | Control Relays A | GND→GND; TB12D→8313212A; TB30-O1→8313212A |
| TB11D | terminal |  |  | Control Relays A | 1→8313203A |
| TB12D | terminal |  |  | Control Relays A | 1→8313212A |
| CBB207001 | breaker | 1 |  | Control Relays A | L→8313309-bus; T→8313309-TB3D |
| CBB207011 | breaker | 1 |  | Control Relays A |  |
| CBB207021 | breaker | 1 |  | Control Relays A |  |
| CBB207031 | breaker | 1 |  | Control Relays A |  |
| CBB207041 | breaker | 1 |  | Control Relays A |  |
| CBB207051 | breaker | 1 |  | Control Relays A |  |
| CBB207061 | breaker | 1 |  | Control Relays A |  |
| TB3D | terminal |  |  | Control Relays A |  |
| CRB313327 | relay |  |  | Control Relays A | A1→8313203A; A2→8313300 |
| CRB313329 | relay |  |  | Control Relays A | A1→8313329A; A2→8313300 |
| CRB313338 | relay |  |  | Control Relays A | A2→8313300 |
| SS8313335 | other |  |  | Control Relays A | 13→8313335B; 14→8313335C |
| CRB317256 | relay |  |  | Control Relays A | 41→8313335-jog-disa; 44→8313329A |
| CRB8313329 | relay |  |  | Control Relays A | 41→8313329; 44→8313329A |
| TB13D | terminal |  |  | Control Relays A | 2→8313329A |
| PBB313403 | pdb |  |  | Control Relays B | 13→8308011; 14→8313403A |
| CRB313403 | relay |  |  | Control Relays B | A1→8308012; A2→8313403A |
| CRB313329 | relay |  |  | Control Relays B | 21→8313407; 22→8313407A |
| LTB313407 | other |  |  | Control Relays B | X1→8313407A; X2→8308012 |
| CRB313335 | relay |  |  | Control Relays B | 11→8313413; 12→8313413A |
| LTB313413 | other |  |  | Control Relays B | X1→8313413A; X2→8308012 |
| CRB212515 | relay |  |  | Control Relays B | 41→8313418; 42→8313418A |
| LTB313418 | other |  |  | Control Relays B | X1→8313418A; X2→8308012 |
| CRB313001 | relay |  |  | Control Relays B | 41→8313420; 42→8313420A |
| TB7D | terminal |  |  | Control Relays B | 10→8313418; 11→8313418A |
| TB13D | terminal |  |  | Control Relays B | 11→8313418A |
| CRB313333B | relay |  |  | Control Relays B | 11→8313444A; 12→8313444B; 14→8313445A |
| CRB317259 | relay |  |  | Control Relays B | 11→8313447A; 12→8313447B; 14→8313448A |
| CRB317262 | relay |  |  | Control Relays B | 11→8313450A; 12→8313450B; 14→8313451A |
| CRB317265 | relay |  |  | Control Relays B | 11→8313453A; 12→8313453B; 14→8313454A |
| CRB317347 | relay |  |  | Control Relays B | 11→8313456A; 12→8313456B; 14→8313457A |
| TB14D | terminal |  |  | Control Relays B | 1→8313444A; 10→8313453A; 11→8313453B; 12→8313454A; 13→8313456A; 14→8313456B; 15→8313457A; 2→8313444B |
| CRB313464 | relay |  |  | Control Relays B | A1→8313464B; A2→8313464A |
| CRB313466 | relay |  |  | Control Relays B | A1→8313466B; A2→8313466A |
| CRB313468 | relay |  |  | Control Relays B | A1→8313468B; A2→8313468A |
| TB15D | terminal |  |  | Control Relays B | 1→8313464A; 2→8313464B; 3→8313466A; 4→8313466B; 5→8313468A; 6→8313468B |
| CRB212606 | relay |  |  | Control Relays B | 41→8313503; 42→8313504A |
| LTB313504 | other |  |  | Control Relays B | X1→8313504A; X2→8308012 |
| TB250 | terminal |  |  | Control Relays B | 1→8313503; 10→8313510; 4→8313504A; 7→8313507; 8→8313508; 9→8313509 |
| TB8D | terminal |  |  | Control Relays B |  |
| S11 | other |  |  | Control Relays B |  |
| S12 | other |  |  | Control Relays B |  |
| S22 | other |  |  | Control Relays B |  |
| TB23D | terminal |  |  | Control Relays B | 1→8212603A |
| TB24D | terminal |  |  | Control Relays B | 1→8212614A |
| TB26D | terminal |  |  | Control Relays B | 1→8212603A; 3→8308006B; 5→8212614A; 7→8308012A; 8→8308012A |
| SG_JB1 | other |  |  | Control Relays B |  |
| SG_JB2 | other |  |  | Control Relays B |  |
| TB2134 | terminal |  |  | Control Relays B |  |
| TB1240 | terminal |  |  | Control Relays B |  |
| J81 | other |  |  | Control / IO 83140-83172 |  |
| CBL14044 | fuse |  |  | Control / IO 83140-83172 | IN→8308011B; OUT→TB17D |
| J82 | other |  |  | Control / IO 83140-83172 |  |
| CBL14103 | fuse |  |  | Control / IO 83140-83172 | IN→8308011B; OUT→TB17D |
| TB17D | terminal |  |  | Control / IO 83140-83172 | T10→8314025A; T21→8314103A; T22→8314106A; T23→8314109A; T24→8314112A; T25→8314116A; T26→8314119A; T27→8314122A |
| PLC-TBB8319012.4 | plc-io |  |  | Control / IO 83140-83172 | 24VDC→8308011B; GND-0_T17→0VDC; GND-0_T18→0VDC; GND-1_T35a→0VDC; GND-1_T36→0VDC; IN-0→8314003A; IN-1→8314006A; IN-10→8314049A |
| PJ14003 | other |  |  | Control / IO 83140-83172 |  |
| CBL14003 | fuse |  |  | Control / IO 83140-83172 | BLK→8314165; BLU→0VDC; BRN→8314163 |
| PLCB316904 | plc-io |  |  | Control / IO 83140-83172 | 0VDC→0VDC; I:0→SPARE; I:1→SPARE; I:2→SPARE; I:3→8316919; O:4→SPARE; O:5→SPARE; O:6→SPARE |
| TB3D | terminal |  |  | Control / IO 83140-83172 |  |
| TB20D | terminal |  |  | Control / IO 83140-83172 | T1→8317004A; T2→8317007A; T3→8317010A; T4→8317013A; T5→8317016A; T6→8317019A; T7→8317022A; T8→8317025A |
| CB8212101 | breaker | 1 | 3A 24VDC | Control / IO 83140-83172 | T1→TB3D-1; T2→8317004A |
| CB8207001 | breaker | 1 | 2A 24VDC | Control / IO 83140-83172 | T1→TB3D-3; T2→8317007A |
| CB8207011 | breaker | 1 | 2A 24VDC | Control / IO 83140-83172 | T1→TB3D-7; T2→8317010A |
| CB8207021 | breaker | 1 | 2A 24VDC | Control / IO 83140-83172 | T1→TB3D-11; T2→8317013A |
| CB8207031 | breaker | 1 | 2A 24VDC | Control / IO 83140-83172 | T1→TB3D-15; T2→8317016A |
| CB8207041 | breaker | 1 | 2A 24VDC | Control / IO 83140-83172 | T1→TB3D-19; T2→8317019A |
| CB8207051 | breaker | 1 | 2A 24VDC | Control / IO 83140-83172 | T1→TB3D-23; T2→8317022A |
| CB8207061 | breaker | 1 | 2A 24VDC | Control / IO 83140-83172 | T1→TB3D-27; T2→8317025A |
| PLC8317002 | plc-io |  |  | Control / IO 83140-83172 | 0VDC→0VDC; I:0→8317004A; I:1→8317007A; I:2→8317010A; I:3→8317013A; I:4→8317016A; I:5→8317019A; I:6→8317022A |
| LT8317047 | other |  |  | Control / IO 83140-83172 | A1→8317047A |
| LT8317050 | other |  |  | Control / IO 83140-83172 | A1→8317050A |
| PBT8317804 | other |  |  | Control / IO 83140-83172 | A1→8317053A |
| LT8317056 | other |  |  | Control / IO 83140-83172 | A1→8317056A |
| LT8317059 | other |  |  | Control / IO 83140-83172 | A1→8317059A |
| PBT8317B104 | other |  |  | Control / IO 83140-83172 | A1→8317062A; A2→8312102 |
| LT8317065 | other |  |  | Control / IO 83140-83172 | A1→8317065A |
| LT8317072 | other |  |  | Control / IO 83140-83172 | A1→8317716A |
| TB7D | terminal |  |  | Control / IO 83140-83172 |  |
| CB8209848 | breaker | 1 | 11A | Control / IO 83140-83172 | T1→TB7D-42; T2→8317104A |
| CB8209853 | breaker | 1 | 11A | Control / IO 83140-83172 | T1→TB7D-44; T2→8317107A |
| CB8209858 | breaker | 1 | 11A | Control / IO 83140-83172 | T1→TB7D-46; T2→8317110A |
| CB8209863 | breaker | 1 | 11A | Control / IO 83140-83172 | T1→TB7D-48; T2→8317113A |
| CB8209868 | breaker | 1 | 11A | Control / IO 83140-83172 | T1→TB7D-50; T2→8317116A |
| CB8209873 | breaker | 1 | 11A | Control / IO 83140-83172 | T1→TB7D-52; T2→8317119A |
| PLC8317102 | plc-io |  |  | Control / IO 83140-83172 | 0VDC→0VDC; I:0→8317104A; I:1→8317107A; I:2→8317110A; I:3→8317113A; I:4→8317116A; I:5→8317119A; I:6→8317122A |
| TB4D | terminal |  |  | Control / IO 83140-83172 |  |
| CB8206118 | breaker | 1 | 2A 24VDC | Control / IO 83140-83172 | T1→TB4D-19; T2→8317204A |
| CB8207501 | breaker | 1 | 13A | Control / IO 83140-83172 | T1→TB4D-3; T2→8317207A |
| CB8207511 | breaker | 1 | 13A | Control / IO 83140-83172 | T1→TB4D-5; T2→8317210A |
| CB8207521 | breaker | 1 | 13A | Control / IO 83140-83172 | T1→TB4D-7; T2→8317213A |
| CB8207531 | breaker | 1 | 13A | Control / IO 83140-83172 | T1→TB4D-9; T2→8317216A |
| CB8207541 | breaker | 1 | 13A | Control / IO 83140-83172 | T1→TB4D-11; T2→8317219A |
| CB8207551 | breaker | 1 | 13A | Control / IO 83140-83172 | T1→TB4D-13; T2→8317222A |
| CB8207561 | breaker | 1 | 13A | Control / IO 83140-83172 | T1→TB4D-15; T2→8317225A |
| PLC8317202 | plc-io |  |  | Control / IO 83140-83172 | 0VDC→0VDC; I:0→8317204A; I:1→8317207A; I:2→8317210A; I:3→8317213A; I:4→8317216A; I:5→8317219A; I:6→8317222A |
| CR8317253 | relay |  |  | Control / IO 83140-83172 | A1→0VDC; A2→8317253A |
| CR8317256 | relay |  |  | Control / IO 83140-83172 | A1→0VDC; A2→8317256A |
| CR8317259 | relay |  |  | Control / IO 83140-83172 | A1→0VDC; A2→8317259A |
| CR8317262 | relay |  |  | Control / IO 83140-83172 | A1→0VDC; A2→8317262A |
| CR8317265 | relay |  |  | Control / IO 83140-83172 | A1→0VDC; A2→8317265A |
| CB8207571 | breaker | 1 |  | IO 83173-83178 | L→TB4D-17; T→TB4D-18 |
| CB8207601 | breaker | 1 |  | IO 83173-83178 | L→TB4D-19; T→TB4D-20 |
| CB8207611 | breaker | 1 |  | IO 83173-83178 | L→TB4D-21; T→TB4D-22 |
| CB8207621 | breaker | 1 |  | IO 83173-83178 | L→TB4D-23; T→TB4D-24 |
| CB8207631 | breaker | 1 |  | IO 83173-83178 | L→TB4D-25; T→TB4D-26 |
| CB8207641 | breaker | 2 |  | IO 83173-83178 | L1→TB4D-27; L2→TB4D-33; T1→TB4D-28; T2→TB4D-34 |
| CB8207651 | breaker | 2 |  | IO 83173-83178 | L1→TB4D-29; L2→TB4D-35; T1→TB4D-30; T2→TB4D-36 |
| CB8207661 | breaker | 2 |  | IO 83173-83178 | L1→TB4D-31; L2→TB4D-37; T1→TB4D-32; T2→TB4D-38 |
| TB4D | terminal |  |  | IO 83173-83178 |  |
| TB20D | terminal |  |  | IO 83173-83178 |  |
| TB22D | terminal |  |  | IO 83173-83178 |  |
| PLC8317302 | plc-io |  |  | IO 83173-83178 | GND→8317277; I:0→8317304A; I:1→8317307A; I:2→8317310A; I:3→8317313A; I:4→8317316A; I:5→8317319A; I:6→8317322A |
| CR8317347 | relay |  |  | IO 83173-83178 | A1→8317347A; A2→0VDC-common |
| PLC8317402 | plc-io |  |  | IO 83173-83178 | GND→0VDC; I:0→8317404A; I:1→8317407A; I:2→8317410A; I:3→8317413A; I:4→8317416A; I:5→8317419A; I:6→8317422A |
| TB6D | terminal |  |  | IO 83173-83178 |  |
| CB8209001 | breaker | 1 | 2A/24VDC | IO 83173-83178 | L→TB6D-1; T→TB6D-2 |
| CB8209021 | breaker | 1 | 2A/24VDC | IO 83173-83178 | L→TB6D-3; T→TB6D-4 |
| CB8209041 | breaker | 1 | 2A/24VDC | IO 83173-83178 | L→TB6D-5; T→TB6D-6 |
| CB8209061 | breaker | 1 | 2A/24VDC | IO 83173-83178 | L→TB6D-7; T→TB6D-8 |
| PLC8317602 | plc-io |  |  | IO 83173-83178 | GND→0VDC; I:0→8317604A; I:1→8317607A; I:2→8317610A; I:3→8317613A; Un→8317439 |
| TB7D | terminal |  |  | IO 83173-83178 |  |
| F8209628 | fuse |  |  | IO 83173-83178 | L→TB7D-14; T→TB7D-15 |
| CB8209745 | breaker | 1 | 1A | IO 83173-83178 | L→TB7D-16; T→TB7D-17 |
| CB8209751 | breaker | 1 | 1A | IO 83173-83178 | L→TB7D-18; T→TB7D-19 |
| CB8209763 | breaker | 1 | 1A | IO 83173-83178 | L→TB7D-20; T→TB7D-21 |
| MB8212105 | other |  |  | IO 83173-83178 | 1→TB7D-1; 2→TB7D-2 |
| MB8212110 | other |  |  | IO 83173-83178 | 14→TB7D-14; 3→TB7D-3 |
| MB8212120 | other |  |  | IO 83173-83178 | 13→TB7D-13; 14→TB7D-14; 5→TB7D-5; 6→TB7D-6 |
| MB8212125 | other |  |  | IO 83173-83178 | 7→TB7D-7; 8→TB7D-8 |
| PLC8317702 | plc-io |  |  | IO 83173-83178 | GND→0VDC; I:0→8317704A; I:1→8317707A; I:2→8317710A; I:3→8317713A; I:4→8317716A; I:5→8317719A; I:6→8317722A |
| PBLT8317804 | other |  |  | IO 83173-83178 | 3→wire-8317804A; 4→0VDC-common |
| PBB8317807 | other |  |  | IO 83173-83178 | 1→wire-8317807A |
| PBB8313403 | other |  |  | IO 83173-83178 | 1→wire-8317810A |
| CR8313329 | relay |  |  | IO 83173-83178 | 3→wire-8317813A; 4→0VDC-common |
| CR8313335 | relay |  |  | IO 83173-83178 | 3→wire-8317816A; 4→0VDC-common |
| SS8317819 | other |  |  | IO 83173-83178 | 1→wire-8317819A |
| PBLT8312102 | other |  |  | IO 83173-83178 | 13→wire-8317822A; 14→0VDC-common |
| PBB8317825 | other |  |  | IO 83173-83178 | 1→wire-8317825A |
| PLC8317802 | plc-io |  |  | IO 83173-83178 | GND→0VDC; I:0→8317804A; I:1→8317807A; I:2→8317810A; I:3→8317813A; I:4→8317816A; I:5→8317819A; I:6→8317822A |
| PLC8317902 | plc-io |  | 24VDC | IO 83179-83183 | GND→0VDC; I:0→8317904A; I:1→8317907A; I:2→8317910A; I:3→8317913A; I:4→8317916A; I:5→SPARE_UNWIRED; I:6→8317922A |
| CRB313464 | relay | 1 |  | IO 83179-83183 | 1→8317904; 14→8317904A |
| CRB313466 | relay | 1 |  | IO 83179-83183 | 1→8317907; 14→8317907A |
| CRB313468 | relay | 1 |  | IO 83179-83183 | 1→8317910; 14→8317910A |
| PM8209620 | other |  |  | IO 83179-83183 | TB7D:34→8317913_in; TB7D:35→8317913A; TB7D:36→8317916_in; TB7D:37→8317916A |
| 8317922A | relay |  |  | IO 83179-83183 | 10→8317922A |
| SS8317925 | other |  |  | IO 83179-83183 | 3→8317925; 4→OPEN |
| TB7D | terminal |  |  | IO 83179-83183 | 22→24VDC_in; 23→8318004A; 24→24VDC_in; 25→8318007A; 26→24VDC_in; 27→8318010A; 28→24VDC_in; 29→8318013A |
| TB20D | terminal |  |  | IO 83179-83183 | 63→24VDC_common_pg8; 64→8318004A; 65→8318007A; 66→8318010A; 67→8318013A; 68→8318016A; 69→8318019A; 70→8318022A |
| PLC8318002 | plc-io |  | 24VDC | IO 83179-83183 | GND→0VDC; I:0→8318004A; I:1→8318007A; I:2→8318010A; I:3→8318013A; I:4→8318016A; I:5→8318019A; I:6→8318022A |
| CB8209803 | breaker | 1 |  | IO 83179-83183 | TB7D:22→24VDC_in; TB7D:23→8318004A |
| CB8209808 | breaker | 1 |  | IO 83179-83183 | TB7D:24→24VDC_in; TB7D:25→8318007A |
| CB8209813 | breaker | 1 |  | IO 83179-83183 | TB7D:26→24VDC_in; TB7D:27→8318010A |
| CB8209818 | breaker | 1 |  | IO 83179-83183 | TB7D:28→24VDC_in; TB7D:29→8318013A |
| CB8209823 | breaker | 1 |  | IO 83179-83183 | TB7D:30→24VDC_in; TB7D:31→8318016A |
| CB8209828 | breaker | 1 |  | IO 83179-83183 | TB7D:32→24VDC_in; TB7D:33→8318019A |
| CB8209833 | breaker | 1 |  | IO 83179-83183 | TB7D:38→24VDC_in; TB7D:39→8318022A |
| CB8209843 | breaker | 1 |  | IO 83179-83183 | TB7D:40→24VDC_in; TB7D:41→8318025A |
| PLC8318102 | plc-io |  | 24VDC | IO 83179-83183 | GND→0VDC; I:0→8318104A; I:1→8318107A; I:2→8318110A; I:3→8318113A; I:4→8318116A; I:5→8318119A; I:6→8318122A |
| CR8212116 | relay | 1 |  | IO 83179-83183 | TB50:1→24VDC_in; TB50:2→8318104A |
| CB8208001 | breaker | 1 |  | IO 83179-83183 | TB50:3→24VDC_in; TB50:4→8318107A |
| CB8208011 | breaker | 1 |  | IO 83179-83183 | TB50:5→24VDC_in; TB50:6→8318110A |
| CB8208021 | breaker | 1 |  | IO 83179-83183 | TB50:7→24VDC_in; TB50:8→8318113A |
| CB8208031 | breaker | 1 |  | IO 83179-83183 | TB50:10→8318116A; TB50:9→24VDC_in |
| CB8208041 | breaker | 1 |  | IO 83179-83183 | TB50:11→24VDC_in; TB50:12→8318119A |
| CB8208051 | breaker | 1 |  | IO 83179-83183 | TB50:13→24VDC_in; TB50:14→8318122A |
| CB108061 | breaker | 1 |  | IO 83179-83183 | TB50:15→24VDC_in; TB50:16→8318125A |
| TB50 | terminal |  |  | IO 83179-83183 | 1→24VDC_in; 10→8318116A; 11→24VDC_in; 12→8318119A; 13→24VDC_in; 14→8318122A; 15→24VDC_in; 16→8318125A |
| PLC8318202 | plc-io |  | 24VDC | IO 83179-83183 | GND→0VDC; I:0→8318204A; I:1→8318207A; I:2→8318210A; I:3→8318213A; I:4→8318216A; I:5→8318219A; I:6→8318222A |
| CB8208071 | breaker | 1 |  | IO 83179-83183 | TB50:17→24VDC_in; TB50:18→8318204A |
| CB_DCP_IND09 | breaker | 1 |  | IO 83179-83183 | TB50:19→24VDC_in; TB50:20→8318207A |
| CB_DCP_IND10 | breaker | 1 |  | IO 83179-83183 | TB50:21→24VDC_in; TB50:22→8318210A |
| CB_DCP_IND11 | breaker | 1 |  | IO 83179-83183 | TB50:23→24VDC_in; TB50:24→8318213A |
| CB_DCP_IND12 | breaker | 1 |  | IO 83179-83183 | TB50:25→24VDC_in; TB50:26→8318216A |
| CB_DCP_IND13 | breaker | 1 |  | IO 83179-83183 | TB50:27→24VDC_in; TB50:28→8318219A |
| CB_DCP_IND14 | breaker | 1 |  | IO 83179-83183 | TB50:29→24VDC_in; TB50:30→8318222A |
| CB_DCP_IND15 | breaker | 1 |  | IO 83179-83183 | TB50:31→24VDC_in; TB50:32→8318225A |
| PLC8318302 | plc-io |  |  | IO 83179-83183 | CH1_pin1→24VDC; CH1_pin2→TS_SIG_WH; CH1_pin3→0VDC; CH1_pin4→TS_SIG_BU; CH1_pin5→SHIELD |
| P8318302 | other |  |  | IO 83179-83183 | 1→24VDC; 2→CBL8318302_WH; 3→0VDC; 4→CBL8318302_BU; 5→SHIELD |
| CBL8318302 | other |  |  | IO 83179-83183 | BU_plug_end→P8318302:4; BU_sensor_end→J8318302:4; WH_plug_end→P8318302:2; WH_sensor_end→J8318302:2 |
| J8318302 | other |  |  | IO 83179-83183 | 1→24VDC; 2→CBL8318302_WH; 3→0VDC; 4→CBL8318302_BU; 5→SHIELD |
| TS8318302 | other |  |  | IO 83179-83183 | 1→24VDC; 2→SIGNAL_WH; 3→0VDC; 4→SIGNAL_BU; 5→SHIELD |
| PS8319012A | psu |  |  | IO / Network 83190-83200 | DC+→83080021; DC-→83090034 |
| PS8319012B | psu |  |  | IO / Network 83190-83200 | DC+→83080048; DC-→83090004 |
| PLC8319012A.1 | plc-io |  | 1756-L73 | IO / Network 83190-83200 |  |
| PLC8319012A.2 | plc-io |  | 1756-L73 | IO / Network 83190-83200 |  |
| PLC8319012A.3 | plc-io |  | 1756-L73 | IO / Network 83190-83200 |  |
| PLC8319012A.4 | plc-io |  | 1756-N2 | IO / Network 83190-83200 |  |
| PLC8319012A.5 | plc-io |  | 1756-B32 | IO / Network 83190-83200 |  |
| PLC8319012A.6 | plc-io |  | 1756-N2 | IO / Network 83190-83200 |  |
| PLC8319012A.7 | plc-io |  | 1756-N2 | IO / Network 83190-83200 |  |
| PLC8319012A.8 | plc-io |  | 1756-N2 | IO / Network 83190-83200 |  |
| PLC8319012A.9 | plc-io |  | 1756-EWEB | IO / Network 83190-83200 |  |
| PLC8319012A.10 | plc-io |  | MV56E-OSC | IO / Network 83190-83200 | SCANNER1→DB9_FEMALE_SCANN; SCANNER2→DB9_FEMALE_SCANN |
| PLC8319012A.11 | plc-io |  | 1756-EN2T | IO / Network 83190-83200 |  |
| PLC8319012A.12 | plc-io |  | 1756-EN2T | IO / Network 83190-83200 |  |
| PLC8319012A.13 | plc-io |  | 1756-EN2T | IO / Network 83190-83200 |  |
| PLC8319012A.14 | plc-io |  | 1756-EN2T | IO / Network 83190-83200 |  |
| PLC8319012A.15 | plc-io |  | 1756-EN2T | IO / Network 83190-83200 |  |
| PLC8319012A.16 | plc-io |  | 1756-EN2T | IO / Network 83190-83200 |  |
| PLC8319012B.1 | plc-io |  | 1756-L73 | IO / Network 83190-83200 |  |
| PLC8319012B.2 | plc-io |  | 1756-L73 | IO / Network 83190-83200 |  |
| PLC8319012B.3 | plc-io |  | 1756-L73 | IO / Network 83190-83200 |  |
| PLC8319012B.4 | plc-io |  | 1756-N2 | IO / Network 83190-83200 |  |
| PLC8319012B.5 | plc-io |  | 1756-B32 | IO / Network 83190-83200 |  |
| PLC8319012B.6 | plc-io |  | 1756-N2 | IO / Network 83190-83200 |  |
| PLC8319012B.7 | plc-io |  | 1756-N2 | IO / Network 83190-83200 |  |
| PLC8319012B.8 | plc-io |  | 1756-N2 | IO / Network 83190-83200 |  |
| PLC8319012B.9 | plc-io |  | 1756-EWEB | IO / Network 83190-83200 |  |
| PLC8319012B.10 | plc-io |  | MV56E-OSC | IO / Network 83190-83200 |  |
| PLC8319012B.11 | plc-io |  | 1756-EN2T | IO / Network 83190-83200 |  |
| PLC8319012B.12 | plc-io |  | 1756-EN2T | IO / Network 83190-83200 |  |
| PLC8319012B.13 | plc-io |  | 1756-EN2T | IO / Network 83190-83200 |  |
| PLC8319012B.14 | plc-io |  | 1756-EN2T | IO / Network 83190-83200 |  |
| PLC8319012B.15 | plc-io |  | 1756-EN2T | IO / Network 83190-83200 |  |
| PLC8319012B.16 | plc-io |  | 1756-EN2T | IO / Network 83190-83200 |  |
| PLC8316904 | plc-io |  |  | IO / Network 83190-83200 | 0V→8308012A; 24V→8308011B; FIBER_RING_OUT→CBLB319114A; PROFIBUS_A_IN→8319426A; PROFIBUS_A_OUT→CBL8319108; PROFIBUS_B_IN→8319426B |
| PB8319128 | pdb |  |  | IO / Network 83190-83200 | 1→8308011B; 2→8308011B; 3→8308012A; 4→8308012A |
| PLC8317002 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319114A; FIBER_OUT→CBLB319114B; PWR_IN→CBLB319129A; PWR_OUT→CBLB319129B |
| PLC8317102 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319114B; FIBER_OUT→CBLB319114C; PWR_IN→CBLB319129B; PWR_OUT→CBLB319129C |
| PLC8317202 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319114C; FIBER_OUT→CBLB319114D; PWR_IN→CBLB319129C; PWR_OUT→CBLB319129D |
| PLC8317302 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319114D; FIBER_OUT→CBLB319114E; PWR_IN→CBLB319129D; PWR_OUT→CBLB319129E |
| PLC8317402 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319214A; FIBER_OUT→CBLB319214B; PWR_IN→CBLB319229A; PWR_OUT→CBLB319229B |
| PLC8317602 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319214B; FIBER_OUT→CBLB319214C; PWR_IN→CBLB319229B; PWR_OUT→CBLB319229C |
| PLC8317702 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319214C; FIBER_OUT→CBLB319214D; PWR_IN→CBLB319229C; PWR_OUT→CBLB319229D |
| PLC8317802 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319214D; FIBER_OUT→CBLB319214E; PWR_IN→CBLB319229D; PWR_OUT→CBLB319229E |
| PLC8317902 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319214E; FIBER_OUT→CBLB319214F; PWR_IN→CBLB319229E; PWR_OUT→CBLB319229F |
| PLC8318002 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319214F; PWR_IN→CBLB319229F |
| PLC8318102 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319314A; FIBER_OUT→CBLB319314B; PWR_IN→CBLB319329A; PWR_OUT→CBLB319329B |
| PLC8318202 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319314B; FIBER_OUT→CBLB319314C; PWR_IN→CBLB319329B; PWR_OUT→CBLB319329C |
| PLC8318302 | plc-io |  |  | IO / Network 83190-83200 | FIBER_IN→CBLB319314C; PWR_IN→CBLB319329C |
| DN0219403 | other |  |  | IO / Network 83190-83200 | 0V→8308012A; ETH→CBL8319023.V; REF→8308023A |
| DN8319400-1 | other |  |  | IO / Network 83190-83200 | 0V→8308018; 24V→8308018; NET→8319025 |
| DN8319400-2 | other |  |  | IO / Network 83190-83200 |  |
| DN8319400-3 | other |  |  | IO / Network 83190-83200 | NET→8319025 |
| DN8319400-4 | other |  |  | IO / Network 83190-83200 | NET→8319025 |
| DN8319400-5 | other |  |  | IO / Network 83190-83200 | NET→8319039 |
| COB8319416.1 | other |  |  | IO / Network 83190-83200 | A1→; A2→; B1→; B2→ |
| COB8319416.2 | other |  |  | IO / Network 83190-83200 | A1→; A2→; B1→; B2→ |
| COB8319416.3 | other |  |  | IO / Network 83190-83200 |  |
| COB8319416.4 | other |  |  | IO / Network 83190-83200 |  |
| COB8319416.5 | other |  |  | IO / Network 83190-83200 |  |
| CR8313329 | relay |  |  | IO / Network 83190-83200 | contact_in→8320063A; contact_out→TB1B13D |
| CR8313001 | relay |  |  | IO / Network 83190-83200 | contact_in→8320005A; contact_out→8320005B |
| CR8313121 | relay |  |  | IO / Network 83190-83200 | contact_in→8320007A; contact_out→8320007B |
| TB1B2D | terminal |  |  | IO / Network 83190-83200 | 1→83090068 |
| TB1B13D | terminal |  |  | IO / Network 83190-83200 | 1→8308007A |

## Sections

### 24VDC PLC Power  (83080-83121) — confidence: med
**Function:** Receives 24 VDC (and 120 VAC for panel ancillaries) from external distribution/control panel CP82, distributes individual fused 24 VDC branches through six miniature circuit breakers (1–4 A) via TB1D, TB2D, TB16D, and TB3D terminal blocks to the PLC power supply, L-STRAP, safety gate, Beckhoff I/O modules, lamps/AR I/O, CCT Profibus modules, and port server, while a separate 120 VAC branch powers the enclosure fan and panel light, and a safety relay block (PBLTB8312102) distributes a dual-channel E-stop loop chain to field junction boxes via TB40D–TB90D.

Page 83080: 24 VDC and 120 VAC enter CP83 via TB1D (two terminal groups) from Power Panel CP82. CBB8308002 (4 A) and CBB8308003 (4 A) branch from TB1D Group A — CBB8308002 feeds the 24VDC PLC power supply (destination wires 8319013/8319038 hot, 8319017/8319027 return/GND); CBB8308003 output (8308004B) feeds a secondary branch not fully traced on this page. CBB8308006 (4 A) branches from TB1D Group B through TB16D, distributing to L-STRAP (8313000/8313100), additional wiring (8313200), and safety gate (8320017). CBB8308011 (4 A) from TB2D T8 feeds TB3D, which distributes to lamps/AR I/O (8313400), Beckhoff I/O (8317000/8317040), Beckhoff module power (8319128/8319130), CCT Profibus (8319401/8319402). CBB8308023 (1 A) from TB3D T10 feeds port server (8308023A → 8319412). CBB8308030 (4 A) from TB2D T2 feeds 120 VAC via load switch LS8308030 to enclosure fan MOT8308030 and panel light LTB8308032. Page 83121: Safety relay block PBLTB8312102 (3 internal modules, REFs B317B02/B312193/B317062) receives 24 VDC E-stop loop inputs from cross-ref wires 8313003 (S11, wire 8312103) and 8313004 (S21, wire 8312104); outputs S12 (8312110) and S22 (8312111) return to monitoring circuit; dual-channel contacts distribute E-stop chain through TB40D and TB50D to field E-stop junction boxes JB:E-STOPXX (each with Emergency Stop Loop #1 and Loop #2 terminals); TB60D–TB90D carry factory-installed jumpers (no field devices). Drawing notes: all internal 24 V wiring 16 AWG; 24 V conductors blue, 0 V conductors white/blue stripe per spec ENC-149.

<details><summary>33 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| TB1D | CBB8308002 | dc | 8308002A |
| CBB8308002 | 8319013_PLC_PS_24V | dc | 8319013 |
| TB1D | 8319017_PLC_PS_0V | ret | 8308003A |
| TB1D | CBB8308003 | dc | 8308004A |
| CBB8308003 | 8308004B_downstream | dc | 8308004B |
| TB1D | CBB8308006 | dc | 8308006A |
| CBB8308006 | TB16D | dc | 8308006B |
| TB16D | 8313000_L_STRAP_24V | dc | 8313000 |
| TB16D | 8313100_L_STRAP_0V | ret | 8313100 |
| TB16D | 8313200_ADD_WRE_0V | ret | 8313200 |
| TB16D | 8320017_SAFETY_GATE_0V | ret | 8320017 |
| TB2D | CBB8308011 | dc | 8308011A |
| CBB8308011 | TB3D | dc | 8308011B |
| TB3D | 8313400_LAMPS_AR_IO_24V | dc | 8313400 |
| TB3D | 8317000_BECKHOFF_IO_24V | dc | 8317000 |
| TB3D | 8317040_BECKHOFF_IO_0V | ret | 8317040 |
| TB3D | 8319128_BECKHOFF_MOD_24V | dc | 8319128 |
| TB3D | 8319130_BECKHOFF_MOD_0V | ret | 8319130 |
| TB3D | 8319401_PROFIBUS_0V | ret | 8319401 |
| TB3D | 8319402_PROFIBUS_0V | ret | 8319402 |
| TB3D | CBB8308023 | dc | 8308023_in |
| CBB8308023 | 8319412_PORT_SERVER | dc | 8308023A |
| TB2D | CBB8308030 | hot | 8308030A |
| CBB8308030 | LS8308030 | hot | 8308030B |
| LS8308030 | MOT8308030 | hot | 8308030B_sw |
| LS8308030 | LTB8308032 | hot | 8308032A |
| 8313003_xref | PBLTB8312102 | ctrl | 8312103 |
| 8313004_xref | PBLTB8312102 | ctrl | 8312104 |
| PBLTB8312102 | 8313003_S12_xref | ctrl | 8312110 |
| PBLTB8312102 | 8313005_S22_xref | ctrl | 8312111 |
| PBLTB8312102 | TB40D | ctrl | 8312_S11 |
| TB40D | JB_ESTOPXX_1 | ctrl | 8312_S11_T40 |
| TB50D | JB_ESTOPXX_2 | ctrl | 8312_S11_T50 |

</details>

### Control Relays A  (83130-83133) — confidence: med
**Function:** Implements 24 VDC control relay logic for an Emergency Stop chain (CRB313001 crane E-STOP, CRB313101 reset circuit, CRB313121 internal reset) that distributes E-STOP status to four external vendor subsystems via TB10D, and a Jog Mode permissive circuit (SS8313335 selector, CRB313327/329/335/338, TDB313331 delay timer) interlocked with DCP LSM drive permissive loops and CP82 branch breaker monitoring.

Pages 83130–83133 cover four sub-circuits on a 24 VDC control bus: (1) Page 83130 — CRB313001 'CRANE' Emergency Stop relay (multi-pole, contacts routed to 8317725 and cross-page refs 8320005/8313420) with CRB313013 contacts distributing E-STOP status to TB10D via 8 orange-coded wires (8313014A–8313021A); (2) Page 83131 — CRB313121 internal reset relay and CRB313101 E-STOP reset circuit relay, each enabled by time-delay relays (TDB313106/109/125 ~0.5 s), with reset pushbuttons PBB313114 (PLC safety gate) and PBB313118 (external vendor reset), and CRB313101 contacts distributing reset signals to vendors A–D via TB10D pins 27–34 (ORG wires 8313162A–8313176A); (3) Page 83132 — CRB313335 jog-mode relay contacts series with TDB313331 timed contacts (wires 8313205A/B) feeding two DCP_LSM_XX permissive interface modules (TB11D/TB12D → TB30, 3 permissive loops each: main switch on, remote control, start okay); (4) Page 83133 — Jog Mode coil logic including 3-position spring-return selector switch SS8313335, relays CRB313327 (jog drive auto mode), CRB313329 (all switches in jog position, self-sealing), CRB313335/338 coils, TDB313331 timer coil, auxiliary monitoring of LSM-01 through LSM-07 branch circuit breakers (CBB207001–CBB207061) from CP82 via TB3D, and PLC-sourced jog-disable contact CRB317256.

<details><summary>32 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| 8308006-source | CRB313001.A1-side | hot | 8313000 |
| 8308007-source | CRB313001.A2-side | ret | 8313040 |
| CRB313001.S11 | 8317725-cross-page | ctrl | 8313028 |
| CRB313013.13 | TB10D | ctrl | 8313014A |
| CRB313013.14 | TB10D | ctrl | 8313015A |
| CRB313013.23 | TB10D | ctrl | 8313016A |
| CRB313013.24 | TB10D | ctrl | 8313017A |
| CRB313013.33 | TB10D | ctrl | 8313018A |
| CRB313013.34 | TB10D | ctrl | 8313019A |
| CRB313013.43 | TB10D | ctrl | 8313020A |
| CRB313013.44 | TB10D | ctrl | 8313021A |
| 8313039-source | CRB313101.A1-side | hot | 8313100 |
| 8320005A-source | TB10D.19 | ctrl | 8320005A |
| TDB313106.Y1 | CRB313101.A1 | ctrl | 8313101A |
| CRB313101.11 | TB10D.27 | ctrl | 8313162A |
| CRB313101.14 | TB10D.28 | ctrl | 8313164A |
| CRB313101.21 | TB10D.29 | ctrl | 8313166A |
| CRB313101.24 | TB10D.30 | ctrl | 8313168A |
| CRB313101.31 | TB10D.31 | ctrl | 8313170A |
| CRB313101.34 | TB10D.32 | ctrl | 8313172A |
| CRB313101.41 | TB10D.33 | ctrl | 8313174A |
| CRB313101.44 | TB10D.34 | ctrl | 8313176A |
| TDB313125.Y1 | CRB313121.A1 | ctrl | 8313121A |
| 8308009-source | jog-mode-bus | hot | 8313200 |
| CRB313335.21 | TDB313331.5 | ctrl | 8313205A |
| TDB313331.6 | downstream-jog-ctrl | ctrl | 8313205B |
| 8313239-source | CRB313327.A1-bus | hot | 8313300 |
| TB11D.1 | CRB313327.A1 | ctrl | 8313203A |
| TB12D.1 | DCP_LSM_XX-2 | ctrl | 8313212A |
| SS8313335.13 | CRB313329-circuit | ctrl | 8313335B |
| SS8313335.14 | CRB313335-circuit | ctrl | 8313335C |
| CRB8313329.44 | CRB313329.A1 | ctrl | 8313329A |

</details>

### Control Relays B  (83134-83136) — confidence: med
**Function:** This 24 VDC control-relay section (pages 83134–83136) energizes relay coils and indicator lamps for fault annunciation, emergency-stop, and sorter-status monitoring; distributes paired N.O./N.C. relay output contacts through TB14D to external sorter-control equipment; provides three spare relay coils at TB15D; and routes safety-gate interlock loop wiring through selector switches and TB26D to external junction boxes SG_JB1 and SG_JB2.

Page 83134: 24 VDC ladder section with PBB313403 power bus feeding CRB313403 coil; CRB313329/313335/212515/313001 contacts in series with panel lamps LTB313407 (Fault), LTB313413 (Sorter Test), LTB313418 (E-Stop); right-side 5-row contact matrix using CRB313333B/317259/317262/317265/317347 N.O.+N.C. contacts feeding 15-point TB14D to external sorter signals (Test Mode, Fault, PGM Mode, Sorter Running, Span); three spare relay coils CRB313464/466/468 at TB15D. Page 83135: CRB212606 aux contact and LTB313504 Safety-Circuit-Open lamp; TB250 10-point block distributing safety-gate-activated and beacon-light signals. Page 83136: POWER PANEL section with S11/S12/S22 selector switches and TB23D/TB24D/TB26D routing safety-gate interlock loops (wires 8212603A, 8308006B, 8212614A, 8308012A) to external safety gate junction boxes SG_JB1 and SG_JB2 containing TB2134 (safety circuit loops) and TB1240 (gate unlock / access-reset blue pushbutton) terminals.

<details><summary>45 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| 8308011 | PBB313403:13 | dc | 8308011 |
| PBB313403:14 | CRB313403:A2 | ctrl | 8313403A |
| CRB313403:A1 | 8308012 | ret | 8308012 |
| 8313407 | CRB313329:21 | ctrl | 8313407 |
| CRB313329:22 | LTB313407:X1 | ctrl | 8313407A |
| LTB313407:X2 | 8308012 | ret | 8308012 |
| 8313413 | CRB313335:11 | ctrl | 8313413 |
| CRB313335:12 | LTB313413:X1 | ctrl | 8313413A |
| LTB313413:X2 | 8308012 | ret | 8308012 |
| TB7D:10 | CRB212515:41 | ctrl | 8313418 |
| CRB212515:42 | LTB313418:X1 | ctrl | 8313418A |
| LTB313418:X2 | 8308012 | ret | 8308012 |
| TB7D:10 | CRB313001:41 | ctrl | 8313420 |
| CRB313001:42 | 8308012 | ret | 8313420A |
| TB14D:1 | CRB313333B:11 | ctrl | 8313444A |
| CRB313333B:12 | TB14D:2 | ctrl | 8313444B |
| CRB313333B:14 | TB14D:3 | ctrl | 8313445A |
| TB14D:4 | CRB317259:11 | ctrl | 8313447A |
| CRB317259:12 | TB14D:5 | ctrl | 8313447B |
| CRB317259:14 | TB14D:6 | ctrl | 8313448A |
| TB14D:7 | CRB317262:11 | ctrl | 8313450A |
| CRB317262:12 | TB14D:8 | ctrl | 8313450B |
| CRB317262:14 | TB14D:9 | ctrl | 8313451A |
| TB14D:10 | CRB317265:11 | ctrl | 8313453A |
| CRB317265:12 | TB14D:11 | ctrl | 8313453B |
| CRB317265:14 | TB14D:12 | ctrl | 8313454A |
| TB14D:13 | CRB317347:11 | ctrl | 8313456A |
| CRB317347:12 | TB14D:14 | ctrl | 8313456B |
| CRB317347:14 | TB14D:15 | ctrl | 8313457A |
| TB15D:1 | CRB313464:A2 | ctrl | 8313464A |
| CRB313464:A1 | TB15D:2 | ret | 8313464B |
| TB15D:3 | CRB313466:A2 | ctrl | 8313466A |
| CRB313466:A1 | TB15D:4 | ret | 8313466B |
| TB15D:5 | CRB313468:A2 | ctrl | 8313468A |
| CRB313468:A1 | TB15D:6 | ret | 8313468B |
| TB7D | CRB212606:41 | ctrl | 8313503 |
| CRB212606:42 | LTB313504:X1 | ctrl | 8313504A |
| LTB313504:X2 | 8308012 | ret | 8308012 |
| TB23D:1 | TB26D:1 | ctrl | 8212603A |
| 8308006B | TB26D:3 | ctrl | 8308006B |
| TB24D:1 | TB26D:5 | ctrl | 8212614A |
| TB26D:7 | SG_JB1:TB1240 | ctrl | 8308012A |
| TB26D:8 | SG_JB2:TB1240 | ctrl | 8308012A |
| TB26D:2 | SG_JB1:TB2134 | ctrl | 8212603A |
| TB26D:4 | SG_JB2:TB2134 | ctrl | 8212614A |

</details>

### Control / IO 83140-83172  (83140-83172) — confidence: med
**Function:** Digital I/O section: captures 32 clock-pulse photoelectric sensor signals for position tracking; monitors linear-sorter, scanner/vision-system, and conductor-rail circuit-breaker fault contacts; and drives sorter status indicators, E-stop relay, and conductor-rail carrier-supply control relays via Beckhoff Profibus/EtherNet I/O nodes referenced to master I/P page 83191.

Six drawing pages for PLC Panel CP83 (project M-16-00264, ACY1): pages 83140-83141 wire 32 clock-pulse photoelectric sensors (PE 0–31) and a sync PE to a 1756-TBCH 36-pin digital input module (PLC-TBB8319012.4); page 83169 hosts a Beckhoff ZS2000-2210 24VDC supervision module (mostly spare, one active 24V supervision input); pages 83170–83172 each contain one 24VDC Beckhoff-style 8DI/8DO PLC module—83170 monitors linear-sorter (DCP-LSM) circuit-breaker auxiliary contacts and drives sorter status pilot lights and E-stop, 83171 monitors scanner/vision-system 120VAC supply circuit breakers with all outputs spare, and 83172 monitors conductor-rail (DCP-CR) circuit-breaker faults and drives carrier-supply enables plus control relays for E-stop reset, jog-disable, fault annunciation, test-mode, and sorter-running.

<details><summary>80 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| CBL14044 | TB17D | ctrl | 8314003A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314003A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314006A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314009A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314012A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314016A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314019A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314022A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314025A |
| CBL14103 | TB17D | ctrl | 8314043A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314043A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314046A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314049A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314052A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314056A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314059A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314062A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314065A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314103A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314106A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314109A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314112A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314116A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314119A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314122A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314125A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314143A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314146A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314150A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314152A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314156A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314159A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314163A |
| TB17D | PLC-TBB8319012.4 | ctrl | 8314165A |
| CB8212101 | TB20D | dc | 8317004A |
| TB20D | PLC8317002 | dc | 8317004A |
| CB8207001 | TB20D | dc | 8317007A |
| TB20D | PLC8317002 | dc | 8317007A |
| CB8207011 | TB20D | dc | 8317010A |
| TB20D | PLC8317002 | dc | 8317010A |
| CB8207021 | TB20D | dc | 8317013A |
| TB20D | PLC8317002 | dc | 8317013A |
| CB8207031 | TB20D | dc | 8317016A |
| TB20D | PLC8317002 | dc | 8317016A |
| CB8207041 | TB20D | dc | 8317019A |
| TB20D | PLC8317002 | dc | 8317019A |
| CB8207051 | TB20D | dc | 8317022A |
| TB20D | PLC8317002 | dc | 8317022A |
| CB8207061 | TB20D | dc | 8317025A |
| TB20D | PLC8317002 | dc | 8317025A |
| PLC8317002 | LT8317047 | ctrl | 8317047A |
| PLC8317002 | LT8317050 | ctrl | 8317050A |
| PLC8317002 | PBT8317804 | ctrl | 8317053A |
| PLC8317002 | LT8317056 | ctrl | 8317056A |
| PLC8317002 | LT8317059 | ctrl | 8317059A |
| PLC8317002 | PBT8317B104 | ctrl | 8317062A |
| PLC8317002 | LT8317065 | ctrl | 8317065A |
| PLC8317002 | LT8317072 | ctrl | 8317716A |
| CB8209848 | PLC8317102 | ctrl | 8317104A |
| CB8209853 | PLC8317102 | ctrl | 8317107A |
| CB8209858 | PLC8317102 | ctrl | 8317110A |
| CB8209863 | PLC8317102 | ctrl | 8317113A |
| CB8209868 | PLC8317102 | ctrl | 8317116A |
| CB8209873 | PLC8317102 | ctrl | 8317119A |
| CB8206118 | PLC8317202 | dc | 8317204A |
| CB8207501 | PLC8317202 | dc | 8317207A |
| CB8207511 | PLC8317202 | dc | 8317210A |
| CB8207521 | PLC8317202 | dc | 8317213A |
| CB8207531 | PLC8317202 | dc | 8317216A |
| CB8207541 | PLC8317202 | dc | 8317219A |
| CB8207551 | PLC8317202 | dc | 8317222A |
| CB8207561 | PLC8317202 | dc | 8317225A |
| PLC8317202 | CR8317253 | ctrl | 8317253A |
| PLC8317202 | CR8317256 | ctrl | 8317256A |
| PLC8317202 | CR8317259 | ctrl | 8317259A |
| PLC8317202 | CR8317262 | ctrl | 8317262A |
| PLC8317202 | CR8317265 | ctrl | 8317265A |
| PLC8317202 | TB_8320009 | ctrl | 8317247A |
| PLC8317202 | TB_8320010 | ctrl | 8317250A |
| PLC8317202 | TB_8320012 | ctrl | 8317268A |

</details>

### IO 83173-83178  (83173-83178) — confidence: med
**Function:** Five Honeywell 24 VDC PLC digital I/O modules in CP83 collectively monitor DCP and 24 V distribution circuit-breaker trip status, supervise panel power-supply health and E-stop contactor/detection states, and acquire sorter operator-control inputs; output channel 0 of PLC8317302 energizes relay CR8317347 while channels 5 and 6 switch conductor-rail carrier supplies for sorter zones 13-15 and 16-8.

Pages 83173–83178 document five Honeywell 24 VDC PLC digital I/O modules (PLC8317302, PLC8317402, PLC8317602, PLC8317702, PLC8317802) in panel CP83 MAIN/PLC PANEL, project M-16-00264. Each module is an 8 DI + 8 DO card powered from a 24 VDC daisy chain originating from PWR PANEL CP82. Field-device signal wires route through intermediate terminal block TB20D. PLC8317302 (pg 83173) receives auxiliary trip-status contacts from nine DCP miniature circuit breakers (CR-08–CR-15) fed through CP82 breakers CB8207571–CB8207661 and TB4D; its outputs drive relay CR8317347 (O:0) and two conductor-rail carrier-supply outputs (O:5, O:6). PLC8317402 (pg 83174) monitors DCP_CR-16 through CR-18 via the second poles of CB8207641/651/661; I:3–7 and all outputs are spare. PLC8317602 (pg 83176) monitors 24 V distribution breakers for chute and sorter power branches (CB8209001/021/041/061); all outputs spare. PLC8317702 (pg 83177) supervises panel power supplies via CB8209745/751/763 and fuse/SPD F8209628, E-stop contactor states via MB8212105/110/120/125 contacts, and E-stop master/slave detection from wires 8317722A and 8313002B. PLC8317802 (pg 83178) captures sorter operator inputs: sorting-machine start/stop pushbuttons, lamp test, LSM switch status (CR8313329), jog-mode relay (CR8313335), auto/test selector SS8317819, E-stop ES00 pushbutton PBLT8312102, and commissioning fault-reset PBB8317825. All wiring to IE2403, 18 AWG with ferrules per schematic note.

<details><summary>65 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| CB8207571-T(TB4D-18) | TB20D-29 | ctrl | 8317304 |
| TB20D-29 | PLC8317302-I:0 | ctrl | 8317304A |
| CB8207601-T(TB4D-20) | TB20D-30 | ctrl | 8317307 |
| TB20D-30 | PLC8317302-I:1 | ctrl | 8317307A |
| CB8207611-T(TB4D-22) | TB20D-31 | ctrl | 8317310 |
| TB20D-31 | PLC8317302-I:2 | ctrl | 8317310A |
| CB8207621-T(TB4D-24) | TB20D-32 | ctrl | 8317313 |
| TB20D-32 | PLC8317302-I:3 | ctrl | 8317313A |
| CB8207631-T(TB4D-26) | TB20D-33 | ctrl | 8317316 |
| TB20D-33 | PLC8317302-I:4 | ctrl | 8317316A |
| CB8207641-T1(TB4D-28) | TB20D-34 | ctrl | 8317319 |
| TB20D-34 | PLC8317302-I:5 | ctrl | 8317319A |
| CB8207651-T1(TB4D-30) | TB20D-35 | ctrl | 8317322 |
| TB20D-35 | PLC8317302-I:6 | ctrl | 8317322A |
| CB8207661-T1(TB4D-32) | TB20D-36 | ctrl | 8317325 |
| TB20D-36 | PLC8317302-I:7 | ctrl | 8317325A |
| PLC8317302-O:0 | CR8317347-A1 | ctrl | 8317347A |
| PLC8317302-O:1 | TB22D-1 | ctrl | 8317350A |
| PLC8317302-O:2 | TB22D-2 | ctrl | 8317353A |
| PLC8317302-O:3 | TB22D-3 | ctrl | 8317356A |
| PLC8317302-O:4 | TB22D-4 | ctrl | 8317359A |
| PLC8317302-O:5 | CONDUCTOR-RAIL-13-15 | ctrl | 8320014 |
| PLC8317302-O:6 | CONDUCTOR-RAIL-16-8 | ctrl | 8317365A |
| 8317238 | PLC8317302-Un | dc | 8317238 |
| PLC8317302-24VDC-chain | PLC8317402-Un | dc | 8317339 |
| CB8207641-T2(TB4D-34) | TB20D-38 | ctrl | 8317404 |
| TB20D-38 | PLC8317402-I:0 | ctrl | 8317404A |
| CB8207651-T2(TB4D-36) | TB20D-39 | ctrl | 8317407 |
| TB20D-39 | PLC8317402-I:1 | ctrl | 8317407A |
| CB8207661-T2(TB4D-38) | TB20D-40 | ctrl | 8317410 |
| TB20D-40 | PLC8317402-I:2 | ctrl | 8317410A |
| PLC8317402-24VDC-chain | PLC8317602-Un | dc | 8317439 |
| CB8209001-T(TB6D-2) | TB20D-47 | ctrl | 8317604 |
| TB20D-47 | PLC8317602-I:0 | ctrl | 8317604A |
| CB8209021-T(TB6D-4) | TB20D-48 | ctrl | 8317607 |
| TB20D-48 | PLC8317602-I:1 | ctrl | 8317607A |
| CB8209041-T(TB6D-6) | TB20D-49 | ctrl | 8317610 |
| TB20D-49 | PLC8317602-I:2 | ctrl | 8317610A |
| CB8209061-T(TB6D-8) | TB20D-50 | ctrl | 8317613 |
| TB20D-50 | PLC8317602-I:3 | ctrl | 8317613A |
| 8317636 | PLC8317702-Un | dc | 8317636 |
| F8209628-T(TB7D-15) | TB20D-56 | ctrl | 8317704 |
| TB20D-56 | PLC8317702-I:0 | ctrl | 8317704A |
| CB8209745-T(TB7D-17) | TB20D-57 | ctrl | 8317707 |
| TB20D-57 | PLC8317702-I:1 | ctrl | 8317707A |
| CB8209751-T(TB7D-19) | TB20D-58 | ctrl | 8317710 |
| TB20D-58 | PLC8317702-I:2 | ctrl | 8317710A |
| CB8209763-T(TB7D-21) | TB20D-59 | ctrl | 8317713 |
| TB20D-59 | PLC8317702-I:3 | ctrl | 8317713A |
| MB8212105-contact(TB7D-2) | TB20D-60 | ctrl | 8317716 |
| TB20D-60 | PLC8317702-I:4 | ctrl | 8317716A |
| MB8212125-contact(TB7D-8) | TB20D-61 | ctrl | 8317719 |
| TB20D-61 | PLC8317702-I:5 | ctrl | 8317719A |
| PWR-PANEL-E-stop-master-contact-9 | TB20D-62 | ctrl | 8317722 |
| TB20D-62 | PLC8317702-I:6 | ctrl | 8317722A |
| 8313002B | PLC8317702-I:7 | ctrl | 8317725 |
| 8317738 | PLC8317802-Un | dc | 8317738 |
| PBLT8317804-contact-3 | PLC8317802-I:0 | ctrl | 8317804A |
| PBB8317807-contact | PLC8317802-I:1 | ctrl | 8317807A |
| PBB8313403-contact | PLC8317802-I:2 | ctrl | 8317810A |
| CR8313329-contact-3 | PLC8317802-I:3 | ctrl | 8317813A |
| CR8313335-contact-3 | PLC8317802-I:4 | ctrl | 8317816A |
| SS8317819-contact | PLC8317802-I:5 | ctrl | 8317819A |
| PBLT8312102-contact-13 | PLC8317802-I:6 | ctrl | 8317822A |
| PBB8317825-contact | PLC8317802-I:7 | ctrl | 8317825A |

</details>

### IO 83179-83183  (83179-83183) — confidence: med
**Function:** Routes 24 VDC digital status signals from relay contacts (CRBs, CR), power-monitor auxiliary contacts (PM8209620), safety switch (SS8317925), and circuit-breaker auxiliary contacts (CB8208xxx / CB8209xxx), plus a single temperature-sensor input, into five Honeywell/Intelligrated PLC I/O modules to supervise conveyor induction-zone power supply health, DCP circuit-breaker faults, safety gate activation, and temperature.

Five sequential PLC digital I/O pages (drawings 83179–83183) for CP83 main/PLC panel, induction zone, ACY1 (project M-16-00264, Honeywell/Intelligrated). Page 83179: voltage-under, voltage-over, safety-gate, conductor-rail, and external spare inputs via CRB relay contacts and PM8209620 power-monitor aux contacts into PLC8317902. Page 83180: 120 VAC supply health for Scanner 1/2 and DCP-VIS units via CB aux contacts into PLC8318002. Pages 83181–82: main power supervision and DCP-IND circuit-breaker faults 01–15 via relay/CB aux contacts into PLC8318102 and PLC8318202. Page 83183: temperature sensor TS8318302 wired to channel 1 of PLC8318302 via fieldwirable plug P8318302 and cable assembly CBL8318302. All outputs on all four standard IO modules are SPARE. Wiring note on all pages: 18AWG ferrule-terminated wiring to IE2403.

<details><summary>70 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| CRB313464:1 | CRB313464:14 | ctrl | 8317904 |
| CRB313464:14 | PLC8317902:I:0 | ctrl | 8317904A |
| CRB313466:1 | CRB313466:14 | ctrl | 8317907 |
| CRB313466:14 | PLC8317902:I:1 | ctrl | 8317907A |
| CRB313468:1 | CRB313468:14 | ctrl | 8317910 |
| CRB313468:14 | PLC8317902:I:2 | ctrl | 8317910A |
| PM8209620:TB7D:35 | TB20D:91 | ctrl | 8317913A |
| TB20D:91 | PLC8317902:I:3 | ctrl | 8317913A |
| PM8209620:TB7D:37 | TB20D:92 | ctrl | 8317916A |
| TB20D:92 | PLC8317902:I:4 | ctrl | 8317916A |
| 8317922A:10 | TB20D:93 | ctrl | 8317922A |
| TB20D:93 | PLC8317902:I:6 | ctrl | 8317922A |
| SS8317925:3 | PLC8317902:I:7 | ctrl | 8317925 |
| CB8209803:TB7D:23 | TB20D:64 | ctrl | 8318004A |
| TB20D:64 | PLC8318002:I:0 | ctrl | 8318004A |
| CB8209808:TB7D:25 | TB20D:65 | ctrl | 8318007A |
| TB20D:65 | PLC8318002:I:1 | ctrl | 8318007A |
| CB8209813:TB7D:27 | TB20D:66 | ctrl | 8318010A |
| TB20D:66 | PLC8318002:I:2 | ctrl | 8318010A |
| CB8209818:TB7D:29 | TB20D:67 | ctrl | 8318013A |
| TB20D:67 | PLC8318002:I:3 | ctrl | 8318013A |
| CB8209823:TB7D:31 | TB20D:68 | ctrl | 8318016A |
| TB20D:68 | PLC8318002:I:4 | ctrl | 8318016A |
| CB8209828:TB7D:33 | TB20D:69 | ctrl | 8318019A |
| TB20D:69 | PLC8318002:I:5 | ctrl | 8318019A |
| CB8209833:TB7D:39 | TB20D:70 | ctrl | 8318022A |
| TB20D:70 | PLC8318002:I:6 | ctrl | 8318022A |
| CB8209843:TB7D:41 | TB20D:71 | ctrl | 8318025A |
| TB20D:71 | PLC8318002:I:7 | ctrl | 8318025A |
| CR8212116:TB50:2 | TB20D:73 | ctrl | 8318104A |
| TB20D:73 | PLC8318102:I:0 | ctrl | 8318104A |
| CB8208001:TB50:4 | TB20D:74 | ctrl | 8318107A |
| TB20D:74 | PLC8318102:I:1 | ctrl | 8318107A |
| CB8208011:TB50:6 | TB20D:75 | ctrl | 8318110A |
| TB20D:75 | PLC8318102:I:2 | ctrl | 8318110A |
| CB8208021:TB50:8 | TB20D:76 | ctrl | 8318113A |
| TB20D:76 | PLC8318102:I:3 | ctrl | 8318113A |
| CB8208031:TB50:10 | TB20D:77 | ctrl | 8318116A |
| TB20D:77 | PLC8318102:I:4 | ctrl | 8318116A |
| CB8208041:TB50:12 | TB20D:78 | ctrl | 8318119A |
| TB20D:78 | PLC8318102:I:5 | ctrl | 8318119A |
| CB8208051:TB50:14 | TB20D:79 | ctrl | 8318122A |
| TB20D:79 | PLC8318102:I:6 | ctrl | 8318122A |
| CB108061:TB50:16 | TB20D:80 | ctrl | 8318125A |
| TB20D:80 | PLC8318102:I:7 | ctrl | 8318125A |
| CB8208071:TB50:18 | TB20D:82 | ctrl | 8318204A |
| TB20D:82 | PLC8318202:I:0 | ctrl | 8318204A |
| CB_DCP_IND09:TB50:20 | TB20D:83 | ctrl | 8318207A |
| TB20D:83 | PLC8318202:I:1 | ctrl | 8318207A |
| CB_DCP_IND10:TB50:22 | TB20D:84 | ctrl | 8318210A |
| TB20D:84 | PLC8318202:I:2 | ctrl | 8318210A |
| CB_DCP_IND11:TB50:24 | TB20D:85 | ctrl | 8318213A |
| TB20D:85 | PLC8318202:I:3 | ctrl | 8318213A |
| CB_DCP_IND12:TB50:26 | TB20D:86 | ctrl | 8318216A |
| TB20D:86 | PLC8318202:I:4 | ctrl | 8318216A |
| CB_DCP_IND13:TB50:28 | TB20D:87 | ctrl | 8318219A |
| TB20D:87 | PLC8318202:I:5 | ctrl | 8318219A |
| CB_DCP_IND14:TB50:30 | TB20D:88 | ctrl | 8318222A |
| TB20D:88 | PLC8318202:I:6 | ctrl | 8318222A |
| CB_DCP_IND15:TB50:32 | TB20D:89 | ctrl | 8318225A |
| TB20D:89 | PLC8318202:I:7 | ctrl | 8318225A |
| PLC8318302:CH1_pin2 | P8318302:2 | dc | CBL8318302_WH |
| PLC8318302:CH1_pin4 | P8318302:4 | dc | CBL8318302_BU |
| P8318302:2 | J8318302:2 | dc | CBL8318302/WH |
| P8318302:4 | J8318302:4 | dc | CBL8318302/BU |
| J8318302:2 | TS8318302:2 | dc | direct |
| J8318302:4 | TS8318302:4 | dc | direct |
| PLC8317902:Uo | PLC8318002:Uo | dc | 8317938-to-8318000 |
| PLC8318002:Uo | PLC8318102:Uo | dc | 8318037-to-8318101 |
| PLC8318102:Uo | PLC8318202:Uo | dc | 8318138-to-8318139 |

</details>

### IO / Network 83190-83200  (83190-83200) — confidence: med
**Function:** Provides the dual ControlLogix PLC compute backbone, Beckhoff EtherCAT distributed I/O ring, multi-drop RS-422 serial scanner networks, and 24 VDC relay-contact control outputs for the CP83 conveyor panel.

Pages 83190, 83191-83193, 83194, and 83200 document: (83190) two Allen-Bradley ControlLogix 1756 PLC chassis (rack A = PS8319012A/PLC8319012A.x; rack B = PS8319012B/PLC8319012B.x), each containing three 1756-L73 processors, four 1756-N2 bridge modules, one 1756-B32, one 1756-EWEB, one ProSoft MV56E-OSC barcode-scanner comm module, and six 1756-EN2T EtherNet/IP adapters, with SCANNER 1 and SCANNER 2 field-wireable DB9 female connectors (#23171100) feeding the MV56E-OSC and Ethernet cross-refs to customer network and CP-B2 door outlet; (83191-83193) a Beckhoff EtherCAT I/O ring head station PLC8316904 (24 V supervision, Profibus A/B in/out) with power bus PB8319128, daisy-chaining through 15 extension modules PLC8317002-PLC8318302 via ZK1020-0101-1000 fiber cables (CBLB3191xxX series) and ZK5020-3132-0007 power cables (CBLB3191xxX series), forming a redundant ring that closes at cross-ref 8319102; (83194) a Digi Ethernet PortServer DN0219403 (412D013) and five SST serial-scanner modules DN8319400-1 through -5 serving Networks 1-5 via DB9 male cable assemblies COB8319416.1-5 and RS-422 Belden 8102 field-wired cables; (83200) contact-output rungs from CR8313329 (DCP-LSM panel ON), CR8313001 (E-stop slave, Master STD), and CR8313121 (Internal Reset Delay), plus direct 24 VDC rails from conductor-rail-carrier supply cross-refs 8317247/8317250/8317268/8317362/8317365 and safety-gate supply 83080068 routed through MAIN PWR PANEL terminal blocks TB1B2D and TB1B13D.

<details><summary>58 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| XREF_8308015_24VDC | PB8319128 | dc | 8308011B |
| XREF_8308017_0VDC | PB8319128 | dc | 8308012A |
| XREF_8319426A | PLC8316904 | profibus | 8319426A |
| XREF_8319426B | PLC8316904 | profibus | 8319426B |
| PLC8316904 | PLC8317002 | ethercat-fiber | CBLB319114A |
| PLC8317002 | PLC8317102 | ethercat-fiber | CBLB319114B |
| PLC8317102 | PLC8317202 | ethercat-fiber | CBLB319114C |
| PLC8317202 | PLC8317302 | ethercat-fiber | CBLB319114D |
| PLC8317302 | XREF_8319214_FIBER_LOOP | ethercat-fiber | CBLB319114E |
| XREF_8319114_FIBER_LOOP | PLC8317402 | ethercat-fiber | CBLB319214A |
| PLC8317402 | PLC8317602 | ethercat-fiber | CBLB319214B |
| PLC8317602 | PLC8317702 | ethercat-fiber | CBLB319214C |
| PLC8317702 | PLC8317802 | ethercat-fiber | CBLB319214D |
| PLC8317802 | PLC8317902 | ethercat-fiber | CBLB319214E |
| PLC8317902 | PLC8318002 | ethercat-fiber | CBLB319214F |
| PLC8318002 | XREF_8319314_FIBER_LOOP | ethercat-fiber | CBLB319214F |
| XREF_8319214_FIBER_LOOP | PLC8318102 | ethercat-fiber | CBLB319314A |
| PLC8318102 | PLC8318202 | ethercat-fiber | CBLB319314B |
| PLC8318202 | PLC8318302 | ethercat-fiber | CBLB319314C |
| PLC8318302 | XREF_8319102_FIBER_LOOP_ring_close | ethercat-fiber | CBLB319314C |
| PB8319128 | PLC8317002 | dc | CBLB319129A |
| PLC8317002 | PLC8317102 | dc | CBLB319129B |
| PLC8317102 | PLC8317202 | dc | CBLB319129C |
| PLC8317202 | PLC8317302 | dc | CBLB319129D |
| PLC8317302 | XREF_8319229B_24VDC | dc | CBLB319129E |
| XREF_8319129_24VDC | PLC8317402 | dc | CBLB319229A |
| PLC8317402 | PLC8317602 | dc | CBLB319229B |
| PLC8317602 | PLC8317702 | dc | CBLB319229C |
| PLC8317702 | PLC8317802 | dc | CBLB319229D |
| PLC8317802 | PLC8317902 | dc | CBLB319229E |
| PLC8317902 | PLC8318002 | dc | CBLB319229F |
| XREF_8319229_24VDC | PLC8318102 | dc | CBLB319329A |
| PLC8318102 | PLC8318202 | dc | CBLB319329B |
| PLC8318202 | PLC8318302 | dc | CBLB319329C |
| XREF_8308018_24VDC | DN8319400-1 | dc | 8308018 |
| XREF_8319025 | DN8319400-1 | ctrl | 8319025 |
| XREF_8319025 | DN8319400-3 | ctrl | 8319025 |
| XREF_8319025 | DN8319400-4 | ctrl | 8319025 |
| XREF_8319039 | DN8319400-5 | ctrl | 8319039 |
| DN8319400-1 | COB8319416.1 | serial-net1 | DB9_MATE_NET1 |
| DN8319400-2 | COB8319416.2 | serial-net2 | DB9_MATE_NET2 |
| DN8319400-3 | COB8319416.3 | serial-net3 | DB9_MATE_NET3 |
| DN8319400-4 | COB8319416.4 | serial-net4 | DB9_MATE_NET4 |
| DN8319400-5 | COB8319416.5 | serial-net5 | DB9_MATE_NET5 |
| XREF_8313139_24VDC | TB1B2D | dc | 83090068 |
| TB1B2D | TB1B13D | dc | 8308007A |
| TB1B2D | CR8313329 | ctrl | 8320063A |
| CR8313329 | TB1B13D | ctrl | 8320063A |
| TB1B2D | CR8313001 | ctrl | 8320005A |
| CR8313001 | TB1B13D | ctrl | 8320005B |
| TB1B2D | CR8313121 | ctrl | 8320007A |
| CR8313121 | TB1B13D | ctrl | 8320007B |
| XREF_8317247 | TB1B13D | dc | 8317247A |
| XREF_8317250 | TB1B13D | dc | 8317250A |
| XREF_8317268 | TB1B13D | dc | 8317268A |
| XREF_8317362 | TB1B13D | dc | 8317362A |
| XREF_8317365 | TB1B13D | dc | 8317365A |
| XREF_8308010_24VDC | TB1B13D | dc | 83080068 |

</details>
