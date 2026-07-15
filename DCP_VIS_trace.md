# DCP VIS Panel — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 2 sections · 29 devices · 22 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| CB14001 | breaker | 1 | 5A | L→14001A; T→14001B |
| DCPS14001 | psu |  |  | L1→14001B; N→14003A; PE→GND; V+→14001C; V-→14002A |
| TB1A | terminal |  |  | PE→GND; hot→14001A |
| TB2D | terminal |  |  | 1→14010A; 10→14023A; 11→14002A; 13→14001C; 14→14002A; 15→14001C; 16→14002A; 17→14001C |
| VIS14000 | other |  |  | pin10_IO2→14020A; pin11_IO3→14021A; pin12_IO4→14023A; pin1_V+→14001C; pin20_CHASSIS_GND→from_14005; pin2_DC_COM→14002A; pin9_IO1→14010A |
| RECPT14008 | other |  |  |  |
| PE14009 | other |  |  |  |
| CBL14009 | other |  |  |  |
| LT14029 | other |  |  | BN_V+→14001C; BU_0V→14002A |
| LT14033 | other |  |  | BN_V+→14001C; BU_0V→14002A |
| CBL14029 | other |  |  | BN→14001C; BU→14002A |
| CBL14033 | other |  |  | BN→14001C; BU→14002A |
| VIS14032 | other |  |  |  |
| CBL14032 | other |  |  |  |
| LT14104 | other |  |  | A1→14017A; A2→14002A |
| LT14107 | other |  |  | A1→14020A; A2→14002A |
| LT14113 | other |  |  | A1→14001C; A2→14002A |
| CO259 | other |  |  |  |
| EN259 | other |  |  |  |

## Sections

### Section 1 (pages [2, 3, 4, 5]) — confidence: med
**Function:** Provides 120VAC-to-24VDC power conversion and I/O signal routing for an Intelligrated IR item-detection vision system (VIS14000 controller, IR light arrays, Mini Pro Camera) that monitors up to four sorter zone-occupancy inputs and outputs product-select signals to the sorter PLC, with panel-door pilot lights indicating power-on and zone-occupied status.

Page 2 is the primary wiring schematic: CB14001 (5A, 1-pole) feeds DCPS14001 (24VDC PS, model 16G6-XLP95E); TB1A distributes 120VAC; TB2D (18-pos) routes 24VDC I/O signals to/from VIS14000 vision controller (20-pin), two IR light-array sensors LT14029/LT14033 on M12 cord sets CBL14029/CBL14033, receptacle RECPT14008, and Mini Pro Camera VIS14032 via CBL14032/DB15. Ethernet RJ45 and Video BNC connections on VIS14000 are noted but not detailed. Page 3 shows zone-occupancy indicator lamp continuations (LT14104 Zone 1, LT14107 Zone 2) and power-on pilot (LT14113), driven from 24VDC bus. Pages 4 and 5 are internal and external enclosure mechanical layout drawings respectively (not wiring schematics); they confirm physical placement of all components and the three door-mount pilot lights. Wire numbers follow the 14xxx format per Intelligrated convention; all 24VDC/signal wiring is #18 AWG blue per drawing notes. Some small TB terminal labels and VIS14000 I/O pin routing are partially obscured at scan resolution — exact I/O pin-to-TB2D terminal assignments for pins 9–14 are approximated from visible ladder rungs.

<details><summary>22 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| TB1A.hot | CB14001.L | hot | 14001A |
| CB14001.T | DCPS14001.L1 | hot | 14001B |
| DCPS14001.V+ | TB1A | dc | 14001C |
| DCPS14001.V- | TB1A | ret | 14002A |
| TB1A.24V | VIS14000.pin1_V+ | dc | 14001C |
| TB1A.0V | VIS14000.pin2_DC_COM | ret | 14002A |
| TB2D.1 | VIS14000.pin9_IO1 | dc | 14010A |
| TB2D.5 | VIS14000.pin9_IO1 | dc | 14017A |
| TB2D.5 | LT14104.A1 | dc | 14017A |
| TB2D.6 | VIS14000.pin10_IO2 | dc | 14020A |
| TB2D.6 | LT14107.A1 | dc | 14020A |
| TB2D.8 | VIS14000.pin11_IO3 | dc | 14021A |
| TB2D.10 | VIS14000.pin12_IO4 | dc | 14023A |
| TB2D.11 | VIS14000.pin13_IO5 | ret | 14002A |
| TB2D.13 | CBL14029.BN | dc | 14001C |
| TB2D.14 | CBL14029.BU | ret | 14002A |
| TB2D.15 | CBL14033.BN | dc | 14001C |
| TB2D.16 | CBL14033.BU | ret | 14002A |
| LT14104.A2 | TB2D.0V | ret | 14002A |
| LT14107.A2 | TB2D.0V | ret | 14002A |
| LT14113.A1 | 24V_bus | dc | 14001C |
| LT14113.A2 | 0V_bus | ret | 14002A |

</details>

### Section 2 (pages [6]) — confidence: high
**Function:** This page is a Bill of Materials (BOM) listing all panel components for the DCP VIS (IR Item Detection System Control) panel; it contains no point-to-point wiring connections.

BOM-only page for project M-16-00264 DCP VIS panel (IR Item Detection System Control Panel). Components include a 1-pole 5 A circuit breaker (CB14001), a 24 VDC/3.9 A Class 2 power supply (DCPS14001), a Banner Pro II Vision Controller (VIS14000), three pilot lights (LT14104/07/13), a 120 V 15 A DIN-rail receptacle (RECPT14008), two terminal-block sections (TB1A, TB2D), a Hoffman enclosure (EN259), and cable-entry hardware (CO259). No wire numbers or point-to-point connections are present on this page.

