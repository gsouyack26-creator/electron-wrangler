# Standard 12-Belt Induction Power — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 2 sections · 74 devices · 60 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| DS06103 | disconnect | 3 | 60A 480VAC | L1_fuse_element→06103A; L1_out_to_bus200→06202; L1_out_to_bus300→06302; L2_fuse_element→06104A; L3_fuse_element→06105A; L3_out_to_bus200→06200; L3_out_to_bus300→06300; aux_ctrl_in→14213A |
| BFB06200 | pdb | 3 | 480VAC | L1_in→06103A; L2_in→06104A; L3_in→06105A |
| FU06200 | fuse | 3 | 480VAC | L1_in→06103A; L2_in→06104A; L3_in→06105A |
| CB06204 | breaker | 3 | 2.5-4A 480VAC | T1_out→06202A; T2_out→06203A; T3_out→06204A; aux_ctrl_in→14219A |
| J06204 | other | 4 |  | pin1_BK_L1→06202A; pin2_WH_L2→06203A; pin3_RD_L3→06204A; pin4_GN_GND→GN |
| CB06209 | breaker | 3 | 2.5-4A 480VAC | T1_out→06207A; T2_out→06208A; T3_out→06209A; aux_ctrl_in→14221A |
| J06209 | other | 4 |  | pin1_BK_L1→06207A; pin2_WH_L2→06208A; pin3_RD_L3→06209A; pin4_GN_GND→GN |
| CB06214 | breaker | 3 | 2.5-4A 480VAC | T1_out→06212A; T2_out→06213A; T3_out→06214A; aux_ctrl_in→14223A |
| J06214 | other | 4 |  | pin1_BK_L1→06212A; pin2_WH_L2→06213A; pin3_RD_L3→06214A; pin4_GN_GND→GN |
| CB06219 | breaker | 3 | 2.5-4A 480VAC | T1_out→06217A; T2_out→06220A; T3_out→06221A; aux_ctrl_in→14225A |
| J06219 | other | 4 |  | pin1_BK_L1→06217A; pin2_WH_L2→06220A; pin3_RD_L3→06221A; pin4_GN_GND→GN |
| CB06224 | breaker | 3 | 2.5-4A 480VAC | T1_out→06222A; T2_out→06223A; T3_out→06224A; aux_ctrl_in→14227A |
| J06224 | other | 4 |  | pin1_BK_L1→06222A; pin2_WH_L2→06223A; pin3_RD_L3→06224A; pin4_GN_GND→GN |
| CB06229 | breaker | 3 | 2.5-4A 480VAC | T1_out→06227A; T2_out→06228A; T3_out→06229A; aux_ctrl_in→14229A |
| J06229 | other | 4 |  | pin1_BK_L1→06227A; pin2_WH_L2→06228A; pin3_RD_L3→06229A; pin4_GN_GND→GN |
| BFB06300 | pdb | 3 | 480VAC | L1_in→06103A; L2_in→06104A; L3_in→06105A |
| FU06300 | fuse | 3 | 480VAC | L1_in→06103A; L2_in→06104A; L3_in→06105A |
| CB06304 | breaker | 3 | 2.5-4A 480VAC | T1_out→06302A; T2_out→06303A; T3_out→06304A; aux_ctrl_in→14231A |
| J06304 | other | 4 |  | pin1_BK_L1→06302A; pin2_WH_L2→06303A; pin3_RD_L3→06304A; pin4_GN_GND→GN |
| CB06309 | breaker | 3 | 2.5-4A 480VAC | T1_out→06308A; T2_out→06309A; T3_out→06310A; aux_ctrl_in→14233A |
| J06309 | other | 4 |  | pin1_BK_L1→06308A; pin2_WH_L2→06309A; pin3_RD_L3→06310A; pin4_GN_GND→GN |
| CB06314 | breaker | 3 | 2.5-4A 480VAC | T1_out→06312A; T2_out→06313A; T3_out→06314A; aux_ctrl_in→14235A |
| J06314 | other | 4 |  | pin1_BK_L1→06312A; pin2_WH_L2→06313A; pin3_RD_L3→06314A; pin4_GN_GND→GN |
| CB06319 | breaker | 3 | 2.5-4A 480VAC | T1_out→06317A; T2_out→06318A; T3_out→06319A; aux_ctrl_in→14237A |
| J06319 | other | 4 |  | pin1_BK_L1→06317A; pin2_WH_L2→06318A; pin3_RD_L3→06319A; pin4_GN_GND→GN |
| CB06324 | breaker | 3 | 2.5-4A 480VAC | T1_out→06322A; T2_out→06323A; T3_out→06324A; aux_ctrl_in→14239A |
| J06324 | other | 4 |  | pin1_BK_L1→06322A; pin2_WH_L2→06323A; pin3_RD_L3→06324A; pin4_GN_GND→GN |
| CB06329 | breaker | 3 | 2.5-4A 480VAC | T1_out→06327A; T2_out→06328A; T3_out→06329A; aux_ctrl_in→14241A |
| J06329 | other | 4 |  | pin1_BK_L1→06327A; pin2_WH_L2→06328A; pin3_RD_L3→06329A; pin4_GN_GND→GN |
| P14201 | psu |  |  | PE→14211A; pos24V_1→14201A; pos24V_2→14204A; ret0V→14206A |
| TB14201 | terminal |  |  | bus_label→24VDC; feed_in→14201A |
| TB14206 | terminal |  |  | bus_label→0VDC; feed_in→14206A |
| TB14211 | terminal |  |  | bus_label→PE; feed_in→14211A |
| CB06220 | breaker | 3 |  |  |
| CB06226 | breaker | 3 |  |  |
| CB06232 | breaker | 3 |  |  |
| CB06302 | breaker | 3 |  |  |
| CB06308 | breaker | 3 |  |  |
| TB06106 | terminal |  |  |  |
| GND06106 | terminal |  |  |  |
| J14201 | other |  |  |  |

