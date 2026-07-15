# Voltbench — Extraction Contract (for schematic → .panel.json)

Read an electrical schematic sheet and emit a `.panel.json` that loads into the Voltbench.
Source PDF: `C:\Users\souyackg\Downloads\Amazon ACY1_13XP33_SSE_Elec.pdf`.

## Render a page to view it
```python
import fitz
doc=fitz.open(r'C:\Users\souyackg\Downloads\Amazon ACY1_13XP33_SSE_Elec.pdf')
doc[PAGE].get_pixmap(matrix=fitz.Matrix(2.4,2.4)).save('p.png')   # then: view p.png
print(' '.join(doc[PAGE].get_text().split()))                    # raw text (tags/nets)
```

## JSON shape
```json
{ "name":"ACY1 13XP33 <DWG> — <title>", "backdrop":null,
  "components":[ {"id":"disc1","type":"disc","x":210,"y":100,"label":"DISC0001","poles":3,"state":"closed"} ],
  "wires":[ {"id":"w1","a":"src|L1","b":"disc1|in0","net":"hot"} ] }
```
- Wire endpoint = `"<componentId>|<terminalId>"`. `net` = `hot` (L1/L2/L3/power), `ret` (N/0V/GND), or `ctrl` (control/24V logic).
- Lay out left→right following power flow; x in ~40..900, y in ~60..420. Space components ~130px apart.
- Give every component the real schematic tag as `label` (DISC0001, CB1001, SR2301, MTR5023, etc.).

## Component types + EXACT terminal ids
| type | terminals | notes |
|---|---|---|
| source | 3ph: `L1 L2 L3` (hot) `N` (ret) · 1ph: `L`(hot) `N`(ret) | set `phases`:1 or 3, `volts` |
| disc | `in0 out0 in1 out1 in2 out2` | 3-pole default; `poles`:1/2/3; `state`:"closed"/"open" |
| breaker | `in0 out0 in1 out1 in2 out2` | (use for MPCB/CB/feeder) `poles`; `state`:closed/open/tripped |
| fuse | `a b` | `state`:ok/blown |
| contactor | `L1 T1 L2 T2 L3 T3 A1 A2` | poles conduct when coil A1(hot)+A2(ret) energized. `poles` |
| overload | `L1 T1 L2 T2 L3 T3 95 96` | 95-96 = NC aux; `state`:ok/tripped |
| relay | coil `A1 A2`, NO `11 14`, NC `21 22` | coil energized→11-14 close,21-22 open. USE for SAFETY RELAY (SR): coil=A1/A2, safe-out=11-14 |
| vfd | `L1 L2 L3 U V W EN` | passes L→U etc when EN is hot-live. |
| motor | 3ph:`U V W` · 1ph:`a b` | load. `phases`:1/3 |
| light | `a b` | load. `color` hex |
| estop | `a b` | NC; state closed(ok)/open(pressed) |
| pbNO | `a b` | Start; state open/closed |
| pbNC | `a b` | Stop; state closed/open |
| selector | `a b` | maintained; state open/closed |
| sensor | `a b` | photo-eye/EZLogic; state open/closed |
| plcIn | `in c` | c is ret. load |
| plcOut | `c out` | c is hot; state off/on |
| term | `a b t bt` | terminal block / distribution block / junction (all 4 linked) |

## Rules
- A LOAD (motor/light/plcIn) runs when one terminal is hot-live and the other ret-live (3ph motor: all U/V/W hot).
- Model a distribution block or bus with a `term` (or fan multiple wires off one terminal — union merges nodes).
- Transformer: model primary as a source feed + treat secondary as a `source` (new voltage) OR skip — for tracer purposes represent the secondary supply as a `source` with the secondary volts.
- Phase-monitor relay / power supplies that only sense: represent as a `plcIn`/`light` load, or omit if not on the power path.
- Skip pure I/O-assignment tables, legends, network diagrams, and physical layouts — those are NOT circuits.

## Self-verify (MUST run before declaring done)
Put your file in `C:\Users\souyackg\Dev\tools\panel-tracer\`, then from that folder run the loader check:
```
node <harness>   # loads JSON as PANEL, calls solve(), prints components/wires + any motor/coil on-state
```
Use `~/.aki/tmp/pt_verify.mjs <file.panel.json>` (created by lead). It must load with 0 errors and the intended load should energize when all switches closed.
