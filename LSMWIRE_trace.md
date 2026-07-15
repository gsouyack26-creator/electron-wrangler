# LS4000 LSM Wiring — Trace Reference
*Auto-traced from M-16-00264 Rev02 via agent page-by-page pass. 1 sections · 13 devices · 38 connections. **Best-effort read of scanned schematics — verify against source PDF.***

## Device schedule

| Tag | Kind | P | Rating | Terminals (role→wire#) |
|---|---|---|---|---|
| VFD | other |  |  | GND→CBL06103-GRN/YEL; U→CBL06103-BLK1; V→CBL06103-BLK2; W→CBL06103-BLK3 |
| TB5D | terminal |  |  | BLK1→CBL06124-BLK1; BLK2→CBL06124-BLK2; BLK3→CBL06124-BLK3; BLK4→CBL06124-BLK4; BLK5→CBL06124-BLK5; BLK6→06703B-cross-ref; BLK7→T4203B-cross-ref; BLK8→D6704A-cross-ref |
| TB1A | terminal | 4 |  | GND→GRN/YEL; U→CBL06103A-BLK; V→BRN; W→GRY |
| TB1D | terminal |  |  | CH1-BLU→CBL06122-BLU; CH1-BRN→CBL06122-BRN; CH2-BLU→CBL06123-BLU; CH2-BRN→CBL06123-BRN; CH3-BLU→CBL06124A-BLU; CH3-BRN→CBL06124A-BRN; GND→GND; L→CBL06130-BRN |
| MTR06103 | other | 3 | 1.5 HP |  |
| MTR06109 | other | 3 | 1.5 HP |  |
| MTR06116 | other | 3 | 1.5 HP |  |
| PJ06130 | other |  |  | BLK→CBL06130-BLK; BLU→CBL06130-BLU; L→CBL06130-BRN |
| PRS06132 | other |  |  |  |
| PD6137 | other |  |  | BLU→CBL06137-BLU; BRN→CBL06137-BRN; GRN→CBL06137-GRN; GRY→CBL06137-GRY; PINK→CBL06137-PINK; RED→CBL06137-RED; WHT→CBL06137-WHT; YEL→CBL06137-YEL |
| J06137 | other |  |  |  |
| TB6D | terminal |  |  | BLK10→14215A-cross-ref; BLK11→14219A-cross-ref; BLK12→14221A-cross-ref; BLK13→14225A-cross-ref; BLK14→14230A-cross-ref; BLK4→14315A-cross-ref; BLK5→14319A-cross-ref; BLK6→14322A-cross-ref |
| TB-DCP_LSM_IO | terminal |  |  | 1→CBL06204-BLK16; 2→CBL06204-BLK13; BLK10→COLLISION; BLK11→JOG; BLK12→JOG; BLK13→MAIN; BLK14→REMOTE; BLK4→AUTO |

## Sections

### Section 1 (pages [1, 2]) — confidence: med
**Function:** Distributes three-phase VFD power from the DCP_LSM panel through an LSM junction box (4130207) to three 1.5 HP linear synchronous motor stators (LSM Stators 1–3), while also routing per-stator over-temperature feedback, collision-guard sensor signal, encoder signal, and sorter control I/O (auto-mode, jog, alarm, main switch) to the DCP_LSM_IO panel via an 18-conductor control cable.

Pages 061–062 form the complete LSM power and control supply section for an ACY1 BEUMER/Intelligrated LS4000 sorter. Page 061 shows the VFD output (DCP_LSM panel) cabled via three 4×14AWG OLFLEX VFD-Slim cables (CBL06103/09/16) through EMC cable-gland entries in junction box 4130207, which holds terminal blocks TB1A (power distribution to three 1.5 HP stator motors MTR06103/09/16) and TB1D (control: per-stator over-temp via CBL06122/23/24A, collision guard sensor PRS06132 via M12 cable CBL06130/PJ06130, and DB9 encoder interface PD6137–J06137 via CBL06137). Page 062 continues the control run: terminal blocks TB1D and TB6D in DCP_LSM carry 14 control conductors (BLK4–BLK16) via an 18×18AWG LAPP cable CBL06204 to a terminal block in the DCP_LSM_IO panel, where signals are labeled Auto-Mode-to-VFD, Error Lamp, Alarm Horn, Over-Temp ×3, Collision Guard, Jog Pendant, Jog Switch, Main Switch, and Remote-Control Jog Mode. A parts list on page 062 confirms cable catalog numbers (Intelligrated, OLFLEX, Turck, LAPP).

<details><summary>38 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| VFD-U | TB1A-U | hot | CBL06103-BLK |
| VFD-V | TB1A-V | hot | CBL06103-BRN |
| VFD-W | TB1A-W | hot | CBL06103-GRY |
| VFD-GND | TB1A-GND | gnd | CBL06103-GRN/YEL |
| TB1A-U | MTR06103-U | hot | CBL06103A-BLK |
| TB1A-V | MTR06103-V | hot | CBL06103A-BRN |
| TB1A-W | MTR06103-W | hot | CBL06103A-GRY |
| TB1A-GND | MTR06103-GND | gnd | CBL06103A-GRN/YEL |
| TB1A-U | MTR06109-U | hot | CBL06109A-BLK |
| TB1A-V | MTR06109-V | hot | CBL06109A-BRN |
| TB1A-W | MTR06109-W | hot | CBL06109A-GRY |
| TB1A-GND | MTR06109-GND | gnd | CBL06109A-GRN/YEL |
| TB1A-U | MTR06116-U | hot | CBL06116A-BLK |
| TB1A-V | MTR06116-V | hot | CBL06116A-BRN |
| TB1A-W | MTR06116-W | hot | CBL06116A-GRY |
| TB1A-GND | MTR06116-GND | gnd | CBL06116A-GRN/YEL |
| TB1D-CH1-BRN | MTR06103-OT-BRN | ctrl | CBL06122-BRN |
| TB1D-CH2-BRN | MTR06109-OT-BRN | ctrl | CBL06123-BRN |
| TB1D-CH3-BRN | MTR06116-OT-BRN | ctrl | CBL06124A-BRN |
| TB1D-CH1-BLU | MTR06103-OT-BLU | ctrl | CBL06122-BLU |
| TB1D-CH2-BLU | MTR06109-OT-BLU | ctrl | CBL06123-BLU |
| TB1D-CH3-BLU | MTR06116-OT-BLU | ctrl | CBL06124A-BLU |
| TB1D-L | PJ06130-pin | ctrl | CBL06130-BRN |
| PJ06130 | PRS06132 | ctrl | CBL06130 |
| PD6137 | J06137 | ctrl | CBL06137 |
| TB5D-BLK1 | TB1A-ctrl | ctrl | CBL06124-BLK1 |
| TB1D-1 | TB-DCP_LSM_IO-1 | ctrl | CBL06204-BLK16 |
| TB6D-BLK4 | TB-DCP_LSM_IO-BLK4 | ctrl | CBL06204-BLK4 |
| TB6D-BLK5 | TB-DCP_LSM_IO-BLK5 | ctrl | CBL06204-BLK5 |
| TB6D-BLK6 | TB-DCP_LSM_IO-BLK6 | ctrl | CBL06204-BLK6 |
| TB6D-BLK7 | TB-DCP_LSM_IO-BLK7 | ctrl | CBL06204-BLK7 |
| TB6D-BLK8 | TB-DCP_LSM_IO-BLK8 | ctrl | CBL06204-BLK8 |
| TB6D-BLK9 | TB-DCP_LSM_IO-BLK9 | ctrl | CBL06204-BLK9 |
| TB6D-BLK10 | TB-DCP_LSM_IO-BLK10 | ctrl | CBL06204-BLK10 |
| TB6D-BLK11 | TB-DCP_LSM_IO-BLK11 | ctrl | CBL06204-BLK11 |
| TB6D-BLK12 | TB-DCP_LSM_IO-BLK12 | ctrl | CBL06204-BLK12 |
| TB6D-BLK13 | TB-DCP_LSM_IO-BLK13 | ctrl | CBL06204-BLK13 |
| TB6D-BLK14 | TB-DCP_LSM_IO-BLK14 | ctrl | CBL06204-BLK14 |

</details>