## Sections

### Section 1 (pages [2, 3, 4, 5]) — confidence: med
**Function:** A 60 A three-phase fused disconnect (DS06103) takes 480 VAC from the main single-line feed and splits it across two parallel bus bar assemblies (BFB06200 / BFB06300), each supplying six individually fused 3-pole 2.5-4 A circuit breakers that feed the twelve belt motor drives via 4-wire (L1/L2/L3/GND) output connectors; auxiliary contacts on all twelve breakers and the main disconnect are monitored via a 24 VDC control loop whose outputs continue to PLC I/O (page 251).

Pages 061–063 show the 480 VAC power path: a single 60 A fused disconnect (DS06103, 3-pole) receives utility power from the main single-line feed and simultaneously energises two parallel 3-phase bus bar assemblies (BFB06200 and BFB06300, each with an internal 3-element fuse block FU06200/FU06300). Each bus feeds six 3-pole 2.5-4 A motor-branch circuit breakers (CB06204/09/14/19/24/29 on bus 200; CB06304/09/14/19/24/29 on bus 300) — twelve breakers total, one per belt drive, each connecting to a 4-wire output connector (L1 BK / L2 WH / L3 RD / GND GN). Page 142 shows the 24 VDC control monitoring circuit: power entry block P14201 distributes +24 VDC (wire 14201A BN) and 0 VDC (wire 14206A BU) through terminal blocks TB14201/TB14206/TB14211, then individual wires (14213A through 14241A, one per device) feed the auxiliary contacts of DS06103 and all twelve breakers; aux contact outputs continue off-page to PLC I/O (page 251). Two spare positions (rows 14215 GY and 14217 RD-BU) are present. ILLEGIBLE/UNCERTAIN: L2 destination wire numbers from DS06103 to each bus (small label, scan resolution); aux contact output wire numbers (right margin of page 142, going to pg 251) are row coordinates only, not labeled. DRAFTING NOTE: reference boxes for CB06324 and CB06329 on page 063 show TYPE 'CB06308' and 'CB06309' respectively — apparent copy-paste errors in original drawing.

