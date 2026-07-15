# CP82 Main Power Panel — Trace Reference
*Auto-traced from drawing set M-16-00264 Rev02 (ACY1) via 14-agent page-by-page pass. 7 sections · 358 devices · 512 connections. **Best-effort read of scanned schematics — VERIFY against the source PDF before field use.***

## Device schedule

| Tag | Kind | P | Rating | Section | Terminals (role → wire#) |
|---|---|---|---|---|---|
| DISC8206018B | disconnect | 3 | 600A disconnect, fuses 500A | Main Power Distribution | L1→incoming; L2→incoming; L3→incoming; T1→8206021A_1500MCM; T2→8206021B_1500MCM; T3→8206021C_1500MCM |
| GNDB206017 | other |  |  | Main Power Distribution | GND→service |
| CTB206031 | other |  |  | Main Power Distribution | H-A→8206021A_1500MCM; H-B→8206021B_1500MCM; H-C→8206021C_1500MCM; X1→8209502; X2→8209503; X3→8209504; X4→8209505; X5→8209506 |
| TB1A | terminal | 3 | 120VAC, 30A (GND terminal annotated 30A) | Main Power Distribution | GND→8206118A; L1→8206119A; N→8206120A |
| DSB206005 | disconnect |  |  | Main Power Distribution | L→8206005A; T→8206005B |
| CBB206005 | breaker | 1 | 6A | Main Power Distribution | L→8206005A; T→8206005B |
| PWR8206005A | psu |  | 24VDC output | Main Power Distribution | +V0→to; -V0→to; AC_L→8206005B; GND→chassis |
| PWB206005B | psu |  | 24VDC output | Main Power Distribution | +V0→to; -V0→to; AC_L→8206005B; GND→chassis |
| TB1D | terminal |  |  | Main Power Distribution | 1→8300002A; 2→8300003A; 3→8300004A; GND→chassis |
| GNDB206100 | other |  |  | Main Power Distribution | GND→main |
| PDB8206110 | pdb | 3 |  | Main Power Distribution | L1→from; L2→from; L3→third; T-CBB111-L1→8206111A_1/0_AWG; T-CBB118-L1→8206118A_3AWG; T-CBB124-L1→8206124A_350_KCM; T-CBB131-L1→8206131A |
| CBB206111 | breaker | 3 | 200A | Main Power Distribution | L1→8206111A_1/0_AWG; L2→8206112A_1/0_AWG; L3→8206113A_1/0_AWG; T1→to; T2→to; T3→to |
| MB212105 | contactor | 3 |  | Main Power Distribution | 1L1→8206111A_1/0_AWG; 1L2→8206112A_1/0_AWG; 1L3→8206113A_1/0_AWG; 2T1→8206111B_1/0_AWG; 2T2→8206112B_1/0_AWG; 2T3→8206113B_1/0_AWG |
| MB212110 | contactor | 3 |  | Main Power Distribution | 1L1→8206111B_1/0_AWG; 1L2→8206112B_1/0_AWG; 1L3→8206113B_1/0_AWG; 2T1→8206111C_1/0_AWG; 2T2→8206112C_1/0_AWG; 2T3→8206113C_1/0_AWG |
| CBB206118 | breaker | 3 | 100A | Main Power Distribution | L1→8206118A_3AWG; L2→8206119A_3AWG; L3→8206120A_3AWG; T1→to; T2→to; T3→to |
| CBB206124 | breaker | 3 | 300A | Main Power Distribution | L1→8206124A_350_KCM; L2→8206125A_350_KCM; L3→8206126A_350_KCM; T1→to; T2→to; T3→to |
| MB212120 | contactor | 3 |  | Main Power Distribution | 1L1→8206124A_350_KCM; 1L2→8206125A_350_KCM; 1L3→8206126A_350_KCM; 2T1→8206124B_350_KCM; 2T2→8206125B_350_KCM; 2T3→8206126B_350_KCM |
| MB212125 | contactor | 3 |  | Main Power Distribution | 1L1→8206124B_350_KCM; 1L2→8206125B_350_KCM; 1L3→8206126B_350_KCM; 2T1→8206124C_350_KCM; 2T2→8206125C_350_KCM; 2T3→8206126C_350_KCM |
| CBB206131 | breaker | 3 | 100A | Main Power Distribution | L1→8206131A; L2→8206132A; L3→8206133A; T1→8206131A; T2→8206132A; T3→8206133A |
| PDB8207001 | pdb | 3 |  | LSM + Conductor Rail Power | L1-in→8206111; L2-in→8206112; L3-in→8206113 |
| CBB8207001 | breaker | 3 | 20A | LSM + Conductor Rail Power | T1→8207001A; T2→8207002A; T3→8207003A; aux+b→8214000; aux-b→8214001 |
| TB7001A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207001A; 2→8207002A; 3→8207003A |
| DCP-LSM-01 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207001A; L2→8207002A; L3→8207003A |
| CBB8207011 | breaker | 3 | 20A | LSM + Conductor Rail Power | T1→8207011A; T2→8207012A; T3→8207013A; aux+b→8214007; aux-b→8214009 |
| TB7011A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207011A; 2→8207012A; 3→8207013A |
| DCP-LSM-02 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207011A; L2→8207012A; L3→8207013A |
| CBB8207021 | breaker | 3 | 20A | LSM + Conductor Rail Power | T1→8207021A; T2→8207022A; T3→8207023A; aux+b→8214011; aux-b→8214013 |
| TB7021A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207021A; 2→8207022A; 3→8207023A |
| DCP-LSM-03 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207021A; L2→8207022A; L3→8207023A |
| CBB8207031 | breaker | 3 | 20A | LSM + Conductor Rail Power | T1→8207031A; T2→8207032A; T3→8207033A; aux+b→8214016; aux-b→8214018 |
| TB7031A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207031A; 2→8207032A; 3→8207033A |
| DCP-LSM-04 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207031A; L2→8207032A; L3→8207033A |
| CBB8207041 | breaker | 3 | 20A | LSM + Conductor Rail Power | T1→8207041A; T2→8207042A; T3→8207043A; aux+b→8214021; aux-b→8214023 |
| TB7041A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207041A; 2→8207042A; 3→8207043A |
| DCP-LSM-05 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207041A; L2→8207042A; L3→8207043A |
| CBB8207051 | breaker | 3 | 20A | LSM + Conductor Rail Power | T1→8207051A; T2→8207052A; T3→8207053A; aux+b→8214026; aux-b→8214028 |
| TB7051A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207051A; 2→8207052A; 3→8207053A |
| DCP-LSM-06 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207051A; L2→8207052A; L3→8207053A |
| CBB8207061 | breaker | 3 | 20A | LSM + Conductor Rail Power | T1→8207061A; T2→8207062A; T3→8207063A; aux+b→8214031; aux-b→8214033 |
| TB7061A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207061A; 2→8207062A; 3→8207063A |
| DCP-LSM-07 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207061A; L2→8207062A; L3→8207063A |
| PDB8207501 | pdb | 3 |  | LSM + Conductor Rail Power | L1-in→8206118; L2-in→8206119; L3-in→8206120 |
| CBB8207501 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207501A; T2→8207502A; T3→8207503A; aux+→8214102 |
| M8212202 | other | 3 |  | LSM + Conductor Rail Power | L1→8207501A; L2→8207502A; L3→8207503A; T1→8207501B; T2→8207502B; T3→8207503B; aux→8212202 |
| TB7501A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207501B; 2→8207502B; 3→8207503B |
| DCP-CR-01 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207501B; L2→8207502B; L3→8207503B |
| CBB8207511 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207511A; T2→8207512A; T3→8207513A; aux+→8214104 |
| M8212206 | other | 3 |  | LSM + Conductor Rail Power | L1→8207511A; L2→8207512A; L3→8207513A; T1→8207511B; T2→8207512B; T3→8207513B; aux→8212206 |
| TB7511A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207511B; 2→8207512B; 3→8207513B |
| DCP-CR-02 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207511B; L2→8207512B; L3→8207513B |
| CBB8207521 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207521A; T2→8207522A; T3→8207523A; aux+→8214106 |
| M8212210 | other | 3 |  | LSM + Conductor Rail Power | L1→8207521A; L2→8207522A; L3→8207523A; T1→8207521B; T2→8207522B; T3→8207523B; aux→8212210 |
| TB7521A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207521B; 2→8207522B; 3→8207523B |
| DCP-CR-03 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207521B; L2→8207522B; L3→8207523B |
| CBB8207531 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207531A; T2→8207532A; T3→8207533A; aux+→8214108 |
| M8212214 | other | 3 |  | LSM + Conductor Rail Power | L1→8207531A; L2→8207532A; L3→8207533A; T1→8207531B; T2→8207532B; T3→8207533B; aux→8212214 |
| TB7531A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207531B; 2→8207532B; 3→8207533B |
| DCP-CR-04 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207531B; L2→8207532B; L3→8207533B |
| CBB8207541 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207541A; T2→8207542A; T3→8207543A; aux+→8214110 |
| M8212218 | other | 3 |  | LSM + Conductor Rail Power | L1→8207541A; L2→8207542A; L3→8207543A; T1→8207541B; T2→8207542B; T3→8207543B; aux→8212218 |
| TB7541A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207541B; 2→8207542B; 3→8207543B |
| DCP-CR-05 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207541B; L2→8207542B; L3→8207543B |
| CBB8207551 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207551A; T2→8207552A; T3→8207553A; aux+→8214112 |
| M8212222 | other | 3 |  | LSM + Conductor Rail Power | L1→8207551A; L2→8207552A; L3→8207553A; T1→8207551B; T2→8207552B; T3→8207553B; aux→8212222 |
| TB7551A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207551B; 2→8207552B; 3→8207553B |
| DCP-CR-06 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207551B; L2→8207552B; L3→8207553B |
| CBB8207561 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207561A; T2→8207562A; T3→8207563A; aux+→8214114 |
| M8212226 | other | 3 |  | LSM + Conductor Rail Power | L1→8207561A; L2→8207562A; L3→8207563A; T1→8207561B; T2→8207562B; T3→8207563B; aux→8212226 |
| TB7561A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207561B; 2→8207562B; 3→8207563B |
| DCP-CR-07 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207561B; L2→8207562B; L3→8207563B |
| CBB8207571 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207571A; T2→8207572A; T3→8207573A; aux+→8214116 |
| M8212230 | other | 3 |  | LSM + Conductor Rail Power | L1→8207571A; L2→8207572A; L3→8207573A; T1→8207571B; T2→8207572B; T3→8207573B; aux→8212230 |
| TB7571A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207571B; 2→8207572B; 3→8207573B |
| DCP-CR-08 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207571B; L2→8207572B; L3→8207573B |
| CBB8207601 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207601A; T2→8207602A; T3→8207603A; aux+→8214118 |
| M8212242 | other | 3 |  | LSM + Conductor Rail Power | L1→8207601A; L2→8207602A; L3→8207603A; T1→8207601B; T2→8207602B; T3→8207603B; aux→8212242 |
| TB7601A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207601B; 2→8207602B; 3→8207603B |
| DCP-CR-09 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207601B; L2→8207602B; L3→8207603B |
| CBB8207611 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207611A; T2→8207612A; T3→8207613A; aux+→8214120 |
| M8212246 | other | 3 |  | LSM + Conductor Rail Power | L1→8207611A; L2→8207612A; L3→8207613A; T1→8207611B; T2→8207612B; T3→8207613B; aux→8212246 |
| TB7611A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207611B; 2→8207612B; 3→8207613B |
| DCP-CR-10 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207611B; L2→8207612B; L3→8207613B |
| CBB8207621 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207621A; T2→8207622A; T3→8207623A; aux+→8214122 |
| M8212250 | other | 3 |  | LSM + Conductor Rail Power | L1→8207621A; L2→8207622A; L3→8207623A; T1→8207621B; T2→8207622B; T3→8207623B; aux→8212250 |
| TB7621A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207621B; 2→8207622B; 3→8207623B |
| DCP-CR-11 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207621B; L2→8207622B; L3→8207623B |
| CBB8207631 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207631A; T2→8207632A; T3→8207633A; aux+→8214124 |
| M8212254 | other | 3 |  | LSM + Conductor Rail Power | L1→8207631A; L2→8207632A; L3→8207633A; T1→8207631B; T2→8207632B; T3→8207633B; aux→8212254 |
| TB7631A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207631B; 2→8207632B; 3→8207633B |
| DCP-CR-12 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207631B; L2→8207632B; L3→8207633B |
| CBB8207641 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207641A; T2→8207642A; T3→8207643A; aux+→8214126 |
| M8212258 | other | 3 |  | LSM + Conductor Rail Power | L1→8207641A; L2→8207642A; L3→8207643A; T1→8207641B; T2→8207642B; T3→8207643B; aux→8212258 |
| TB7641A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207641B; 2→8207642B; 3→8207643B |
| DCP-CR-13 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207641B; L2→8207642B; L3→8207643B |
| CBB8207651 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207651A; T2→8207652A; T3→8207653A; aux+→8214128 |
| M8212262 | other | 3 |  | LSM + Conductor Rail Power | L1→8207651A; L2→8207652A; L3→8207653A; T1→8207651B; T2→8207652B; T3→8207653B; aux→8212262 |
| TB7651A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207651B; 2→8207652B; 3→8207653B |
| DCP-CR-14 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207651B; L2→8207652B; L3→8207653B |
| CBB8207661 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207661A; T2→8207662A; T3→8207663A; aux+→8214128 |
| M8212266 | other | 3 |  | LSM + Conductor Rail Power | L1→8207661A; L2→8207662A; L3→8207663A; T1→8207661B; T2→8207662B; T3→8207663B; aux→8212266 |
| TB7661A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207661B; 2→8207662B; 3→8207663B |
| DCP-CR-15 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207661B; L2→8207662B; L3→8207663B |
| CBB8207671 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207671A; T2→8207672A; T3→8207673A; aux+→8214124 |
| M8212270 | other | 3 |  | LSM + Conductor Rail Power | L1→8207671A; L2→8207672A; L3→8207673A; T1→8207671B; T2→8207672B; T3→8207673B; aux→8212270 |
| TB7671A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207671B; 2→8207672B; 3→8207673B |
| DCP-CR-16 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207671B; L2→8207672B; L3→8207673B |
| CBB8207701 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207701A; T2→8207702A; T3→8207703A; aux+→8214118 |
| M8212274 | other | 3 |  | LSM + Conductor Rail Power | L1→8207701A; L2→8207702A; L3→8207703A; T1→8207701B; T2→8207702B; T3→8207703B; aux→8212274 |
| TB7701A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207701B; 2→8207702B; 3→8207703B |
| DCP-CR-17 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207701B; L2→8207702B; L3→8207703B |
| CBB8207711 | breaker | 3 | 15A | LSM + Conductor Rail Power | T1→8207711A; T2→8207712A; T3→8207713A; aux+→8214120 |
| M8212278 | other | 3 |  | LSM + Conductor Rail Power | L1→8207711A; L2→8207712A; L3→8207713A; T1→8207711B; T2→8207712B; T3→8207713B; aux→8212278 |
| TB7711A | terminal | 3 |  | LSM + Conductor Rail Power | 1→8207711B; 2→8207712B; 3→8207713B |
| DCP-CR-18 | psu |  |  | LSM + Conductor Rail Power | GND→GND; L1→8207711B; L2→8207712B; L3→8207713B |
| PDB8208001 | pdb | 3 |  | Induction Power | L1→8206124; L2→8206125; L3→8206135 |
| CBB8208001 | breaker | 3 | 30A | Induction Power | L1→8208001; L2→8208002; L3→8208003; T1→8208001A; T2→8208002A; T3→8208003A |
| TBB8001A | terminal |  |  | Induction Power | 1→8208001A; 2→8208002A; 3→8208003A; GND→GND |
| CBB8208011 | breaker | 3 | 30A | Induction Power | L1→8208011; L2→8208012; L3→8208013; T1→8208011A; T2→8208012A; T3→8208013A |
| TBB8011A | terminal |  |  | Induction Power | 1→8208011A; 2→8208012A; 3→8208013A; GND→GND |
| CBB8208021 | breaker | 3 | 30A | Induction Power | L1→8208021; L2→8208022; L3→8208023; T1→8208021A; T2→8208022A; T3→8208023A |
| TBB8021A | terminal |  |  | Induction Power | 1→8208021A; 2→8208022A; 3→8208023A; GND→GND |
| CBB8208031 | breaker | 3 | 30A | Induction Power | L1→8208031; L2→8208032; L3→8208033; T1→8208031A; T2→8208032A; T3→8208033A |
| TBB8031A | terminal |  |  | Induction Power | 1→8208031A; 2→8208032A; 3→8208033A; GND→GND |
| CBB8208041 | breaker | 3 | 30A | Induction Power | T1→8208041A; T2→8208042A; T3→8208043A |
| TBB8041A | terminal |  |  | Induction Power | 1→8208041A; 2→8208042A; 3→8208043A; GND→GND |
| CBB8208051 | breaker | 3 | 30A | Induction Power | T1→8208051A; T2→8208052A; T3→8208053A |
| TBB8051A | terminal |  |  | Induction Power | 1→8208051A; 2→8208052A; 3→8208053A; GND→GND |
| CBB8208061 | breaker | 3 | 30A | Induction Power | T1→8208061A; T2→8208062A; T3→8208063A |
| TBB8061A | terminal |  |  | Induction Power | 1→8208061A; 2→8208062A; 3→8208063A; GND→GND |
| CBB8208071 | breaker | 3 | 30A | Induction Power | T1→8208071A; T2→8208072A; T3→8208073A |
| TBB8071A | terminal |  |  | Induction Power | 1→8208071A; 2→8208072A; 3→8208073A; GND→GND |
| CBB8208101 | breaker | 3 | 30A | Induction Power | L1→8206125C; T1→8208101A; T2→8208102A; T3→8208103A |
| TBB101A | terminal |  |  | Induction Power | 1→8208101A; 2→8208102A; 3→8208103A; GND→GND |
| CBB8208111 | breaker | 3 | 30A | Induction Power | T1→8208111A; T2→8208112A; T3→8208113A |
| TBB111A | terminal |  |  | Induction Power | 1→8208111A; 2→8208112A; 3→8208113A; GND→GND |
| CBB8208121 | breaker | 3 | 30A | Induction Power | T1→8208121A; T2→8208122A; T3→8208123A |
| TBB121A | terminal |  |  | Induction Power | 1→8208121A; 2→8208122A; 3→8208123A; GND→GND |
| CBB8208131 | breaker | 3 | 30A | Induction Power | T1→8208131A; T2→8208132A; T3→8208133A |
| TBB131A | terminal |  |  | Induction Power | 1→8208131A; 2→8208132A; 3→8208133A; GND→GND |
| CBB8208141 | breaker | 3 | 30A | Induction Power | T1→8208141A; T2→8208142A; T3→8208143A |
| TBB141A | terminal |  |  | Induction Power | 1→8208141A; 2→8208142A; 3→8208143A; GND→GND |
| CBB8208151 | breaker | 3 | 30A | Induction Power | T1→8208151A; T2→8208152A; T3→8208153A |
| TBB151A | terminal |  |  | Induction Power | 1→8208151A; 2→8208152A; 3→8208153A; GND→GND |
| CBB8208161 | breaker | 3 | 30A | Induction Power | T1→8208161A; T2→8208162A; T3→8208163A |
| TBB161A | terminal |  |  | Induction Power | 1→8208161A; 2→8208162A; 3→8208163A; GND→GND |
| PDB8209001 | pdb |  |  | Controls / Transformer / Devices | L1-in→8206131; L2-in→8206132; L3-in→8206133; bus→8209000 |
| CBB8209001 | breaker | 3 | 20A | Controls / Transformer / Devices | T1→8209001A; T2→8209002A; T3→8209003A |
| TB9001A | terminal |  |  | Controls / Transformer / Devices | 1→8209001A; 2→8209002A; 3→8209003A; GND→8209AVG-GRN |
| CBB8209021 | breaker | 3 | 20A | Controls / Transformer / Devices | T1→8209021A; T2→8209022A; T3→8209023A |
| TB9021A | terminal |  |  | Controls / Transformer / Devices | 1→8209021A; 2→8209022A; 3→8209023A; GND→8209AVG-GRN |
| CBB8209041 | breaker | 3 | 20A | Controls / Transformer / Devices | T1→8209041A; T2→8209042A; T3→8209043A |
| TB9041A | terminal |  |  | Controls / Transformer / Devices | 1→8209041A; 2→8209042A; 3→8209043A; GND→8209AVG-GRN |
| CBB8209061 | breaker | 3 | 20A | Controls / Transformer / Devices | T1→8209061A; T2→8209062A; T3→8209063A |
| TB9061A | terminal |  |  | Controls / Transformer / Devices | 1→8209061A; 2→8209062A; 3→8209063A; GND→8209AVG-GRN |
| OBB8209532 | pdb |  |  | Controls / Transformer / Devices |  |
| PMB8209502 | other |  |  | Controls / Transformer / Devices | CT1+→8206105; CT1-→8206105; CT2+→8206106; CT2-→8206106; SHD→8206107; V-in→8209608A |
| T8209516 | transformer |  |  | Controls / Transformer / Devices | 1H1→8209514A; 1H2→8206104A; 2H1→8209515A; 2H2→8206104B; 2X1→8209516A; N→8206104C |
| CBB8209601 | breaker | 3 | 40A | Controls / Transformer / Devices | T1→8209601A; T2→8209602A; T3→8209603A |
| T8209606 | transformer |  | 15 KVA, 480 V primary / 208Y-120 V secondary | Controls / Transformer / Devices | H1→8209601A; H2→8209602A; H3→8209603A; X0→8209608A; X1→8209608B; X2→8209608C; X3→8209608D |
| CBB8209611 | breaker | 3 | 50A | Controls / Transformer / Devices | L1→8209608B; L2→8209608C; L3→8209608D; T1→8209611A; T2→8209612A; T3→8209613A |
| PDBB8209611 | pdb | 3 |  | Controls / Transformer / Devices | L1→8209611A; L2→8209612A; L3→8209613A; out-1→8209616A; out-2→8209617A; out-3→8209618A; out-4→8209619A; out-5→8209620A |
| PDBB8209615 | pdb |  |  | Controls / Transformer / Devices | N-in→8209608A; out→8209701 |
| CB8209619 | breaker | 3 |  | Controls / Transformer / Devices | T1→8209619B; T2→8209620B; T3→8209621A |
| PMB8209620 | other |  |  | Controls / Transformer / Devices | L1→8209619B; L2→8209620B; L3→8209621A; N→8209701 |
| FB8209628 | fuse | 3 |  | Controls / Transformer / Devices |  |
| CBB8209705 | breaker |  |  | Controls / Transformer / Devices | out→8209705A |
| PWB8209705 | psu |  | 24 VDC, Allen-Bradley 1606-XLP95E | Controls / Transformer / Devices | GND→8209613A; L-in→8209705A; TB-out-pos→8209608A; TB16D4→8308007A; TB16DGND→TB16DGND |
| TB1D | terminal |  |  | Controls / Transformer / Devices | to-TB16D1→8308006A; to-TB16D4→8308007A |
| CBB8209720 | breaker |  |  | Controls / Transformer / Devices | out→8209720A |
| PWB8209720 | psu |  | 24 VDC, Allen-Bradley 1606-XLP95E | Controls / Transformer / Devices | L-in→8209720A; TB2D8→8308012A; TB2DGND→TB2DGND |
| TB2D | terminal |  |  | Controls / Transformer / Devices | to-TB2D1→8308011A; to-TB2D8→8308012A |
| CBB8209745 | breaker | 1 | 6A | Controls / Transformer / Devices | in→8209745A; out→8212100 |
| TB2A | terminal |  |  | Controls / Transformer / Devices | 1→8212100; 2→8212100 |
| CBB8209751 | breaker | 1 | 6A | Controls / Transformer / Devices | in→8209751A; out→8209751B |
| LSB8209751 | other |  |  | Controls / Transformer / Devices | in→8209751B; out→8209755A |
| LTB8209751 | other |  |  | Controls / Transformer / Devices | L→8209755A; N→8209701 |
| LSB8209753 | other |  |  | Controls / Transformer / Devices | in→8209753B; out→8209755A |
| LTB8209753 | other |  |  | Controls / Transformer / Devices | L→8209755A; N→8209701 |
| LSB8209756 | other |  |  | Controls / Transformer / Devices | in→8209756A; out→8209756B |
| LTB8209756 | other |  |  | Controls / Transformer / Devices | L→8209756B; N→8209701 |
| LSB8209759 | other |  |  | Controls / Transformer / Devices | in→8209759A; out→8209759B |
| LTB8209759 | other |  |  | Controls / Transformer / Devices | L→8209759B; N→8209701 |
| CBB8209763 | breaker | 1 | 6A | Controls / Transformer / Devices | in→8209763A; out→8209763B |
| RECP8209763 | other |  |  | Controls / Transformer / Devices | GND→8209AVG-GRN; L→8209763B; N→8209701 |
| RECPT8209769 | other |  |  | Controls / Transformer / Devices | GND→8209AVG-GRN; L→8209763B; N→8209701 |
| CBB8209803 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209803A |
| CBB8209808 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209808A |
| CBB8209813 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209813A |
| CBB8209818 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209818A |
| CBB8209823 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209823A |
| CBB8209828 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209828A |
| CBB8209833 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209833A |
| TB3A | terminal |  |  | Controls / Transformer / Devices | 1→8209803A; 11→8209828A; 13→8209833A; 15→8209843A; 17→8209848A; 19→8209853A; 21→8209858A; 23→8209863A |
| CBB8209843 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209843A |
| CBB8209848 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209848A |
| CBB8209853 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209853A |
| CBB8209858 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209858A |
| CBB8209863 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209863A |
| CBB8209866B | breaker | 1 | 20A | Controls / Transformer / Devices | in→8209866A; out→8209866B |
| UPS8209833 | psu |  |  | Controls / Transformer / Devices | GND-in→8209AVG-GRN; GND-out→8209AVG-GRN; L-in→8209866B; L-out→8209833A; N-in→8209701; N-out→8209701 |
| CBB8209873 | breaker | 1 | 20A | Controls / Transformer / Devices | out→8209873A |
| CBB206111 | breaker | 2 |  | CB Control / Contactors / Relays | 1→8212101; 2→8212101A; 21→8212101; 24→8212101A |
| TB6111D | terminal |  |  | CB Control / Contactors / Relays | X1→8212100; X2→8212101 |
| CRB212101 | relay |  |  | CB Control / Contactors / Relays | A1→8212101A; A2→8212139 |
| TDB212503 | relay |  |  | CB Control / Contactors / Relays | T7→8212105A; T8→8212105B; coil→8212503 |
| MB212105 | contactor |  |  | CB Control / Contactors / Relays | A1→8212105B; A2→8212139 |
| MB212110 | contactor |  |  | CB Control / Contactors / Relays | A1→8212110B; A2→8212139 |
| CBB206124 | breaker | 2 |  | CB Control / Contactors / Relays | 1→8212116; 2→8212116A; 21→8212116; 24→8212116A |
| TB6124D | terminal |  |  | CB Control / Contactors / Relays | X1→8212116; X2→8208124 |
| CRB212116 | relay |  |  | CB Control / Contactors / Relays | A1→8212116A; A2→8212139 |
| CR8212606 | relay |  |  | CB Control / Contactors / Relays |  |
| CR8212515 | relay |  |  | CB Control / Contactors / Relays |  |
| MB212120 | contactor |  |  | CB Control / Contactors / Relays | A1→8212120A; A2→8212139 |
| MB212125 | contactor |  |  | CB Control / Contactors / Relays | A1→8212125A; A2→8212139 |
| CRB212407 | relay |  |  | CB Control / Contactors / Relays | A1→8317247A; A2→8308007A |
| CRB212411 | relay |  |  | CB Control / Contactors / Relays | A1→8317250A; A2→8308007A |
| CRB212415 | relay |  |  | CB Control / Contactors / Relays | A1→8317268A; A2→8308007A |
| CRB212419 | relay |  |  | CB Control / Contactors / Relays | A1→8317362A; A2→8308007A |
| CRB212423 | relay |  |  | CB Control / Contactors / Relays | A1→8317365A; A2→8308007A |
| TB130 | terminal |  |  | CB Control / Contactors / Relays | 14→8317247A; 15→8317250A; 16→8317268A; 17→8317362A; 18→8317365A; 8→8308007A |
| TB2D | terminal |  |  | CB Control / Contactors / Relays | 1→8308007A; 2→8317247A; 3→8317250A; 4→8317268A; 5→8317362A; 6→8317365A |
| MB212202 | contactor |  |  | CB Control / Contactors / Relays | A1→8212202A; A2→8212200 |
| MB212206 | contactor |  |  | CB Control / Contactors / Relays | A1→8212206A; A2→8212200 |
| MB212210 | contactor |  |  | CB Control / Contactors / Relays | A1→8212210A; A2→8212200 |
| MB212214 | contactor |  |  | CB Control / Contactors / Relays | A1→8212214A; A2→8212200 |
| MB212218 | contactor |  |  | CB Control / Contactors / Relays | A1→8212218A; A2→8212200 |
| MB212222 | contactor |  |  | CB Control / Contactors / Relays | A1→8212222A; A2→8212200 |
| MB212226 | contactor |  |  | CB Control / Contactors / Relays | A1→8212226A; A2→8212200 |
| MB212230 | contactor |  |  | CB Control / Contactors / Relays | A1→8212230A; A2→8212200 |
| MB212242 | contactor |  |  | CB Control / Contactors / Relays | A1→8212242A; A2→8212240 |
| MB212246 | contactor |  |  | CB Control / Contactors / Relays | A1→8212246A; A2→8212240 |
| MB212250 | contactor |  |  | CB Control / Contactors / Relays | A1→8212250A; A2→8212240 |
| MB212254 | contactor |  |  | CB Control / Contactors / Relays | A1→8212254A; A2→8212240 |
| MB212258 | contactor |  |  | CB Control / Contactors / Relays | A1→8212258A; A2→8212240 |
| MB212262 | contactor |  |  | CB Control / Contactors / Relays | A1→8212262A; A2→8212240 |
| MB212266 | contactor |  |  | CB Control / Contactors / Relays | A1→8212266A; A2→8212240 |
| MB212270 | contactor |  |  | CB Control / Contactors / Relays | A1→8212270A; A2→8212240 |
| MB212274 | contactor |  |  | CB Control / Contactors / Relays | A1→8212274A; A2→8212240 |
| MB212278 | contactor |  |  | CB Control / Contactors / Relays | A1→8212278A; A2→8212240 |
| TDB212503 | relay |  |  | E-Stop / Safety | A1→8212504A; A2→8308007A; S32→8212505; S34→8212210 |
| CRB212515 | relay | 4 |  | E-Stop / Safety | 13→8212120; 23→8212125; 33→8212504; 41→8214412; A1→8212514; A2→8308007A; S11→8300005A; S12→8300005B |
| CRB212527 | relay | 4 |  | E-Stop / Safety | 13→8214414; 14→8214414 |
| CRB212606 | relay | 4 |  | E-Stop / Safety | 13→8212120; 23→8212125; 33→8212564; 41→8214427; A1→8212603A; A2→8308007A; S11→8308006B; S34→8317922A |
| TDB212619 | relay |  |  | E-Stop / Safety | 17→8212625; 18→8212625; A1→8212619 |
| TB130 | terminal |  |  | E-Stop / Safety | 10→8300005A; 11→8300005B; 12→8300007A; 9→8300003A |
| TB20 | terminal |  |  | E-Stop / Safety | 10→8300007A; 6→8300003A; 8→8300005A; 9→8300005B |
| TB8D | terminal |  |  | E-Stop / Safety | 1→8212603A; 10→8317922A; 2→8212619; 3→8308006B |
| TB20D | terminal |  |  | E-Stop / Safety | 93→8317922A |
| TB23D | terminal |  |  | E-Stop / Safety | 4→8212607; 5→8212608; 6→8212609 |
| TB24D | terminal |  |  | E-Stop / Safety | 1→8212609; 2→8212610 |
| TB26D | terminal |  |  | E-Stop / Safety | 1→8212603; 4→8212613; 5→8212614A |
| TB20D | terminal |  |  | Panel to External IO |  |
| TB13D | terminal |  |  | Panel to External IO |  |
| TB3D | terminal |  |  | Panel to External IO |  |
| TB4D | terminal |  |  | Panel to External IO |  |
| TB5D | terminal |  |  | Panel to External IO |  |
| TB6D | terminal |  |  | Panel to External IO |  |
| TB7D | terminal |  |  | Panel to External IO |  |
| TB61180 | terminal |  |  | Panel to External IO |  |
| TB7001D | terminal |  |  | Panel to External IO |  |
| TB7011D | terminal |  |  | Panel to External IO |  |
| TB7021D | terminal |  |  | Panel to External IO |  |
| TB7031D | terminal |  |  | Panel to External IO |  |
| TB7041D | terminal |  |  | Panel to External IO |  |
| TB7051D | terminal |  |  | Panel to External IO |  |
| TB7061D | terminal |  |  | Panel to External IO |  |
| TB8001D | terminal |  |  | Panel to External IO |  |
| TB8011D | terminal |  |  | Panel to External IO |  |
| TB8021D | terminal |  |  | Panel to External IO |  |
| TB8031D | terminal |  |  | Panel to External IO |  |
| TB8041D | terminal |  |  | Panel to External IO |  |
| TB8051D | terminal |  |  | Panel to External IO |  |
| TB8061D | terminal |  |  | Panel to External IO |  |
| TB8071D | terminal |  |  | Panel to External IO |  |
| TB8101D | terminal |  |  | Panel to External IO |  |
| TB8111D | terminal |  |  | Panel to External IO |  |
| TB8121D | terminal |  |  | Panel to External IO |  |
| TB8131D | terminal |  |  | Panel to External IO |  |
| TB8141D | terminal |  |  | Panel to External IO |  |
| TB8151D | terminal |  |  | Panel to External IO |  |
| TB8161D | terminal |  |  | Panel to External IO |  |
| TB9001D | terminal |  |  | Panel to External IO |  |
| TB9021D | terminal |  |  | Panel to External IO |  |
| TB9041D | terminal |  |  | Panel to External IO |  |
| TB9061D | terminal |  |  | Panel to External IO |  |
| CR88212101 | relay |  |  | Panel to External IO | contact_ref→8212101; out→8317004A; upstream→8214000 |
| CB88207001 | breaker | 2 |  | Panel to External IO | mid_monitoring→8214003A; mid_safety→8214004A; out_monitoring→8317007A; upstream_wire→8207001 |
| CB88207011 | breaker | 2 |  | Panel to External IO | mid_monitoring→8214009A; mid_safety→8214010A; out_monitoring→8317010A; upstream_wire→8207011 |
| CB88207021 | breaker | 2 |  | Panel to External IO | mid_monitoring→8214012A; mid_safety→8214013A; out_monitoring→8317013A; upstream_wire→8207021 |
| CB88207031 | breaker | 2 |  | Panel to External IO | mid_monitoring→8214017A; mid_safety→8214018A; out_monitoring→8317016A; upstream_wire→8207031 |
| CB88207041 | breaker | 2 |  | Panel to External IO | mid_monitoring→8214023A; mid_safety→8214024A; out_monitoring→8317019A; upstream_wire→8207041 |
| CB88207051 | breaker | 2 |  | Panel to External IO | mid_monitoring→8214027A; mid_safety→8214029A; out_monitoring→8317022A; upstream_wire→8207051 |
| CB88207061 | breaker | 2 |  | Panel to External IO | mid_monitoring→8214032A; mid_safety→8214033A; out_monitoring→8317025A; upstream_wire→8207061 |
| CB88206118 | breaker |  |  | Panel to External IO | aux_node→TB61180; mid→8214101A; out_monitoring→8317204A; upstream_wire→8206118 |
| CB88207501 | breaker |  |  | Panel to External IO | out_monitoring→8317207A; upstream_wire→8207501 |
| CB88207511 | breaker |  |  | Panel to External IO | out_monitoring→8317210A; upstream_wire→8207511 |
| CB88207521 | breaker |  |  | Panel to External IO | out_monitoring→8317213A; upstream_wire→8207521 |
| CB88207531 | breaker |  |  | Panel to External IO | out_monitoring→8317216A; upstream_wire→8207531 |
| CB88207541 | breaker |  |  | Panel to External IO | out_monitoring→8317219A; upstream_wire→8207541 |
| CB88207551 | breaker |  |  | Panel to External IO | out_monitoring→8317222A; upstream_wire→8207551 |
| CB88207561 | breaker |  |  | Panel to External IO | out_monitoring→8317225A; upstream_wire→8207561 |
| CB88207571 | breaker |  |  | Panel to External IO | out_monitoring→8317304A; upstream_wire→8207571 |
| CB88207601 | breaker |  |  | Panel to External IO | out_monitoring→8317307A; upstream_wire→8207601 |
| CB88207611 | breaker |  |  | Panel to External IO | out_monitoring→8317310A; upstream_wire→8207611 |
| CB88207621 | breaker |  |  | Panel to External IO | out_monitoring→8317313A; upstream_wire→8207621 |
| CB88207631 | breaker |  |  | Panel to External IO | out_monitoring→8317316A; upstream_wire→8207631 |
| CB88207641 | breaker |  |  | Panel to External IO | out_monitoring→8317319A; upstream_wire→8207641 |
| CB88207651 | breaker |  |  | Panel to External IO | out_monitoring→8317322A; upstream_wire→8207651 |
| CB88207661 | breaker |  |  | Panel to External IO | out_monitoring→8317325A; upstream_wire→8207661 |
| CB88207671 | breaker |  |  | Panel to External IO | out_monitoring→8317404A; upstream_wire→8207671 |
| CB88207701 | breaker |  |  | Panel to External IO | out_monitoring→8317407A; upstream_wire→8207701 |
| CB88207711 | breaker |  |  | Panel to External IO | out_monitoring→8317410A; upstream_wire→8207711 |
| CR8312116 | relay |  |  | Panel to External IO | contact_ref_wire→8212116; out_monitoring→8318104A |
| CB88208001 | breaker | 2 |  | Panel to External IO | mid→8214203A; out_monitoring→8318107A; upstream_wire→8208001 |
| CB88208011 | breaker | 2 |  | Panel to External IO | mid→8214205A; out_monitoring→8318110A; upstream_wire→8208011 |
| CB88208021 | breaker | 2 |  | Panel to External IO | mid→8214207A; out_monitoring→8318113A; upstream_wire→8208021 |
| CB88208031 | breaker | 2 |  | Panel to External IO | mid→8214209A; out_monitoring→8318116A; upstream_wire→8208031 |
| CB88208041 | breaker | 2 |  | Panel to External IO | mid→8214211A; out_monitoring→8318119A; upstream_wire→8208041 |
| CB88208051 | breaker | 2 |  | Panel to External IO | mid→8214213A; out_monitoring→8318122A; upstream_wire→8208051 |
| CB88208061 | breaker | 2 |  | Panel to External IO | mid→8214215A; out_monitoring→8318125A; upstream_wire→8208061 |
| CB88208071 | breaker | 2 |  | Panel to External IO | mid→8214217A; out_monitoring→8318204A; upstream_wire→8208071 |
| CB88208101 | breaker | 2 |  | Panel to External IO | mid→8214219A; out_monitoring→8318207A; upstream_wire→8208101 |
| CB88208111 | breaker | 2 |  | Panel to External IO | mid→8214221A; out_monitoring→8318210A; upstream_wire→8208111 |
| CB88208121 | breaker | 2 |  | Panel to External IO | mid→8214223A; out_monitoring→8318213A; upstream_wire→8208121 |
| CB88208131 | breaker | 2 |  | Panel to External IO | mid→8214225A; out_monitoring→8318215A; upstream_wire→8208131 |
| CB88208141 | breaker | 2 |  | Panel to External IO | mid→8214227A; out_monitoring→8318219A; upstream_wire→8208141 |
| CB88208151 | breaker | 2 |  | Panel to External IO | mid→8214229A; out_monitoring→8318222A; upstream_wire→8208151 |
| CB88208161 | breaker | 2 |  | Panel to External IO | mid→8214231A; out_monitoring→8318225A; upstream_wire→8208161 |
| CB88209001 | breaker | 2 |  | Panel to External IO | mid→8214363A; out_monitoring→8317504A; upstream_wire→8209001 |
| CB88209021 | breaker | 2 |  | Panel to External IO | mid→8214304A; out_monitoring→8317507A; upstream_wire→8209021 |
| CB88209041 | breaker | 2 |  | Panel to External IO | mid→8214306A; out_monitoring→8317510A; upstream_wire→8209041 |
| CB88209061 | breaker | 2 |  | Panel to External IO | mid→8214309A; out_monitoring→8317513A; upstream_wire→8209061 |
| M88212105 | contactor |  |  | Panel to External IO | contact_ref_wire→8212105; out_monitoring→8317716A |
| M88212110 | contactor |  |  | Panel to External IO | contact_ref_wire→8212110; out_monitoring→8317716A |
| M88212120 | contactor |  |  | Panel to External IO | contact_ref_wire→8212120; out_monitoring→8317716A |
| M88212125 | contactor |  |  | Panel to External IO | contact_ref_wire→8212125; out_monitoring→8317716A |
| CR88212515 | relay |  |  | Panel to External IO | contact_ref_wire→8212515; out→8313418A |
| CR88212527 | relay |  |  | Panel to External IO | contact_ref_wire→8212527; in_1→8313335C; in_2→8313350 |
| FB8209628 | other |  |  | Panel to External IO | common_out→8317704A; element_A→8214415A; element_B→8214415B |
| CB88209745 | breaker |  |  | Panel to External IO | out_monitoring→8317707A; upstream_wire→8209745 |
| CB88209751 | breaker |  |  | Panel to External IO | out_monitoring→8317710A; upstream_wire→8209751 |
| CB88209763 | breaker |  |  | Panel to External IO | out_monitoring→8317713A; upstream_wire→8209763 |
| CR88212606 | relay |  |  | Panel to External IO | contact_ref_wire→8212606; out→8313504A |
| CB88209803 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8318004A; upstream_wire→8209803 |
| CB88209808 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8318007A; upstream_wire→8209808 |
| CB88209813 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8318010A; upstream_wire→8209813 |
| CB88209818 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8318013A; upstream_wire→8209818 |
| CB88209823 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8318016A; upstream_wire→8209823 |
| CB88209828 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8318019A; upstream_wire→8209828 |
| PM88209620 | other |  |  | Panel to External IO | contact_ref_wire→8209620; out_voltage_over→8317916A; out_voltage_under→8317913A |
| CB88209833 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8318022A; upstream_wire→8209833 |
| CB88209843 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8318025A; upstream_wire→8209843 |
| CB88209848 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8317104A; upstream_wire→8209848 |
| CB88209853 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8317107A; upstream_wire→8209853 |
| CB88209858 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8317110A; upstream_wire→8209858 |
| CB88209863 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8317113A; upstream_wire→8209863 |
| CB88209868 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8317116A; upstream_wire→8209868 |
| CB88209873 | breaker |  |  | Panel to External IO | bus→8308011B; out_monitoring→8317119A; upstream_wire→8209873 |

## Sections

### Main Power Distribution  (82060-82061) — confidence: med
**Function:** Receives 600VAC 3-phase utility power through a 600A fused main disconnect (with current transformers for metering), routes it via 1500 MCM bus bars to a main 3-phase power distribution block, and distributes it across four protected sub-feeder branches — 200A/1/0 AWG for Linear Synchronous Motor drives (with dual E-stop contactors), 100A/3AWG for Conductor Rail supply (with contactor), 300A/350 KCMIL for induction motor drives (with dual E-stop contactors), and 100A/3AWG for 24VDC control power supplies; a separate 120VAC UPS feed through a 6A breaker powers two redundant 24VDC supplies for PLC CP83.

Pages 82060–82061 form the complete main power distribution section of CP82. Page 82060: 600VAC 3-phase field utility enters via DISC8206018B (600A, 500A fuses), passes through current transformers CTB206031 (6 secondary metering leads 8209502–8209507), and exits on 1500 MCM bus bars as wires 8206038/8206039 to page 82061. A separate 120VAC UPS008033 feed arrives at TB1A, passes through DSB206005 and CBB206005 (6A), and powers dual 24VDC supplies PWR8206005A and PWB206005B, whose outputs reach PLC CP83 via TB1D (wires 8300002A, 8300003A, 8300004A). Page 82061: PDB8206110 distributes the 480VAC 3-phase bus to four branches — CBB206111 (200A, LSM, wires 8206111-8206113 series, 1/0 AWG) through MB212105 then MB212110 to bus 8207000; CBB206118 (100A, CR, wires 8206118-8206120, 3AWG) through contactor to bus 8207500; CBB206124 (300A, Induction, wires 8206124-8206126, 350 KCMIL) through MB212120 then MB212125 to bus 8208000; and CBB206131 (100A, Control Voltage, wires 8206131-8206133, 3AWG) directly to bus 8209000 plus 14AWG sub-circuits to 8209514-8209516. Panel FLA rating 276.5A; NEC minimum feed 345.6A.

<details><summary>25 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| FIELD_INSTALL_600VAC_3PH | DISC8206018B/L1-L3 | hot | incoming utility (600VAC 3-phase, wi |
| DISC8206018B/T1-T3 | CTB206031/primary + 1500MCM_BUS | hot | 8206021A, 8206021B, 8206021C (1500 M |
| DISC8206018B | GNDB206017 | ret | equipment ground |
| CTB206031/secondary | metering/instrumentation circuits | ctrl | 8209502, 8209503, 8209504, 8209505,  |
| 1500MCM_BUS (page 82060) | PDB8206110 (page 82061) | hot | 8206038, 8206039 (and third phase, 3 |
| UPS008033 | TB1A/L1,N,GND | hot | 8209877→8206119A (L1), 8209877→82061 |
| TB1A/L1 | DSB206005/L | hot | 8206119A |
| DSB206005/T | CBB206005/L | hot | 8206005A |
| CBB206005/T | PWR8206005A/AC_L and PWB206005B/AC_L | hot | 8206005B |
| PWR8206005A/+V0 | TB1D:1 | dc | 8300002A |
| PWR8206005A/-V0 | TB1D:2 | dc | 8300003A |
| PWB206005B/+V0 | TB1D:3 | dc | 8300004A |
| PDB8206110 | CBB206111/L1-L3 | hot | 8206111A_1/0_AWG, 8206112A_1/0_AWG,  |
| CBB206111/T1-T3 | MB212105/1L1-1L3 | hot | 8206111A_1/0_AWG, 8206112A_1/0_AWG,  |
| MB212105/2T1-2T3 | MB212110/1L1-1L3 | hot | 8206111B_1/0_AWG, 8206112B_1/0_AWG,  |
| MB212110/2T1-2T3 | BUS_8207000 (LSM supply) | hot | 8206111C_1/0_AWG, 8206112C_1/0_AWG,  |
| PDB8206110 | CBB206118/L1-L3 | hot | 8206118A_3AWG, 8206119A_3AWG, 820612 |
| CBB206118/T1-T3 | BUS_8207500 (CR supply, via contactor) | hot | 8206118A, 8206119A, 8206120A (post-c |
| PDB8206110 | CBB206124/L1-L3 | hot | 8206124A_350_KCML, 8206125A_350_KCML |
| CBB206124/T1-T3 | MB212120/1L1-1L3 | hot | 8206124A_350_KCML, 8206125A_350_KCML |
| MB212120/2T1-2T3 | MB212125/1L1-1L3 | hot | 8206124B_350_KCML, 8206125B_350_KCML |
| MB212125/2T1-2T3 | BUS_8208000 (induction motor supply) | hot | 8206124C_350_KCML, 8206125C_350_KCML |
| PDB8206110 | CBB206131/L1-L3 | hot | 8206131A, 8206132A, 8206133A (3AWG) |
| CBB206131/T1-T3 | BUS_8209000 (control voltage supply) | hot | 8206131A, 8206132A, 8206133A (load s |
| CBB206131 sub-branch | 8209514, 8209515, 8209516 | ctrl | 8206137, 8206138, 8206139 (14AWG) |

</details>

### LSM + Conductor Rail Power  (82070-82077) — confidence: med
**Function:** Distributes 3-phase AC power through individual branch circuit breakers—and, on conductor rail branches, through inline 3-phase protective/filtering devices—to DCP-series power supplies that energize linear synchronous motor segments and overhead conductor rail segments for the conveyor/sortation system in panel CP82.

Four schematic pages (82070, 82075, 82076, 82077) of panel CP82 distribute protected 3-phase AC power from two enclosed distribution blocks (PDB8207001 for LSM, PDB8207501 for conductor rail) to 7 Linear Synchronous Motor drive power supplies (DCP-LSM-01 through -07, 20 A branch breakers) and 18 Conductor Rail drive power supplies (DCP-CR-01 through -18, 15 A branch breakers with 3-phase inline protective/filtering devices M8212202–M8212278 interposed before the terminal blocks). All DCP units are grounded via #10AWG GRN. Breaker auxiliary contacts are cross-referenced to control wiring on other pages via 8214XXX-series wires. DCP-CR-17 and DCP-CR-18 (page 82077) are Revision 1 additions, shown highlighted on the schematic.

<details><summary>194 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| PDB8207001:L1-in | CBB8207001:L1 | hot | 8206111 |
| PDB8207001:L2-in | CBB8207001:L2 | hot | 8206112 |
| PDB8207001:L3-in | CBB8207001:L3 | hot | 8206113 |
| CBB8207001:T1 | TB7001A:1 | hot | 8207001A |
| CBB8207001:T2 | TB7001A:2 | hot | 8207002A |
| CBB8207001:T3 | TB7001A:3 | hot | 8207003A |
| TB7001A | DCP-LSM-01 | hot | 8207001A |
| DCP-LSM-01:GND | GND | gnd | GND |
| CBB8207001:aux+b | xref-ctrl | ctrl | 8214000 |
| CBB8207001:aux-b | xref-ctrl | ctrl | 8214001 |
| CBB8207011:T1 | TB7011A:1 | hot | 8207011A |
| CBB8207011:T2 | TB7011A:2 | hot | 8207012A |
| CBB8207011:T3 | TB7011A:3 | hot | 8207013A |
| TB7011A | DCP-LSM-02 | hot | 8207011A |
| CBB8207011:aux+b | xref-ctrl | ctrl | 8214007 |
| CBB8207011:aux-b | xref-ctrl | ctrl | 8214009 |
| CBB8207021:T1 | TB7021A:1 | hot | 8207021A |
| CBB8207021:T2 | TB7021A:2 | hot | 8207022A |
| CBB8207021:T3 | TB7021A:3 | hot | 8207023A |
| TB7021A | DCP-LSM-03 | hot | 8207021A |
| CBB8207021:aux+b | xref-ctrl | ctrl | 8214011 |
| CBB8207021:aux-b | xref-ctrl | ctrl | 8214013 |
| CBB8207031:T1 | TB7031A:1 | hot | 8207031A |
| CBB8207031:T2 | TB7031A:2 | hot | 8207032A |
| CBB8207031:T3 | TB7031A:3 | hot | 8207033A |
| TB7031A | DCP-LSM-04 | hot | 8207031A |
| CBB8207031:aux+b | xref-ctrl | ctrl | 8214016 |
| CBB8207031:aux-b | xref-ctrl | ctrl | 8214018 |
| CBB8207041:T1 | TB7041A:1 | hot | 8207041A |
| CBB8207041:T2 | TB7041A:2 | hot | 8207042A |
| CBB8207041:T3 | TB7041A:3 | hot | 8207043A |
| TB7041A | DCP-LSM-05 | hot | 8207041A |
| CBB8207041:aux+b | xref-ctrl | ctrl | 8214021 |
| CBB8207041:aux-b | xref-ctrl | ctrl | 8214023 |
| CBB8207051:T1 | TB7051A:1 | hot | 8207051A |
| CBB8207051:T2 | TB7051A:2 | hot | 8207052A |
| CBB8207051:T3 | TB7051A:3 | hot | 8207053A |
| TB7051A | DCP-LSM-06 | hot | 8207051A |
| CBB8207051:aux+b | xref-ctrl | ctrl | 8214026 |
| CBB8207051:aux-b | xref-ctrl | ctrl | 8214028 |
| CBB8207061:T1 | TB7061A:1 | hot | 8207061A |
| CBB8207061:T2 | TB7061A:2 | hot | 8207062A |
| CBB8207061:T3 | TB7061A:3 | hot | 8207063A |
| TB7061A | DCP-LSM-07 | hot | 8207061A |
| CBB8207061:aux+b | xref-ctrl | ctrl | 8214031 |
| CBB8207061:aux-b | xref-ctrl | ctrl | 8214033 |
| PDB8207501:L1-in | CBB8207501:L1 | hot | 8206118 |
| PDB8207501:L2-in | CBB8207501:L2 | hot | 8206119 |
| PDB8207501:L3-in | CBB8207501:L3 | hot | 8206120 |
| CBB8207501:T1 | M8212202:L1 | hot | 8207501A |
| CBB8207501:T2 | M8212202:L2 | hot | 8207502A |
| CBB8207501:T3 | M8212202:L3 | hot | 8207503A |
| M8212202:T1 | TB7501A:1 | hot | 8207501B |
| M8212202:T2 | TB7501A:2 | hot | 8207502B |
| M8212202:T3 | TB7501A:3 | hot | 8207503B |
| TB7501A | DCP-CR-01 | hot | 8207501B |
| DCP-CR-01:GND | GND | gnd | GND |
| CBB8207501:aux+ | xref-ctrl | ctrl | 8214102 |
| CBB8207511:T1 | M8212206:L1 | hot | 8207511A |
| CBB8207511:T2 | M8212206:L2 | hot | 8207512A |
| CBB8207511:T3 | M8212206:L3 | hot | 8207513A |
| M8212206:T1 | TB7511A:1 | hot | 8207511B |
| M8212206:T2 | TB7511A:2 | hot | 8207512B |
| M8212206:T3 | TB7511A:3 | hot | 8207513B |
| TB7511A | DCP-CR-02 | hot | 8207511B |
| CBB8207511:aux+ | xref-ctrl | ctrl | 8214104 |
| CBB8207521:T1 | M8212210:L1 | hot | 8207521A |
| CBB8207521:T2 | M8212210:L2 | hot | 8207522A |
| CBB8207521:T3 | M8212210:L3 | hot | 8207523A |
| M8212210:T1 | TB7521A:1 | hot | 8207521B |
| M8212210:T2 | TB7521A:2 | hot | 8207522B |
| M8212210:T3 | TB7521A:3 | hot | 8207523B |
| TB7521A | DCP-CR-03 | hot | 8207521B |
| CBB8207521:aux+ | xref-ctrl | ctrl | 8214106 |
| CBB8207531:T1 | M8212214:L1 | hot | 8207531A |
| CBB8207531:T2 | M8212214:L2 | hot | 8207532A |
| CBB8207531:T3 | M8212214:L3 | hot | 8207533A |
| M8212214:T1 | TB7531A:1 | hot | 8207531B |
| M8212214:T2 | TB7531A:2 | hot | 8207532B |
| M8212214:T3 | TB7531A:3 | hot | 8207533B |
| TB7531A | DCP-CR-04 | hot | 8207531B |
| CBB8207531:aux+ | xref-ctrl | ctrl | 8214108 |
| CBB8207541:T1 | M8212218:L1 | hot | 8207541A |
| CBB8207541:T2 | M8212218:L2 | hot | 8207542A |
| CBB8207541:T3 | M8212218:L3 | hot | 8207543A |
| M8212218:T1 | TB7541A:1 | hot | 8207541B |
| M8212218:T2 | TB7541A:2 | hot | 8207542B |
| M8212218:T3 | TB7541A:3 | hot | 8207543B |
| TB7541A | DCP-CR-05 | hot | 8207541B |
| CBB8207541:aux+ | xref-ctrl | ctrl | 8214110 |
| CBB8207551:T1 | M8212222:L1 | hot | 8207551A |
| CBB8207551:T2 | M8212222:L2 | hot | 8207552A |
| CBB8207551:T3 | M8212222:L3 | hot | 8207553A |
| M8212222:T1 | TB7551A:1 | hot | 8207551B |
| M8212222:T2 | TB7551A:2 | hot | 8207552B |
| M8212222:T3 | TB7551A:3 | hot | 8207553B |
| TB7551A | DCP-CR-06 | hot | 8207551B |
| CBB8207551:aux+ | xref-ctrl | ctrl | 8214112 |
| CBB8207561:T1 | M8212226:L1 | hot | 8207561A |
| CBB8207561:T2 | M8212226:L2 | hot | 8207562A |
| CBB8207561:T3 | M8212226:L3 | hot | 8207563A |
| M8212226:T1 | TB7561A:1 | hot | 8207561B |
| M8212226:T2 | TB7561A:2 | hot | 8207562B |
| M8212226:T3 | TB7561A:3 | hot | 8207563B |
| TB7561A | DCP-CR-07 | hot | 8207561B |
| CBB8207561:aux+ | xref-ctrl | ctrl | 8214114 |
| CBB8207571:T1 | M8212230:L1 | hot | 8207571A |
| CBB8207571:T2 | M8212230:L2 | hot | 8207572A |
| CBB8207571:T3 | M8212230:L3 | hot | 8207573A |
| M8212230:T1 | TB7571A:1 | hot | 8207571B |
| M8212230:T2 | TB7571A:2 | hot | 8207572B |
| M8212230:T3 | TB7571A:3 | hot | 8207573B |
| TB7571A | DCP-CR-08 | hot | 8207571B |
| CBB8207571:aux+ | xref-ctrl | ctrl | 8214116 |
| CBB8207601:T1 | M8212242:L1 | hot | 8207601A |
| CBB8207601:T2 | M8212242:L2 | hot | 8207602A |
| CBB8207601:T3 | M8212242:L3 | hot | 8207603A |
| M8212242:T1 | TB7601A:1 | hot | 8207601B |
| M8212242:T2 | TB7601A:2 | hot | 8207602B |
| M8212242:T3 | TB7601A:3 | hot | 8207603B |

</details>

### Induction Power  (82080-82081) — confidence: med
**Function:** Distributes three-phase AC power from a central enclosed distribution block through fifteen individual 30 A, 3-pole circuit breakers and terminal blocks to fifteen induction conveyor power supplies.

Pages 82080–82081 document the three-phase AC power distribution to fifteen induction conveyor power supplies. Page 82080 (original issue) shows circuits for INDUCTION #1–#8: an enclosed power distribution block PDB8208001 receives three-phase utility bus (conductors 8206124/8206125/8206135) and distributes through the 8208xxx bus to four 3-pole 30 A circuit breakers on the left column (CBB8208001–CBB8208031, feeding #1–#4) and four on the right column (CBB8208041–CBB8208071, feeding #5–#8); each breaker drives a three-pole terminal block (TBB8001A–TBB8071A) with #10AWG BLK conductors for #1–#5 and #6AWG BLK for #6–#8, plus a matching green equipment-ground wire at each TBB. Page 82081 (Revision 1, shown in green/blue markup) adds circuits #9–#15 using the same 30A 3-pole pattern: four breakers on the left column (CBB8208101–CBB8208131, bus annotated 8206125C) feeding TBBs #9–#12, and three on the right column (CBB8208141–CBB8208161, bus annotated 8206124C/8206126C) feeding TBBs #13–#15; wire sizes repeat the same #10AWG/#6AWG break. Cross-reference ↔ page numbers confirm each Rev-1 circuit is paired with its original-issue counterpart (e.g., #1 and #9 both reference detail page 8214202), meaning seven original circuits each have one added parallel circuit, and circuit #8 (↔8214216) has no Rev-1 companion.

<details><summary>57 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| PDB8208001/L1 | CBB8208001/L1 | 3ph-L1 | 8208001 |
| PDB8208001/L2 | CBB8208001/L2 | 3ph-L2 | 8208002 |
| PDB8208001/L3 | CBB8208001/L3 | 3ph-L3 | 8208003 |
| CBB8208001/T1 | TBB8001A/1 | hot | 8208001A |
| CBB8208001/T2 | TBB8001A/2 | hot | 8208002A |
| CBB8208001/T3 | TBB8001A/3 | hot | 8208003A |
| PDB8208001/L1 | CBB8208011/L1 | 3ph-L1 | 8208011 |
| PDB8208001/L2 | CBB8208011/L2 | 3ph-L2 | 8208012 |
| PDB8208001/L3 | CBB8208011/L3 | 3ph-L3 | 8208013 |
| CBB8208011/T1 | TBB8011A/1 | hot | 8208011A |
| CBB8208011/T2 | TBB8011A/2 | hot | 8208012A |
| CBB8208011/T3 | TBB8011A/3 | hot | 8208013A |
| PDB8208001/L1 | CBB8208021/L1 | 3ph-L1 | 8208021 |
| PDB8208001/L2 | CBB8208021/L2 | 3ph-L2 | 8208022 |
| PDB8208001/L3 | CBB8208021/L3 | 3ph-L3 | 8208023 |
| CBB8208021/T1 | TBB8021A/1 | hot | 8208021A |
| CBB8208021/T2 | TBB8021A/2 | hot | 8208022A |
| CBB8208021/T3 | TBB8021A/3 | hot | 8208023A |
| PDB8208001/L1 | CBB8208031/L1 | 3ph-L1 | 8208031 |
| PDB8208001/L2 | CBB8208031/L2 | 3ph-L2 | 8208032 |
| PDB8208001/L3 | CBB8208031/L3 | 3ph-L3 | 8208033 |
| CBB8208031/T1 | TBB8031A/1 | hot | 8208031A |
| CBB8208031/T2 | TBB8031A/2 | hot | 8208032A |
| CBB8208031/T3 | TBB8031A/3 | hot | 8208033A |
| CBB8208041/T1 | TBB8041A/1 | hot | 8208041A |
| CBB8208041/T2 | TBB8041A/2 | hot | 8208042A |
| CBB8208041/T3 | TBB8041A/3 | hot | 8208043A |
| CBB8208051/T1 | TBB8051A/1 | hot | 8208051A |
| CBB8208051/T2 | TBB8051A/2 | hot | 8208052A |
| CBB8208051/T3 | TBB8051A/3 | hot | 8208053A |
| CBB8208061/T1 | TBB8061A/1 | hot | 8208061A |
| CBB8208061/T2 | TBB8061A/2 | hot | 8208062A |
| CBB8208061/T3 | TBB8061A/3 | hot | 8208063A |
| CBB8208071/T1 | TBB8071A/1 | hot | 8208071A |
| CBB8208071/T2 | TBB8071A/2 | hot | 8208072A |
| CBB8208071/T3 | TBB8071A/3 | hot | 8208073A |
| CBB8208101/T1 | TBB101A/1 | hot | 8208101A |
| CBB8208101/T2 | TBB101A/2 | hot | 8208102A |
| CBB8208101/T3 | TBB101A/3 | hot | 8208103A |
| CBB8208111/T1 | TBB111A/1 | hot | 8208111A |
| CBB8208111/T2 | TBB111A/2 | hot | 8208112A |
| CBB8208111/T3 | TBB111A/3 | hot | 8208113A |
| CBB8208121/T1 | TBB121A/1 | hot | 8208121A |
| CBB8208121/T2 | TBB121A/2 | hot | 8208122A |
| CBB8208121/T3 | TBB121A/3 | hot | 8208123A |
| CBB8208131/T1 | TBB131A/1 | hot | 8208131A |
| CBB8208131/T2 | TBB131A/2 | hot | 8208132A |
| CBB8208131/T3 | TBB131A/3 | hot | 8208133A |
| CBB8208141/T1 | TBB141A/1 | hot | 8208141A |
| CBB8208141/T2 | TBB141A/2 | hot | 8208142A |
| CBB8208141/T3 | TBB141A/3 | hot | 8208143A |
| CBB8208151/T1 | TBB151A/1 | hot | 8208151A |
| CBB8208151/T2 | TBB151A/2 | hot | 8208152A |
| CBB8208151/T3 | TBB151A/3 | hot | 8208153A |
| CBB8208161/T1 | TBB161A/1 | hot | 8208161A |
| CBB8208161/T2 | TBB161A/2 | hot | 8208162A |
| CBB8208161/T3 | TBB161A/3 | hot | 8208163A |

</details>

### Controls / Transformer / Devices  (82090-82098) — confidence: med
**Function:** Distributes 480 V 3-phase utility power through a step-down transformer to 208/120 VAC and 24 VDC busses, providing individually protected circuits for DCP chute/sorter 24 VDC supplies, PLC rack power, panel lighting and receptacles, scanner/vision-system 120 VAC loads, and a UPS, while monitoring power quality via current and voltage sensors on the 480 V main feed.

Five drawing pages cover the complete AC and DC power distribution hierarchy of panel CP82: (82090) 3-phase 20 A circuit breakers off an enclosed distribution block feed four 24 VDC power-supply terminal circuits for chute/sorter DCP panels; (82095) a power-monitor accessory kit with current sensors and a voltage-sense transformer monitors the 480 V main bus; (82096) a 40 A breaker supplies a 15 kVA 480–208Y step-down transformer whose 50 A secondary breaker feeds two 3-phase power distribution blocks that in turn distribute 208/120 VAC; (82097) two 24 VDC PLC power supplies (AB 1606-XLP95E), two panel-lighting circuits (4 lights each on switch/ballast), an internal 120 VAC panel-supply breaker, and a 120 VAC receptacle breaker; (82098) fourteen 20 A single-pole breakers through a terminal block provide individually protected 120 VAC to scanners, DCP vision/DDC/SPS systems, and a UPS.

<details><summary>65 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| PDB8209001/L1 | CBB8209001/L1 | hot | 8209000 |
| PDB8209001/L2 | CBB8209001/L2 | hot | 8209000 |
| PDB8209001/L3 | CBB8209001/L3 | hot | 8209000 |
| CBB8209001/T1 | TB9001A/1 | hot | 8209001A |
| CBB8209001/T2 | TB9001A/2 | hot | 8209002A |
| CBB8209001/T3 | TB9001A/3 | hot | 8209003A |
| PDB8209001/L1 | CBB8209021/L1 | hot | 8209000 |
| CBB8209021/T1 | TB9021A/1 | hot | 8209021A |
| CBB8209021/T2 | TB9021A/2 | hot | 8209022A |
| CBB8209021/T3 | TB9021A/3 | hot | 8209023A |
| PDB8209001/L1 | CBB8209041/L1 | hot | 8209000 |
| CBB8209041/T1 | TB9041A/1 | hot | 8209041A |
| CBB8209041/T2 | TB9041A/2 | hot | 8209042A |
| CBB8209041/T3 | TB9041A/3 | hot | 8209043A |
| PDB8209001/L1 | CBB8209061/L1 | hot | 8209000 |
| CBB8209061/T1 | TB9061A/1 | hot | 8209061A |
| CBB8209061/T2 | TB9061A/2 | hot | 8209062A |
| CBB8209061/T3 | TB9061A/3 | hot | 8209063A |
| CBB8209601/T1 | T8209606/H1 | hot | 8209601A |
| CBB8209601/T2 | T8209606/H2 | hot | 8209602A |
| CBB8209601/T3 | T8209606/H3 | hot | 8209603A |
| T8209606/X0 | PDBB8209615/N-in | ret | 8209608A |
| T8209606/X1 | CBB8209611/L1 | hot | 8209608B |
| T8209606/X2 | CBB8209611/L2 | hot | 8209608C |
| T8209606/X3 | CBB8209611/L3 | hot | 8209608D |
| CBB8209611/T1 | PDBB8209611/L1 | hot | 8209611A |
| CBB8209611/T2 | PDBB8209611/L2 | hot | 8209612A |
| CBB8209611/T3 | PDBB8209611/L3 | hot | 8209613A |
| PDBB8209611/out-1 | CBB8209808/in | hot | 8209616A |
| PDBB8209611/out-2 | CBB8209813/in | hot | 8209617A |
| PDBB8209611/out-3 | CBB8209818/in | hot | 8209618A |
| PDBB8209611/out-4 | CBB8209823/in | hot | 8209619A |
| PDBB8209611/out-5 | CBB8209828/in | hot | 8209620A |
| PDBB8209611/out-6 | CBB8209833/in | hot | 8209621A |
| PDBB8209611/out-7 | CBB8209803/in | hot | 8209622A |
| PDBB8209615/out | load-returns | ret | 8209701 |
| CBB8209705/out | PWB8209705/L-in | hot | 8209705A |
| PWB8209705/DC+ | TB1D/+ | dc | 8308006A |
| PWB8209705/DC- | TB1D/- | dc | 8308007A |
| CBB8209720/out | PWB8209720/L-in | hot | 8209720A |
| PWB8209720/DC+ | TB2D/+ | dc | 8308011A |
| PWB8209720/DC- | TB2D/- | dc | 8308012A |
| CBB8209745/out | TB2A/1 | hot | 8212100 |
| CBB8209751/out | LSB8209751/in | hot | 8209751B |
| LSB8209751/out | LTB8209751/L | hot | 8209755A |
| LSB8209753/out | LTB8209753/L | hot | 8209755A |
| LSB8209756/out | LTB8209756/L | hot | 8209756B |
| LSB8209759/out | LTB8209759/L | hot | 8209759B |
| CBB8209763/out | RECP8209763/L | hot | 8209763B |
| RECP8209763/L-out | RECPT8209769/L | hot | 8209763B |
| CBB8209803/out | TB3A/1 | hot | 8209803A |
| CBB8209808/out | TB3A/5 | hot | 8209808A |
| CBB8209813/out | TB3A/6 | hot | 8209813A |
| CBB8209818/out | TB3A/7 | hot | 8209818A |
| CBB8209823/out | TB3A/9 | hot | 8209823A |
| CBB8209828/out | TB3A/11 | hot | 8209828A |
| CBB8209833/out | TB3A/13 | hot | 8209833A |
| CBB8209843/out | TB3A/15 | hot | 8209843A |
| CBB8209848/out | TB3A/17 | hot | 8209848A |
| CBB8209853/out | TB3A/19 | hot | 8209853A |
| CBB8209858/out | TB3A/21 | hot | 8209858A |
| CBB8209863/out | TB3A/23 | hot | 8209863A |
| CBB8209866B/out | UPS8209833/L-in | hot | 8209866B |
| UPS8209833/L-out | TB3A/25 | hot | 8209833A |
| CBB8209873/out | TB3A/27 | hot | 8209873A |

</details>

### CB Control / Contactors / Relays  (82121-82124) — confidence: med
**Function:** CB auxiliary-contact monitor relays (CRB212101/CRB212116) interlock LSM and production E-stop main contactors (MB212105/110/120/125) with series permissive contacts; five PLC CP83 digital-output relays (CRB212407/411/415/419/423), energized through TB130→TB2D diode terminals, switch 18 conductor-rail DCP carrier-supply contactors (MB212202–MB212278) in zone groups of four.

Page 82121: AC control rungs on L_INT/N_INT buses. CBB206111 (main low CB) aux contact energizes CRB212101; its N.O. contacts—one through timer relay TDB212503—enable LSM contactors MB212105 and MB212110. CBB206124 (main isolation CB) aux contact energizes CRB212116; its N.O. contact in series with CR8212606 and CR8212515 permits production E-stop contactors MB212120 and MB212125. Wire 8212132 ties to power monitor via 8209745A/8209606A. Pages 82122–82124: PLC CP83 (panel TB130, pins 14–18) outputs DC signals through TB2D diode terminal block to coils of five zone relays (CRB212407/411/415/419/423). Each zone relay closes four N.O. contacts (two for CRB212423) that energize carrier-supply contactors MB212202–MB212278 (DCP-CR-01 through DCP-CR-18) on the AC L_INT bus; coil A2 returns to N_INT. All 18 carrier-supply contactors are annotated CONDUCTOR RAIL CARRIER SUPPLY DCP-CR-xx with three load-side cross-references each (8207501-series). Load-side wire numbers for MB212274 and MB212278 are partially illegible at this scan resolution.

<details><summary>53 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| 8212100 | TB6111D.X1 | hot | 8212100 |
| TB6111D.X2 | CBB206111.1 | hot | 8212101 |
| CBB206111.2 | CRB212101.A1 | ctrl | 8212101A |
| CRB212101.A2 | 8212139 | ret | 8212139 |
| CRB212101.contact-NO-1 | TDB212503.T7 | ctrl | 8212105A |
| TDB212503.T8 | MB212105.A1 | ctrl | 8212105B |
| MB212105.A2 | 8212139 | ret | 8212139 |
| CRB212101.contact-NO-2 | MB212110.A1 | ctrl | 8212110B |
| MB212110.A2 | 8212139 | ret | 8212139 |
| 8212116 | TB6124D.X1 | hot | 8212116 |
| CBB206124.2 | CRB212116.A1 | ctrl | 8212116A |
| CRB212116.A2 | 8212139 | ret | 8212139 |
| CRB212116.contact-NO | CR8212606.contact-NO | ctrl | 8212120 |
| CR8212606.contact-NO | CR8212515.contact-NO | ctrl | 8212120C |
| CR8212515.contact-NO | MB212120.A1 | ctrl | 8212120A |
| MB212120.A2 | 8212139 | ret | 8212139 |
| CRB212116.contact-NO-2 | CR8212606.contact-NO-2 | ctrl | 8212125 |
| CR8212515.contact-NO-2 | MB212125.A1 | ctrl | 8212125A |
| MB212125.A2 | 8212139 | ret | 8212139 |
| 8212132 | 8209745A | ctrl | 8209745A |
| 8212132 | 8209606A | ctrl | 8209606A |
| TB130.8 | TB2D.1 | dc | 8308007A |
| TB2D.1 | CRB212407.A2 | dc | 8308007A |
| TB130.14 | TB2D.2 | dc | 8317247A |
| TB2D.2 | CRB212407.A1 | dc | 8317247A |
| TB130.15 | TB2D.3 | dc | 8317250A |
| TB2D.3 | CRB212411.A1 | dc | 8317250A |
| TB130.16 | TB2D.4 | dc | 8317268A |
| TB2D.4 | CRB212415.A1 | dc | 8317268A |
| TB130.17 | TB2D.5 | dc | 8317362A |
| TB2D.5 | CRB212419.A1 | dc | 8317362A |
| TB130.18 | TB2D.6 | dc | 8317365A |
| TB2D.6 | CRB212423.A1 | dc | 8317365A |
| CRB212407.contact-1 | MB212202.A1 | ctrl | 8212202A |
| CRB212407.contact-2 | MB212206.A1 | ctrl | 8212206A |
| CRB212407.contact-3 | MB212210.A1 | ctrl | 8212210A |
| CRB212407.contact-4 | MB212214.A1 | ctrl | 8212214A |
| CRB212411.contact-1 | MB212218.A1 | ctrl | 8212218A |
| CRB212411.contact-2 | MB212222.A1 | ctrl | 8212222A |
| CRB212411.contact-3 | MB212226.A1 | ctrl | 8212226A |
| CRB212411.contact-4 | MB212230.A1 | ctrl | 8212230A |
| CRB212415.contact-1 | MB212242.A1 | ctrl | 8212242A |
| CRB212415.contact-2 | MB212246.A1 | ctrl | 8212246A |
| CRB212415.contact-3 | MB212250.A1 | ctrl | 8212250A |
| CRB212415.contact-4 | MB212254.A1 | ctrl | 8212254A |
| CRB212419.contact-1 | MB212258.A1 | ctrl | 8212258A |
| CRB212419.contact-2 | MB212262.A1 | ctrl | 8212262A |
| CRB212419.contact-3 | MB212266.A1 | ctrl | 8212266A |
| CRB212419.contact-4 | MB212270.A1 | ctrl | 8212270A |
| CRB212423.contact-1 | MB212274.A1 | ctrl | 8212274A |
| CRB212423.contact-2 | MB212278.A1 | ctrl | 8212278A |
| MB212202.A2 | 8212200 | ret | 8212200 |
| MB212242.A2 | 8212240 | ret | 8212240 |

</details>

### E-Stop / Safety  (82125-82126) — confidence: med
**Function:** Implements dual-channel monitored emergency-stop and safety-gate protection for CP82: TDB212503 (delay-on-de-energization timer, time set to match sorter coast) feeds CRB212515 (E-stop master safety relay), and TDB212619 (5 s delay timer) feeds CRB212606 (safety gate relay), with both safety relays producing forced-guided NO output contacts that gate conveyor drive power and PLC control signals throughout the panel.

Page 82125 (E-Stop Master): TDB212503 delay timer coil is energized through a series chain of CRB212606 and CRB212515 feedback/reset contacts (wire 8300003A, TB130-9/TB20-6) and drops out with a sorter-matched delay; its timed output contact (wires 8212505/8212210) energizes dual-channel safety relay CRB212515. CRB212515 takes field dual-channel E-stop loop wires (8300005A/8300005B CH1, 8300007A CH2) via TB130/TB20, and its four forced-guided NO output contacts distribute the E-stop enable signal (cross-refs: 8212120, 8212125, 8212504, 8214412); extension relay CRB212527 adds further output contacts (8214414). The Y32/S34 enable output (8317722A) cross-references to 8214410. Page 82126 (Safety Gate): TDB212619 (5 s fixed delay) is fed via TB8D-2/TB130-18 (wire 8212619); its output drives CRB212606 A1 through TB8D-1 (wire 8212603A). CRB212606 receives dual-channel field gate safety device inputs via TB8D/TB23D/TB24D/TB26D; its NO output contacts cross-reference wires 8212120, 8212125, 8212564, 8214427; its S34/Y32 output (8317922A) also carries the safety gate actuator feedback monitored at TB8D-10/TB20D-93. Gate unlock is provided via a dashed-boundary circuit through TB26D-1.

<details><summary>27 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| TB130-9 | TB20-6 | ctrl | 8300003A |
| TB130-10 | TB20-8 | ctrl | 8300005A |
| TB130-11 | TB20-9 | ctrl | 8300005B |
| TB130-12 | TB20-10 | ctrl | 8300007A |
| TB20-8 | CRB212515.S11 | ctrl | 8300005A |
| TB20-9 | CRB212515.S12 | ctrl | 8300005B |
| TB20-10 | CRB212515.S21 | ctrl | 8300007A |
| TDB212503.S34 | CRB212515.A1 | ctrl | 8212514 |
| CRB212515.S34 | cross-ref-8214410 | ctrl | 8317722A |
| CRB212515.13 | cross-ref | ctrl | 8212120 |
| CRB212515.23 | cross-ref | ctrl | 8212125 |
| CRB212515.33 | cross-ref | ctrl | 8212504 |
| CRB212515.41 | cross-ref | ctrl | 8214412 |
| CRB212527.13 | cross-ref | ctrl | 8214414 |
| TB130-18 | TB8D-2 | ctrl | 8212619 |
| TB8D-2 | TDB212619.A1 | ctrl | 8212619 |
| TDB212619.output | TB8D-1 | ctrl | 8212603A |
| TB8D-1 | CRB212606.A1 | ctrl | 8212603A |
| TB8D-3 | CRB212606.S11 | ctrl | 8308006B |
| CRB212606.S34 | TB8D-10 | ctrl | 8317922A |
| TB8D-10 | TB20D-93 | ctrl | 8317922A |
| CRB212606.13 | cross-ref | ctrl | 8212120 |
| CRB212606.23 | cross-ref | ctrl | 8212125 |
| CRB212606.33 | cross-ref | ctrl | 8212564 |
| CRB212606.41 | cross-ref | ctrl | 8214427 |
| TDB212619.17 | TDB212619.18 | ctrl | 8212625 |
| TB26D-1 | TB8D-2 | ctrl | 8212619 |

</details>

### Panel to External IO  (82140-82144) — confidence: med
**Function:** Routes 24VDC supervision signals from approximately 65 circuit-breaker auxiliary contacts, relay contacts, contactor auxiliary contacts, and a power monitor in panel CP82 through panel terminal blocks (TB3D–TB7D) to external field terminal blocks and PLC digital-input wires (8317xxxx/8318xxxx series), providing power-present and trip-status feedback to the PLC for DCP-LSM motors (#1–7), conductor rails (DCP-CR-01 through -18), induction stations (#1–15), 24VDC chute/sorter supplies, E-stop contactors and safety gates, panel utility supplies, and vision-system (scanner, DDC, SPS) 120VAC branch circuits.

Five-page section (drawing pages 82140–82144) of panel CP82 contains exclusively supervision/monitoring rungs with no power-load wiring. Each rung follows an identical pattern: 24VDC from bus wire 8308011B (continuous across all five pages, originating from TB13D/PLC-panel supply) energizes a circuit-breaker auxiliary contact or relay contact; the contact output routes through a panel-side terminal block (TB3D, TB4D, TB5D, TB6D, or TB7D) to either an external field terminal block (TB7001D–TB9061D) or directly to a PLC supervision wire (8317xxxx/8318xxxx). Page 82140 covers 1 LSM main relay (CR88212101 cross-ref from PLC Panel CP83) and 7 LSM breakers (CB88207001–CB88207061, each with dual monitoring+safety contact rows, feeding TB7001D–TB7061D). Page 82141 covers 1 conductor-rail main breaker (CB88206118 with auxiliary node TB61180) and 18 conductor-rail breakers (CB88207501–CB88207711, feeding TB4D). Page 82142 covers 1 induction main relay (CR8312116) and 15 induction breakers (CB88208001–CB88208161, feeding TB8001D–TB8161D via TB5D). Page 82143 covers 4 chute/sorter 24VDC breakers (CB88209001/021/041/061, feeding TB9001D–TB9061D via TB6D). Page 82144 (split left/right columns) covers: 4 E-stop contactor auxiliary contacts (M88212105/110/120/125, all sharing output wire 8317716A), 3 E-stop relay contacts (CR88212515, CR88212527, CR88212606), a 3-element transient surge protector (FB8209628 ×3), 3 panel-supply breakers (CB88209745/751/763), and 16 vision-system 120VAC breakers (CB88209803–CB88209873) plus a dual-output power monitor (PM88209620 voltage-under/over), all via TB7D. Common bus wire 8308011B (24VDC return/negative) runs vertically across all pages. Intermediate junction wires carry 'A' suffix (e.g., 8214003A). No ratings, voltages, or current values are printed on these supervision rungs except the descriptive labels; pole counts are inferred from symbol type (II = 2-pole main contact, N with line = NC auxiliary).

<details><summary>91 connections</summary>

| A | B | net | wire |
|---|---|---|---|
| TB13D | TB3D | dc | 8214005 |
| TB20D | CR88212101.upstream | dc | 8214000 |
| CR88212101.out | TB3D | ctrl | 8317004A |
| TB3D | CB88207001.upstream_wire | dc | 8207001 |
| CB88207001.mid_monitoring | TB7001D | ctrl | 8214003A |
| TB7001D | PLC-DI | ctrl | 8317007A |
| CB88207001.mid_safety | TB7001D | ctrl | 8214004A |
| TB3D | CB88207011.upstream_wire | dc | 8207011 |
| CB88207011.mid_monitoring | TB7011D | ctrl | 8214009A |
| TB7011D | PLC-DI | ctrl | 8317010A |
| TB3D | CB88207021.upstream_wire | dc | 8207021 |
| CB88207021.mid_monitoring | TB7021D | ctrl | 8214012A |
| TB7021D | PLC-DI | ctrl | 8317013A |
| TB3D | CB88207031.upstream_wire | dc | 8207031 |
| CB88207031.mid_monitoring | TB7031D | ctrl | 8214017A |
| TB7031D | PLC-DI | ctrl | 8317016A |
| TB3D | CB88207041.upstream_wire | dc | 8207041 |
| CB88207041.mid_monitoring | TB7041D | ctrl | 8214023A |
| TB7041D | PLC-DI | ctrl | 8317019A |
| TB3D | CB88207051.upstream_wire | dc | 8207051 |
| CB88207051.mid_monitoring | TB7051D | ctrl | 8214027A |
| TB7051D | PLC-DI | ctrl | 8317022A |
| TB3D | CB88207061.upstream_wire | dc | 8207061 |
| CB88207061.mid_monitoring | TB7061D | ctrl | 8214032A |
| TB7061D | PLC-DI | ctrl | 8317025A |
| 8308011B-bus | TB4D | dc | 8308011B |
| TB4D | CB88206118.upstream_wire | dc | 8206118 |
| CB88206118.mid | TB61180 | ctrl | 8214101A |
| TB61180 | TB4D | ctrl | 8317204A |
| TB4D | CB88207501.upstream_wire | dc | 8207501 |
| CB88207501.out_monitoring | TB4D | ctrl | 8317207A |
| TB4D | CB88207711.upstream_wire | dc | 8207711 |
| CB88207711.out_monitoring | TB4D | ctrl | 8317410A |
| 8308011B-bus | TB5D | dc | 8308011B |
| TB5D | CR8312116.upstream | dc | 8212116 |
| CR8312116.out_monitoring | TB5D | ctrl | 8318104A |
| TB5D | CB88208001.upstream_wire | dc | 8208001 |
| CB88208001.mid | TB8001D | ctrl | 8214203A |
| TB8001D | PLC-DI | ctrl | 8318107A |
| TB5D | CB88208161.upstream_wire | dc | 8208161 |
| CB88208161.mid | TB8161D | ctrl | 8214231A |
| TB8161D | PLC-DI | ctrl | 8318225A |
| 8308011B-bus | TB6D | dc | 8308011B |
| TB6D | CB88209001.upstream_wire | dc | 8209001 |
| CB88209001.mid | TB9001D | ctrl | 8214363A |
| TB9001D | PLC-DI | ctrl | 8317504A |
| TB6D | CB88209061.upstream_wire | dc | 8209061 |
| CB88209061.mid | TB9061D | ctrl | 8214309A |
| TB9061D | PLC-DI | ctrl | 8317513A |
| 8308011B-bus | TB7D | dc | 8308011B |
| TB7D | M88212105.contact_ref_wire | dc | 8212105 |
| M88212105.out_monitoring | TB7D | ctrl | 8317716A |
| TB7D | M88212110.contact_ref_wire | dc | 8212110 |
| M88212110.out_monitoring | TB7D | ctrl | 8317716A |
| TB7D | M88212120.contact_ref_wire | dc | 8212120 |
| M88212120.out_monitoring | TB7D | ctrl | 8317716A |
| TB7D | M88212125.contact_ref_wire | dc | 8212125 |
| M88212125.out_monitoring | TB7D | ctrl | 8317716A |
| 8212516-xref | TB7D | ctrl | 8317722A |
| TB7D | CR88212515.contact_ref_wire | dc | 8212515 |
| CR88212515.out | TB7D | ctrl | 8313418A |
| CR88212527.in_1 | CR88212527.in_2 | ctrl | 8313335C |
| CR88212527.in_2 | TB7D | ctrl | 8313350 |
| FB8209628.element_A | FB8209628.element_B | ctrl | 8214415A |
| FB8209628.common_out | TB7D | ctrl | 8317704A |
| TB7D | CB88209745.upstream_wire | dc | 8209745 |
| CB88209745.out_monitoring | TB7D | ctrl | 8317707A |
| TB7D | CB88209751.upstream_wire | dc | 8209751 |
| CB88209751.out_monitoring | TB7D | ctrl | 8317710A |
| TB7D | CB88209763.upstream_wire | dc | 8209763 |
| CB88209763.out_monitoring | TB7D | ctrl | 8317713A |
| TB7D | CR88212606.contact_ref_wire | dc | 8212606 |
| CR88212606.out | TB7D | ctrl | 8313504A |
| 8308011B-bus | CB88209803.upstream_wire | ac | 8308011B |
| CB88209803.out_monitoring | TB7D | ctrl | 8318004A |
| 8308011B-bus | CB88209808.upstream_wire | ac | 8308011B |
| CB88209808.out_monitoring | TB7D | ctrl | 8318007A |
| CB88209813.out_monitoring | TB7D | ctrl | 8318010A |
| CB88209818.out_monitoring | TB7D | ctrl | 8318013A |
| CB88209823.out_monitoring | TB7D | ctrl | 8318016A |
| CB88209828.out_monitoring | TB7D | ctrl | 8318019A |
| PM88209620.out_voltage_under | TB7D | ctrl | 8317913A |
| PM88209620.out_voltage_over | TB7D | ctrl | 8317916A |
| CB88209833.out_monitoring | TB7D | ctrl | 8318022A |
| CB88209843.out_monitoring | TB7D | ctrl | 8318025A |
| CB88209848.out_monitoring | TB7D | ctrl | 8317104A |
| CB88209853.out_monitoring | TB7D | ctrl | 8317107A |
| CB88209858.out_monitoring | TB7D | ctrl | 8317110A |
| CB88209863.out_monitoring | TB7D | ctrl | 8317113A |
| CB88209868.out_monitoring | TB7D | ctrl | 8317116A |
| CB88209873.out_monitoring | TB7D | ctrl | 8317119A |

</details>