<details><summary>60 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| DS06103:L1_fuse_out | BFB06200:L1_in | 480V_L1 | 06103A |
| DS06103:L2_fuse_out | BFB06200:L2_in | 480V_L2 | 06104A |
| DS06103:L3_fuse_out | BFB06200:L3_in | 480V_L3 | 06105A |
| DS06103:L1_fuse_out | BFB06300:L1_in | 480V_L1 | 06103A |
| DS06103:L2_fuse_out | BFB06300:L2_in | 480V_L2 | 06104A |
| DS06103:L3_fuse_out | BFB06300:L3_in | 480V_L3 | 06105A |
| BFB06200:L1_bus | CB06204:T1_in | 480V_L1 | 06200_bus |
| CB06204:T1_out | J06204:pin1 | hot | 06202A |
| CB06204:T2_out | J06204:pin2 | hot | 06203A |
| CB06204:T3_out | J06204:pin3 | hot | 06204A |
| CB06209:T1_out | J06209:pin1 | hot | 06207A |
| CB06209:T2_out | J06209:pin2 | hot | 06208A |
| CB06209:T3_out | J06209:pin3 | hot | 06209A |
| CB06214:T1_out | J06214:pin1 | hot | 06212A |
| CB06214:T2_out | J06214:pin2 | hot | 06213A |
| CB06214:T3_out | J06214:pin3 | hot | 06214A |
| CB06219:T1_out | J06219:pin1 | hot | 06217A |
| CB06219:T2_out | J06219:pin2 | hot | 06220A |
| CB06219:T3_out | J06219:pin3 | hot | 06221A |
| CB06224:T1_out | J06224:pin1 | hot | 06222A |
| CB06224:T2_out | J06224:pin2 | hot | 06223A |
| CB06224:T3_out | J06224:pin3 | hot | 06224A |
| CB06229:T1_out | J06229:pin1 | hot | 06227A |
| CB06229:T2_out | J06229:pin2 | hot | 06228A |
| CB06229:T3_out | J06229:pin3 | hot | 06229A |
| BFB06300:L1_bus | CB06304:T1_in | 480V_L1 | 06300_bus |
| CB06304:T1_out | J06304:pin1 | hot | 06302A |
| CB06304:T2_out | J06304:pin2 | hot | 06303A |
| CB06304:T3_out | J06304:pin3 | hot | 06304A |
| CB06309:T1_out | J06309:pin1 | hot | 06308A |
| CB06309:T2_out | J06309:pin2 | hot | 06309A |
| CB06309:T3_out | J06309:pin3 | hot | 06310A |
| CB06314:T1_out | J06314:pin1 | hot | 06312A |
| CB06314:T2_out | J06314:pin2 | hot | 06313A |
| CB06314:T3_out | J06314:pin3 | hot | 06314A |
| CB06319:T1_out | J06319:pin1 | hot | 06317A |
| CB06319:T2_out | J06319:pin2 | hot | 06318A |
| CB06319:T3_out | J06319:pin3 | hot | 06319A |
| CB06324:T1_out | J06324:pin1 | hot | 06322A |
| CB06324:T2_out | J06324:pin2 | hot | 06323A |
| CB06324:T3_out | J06324:pin3 | hot | 06324A |
| CB06329:T1_out | J06329:pin1 | hot | 06327A |
| CB06329:T2_out | J06329:pin2 | hot | 06328A |
| CB06329:T3_out | J06329:pin3 | hot | 06329A |
| P14201:pos24V_1 | TB14201:feed_in | dc | 14201A |
| P14201:ret0V | TB14206:feed_in | ret | 14206A |
| P14201:PE | TB14211:feed_in | PE | 14211A |
| TB14201:bus | DS06103:aux_ctrl_in | ctrl | 14213A |
| TB14201:bus | CB06204:aux_ctrl_in | ctrl | 14219A |
| TB14201:bus | CB06209:aux_ctrl_in | ctrl | 14221A |
| TB14201:bus | CB06214:aux_ctrl_in | ctrl | 14223A |
| TB14201:bus | CB06219:aux_ctrl_in | ctrl | 14225A |
| TB14201:bus | CB06224:aux_ctrl_in | ctrl | 14227A |
| TB14201:bus | CB06229:aux_ctrl_in | ctrl | 14229A |
| TB14201:bus | CB06304:aux_ctrl_in | ctrl | 14231A |
| TB14201:bus | CB06309:aux_ctrl_in | ctrl | 14233A |
| TB14201:bus | CB06314:aux_ctrl_in | ctrl | 14235A |
| TB14201:bus | CB06319:aux_ctrl_in | ctrl | 14237A |
| TB14201:bus | CB06324:aux_ctrl_in | ctrl | 14239A |
| TB14201:bus | CB06329:aux_ctrl_in | ctrl | 14241A |

</details>

### Section 2 (pages [6, 7, 8, 9]) — confidence: med
**Function:** This section provides overcurrent-protected 480VAC 3-phase power distribution for 12 induction belt conveyor drive motors: a 60A fused main disconnect (DS06103) feeds two parallel 25A Class-CC fuse blocks (FU06200/FU06300) each bussed via compact busbar feeder blocks (BFB06200/BFB06300) to six 3-pole thermomagnetic motor circuit breakers (2.5–4A, with aux contacts for status feedback), whose outputs terminate at Turck 4-pin field receptacles (J06204–J06329) for direct motor cable connection.

Pages 251 and 259 are physical layout drawings (internal DIN-rail arrangement and external enclosure/door layout respectively) for Hoffman ENCL259 24×30×8 wall-mount enclosure. Pages 970–971 are the Bill of Material. No point-to-point wiring schematic with wire numbers is present in this image set; terminal wire numbers cannot be extracted. Ambiguity: six tags in the bottom label band of pg 251 (CB06220, CB06226, CB06232, CB06302, CB06308, CB06314) are not confirmed by the BOM and may belong to an adjacent panel section or a second sub-row not captured in these BOM pages. GND bars (Square-D PK7GTA 7-pt aluminum, qty 2) are listed in the BOM but their panel tags are not separately labeled in the layout.

