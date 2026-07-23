/* RME — Electron Wrangler  |  offline, single-graph electrical simulator */
'use strict';
const VERSION='1.7';
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* ---------- component library ----------
   Each type: w,h box; terminals [{id,x,y,rail?}]; body(comp)->svg string (local coords);
   links(comp)->[[tid,tid]] internally-conducting pairs given state;
   load: {kind, terms:[...]} → consumes potential (never in potential-links);
   coil: {a1,a2, drives:'self'} → energizes contacts of same comp;
   sw: switchable in sim; states cycle. */
const T = {
  source:{ name:'Power In', w:54,h:44, sw:false,
    terms:c=>{ const ph=c.phases||1;
      if(ph===3) return [{id:'L1',x:54,y:10,rail:'hot'},{id:'L2',x:54,y:22,rail:'hot'},{id:'L3',x:54,y:34,rail:'hot'},{id:'N',x:0,y:22,rail:'ret'}];
      if(ph===2) return [{id:'L1',x:54,y:9,rail:'hot'},{id:'L2',x:54,y:20,rail:'hot'},{id:'N',x:54,y:31,rail:'ret'},{id:'G',x:0,y:31,rail:'ret'}];
      return [{id:'L',x:54,y:14,rail:'hot'},{id:'N',x:54,y:30,rail:'ret'}]; },
    body:c=>`<rect class="sym fillbody" x="4" y="4" width="46" height="36" rx="4"/>
      <text x="27" y="19" class="comp-label">${esc(c.volts||'480V')}</text>
      <text x="27" y="31" class="comp-sub">${(c.phases||1)===3?'3Ø':((c.phases||1)===2?'120/240':'1Ø')} SRC</text>`,
    links:()=>[] },
  disc:{ name:'Disconnect', w:44,h:48, sw:true, states:['closed','open'],
    terms:c=>polePairs(c.poles||3,44,48),
    body:c=>poleSym(c,'DISC'), links:c=>c.state==='closed'&&!c.fault?poleLinks(c.poles||3):[] },
  breaker:{ name:'Breaker', w:44,h:48, sw:true, states:['closed','open','tripped'],
    terms:c=>polePairs(c.poles||3,44,48),
    body:c=>poleSym(c,'CB'), links:c=>(c.state==='closed'&&!c.fault)?poleLinks(c.poles||3):[] },
  fuse:{ name:'Fuse', w:40,h:26, sw:true, states:['ok','blown'],
    terms:()=>[{id:'a',x:0,y:13},{id:'b',x:40,y:13}],
    body:c=>`<rect class="sym fillbody" x="10" y="6" width="20" height="14" rx="2"/>
      <line class="sym" x1="0" y1="13" x2="10" y2="13"/><line class="sym" x1="30" y1="13" x2="40" y2="13"/>
      <line class="sym" x1="10" y1="13" x2="30" y2="13"/>`,
    links:c=>(c.state!=='blown'&&!c.fault)?[['a','b']]:[] },
  contactor:{ name:'Contactor', w:52,h:60, sw:false,
    terms:c=>{const p=c.poles||3,ar=[]; for(let i=0;i<p;i++){ar.push({id:'L'+(i+1),x:0,y:8+i*11});ar.push({id:'T'+(i+1),x:52,y:8+i*11});}
      ar.push({id:'A1',x:16,y:60,ctrl:true});ar.push({id:'A2',x:36,y:60,ctrl:true});return ar;},
    body:c=>`<rect class="sym fillbody" x="4" y="2" width="44" height="46" rx="4"/>
      <text x="26" y="22" class="comp-label">${esc(c.label||'M')}</text><text x="26" y="34" class="comp-sub">CONTACTOR</text>
      <circle class="sym coilind" cx="26" cy="56" r="6"/>`,
    coil:{a1:'A1',a2:'A2'},
    links:c=>(!c.fault&&c._coilOn)?ltLinks(c.poles||3):[] },
  overload:{ name:'Overload', w:48,h:52, sw:true, states:['ok','tripped'],
    terms:c=>{const p=c.poles||3,ar=[];for(let i=0;i<p;i++){ar.push({id:'L'+(i+1),x:0,y:8+i*11});ar.push({id:'T'+(i+1),x:48,y:8+i*11});}
      ar.push({id:'95',x:14,y:52,ctrl:true});ar.push({id:'96',x:34,y:52,ctrl:true});return ar;},
    body:c=>`<rect class="sym fillbody" x="4" y="2" width="40" height="38" rx="3"/>
      <text x="24" y="24" class="comp-label">OL</text>
      <path class="sym" d="M14 46 h6 l4 -6 4 6 h6"/>`,
    links:c=>{ if(c.fault)return []; const p=c.poles||3,l=(c.state!=='tripped')?ltLinks(p):[];
      if(c.state!=='tripped') l.push(['95','96']); return l; } }, /* 95-96 = NC aux */
  relay:{ name:'Relay', w:50,h:62, sw:false,
    terms:()=>[{id:'A1',x:12,y:0,ctrl:true},{id:'A2',x:38,y:0,ctrl:true},
      {id:'11',x:0,y:24},{id:'14',x:50,y:24},{id:'21',x:0,y:44},{id:'22',x:50,y:44}],
    body:c=>`<rect class="sym fillbody" x="4" y="6" width="42" height="50" rx="4"/>
      <text x="25" y="20" class="comp-label">${esc(c.label||'CR')}</text>
      <text x="25" y="30" class="comp-sub">NO 14</text><text x="25" y="50" class="comp-sub">NC 22</text>`,
    coil:{a1:'A1',a2:'A2'},
    links:c=>{ if(c.fault)return []; const l=[]; if(c._coilOn){l.push(['11','14']);} else {l.push(['21','22']);} return l; } },
  estop:{ name:'E-Stop', w:36,h:40, sw:true, states:['closed','open'], /* NC, open=pressed */
    terms:()=>[{id:'a',x:18,y:0},{id:'b',x:18,y:40}],
    body:c=>`<circle class="sym" cx="18" cy="14" r="10" style="fill:${c.state==='open'?'#7f1d1d':'#dc2626'}"/>
      <line class="sym" x1="18" y1="0" x2="18" y2="4"/><line class="sym" x1="18" y1="24" x2="18" y2="40"/>
      <text x="18" y="18" class="comp-sub" style="fill:#fff">STOP</text>`,
    links:c=>(c.state==='closed'&&!c.fault)?[['a','b']]:[] },
  pbNO:{ name:'Start PB', w:36,h:34, sw:true, states:['open','closed'],
    terms:()=>[{id:'a',x:18,y:0},{id:'b',x:18,y:34}],
    body:c=>`<circle class="sym" cx="18" cy="12" r="9" style="fill:${c.state==='closed'?'#16a34a':'#14532d'}"/>
      <line class="sym" x1="18" y1="0" x2="18" y2="3"/><line class="sym" x1="18" y1="21" x2="18" y2="34"/>
      <text x="18" y="15" class="comp-sub" style="fill:#fff">I</text>`,
    links:c=>(c.state==='closed'&&!c.fault)?[['a','b']]:[] },
  pbNC:{ name:'Stop PB', w:36,h:34, sw:true, states:['closed','open'],
    terms:()=>[{id:'a',x:18,y:0},{id:'b',x:18,y:34}],
    body:c=>`<circle class="sym" cx="18" cy="12" r="9" style="fill:${c.state==='open'?'#7f1d1d':'#b91c1c'}"/>
      <line class="sym" x1="18" y1="0" x2="18" y2="3"/><line class="sym" x1="18" y1="21" x2="18" y2="34"/>
      <text x="18" y="15" class="comp-sub" style="fill:#fff">O</text>`,
    links:c=>(c.state==='closed'&&!c.fault)?[['a','b']]:[] },
  selector:{ name:'Selector', w:38,h:34, sw:true, states:['open','closed'],
    terms:()=>[{id:'a',x:19,y:0},{id:'b',x:19,y:34}],
    body:c=>`<circle class="sym fillbody" cx="19" cy="14" r="10"/>
      <line class="sym" x1="19" y1="14" x2="${c.state==='closed'?19:27}" y2="${c.state==='closed'?5:7}"/>
      <line class="sym" x1="19" y1="0" x2="19" y2="4"/><line class="sym" x1="19" y1="24" x2="19" y2="34"/>`,
    links:c=>(c.state==='closed'&&!c.fault)?[['a','b']]:[] },
  sensor:{ name:'Sensor/PE', w:44,h:30, sw:true, states:['open','closed'],
    terms:()=>[{id:'a',x:0,y:15},{id:'b',x:44,y:15}],
    body:c=>`<rect class="sym fillbody" x="8" y="4" width="28" height="22" rx="3"/>
      <circle class="sym" cx="22" cy="15" r="5" style="fill:${c.state==='closed'?'var(--live)':'#30363d'}"/>
      <line class="sym" x1="0" y1="15" x2="8" y2="15"/><line class="sym" x1="36" y1="15" x2="44" y2="15"/>`,
    links:c=>(c.state==='closed'&&!c.fault)?[['a','b']]:[] },
  vfd:{ name:'VFD', w:56,h:66, sw:false,
    terms:c=>[{id:'L1',x:0,y:10,rail:null},{id:'L2',x:0,y:22},{id:'L3',x:0,y:34},
      {id:'U',x:56,y:10},{id:'V',x:56,y:22},{id:'W',x:56,y:34},{id:'EN',x:28,y:66,ctrl:true}],
    body:c=>`<rect class="sym fillbody" x="4" y="2" width="48" height="52" rx="4"/>
      <text x="28" y="22" class="comp-label">VFD</text><text x="28" y="34" class="comp-sub">${esc(c.label||'DRIVE')}</text>
      <text x="28" y="46" class="comp-sub" style="fill:${c._coilOn?'var(--live)':'var(--dim)'}">${c._coilOn?'RUN':'STOP'}</text>`,
    coil:{a1:'EN',a2:null}, /* enable = single hot signal */
    links:c=>(!c.fault&&c._coilOn)?[['L1','U'],['L2','V'],['L3','W']]:[] },
  motor:{ name:'Motor', w:44,h:44, sw:false, load:true,
    terms:c=>{const ph=c.phases||3; return ph===3?[{id:'U',x:8,y:0},{id:'V',x:22,y:0},{id:'W',x:36,y:0}]
      :[{id:'a',x:12,y:0},{id:'b',x:32,y:0}];},
    body:c=>`<circle class="sym fillbody motorbody" cx="22" cy="26" r="16"/>
      <text x="22" y="30" class="comp-label motorM">M</text>`,
    links:()=>[] },
  light:{ name:'Pilot Light', w:32,h:34, sw:false, load:true,
    terms:()=>[{id:'a',x:16,y:0},{id:'b',x:16,y:34}],
    body:c=>`<circle class="sym fillbody lampbody" cx="16" cy="16" r="10" style="fill:${esc(c.color||'#374151')}"/>
      <line class="sym" x1="9" y1="9" x2="23" y2="23"/><line class="sym" x1="23" y1="9" x2="9" y2="23"/>
      <line class="sym" x1="16" y1="0" x2="16" y2="6"/><line class="sym" x1="16" y1="26" x2="16" y2="34"/>`,
    links:()=>[] },
  sw3:{ name:'3-Way Switch', w:40,h:46, sw:true, states:['t1','t2'],
    terms:()=>[{id:'T1',x:8,y:0},{id:'T2',x:32,y:0},{id:'COM',x:20,y:46}],
    body:c=>`<rect class="sym fillbody" x="4" y="8" width="32" height="30" rx="4"/>
      <line class="sym" x1="8" y1="0" x2="8" y2="12"/><line class="sym" x1="32" y1="0" x2="32" y2="12"/>
      <line class="sym" x1="20" y1="38" x2="20" y2="46"/>
      <circle class="sym" cx="20" cy="30" r="2.4"/>
      <line class="sym" x1="20" y1="30" x2="${c.state==='t1'?8:32}" y2="14"/>
      <text x="20" y="22" class="comp-sub">3W</text>`,
    links:c=>c.fault?[]:(c.state==='t1'?[['COM','T1']]:[['COM','T2']]) },
  sw4:{ name:'4-Way Switch', w:44,h:50, sw:true, states:['straight','cross'],
    terms:()=>[{id:'A1',x:8,y:0},{id:'A2',x:36,y:0},{id:'B1',x:8,y:50},{id:'B2',x:36,y:50}],
    body:c=>{ var x=c.state==='straight'; return `<rect class="sym fillbody" x="4" y="10" width="36" height="30" rx="4"/>
      <line class="sym" x1="8" y1="0" x2="8" y2="12"/><line class="sym" x1="36" y1="0" x2="36" y2="12"/>
      <line class="sym" x1="8" y1="38" x2="8" y2="50"/><line class="sym" x1="36" y1="38" x2="36" y2="50"/>
      <line class="sym" x1="10" y1="16" x2="`+(x?10:34)+`" y2="34"/>
      <line class="sym" x1="34" y1="16" x2="`+(x?34:10)+`" y2="34"/>
      <text x="22" y="27" class="comp-sub" style="font-size:6px">4W</text>`; },
    links:c=>c.fault?[]:(c.state==='straight'?[['A1','B1'],['A2','B2']]:[['A1','B2'],['A2','B1']]) },
  recept:{ name:'Receptacle', w:42,h:54, sw:false,
    terms:()=>[{id:'Hin',x:0,y:12},{id:'Nin',x:0,y:27,rail:null},{id:'Gin',x:0,y:42},
      {id:'Hout',x:42,y:12},{id:'Nout',x:42,y:27},{id:'Gout',x:42,y:42}],
    body:c=>`<rect class="sym fillbody" x="9" y="4" width="24" height="46" rx="6"/>
      <rect class="sym" x="16.5" y="11" width="2.4" height="9"/><rect class="sym" x="23" y="11" width="2.4" height="9"/>
      <path class="sym" d="M18 34 h6 v6 a3 3 0 0 1 -6 0 z" fill="none"/>
      <rect class="sym" x="16.5" y="31" width="2.4" height="7"/><rect class="sym" x="23" y="31" width="2.4" height="7"/>
      <text x="21" y="2" class="comp-sub" style="font-size:6px">${esc(c.label||'RCPT')}</text>`,
    links:()=>[['Hin','Hout'],['Nin','Nout'],['Gin','Gout']] },
  run:{ name:'Conductor Run', w:64, h:24, sw:false,
    terms:()=>[{id:'in',x:0,y:12},{id:'out',x:64,y:12}],
    body:c=>{ var lbl=esc(c.label||(c.runft?c.runft+' ft':'RUN')); var awg=c.awg?(' #'+esc(c.awg)):'';
      return `<line class="sym" x1="0" y1="12" x2="10" y2="12"/>
        <path class="sym" fill="none" d="M10 12 q4 -8 8 0 q4 8 8 0 q4 -8 8 0 q4 8 8 0 q4 -8 8 0"/>
        <line class="sym" x1="54" y1="12" x2="64" y2="12"/>
        <text x="32" y="1" class="comp-sub" style="font-size:6px">`+lbl+awg+`</text>`; },
    links:()=>[['in','out']] },
  busbar:{ name:'Bus Bar', w:18, h:96, sw:false,
    terms:c=>{ const n=c.taps||6, ar=[{id:'in',x:0,y:10}]; for(let i=0;i<n;i++){ ar.push({id:'p'+i,x:18,y:10+i*15}); } return ar; },
    body:c=>{ const n=c.taps||6; let g=`<rect class="sym fillbody" x="6" y="4" width="6" height="${6+(n-1)*15}" rx="2" style="fill:${esc(c.color||'#3f4652')}"/>`
      +`<line class="sym" x1="0" y1="10" x2="6" y2="10"/><text x="9" y="2" class="comp-sub" style="font-size:6px">${esc(c.label||'BUS')}</text>`;
      for(let i=0;i<n;i++){ g+=`<line class="sym" x1="12" y1="${10+i*15}" x2="18" y2="${10+i*15}"/><circle class="sym" cx="12" cy="${10+i*15}" r="1.6"/>`; } return g; },
    links:c=>{ const n=c.taps||6, l=[['in','p0']]; for(let i=1;i<n;i++)l.push(['p0','p'+i]); return l; } },
  heater:{ name:'240V Appliance', w:50,h:42, sw:false, load:true,
    terms:()=>[{id:'a',x:12,y:0},{id:'b',x:38,y:0}],
    body:c=>`<rect class="sym fillbody" x="4" y="7" width="42" height="32" rx="4"/>
      <line class="sym" x1="12" y1="0" x2="12" y2="9"/><line class="sym" x1="38" y1="0" x2="38" y2="9"/>
      <path class="sym" d="M11 30 q4 -9 8 0 q4 9 8 0 q4 -9 8 0" fill="none"/>
      <text x="25" y="19" class="comp-sub">${esc(c.label||'240V')}</text>`,
    links:()=>[] },
  gfci:{ name:'GFCI Receptacle', w:46,h:58, sw:true, states:['ok','tripped'],
    terms:()=>[{id:'Hin',x:0,y:12},{id:'Nin',x:0,y:29},{id:'Gin',x:0,y:46},
      {id:'Hout',x:46,y:12},{id:'Nout',x:46,y:29},{id:'Gout',x:46,y:46}],
    body:c=>{ var t=(c.state==='tripped'||c.fault); return `<rect class="sym fillbody" x="10" y="3" width="26" height="52" rx="6"/>
      <rect class="sym" x="18.5" y="10" width="2.4" height="9"/><rect class="sym" x="25" y="10" width="2.4" height="9"/>
      <path class="sym" d="M20 40 h6 v6 a3 3 0 0 1 -6 0 z" fill="none"/>
      <rect class="sym" x="18.5" y="30" width="2.4" height="7"/><rect class="sym" x="25" y="30" width="2.4" height="7"/>
      <rect class="sym" x="19" y="21" width="3.6" height="3.6" rx="1" style="fill:`+(t?'#ef4444':'#22c55e')+`"/>
      <rect class="sym" x="24" y="21" width="3.6" height="3.6" rx="1" fill="none"/>
      <text x="23" y="2" class="comp-sub" style="font-size:6px">`+esc(c.label||'GFCI')+`</text>`; },
    links:c=>(c.state==='tripped'||c.fault)?[['Gin','Gout']]:[['Hin','Hout'],['Nin','Nout'],['Gin','Gout']] },
  afci:{ name:'AFCI Breaker', w:44,h:48, sw:true, states:['closed','open','tripped'],
    terms:c=>polePairs(c.poles||1,44,48),
    body:c=>{ var t=(c.state==='tripped'); return poleSym(c,'AF')
      +`<circle class="sym" cx="33" cy="9" r="4.2" style="fill:`+(t?'#ef4444':'#7dd3fc')+`"/>
        <text x="33" y="11.4" style="font-size:5px;fill:#0b0e14;text-anchor:middle;font-weight:700">T</text>`; },
    links:c=>(c.state==='closed'&&!c.fault)?poleLinks(c.poles||1):[] },
  plcIn:{ name:'PLC Input', w:44,h:26, sw:false, load:true,
    terms:()=>[{id:'in',x:0,y:13},{id:'c',x:44,y:13,rail:'ret'}],
    body:c=>`<rect class="sym fillbody" x="6" y="3" width="32" height="20" rx="3"/>
      <text x="22" y="16" class="comp-sub">IN ${esc(c.label||'I0.0')}</text>`,
    links:()=>[] },
  plcOut:{ name:'PLC Output', w:44,h:26, sw:true, states:['off','on'],
    terms:()=>[{id:'c',x:0,y:13,rail:'hot'},{id:'out',x:44,y:13}],
    body:c=>`<rect class="sym fillbody" x="6" y="3" width="32" height="20" rx="3"/>
      <text x="22" y="16" class="comp-sub" style="fill:${c.state==='on'?'var(--live)':'var(--dim)'}">Q ${esc(c.label||'Q0.0')}</text>`,
    links:c=>c.state==='on'?[['c','out']]:[] },
  term:{ name:'Terminal', w:26,h:20, sw:false,
    terms:()=>[{id:'a',x:0,y:10},{id:'b',x:26,y:10},{id:'t',x:13,y:0},{id:'bt',x:13,y:20}],
    body:c=>`<rect class="sym fillbody" x="6" y="2" width="14" height="16" rx="2"/>
      <text x="13" y="14" class="comp-sub">${esc(c.label||'X')}</text>`,
    links:()=>[['a','b'],['a','t'],['a','bt']] },
  tstrip:{ name:'Terminal Strip', w:36,h:120, sw:false, positions:8,
    terms:c=>{ const n=8; const ar=[]; for(let i=0;i<n;i++){ const y=14+i*13; ar.push({id:'L'+(i+1),x:0,y}); ar.push({id:'R'+(i+1),x:36,y}); } return ar; },
    body:c=>{ let s=`<rect class="sym fillbody" x="8" y="4" width="20" height="112" rx="3"/><text x="18" y="2" class="comp-sub" style="font-size:7px">${esc(c.label||'TB1')}</text>`;
      for(let i=0;i<8;i++){ const y=14+i*13;
        s+=`<line class="sym" x1="0" y1="${y}" x2="8" y2="${y}"/><line class="sym" x1="28" y1="${y}" x2="36" y2="${y}"/>`
          +`<circle class="sym" cx="8" cy="${y}" r="1.6"/><circle class="sym" cx="28" cy="${y}" r="1.6"/>`
          +`<text x="18" y="${y+2.4}" style="fill:var(--dim);font:6px sans-serif;text-anchor:middle">${i+1}</text>`; }
      return s; },
    links:c=>{ const l=[]; for(let i=0;i<8;i++)l.push(['L'+(i+1),'R'+(i+1)]); return l; } },
  psu:{ name:'DC Power Supply', w:56,h:56, sw:false, psu:true, dcv:24,
    terms:()=>[{id:'Lin',x:0,y:14},{id:'Nin',x:0,y:44},{id:'Vp',x:56,y:14},{id:'Vn',x:56,y:44}],
    body:c=>`<rect class="sym fillbody" x="6" y="4" width="44" height="48" rx="4"/>
      <text x="28" y="21" class="comp-label">PSU</text>
      <text x="28" y="33" class="comp-sub">${esc((c.dcv||24)+'VDC')}</text>
      <text x="3" y="17" class="comp-sub" style="font-size:7px">L</text><text x="3" y="47" class="comp-sub" style="font-size:7px">N</text>
      <text x="53" y="17" class="comp-sub" style="font-size:9px;fill:var(--live);text-anchor:end">+</text><text x="53" y="47" class="comp-sub" style="font-size:9px;text-anchor:end">−</text>
      <circle cx="28" cy="45" r="3.5" style="fill:${c._acOn?'var(--live)':'none'};stroke:var(--edge)"/>`,
    links:()=>[] },
  plcInCard:{ name:'PLC Input Card (8ch)', w:52,h:120, sw:false,
    terms:()=>{ const a=[]; for(let i=0;i<8;i++)a.push({id:'in'+i,x:0,y:14+i*13}); a.push({id:'C',x:52,y:60,rail:'ret'}); return a; },
    body:c=>{ let s=`<rect class="sym fillbody" x="10" y="4" width="32" height="112" rx="3"/><text x="26" y="2" class="comp-sub" style="font-size:7px">${esc(c.label||'DI')}</text>`;
      for(let i=0;i<8;i++){ const y=14+i*13; const on=c._energT&&c._energT['in'+i];
        s+=`<line class="sym" x1="0" y1="${y}" x2="10" y2="${y}"/><circle cx="17" cy="${y}" r="2.6" style="fill:${on?'var(--live)':'#33415580'};stroke:none"/><text x="30" y="${y+2.3}" style="fill:var(--dim);font:6px sans-serif;text-anchor:middle">${i}</text>`; }
      s+=`<line class="sym" x1="42" y1="60" x2="52" y2="60"/><text x="40" y="57" class="comp-sub" style="font-size:6px;text-anchor:end">0V</text>`; return s; },
    links:()=>[] },
  plcOutCard:{ name:'PLC Output Card (8ch)', w:52,h:120, sw:true, states:['off','on'],
    terms:()=>{ const a=[{id:'C',x:0,y:60}]; for(let i=0;i<8;i++)a.push({id:'out'+i,x:52,y:14+i*13}); return a; },
    body:c=>{ const on=c.state==='on'; let s=`<rect class="sym fillbody" x="10" y="4" width="32" height="112" rx="3"/><text x="26" y="2" class="comp-sub" style="font-size:7px">${esc(c.label||'DO')}${on?' ●':''}</text>`;
      s+=`<line class="sym" x1="0" y1="60" x2="10" y2="60"/><text x="13" y="57" class="comp-sub" style="font-size:6px">L+</text>`;
      for(let i=0;i<8;i++){ const y=14+i*13; const e=c._energT&&c._energT['out'+i];
        s+=`<line class="sym" x1="42" y1="${y}" x2="52" y2="${y}"/><circle cx="35" cy="${y}" r="2.6" style="fill:${e?'var(--live)':'#33415580'};stroke:none"/><text x="24" y="${y+2.3}" style="fill:var(--dim);font:6px sans-serif;text-anchor:middle">${i}</text>`; }
      return s; },
    links:c=>{ if(c.state!=='on')return []; const l=[]; for(let i=0;i<8;i++)l.push(['C','out'+i]); return l; } },
  ftb:{ name:'Fused Terminal', w:32,h:24, sw:true, states:['ok','blown'],
    terms:()=>[{id:'a',x:0,y:12},{id:'b',x:32,y:12}],
    body:c=>{ const ok=c.state!=='blown'; return `<rect class="sym fillbody" x="7" y="4" width="18" height="16" rx="2"/>
      <line class="sym" x1="0" y1="12" x2="7" y2="12"/><line class="sym" x1="25" y1="12" x2="32" y2="12"/>
      <rect x="10" y="8" width="12" height="8" rx="1" style="fill:${ok?'none':'var(--warn)'};stroke:${ok?'var(--live)':'var(--warn)'}"/>
      ${ok?'<line class="sym" x1="10" y1="12" x2="22" y2="12"/>':'<line x1="11" y1="9" x2="21" y2="15" style="stroke:var(--warn)"/>'}
      <text x="16" y="23" class="comp-sub" style="font-size:6px">${esc(c.label||'F')}</text>`; },
    links:c=>c.state==='blown'?[]:[['a','b']] },
  gndbar:{ name:'Ground/PE Bar', w:66,h:22, sw:false,
    terms:()=>{ const a=[]; for(let i=0;i<6;i++)a.push({id:'g'+i,x:6+i*11,y:0}); return a; },
    body:c=>{ let s=`<rect class="sym fillbody" x="2" y="8" width="62" height="9" rx="2"/>`;
      for(let i=0;i<6;i++){ const x=6+i*11; s+=`<circle class="sym" cx="${x}" cy="8" r="1.6"/><line class="sym" x1="${x}" y1="0" x2="${x}" y2="8"/>`; }
      s+=`<line class="sym" x1="30" y1="17" x2="30" y2="21"/><line class="sym" x1="26" y1="21" x2="34" y2="21"/><line class="sym" x1="27.5" y1="23" x2="32.5" y2="23"/><line class="sym" x1="29" y1="25" x2="31" y2="25"/>`;
      return s; },
    links:()=>{ const l=[]; for(let i=1;i<6;i++)l.push(['g0','g'+i]); return l; } },
  safetyRelay:{ name:'Safety Relay', w:56,h:66, sw:false, coil:{a1:'A1',a2:'A2'}, safetyGate:true,
    terms:()=>[{id:'A1',x:0,y:12},{id:'IN',x:0,y:33},{id:'A2',x:0,y:54,rail:'ret'},{id:'13',x:56,y:14},{id:'14',x:56,y:26},{id:'23',x:56,y:44},{id:'24',x:56,y:56}],
    body:c=>`<rect class="sym fillbody" x="6" y="4" width="44" height="58" rx="4"/>
      <text x="28" y="21" class="comp-label">SR</text><text x="28" y="33" class="comp-sub" style="font-size:7px">SAFETY</text>
      <text x="2" y="15" class="comp-sub" style="font-size:6px">A1</text><text x="2" y="36" class="comp-sub" style="font-size:6px">IN</text><text x="2" y="57" class="comp-sub" style="font-size:6px">A2</text>
      <circle cx="28" cy="48" r="5" style="fill:${c._coilOn?'var(--live)':'none'};stroke:var(--edge)"/>`,
    links:c=>c._coilOn?[['13','14'],['23','24']]:[] },
  timerON:{ name:'On-Delay TON', w:52,h:52, sw:false, timer:true,
    terms:()=>[{id:'IN',x:0,y:14,ctrl:true},{id:'o1',x:0,y:38},{id:'o2',x:52,y:38}],
    body:c=>`<rect class="sym fillbody" x="4" y="2" width="44" height="32" rx="4"/>
      <text x="26" y="15" class="comp-label">TON</text>
      <text x="26" y="27" class="comp-sub">${esc(((c.preset||2000)/1000)+'s')}</text>
      <circle class="sym coilind" cx="26" cy="44" r="5"/>`,
    links:c=>(!c.fault&&c._out)?[['o1','o2']]:[] },
  timerOFF:{ name:'Off-Delay TOF', w:52,h:52, sw:false, timer:true,
    terms:()=>[{id:'IN',x:0,y:14,ctrl:true},{id:'o1',x:0,y:38},{id:'o2',x:52,y:38}],
    body:c=>`<rect class="sym fillbody" x="4" y="2" width="44" height="32" rx="4"/>
      <text x="26" y="15" class="comp-label">TOF</text>
      <text x="26" y="27" class="comp-sub">${esc(((c.preset||2000)/1000)+'s')}</text>
      <circle class="sym coilind" cx="26" cy="44" r="5"/>`,
    links:c=>(!c.fault&&c._out)?[['o1','o2']]:[] },
  plc:{ name:'PLC / Controller', w:58,h:66, sw:false, load:true,
    terms:()=>[{id:'L+',x:0,y:16},{id:'M',x:0,y:50},{id:'net',x:58,y:33}],
    body:c=>`<rect class="sym fillbody" x="6" y="4" width="46" height="58" rx="4"/>
      <text x="29" y="22" class="comp-label">PLC</text>
      <text x="29" y="34" class="comp-sub" style="font-size:6.5px">${esc(c.label||'CPU')}</text>
      <text x="3" y="19" class="comp-sub" style="font-size:7px">L+</text><text x="3" y="53" class="comp-sub" style="font-size:7px">M</text>
      <circle cx="29" cy="46" r="4" style="fill:${c._on?'var(--live)':'none'};stroke:var(--edge)"/>
      <text x="29" y="60" class="comp-sub" style="font-size:6px;fill:${c._on?'var(--live)':'var(--dim)'}">${c._on?'RUN':'\u2014'}</text>`,
    links:()=>[] },
  netdev:{ name:'Comms / Network Device', w:54,h:50, sw:false, load:true,
    terms:()=>[{id:'L+',x:0,y:14},{id:'M',x:0,y:38},{id:'P1',x:54,y:14},{id:'P2',x:54,y:38}],
    body:c=>`<rect class="sym fillbody" x="6" y="4" width="42" height="42" rx="4"/>
      <text x="27" y="19" class="comp-label" style="font-size:9px">NET</text>
      <text x="27" y="30" class="comp-sub" style="font-size:6px">${esc(c.label||'COMMS')}</text>
      <circle cx="14" cy="41" r="3" style="fill:${c._on?'var(--live)':'#33415580'};stroke:none"/>
      <text x="3" y="17" class="comp-sub" style="font-size:6px">L+</text><text x="3" y="41" class="comp-sub" style="font-size:6px">M</text>`,
    links:()=>[] },
  diode:{ name:'Diode', w:40,h:22, sw:true, states:['ok','open'],
    terms:()=>[{id:'a',x:0,y:11},{id:'b',x:40,y:11}],
    body:c=>{ const ok=c.state!=='open'&&!c.fault; return `<line class="sym" x1="0" y1="11" x2="14" y2="11"/><line class="sym" x1="26" y1="11" x2="40" y2="11"/>
      <path class="sym fillbody" d="M14 4 L14 18 L26 11 Z" style="fill:${ok?'var(--edge)':'none'}"/>
      <line class="sym" x1="26" y1="4" x2="26" y2="18"/>
      <text x="20" y="21" class="comp-sub" style="font-size:6px">${esc(c.label||'D')}</text>`; },
    links:c=>(c.state!=='open'&&!c.fault)?[['a','b']]:[] },
  resistor:{ name:'Resistor', w:46,h:20, sw:false, load:true,
    terms:()=>[{id:'a',x:0,y:10},{id:'b',x:46,y:10}],
    body:c=>`<line class="sym" x1="0" y1="10" x2="8" y2="10"/><line class="sym" x1="38" y1="10" x2="46" y2="10"/>
      <path class="sym" d="M8 10 l3 -6 l4 12 l4 -12 l4 12 l4 -12 l4 12 l3 -6" style="fill:none"/>
      <text x="23" y="19" class="comp-sub" style="font-size:6px">${esc(c.label||'R')}</text>`,
    links:()=>[] },
  horn:{ name:'Alarm Horn', w:36,h:34, sw:false, load:true,
    terms:()=>[{id:'a',x:18,y:0},{id:'b',x:18,y:34}],
    body:c=>`<path class="sym fillbody" d="M8 12 h8 l10 -7 v24 l-10 -7 h-8 z" style="fill:${c._on?'var(--live)':'#374151'}"/>
      <line class="sym" x1="18" y1="0" x2="18" y2="5"/><line class="sym" x1="18" y1="29" x2="18" y2="34"/>
      ${c._on?'<path class="sym" d="M30 10 q5 7 0 14" style="fill:none"/>':''}
      <text x="18" y="20" class="comp-sub" style="font-size:6px">${esc(c.label||'AH')}</text>`,
    links:()=>[] },
  transformer:{ name:'Transformer (CPT)', w:56,h:64, sw:false, xfmr:true, sv:120,
    terms:()=>[{id:'H1',x:0,y:16},{id:'H2',x:0,y:48},{id:'X1',x:56,y:16},{id:'X2',x:56,y:48}],
    body:c=>`<rect class="sym fillbody" x="6" y="4" width="44" height="56" rx="4"/>
      <text x="28" y="20" class="comp-label" style="font-size:9px">XFMR</text>
      <text x="28" y="32" class="comp-sub" style="font-size:6.5px">${esc((c.pv||480)+'/'+(c.sv||120))}</text>
      <text x="3" y="19" class="comp-sub" style="font-size:6px">H1</text><text x="3" y="51" class="comp-sub" style="font-size:6px">H2</text>
      <text x="53" y="19" class="comp-sub" style="font-size:6px;text-anchor:end">X1</text><text x="53" y="51" class="comp-sub" style="font-size:6px;text-anchor:end">X2</text>
      <circle cx="28" cy="46" r="4" style="fill:${c._priOn?'var(--live)':'none'};stroke:var(--edge)"/>`,
    links:()=>[] },
  phaseMon:{ name:'Phase Monitor', w:50,h:56, sw:false, pmon:true,
    terms:()=>[{id:'L1',x:0,y:12},{id:'L2',x:0,y:26},{id:'L3',x:0,y:40},{id:'11',x:50,y:18},{id:'14',x:50,y:40}],
    body:c=>`<rect class="sym fillbody" x="6" y="2" width="38" height="52" rx="4"/>
      <text x="25" y="18" class="comp-label" style="font-size:8px">3\u00d8</text>
      <text x="25" y="29" class="comp-sub" style="font-size:6px">MON</text>
      <circle cx="25" cy="42" r="4" style="fill:${c._coilOn?'var(--live)':'var(--warn)'};stroke:var(--edge)"/>`,
    links:c=>c._coilOn?[['11','14']]:[] },
  solenoid:{ name:'Solenoid / Valve', w:44,h:42, sw:false, coil:{a1:'A1',a2:'A2'},
    terms:()=>[{id:'A1',x:22,y:0},{id:'A2',x:22,y:42}],
    body:c=>`<rect class="sym fillbody" x="8" y="8" width="28" height="26" rx="2"/>
      <rect class="sym" x="14" y="12" width="16" height="18" style="fill:${c._coilOn?'var(--live)':'none'}"/>
      <line class="sym" x1="22" y1="0" x2="22" y2="8"/><line class="sym" x1="22" y1="34" x2="22" y2="42"/>
      <text x="22" y="25" class="comp-sub" style="font-size:6px">${esc(c.label||'SOL')}</text>`,
    links:()=>[] },
  stacklight:{ name:'Stack Light', w:30,h:66, sw:false,
    terms:()=>[{id:'R',x:0,y:14},{id:'Y',x:0,y:32},{id:'G',x:0,y:50},{id:'C',x:30,y:32}],
    body:c=>{ const e=c._energT||{}; const seg=(y,on,col)=>`<rect class="sym" x="8" y="${y}" width="16" height="16" rx="2" style="fill:${on?col:'#2a2f37'}"/>`;
      return seg(6,e.R,'#ef4444')+seg(24,e.Y,'#eab308')+seg(42,e.G,'#22c55e')
        +`<line class="sym" x1="0" y1="14" x2="8" y2="14"/><line class="sym" x1="0" y1="32" x2="8" y2="32"/><line class="sym" x1="0" y1="50" x2="8" y2="50"/><rect class="sym" x="10" y="60" width="12" height="5"/>`; },
    links:()=>[] },
  reactor:{ name:'Line Reactor', w:46,h:56, sw:false,
    terms:()=>[{id:'L1',x:0,y:12},{id:'L2',x:0,y:28},{id:'L3',x:0,y:44},{id:'T1',x:46,y:12},{id:'T2',x:46,y:28},{id:'T3',x:46,y:44}],
    body:c=>`<rect class="sym fillbody" x="6" y="2" width="34" height="52" rx="4"/>
      <path class="sym" d="M12 12 q6 -6 12 0 M12 28 q6 -6 12 0 M12 44 q6 -6 12 0" style="fill:none"/>
      <text x="23" y="52" class="comp-sub" style="font-size:6px">${esc(c.label||'REACTOR')}</text>`,
    links:c=>c.fault?[]:ltLinks(3) },
  pullcord:{ name:'Pull-Cord Switch', w:36,h:38, sw:true, states:['closed','open'],
    terms:()=>[{id:'a',x:18,y:0},{id:'b',x:18,y:38}],
    body:c=>`<circle class="sym" cx="18" cy="15" r="10" style="fill:${c.state==='open'?'#7f1d1d':'#dc2626'}"/>
      <path class="sym" d="M18 15 l6 8 M18 15 l-6 8" style="fill:none;stroke:#fff"/>
      <line class="sym" x1="18" y1="0" x2="18" y2="5"/><line class="sym" x1="18" y1="25" x2="18" y2="38"/>
      <text x="18" y="19" class="comp-sub" style="font-size:6px;fill:#fff">PC</text>`,
    links:c=>(c.state==='closed'&&!c.fault)?[['a','b']]:[] },
  overtemp:{ name:'Over-Temp / PTC', w:40,h:30, sw:true, states:['closed','open'],
    terms:()=>[{id:'a',x:0,y:15},{id:'b',x:40,y:15}],
    body:c=>`<rect class="sym fillbody" x="8" y="4" width="24" height="22" rx="3"/>
      <text x="20" y="18" class="comp-sub" style="font-size:8px;fill:${c.state==='open'?'var(--warn)':'var(--live)'}">${c.state==='open'?'T\u00b0!':'\u03b8'}</text>
      <line class="sym" x1="0" y1="15" x2="8" y2="15"/><line class="sym" x1="32" y1="15" x2="40" y2="15"/>`,
    links:c=>(c.state==='closed'&&!c.fault)?[['a','b']]:[] },
  guardlock:{ name:'Guard-Lock Gate', w:48,h:52, sw:true, states:['closed','open'],
    terms:()=>[{id:'11',x:0,y:12},{id:'12',x:48,y:12},{id:'21',x:0,y:40},{id:'22',x:48,y:40}],
    body:c=>{ const cl=c.state==='closed'; return `<rect class="sym fillbody" x="8" y="2" width="32" height="48" rx="4"/>
      <text x="24" y="16" class="comp-sub" style="font-size:6px">GATE</text>
      <circle cx="24" cy="30" r="7" style="fill:${cl?'var(--live)':'#7f1d1d'};stroke:var(--edge)"/>
      <text x="24" y="33" class="comp-sub" style="font-size:6px;fill:#fff">${cl?'LK':'OP'}</text>`; },
    links:c=>(c.state==='closed'&&!c.fault)?[['11','12'],['21','22']]:[] },
};
function polePairs(n,w,h){const ar=[];for(let i=0;i<n;i++){const y=10+i*((h-14)/Math.max(1,n-1||1));ar.push({id:'in'+i,x:0,y:n===1?h/2:y});ar.push({id:'out'+i,x:w,y:n===1?h/2:y});}return ar;}
function poleLinks(n){const l=[];for(let i=0;i<n;i++)l.push(['in'+i,'out'+i]);return l;}
function ltLinks(n){const l=[];for(let i=0;i<n;i++)l.push(['L'+(i+1),'T'+(i+1)]);return l;}
function poleSym(c,tag){const n=c.poles||3;let s=`<rect class="sym fillbody" x="6" y="2" width="32" height="${8+n*((44-14)/Math.max(1,n-1||1))||40}" rx="3"/>`;
  const cl=c.state==='closed';for(let i=0;i<n;i++){const y=10+i*((48-14)/Math.max(1,n-1||1));
    s+=`<circle class="sym" cx="12" cy="${y}" r="2"/><circle class="sym" cx="32" cy="${y}" r="2"/>
        <line class="sym" x1="12" y1="${y}" x2="${cl?32:28}" y2="${cl?y:y-8}"/>`;}
  s+=`<text x="22" y="46" class="comp-sub">${tag}${c.state==='tripped'?' ⚠':''}</text>`;return s;}


/* ---------- state ---------- */
let PANEL={ name:'Untitled', backdrop:null, components:[], wires:[] };
let mode='build', tool=null, wireStart=null, sel=null, selWire=null;
let view={x:0,y:0,k:1}, uid=1;
let encOn=true;
let viewMode='sch';
let showWireNo=false, meterMode=false, probes=[], meterFn='volts', hoverComp=null, hoverData=null, quiz=null, bootSim=false;
let showVolts=false, orthoWire=false, logMode=false, measurements=[], pinMode=false, selSet=[], marquee=null, netHi=null;
let phaseMap=null;
const svg=$('#svg');
function nid(p){return p+(uid++);}

/* ---------- geometry helpers ---------- */
function compDef(c){return T[c.type];}
function termList(c){return compDef(c).terms(c);}
function termPos(c,tid){const t=termList(c).find(t=>t.id===tid);return t?{x:c.x+t.x,y:c.y+t.y}:{x:c.x,y:c.y};}
function findComp(id){return PANEL.components.find(c=>c.id===id);}

/* ---------- NETLIST SOLVER ----------
   nodes via union-find over wires + conducting internal links (NOT loads).
   hot-live / ret-live from source rails. iterate for coils to fixed point. */
function solve(){
  const comps=PANEL.components;
  comps.forEach(c=>{c._coilOn=false;c._on=false;c._energT={};c._priOn=false;c._mwbcV=null;c._mwbcPartner=null;});
  let iter=0, changed=true;
  let uf;
  while(changed && iter++<12){
    uf=new UF();
    const key=(c,t)=>c.id+'|'+t;
    // wires
    PANEL.wires.forEach(w=>{ if(w.cut)return; uf.union(w.a,w.b); });
    // internal conducting links
    comps.forEach(c=>{ compDef(c).links(c).forEach(([x,y])=>uf.union(key(c,x),key(c,y))); });
    // rails
    const hot=new Set(), ret=new Set();
    comps.forEach(c=>termList(c).forEach(t=>{
      if(t.rail==='hot')hot.add(uf.find(key(c,t.id)));
      if(t.rail==='ret')ret.add(uf.find(key(c,t.id)));
    }));
    const isHot=k=>hot.has(uf.find(k)), isRet=k=>ret.has(uf.find(k));
    // PSU DC output acts as a rail while its AC input was energized (converges over iterations)
    comps.forEach(c=>{ if(compDef(c).psu&&c._acOn){ hot.add(uf.find(key(c,'Vp'))); ret.add(uf.find(key(c,'Vn'))); } });
    comps.forEach(c=>{ if(compDef(c).xfmr&&c._priOn){ hot.add(uf.find(key(c,'X1'))); ret.add(uf.find(key(c,'X2'))); } });
    // recompute coils
    changed=false;
    comps.forEach(c=>{ const d=compDef(c);
      if(d.coil){ const {a1,a2}=d.coil;
        let on = a2===null ? isHot(key(c,a1)) : (isHot(key(c,a1))&&isRet(key(c,a2))) || (isRet(key(c,a1))&&isHot(key(c,a2)));
        if(d.safetyGate) on = on && isHot(key(c,'IN'));
        if(!!c._coilOn!==!!on){c._coilOn=on;changed=true;}
      }
      if(d.psu){ const on=isHot(key(c,'Lin')); if(!!c._acOn!==!!on){c._acOn=on;changed=true;} }
      if(d.xfmr){ const on=isHot(key(c,'H1'))&&(isHot(key(c,'H2'))||isRet(key(c,'H2'))); if(!!c._priOn!==!!on){c._priOn=on;changed=true;} }
      if(d.pmon){ const on=isHot(key(c,'L1'))&&isHot(key(c,'L2'))&&isHot(key(c,'L3')); if(!!c._coilOn!==!!on){c._coilOn=on;changed=true;} }
      if(d.timer){ const inOn=isHot(key(c,'IN')); c._coilOn=inOn;
        if(!_playing){ if(!!c._out!==!!inOn){c._out=inOn;changed=true;} } }
      });
    // stash for post
    solve._uf=uf; solve._hot=hot; solve._ret=ret; solve._isHot=isHot; solve._isRet=isRet; solve._key=key;
  }
  if(changed && typeof console!=='undefined') console.warn('electron-wrangler: solver did not converge after 12 iterations (oscillating circuit?)');
  const {_isHot,_isRet,_key}=solve;
  // per-node phase tracking (single-phasing detection)
  const _puf=solve._uf, _phaseOf={};
  comps.forEach(c=>{ if(c.type==='source'){ const ph=c.phases||1; termList(c).forEach(t=>{ if(t.rail==='hot'){ const r=_puf.find(_key(c,t.id)); (_phaseOf[r]=_phaseOf[r]||new Set()).add(ph===3?t.id:(ph===2?t.id:'L')); } }); } });
  solve._phaseOf=_phaseOf; const _phasesAt=k=>_phaseOf[_puf.find(k)]||new Set();
  phaseMap=_phaseOf;
  // per-node AC/DC classification for the DMM (psu=DC, xfmr sec=AC, source by phases/volts)
  solve._nodeKind={};
  comps.forEach(function(c){ if(c.type==='source'){ var _dc=(c.dc===true)||((c.phases||1)===1 && _numVolt(c.volts)<=90); termList(c).forEach(function(t){ if(t.rail==='hot'){ solve._nodeKind[_puf.find(_key(c,t.id))]=_dc?'dc':'ac'; } }); } });
  comps.forEach(function(c){ var d=compDef(c); if(d.psu&&c._acOn){ solve._nodeKind[_puf.find(_key(c,'Vp'))]='dc'; } if(d.xfmr&&c._priOn){ solve._nodeKind[_puf.find(_key(c,'X1'))]='ac'; } });
  // energized terminals + load on-states
  comps.forEach(c=>{ const d=compDef(c);
    termList(c).forEach(t=>{ const k=_key(c,t.id); c._energT[t.id]= _isHot(k); });
    if(d.load){ const ph=c.phases||(c.type==='motor'?3:1);
      if(c.type==='motor'&&ph===3){ const mp=new Set(); ['U','V','W'].forEach(t=>_phasesAt(_key(c,t)).forEach(p=>mp.add(p)));
        c._nPhases=mp.size; c._singlePhase=(mp.size===2); c._on=(mp.size>=3); }
      else { const ts=termList(c); const a=ts[0].id,b=ts[1].id, ka=_key(c,a), kb=_key(c,b);
        var onLN=( _isHot(ka)&&_isRet(kb) )||( _isRet(ka)&&_isHot(kb) );
        var onLL=false; if(_isHot(ka)&&_isHot(kb)){ var pa=_phasesAt(ka),pb=_phasesAt(kb),df=false; pa.forEach(function(x){if(!pb.has(x))df=true;}); pb.forEach(function(x){if(!pa.has(x))df=true;}); onLL=df; }
        c._on=onLN||onLL; }
    }
    if(d.coil) c._on=c._coilOn;
    if(d.psu) c._on=!!c._acOn;
    if(d.xfmr) c._on=!!c._priOn;
    if(d.pmon) c._on=!!c._coilOn;
    if(d.timer) c._on=!!c._out;
  });
  // ---- MWBC open-neutral: two 120 V loads sharing a FLOATING neutral node,
  // fed from OPPOSITE legs, end up in SERIES across 240 V and split the voltage. ----
  (function(){
    var _pnum=function(x){var m=String(x||'').match(/(\d+(?:\.\d+)?)/);return m?+m[1]:0;};
    var legv=120; comps.forEach(function(c){ if(c.type==='source'){ legv=(+c.legv)||(c.phases===2?_pnum(c.volts)/2:_pnum(c.volts))||120; } });
    var _ohms=function(c){ var w=+c.watts||60; return (legv*legv)/w; };
    var cand=comps.filter(function(c){ var d=compDef(c); return d.load && !c._on && c.type!=='motor' && (c.phases||1)!==3; });
    var byNode={};
    cand.forEach(function(c){ var ts=termList(c); if(ts.length<2)return;
      var k0=_key(c,ts[0].id),k1=_key(c,ts[1].id), hotT=null,retT=null;
      if(_isHot(k0)&&!_isHot(k1)){hotT=ts[0].id;retT=ts[1].id;}
      else if(_isHot(k1)&&!_isHot(k0)){hotT=ts[1].id;retT=ts[0].id;}
      else return;
      var rn=_puf.find(_key(c,retT));
      (byNode[rn]=byNode[rn]||[]).push({c:c,hotT:hotT,retT:retT});
    });
    var mnodes={};
    Object.keys(byNode).forEach(function(rn){ var g=byNode[rn]; if(g.length<2)return;
      for(var i=0;i<g.length;i++)for(var j=i+1;j<g.length;j++){ var A=g[i],B=g[j];
        if(A.c._mwbcPartner||B.c._mwbcPartner)continue;
        var pa=_phasesAt(_key(A.c,A.hotT)),pb=_phasesAt(_key(B.c,B.hotT)),df=false;
        pa.forEach(function(x){if(!pb.has(x))df=true;}); pb.forEach(function(x){if(!pa.has(x))df=true;});
        if(!df)continue;
        var RA=_ohms(A.c),RB=_ohms(B.c),tot=RA+RB,VLL=legv*2;
        A.c._on=true;B.c._on=true;
        A.c._mwbcPartner=B.c.id;B.c._mwbcPartner=A.c.id;
        A.c._mwbcV=Math.round(VLL*RA/tot); B.c._mwbcV=VLL-A.c._mwbcV;
        mnodes[rn]=Math.abs(legv-A.c._mwbcV);
      }
    });
    solve._mwbcNodes=mnodes;
  })();
  // current-flow groups: UF2 = potential nodes + union across ON loads/coils
  const U2=new UF();
  PANEL.wires.forEach(w=>{if(!w.cut)U2.union(w.a,w.b);});
  comps.forEach(c=>{compDef(c).links(c).forEach(([x,y])=>U2.union(_key(c,x),_key(c,y)));});
  comps.forEach(c=>{ const d=compDef(c); if((d.load||d.coil)&&c._on){ const ts=termList(c);
    if(c.type==='motor'&&(c.phases||3)===3){U2.union(_key(c,'U'),_key(c,'V'));U2.union(_key(c,'V'),_key(c,'W'));}
    else if(d.coil){U2.union(_key(c,d.coil.a1), d.coil.a2?_key(c,d.coil.a2):_key(c,d.coil.a1));}
    else U2.union(_key(c,ts[0].id),_key(c,ts[1].id)); }});
  // groups containing an ON load flow
  const flowRoots=new Set();
  comps.forEach(c=>{const d=compDef(c); if((d.load||d.coil)&&c._on){ termList(c).forEach(t=>flowRoots.add(U2.find(_key(c,t.id)))); }});
  // mark wires
  PANEL.wires.forEach(w=>{ w._live=false;w._flow=false; if(w.cut)return;
    const live=_isHot(w.a)||_isRet(w.a)||_isHot(w.b)||_isRet(w.b);
    w._live=live;
    if(live && (flowRoots.has(U2.find(w.a))||flowRoots.has(U2.find(w.b)))) w._flow=true;
  });
  const _vuf=solve._uf, hotV={}, _nv=v=>{const m=String(v||'').match(/(\d+(?:\.\d+)?)/);return m?+m[1]:0;};
  comps.forEach(c=>{ if(c.type==='source'){ const nv=(c.phases===2)?(+c.legv||_nv(c.volts)/2):_nv(c.volts); termList(c).forEach(t=>{ if(t.rail==='hot'){ const r=_vuf.find(_key(c,t.id)); hotV[r]=Math.max(hotV[r]||0,nv); } }); } });
  comps.forEach(c=>{ if(compDef(c).psu&&c._acOn){ const r=_vuf.find(_key(c,'Vp')); hotV[r]=Math.max(hotV[r]||0,+(c.dcv||24)); } });
  comps.forEach(c=>{ if(compDef(c).xfmr&&c._priOn){ const r=_vuf.find(_key(c,'X1')); hotV[r]=Math.max(hotV[r]||0,+(c.sv||120)); } });
  solve._hotV=hotV;
  PANEL.wires.forEach(w=>{ if(w.cut){w._v=null;return;}
    w._v = _isHot(w.a)?(hotV[_vuf.find(w.a)]||0) : _isRet(w.a)?0 : _isHot(w.b)?(hotV[_vuf.find(w.b)]||0) : _isRet(w.b)?0 : null;
    const _wp=_phasesAt(w.a); w._phase=_wp.size===1?[...__setget(_wp)][0]:(_wp.size>1?'mix':null); });
  // display voltages with high-resistance drop (separate graph: hi-Z links are resistive, not shorts)
  { const g=new UF();
    PANEL.wires.forEach(w=>{ if(!w.cut)g.union(w.a,w.b); });
    comps.forEach(c=>{ if(c.hiZ)return; compDef(c).links(c).forEach(([x,y])=>g.union(_key(c,x),_key(c,y))); });
    const V={},_srcV={}; comps.forEach(c=>{ if(c.type==='source'){ const nv=(c.phases===2)?(+c.legv||_nv(c.volts)/2):_nv(c.volts); termList(c).forEach(t=>{ const r=g.find(_key(c,t.id)); if(t.rail==='hot'){V[r]=Math.max(V[r]||0,nv);_srcV[r]=1;} if(t.rail==='ret'){V[r]=0;_srcV[r]=1;} }); } });
    comps.forEach(c=>{ if(compDef(c).psu&&c._acOn){ V[g.find(_key(c,'Vp'))]=Math.max(V[g.find(_key(c,'Vp'))]||0,+(c.dcv||24)); V[g.find(_key(c,'Vn'))]=0; } });
    comps.forEach(c=>{ if(compDef(c).xfmr&&c._priOn){ V[g.find(_key(c,'X1'))]=Math.max(V[g.find(_key(c,'X1'))]||0,+(c.sv||120)); V[g.find(_key(c,'X2'))]=0; } });
    let ch=true,pass=0; while(ch&&pass++<24){ ch=false; comps.forEach(c=>{ if(!c.hiZ)return; compDef(c).links(c).forEach(([x,y])=>{ const ra=g.find(_key(c,x)),rb=g.find(_key(c,y)); const va=V[ra]||0,vb=V[rb]||0;
      if(!_srcV[rb]&&va*0.55>(V[rb]||0)+0.5){V[rb]=va*0.55;ch=true;} if(!_srcV[ra]&&vb*0.55>(V[ra]||0)+0.5){V[ra]=vb*0.55;ch=true;} }); }); }
    PANEL.wires.forEach(w=>{ if(w.cut){w._dispV=null;return;} const r=g.find(w.a); w._dispV=(V[r]!=null)?Math.round(V[r]):w._v; }); }
  if(solve._mwbcNodes){ var _mn=solve._mwbcNodes; PANEL.wires.forEach(function(w){ if(w.cut)return;
    var ra=_vuf.find(w.a), rb=_vuf.find(w.b);
    if(_mn[ra]!=null) w._dispV=_mn[ra]; else if(_mn[rb]!=null) w._dispV=_mn[rb]; }); }
  updateFooter();
}
function __setget(s){ return Array.from(s); }
class UF{ constructor(){this.p={};} find(x){if(this.p[x]===undefined)this.p[x]=x; while(this.p[x]!==x){this.p[x]=this.p[this.p[x]];x=this.p[x];} return x;} union(a,b){this.p[this.find(a)]=this.find(b);} }

/* ---------- ideal-path diagnostic ---------- */
function diagnose(loadComp, wantPath){
  // build ideal graph: every wire (even cut) + every link the component COULD make when closed/ok
  const adj={}, add=(a,b,el)=>{ (adj[a]=adj[a]||[]).push({n:b,el}); (adj[b]=adj[b]||[]).push({n:a,el}); };
  const key=(c,t)=>c.id+'|'+t;
  PANEL.wires.forEach(w=>add(w.a,w.b,{kind:'wire',w}));
  PANEL.components.forEach(c=>{ const d=compDef(c);
    // ideal links: what it connects if fully closed/ok (ignore state)
    let ideal=[];
    if(['disc','breaker'].includes(c.type)) ideal=poleLinks(c.poles||3);
    else if(c.type==='fuse') ideal=[['a','b']];
    else if(c.type==='contactor') ideal=ltLinks(c.poles||3);
    else if(c.type==='overload'){ideal=ltLinks(c.poles||3);ideal.push(['95','96']);}
    else if(c.type==='relay') ideal=null; // built with contact metadata below
    else if(['estop','pbNO','pbNC','selector','sensor','pullcord','overtemp'].includes(c.type)) ideal=[['a','b']];
    else if(c.type==='guardlock') ideal=[['11','12'],['21','22']];
    else if(c.type==='reactor') ideal=ltLinks(3);
    else if(c.type==='phaseMon') ideal=[['11','14']];
    else if(c.type==='vfd') ideal=[['L1','U'],['L2','V'],['L3','W']];
    else if(c.type==='plcOut') ideal=[['c','out']];
    else if(c.type==='diode') ideal=[['a','b']];
    else if(c.type==='term') ideal=[['a','b'],['a','t'],['a','bt']];
    else if(c.type==='timerON'||c.type==='timerOFF') ideal=[['o1','o2']];
    if(c.type==='relay'){ add(key(c,'11'),key(c,'14'),{kind:'comp',c,contact:'NO'}); add(key(c,'21'),key(c,'22'),{kind:'comp',c,contact:'NC'}); }
    else if(ideal){ ideal.forEach(([x,y])=>add(key(c,x),key(c,y),{kind:'comp',c})); }
  });
  // sources (Set for O(1) lookup)
  const srcSet=new Set(); PANEL.components.forEach(c=>termList(c).forEach(t=>{ if(t.rail==='hot')srcSet.add(key(c,t.id)); }));
  // start terminals: coil devices trace the coil/enable control circuit; 3ph motors trace all three phases
  const _dd=compDef(loadComp);
  const starts = _dd.coil ? [_dd.coil.a1]
    : (loadComp.type==='motor'&&(loadComp.phases||3)===3) ? ['U','V','W']
    : [termList(loadComp)[0].id];
  const suspects=[], seenC=new Set(); let anyPath=false, totLen=0; const _dev=[], _seenDev=new Set();
  for(const tid of starts){
    const start=key(loadComp, tid);
    const q=[[start,[]]], seen=new Set([start]); let path=null;
    while(q.length){ const [n,pth]=q.shift();
      if(srcSet.has(n)){ path=pth; break; }
      (adj[n]||[]).forEach(e=>{ if(!seen.has(e.n)){seen.add(e.n); q.push([e.n, pth.concat([e.el])]); } });
    }
    if(!path){ continue; }
    anyPath=true; totLen+=path.length;
    if(wantPath){ path.forEach(function(el){ if(el.kind==="comp"){ var dk="d:"+el.c.id+(el.contact||""); if(!_seenDev.has(dk)){ _seenDev.add(dk); _dev.push({comp:el.c, contact:el.contact}); } } }); }
    path.forEach(el=>{ if(el.kind==='wire'){ if(el.w.cut && !seenC.has('w:'+el.w.id)){ seenC.add('w:'+el.w.id); suspects.push({label:'Cut wire',why:'broken',ref:{wire:el.w.id}}); } }
      else { const c=el.c, kk='c:'+c.id; if(seenC.has(kk))return; const st=broken(c, el.contact); if(st){ seenC.add(kk); suspects.push({label:(c.label?c.label+' — ':'')+compDef(c).name, why:st, ref:{comp:c.id}}); } } });
  }
  if(!anyPath) return {ok:false, msg:'No wired path from this load back to a power source. Check wiring.', suspects:[]};
  return {ok:true, dead:!loadComp._on, suspects, pathLen:totLen, path:_dev};
}
function broken(c,contact){ if(c.fault)return 'faulted/open';
  if(c.type==='breaker'&&c.state==='tripped')return 'TRIPPED';
  if(c.type==='breaker'&&c.state==='open')return 'switched OFF';
  if(c.type==='disc'&&c.state==='open')return 'disconnected';
  if(c.type==='fuse'&&c.state==='blown')return 'BLOWN';
  if(c.type==='overload'&&c.state==='tripped')return 'OL TRIPPED';
  if(c.type==='estop'&&c.state==='open')return 'E-STOP pressed';
  if(c.type==='pullcord'&&c.state==='open')return 'pull-cord PULLED';
  if(c.type==='overtemp'&&c.state==='open')return 'OVER-TEMP (thermal open)';
  if(c.type==='guardlock'&&c.state==='open')return 'gate OPEN / unlocked';
  if(c.type==='phaseMon'&&!c._coilOn)return 'PHASE LOSS (not all 3 phases present)';
  if(c.type==='pbNC'&&c.state==='open')return 'stop pressed';
  if(c.type==='pbNO'&&c.state==='open')return 'not started';
  if(['selector','sensor'].includes(c.type)&&c.state==='open')return 'contact open';
  if(c.type==='contactor'&&!c._coilOn)return 'coil not energized';
  if(c.type==='relay'){ if(contact==='NC'){ return c._coilOn?'coil energized (NC contact open)':null; } return c._coilOn?null:'coil not energized'; }
  if(c.type==='vfd'&&!c._coilOn)return 'drive not enabled';
  if(c.type==='plcOut'&&c.state!=='on')return 'PLC output OFF';
  if((c.type==='timerON'||c.type==='timerOFF')&&!c._out)return 'timer output not active (IN de-energized or not played)';
  return null;
}

/* ---------- RENDER ---------- */
function render(){
  if(mode==='sim') solve();
  const W=svg.clientWidth,H=svg.clientHeight;
  if(W<=0||H<=0) return;
  svg.setAttribute('viewBox',`${-view.x/view.k} ${-view.y/view.k} ${W/view.k} ${H/view.k}`);
  if(viewMode==='phys'){ svg.innerHTML=physBody(); fillPhysPick(); return; }
  let s='';
  if(encOn) s+=backplate();
  // backdrop
  if(PANEL.backdrop){ const o=($('#opacity').value)/100;
    s+=`<image href="${esc(PANEL.backdrop)}" x="0" y="0" width="${PANEL.bw||1200}" height="${PANEL.bh||800}" opacity="${o}" preserveAspectRatio="xMidYMid meet"/>`; }
  (PANEL.pins||[]).forEach((pn,i)=>{ s+=`<g class="pin" data-pin="${i}" transform="translate(${pn.x},${pn.y})"><circle r="11" fill="#ef4444" stroke="#fff" stroke-width="2"/><text y="4" style="fill:#fff;font:bold 11px sans-serif;text-anchor:middle">${i+1}</text></g>`; });
  // wires
  PANEL.wires.forEach(w=>{ const a=endPos(w.a),b=endPos(w.b); if(!a||!b)return;
    const mx=(a.x+b.x)/2;
    const cls=['wire',w.net||'ctrl']; if(w.cut)cls.push('cut'); if(w._live)cls.push('live'); if(w._flow)cls.push('flow'); if(selWire===w)cls.push('hit'); if(hoverData&&hoverData.wires.has(w.id))cls.push('hover'); if(netHi&&netHi.wires.has(w.id))cls.push('nethi');
    let _pstyle=''; if(showPhase&&mode==='sim'&&w._live&&w._phase&&w._phase!=='mix'&&PHASE_COLOR[w._phase]) _pstyle=` style="stroke:${PHASE_COLOR[w._phase]}"`;
    s+=`<path class="${cls.join(' ')}" data-wire="${w.id}"${_pstyle} d="${wirePath(a,b)}"/>`;
    if(showWireNo&&w.label) s+=`<text class="wireno" x="${mx}" y="${(a.y+b.y)/2-3}">${esc(w.label)}</text>`;
    const _vv=(w._dispV!=null?w._dispV:w._v); if(showVolts&&mode==='sim'&&_vv!=null) s+=`<text class="voltlbl" x="${mx}" y="${(a.y+b.y)/2+9}">${_vv}V</text>`; });
  // components
  PANEL.components.forEach(c=>{ const d=compDef(c);
    const cls=['compbox']; if(c._ruledOut)cls.push('ruledout'); if(sel===c||selSet.indexOf(c)>=0)cls.push('sel'); if(mode==='sim'&&anyEnerg(c)&&!c._singlePhase)cls.push('energized'); if(c.fault)cls.push('faulted'); if(hoverData&&hoverData.comps.has(c.id))cls.push('hoverpath'); if(mode==='sim'&&c._singlePhase)cls.push('singlephase');
    let body=d.body(c);
    // live overlays in sim
    if(mode==='sim'){
      if(c.type==='motor'&&c._on) body=body.replace('motorbody','motorbody spin').replace('class="comp-label motorM"','class="comp-label motorM lit"');
      else if(c.type==='motor'&&c._singlePhase) body=body.replace('motorbody','motorbody hum');
      if(c.type==='light'&&c._on) body=body.replace('lampbody','lampbody '+(c._mwbcV!=null?(c._mwbcV>140?'lit-over':(c._mwbcV<80?'lit-under':'lit')):'lit'));
      if((c.type==='contactor'||c.type==='relay')&&c._coilOn) body=body.replace('coilind','coilind lit');
      if(compDef(c).timer&&c._out) body=body.replace('coilind','coilind lit');
    }
    s+=`<g class="${cls.join(' ')}" data-comp="${c.id}" transform="translate(${c.x},${c.y})">
      <rect class="selrect" x="-6" y="-6" width="${d.w+12}" height="${d.h+12}" rx="6"/>
      ${body}
      ${(function(){var _lb=c.label,_ok=_lb&&!['contactor','relay','vfd','term','tstrip','plcIn','plcOut','plcInCard','plcOutCard','gndbar','psu','safetyRelay'].includes(c.type);if(!_ok)return '';var _w=String(_lb).length*5.9+12,_x=(d.w/2)-(_w/2);return '<rect x="'+_x+'" y="-20" width="'+_w+'" height="15" rx="4" class="toplbl-bg"/>'+'<text x="'+(d.w/2)+'" y="-9" class="comp-toplbl">'+esc(_lb)+'</text>';})()}`;
    termList(c).forEach(t=>{ s+=`<circle class="term" data-comp="${c.id}" data-term="${t.id}" cx="${t.x}" cy="${t.y}" r="4"/>`; });
    if(c.note) s+=`<text class="notepin" data-note="${c.id}" x="${d.w-2}" y="4">\ud83d\udccc</text>`;
    if(c.link) s+=`<text class="xlink" data-link="${esc(c.link)}" x="${d.w/2}" y="${d.h+18}">\u2192 ${esc(c.link)}</text>`;
    if(mode==='sim'&&showAmps&&c._on&&c.type==='motor'&&(c.fla||c.hp)) s+=`<text class="ampslbl" x="${d.w/2}" y="${d.h+(c.link?30:18)}">${motorAmps(c)}A</text>`;
    if(showTherm&&c.temp) s+=`<rect x="-3" y="-3" width="${d.w+6}" height="${d.h+6}" rx="5" fill="none" stroke="${tempColor(c.temp)}" stroke-width="3" opacity=".85"/><text x="${d.w-3}" y="${d.h-2}" style="fill:${tempColor(c.temp)};font:bold 8px sans-serif;text-anchor:end">${c.temp}\u00b0</text>`;
    if(c.health&&c.health!=='ok') s+=`<circle cx="3" cy="3" r="4" fill="${healthColor(c.health)}" stroke="#0d1117"/>`;
    if(cbSafe&&mode==='sim'){ const g=c.fault||c.hiZ?'\u26a0':c._singlePhase?'1\u00d8':(anyEnerg(c)?'\u26a1':''); if(g)s+=`<text x="${d.w-3}" y="9" style="fill:#fff;font:bold 9px sans-serif;text-anchor:end;paint-order:stroke;stroke:#000;stroke-width:3px">${g}</text>`; }
    s+=`</g>`; });
  // wire-in-progress
  if(wireStart){ const p=endPos(wireStart.comp+'|'+wireStart.term); if(p) s+=`<circle cx="${p.x}" cy="${p.y}" r="6" fill="none" stroke="var(--accent)" stroke-width="2" class="pulse"/>`; }
  if(meterMode) probes.forEach((k,i)=>{ const p=endPos(k); if(!p)return; const col=i?'#38bdf8':'#ff5b4a';
    s+=`<circle cx="${p.x}" cy="${p.y}" r="8" fill="none" stroke="${col}" stroke-width="2.5"/><text x="${p.x}" y="${p.y-11}" class="comp-label" style="fill:${col};font-size:11px">${i?'B':'A'}</text>`; });
  if(mode==='sim') measurements.forEach(m=>{ const p=endPos(m.key); if(!p)return; const col=m.ok?'#22c55e':'#ef4444';
    s+=`<circle cx="${p.x}" cy="${p.y}" r="6" fill="${col}" opacity=".85"/><text x="${p.x+9}" y="${p.y+3}" style="fill:${col};font:8px sans-serif">${m.actual}V</text>`; });
  if(marquee){ const x=Math.min(marquee.x0,marquee.x1),y=Math.min(marquee.y0,marquee.y1),ww=Math.abs(marquee.x1-marquee.x0),hh=Math.abs(marquee.y1-marquee.y0);
    s+=`<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="rgba(45,212,191,.12)" stroke="var(--accent)" stroke-dasharray="4 3"/>`; }
  svg.innerHTML=s;
}
function backplate(){
  let b='<defs>'
    +'<pattern id="perf" width="26" height="26" patternUnits="userSpaceOnUse">'
      +'<circle cx="6" cy="6" r="1.7" fill="#05070a" opacity=".5"/>'
      +'<circle cx="6" cy="5.2" r="1.3" fill="#4a535f" opacity=".55"/></pattern>'
    +'<linearGradient id="pan" x1="0" y1="0" x2="0" y2="1">'
      +'<stop offset="0" stop-color="#3d4650"/><stop offset=".5" stop-color="#2c333c"/><stop offset="1" stop-color="#222831"/></linearGradient>'
    +'<linearGradient id="rail" x1="0" y1="0" x2="0" y2="1">'
      +'<stop offset="0" stop-color="#8d959f"/><stop offset=".28" stop-color="#c8d0d8"/>'
      +'<stop offset=".55" stop-color="#828a94"/><stop offset="1" stop-color="#565d67"/></linearGradient></defs>';
  b+='<rect x="-3000" y="-2200" width="9000" height="6400" fill="url(#pan)"/>';
  b+='<rect x="-3000" y="-2200" width="9000" height="6400" fill="url(#perf)"/>';
  for(let ry=-2100; ry<4200; ry+=150){
    b+='<rect x="-3000" y="'+ry+'" width="9000" height="11" rx="2" fill="url(#rail)" opacity=".7"/>'
      +'<line x1="-3000" y1="'+(ry+1)+'" x2="6000" y2="'+(ry+1)+'" stroke="#eef2f5" stroke-width=".5" opacity=".35"/>'
      +'<line x1="-3000" y1="'+(ry+10)+'" x2="6000" y2="'+(ry+10)+'" stroke="#12151b" stroke-width="1" opacity=".6"/>';
  }
  return b;
}
function applyEnc(){ const st=document.getElementById('stage'); if(st)st.classList.toggle('enc',encOn);
  const be=$('#btnEnc'); if(be)be.classList.toggle('on',encOn);
  const pl=$('#enc-plate'); if(pl){ const nm=(PANEL.name||'PANEL').split(/[—-]/)[0].trim().slice(0,34)||'PANEL';
    pl.innerHTML=esc(nm)+' <small>&#183; RME</small>'; } }
function endPos(k){ const [id,t]=k.split('|'); const c=findComp(id); return c?termPos(c,t):null; }
function anyEnerg(c){ return Object.values(c._energT||{}).some(Boolean); }
function updateFooter(){ const n=PANEL.components.length, w=PANEL.wires.length;
  const on=PANEL.components.filter(c=>c._on&&(compDef(c).load||compDef(c).coil)).length;
  const flt=PANEL.components.filter(c=>broken(c)).length;
  $('#fstat').textContent=`${n} components · ${w} wires`+(mode==='sim'?` · ${on} energized · ${flt} open/fault`:''); }

/* ---------- COORD ---------- */
function toWorld(ev){ const r=svg.getBoundingClientRect();
  return {x:(ev.clientX-r.left-view.x)/view.k, y:(ev.clientY-r.top-view.y)/view.k}; }

/* ---------- INTERACTION ---------- */
let drag=null, panning=null, resize=null;
svg.addEventListener('pointerdown',ev=>{
  const term=ev.target.closest('.term'), comp=ev.target.closest('.compbox'), wire=ev.target.closest('[data-wire]');
  const linkEl=ev.target.closest('[data-link]');
  if(linkEl){ followLink(linkEl.dataset.link); return; }
  const pinEl=ev.target.closest('[data-pin]');
  if(pinEl){ const pn=(PANEL.pins||[])[+pinEl.dataset.pin]; if(pn&&pn.comp){ sel=findComp(pn.comp); selWire=null; selSet=[]; renderInspector(); render(); flash(pn.comp); } return; }
  if(mode==='build'&&pinMode){ const p=toWorld(ev); const lbl=prompt('Pin label / linked component tag (blank = none):','');
    if(lbl!==null){ PANEL.pins=PANEL.pins||[]; const lc=PANEL.components.find(c=>(c.label||'').toLowerCase()===lbl.trim().toLowerCase()); PANEL.pins.push({x:Math.round(p.x),y:Math.round(p.y),comp:lc?lc.id:null,label:lbl}); persist(); render(); } return; }
  if(mode==='sim'&&logMode&&term){ logMeasure(term.dataset.comp+'|'+term.dataset.term); return; }
  if(mode==='sim'&&meterMode&&term){ addProbe(term.dataset.comp+'|'+term.dataset.term); return; }
  if(tool==='wire'||wireStart){ if(term){ handleWireClick(term.dataset.comp,term.dataset.term); return; } }
  if(mode==='build'&&tool&&T[tool]){ const p=toWorld(ev); addComponent(tool,p.x,p.y); return; }
  if(term && mode==='build'){ handleWireClick(term.dataset.comp,term.dataset.term); return; }
  var _hEl=ev.target.closest(".physhandle");
  if(_hEl && viewMode==="phys"){ var _cg=ev.target.closest(".compbox"); var _c=_cg&&findComp(_cg.dataset.comp); if(_c&&_c.phys){ var _p=toWorld(ev); resize={c:_c, corner:_hEl.dataset.h, x0:_c.phys.x,y0:_c.phys.y,w0:_c.phys.w,h0:_c.phys.h, px:_p.x,py:_p.y}; svg.setPointerCapture(ev.pointerId); return; } }
  if(comp){ const c=findComp(comp.dataset.comp);
    if(mode==='sim'){ operate(c); return; }
    if(ev.shiftKey){ const i=selSet.indexOf(c); if(i>=0)selSet.splice(i,1); else selSet.push(c); sel=null; selWire=null; netHi=null; renderInspector(); render(); return; }
    selSet=[]; netHi=null; sel=c; selWire=null; renderInspector(); render();
    const p=toWorld(ev); const ph=viewMode==='phys'; const bx=ph?(c.phys?c.phys.x:0):c.x, by=ph?(c.phys?c.phys.y:0):c.y;
    drag={c, dx:p.x-bx, dy:p.y-by, phys:ph}; svg.setPointerCapture(ev.pointerId); return; }
  if(wire){ selWire=PANEL.wires.find(w=>w.id===wire.dataset.wire); sel=null; selSet=[]; computeNet(selWire); renderInspector(); render(); return; }
  // empty → marquee (shift+build) or pan
  sel=null;selWire=null;netHi=null;
  if(mode==='build'&&ev.shiftKey){ const p=toWorld(ev); marquee={x0:p.x,y0:p.y,x1:p.x,y1:p.y}; svg.setPointerCapture(ev.pointerId); render(); return; }
  selSet=[];
  if(mode==='build')renderInspector();
  panning={x:ev.clientX,y:ev.clientY,vx:view.x,vy:view.y}; svg.style.cursor='grabbing'; svg.setPointerCapture(ev.pointerId);
});
svg.addEventListener('pointermove',ev=>{
  if(resize){ const p=toWorld(ev); let dx=p.x-resize.px, dy=p.y-resize.py; let x=resize.x0,y=resize.y0,w=resize.w0,h=resize.h0; const cr=resize.corner;
    if(cr==="se"){ w=resize.w0+dx; h=resize.h0+dy; } else if(cr==="sw"){ x=resize.x0+dx; w=resize.w0-dx; h=resize.h0+dy; } else if(cr==="ne"){ y=resize.y0+dy; w=resize.w0+dx; h=resize.h0-dy; } else { x=resize.x0+dx; y=resize.y0+dy; w=resize.w0-dx; h=resize.h0-dy; }
    w=Math.max(12,w); h=Math.max(12,h);
    if(gridSnap){ x=Math.round(x/GRID)*GRID; y=Math.round(y/GRID)*GRID; w=Math.round(w/GRID)*GRID; h=Math.round(h/GRID)*GRID; }
    resize.c.phys.x=Math.round(x); resize.c.phys.y=Math.round(y); resize.c.phys.w=Math.round(w); resize.c.phys.h=Math.round(h); render(); return; }
  if(marquee){ const p=toWorld(ev); marquee.x1=p.x; marquee.y1=p.y; render(); return; }
  if(drag){ const p=toWorld(ev); let nx=Math.round(p.x-drag.dx), ny=Math.round(p.y-drag.dy);
    if(gridSnap){ nx=Math.round(nx/GRID)*GRID; ny=Math.round(ny/GRID)*GRID; }
    if(drag.phys){ drag.c.phys=drag.c.phys||{w:56,h:60}; drag.c.phys.x=nx; drag.c.phys.y=ny; } else { drag.c.x=nx; drag.c.y=ny; } render(); }
  else if(panning){ view.x=panning.vx+(ev.clientX-panning.x); view.y=panning.vy+(ev.clientY-panning.y); render(); }
});
function clearDrag(){ if(drag||resize)persist();
  if(marquee){ const x0=Math.min(marquee.x0,marquee.x1),y0=Math.min(marquee.y0,marquee.y1),x1=Math.max(marquee.x0,marquee.x1),y1=Math.max(marquee.y0,marquee.y1);
    selSet=PANEL.components.filter(c=>{const d=compDef(c);const cx=c.x+d.w/2,cy=c.y+d.h/2;return cx>=x0&&cx<=x1&&cy>=y0&&cy<=y1;});
    marquee=null; sel=null; selWire=null; renderInspector(); }
  drag=null; panning=null; resize=null; svg.style.cursor=''; render(); }
svg.addEventListener('pointerup',clearDrag);
svg.addEventListener('pointercancel',clearDrag);
svg.addEventListener('wheel',ev=>{ ev.preventDefault(); const r=svg.getBoundingClientRect();
  const mx=ev.clientX-r.left,my=ev.clientY-r.top; const f=ev.deltaY<0?1.12:0.89; const nk=Math.max(.25,Math.min(4,view.k*f));
  view.x=mx-(mx-view.x)*(nk/view.k); view.y=my-(my-view.y)*(nk/view.k); view.k=nk; render(); },{passive:false});
document.addEventListener('keydown',ev=>{ if((ev.key==='Delete'||ev.key==='Backspace')){ if(sel){delComp(sel);} else if(selWire){delWire(selWire);} }
  if(ev.key==='Escape'){wireStart=null;tool=null;setTool(null);render();} });

function handleWireClick(cid,tid){
  if(!wireStart){ wireStart={comp:cid,term:tid}; render(); toast('Pick the second terminal'); return; }
  if(wireStart.comp===cid&&wireStart.term===tid){ wireStart=null; render(); return; }
  const a=wireStart.comp+'|'+wireStart.term, b=cid+'|'+tid;
  const net=guessNet(wireStart)||guessNet({comp:cid,term:tid})||'ctrl';
  PANEL.wires.push({id:nid('w'),a,b,net}); wireStart=null; persist(); render();
}
function guessNet(t){ const c=findComp(t.comp); const td=termList(c).find(x=>x.id===t.term);
  if(td&&td.rail==='hot')return 'hot'; if(td&&td.rail==='ret')return 'ret'; if(td&&td.ctrl)return 'ctrl'; return null; }

/* ---------- component ops ---------- */
function addComponent(type,x,y){ const d=T[type];
  const c={id:nid(type),type,x:Math.round(x-d.w/2),y:Math.round(y-d.h/2),label:''};
  if(['disc','breaker','contactor','overload'].includes(type))c.poles=3;
  if(type==='source'){c.phases=3;c.volts='480V';}
  if(type==='motor')c.phases=3;
  if(d.sw)c.state=d.states[0];
  PANEL.components.push(c); sel=c; setTool(null); renderInspector(); persist(); render(); }
function delComp(c){ PANEL.wires=PANEL.wires.filter(w=>!w.a.startsWith(c.id+'|')&&!w.b.startsWith(c.id+'|'));
  PANEL.components=PANEL.components.filter(x=>x!==c); sel=null; renderInspector(); persist(); render(); }
function delWire(w){ PANEL.wires=PANEL.wires.filter(x=>x!==w); selWire=null; renderInspector(); persist(); render(); }

/* ---------- operate (sim) ---------- */
function operate(c){ const d=compDef(c);
  if(d.sw&&d.states){ const i=d.states.indexOf(c.state); c.state=d.states[(i+1)%d.states.length]; }
  sel=c; renderInspector(); render(); }


/* ---------- INSPECTOR ---------- */
function renderInspector(){ const box=$('#inspector');
  if(mode==='sim'){ return renderSimInspector(); }
  if(selSet.length>1){ return renderBulk(); }
  if(selWire){ box.innerHTML=`<h3>Wire</h3>
    <div class="field"><label>Net class</label><select id="ip-net">
      ${['hot','ret','ctrl'].map(n=>`<option ${selWire.net===n?'selected':''}>${n}</option>`).join('')}</select></div>
    <div class="field"><label>Wire number / label</label><input id="ip-wlabel" value="${esc(selWire.label||'')}" placeholder="e.g. 101, 24V-3"></div>
    <button class="tbtn warn" id="ip-cut">${selWire.cut?'Restore wire':'✂ Cut wire (fault)'}</button>
    <button class="tbtn" id="ip-del" style="margin-top:6px">🗑 Delete wire</button>`;
    $('#ip-net').onchange=e=>{selWire.net=e.target.value;persist();render();};
    $('#ip-wlabel').oninput=e=>{selWire.label=e.target.value;persist();render();};
    $('#ip-cut').onclick=()=>{selWire.cut=!selWire.cut;persist();render();};
    $('#ip-del').onclick=()=>delWire(selWire); return; }
  if(!sel){ box.innerHTML=`<div class="hint">Select a component or wire to edit it.<br><br>
    <b>Build:</b> pick a part on the left, click canvas to place. Draw wires terminal-to-terminal.<br><br>
    <b>Simulate:</b> click breakers, E-stops, buttons to operate; blow fuses / trip breakers to inject faults; click a dead motor/light to <b>diagnose</b>.</div>`; return; }
  const c=sel,d=compDef(c); let h=`<h3>${d.name}</h3>
    <div class="field"><label>Label / tag</label><input id="ip-label" value="${esc(c.label||'')}" placeholder="e.g. CB-12, M1"></div>`;
  if(['disc','breaker','contactor','overload'].includes(c.type))
    h+=`<div class="field"><label>Poles</label><select id="ip-poles">${[1,2,3].map(p=>`<option ${c.poles===p?'selected':''}>${p}</option>`).join('')}</select></div>`;
  if(c.type==='source'){ h+=`<div class="field"><label>Voltage</label><input id="ip-volts" value="${esc(c.volts||'480V')}"></div>
    <div class="field"><label>Phase</label><select id="ip-phase"><option value="1" ${c.phases===1?'selected':''}>1Ø</option><option value="3" ${c.phases===3?'selected':''}>3Ø</option></select></div>`; }
  if(c.type==='motor') h+=`<div class="field"><label>Phase</label><select id="ip-phase"><option value="1" ${c.phases===1?'selected':''}>1Ø</option><option value="3" ${c.phases===3?'selected':''}>3Ø</option></select></div>`;
  if(c.type==='light') h+=`<div class="field"><label>Lens color</label><input id="ip-color" type="color" value="${c.color||'#22c55e'}"></div>`;
  if(d.sw) h+=`<div class="field"><label>State</label><select id="ip-state">${d.states.map(s=>`<option ${c.state===s?'selected':''}>${s}</option>`).join('')}</select></div>`;
  h+=`<div class="field"><label>Note / annotation</label><textarea id="ip-note" rows="2" placeholder="pin a note to this device">${esc(c.note||'')}</textarea></div>`;
  h+=`<div class="field"><label>Cross-panel link (library panel name)</label><input id="ip-link" value="${esc(c.link||'')}" placeholder="e.g. ACY1 13XP33 \u2014 2300 Control 24V"></div>`;
  if(['breaker','fuse','disc'].includes(c.type)) h+=`<div class="field"><label>Amp rating</label><input id="ip-amps" type="number" value="${esc(c.amps||'')}" placeholder="e.g. 30"></div>`;
  if(c.type==='motor') h+=`<div class="field"><label>HP</label><input id="ip-hp" type="number" value="${esc(c.hp||'')}" placeholder="e.g. 5"></div><div class="field"><label>FLA (overrides HP)</label><input id="ip-fla" type="number" value="${esc(c.fla||'')}" placeholder="amps"></div>`;
  if(c.type==='timerON'||c.type==='timerOFF') h+=`<div class="field"><label>Preset (seconds)</label><input id="ip-preset" type="number" step="0.1" value="${esc((c.preset||2000)/1000)}"></div>`;
  h+=`<div class="field"><label>Part number (APN)</label><input id="ip-apn" value="${esc(c.apn||'')}" placeholder="Amazon part #"></div>`;
  h+=`<button class="tbtn" id="ip-parts" style="width:100%;margin-bottom:6px">🔎 Find in Parts Search</button>`;
  h+=`<div class="field"><label>Health</label><select id="ip-health">${['ok','aging','due','failed'].map(v=>`<option ${((c.health||'ok')===v)?'selected':''}>${v}</option>`).join('')}</select></div>`;
  h+=`<div class="field"><label>Hot-spot temp (\u00b0F)</label><input id="ip-temp" type="number" value="${esc(c.temp||'')}" placeholder="IR scan"></div>`;
  h+=`<div class="field"><label>Last serviced</label><input id="ip-serv" type="date" value="${esc(c.serviced||'')}"></div>`;
  h+=`<button class="tbtn warn" id="ip-del" style="margin-top:8px">🗑 Delete</button>`;
  box.innerHTML=(viewMode==='phys'&&sel?physInfo(sel):'')+h;
  $('#ip-label').oninput=e=>{c.label=e.target.value;persist();render();};
  const poles=$('#ip-poles'); if(poles)poles.onchange=e=>{c.poles=+e.target.value;fixWires(c);persist();render();};
  const volts=$('#ip-volts'); if(volts)volts.oninput=e=>{c.volts=e.target.value;render();};
  const ph=$('#ip-phase'); if(ph)ph.onchange=e=>{c.phases=+e.target.value;fixWires(c);persist();render();};
  const col=$('#ip-color'); if(col)col.oninput=e=>{c.color=e.target.value;render();};
  const st=$('#ip-state'); if(st)st.onchange=e=>{c.state=e.target.value;persist();render();};
  const nt=$('#ip-note'); if(nt) nt.oninput=e=>{c.note=e.target.value;persist();render();};
  const lk=$('#ip-link'); if(lk) lk.oninput=e=>{c.link=e.target.value;persist();render();};
  const _amps=$('#ip-amps'); if(_amps)_amps.oninput=e=>{c.amps=+e.target.value||'';persist();};
  const _hp=$('#ip-hp'); if(_hp)_hp.oninput=e=>{c.hp=+e.target.value||'';persist();render();};
  const _fla=$('#ip-fla'); if(_fla)_fla.oninput=e=>{c.fla=+e.target.value||'';persist();render();};
  const _pre=$('#ip-preset'); if(_pre)_pre.oninput=e=>{c.preset=Math.round((+e.target.value||2)*1000);persist();render();};
  const _apn=$('#ip-apn'); if(_apn)_apn.oninput=e=>{c.apn=e.target.value;persist();};
  const _bpp=$('#ip-parts'); if(_bpp)_bpp.onclick=()=>partsLink(c);
  const _hh=$('#ip-health'); if(_hh)_hh.onchange=e=>{c.health=e.target.value;persist();render();};
  const _tp=$('#ip-temp'); if(_tp)_tp.oninput=e=>{c.temp=+e.target.value||'';persist();render();};
  const _sv=$('#ip-serv'); if(_sv)_sv.oninput=e=>{c.serviced=e.target.value;persist();};
  $('#ip-del').onclick=()=>delComp(c);
}
function fixWires(c){ const valid=new Set(termList(c).map(t=>c.id+'|'+t.id));
  PANEL.wires=PANEL.wires.filter(w=>{const ka=w.a.startsWith(c.id+'|'),kb=w.b.startsWith(c.id+'|');
    return (!ka||valid.has(w.a))&&(!kb||valid.has(w.b));}); }

function renderSimInspector(){ const box=$('#inspector'); const c=sel;
  if(liveMode){ box.innerHTML=`<h3>\ud83d\udd27 Live Troubleshoot</h3><div id="simextra"></div>`; renderLive(); return; }
  if(!c){ box.innerHTML=`<h3>Simulate</h3>
    <button class="tbtn" id="sim-dead" style="width:100%;margin-bottom:6px">🔎 What's dead? (whole panel)</button>
    <button class="tbtn ${meterMode?'on':''}" id="sim-meter" style="width:100%;margin-bottom:6px">🔧 Multimeter (DMM) ${meterMode?'(ON — V / Ω / ・・・ / A)':''}</button>
    <button class="tbtn" id="sim-quiz" style="width:100%;margin-bottom:6px">🎓 ${quiz?'End quiz':'Quiz me (inject hidden fault)'}</button>
    <button class="tbtn ${showVolts?'on':''}" id="sim-volts" style="width:100%;margin-bottom:6px">⚡ ${showVolts?'Hide':'Show'} live voltages</button>
    <button class="tbtn ${logMode?'on':''}" id="sim-log" style="width:100%;margin-bottom:6px">📝 ${logMode?'Logging as-found (ON)':'As-found meter log'}</button>
    <button class="tbtn ${showPhase?'on':''}" id="sim-phase" style="width:100%;margin-bottom:6px">Φ ${showPhase?'Hide phases':'Show L1/L2/L3 phases'}</button>
    <button class="tbtn ${showTherm?'on':''}" id="sim-therm" style="width:100%;margin-bottom:6px">🌡 ${showTherm?'Hide thermal':'Thermal overlay'}</button>
    <button class="tbtn" id="sim-live" style="width:100%;margin-bottom:6px">\ud83d\udd27 Live Troubleshoot (real event)</button><div id="simextra"></div>
    <div class="hint">Click any device to operate it.<br>• Breakers/E-stops/buttons cycle open⇄closed<br>• Blow fuses & trip breakers to inject faults<br>• Click a <b>dead load</b> to diagnose<br>• Hover a device to highlight its live path</div>`;
    $('#sim-dead').onclick=showPanelReport;
    $('#sim-meter').onclick=()=>{meterMode=!meterMode;probes=[];meterFn='volts';render();renderSimInspector();};
    $('#sim-quiz').onclick=()=>{ if(quiz){quizEnd();} else {startQuiz();} };
    $('#sim-volts').onclick=()=>{showVolts=!showVolts;render();renderSimInspector();};
    $('#sim-log').onclick=()=>{logMode=!logMode;render();renderSimInspector();};
    $('#sim-phase').onclick=()=>{showPhase=!showPhase;render();renderSimInspector();};
    $('#sim-therm').onclick=()=>{showTherm=!showTherm;render();renderSimInspector();};
    var _sl=$("#sim-live"); if(_sl)_sl.onclick=startLive;
    if(meterMode) renderMeter(); if(quiz) renderQuiz(); if(logMode) renderLog();
    if(scenario){ const _d=$('#simextra'); if(_d){ _d.innerHTML+=(!scenario.done?'<div class="hint" style="margin-top:8px;color:var(--accent)">'+esc((SCEN.find(x=>x.id===scenario.id)||{}).prompt||'')+' — click your suspect, then a device panel → Check.</div>':'')+((scenario.isSev&&!scenario.done)?'<button class="tbtn warn" id="sim-scen-reveal" style="width:100%;margin-top:8px">🏳 Give up — reveal fault & fix</button>':'')+'<button class="tbtn" id="sim-scen-exit" style="width:100%;margin-top:8px">← Exit call (restore my panel)</button>'; const _e=$('#sim-scen-exit'); if(_e)_e.onclick=exitScenario; const _rv=$('#sim-scen-reveal'); if(_rv)_rv.onclick=function(){_sevReveal(true);}; } }
    return; }
  const d=compDef(c); let h=`<h3>${c.label?esc(c.label)+' — ':''}${d.name}</h3>`;
  if(d.sw){ const cur=c.state; const cls=(cur==='closed'||cur==='ok'||cur==='on')?'closed':(cur==='tripped'||cur==='blown')?'fault':'open';
    h+=`<button class="statebtn ${cls}" id="sim-toggle">State: ${esc(cur.toUpperCase())} — click to change</button>`; }
  // fault injection universal
  h+=`<button class="statebtn ${c.fault?'fault':''}" id="sim-fault">${c.fault?'⚠ FAULTED (open) — clear':'Inject fault (open device)'}</button>`;
  h+=`<button class="statebtn ${c.hiZ?'fault':''}" id="sim-hiz">${c.hiZ?'⚠ HIGH-RESISTANCE — clear':'Inject high-resistance (voltage drop)'}</button>`;
  h+=`<button class="tbtn" id="sim-bolt" style="width:100%">⚡ Bolted fault here → trips protection</button>`;
  if(scenario){ if(!scenario.done) h+=`<button class="tbtn" id="sim-scen" style="width:100%;margin-top:6px">🎯 Check: is this the fault?</button>`; if(scenario.isSev&&!scenario.done) h+=`<button class="tbtn warn" id="sim-scen-reveal" style="width:100%;margin-top:6px">🏳 Give up — reveal fault & fix</button>`; h+=`<button class="tbtn" id="sim-scen-exit" style="width:100%;margin-top:6px">← Exit call</button>`; }
  if(compDef(c).load||compDef(c).coil){ h+=`<div class="hint" style="margin:6px 0">Status: <b style="color:${c._on?'var(--live)':'var(--dim)'}">${c._on?'ENERGIZED / RUNNING':'DEAD'}</b></div>`;
    if(!c._on) h+=`<button class="tbtn" id="sim-diag" style="width:100%">🔎 Diagnose why it's dead</button><div id="diag"></div>`; }
  if(quiz&&!quiz.answered) h+=`<button class="tbtn" id="sim-qz-check" style="width:100%;margin-top:8px">\ud83c\udf93 Check: is this the fault?</button>`;
  if(quiz) h+=`<button class="tbtn warn" id="sim-qz-reveal" style="width:100%;margin-top:6px">Reveal & end quiz</button>`;
  box.innerHTML=(viewMode==='phys'&&sel?physInfo(sel):'')+h;
  const qc=$('#sim-qz-check'); if(qc)qc.onclick=quizGuess;
  const qr=$('#sim-qz-reveal'); if(qr)qr.onclick=quizReveal;
  const tg=$('#sim-toggle'); if(tg)tg.onclick=()=>{operate(c);};
  $('#sim-fault').onclick=()=>{c.fault=!c.fault;render();renderSimInspector();};
  const _hz=$('#sim-hiz'); if(_hz)_hz.onclick=()=>{c.hiZ=!c.hiZ;render();renderSimInspector();};
  const _bf=$('#sim-bolt'); if(_bf)_bf.onclick=()=>boltedFault(c);
  const _sc=$('#sim-scen'); if(_sc)_sc.onclick=scenarioGuess; const _sce=$('#sim-scen-exit'); if(_sce)_sce.onclick=exitScenario; const _rv2=$('#sim-scen-reveal'); if(_rv2)_rv2.onclick=function(){_sevReveal(true);};
  const dg=$('#sim-diag'); if(dg)dg.onclick=()=>runDiag(c);
}
function runDiag(c){ const r=diagnose(c); const box=$('#diag');
  if(c._singlePhase){ box.innerHTML=`<div class="hint" style="color:var(--warn)">SINGLE-PHASING: only 2 of 3 phases present at the motor — it will hum/overheat but not turn. Check for a blown fuse, open pole, or loose lead on the missing phase.</div>`; return; }
  if(!r.ok){ box.innerHTML=`<div class="hint" style="color:var(--warn)">${esc(r.msg)}</div>`; return; }
  if(!r.suspects.length){ box.innerHTML=`<div class="hint">Path is intact & every device is closed — check upstream source voltage or the load itself.</div>`; return; }
  box.innerHTML=`<div class="hint" style="margin:6px 0">${r.suspects.length} break(s) in the path to source — closest first:</div>`+
    r.suspects.map((s,i)=>`<div class="suspect" data-i="${i}"><b>${i+1}. ${esc(s.label)}</b><br>${esc(s.why)}</div>`).join('')+
    `<button class="tbtn" id="diag-walk" style="width:100%;margin-top:6px">▶ Walk me through it</button><div id="walkout"></div>`;
  const _wb=box.querySelector('#diag-walk'); if(_wb)_wb.onclick=()=>{ const steps=guidedWalk(c); $('#walkout').innerHTML=steps.map(t=>`<div class="suspect" style="cursor:default;border-color:var(--accent)">${esc(t)}</div>`).join('')+`<button class="tbtn" id="walk-say" style="width:100%;margin-top:6px">\ud83d\udd0a Read aloud</button>`; const _sa=$('#walk-say'); if(_sa)_sa.onclick=()=>speak(steps); };
  box.querySelectorAll('.suspect[data-i]').forEach(el=>el.onclick=()=>{ const s=r.suspects[+el.dataset.i];
    if(s.ref.comp){sel=findComp(s.ref.comp);render();flash(s.ref.comp);renderSimInspector();}
    if(s.ref.wire){selWire=PANEL.wires.find(w=>w.id===s.ref.wire);render();} });
}
function flash(id){ const g=svg.querySelector(`[data-comp="${id}"]`); if(g){g.classList.add('faulted');setTimeout(()=>render(),1200);} }

/* ---------- palette / modes ---------- */
const PAL=['source','disc','breaker','fuse','contactor','overload','relay','timerON','timerOFF','vfd','motor','light','estop','pbNO','pbNC','selector','sensor','plcIn','plcOut','plcInCard','plcOutCard','psu','term','tstrip','ftb','gndbar','safetyRelay','plc','netdev','diode','resistor','horn','transformer','phaseMon','solenoid','stacklight','reactor','pullcord','overtemp','guardlock'];
function buildPalette(){ $('#palette').innerHTML=PAL.map(t=>`<button data-t="${t}"><svg viewBox="0 0 ${T[t].w} ${T[t].h}">${T[t].body(demoStub(t))}</svg>${T[t].name}</button>`).join('');
  $('#palette').querySelectorAll('button').forEach(b=>b.onclick=()=>setTool(b.dataset.t)); }
function demoStub(t){const c={type:t,label:'',poles:3,phases:3,state:T[t].states?T[t].states[0]:undefined,volts:'480V'};return c;}
function setTool(t){ tool=(t==='wire')?'wire':t; wireStart=null;
  $('#palette').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  $('#btnWire').classList.toggle('on',t==='wire');
  svg.className.baseVal=(t==='wire')?'wire':(t&&T[t])?'place':''; }
$('#btnWire').onclick=()=>setTool(tool==='wire'?null:'wire');
function setMode(m){ if(typeof _playing!=='undefined'&&_playing&&typeof stopPlay==='function')stopPlay(); mode=m; wireStart=null;tool=null;setTool(null); meterMode=false; probes=[]; meterFn='volts'; hoverComp=null; hoverData=null; logMode=false; showVolts=false; pinMode=false; selSet=[]; marquee=null; netHi=null; if(quiz) quizEnd();
  $('#mBuild').classList.toggle('on',m==='build'); $('#mSim').classList.toggle('on',m==='sim');
  $('#left').style.opacity=m==='sim'?.4:1; $('#left').style.pointerEvents=m==='sim'?'none':'auto';
  sel=null;selWire=null; if(typeof applyView==='function')applyView(); renderInspector(); render(); }
$('#mBuild').onclick=()=>setMode('build'); $('#mSim').onclick=()=>setMode('sim');

/* ---------- persistence ---------- */
const CSS_COLOR=/^#[0-9a-fA-F]{3,8}$|^rgb|^hsl|^[a-zA-Z]+$/;
function sanColor(v,fb){ return (typeof v==='string'&&CSS_COLOR.test(v))?v:fb; }
function validatePanel(p){
  if(!p||typeof p!=='object'||!Array.isArray(p.components)||!Array.isArray(p.wires)) throw new Error('bad panel schema');
  const VALID_HEALTH={ok:1,aging:1,due:1,failed:1};
  if(p.pins&&!Array.isArray(p.pins)) p.pins=[];
  (p.pins||[]).forEach(pn=>{ if(!isFinite(pn.x))pn.x=0; if(!isFinite(pn.y))pn.y=0; });
  if(p.pm&&!Array.isArray(p.pm)) p.pm=[];
  if(p.backdrop!=null&&(typeof p.backdrop!=='string'||!/^data:image\//i.test(p.backdrop))) p.backdrop=null;
  if(p.photo!=null&&(typeof p.photo!=='string'||!/^data:image\//i.test(p.photo))) p.photo=null;
  p.components.forEach(c=>{ if(!c||!c.id||!T[c.type]) throw new Error('bad component'); 
    if(!isFinite(c.x)) c.x=0; if(!isFinite(c.y)) c.y=0; 
    if(c.color) c.color=sanColor(c.color,'#22c55e');
    if(c.health&&!VALID_HEALTH[c.health]) c.health='ok';
    if(c.state!=null&&typeof c.state!=='string') c.state='';
    ['amps','hp','fla','temp','preset'].forEach(k=>{ if(c[k]!=null&&!isFinite(+c[k])) delete c[k]; }); });
  return p;
}
function persist(){ try{ localStorage.setItem('acy1_panel', JSON.stringify(PANEL)); }
  catch(e){ if(typeof toast==='function') toast('\u26a0 Auto-save failed \u2014 use \ud83d\udcbe Save to file'); }
  if(typeof histCommit==='function') histCommit(); }
function restore(){ try{ const s=localStorage.getItem('acy1_panel'); if(s){PANEL=validatePanel(JSON.parse(s));
    const mx=Math.max(0,...PANEL.components.map(c=>+((c.id.match(/\d+/)||[0])[0])||0),...PANEL.wires.map(w=>+((w.id.match(/\d+/)||[0])[0])||0)); uid=mx+1; return true; } }catch(e){} return false; }
$('#btnSave').onclick=()=>{ const blob=new Blob([JSON.stringify(PANEL,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(PANEL.name||'panel')+'.panel.json'; a.click(); toast('Panel saved'); };
$('#btnLoad').onclick=()=>$('#fileJson').click();
$('#fileJson').onchange=e=>{ const f=e.target.files[0]; if(!f)return; const r=new FileReader();
  r.onload=()=>{ try{ PANEL=validatePanel(JSON.parse(r.result)); uid=Date.now()%1e6; restoreUid(); sel=null;selWire=null; if(typeof PROJECT!=='undefined'&&PROJECT&&typeof projSaveActive==='function')projSaveActive(); persist(); applyEnc();render(); renderInspector(); toast('Panel loaded'); }catch(err){toast('Bad file');} }; r.readAsText(f); e.target.value=''; };
function restoreUid(){ const num=x=>+((String(x).match(/\d+/)||[0])[0])||0;
  const mx=Math.max(0,...PANEL.components.map(c=>num(c.id)),...PANEL.wires.map(w=>num(w.id))); uid=mx+1; }
$('#btnClear').onclick=()=>{ if(!confirm('Start a new blank panel? (Save first if needed)'))return; PANEL={name:'Untitled',backdrop:null,components:[],wires:[]}; uid=1; sel=null;selWire=null; persist(); applyEnc();render(); renderInspector(); };

/* ---------- backdrop / AI ---------- */
$('#btnBackdrop').onclick=()=>$('#fileImg').click();
$('#fileImg').onchange=e=>{ const f=e.target.files[0]; if(!f)return; const r=new FileReader();
  r.onload=()=>{ const img=new Image(); img.onload=()=>{ PANEL.backdrop=r.result; PANEL.bw=img.width; PANEL.bh=img.height; persist(); render(); toast('Drawing loaded — trace over it'); }; img.src=r.result; }; r.readAsDataURL(f); e.target.value=''; };
$('#btnPhoto').onclick=()=>$('#filePhoto').click();
$('#filePhoto').onchange=e=>{ const f=e.target.files[0]; if(!f)return; const r=new FileReader();
  r.onload=()=>{ const img=new Image(); img.onload=()=>{ PANEL.photo=r.result; PANEL.pw=img.width; PANEL.ph=img.height; persist(); if(viewMode!=='phys'){ viewMode='phys'; var _bv=$('#btnView'); if(_bv){ _bv.classList.add('on'); _bv.innerHTML='&#128268; Schematic'; } if(typeof applyView==='function')applyView(); } render(); toast('Panel photo loaded \u2014 drag parts onto the real devices'); }; img.src=r.result; }; r.readAsDataURL(f); e.target.value=''; };
$('#opacity').oninput=()=>render();
$('#btnAI').onclick=()=>{ const msg=`AI PANEL BUILDER — drawings + photo → live trainable panel\n\n`+
  `— ELECTRICAL MODEL (from the schematic) —\n`+
  `1. Load the schematic (CP83 sheet, PDF page, sketch) with 🖼 Drawing backdrop.\n`+
  `2. Send that same drawing to Aki in chat: "extract this to Electron Wrangler JSON".\n`+
  `3. Aki reads the symbols (breakers, contactors, fuses, relays, PLC I/O, motors) and the wiring nets and returns a .panel.json.\n`+
  `4. 📂 Load it — it drops onto your traced backdrop; nudge parts to match, then Simulate / meter with the DMM.\n\n`+
  `— PHYSICAL LAYOUT (from a panel photo) —\n`+
  `5. Load an actual photo of the enclosure with 📷 Panel photo.\n`+
  `6. It opens the Physical view with the photo behind the modules.\n`+
  `7. Drag each module onto the real device in the photo (or ask Aki: "position these parts to match the photo").\n\n`+
  `Result: techs train on the exact panel — trace power, meter with the multimeter, and run trouble calls on real ACY1 equipment.`;
  alert(msg); };

/* ---------- toast ---------- */
let tt; function toast(m){ const el=$('#toast'); el.textContent=m; el.classList.add('show'); clearTimeout(tt); tt=setTimeout(()=>el.classList.remove('show'),1800); }

/* ---------- DEMO PANEL ---------- */
function demoPanel(){
  const P={name:'Demo — Conveyor Motor Starter',backdrop:null,components:[],wires:[]};
  const add=(type,x,y,extra={})=>{const d=T[type];const c=Object.assign({id:type+(uid++),type,x,y,label:''},extra);
    if(['disc','breaker','contactor','overload'].includes(type))c.poles=c.poles||3;
    if(d.sw)c.state=c.state||d.states[0];P.components.push(c);return c;};
  const w=(a,b,net)=>P.wires.push({id:'w'+(uid++),a:a.id+'|'+a.t,b:b.id+'|'+b.t,net});
  const src=add('source',60,80,{phases:3,volts:'480V',label:'SRC'});
  const disc=add('disc',180,80,{poles:3,label:'DISC-1',state:'closed'});
  const cb=add('breaker',300,80,{poles:3,label:'CB-1',state:'closed'});
  const cont=add('contactor',430,72,{poles:3,label:'M1'});
  const ol=add('overload',560,76,{label:'OL-1',state:'ok'});
  const mot=add('motor',680,150,{phases:3,label:'MTR-1'});
  // power (3ph)
  ['L1','L2','L3'].forEach((L,i)=>{ w({id:src.id,t:L},{id:disc.id,t:'in'+i},'hot');
    w({id:disc.id,t:'out'+i},{id:cb.id,t:'in'+i},'hot');
    w({id:cb.id,t:'out'+i},{id:cont.id,t:'L'+(i+1)},'hot');
    w({id:cont.id,t:'T'+(i+1)},{id:ol.id,t:'L'+(i+1)},'hot'); });
  w({id:ol.id,t:'T1'},{id:mot.id,t:'U'},'hot'); w({id:ol.id,t:'T2'},{id:mot.id,t:'V'},'hot'); w({id:ol.id,t:'T3'},{id:mot.id,t:'W'},'hot');
  // control 120V rung
  const cs=add('source',60,330,{phases:1,volts:'120V',label:'CTRL'});
  const es=add('estop',180,320,{state:'closed',label:'ESTOP'});
  const stop=add('pbNC',260,320,{state:'closed',label:'STOP'});
  const start=add('pbNO',340,320,{state:'open',label:'START'});
  const runL=add('light',560,320,{color:'#22c55e',label:'RUN'});
  w({id:cs.id,t:'L'},{id:es.id,t:'a'},'hot');
  w({id:es.id,t:'b'},{id:stop.id,t:'a'},'ctrl');
  w({id:stop.id,t:'b'},{id:start.id,t:'a'},'ctrl');
  w({id:start.id,t:'b'},{id:cont.id,t:'A1'},'ctrl');
  w({id:cont.id,t:'A2'},{id:cs.id,t:'N'},'ret');
  // seal-in (aux) via start branch node → run light across coil
  w({id:start.id,t:'b'},{id:runL.id,t:'a'},'ctrl');
  w({id:runL.id,t:'b'},{id:cs.id,t:'N'},'ret');
  return P;
}


/* ================= PHYSICAL PANEL LAYOUT VIEW ================= */
const DOORTYPES=new Set(['estop','pbNO','pbNC','selector','light','sensor']);
const PW={source:[76,58],disc:[38,76],breaker:[38,76],fuse:[30,60],contactor:[62,86],
  overload:[54,80],relay:[46,84],vfd:[86,112],motor:[64,60],plcIn:[76,48],plcOut:[76,48],
  term:[42,104],sensor:[46,46]};
const RAILS=[150,300,450,600];
function psize(c){return PW[c.type]||[56,62];}
function autoPhys(){
  const LM=window.PANEL_LAYOUT;
  if(LM){ PANEL.components.forEach(c=>{ if(!c.phys && c.label && LM[c.label]){
    const m=LM[c.label], [w,h]=psize(c);
    const mx=isFinite(m.x)?Math.max(0,Math.min(1,m.x)):0.5, my=isFinite(m.y)?Math.max(0,Math.min(1,m.y)):0.5;
    c.phys={x:Math.round(40+mx*1040), y:Math.round(40+my*600), w, h}; } }); }
  let dx=60, dyDoor=28;
  PANEL.components.filter(c=>DOORTYPES.has(c.type)).forEach(c=>{ if(c.phys)return;
    const[w,h]=psize(c); if(dx+w>1080){dx=60;dyDoor+=h+10;} c.phys={x:dx,y:dyDoor,w,h}; dx+=w+18; });
  let r=0, rx=[60,60,60,60];
  PANEL.components.filter(c=>!DOORTYPES.has(c.type)).sort((a,b)=>a.x-b.x).forEach(c=>{
    if(c.phys)return; const[w,h]=psize(c);
    if(rx[r]+w>1060){ r=(r+1)%RAILS.length; }
    c.phys={x:rx[r],y:RAILS[r],w,h}; rx[r]+=w+24; });
}
function wiredNeighbors(c){ const seen=new Set();
  PANEL.wires.forEach(w=>{ const ia=w.a.split('|')[0], ib=w.b.split('|')[0];
    if(ia===c.id&&ib!==c.id)seen.add(ib); if(ib===c.id&&ia!==c.id)seen.add(ia); });
  return [...seen].map(findComp).filter(Boolean); }
function physModule(c){ const w=c.phys.w,h=c.phys.h, coil=c._coilOn, on=c._on;
  const led=col=>'<circle cx="'+(w-9)+'" cy="10" r="4" fill="'+col+'" stroke="#111"/>';
  const frame='<rect class="sym fillbody" x="0" y="0" width="'+w+'" height="'+h+'" rx="5"/>';
  var _lab=String(c.label||c.type); if(_lab.length>14)_lab=_lab.slice(0,13)+'\u2026';
  const tag='<text x="'+(w/2)+'" y="'+(h+12)+'" class="comp-sub" style="fill:#c9d1d9">'+esc(_lab)+'</text>';
  let f='';
  switch(c.type){
    case 'breaker': case 'disc': { const st=c.state||'closed';
      const col=st==='closed'?'#22c55e':st==='tripped'?'#f97316':'#ef4444';
      const n=c.poles||3, pw=(w-14)/n; let lv='';
      for(let i=0;i<n;i++){ const x=7+i*pw;
        lv+='<rect x="'+x+'" y="'+(h*0.32)+'" width="'+(pw-3)+'" height="'+(h*0.42)+'" rx="2" fill="#0d1117" stroke="#555"/>'
          +'<rect x="'+(x+1)+'" y="'+(st==='closed'?h*0.34:h*0.54)+'" width="'+(pw-5)+'" height="'+(h*0.15)+'" rx="1" fill="'+col+'"/>'; }
      f=lv+'<text x="'+(w/2)+'" y="15" class="comp-sub">'+(c.type==='breaker'?'CB':'DIS')+'</text>'; break; }
    case 'fuse': f='<rect x="6" y="'+(h*0.32)+'" width="'+(w-12)+'" height="'+(h*0.4)+'" rx="3" fill="#0d1117" stroke="#666"/>'
      +(c.state==='blown'?'<text x="'+(w/2)+'" y="'+(h*0.6)+'" class="comp-sub" style="fill:#ef4444">BLOWN</text>'
        :'<line x1="10" y1="'+(h*0.52)+'" x2="'+(w-10)+'" y2="'+(h*0.52)+'" stroke="#facc15" stroke-width="1.5"/>'); break;
    case 'contactor': f='<text x="'+(w/2)+'" y="'+(h*0.55)+'" class="comp-label">'+esc(c.label||'K')+'</text>'
      +'<text x="'+(w/2)+'" y="'+(h*0.72)+'" class="comp-sub">CONT</text>'+led(coil?'#22c55e':'#3a3a3a'); break;
    case 'overload': f='<text x="'+(w/2)+'" y="'+(h*0.55)+'" class="comp-label">OL</text>'+led(c.state==='tripped'?'#ef4444':'#22c55e'); break;
    case 'relay': f='<text x="'+(w/2)+'" y="'+(h*0.55)+'" class="comp-sub">RLY</text>'+led(coil?'#22c55e':'#3a3a3a'); break;
    case 'vfd': f='<rect x="8" y="15" width="'+(w-16)+'" height="18" rx="2" fill="#04120f"/>'
      +'<text x="'+(w/2)+'" y="28" class="comp-sub" style="fill:'+(coil?'#22c55e':'#5a636e')+'">'+(coil?'RUN':'STOP')+'</text>'
      +'<text x="'+(w/2)+'" y="'+(h*0.74)+'" class="comp-sub">VFD</text>'; break;
    case 'source': f='<text x="'+(w/2)+'" y="'+(h*0.5)+'" class="comp-label">'+esc(c.volts||'')+'</text>'
      +'<text x="'+(w/2)+'" y="'+(h*0.72)+'" class="comp-sub">'+((c.phases||1)===3?'3\u00d8':'1\u00d8')+'</text>'; break;
    case 'plcIn': case 'plcOut': f='<text x="'+(w/2)+'" y="'+(h*0.64)+'" class="comp-sub">PLC</text>'+led((on||c.state==='on')?'#22c55e':'#3a3a3a'); break;
    case 'term': { const rows=Math.max(2,Math.floor(h/13)); let r=''; for(let i=0;i<rows;i++)r+='<circle cx="'+(w/2)+'" cy="'+(9+i*13)+'" r="2.6" fill="#0d1117" stroke="#8a8a8a"/>'; f=r; break; }
    case 'light': f='<circle cx="'+(w/2)+'" cy="'+(h/2)+'" r="'+(Math.min(w,h)/2-6)+'" fill="'+(on?sanColor(c.color,'#facc15'):'#333')+'" stroke="#111"/>'; break;
    case 'estop': f='<circle cx="'+(w/2)+'" cy="'+(h/2)+'" r="'+(Math.min(w,h)/2-5)+'" fill="'+(c.state==='open'?'#7f1d1d':'#dc2626')+'" stroke="#500"/><text x="'+(w/2)+'" y="'+(h/2+3)+'" class="comp-sub" style="fill:#fff">STOP</text>'; break;
    case 'pbNO': case 'pbNC': case 'selector': case 'sensor':
      f='<circle cx="'+(w/2)+'" cy="'+(h/2)+'" r="'+(Math.min(w,h)/2-6)+'" fill="'+((c._on||c.state==='closed')?'#16a34a':'#374151')+'" stroke="#111"/>'; break;
    case 'motor': f='<circle cx="'+(w/2)+'" cy="'+(h/2-4)+'" r="13" fill="none" stroke="#c9d1d9" stroke-width="2"/>'
      +'<text x="'+(w/2)+'" y="'+(h/2)+'" class="comp-label '+(on?'lit':'')+'">M</text>'
      +'<text x="'+(w/2)+'" y="'+(h-4)+'" class="comp-sub" style="fill:#8b949e">FIELD</text>'; break;
    default: f='<text x="'+(w/2)+'" y="'+(h*0.55)+'" class="comp-sub">'+esc(c.type)+'</text>';
  }
  return frame+f+tag;
}
function photoMarker(c,onPath){ var w=c.phys.w,h=c.phys.h; var isSel=(sel===c);
  var col=c.fault?"#ef4444":(mode==="sim"&&anyEnerg(c))?"#22c55e":"#38bdf8";
  if(onPath&&!isSel) col="#f5a524";
  var fillOp=isSel?0.22:(onPath?0.15:0.08), sw=isSel?2.6:(onPath?2:1), sOp=isSel?1:(onPath?0.92:0.4);
  var out=`<rect x="0" y="0" width="`+w+`" height="`+h+`" rx="5" fill="`+col+`" fill-opacity="`+fillOp+`" stroke="`+col+`" stroke-opacity="`+sOp+`" stroke-width="`+sw+`"/>`;
  if(isSel){ var lab=String(c.label||c.type); var cw=Math.max(w, lab.length*6.2+12);
    out+=`<rect x="0" y="`+(h+2)+`" width="`+cw+`" height="16" rx="3" fill="#0b0e13" opacity="0.92" stroke="`+col+`" stroke-width="1"/>`+`<text x="5" y="`+(h+13.5)+`" style="fill:#e6edf3;font:700 10.5px system-ui,-apple-system,sans-serif;text-anchor:start">`+esc(lab)+`</text>`; }
    if(isSel&&mode==="build"){ var hd=[["nw",0,0],["ne",w,0],["sw",0,h],["se",w,h]]; out+=hd.map(function(H){ return `<rect class="physhandle" data-h="`+H[0]+`" x="`+(H[1]-6)+`" y="`+(H[2]-6)+`" width="12" height="12" rx="2"/>`; }).join(""); }
  return out;
}
function _physPathIds(){ var ids=new Set(); if(!sel)return ids; var d=compDef(sel); if(!d||!(d.load||d.coil))return ids; try{ var r=diagnose(sel,true); (r.path||[]).forEach(function(p){ ids.add(p.comp.id); }); }catch(e){} return ids; }
function copyPhysCoords(){ var arr=PANEL.components.filter(function(c){return c.phys;}).map(function(c){ return {id:c.id, label:c.label||"", phys:{x:c.phys.x,y:c.phys.y,w:c.phys.w,h:c.phys.h}}; });
  var txt=JSON.stringify({panel:PANEL.name||"", pw:PANEL.pw, ph:PANEL.ph, markers:arr});
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(function(){ toast(arr.length+" marker coords copied \u2014 paste to share"); }, function(){ _copyFallback(txt); }); } else { _copyFallback(txt); }
}
function _copyFallback(txt){ try{ var ta=document.createElement("textarea"); ta.value=txt; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); toast("Marker coords copied"); }catch(e){ prompt("Copy these marker coordinates:", txt); } }
function fillPhysPick(){ var pp=$("#physpick"); if(!pp)return; pp.hidden=(viewMode!=="phys"); var _cc=$("#physcopy"); if(_cc)_cc.hidden=(viewMode!=="phys"); if(viewMode!=="phys")return;
  pp.innerHTML=`<option value="">\u25be Select a part\u2026</option>`+PANEL.components.map(function(c){ return `<option value="`+esc(c.id)+`"`+(sel===c?" selected":"")+`>`+esc(c.label||compDef(c).name)+`</option>`; }).join("");
}
function physBody(){ autoPhys();
  let s='<defs>'
    +'<linearGradient id="pan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d4650"/><stop offset=".5" stop-color="#2c333c"/><stop offset="1" stop-color="#222831"/></linearGradient>'
    +'<pattern id="perf" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="1.7" fill="#05070a" opacity=".5"/><circle cx="6" cy="5.2" r="1.3" fill="#4a535f" opacity=".55"/></pattern>'
    +'<linearGradient id="rail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d959f"/><stop offset=".28" stop-color="#c8d0d8"/><stop offset=".55" stop-color="#828a94"/><stop offset="1" stop-color="#565d67"/></linearGradient></defs>';
  if(PANEL.photo){ var _po=Math.max(.15,($('#opacity')?(+$('#opacity').value)/100:.9)), _pw=1000, _ph=(PANEL.pw&&PANEL.ph)?Math.round(_pw*PANEL.ph/PANEL.pw):1300;
    s+='<rect x="-3000" y="-2200" width="9000" height="6400" fill="#0b0e13"/>';
    s+='<image href="'+esc(PANEL.photo)+'" x="16" y="8" width="'+_pw+'" height="'+_ph+'" opacity="'+_po+'" preserveAspectRatio="xMidYMid meet"/>';
  } else {
    s+='<rect x="-3000" y="-2200" width="9000" height="6400" fill="url(#pan)"/><rect x="-3000" y="-2200" width="9000" height="6400" fill="url(#perf)"/>';
    s+='<rect x="30" y="8" width="1080" height="82" rx="6" fill="#20252c" stroke="#3a424d"/><text x="46" y="24" class="comp-sub" style="fill:#8b949e;text-anchor:start">ENCLOSURE DOOR \u2014 OPERATORS</text>';
    RAILS.forEach(y=>{ s+='<rect x="20" y="'+(y-9)+'" width="1100" height="11" rx="2" fill="url(#rail)" opacity=".85"/>'
      +'<line x1="20" y1="'+(y-8)+'" x2="1120" y2="'+(y-8)+'" stroke="#eef2f5" stroke-width=".5" opacity=".35"/>'; });
  }
  if(sel&&sel.phys){ const cx=sel.phys.x+sel.phys.w/2, cy=sel.phys.y+sel.phys.h/2;
    wiredNeighbors(sel).forEach(n=>{ if(n.phys)s+='<line x1="'+cx+'" y1="'+cy+'" x2="'+(n.phys.x+n.phys.w/2)+'" y2="'+(n.phys.y+n.phys.h/2)+'" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="5 3" opacity=".75"/>'; }); }
  var _ppIds=(PANEL.photo?_physPathIds():new Set());
  PANEL.components.forEach(c=>{ const p=c.phys; const cls=['compbox','physmod'];
    if(sel===c)cls.push('sel'); if(mode==='sim'&&anyEnerg(c))cls.push('energized'); if(c.fault)cls.push('faulted');
    s+='<g class="'+cls.join(' ')+'" data-comp="'+c.id+'" transform="translate('+p.x+','+p.y+')"><rect class="selrect" x="-5" y="-5" width="'+(p.w+10)+'" height="'+(p.h+10)+'" rx="6"/>'+(PANEL.photo?photoMarker(c,_ppIds.has(c.id)):physModule(c))+'</g>'; });
  return s;
}
function physInfo(c){ if(!c)return''; const nb=wiredNeighbors(c).map(n=>n.label||n.id);
  const bad=broken(c);
  return '<div class="hint" style="margin:0 0 8px;padding:8px;border:1px solid var(--edge);border-radius:6px;background:var(--panel2)">'
    +'<b>'+esc(c.label||c.type)+'</b> \u2014 '+compDef(c).name+'<br>'
    +'Live: <b style="color:'+(anyEnerg(c)?'var(--live)':'var(--dim)')+'">'+(anyEnerg(c)?'ENERGIZED':'\u2014')+'</b>'
    +(bad?' \u00b7 <span style="color:var(--warn)">'+esc(bad)+'</span>':'')+'<br>'
    +'<span style="color:var(--dim)">Wired to:</span> '+(nb.map(esc).join(', ')||'(nothing)')+'</div>'; }
function applyView(){ if(typeof fillPhysPick==="function")fillPhysPick(); const dim=(mode==='sim'); const l=document.getElementById('left');
  if(l){ l.style.opacity=dim?'.4':'1'; l.style.pointerEvents=dim?'none':'auto'; } }

function _applyPhotoView(){ var bv=$("#btnView"); if(PANEL&&PANEL.photo){ viewMode="phys"; var op=$("#opacity"); if(op&&(+op.value)<80)op.value=92; if(bv){ bv.classList.add("on"); bv.innerHTML="&#128268; Schematic"; } } else { viewMode="sch"; if(bv){ bv.classList.remove("on"); bv.innerHTML="&#128452; Physical"; } } }
function initLibrary(){ const sel=$('#libsel'); if(!sel)return; const lib=window.PANEL_LIBRARY;
  if(!lib||!Object.keys(lib).length){ sel.style.display='none'; return; }
  sel.style.display='';
  sel.innerHTML='<option value="">▾ Panel library ('+Object.keys(lib).length+')</option>'+Object.keys(lib).map(k=>'<option value="'+esc(k)+'">'+esc(k)+'</option>').join('');
  sel.onchange=()=>{ const k=sel.value; if(!k){return;} PANEL=JSON.parse(JSON.stringify(lib[k]));
    restoreUid(); sel.selectedIndex=0; $('#stat').textContent=k;
    const s2=$('#libsel'); if(s2)s2.blur();
    persist(); applyEnc(); _applyPhotoView(); applyView(); render(); renderInspector(); toast('Loaded: '+k); };
}
/* ---------- init ---------- */
function init(){ $('#ver').textContent='v'+VERSION;
  const _h=applyHash();
  if(window._aetBack){ try{ const _bk=document.createElement('a'); _bk.href='AET_Academy.html#module/'+window._aetBack; _bk.textContent='\u2190 Back to AET Academy'; _bk.style.cssText='position:fixed;left:12px;bottom:12px;z-index:99999;background:#38bdf8;color:#04121c;padding:7px 13px;border-radius:7px;text-decoration:none;font:600 .8rem system-ui;box-shadow:0 2px 10px rgba(0,0,0,.4)'; document.body.appendChild(_bk);}catch(e){} }
  if(_h){ $('#stat').textContent=_h==='lib'?'shared (library)':'shared link'; }
  else if(!restore()){ PANEL=demoPanel(); $('#stat').textContent='demo panel'; } else { $('#stat').textContent='restored'; }
  try{encOn=localStorage.getItem('pt_enc')!=='0';}catch(e){}
  const be=$('#btnEnc'); if(be)be.onclick=()=>{encOn=!encOn;try{localStorage.setItem('pt_enc',encOn?'1':'0');}catch(e){}applyEnc();render();};
  const bv=$('#btnView'); if(bv)bv.onclick=()=>{ viewMode=viewMode==='phys'?'sch':'phys';
    bv.classList.toggle('on',viewMode==='phys'); bv.innerHTML=viewMode==='phys'?'&#128268; Schematic':'&#128452; Physical';
    sel=null;selWire=null; applyView(); render(); renderInspector(); };
  buildPalette(); setMode('build'); applyEnc(); _applyPhotoView(); applyView(); render(); renderInspector();
  var _cpc=$("#physcopy"); if(_cpc)_cpc.onclick=copyPhysCoords;
  var _pk=$("#physpick"); if(_pk)_pk.onchange=function(){ var c=findComp(_pk.value); sel=c||null; selWire=null; render(); renderInspector(); if(c&&typeof centerOn==="function")centerOn(c); };
  initLibrary();
  initExtras();
  initExtras2();
  initExtras3();
  initExtras4();
  if(bootSim) setMode('sim');
  window.addEventListener('resize',render);
}
init();

/* =========================================================================
   ELECTRON WRANGLER — EXTRAS (features 1-13). All top-level fn decls hoist.
   ========================================================================= */

/* ---------- feature 1: panel-wide "What's dead?" ---------- */
function panelReport(){ solve();
  const loads=PANEL.components.filter(c=>{const d=compDef(c);return d.load||d.coil;});
  const dead=loads.filter(c=>!c._on).map(c=>{ const r=diagnose(c); const top=r.suspects&&r.suspects[0];
    return {c, reason:!r.ok?r.msg:(top?top.label+' — '+top.why:'path intact — check source/load')}; });
  return {total:loads.length, dead}; }
function showPanelReport(){ const box=$('#simextra'); if(!box)return; const r=panelReport();
  if(!r.dead.length){ box.innerHTML='<div class="hint" style="color:var(--ok);margin-top:6px">All '+r.total+' load(s)/coil(s) energized. Nothing dead.</div>'; return; }
  box.innerHTML='<div class="hint" style="margin:8px 0 4px">'+r.dead.length+' of '+r.total+' dead — closest fault first:</div>'+
    r.dead.map(d=>'<div class="suspect" data-id="'+d.c.id+'"><b>'+esc(d.c.label||compDef(d.c).name)+'</b><br>'+esc(d.reason)+'</div>').join('');
  box.querySelectorAll('.suspect').forEach(el=>el.onclick=()=>{ sel=findComp(el.dataset.id); render(); flash(el.dataset.id); renderSimInspector(); });
}

/* ---------- feature 2: meter probe ---------- */
function addProbe(k){ if(probes.length>=2) probes=[]; probes.push(k); render(); renderSimInspector(); }
function probeVoltage(){ if(probes.length<2)return null; solve();
  const uf=solve._uf, isHot=solve._isHot, isRet=solve._isRet; if(!uf)return null;
  const [a,b]=probes; const ra=uf.find(a), rb=uf.find(b);
  const num=s=>{ const m=String(s||'').match(/(\d+(?:\.\d+)?)/); return m?+m[1]:0; };
  const nomFor=k=>{ let v=0; PANEL.components.forEach(c=>{ if(c.type==='source') termList(c).forEach(t=>{ if(uf.find(c.id+'|'+t.id)===uf.find(k)) v=Math.max(v,num(c.volts)); }); });
    if(!v){ PANEL.components.forEach(c=>{ if(c.type==='source') v=Math.max(v,num(c.volts)); }); } return v; };
  const _V=solve._hotV||{}, _P=solve._phaseOf||{};
  const legAt=k=>{ const r=uf.find(k); return _V[r]||nomFor(k); };
  const phAt=k=>_P[uf.find(k)]||new Set();
  const diffLeg=(x,y)=>{ const pa=phAt(x),pb=phAt(y); let d=false; pa.forEach(z=>{if(!pb.has(z))d=true;}); pb.forEach(z=>{if(!pa.has(z))d=true;}); return d; };
  for(var _mi=0;_mi<PANEL.components.length;_mi++){ var _mc=PANEL.components[_mi];
    if(_mc._mwbcV==null)continue; var _mt=termList(_mc); if(_mt.length<2)continue;
    var _mka=uf.find(_mc.id+'|'+_mt[0].id), _mkb=uf.find(_mc.id+'|'+_mt[1].id);
    if((_mka===ra&&_mkb===rb)||(_mka===rb&&_mkb===ra)) return {v:_mc._mwbcV,txt:_mc._mwbcV+' V (MWBC series \u2014 open shared neutral!)'}; }
  if(ra===rb) return {v:0,txt:'0 V \u2014 same node'};
  const ha=isHot(a),hb=isHot(b),rta=isRet(a),rtb=isRet(b);
  const liveA=ha||rta, liveB=hb||rtb;
  if((ha&&rtb)||(rta&&hb)){ const nv=legAt(ha?a:b); return {v:nv,txt:nv+' V (hot to neutral)'}; }
  if(ha&&hb){ if(diffLeg(a,b)){ const nv=legAt(a)+legAt(b); return {v:nv,txt:nv+' V (across both legs — 240 V)'}; } return {v:0,txt:'~0 V (both HOT / same leg)'}; }
  if(rta&&rtb) return {v:0,txt:'0 V (both NEUTRAL/return)'};
  if(liveA&&!liveB){ const nv=legAt(a); return {v:nv,txt:nv+' V (open circuit — B is dead)'}; }
  if(liveB&&!liveA){ const nv=legAt(b); return {v:nv,txt:nv+' V (open circuit — A is dead)'}; }
  return {v:0,txt:'0 V (both de-energized)'};
}
/* ---------- multimeter (DMM): V(auto AC/DC) / ohms / continuity / amps ---------- */
function _fmtOhm(R){ if(!isFinite(R))return 'OL'; return R>=1000?(R/1000).toFixed(R>=100000?0:1)+' k\u03a9':R.toFixed(R<10?1:0)+' \u03a9'; }
function _windingR(c){ var V=_numVolt(c.volts)||(compDef(c).psu?24:120), W=+c.watts||0;
  if(c.type==='motor'){ var hp=+c.hp||1; return Math.max(0.4, 6/hp); }
  if(W>0) return (V*V)/W;
  if(c.type==='light') return (V*V)/60;
  if(c.type==='horn') return (V*V)/15;
  if(c.type==='solenoid'||c.type==='relay'||c.type==='contactor'||c.type==='safetyRelay') return 180;
  return (V*V)/40; }
function _ratedAmps(c){ var V=_numVolt(c.volts)||120;
  if(c.type==='motor'){ var hp=+c.hp||1, w=hp*746, ph=c.phases||3; return ph===3? w/(1.732*V*0.85) : w/(V*0.8); }
  var W=+c.watts||(c.type==='light'?60:c.type==='horn'?15:c.type==='solenoid'?12:20); return W/V; }
function _ohmResolve(){ if(probes.length<2)return null; var uf=new UF(), key=function(c,t){return c.id+'|'+t;};
  PANEL.wires.forEach(function(w){ if(!w.cut)uf.union(w.a,w.b); });
  PANEL.components.forEach(function(c){ compDef(c).links(c).forEach(function(pr){ uf.union(key(c,pr[0]),key(c,pr[1])); }); });
  var a=probes[0], b=probes[1], ra=uf.find(a), rb=uf.find(b);
  if(ra===rb){ var hiz=PANEL.components.some(function(c){ return c.hiZ&&compDef(c).links(c).length&&termList(c).some(function(t){ return uf.find(key(c,t.id))===ra; }); });
    return {kind:hiz?'hiz':'short', R:hiz?9999:0.2}; }
  var span=null;
  PANEL.components.forEach(function(c){ var d=compDef(c); if(!(d.load||d.coil))return; var ts=termList(c); if(ts.length<2)return;
    var k0=uf.find(key(c,ts[0].id)), k1=uf.find(key(c,ts[1].id));
    if((k0===ra&&k1===rb)||(k0===rb&&k1===ra)) span=c; });
  if(span) return {kind:'winding', R:_windingR(span), comp:span};
  return {kind:'open', R:Infinity}; }
function _dmmKindAt(k){ solve(); var uf=solve._uf, nk=solve._nodeKind||{}; if(!uf)return ''; return nk[uf.find(k)]||''; }
function _dmmRead(){ if(probes.length<2) return {big:'- - - -', sub:'place both leads (A then B)'};
  solve(); var fn=meterFn;
  if(fn==='ohms'||fn==='cont'){ var o=_ohmResolve(); if(!o)return {big:'- - - -',sub:'place both leads'};
    if(fn==='cont'){ if(o.kind==='short') return {big:'\u266a BEEP', sub:'continuity \u2014 good path (~0 \u03a9)'};
      if(o.kind==='hiz') return {big:'( no beep )', sub:'continuity but HIGH-R \u2014 loose/corroded joint'};
      if(o.kind==='winding') return {big:(o.R<50?'\u266a beep':'( no beep )'), sub:'reads '+_fmtOhm(o.R)+' through '+(o.comp.label||compDef(o.comp).name)+' winding (not a short)'};
      return {big:'OL', sub:'OPEN \u2014 no continuity (broken path / open device)'}; }
    if(o.kind==='short') return {big:'0.2 \u03a9', sub:'good path \u2014 closed contact / wire'};
    if(o.kind==='hiz') return {big:'~ hi \u03a9', sub:'elevated resistance \u2014 loose/corroded joint'};
    if(o.kind==='winding') return {big:_fmtOhm(o.R), sub:'reading through '+(o.comp.label||compDef(o.comp).name)+' winding'};
    return {big:'OL', sub:'OPEN \u2014 infinite \u03a9 (broken path / open device)'}; }
  if(fn==='amps'){ var pc=null; [probes[1],probes[0]].forEach(function(pk){ if(pc)return; var c=findComp(pk.split('|')[0]); if(c&&compDef(c).load) pc=c; });
    if(!pc) return {big:'0.00 A', sub:'clamp a single load conductor'};
    if(!pc._on) return {big:'0.00 A', sub:(pc.label||compDef(pc).name)+' is de-energized'};
    var I=_ratedAmps(pc); return {big:I.toFixed(I<10?2:1)+' A', sub:'running current \u2014 '+(pc.label||compDef(pc).name)}; }
  var r=probeVoltage(); if(!r) return {big:'- - - -', sub:'place both leads'};
  var K=_dmmKindAt(probes[0])||_dmmKindAt(probes[1])||'';
  var lab=K==='dc'?'VDC':K==='ac'?'VAC':'V', v=r.v||0;
  return {big:(v>0&&v<10?v.toFixed(1):Math.round(v))+' '+lab, sub:r.txt}; }
function renderMeter(){ var box=$('#simextra'); if(!box)return;
  var FN=[['volts','V','auto AC/DC volts (live)'],['ohms','\u03a9','resistance (de-energize first)'],['cont','\u30fb\u30fb\u30fb','continuity beep (dead test)'],['amps','A','clamp current (live)']];
  var rd=_dmmRead();
  var h='<div style="display:flex;gap:4px;margin:6px 0">'+FN.map(function(f){ return '<button class="tbtn'+(meterFn===f[0]?' on':'')+'" data-fn="'+f[0]+'" title="'+f[2]+'" style="flex:1;padding:6px 0;font-weight:800">'+f[1]+'</button>'; }).join('')+'</div>';
  h+='<div style="background:#0a1a0a;border:2px solid #1f3a1f;border-radius:8px;padding:10px 12px;margin-bottom:6px;font-family:ui-monospace,Consolas,monospace">'
    +'<div style="color:#39ff14;font-size:24px;font-weight:800;letter-spacing:1px;text-shadow:0 0 6px rgba(57,255,20,.45)">'+esc(rd.big)+'</div>'
    +'<div style="color:#8fbf8f;font-size:11px;margin-top:3px;line-height:1.3">'+esc(rd.sub||'')+'</div></div>';
  h+='<div class="hint" style="margin:2px 0">Leads: click terminal <b style="color:#ff5b4a">A</b> then <b style="color:#38bdf8">B</b>'+(meterFn==='amps'?' (clamp = click the load conductor)':'')+'.</div>';
  if(probes.length) h+='<div class="hint">\ud83d\udd34 A: '+esc(probes[0])+(probes[1]?'<br>\ud83d\udd35 B: '+esc(probes[1]):'')+'</div>';
  if(meterFn==='ohms'||meterFn==='cont') h+='<div class="hint" style="color:var(--warn)">\u26a0 De-energize / LOTO before ohms or continuity testing.</div>';
  h+='<button class="tbtn" id="mt-log" style="width:100%;margin-top:4px">\ud83d\udcdd Log this reading</button>';
  if(probes.length) h+='<button class="tbtn" id="mt-clr" style="width:100%;margin-top:4px">Clear leads</button>';
  box.innerHTML=h;
  box.querySelectorAll('[data-fn]').forEach(function(b){ b.onclick=function(){ meterFn=b.dataset.fn; renderSimInspector(); }; });
  var cl=$('#mt-clr'); if(cl)cl.onclick=function(){ probes=[]; render(); renderSimInspector(); };
  var lg=$('#mt-log'); if(lg)lg.onclick=function(){ if(probes.length){ logMeasure(probes[probes.length-1]); } else toast('Place a lead first'); };
}

/* ---------- feature 3: hover live-path highlight ---------- */
function computeHover(){ hoverData=null; if(!hoverComp)return; const c=findComp(hoverComp); if(!c)return;
  const adj={}, add=(a,b,ref)=>{ (adj[a]=adj[a]||[]).push({n:b,ref}); (adj[b]=adj[b]||[]).push({n:a,ref}); };
  const key=(cc,t)=>cc.id+'|'+t;
  PANEL.wires.forEach(w=>{ if(!w.cut) add(w.a,w.b,{wire:w.id}); });
  PANEL.components.forEach(cc=>{ compDef(cc).links(cc).forEach(([x,y])=>add(key(cc,x),key(cc,y),{comp:cc.id})); });
  const srcSet=new Set(); PANEL.components.forEach(cc=>termList(cc).forEach(t=>{ if(t.rail==='hot')srcSet.add(key(cc,t.id)); }));
  const starts=termList(c).map(t=>key(c,t.id));
  const q=starts.map(s=>[s,[]]); const seen=new Set(starts); let path=null;
  while(q.length){ const[n,pth]=q.shift(); if(srcSet.has(n)){path=pth;break;}
    (adj[n]||[]).forEach(e=>{ if(!seen.has(e.n)){ seen.add(e.n); q.push([e.n,pth.concat([e.ref])]); } }); }
  if(!path)return; const wires=new Set(), comps=new Set();
  path.forEach(r=>{ if(r.wire)wires.add(r.wire); if(r.comp)comps.add(r.comp); });
  comps.add(c.id); hoverData={wires,comps};
}

/* ---------- feature 4: quiz / fault-inject ---------- */
function startQuiz(){ solve();
  const running=PANEL.components.filter(c=>{const d=compDef(c);return (d.load||d.coil)&&c._on;});
  if(!running.length){ toast('Quiz needs a running panel — energize something first'); return; }
  const faultables=PANEL.components.filter(c=>['breaker','disc','fuse','overload','estop','pbNC','selector','sensor'].includes(c.type));
  if(!faultables.length){ toast('No faultable devices in this panel'); return; }
  quiz={ saved: PANEL.components.map(c=>({id:c.id,state:c.state,fault:c.fault})), target:null, answered:false };
  const t=faultables[Math.floor(Math.random()*faultables.length)];
  if(t.type==='breaker') t.state='tripped';
  else if(t.type==='fuse') t.state='blown';
  else if(t.type==='overload') t.state='tripped';
  else if(compDef(t).states) t.state=compDef(t).states.find(s=>s!==t.state)||t.state;
  else t.fault=true;
  quiz.target=t.id; sel=null; solve(); render(); renderSimInspector();
  toast('\ud83c\udf93 Fault injected — trace it! Click device you suspect, then Check.');
}
function quizGuess(){ if(!quiz||!sel){ toast('Select the device you suspect first'); return; }
  quiz.answered=true; const ok=sel.id===quiz.target;
  toast(ok?'\u2705 Correct — that is the injected fault!':'\u274c Not it — keep tracing the dead path.');
  renderSimInspector();
}
function quizReveal(){ if(!quiz)return; sel=findComp(quiz.target); render(); flash(quiz.target); renderSimInspector(); }
function quizEnd(){ if(!quiz)return; quiz.saved.forEach(s=>{ const c=findComp(s.id); if(c){ c.state=s.state; c.fault=s.fault; } });
  quiz=null; solve(); render(); renderSimInspector();
}

/* ---------- feature 5: search / jump-to ---------- */
function jumpTo(q){ q=(q||'').trim().toLowerCase(); if(!q)return;
  const list=PANEL.components;
  const c = list.find(c=>(c.label||'').toLowerCase()===q)
        || list.find(c=>(c.label||'').toLowerCase().includes(q))
        || list.find(c=>c.id.toLowerCase().includes(q))
        || list.find(c=>compDef(c).name.toLowerCase().includes(q));
  if(!c){ toast('No match: '+q); return; }
  centerOn(c); sel=c; selWire=null; render(); renderInspector(); flash(c.id);
}
function centerOn(c){ const d=compDef(c); const W=svg.clientWidth,H=svg.clientHeight; const ph=viewMode==='phys';
  const bx=ph&&c.phys?c.phys.x:c.x, by=ph&&c.phys?c.phys.y:c.y;
  const bw=ph&&c.phys?c.phys.w:d.w, bh=ph&&c.phys?c.phys.h:d.h;
  view.k=Math.max(.6,Math.min(2,view.k));
  view.x=W/2-(bx+bw/2)*view.k; view.y=H/2-(by+bh/2)*view.k;
}

/* ---------- feature 6: BOM ---------- */
function buildBOM(){ if(mode==='sim')solve();
  const rows=PANEL.components.slice().sort((a,b)=>(a.label||a.id).localeCompare(b.label||b.id)).map(c=>{
    const d=compDef(c);
    const rating=[c.volts, c.poles?c.poles+'P':'', c.phases?c.phases+'ph':''].filter(Boolean).join(' ');
    const state=c.state||(d.load||d.coil?(c._on?'energized':'dead'):'');
    return '<tr><td>'+esc(c.label||'—')+'</td><td>'+esc(d.name)+'</td><td>'+esc(rating||'—')+'</td><td>'+esc(state||'—')+'</td><td>'+esc(c.note||'')+'</td></tr>';
  }).join('');
  return '<table class="bom"><thead><tr><th>Tag</th><th>Type</th><th>Rating</th><th>State</th><th>Note</th></tr></thead><tbody>'+rows+'</tbody></table>';
}
function exportBomCsv(){ const rows=[['Tag','Type','Rating','State','Note']];
  PANEL.components.forEach(c=>{ const d=compDef(c);
    const rating=[c.volts, c.poles?c.poles+'P':'', c.phases?c.phases+'ph':''].filter(Boolean).join(' ');
    rows.push([c.label||'', d.name, rating, c.state||'', c.note||'']); });
  const csv=rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  dl(new Blob([csv],{type:'text/csv'}), (PANEL.name||'panel')+'_BOM.csv');
}

/* ---------- feature 8: cross-panel jump ---------- */
function loadLibPanel(name){ const lib=window.PANEL_LIBRARY;
  if(!lib||!lib[name]){ toast('Panel not in library: '+name); return; }
  PANEL=JSON.parse(JSON.stringify(lib[name])); restoreUid(); sel=null; selWire=null; persist();
  applyEnc(); if(typeof applyView==='function')applyView(); render(); renderInspector(); toast('Loaded: '+name);
}

/* ---------- feature 9: export SVG/PNG + print ---------- */
function dl(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
const EXPORT_CSS = `
.sym{fill:none;stroke:#c9d1d9;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.sym.fillbody{fill:#161b22}
.wire{fill:none;stroke:#5c6470;stroke-width:2.4;stroke-linecap:round}
.wire.live{stroke:#facc15}
.wire.cut{stroke:#f97316;stroke-dasharray:3 4}
.wire.hover{stroke:#22c55e;stroke-width:3.4}
.energized .sym{stroke:#facc15}
.hoverpath .sym{stroke:#22c55e}
.faulted .sym{stroke:#f97316;stroke-dasharray:3 2}
.lit{fill:#facc15}
.comp-label{fill:#e6edf3;font:9px 'Segoe UI',sans-serif;text-anchor:middle}
.comp-sub{fill:#8b949e;font:7px 'Segoe UI',sans-serif;text-anchor:middle}
.motorbody{fill:#161b22}.lampbody{fill:#374151}.coilind{fill:#30363d}
.term{fill:#0d1117;stroke:#7d8590;stroke-width:1.4}
.wireno{fill:#eab308;font:bold 8px 'Segoe UI',sans-serif;text-anchor:middle}
.notepin{font:11px 'Segoe UI',sans-serif}
.xlink{fill:#38bdf8;font:8px 'Segoe UI',sans-serif;text-anchor:middle}
.selrect{fill:none}
`;
function contentBounds(){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; const ph=viewMode==='phys';
  PANEL.components.forEach(c=>{ const d=compDef(c);
    const bx=ph&&c.phys?c.phys.x:c.x, by=ph&&c.phys?c.phys.y:c.y;
    const bw=ph&&c.phys?c.phys.w:d.w, bh=ph&&c.phys?c.phys.h:d.h;
    x0=Math.min(x0,bx); y0=Math.min(y0,by); x1=Math.max(x1,bx+bw); y1=Math.max(y1,by+bh+20); });
  if(x0>x1){ x0=y0=0; x1=800; y1=600; }
  const pad=40; return {x:x0-pad, y:y0-pad, w:(x1-x0)+pad*2, h:(y1-y0)+pad*2};
}
function serializeSvg(){ const b=contentBounds();
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+b.x+' '+b.y+' '+b.w+' '+b.h+'" width="'+Math.round(b.w)+'" height="'+Math.round(b.h)+'">'
    +'<style>'+EXPORT_CSS+'</style>'
    +'<rect x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" fill="#0d1117"/>'
    +svg.innerHTML+titleBlock(b)+'</svg>';
}
function exportSVG(){ dl(new Blob([serializeSvg()],{type:'image/svg+xml'}), (PANEL.name||'panel')+'.svg'); toast('SVG exported'); }
function exportPNG(){ const s=serializeSvg(); const b=contentBounds();
  const img=new Image(); const url='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(s)));
  img.onload=()=>{ const cv=document.createElement('canvas'); cv.width=Math.round(b.w*2); cv.height=Math.round(b.h*2);
    const ctx=cv.getContext('2d'); ctx.fillStyle='#0d1117'; ctx.fillRect(0,0,cv.width,cv.height);
    ctx.drawImage(img,0,0,cv.width,cv.height);
    cv.toBlob(bl=>{ dl(bl,(PANEL.name||'panel')+'.png'); toast('PNG exported'); }); };
  img.onerror=()=>toast('PNG export failed'); img.src=url;
}
function printPanel(){ const w=window.open('','_blank'); if(!w){ toast('Popup blocked — allow popups'); return; }
  w.document.write('<!doctype html><meta charset="utf-8"><title>'+esc(PANEL.name||'Panel')+'</title>'
    +'<style>body{margin:0;background:#0d1117}svg{width:100%;height:auto;display:block}</style>'
    +serializeSvg());
  w.document.close(); w.focus(); setTimeout(()=>w.print(),400);
}

/* ---------- feature 10: deep-link + QR ---------- */
function shareLink(){ const json=JSON.stringify(PANEL);
  const b64=btoa(unescape(encodeURIComponent(json)));
  return location.href.split('#')[0]+'#p='+b64;
}
function shortLibLink(){ const lib=window.PANEL_LIBRARY; if(!lib||!lib[PANEL.name])return null;
  const st=PANEL.components.filter(c=>c.state||c.fault).map(c=>c.id+'~'+(c.state||'')+(c.fault?'!':'')).join(';');
  return location.href.split('#')[0]+'#lib='+encodeURIComponent(PANEL.name)+(st?'&s='+encodeURIComponent(st):'');
}
function applyHash(){ const h=location.hash;
  let m=h.match(/#p=(.+)$/);
  if(m){ try{ const json=decodeURIComponent(escape(atob(m[1]))); PANEL=validatePanel(JSON.parse(json)); restoreUid(); return 'full'; }catch(e){return false;} }
  m=h.match(/#lib=(.+)$/);
  if(m){ const lib=window.PANEL_LIBRARY; const parts=m[1].split('&');
    const name=decodeURIComponent(parts[0]); let sTok=null, aet=null;
    parts.slice(1).forEach(p=>{ if(p.indexOf('s=')===0)sTok=p.slice(2); else if(p.indexOf('aet=')===0)aet=p.slice(4); });
    if(lib&&lib[name]){ PANEL=JSON.parse(JSON.stringify(lib[name])); restoreUid();
      if(sTok){ decodeURIComponent(sTok).split(';').forEach(tok=>{ const mm=tok.match(/^(.+)~([^!]*)(!)?$/);
        if(mm){ const c=findComp(mm[1]); if(c){ if(mm[2])c.state=mm[2]; c.fault=!!mm[3]; } } }); }
      if(aet!=null){ try{ window._aetBack=decodeURIComponent(aet); }catch(e){ window._aetBack=aet; } }
      bootSim=true; return 'lib'; } }
  return false;
}
function showQR(){ const url=shortLibLink();
  if(!url){ $('#toolout').innerHTML='<div class="hint" style="color:var(--warn)">QR needs a library panel (saved by name). Use \ud83d\udd17 Copy share link for custom panels.</div>'; return; }
  try{ const svgTxt=QR.svg(url,4);
    $('#toolout').innerHTML='<div style="background:#fff;display:inline-block;padding:10px;border-radius:6px">'+svgTxt+'</div>'
      +'<div class="hint" style="margin-top:8px">Scan to open <b>'+esc(PANEL.name)+'</b> with current switch states.</div>'
      +'<textarea rows="2" readonly style="width:100%;margin-top:6px">'+esc(url)+'</textarea>'; }
  catch(e){ $('#toolout').innerHTML='<div class="hint" style="color:var(--warn)">'+esc(e.message)+' — use Copy share link instead.</div>'
      +'<textarea rows="2" readonly style="width:100%;margin-top:6px">'+esc(url)+'</textarea>'; }
}

/* ---------- feature 10 (cont): self-contained QR generator
   byte mode, ECC-L, versions 1-5, fixed mask 0 (spec-compliant).
   Format-info placement per Nayuki reference.
   ---------------------------------------------------------------- */
const QR=(function(){
  const EXP=new Array(512), LOG=new Array(256);
  (function(){ let x=1; for(let i=0;i<255;i++){ EXP[i]=x; LOG[x]=i; x<<=1; if(x&0x100)x^=0x11d; }
    for(let i=255;i<512;i++)EXP[i]=EXP[i-255]; })();
  const gmul=(a,b)=>(a===0||b===0)?0:EXP[LOG[a]+LOG[b]];
  function genPoly(n){ let g=[1]; for(let i=0;i<n;i++){ const ng=new Array(g.length+1).fill(0);
    for(let j=0;j<g.length;j++){ ng[j]^=g[j]; ng[j+1]^=gmul(g[j],EXP[i]); } g=ng; } return g; }
  function ecc(data,n){ const g=genPoly(n); const res=data.concat(new Array(n).fill(0));
    for(let i=0;i<data.length;i++){ const c=res[i]; if(c!==0){ for(let j=0;j<g.length;j++) res[i+j]^=gmul(g[j],c); } }
    return res.slice(data.length); }
  const CAP={1:{d:19,e:7},2:{d:34,e:10},3:{d:55,e:15},4:{d:80,e:20},5:{d:108,e:26}};
  const ALIGN={2:18,3:22,4:26,5:30};
  const size=v=>17+4*v;
  function toBytes(text){ const b=[]; for(let i=0;i<text.length;i++){ const cc=text.charCodeAt(i);
    if(cc<128) b.push(cc);
    else { const e=unescape(encodeURIComponent(text.charAt(i))); for(let k=0;k<e.length;k++) b.push(e.charCodeAt(k)); } }
    return b; }
  function pickVersion(len){ for(let v=1;v<=5;v++){ if(Math.ceil((12+8*len)/8) <= CAP[v].d) return v; }
    throw new Error('QR: data too long ('+len+' bytes, max 106)'); }
  function encode(text){ const bytes=toBytes(text); const v=pickVersion(bytes.length); const cap=CAP[v];
    const bb=[]; const put=(val,len)=>{ for(let i=len-1;i>=0;i--) bb.push((val>>i)&1); };
    put(4,4); put(bytes.length,8); bytes.forEach(b=>put(b,8));
    const total=cap.d*8; put(0,Math.min(4,total-bb.length));
    while(bb.length%8) bb.push(0);
    const dc=[]; for(let i=0;i<bb.length;i+=8){ let b=0; for(let j=0;j<8;j++) b=(b<<1)|bb[i+j]; dc.push(b); }
    const pad=[0xEC,0x11]; let pi=0; while(dc.length<cap.d) dc.push(pad[pi++%2]);
    const ec=ecc(dc,cap.e);
    return {v, codewords:dc.concat(ec)};
  }
  function build(text){ const {v,codewords}=encode(text); const n=size(v);
    const m=[], rez=[]; for(let i=0;i<n;i++){ m.push(new Array(n).fill(0)); rez.push(new Array(n).fill(false)); }
    const setF=(r,c,val)=>{ if(r<0||c<0||r>=n||c>=n)return; m[r][c]=val; rez[r][c]=true; };
    function finder(r,c){ for(let dr=-1;dr<=7;dr++) for(let dc=-1;dc<=7;dc++){
      const rr=r+dr, cc=c+dc; if(rr<0||cc<0||rr>=n||cc>=n) continue;
      const inb=(dr>=0&&dr<=6&&(dc===0||dc===6)) || (dc>=0&&dc<=6&&(dr===0||dr===6)) || (dr>=2&&dr<=4&&dc>=2&&dc<=4);
      setF(rr,cc, inb?1:0); } }
    finder(0,0); finder(0,n-7); finder(n-7,0);
    for(let i=8;i<n-8;i++){ if(!rez[6][i]) setF(6,i, i%2===0?1:0); if(!rez[i][6]) setF(i,6, i%2===0?1:0); }
    if(ALIGN[v]!==undefined){ const a=ALIGN[v];
      for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++){
        const inb=Math.max(Math.abs(dr),Math.abs(dc)); setF(a+dr,a+dc,(inb===2||inb===0)?1:0); } }
    setF(n-8,8,1);
    // reserve format cells (finalize bits after masking)
    for(let i=0;i<=8;i++){ if(!rez[8][i]){ rez[8][i]=true; m[8][i]=0; } if(!rez[i][8]){ rez[i][8]=true; m[i][8]=0; } }
    for(let i=0;i<8;i++){ if(!rez[8][n-1-i]){ rez[8][n-1-i]=true; m[8][n-1-i]=0; } if(!rez[n-1-i][8]){ rez[n-1-i][8]=true; m[n-1-i][8]=0; } }
    // data placement zigzag
    const bits=[]; codewords.forEach(cw=>{ for(let i=7;i>=0;i--) bits.push((cw>>i)&1); });
    let bi=0, up=true;
    for(let col=n-1;col>0;col-=2){ if(col===6) col--;
      for(let k=0;k<n;k++){ const row=up?n-1-k:k;
        for(let c2=0;c2<2;c2++){ const cc=col-c2; if(rez[row][cc]) continue;
          const dv = bi<bits.length ? bits[bi++] : 0;
          m[row][cc] = dv; } }
      up=!up;
    }
    // apply mask 0 to data (non-reserved) cells
    for(let r=0;r<n;r++) for(let c=0;c<n;c++){ if(!rez[r][c] && (r+c)%2===0) m[r][c]^=1; }
    // format info: ECL=L (formatBits=1), mask=0 -> data5=(1<<3)|0=8
    const data5=8; let rem=data5<<10; const gpoly=0x537;
    for(let i=14;i>=10;i--){ if((rem>>i)&1) rem^=gpoly<<(i-10); }
    const fmt=((data5<<10)|rem)^0x5412;
    const gbit=i=>(fmt>>i)&1;
    // copy 1: around top-left finder
    for(let i=0;i<=5;i++) m[8][i]=gbit(i);
    m[8][7]=gbit(6); m[8][8]=gbit(7); m[7][8]=gbit(8);
    for(let i=9;i<15;i++) m[14-i][8]=gbit(i);
    // copy 2
    for(let i=0;i<8;i++) m[n-1-i][8]=gbit(i);
    for(let i=8;i<15;i++) m[8][n-15+i]=gbit(i);
    m[n-8][8]=1; // dark
    return m;
  }
  function svg(text,scale){ const m=build(text); const n=m.length; scale=scale||4; const q=4; const dim=(n+2*q)*scale;
    let r='<svg xmlns="http://www.w3.org/2000/svg" width="'+dim+'" height="'+dim+'" viewBox="0 0 '+dim+' '+dim+'"><rect width="'+dim+'" height="'+dim+'" fill="#fff"/><path fill="#000" d="';
    for(let y=0;y<n;y++) for(let x=0;x<n;x++){ if(m[y][x]){ const px=(x+q)*scale, py=(y+q)*scale;
      r+='M'+px+' '+py+'h'+scale+'v'+scale+'h-'+scale+'z'; } }
    return r+'"/></svg>';
  }
  return { build, svg };
})();

/* ---------- feature 11: E-Stop chain validator ---------- */
function validateSafety(){ const est=PANEL.components.filter(c=>c.type==='estop'); const issues=[];
  if(!est.length){ issues.push({lvl:'info',msg:'No E-Stop devices in this panel.'}); return {issues}; }
  const wiresAt=k=>PANEL.wires.filter(w=>!w.cut && (w.a===k||w.b===k));
  est.forEach(c=>{ termList(c).forEach(t=>{ const k=c.id+'|'+t.id; const ws=wiresAt(k);
    if(ws.length===0) issues.push({lvl:'warn', msg:(c.label||'E-Stop')+' terminal '+t.id+' is unwired — open safety loop.', ref:c.id});
    else if(ws.length>1) issues.push({lvl:'warn', msg:(c.label||'E-Stop')+' terminal '+t.id+' has '+ws.length+' wires — possible bypass tap on the safety string.', ref:c.id});
  }); });
  // series continuity: are estops all reachable through wires without going through non-safety loads?
  const idx={}; PANEL.wires.forEach(w=>{ if(w.cut)return; const a=w.a.split('|')[0],b=w.b.split('|')[0]; (idx[a]=idx[a]||new Set()).add(b); (idx[b]=idx[b]||new Set()).add(a); });
  const visited=new Set([est[0].id]); const q=[est[0].id];
  while(q.length){ const n=q.shift(); (idx[n]||new Set()).forEach(x=>{ if(!visited.has(x)){ visited.add(x); q.push(x); } }); }
  const disconnected=est.filter(c=>!visited.has(c.id));
  if(disconnected.length) issues.push({lvl:'warn', msg:disconnected.length+' E-Stop(s) not on the same wired string as '+(est[0].label||est[0].id)+' — verify they are actually in series.', ref:disconnected[0].id});
  if(!issues.length||issues.every(i=>i.lvl==='info')) issues.push({lvl:'ok', msg:'E-Stop string looks intact — '+est.length+' device(s), no bypass taps detected.'});
  return {issues};
}

/* ---------- feature 12: panel diff ---------- */
function diffPanels(ref){ const cur=PANEL; const byId=p=>{ const o={}; p.components.forEach(c=>o[c.id]=c); return o; };
  const A=byId(ref), B=byId(cur); const out=[];
  Object.keys(B).forEach(id=>{ if(!A[id]) out.push({t:'add', msg:'+ '+(B[id].label||id)+' ('+B[id].type+')'}); });
  Object.keys(A).forEach(id=>{ if(!B[id]){ out.push({t:'del', msg:'\u2212 '+(A[id].label||id)+' ('+A[id].type+')'}); return; }
    const a=A[id], b=B[id];
    ['label','state','poles','volts','type','note','link'].forEach(f=>{
      if(String(a[f]||'')!==String(b[f]||'')) out.push({t:'chg', msg:'~ '+(b.label||id)+': '+f+' \u201c'+(a[f]||'—')+'\u201d \u2192 \u201c'+(b[f]||'—')+'\u201d'});
    });
  });
  const wKey=w=>w.a+'\u2014'+w.b;
  const wa=new Set((ref.wires||[]).map(wKey)), wb=new Set((cur.wires||[]).map(wKey));
  (cur.wires||[]).forEach(w=>{ if(!wa.has(wKey(w))) out.push({t:'add', msg:'+ wire '+w.a+' \u2192 '+w.b}); });
  (ref.wires||[]).forEach(w=>{ if(!wb.has(wKey(w))) out.push({t:'del', msg:'\u2212 wire '+w.a+' \u2192 '+w.b}); });
  return out;
}
function onDiffFile(e){ const f=e.target.files[0]; if(!f)return; const r=new FileReader();
  r.onload=()=>{ try{ const ref=validatePanel(JSON.parse(r.result)); const d=diffPanels(ref);
    const html = d.length
      ? d.map(x=>'<div class="suspect" style="border-color:'+(x.t==='add'?'var(--ok)':x.t==='del'?'var(--bad)':'var(--warn)')+'">'+esc(x.msg)+'</div>').join('')
      : '<div class="hint" style="color:var(--ok)">No differences — panels are identical.</div>';
    const body='<div class="hint" style="margin-bottom:6px">Current vs <b>'+esc(f.name)+'</b>:</div>'+html;
    const out=$('#toolout'), m=$('#modal');
    if(out && m && m.style.display!=='none') out.innerHTML=body;
    else openModal('Panel Diff vs '+f.name, body);
  }catch(err){ toast('Bad diff file'); } };
  r.readAsText(f); e.target.value='';
}

/* ---------- modal ---------- */
function openModal(title,html){ let m=$('#modal');
  if(!m){ m=document.createElement('div'); m.id='modal'; document.body.appendChild(m); }
  m.innerHTML='<div class="modal-bg"></div><div class="modal-card"><div class="modal-hd"><b>'+esc(title)+'</b><button class="tbtn" id="modal-x">\u2715</button></div><div class="modal-bd">'+html+'</div></div>';
  m.style.display='block';
  m.querySelector('.modal-bg').onclick=closeModal;
  $('#modal-x').onclick=closeModal;
}
function closeModal(){ const m=$('#modal'); if(m) m.style.display='none'; }

/* ---------- tools modal ---------- */
function openTools(){ openModal('Tools',
  '<div class="toolgrid">'
  +'<button class="tbtn" id="tk-bom">\ud83d\udccb Bill of materials</button>'
  +'<button class="tbtn" id="tk-print">\ud83d\udda8 Print schematic</button>'
  +'<button class="tbtn" id="tk-png">\ud83d\uddbc Export PNG</button>'
  +'<button class="tbtn" id="tk-svg">\ud83d\udcc4 Export SVG</button>'
  +'<button class="tbtn" id="tk-share">\ud83d\udd17 Copy share link</button>'
  +'<button class="tbtn" id="tk-qr">\u25a6 QR (library panel)</button>'
  +'<button class="tbtn" id="tk-val">\u2714 Validate E-Stop chain</button>'
  +'<button class="tbtn" id="tk-lock">\U0001F517 Check interlocks</button>'
  +'<button class="tbtn" id="tk-info">\u270e Panel info / title block</button>'
  +'<button class="tbtn" id="tk-load">\u26a1 Load / breaker sizing</button>'
  +'<button class="tbtn" id="tk-wsched">\U0001F4C4 Wire schedule CSV</button>'
  +'<button class="tbtn" id="tk-work">\U0001F5A8 Troubleshooting worksheet</button>'
  +'<button class="tbtn" id="tk-term">\U0001F5C2 Terminal strip</button>'
  +'<button class="tbtn" id="tk-ladder">\u2630 Ladderize control</button>'
  +'<button class="tbtn" id="tk-snap">\U0001F4F7 Snapshots</button>'
  +'<button class="tbtn" id="tk-coord">\u26a1 Coordination study</button>'
  +'<button class="tbtn" id="tk-health">\U0001FA7A Health report</button>'
  +'<button class="tbtn" id="tk-pm">\u2705 PM checklist</button>'
  +'<button class="tbtn" id="tk-scen">\U0001F393 Training scenarios</button>'
  +'<button class="tbtn" id="tk-sev">\U0001F6E0 Trouble Call trainer</button>'
  +'<button class="tbtn" id="tk-lib">\U0001F4DA Panel library</button>'
  +'<button class="tbtn" id="tk-qr2">\U0001F4F7 Scan QR to open</button>'
  +'<button class="tbtn" id="tk-diff">\u21c4 Diff vs saved file</button>'
  +'</div><div id="toolout" style="margin-top:12px"></div>');
  $('#tk-bom').onclick=()=>{ $('#toolout').innerHTML=buildBOM()
    +'<div style="margin-top:10px"><button class="tbtn" onclick="window.print()">\ud83d\udda8 Print</button> <button class="tbtn" id="bom-csv">\u2b07 CSV</button></div>';
    const b=$('#bom-csv'); if(b)b.onclick=exportBomCsv; };
  $('#tk-print').onclick=printPanel;
  $('#tk-png').onclick=exportPNG;
  $('#tk-svg').onclick=exportSVG;
  $('#tk-share').onclick=()=>{ const u=shareLink();
    try{ navigator.clipboard&&navigator.clipboard.writeText(u); }catch(e){}
    $('#toolout').innerHTML='<div class="hint">Share link (full panel state — copied to clipboard):</div>'
      +'<textarea rows="4" style="width:100%" readonly>'+esc(u)+'</textarea>'
      +'<div class="hint" style="margin-top:6px">Anyone opening this URL sees the exact same panel and switch states.</div>'; };
  $('#tk-qr').onclick=showQR;
  $('#tk-val').onclick=()=>{ const r=validateSafety();
    $('#toolout').innerHTML=r.issues.map(i=>'<div class="suspect" style="border-color:'+(i.lvl==='warn'?'var(--warn)':i.lvl==='ok'?'var(--ok)':'var(--edge)')+';cursor:'+(i.ref?'pointer':'default')+'" '+(i.ref?'data-ref="'+esc(i.ref)+'"':'')+'>'+esc(i.msg)+'</div>').join('');
    $('#toolout').querySelectorAll('[data-ref]').forEach(el=>el.onclick=()=>{ sel=findComp(el.dataset.ref); closeModal(); render(); flash(el.dataset.ref); renderInspector(); }); };
  $('#tk-lock').onclick=()=>{ const r=validateInterlocks();
    $('#toolout').innerHTML=r.issues.map(i=>'<div class="suspect" style="border-color:'+(i.lvl==='warn'?'var(--warn)':i.lvl==='ok'?'var(--ok)':'var(--edge)')+';cursor:'+(i.ref?'pointer':'default')+'" '+(i.ref?'data-ref="'+esc(i.ref)+'"':'')+'>'+esc(i.msg)+'</div>').join('');
    $('#toolout').querySelectorAll('[data-ref]').forEach(el=>el.onclick=()=>{ sel=findComp(el.dataset.ref); closeModal(); render(); flash(el.dataset.ref); renderInspector(); }); };
  $('#tk-info').onclick=()=>{ $('#toolout').innerHTML=
    '<div class="field"><label>Panel name</label><input id="pi-name" value="'+esc(PANEL.name||'')+'"></div>'
    +'<div class="field"><label>Revision</label><input id="pi-rev" value="'+esc(PANEL.rev||'')+'"></div>'
    +'<div class="field"><label>Traced by</label><input id="pi-by" value="'+esc(PANEL.tracedBy||'')+'"></div>'
    +'<div class="hint">Shown in the title block on printed / exported sheets.</div>';
    $('#pi-name').oninput=e=>{PANEL.name=e.target.value;persist();};
    $('#pi-rev').oninput=e=>{PANEL.rev=e.target.value;persist();};
    $('#pi-by').oninput=e=>{PANEL.tracedBy=e.target.value;persist();}; };
  $('#tk-load').onclick=()=>{ const r=computeLoads();
    $('#toolout').innerHTML=r.issues.map(i=>'<div class="suspect" style="border-color:'+(i.lvl==='warn'?'var(--warn)':i.lvl==='ok'?'var(--ok)':'var(--edge)')+';cursor:'+(i.ref?'pointer':'default')+'" '+(i.ref?'data-ref="'+esc(i.ref)+'"':'')+'>'+esc(i.msg)+'</div>').join('');
    $('#toolout').querySelectorAll('[data-ref]').forEach(el=>el.onclick=()=>{ sel=findComp(el.dataset.ref); closeModal(); render(); flash(el.dataset.ref); renderInspector(); }); };
  $('#tk-wsched').onclick=exportWireCsv;
  $('#tk-work').onclick=printWorksheet;
  $('#tk-term').onclick=terminalReport;
  $('#tk-ladder').onclick=ladderize;
  $('#tk-snap').onclick=openSnapshots;
  $('#tk-coord').onclick=()=>{ const r=coordinationStudy();
    $('#toolout').innerHTML=r.issues.map(i=>'<div class="suspect" style="border-color:'+(i.lvl==='warn'?'var(--warn)':i.lvl==='ok'?'var(--ok)':'var(--edge)')+';cursor:'+(i.ref?'pointer':'default')+'" '+(i.ref?'data-ref="'+esc(i.ref)+'"':'')+'>'+esc(i.msg)+'</div>').join('');
    $('#toolout').querySelectorAll('[data-ref]').forEach(el=>el.onclick=()=>{ sel=findComp(el.dataset.ref); closeModal(); render(); flash(el.dataset.ref); renderInspector(); }); };
  $('#tk-health').onclick=()=>{ const r=healthReport();
    $('#toolout').innerHTML=r.issues.map(i=>'<div class="suspect" style="border-color:'+(i.lvl==='warn'?'var(--warn)':i.lvl==='ok'?'var(--ok)':'var(--edge)')+';cursor:'+(i.ref?'pointer':'default')+'" '+(i.ref?'data-ref="'+esc(i.ref)+'"':'')+'>'+esc(i.msg)+'</div>').join('');
    $('#toolout').querySelectorAll('[data-ref]').forEach(el=>el.onclick=()=>{ sel=findComp(el.dataset.ref); closeModal(); render(); flash(el.dataset.ref); renderInspector(); }); };
  $('#tk-pm').onclick=openPM;
  $('#tk-scen').onclick=openScenarios; $('#tk-sev').onclick=openSevEvents;
  $('#tk-lib').onclick=openLibraryManager;
  $('#tk-qr2').onclick=scanQR;
  $('#tk-diff').onclick=()=>$('#fileDiff').click();
}

/* ---------- init extras ---------- */
function initExtras(){
  const sb=$('#search');
  if(sb){ sb.addEventListener('keydown',e=>{ if(e.key==='Enter') jumpTo(sb.value); });
          sb.addEventListener('change',()=>jumpTo(sb.value)); }
  const bt=$('#btnTools'); if(bt) bt.onclick=openTools;
  const bm=$('#btnMore'), mm=$('#moreMenu');
  if(bm&&mm){
    bm.onclick=e=>{ e.stopPropagation(); mm.hidden=!mm.hidden; };
    mm.addEventListener('click',()=>setTimeout(()=>{ mm.hidden=true; },0));
    document.addEventListener('click',e=>{ if(!mm.hidden && !mm.contains(e.target) && e.target!==bm) mm.hidden=true; });
  }
  const bw=$('#btnWireNo'); if(bw) bw.onclick=()=>{ showWireNo=!showWireNo; bw.classList.toggle('on',showWireNo); render(); };
  const fd=$('#fileDiff'); if(fd) fd.onchange=onDiffFile;
  svg.addEventListener('mouseover',ev=>{ if(mode!=='sim')return;
    const g=ev.target.closest('.compbox'); const id=g?g.dataset.comp:null;
    if(id&&id!==hoverComp){ hoverComp=id; computeHover(); render(); }
  });
  svg.addEventListener('mouseout',ev=>{ if(mode!=='sim')return;
    const g=ev.target.closest('.compbox'); if(!g||!hoverComp) return;
    const to=ev.relatedTarget && ev.relatedTarget.closest ? ev.relatedTarget.closest('.compbox') : null;
    if(!to){ hoverComp=null; hoverData=null; render(); }
  });
  window.addEventListener('hashchange',()=>{ if(applyHash()){ sel=null; selWire=null; applyEnc(); if(typeof applyView==='function')applyView(); render(); renderInspector(); } });
}

/* renderQuiz — sim no-selection branch helper */
function renderQuiz(){ const box=$('#simextra'); if(!box)return;
  box.innerHTML='<div class="hint" style="margin:8px 0 4px">\ud83c\udf93 A hidden fault is active. Click the device you suspect, then Check on its inspector.</div>'
    +'<button class="tbtn warn" id="qz-reveal" style="width:100%">Reveal & end quiz</button>';
  const b=$('#qz-reveal'); if(b) b.onclick=()=>{ quizReveal(); };
}

/* =========================================================================
   ELECTRON WRANGLER — EXTRAS2 (features 14-25). All top-level fn decls hoist.
   ========================================================================= */

/* ---------- 8: history (undo/redo) ---------- */
var _hist=[], _histFwd=[], _lastSnap, _histLock=false;
function histInit(){ _lastSnap=JSON.stringify(PANEL); }
function histCommit(){ if(_histLock)return; if(_lastSnap!==undefined){ _hist.push(_lastSnap); if(_hist.length>60)_hist.shift(); _histFwd=[]; } _lastSnap=JSON.stringify(PANEL); }
function _histRestore(json){ _histLock=true; try{ PANEL=validatePanel(JSON.parse(json)); }catch(e){} _lastSnap=json; restoreUid();
  sel=null; selWire=null; selSet=[]; netHi=null;
  try{ localStorage.setItem('acy1_panel', json); }catch(e){}
  _histLock=false; applyEnc(); if(typeof applyView==='function')applyView(); render(); renderInspector(); }
function undo(){ if(!_hist.length){ toast('Nothing to undo'); return; } _histFwd.push(JSON.stringify(PANEL)); _histRestore(_hist.pop()); toast('Undo'); }
function redo(){ if(!_histFwd.length){ toast('Nothing to redo'); return; } _hist.push(JSON.stringify(PANEL)); _histRestore(_histFwd.pop()); toast('Redo'); }

/* ---------- 1: guided fault walk-through ---------- */
function guidedWalk(loadComp){ const r=diagnose(loadComp);
  if(!r.ok) return [r.msg];
  const steps=[];
  if(!r.suspects.length){ steps.push('Path is intact and every device is closed. Meter the source output, then the load terminals directly — the break is at the source or the load itself.'); return steps; }
  steps.push('Start at '+(loadComp.label||compDef(loadComp).name)+' and work back toward the power source.');
  r.suspects.forEach((s,i)=>{ steps.push((i+1)+'. Check '+s.label+' ('+s.why+'). Meter across it: ~0 V across a closed/OK device is normal — full line voltage across it means THIS is the open break.'); });
  steps.push('Correct the closest break, then re-run the diagnosis. If still dead, the next item is the culprit.');
  return steps;
}


/* ---------- Live Troubleshoot (on-floor companion) ---------- */
let liveMode=false, liveLoad=null;
function liveLoads(){ return PANEL.components.filter(function(c){ var d=compDef(c); return d&&(d.load||d.coil); }); }
function _liveSrcVolts(){ var v=null; PANEL.components.forEach(function(c){ termList(c).forEach(function(t){ if(t.rail==="hot"&&c.volts&&!v)v=c.volts; }); }); return v; }
function _liveHistKey(){ return "ew_live_"+(PANEL.name||"panel"); }
function liveHist(){ try{ return JSON.parse(localStorage.getItem(_liveHistKey())||"{}"); }catch(e){ return {}; } }
function liveHistSave(id,note){ try{ var h=liveHist(); (h[id]=h[id]||[]).unshift({t:Date.now(),note:note}); h[id]=h[id].slice(0,5); localStorage.setItem(_liveHistKey(),JSON.stringify(h)); }catch(e){} }
function _liveWhy(c,contact){ var t=c.type;
  if(t==="breaker") return "breaker \u2014 0V across when closed; full voltage across = TRIPPED / switched OFF";
  if(t==="disc") return "disconnect \u2014 must be closed / ON";
  if(t==="fuse") return "fuse \u2014 0V across when good; full voltage across = BLOWN";
  if(t==="overload") return "overload relay \u2014 check not tripped (press reset)";
  if(t==="contactor") return "contactor \u2014 should pull in; if not, chase its coil circuit next";
  if(t==="relay") return "relay "+(contact==="NC"?"NC":"NO")+" contact \u2014 verify coil state";
  if(t==="estop") return "E-STOP \u2014 must be pulled out / reset";
  if(t==="pullcord") return "pull-cord \u2014 must be reset";
  if(t==="guardlock") return "gate \u2014 must be closed and locked";
  if(t==="pbNC") return "stop button \u2014 should be closed (not stuck in)";
  if(t==="pbNO") return "start button \u2014 momentary contact";
  if(t==="selector"||t==="sensor") return "contact \u2014 verify closed";
  if(t==="phaseMon") return "phase monitor \u2014 all 3 phases present, no fault LED";
  if(t==="vfd") return "drive \u2014 read fault code and verify enable input";
  if(t==="plcOut") return "PLC output \u2014 verify commanded ON (check indicator)";
  if(t==="term"||t==="tstrip"||t==="ftb") return "terminal \u2014 check for loose or backed-out wire";
  return "verify continuity across it (0V closed / line voltage across = open)";
}
function startLive(){ if(mode!=="sim")setMode("sim"); liveMode=true; liveLoad=null; sel=null; renderInspector(); }
function exitLive(){ liveMode=false; liveLoad=null; sel=null; render(); renderInspector(); }
function livePick(id){ liveLoad=findComp(id); renderInspector(); }
function liveBack(){ liveLoad=null; sel=null; render(); renderInspector(); }
function _eamCode(c){ if(c.eam) return c.eam; var m=String(c.label||"").match(/[A-Za-z]{0,5}\d{6,8}/); return m?m[0]:null; }
function eamUrl(c){ var b="https://us1.eam.hxgnsmartcloud.com/web/base/logindisp?tenant=AMAZONRMENA_PRD&FROMEMAIL=YES&SYSTEM_FUNCTION_NAME=WSJOBS"; return c.eamWo?(b+"&workordernum="+encodeURIComponent(c.eamWo)):b; }
function _liveExtra(c){ var out="";
  if(c.spare){ var sp=c.spare; var pn=sp.pn||sp; var d=sp.desc?(" "+sp.desc):""; var bin=sp.bin?(" \u00b7 bin "+sp.bin):""; out+=`<br><span style="color:var(--ok);font-size:.85em">\ud83d\udd29 Spare `+esc(pn)+esc(d)+esc(bin)+`</span>`; }
  var code=_eamCode(c);
  if(code||c.eamWo){ var lbl=c.eamWo?("EAM WO "+c.eamWo):("EAM work orders \u2014 search "+code); out+=`<br><a class="live-eam" href="`+esc(eamUrl(c))+`" target="_blank" rel="noopener" style="color:var(--accent);font-size:.85em">\ud83d\udd17 `+esc(lbl)+`</a>`; }
  return out;
}
function renderLive(){ var box=$("#simextra"); if(!box)return; var v=_liveSrcVolts();
  if(!liveLoad){
    var loads=liveLoads();
    var h=`<div class="hint" style="margin:8px 0;color:var(--accent)"><b>Live Troubleshoot</b> \u2014 tap the device that is dead on the floor right now. I will trace its circuit back to source and show what to meter, in order, and where each part sits.</div>`;
    if(!loads.length) h+=`<div class="hint">No loads or coils found in this panel.</div>`;
    else h+=loads.map(function(c){ var n=liveHist()[c.id]||[]; return `<button class="tbtn" style="width:100%;margin-bottom:5px;text-align:left" data-live="`+esc(c.id)+`">\u26a1 `+esc(c.label||compDef(c).name)+(n.length?` <span style="color:var(--dim)">(`+n.length+` past fix`+(n.length>1?"es":"")+`)</span>`:``)+`</button>`; }).join("");
    h+=`<button class="tbtn warn" id="live-exit" style="width:100%;margin-top:8px">\u2715 Exit Live Troubleshoot</button>`;
    box.innerHTML=h;
    box.querySelectorAll("[data-live]").forEach(function(b){ b.onclick=function(){ livePick(b.dataset.live); }; });
    var ex=$("#live-exit"); if(ex)ex.onclick=exitLive; return;
  }
  var r=diagnose(liveLoad,true); var name=esc(liveLoad.label||compDef(liveLoad).name);
  var h=`<div class="hint" style="margin:8px 0;color:var(--accent)"><b>`+name+`</b> is your dead load.`+(v?` Supply \u2248 <b>`+esc(v)+`</b>.`:``)+`</div>`;
  if(!r.ok) h+=`<div class="hint" style="color:var(--warn)">`+esc(r.msg)+`</div>`;
  else if(!r.path||!r.path.length) h+=`<div class="hint">No series devices between this load and source \u2014 meter the source output, then the load terminals directly.</div>`;
  else { h+=`<div class="hint">Meter from the load back toward source. Across a good (closed) device \u2248 0V; <b>full supply voltage across a device = that is your open break.</b></div>`;
    h+=`<ol style="padding-left:18px;margin:6px 0">`+r.path.map(function(p){ var c=p.comp; var loc=c.phys?` \u2014 <span style="color:var(--live)">on the panel photo</span>`:``; return `<li style="margin-bottom:6px;cursor:pointer" data-lc="`+esc(c.id)+`"><b>`+esc(c.label||compDef(c).name)+`</b>`+loc+`<br><span style="color:var(--dim);font-size:.85em">`+esc(_liveWhy(c,p.contact))+`</span>`+_liveExtra(c)+`</li>`; }).join("")+`</ol>`;
  }
  var hist=liveHist()[liveLoad.id]||[];
  if(hist.length) h+=`<div class="hint" style="margin-top:6px"><b>Past fixes here:</b><br>`+hist.map(function(x){ return `\u2022 `+esc(x.note)+` <span style="color:var(--dim)">(`+new Date(x.t).toLocaleDateString()+`)</span>`; }).join("<br>")+`</div>`;
  h+=`<button class="tbtn" id="live-log" style="width:100%;margin-top:8px">`+(logMode?`\ud83d\udcdd Recording readings (ON)`:`\ud83d\udcdd Record my meter readings`)+`</button>`;
  h+=`<button class="tbtn" id="live-found" style="width:100%;margin-top:6px">\u2713 Found it \u2014 log the fix</button>`;
  h+=`<button class="tbtn" id="live-back" style="width:100%;margin-top:6px">\u2190 Back to loads</button>`;
  h+=`<button class="tbtn warn" id="live-exit" style="width:100%;margin-top:6px">\u2715 Exit Live Troubleshoot</button>`;
  box.innerHTML=h;
  box.querySelectorAll("[data-lc]").forEach(function(li){ li.onclick=function(){ var c=findComp(li.dataset.lc); if(!c)return; sel=c; selWire=null; render(); flash(c.id); if(typeof centerOn==="function")centerOn(c); }; });
  box.querySelectorAll(".live-eam").forEach(function(a){ a.addEventListener("click",function(e){ e.stopPropagation(); }); });
  var lg=$("#live-log"); if(lg)lg.onclick=function(){ logMode=!logMode; render(); renderInspector(); };
  var fd=$("#live-found"); if(fd)fd.onclick=function(){ var note=prompt("What fixed it? (e.g. CB4 tripped, loose lead on X2, replaced servo cable)"); if(note){ liveHistSave(liveLoad.id,note); toast("Logged fix for "+name); renderInspector(); } };
  var bk=$("#live-back"); if(bk)bk.onclick=liveBack;
  var ex=$("#live-exit"); if(ex)ex.onclick=exitLive;
}

/* ---------- 3: as-found measurement log ---------- */
function _numVolt(s){ const m=String(s||'').match(/(\d+(?:\.\d+)?)/); return m?+m[1]:0; }
function expectedVoltAt(key){ solve(); const isHot=solve._isHot, isRet=solve._isRet, uf=solve._uf; if(!uf)return 0;
  if(isHot(key)) return (solve._hotV&&solve._hotV[uf.find(key)])||0;
  if(isRet(key)) return 0;
  return 0; }
function logMeasure(key){ const exp=expectedVoltAt(key);
  const val=prompt('Meter reading at '+key+' (to neutral/ground), volts:\nModel expects about '+exp+' V'); if(val===null)return;
  const actual=_numVolt(val); const tol=Math.max(3,exp*0.1);
  measurements.push({key, expected:exp, actual, ok:Math.abs(actual-exp)<=tol});
  render(); renderSimInspector(); }
function renderLog(){ const box=$('#simextra'); if(!box)return;
  let h='<div class="hint" style="margin:8px 0 4px">As-found log ON — click a terminal, type your real meter reading. Values off by >10% flag red.</div>';
  if(measurements.length){ h+='<table class="bom"><thead><tr><th>Point</th><th>Exp</th><th>Got</th></tr></thead><tbody>'+
    measurements.map(m=>'<tr style="color:'+(m.ok?'var(--ok)':'var(--bad)')+'"><td>'+esc(m.key)+'</td><td>'+m.expected+'V</td><td>'+m.actual+'V</td></tr>').join('')+'</tbody></table>'+
    '<button class="tbtn" id="log-csv" style="width:100%;margin-top:6px">\u2b07 Export as-found CSV</button>'+
    '<button class="tbtn warn" id="log-clr" style="width:100%;margin-top:4px">Clear log</button>'; }
  box.innerHTML=h;
  const cs=$('#log-csv'); if(cs)cs.onclick=exportLogCsv;
  const cl=$('#log-clr'); if(cl)cl.onclick=()=>{measurements=[];render();renderSimInspector();};
}
function exportLogCsv(){ const rows=[['Point','Expected V','Actual V','Status']];
  measurements.forEach(m=>rows.push([m.key,m.expected,m.actual,m.ok?'OK':'MISMATCH']));
  const csv=rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  dl(new Blob([csv],{type:'text/csv'}), (PANEL.name||'panel')+'_as-found.csv'); }

/* ---------- 4: right-click quick menu ---------- */
function quickActions(c){ const d=compDef(c); const acts=[];
  if(d.sw&&d.states) d.states.forEach(st=>{ if(st!==c.state) acts.push({label:'Set '+st, fn:()=>{c.state=st;persist();render();renderInspector();}}); });
  acts.push({label:c.fault?'Clear fault':'Inject fault', fn:()=>{c.fault=!c.fault;persist();render();renderInspector();}});
  acts.push({label:'Edit\u2026', fn:()=>{sel=c;selWire=null;selSet=[];renderInspector();render();}});
  acts.push({label:'Delete', fn:()=>delComp(c)});
  return acts; }
function showQuickMenu(c,px,py){ closeQuickMenu(); const m=document.createElement('div'); m.id='quickmenu'; m.className='quickmenu';
  m.style.left=px+'px'; m.style.top=py+'px'; const acts=quickActions(c);
  m.innerHTML='<div class="qm-hd">'+esc(c.label||compDef(c).name)+'</div>'+acts.map((a,i)=>'<div class="qm-item" data-i="'+i+'">'+esc(a.label)+'</div>').join('');
  document.body.appendChild(m);
  m.querySelectorAll('.qm-item').forEach(el=>el.onclick=()=>{ acts[+el.dataset.i].fn(); closeQuickMenu(); });
  setTimeout(()=>document.addEventListener('pointerdown',closeQuickMenu,{once:true}),0);
}
function closeQuickMenu(){ const m=$('#quickmenu'); if(m)m.remove(); }

/* ---------- 5: interlock / sequence checker ---------- */
function validateInterlocks(){ const issues=[];
  PANEL.components.forEach(c=>{ const d=compDef(c);
    if(d.coil){ const a1=c.id+'|'+d.coil.a1;
      if(!PANEL.wires.some(w=>w.a===a1||w.b===a1)) issues.push({lvl:'warn',msg:(c.label||d.name)+': coil terminal '+d.coil.a1+' is unwired — coil can never pick up.',ref:c.id});
      if(d.coil.a2){ const a2=c.id+'|'+d.coil.a2;
        if(!PANEL.wires.some(w=>w.a===a2||w.b===a2)) issues.push({lvl:'warn',msg:(c.label||d.name)+': coil return '+d.coil.a2+' is unwired — no path back to neutral.',ref:c.id}); }
    }
  });
  PANEL.components.filter(c=>c.type==='motor').forEach(mt=>{ const feeders=new Set();
    termList(mt).forEach(t=>{ const k=mt.id+'|'+t.id;
      PANEL.wires.forEach(w=>{ const other=w.a===k?w.b:(w.b===k?w.a:null); if(other){ const oc=findComp(other.split('|')[0]); if(oc&&oc.type==='contactor')feeders.add(oc.id); } }); });
    const conts=[...feeders].map(findComp).filter(Boolean);
    if(conts.length>=2) issues.push({lvl:'warn',msg:(mt.label||'Motor')+' is fed by '+conts.length+' contactors ('+conts.map(c=>c.label||c.id).join(', ')+') — verify interlock to prevent a phase-to-phase short if both close.',ref:conts[0].id});
  });
  const seen={}; PANEL.wires.forEach(w=>{ const k=[w.a,w.b].sort().join('~'); if(seen[k])issues.push({lvl:'info',msg:'Duplicate wire between '+w.a+' and '+w.b+'.'}); seen[k]=1; });
  if(!issues.length||issues.every(i=>i.lvl==='info')) issues.push({lvl:'ok',msg:'No interlock or sequence problems detected.'});
  return {issues};
}

/* ---------- 12: pre-wired templates ---------- */
function insertTemplate(kind){ const r=svg.getBoundingClientRect();
  const p=toWorld({clientX:r.left+svg.clientWidth/2, clientY:r.top+svg.clientHeight/3});
  const ox=Math.round(p.x-220), oy=Math.round(p.y-40);
  const add=(type,x,y,extra)=>{ const d=T[type]; const c=Object.assign({id:nid(type),type,x:ox+x,y:oy+y,label:''},extra||{});
    if(['disc','breaker','contactor','overload'].includes(type))c.poles=c.poles||3;
    if(d.sw&&!c.state)c.state=d.states[0]; PANEL.components.push(c); return c; };
  const w=(a,ta,b,tb,net)=>PANEL.wires.push({id:nid('w'),a:a.id+'|'+ta,b:b.id+'|'+tb,net});
  if(kind==='starter'){ const src=add('source',0,0,{phases:3,volts:'480V',label:'PWR'});
    const cb=add('breaker',120,0,{label:'CB',state:'closed'}); const ct=add('contactor',240,-8,{label:'M'});
    const ol=add('overload',370,-4,{label:'OL',state:'ok'}); const mt=add('motor',500,80,{phases:3,label:'MTR'});
    for(let i=0;i<3;i++){ w(src,'L'+(i+1),cb,'in'+i,'hot'); w(cb,'out'+i,ct,'L'+(i+1),'hot'); w(ct,'T'+(i+1),ol,'L'+(i+1),'hot'); }
    w(ol,'T1',mt,'U','hot'); w(ol,'T2',mt,'V','hot'); w(ol,'T3',mt,'W','hot'); }
  else if(kind==='estop'){ const src=add('source',0,0,{phases:1,volts:'24V',label:'24V'});
    const e1=add('estop',120,4,{state:'closed',label:'ES1'}); const e2=add('estop',210,4,{state:'closed',label:'ES2'});
    const rl=add('relay',320,-8,{label:'SR'});
    w(src,'L',e1,'a','hot'); w(e1,'b',e2,'a','ctrl'); w(e2,'b',rl,'A1','ctrl'); w(rl,'A2',src,'N','ret'); }
  else if(kind==='plc'){ const src=add('source',0,0,{phases:1,volts:'24V',label:'24V'});
    const pb=add('pbNO',120,4,{state:'open',label:'PB'}); const pi=add('plcIn',230,6,{label:'I0.0'});
    w(src,'L',pb,'a','hot'); w(pb,'b',pi,'in','ctrl'); w(pi,'c',src,'N','ret'); }
  persist(); render(); closeModal(); toast('Template inserted — drag it into place'); }

/* ---------- 7: bulk edit ---------- */
function renderBulk(){ const box=$('#inspector');
  box.innerHTML='<h3>'+selSet.length+' components selected</h3>'
    +'<div class="field"><label>Set poles</label><select id="bulk-poles"><option value="">\u2014 leave \u2014</option>'+[1,2,3].map(p=>'<option>'+p+'</option>').join('')+'</select></div>'
    +'<div class="field"><label>Set state</label><select id="bulk-state"><option value="">\u2014 leave \u2014</option>'+['closed','open','ok','tripped','blown','on','off'].map(s=>'<option>'+s+'</option>').join('')+'</select></div>'
    +'<button class="tbtn" id="bulk-row" style="width:100%">Line up in a row</button>'
    +'<button class="tbtn warn" id="bulk-del" style="width:100%;margin-top:6px">\ud83d\uddd1 Delete '+selSet.length+'</button>'
    +'<button class="tbtn" id="bulk-clr" style="width:100%;margin-top:4px">Clear selection</button>';
  $('#bulk-poles').onchange=e=>{ if(!e.target.value)return; selSet.forEach(c=>{ if(['disc','breaker','contactor','overload'].includes(c.type)){c.poles=+e.target.value;fixWires(c);} }); persist(); render(); };
  $('#bulk-state').onchange=e=>{ if(!e.target.value)return; selSet.forEach(c=>{ const d=compDef(c); if(d.states&&d.states.includes(e.target.value))c.state=e.target.value; }); persist(); render(); };
  $('#bulk-row').onclick=()=>{ const y=Math.min(...selSet.map(c=>c.y)); let x=Math.min(...selSet.map(c=>c.x));
    selSet.slice().sort((a,b)=>a.x-b.x).forEach(c=>{ c.y=y; c.x=x; x+=compDef(c).w+22; }); persist(); render(); };
  $('#bulk-del').onclick=()=>{ const rm=new Set(selSet.map(c=>c.id));
    PANEL.wires=PANEL.wires.filter(w=>!rm.has(w.a.split('|')[0])&&!rm.has(w.b.split('|')[0]));
    PANEL.components=PANEL.components.filter(c=>!rm.has(c.id)); selSet=[]; sel=null; persist(); render(); renderInspector(); };
  $('#bulk-clr').onclick=()=>{ selSet=[]; render(); renderInspector(); };
}

/* ---------- 11: net highlight ---------- */
function computeNet(wire){ netHi=null; if(!wire)return; const uf=new UF(); const key=(c,t)=>c.id+'|'+t;
  PANEL.wires.forEach(w=>{ if(!w.cut)uf.union(w.a,w.b); });
  PANEL.components.forEach(c=>{ compDef(c).links(c).forEach(([x,y])=>uf.union(key(c,x),key(c,y))); });
  const root=uf.find(wire.a); const wires=new Set();
  PANEL.wires.forEach(w=>{ if(!w.cut && (uf.find(w.a)===root||uf.find(w.b)===root)) wires.add(w.id); });
  netHi={wires}; }

/* ---------- 9: wire routing ---------- */
function wirePath(a,b){ const mx=(a.x+b.x)/2;
  if(orthoWire) return 'M'+a.x+' '+a.y+' H'+mx+' V'+b.y+' H'+b.x;
  return 'M'+a.x+' '+a.y+' C '+mx+' '+a.y+' '+mx+' '+b.y+' '+b.x+' '+b.y; }

/* ---------- 10: title block for exports ---------- */
function titleBlock(b){ const day=new Date().toISOString().slice(0,10);
  const bw=250, bh=60, bx=b.x+b.w-bw-8, by=b.y+b.h-bh-8;
  return '<g><rect x="'+bx+'" y="'+by+'" width="'+bw+'" height="'+bh+'" fill="#0d1117" stroke="#c9d1d9" stroke-width="1"/>'
    +'<line x1="'+bx+'" y1="'+(by+22)+'" x2="'+(bx+bw)+'" y2="'+(by+22)+'" stroke="#c9d1d9" stroke-width=".5"/>'
    +'<line x1="'+bx+'" y1="'+(by+40)+'" x2="'+(bx+bw)+'" y2="'+(by+40)+'" stroke="#c9d1d9" stroke-width=".5"/>'
    +'<text x="'+(bx+7)+'" y="'+(by+15)+'" style="fill:#e6edf3;font:bold 11px sans-serif">'+esc((PANEL.name||'PANEL').slice(0,40))+'</text>'
    +'<text x="'+(bx+7)+'" y="'+(by+35)+'" style="fill:#8b949e;font:8px sans-serif">RME \u00b7 Electron Wrangler</text>'
    +'<text x="'+(bx+7)+'" y="'+(by+53)+'" style="fill:#8b949e;font:8px sans-serif">Date '+day+'   Rev '+esc(PANEL.rev||'-')+'   By '+esc(PANEL.tracedBy||'-')+'</text></g>'; }

/* ---------- 6 + init hooks ---------- */
function openTemplates(){ openModal('Insert template',
  '<div class="toolgrid"><button class="tbtn" id="tp-starter">\u2699\ufe0f 3\u00d8 Motor starter</button>'
  +'<button class="tbtn" id="tp-estop">\ud83d\uded1 E-Stop string</button>'
  +'<button class="tbtn" id="tp-plc">\ud83d\udda5\ufe0f 24V PLC rung</button></div>'
  +'<div class="hint" style="margin-top:8px">Drops a pre-wired skeleton near the top-center of the canvas. Drag it into place and rename the tags.</div>');
  $('#tp-starter').onclick=()=>insertTemplate('starter');
  $('#tp-estop').onclick=()=>insertTemplate('estop');
  $('#tp-plc').onclick=()=>insertTemplate('plc');
}
function initExtras2(){ histInit();
  document.addEventListener('keydown',ev=>{ const tag=(ev.target&&ev.target.tagName)||''; if(/INPUT|TEXTAREA|SELECT/.test(tag))return;
    const z=ev.key==='z'||ev.key==='Z', y=ev.key==='y'||ev.key==='Y';
    if((ev.ctrlKey||ev.metaKey)&&z&&!ev.shiftKey){ ev.preventDefault(); undo(); }
    else if((ev.ctrlKey||ev.metaKey)&&(y||(z&&ev.shiftKey))){ ev.preventDefault(); redo(); } });
  svg.addEventListener('contextmenu',ev=>{ const g=ev.target.closest('.compbox'); if(!g)return; ev.preventDefault();
    const c=findComp(g.dataset.comp); if(c) showQuickMenu(c,ev.clientX,ev.clientY); });
  const bo=$('#btnOrtho'); if(bo)bo.onclick=()=>{orthoWire=!orthoWire;bo.classList.toggle('on',orthoWire);render();};
  const bp=$('#btnPin'); if(bp)bp.onclick=()=>{pinMode=!pinMode;bp.classList.toggle('on',pinMode);toast(pinMode?'Pin mode ON — click the photo to drop a numbered pin':'Pin mode off');};
  const bt=$('#btnTmpl'); if(bt)bt.onclick=openTemplates;
  const bu=$('#btnUndo'); if(bu)bu.onclick=undo;
  const br=$('#btnRedo'); if(br)br.onclick=redo;
}

/* =========================================================================
   ELECTRON WRANGLER — EXTRAS3 (features 26-37). fn decls hoist; state via var.
   ========================================================================= */
var _playing=false, _raf=null, _lastT=0, showAmps=false, gridSnap=false, GRID=10, clipboard=null, PROJECT=null;

/* ---------- 2: current / load ---------- */
function motorAmps(c){ if(c.fla)return +c.fla; if(c.hp){ const ph=c.phases||3; const v=_numVolt(c.volts)||(ph===3?480:120); return Math.round(c.hp*746/((ph===3?1.732:1)*v*0.9)); } return 0; }
function computeLoads(){ solve(); const issues=[]; const key=(c,t)=>c.id+'|'+t; const uf=solve._uf;
  const prot=PANEL.components.filter(c=>['breaker','fuse','disc'].includes(c.type)&&c.amps);
  prot.forEach(p=>{ let fla=0; const proots=new Set(termList(p).map(t=>uf.find(key(p,t.id))));
    PANEL.components.filter(c=>c.type==='motor'&&c._on).forEach(m=>{ if(termList(m).some(t=>proots.has(uf.find(key(m,t.id))))) fla+=motorAmps(m); });
    if(fla>0){ const over=fla>+p.amps; issues.push({lvl:over?'warn':'ok',msg:(p.label||p.type)+' rated '+p.amps+'A carries ~'+fla+'A'+(over?' \u2014 OVERLOADED, upsize the device/conductor':' (OK)'),ref:p.id}); } });
  if(!issues.length) issues.push({lvl:'info',msg:'No rated protective devices with running motors. Set an Amp rating on breakers/fuses and FLA or HP on motors, then simulate.'});
  return {issues}; }

/* ---------- 1: timers + sequence playback ---------- */
function tick(dt){ let any=false; PANEL.components.forEach(c=>{ const d=compDef(c); if(!d.timer)return; any=true; const preset=+(c.preset||2000);
  if(c.type==='timerON'){ if(c._coilOn){ c._el=(c._el||0)+dt; if(c._el>=preset)c._out=true; } else { c._el=0; c._out=false; } }
  else if(c.type==='timerOFF'){ if(c._coilOn){ c._out=true; c._el=0; } else if(c._out){ c._el=(c._el||0)+dt; if(c._el>=preset)c._out=false; } }
}); return any; }
function _now(){ return (typeof performance!=='undefined'&&performance.now)?performance.now():Date.now(); }
function play(){ if(_playing)return; if(mode!=='sim')setMode('sim'); _playing=true; _lastT=_now();
  const bp=$('#btnPlay'); if(bp){bp.textContent='\u23f8 Pause';bp.classList.add('on');}
  const loop=t=>{ if(!_playing)return; const dt=t-_lastT; _lastT=t; tick(dt); solve(); render(); _raf=requestAnimationFrame(loop); };
  _raf=requestAnimationFrame(loop); }
function stopPlay(){ _playing=false; if(_raf&&typeof cancelAnimationFrame!=='undefined')cancelAnimationFrame(_raf); _raf=null;
  const bp=$('#btnPlay'); if(bp){bp.textContent='\u25b6 Play';bp.classList.remove('on');} }
function togglePlay(){ _playing?stopPlay():play(); }

/* ---------- 4: wire schedule ---------- */
function exportWireCsv(){ const rows=[['Wire #','From device','From term','To device','To term','Net']];
  PANEL.wires.forEach(w=>{ const [fa,fta]=w.a.split('|'),[fb,ftb]=w.b.split('|'); const ca=findComp(fa),cb=findComp(fb);
    rows.push([w.label||'',ca?(ca.label||ca.id):fa,fta,cb?(cb.label||cb.id):fb,ftb,w.net||'']); });
  const csv=rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  dl(new Blob([csv],{type:'text/csv'}),(PANEL.name||'panel')+'_wire-schedule.csv'); toast('Wire schedule exported'); }

/* ---------- 5: troubleshooting worksheet ---------- */
function printWorksheet(){ const w=window.open('','_blank'); if(!w){toast('Popup blocked \u2014 allow popups');return;}
  if(mode==='sim')solve();
  let diag=''; const dead=PANEL.components.filter(c=>{const d=compDef(c);return (d.load||d.coil)&&!c._on;});
  if(dead.length){ diag='<h3>Diagnosis</h3>'+dead.map(c=>{const r=diagnose(c);const t=r.suspects&&r.suspects[0];
    return '<div><b>'+esc(c.label||compDef(c).name)+':</b> '+(r.ok?(t?esc(t.label+' \u2014 '+t.why):'path intact \u2014 check source/load'):esc(r.msg))+'</div>';}).join(''); }
  let meas=''; if(measurements.length){ meas='<h3>As-found readings</h3><table><tr><th>Point</th><th>Expected</th><th>Actual</th><th>Status</th></tr>'
    +measurements.map(m=>'<tr><td>'+esc(m.key)+'</td><td>'+m.expected+'V</td><td>'+m.actual+'V</td><td>'+(m.ok?'OK':'MISMATCH')+'</td></tr>').join('')+'</table>'; }
  w.document.write('<!doctype html><meta charset=utf-8><title>Worksheet \u2014 '+esc(PANEL.name||'')+'</title>'
    +'<style>body{font:13px Segoe UI,Arial,sans-serif;margin:24px;color:#111}h1{font-size:18px}h3{margin-top:18px;border-bottom:1px solid #999;padding-bottom:2px}svg{max-width:100%;height:auto;border:1px solid #ccc}table{border-collapse:collapse;font-size:12px}td,th{border:1px solid #999;padding:4px 8px;text-align:left}</style>'
    +'<h1>RME \u2014 Troubleshooting Worksheet</h1>'
    +'<div><b>Panel:</b> '+esc(PANEL.name||'')+' &nbsp; <b>Date:</b> '+new Date().toISOString().slice(0,10)+' &nbsp; <b>Tech:</b> '+esc(PANEL.tracedBy||'____________')+'</div>'
    +(diag||'<h3>Diagnosis</h3><div>All modeled loads energized.</div>')+meas
    +'<h3>Schematic</h3>'+serializeSvg()
    +'<h3>Corrective action / notes</h3><div style="border:1px solid #999;height:130px"></div>');
  w.document.close(); w.focus(); setTimeout(()=>{try{w.print();}catch(e){}},400); }

/* ---------- 6: part number + Parts Search ---------- */
function partsLink(c){ const url=(function(){try{return (localStorage.getItem('pt_parts_url')||'').trim();}catch(e){return '';}})();
  if(!c.apn){ toast('Set an APN / part number on this device first'); return; }
  if(url&&/^https?:\/\//i.test(url)){ window.open(url+(url.includes('?')?'&':'?')+'q='+encodeURIComponent(c.apn),'_blank'); }
  else if(url){ toast('Parts URL must start with http(s)://'); }
  else { try{ navigator.clipboard&&navigator.clipboard.writeText(c.apn); }catch(e){} toast('APN '+c.apn+' copied \u2014 paste into Parts Search'); } }

/* ---------- 8: in-panel snapshots ---------- */
function snapSave(){ const n=prompt('Snapshot name (e.g. as-found, after repair):',''); if(n===null)return;
  PANEL._snaps=PANEL._snaps||[];
  PANEL._snaps.push({name:n||('snap '+(PANEL._snaps.length+1)),ts:Date.now(),data:JSON.parse(JSON.stringify({name:PANEL.name,components:PANEL.components,wires:PANEL.wires}))});
  persist(); toast('Snapshot saved'); openSnapshots(); }
function openSnapshots(){ const snaps=PANEL._snaps||[];
  openModal('Snapshots', '<button class="tbtn" id="snap-new" style="width:100%;margin-bottom:8px">\ud83d\udcf7 Save current as snapshot</button>'
    +(snaps.length?snaps.map((s,i)=>'<div class="suspect" style="cursor:default"><b>'+esc(s.name)+'</b> \u00b7 '+new Date(s.ts).toLocaleString()
      +'<br><button class="tbtn" data-r="'+i+'" style="margin-top:4px">Restore</button> <button class="tbtn" data-d="'+i+'">Diff vs current</button></div>').join(''):'<div class="hint">No snapshots yet \u2014 save one before you start changing states.</div>'));
  $('#snap-new').onclick=snapSave;
  (document.querySelector('#modal')||document).querySelectorAll('[data-r]').forEach(el=>el.onclick=()=>{ const s=snaps[+el.dataset.r];
    if(confirm('Restore snapshot \u201c'+s.name+'\u201d? Current layout is replaced.')){ const keep=PANEL._snaps;
      PANEL=validatePanel(JSON.parse(JSON.stringify(s.data))); PANEL._snaps=keep; restoreUid(); persist(); applyEnc(); render(); renderInspector(); closeModal(); toast('Restored '+s.name); } });
  (document.querySelector('#modal')||document).querySelectorAll('[data-d]').forEach(el=>el.onclick=()=>{ const s=snaps[+el.dataset.d]; const d=diffPanels(s.data);
    const out=d.length?d.map(x=>'<div class="suspect" style="border-color:'+(x.t==='add'?'var(--ok)':x.t==='del'?'var(--bad)':'var(--warn)')+'">'+esc(x.msg)+'</div>').join(''):'<div class="hint" style="color:var(--ok)">Identical.</div>';
    openModal('Diff: '+s.name+' \u2192 current', out); }); }

/* ---------- 9: ladder auto-layout ---------- */
function ladderize(){ const ctrlTypes=new Set(['estop','pbNO','pbNC','selector','sensor','relay','timerON','timerOFF','light','plcIn','plcOut','contactor']);
  const nodes=PANEL.components.filter(c=>ctrlTypes.has(c.type)||(c.type==='source'&&(c.phases||1)===1));
  if(!nodes.length){ toast('No control-circuit devices to arrange'); closeModal(); return; }
  const idset=new Set(nodes.map(c=>c.id)); const adj={}; nodes.forEach(c=>adj[c.id]=new Set());
  PANEL.wires.forEach(w=>{ const a=w.a.split('|')[0],b=w.b.split('|')[0]; if(idset.has(a)&&idset.has(b)){adj[a].add(b);adj[b].add(a);} });
  const seen=new Set(); let rung=0; const ox=Math.round(-view.x/view.k)+60, oy=Math.round(-view.y/view.k)+60;
  nodes.forEach(start=>{ if(seen.has(start.id))return; const comp=[]; const q=[start.id]; seen.add(start.id);
    while(q.length){ const n=q.shift(); comp.push(n); adj[n].forEach(m=>{if(!seen.has(m)){seen.add(m);q.push(m);}}); }
    const src=comp.find(id=>findComp(id).type==='source')||comp[0]; const dist={[src]:0}; const q2=[src];
    while(q2.length){ const n=q2.shift(); adj[n].forEach(m=>{ if(dist[m]===undefined&&comp.indexOf(m)>=0){dist[m]=dist[n]+1;q2.push(m);} }); }
    comp.sort((a,b)=>(dist[a]||0)-(dist[b]||0));
    let x=ox; const y=oy+rung*80; comp.forEach(id=>{ const c=findComp(id); c.x=x; c.y=y; x+=compDef(c).w+40; }); rung++; });
  persist(); render(); closeModal(); toast('Control circuit arranged into '+rung+' rung(s)'); }

/* ---------- 10: terminal-strip view ---------- */
function terminalReport(){ const terms=PANEL.components.filter(c=>c.type==='term'||c.type==='tstrip');
  let html;
  if(terms.length){ html=terms.map(tb=>{ const lands=[];
    termList(tb).forEach(t=>{ const k=tb.id+'|'+t.id; PANEL.wires.forEach(w=>{ const o=w.a===k?w.b:(w.b===k?w.a:null);
      if(o){ const oc=findComp(o.split('|')[0]); lands.push((oc?(oc.label||oc.id):o.split('|')[0])+' \u00b7 '+o.split('|')[1]+(w.label?'  #'+w.label:'')); } }); });
    return '<div class="suspect" style="cursor:default"><b>'+esc(tb.label||tb.id)+'</b><br>'+(lands.length?lands.map(esc).join('<br>'):'<span class="hint">(nothing landed)</span>')+'</div>'; }).join('');
  } else { html='<div class="hint">No terminal-block components in this panel. Place \u201cTerminal\u201d parts to model a terminal strip, then wire to them.</div>'; }
  openModal('Terminal strip', html); }

/* ---------- 7: project / tabs ---------- */
function projPersist(){ if(PROJECT){ try{ localStorage.setItem('acy1_project',JSON.stringify(PROJECT)); }catch(e){ if(typeof toast==='function') toast('Project auto-save failed'); } } }
function projRestore(){ try{ const s=localStorage.getItem('acy1_project'); if(s){ PROJECT=JSON.parse(s); if(PROJECT&&Array.isArray(PROJECT.panels)){ PROJECT.panels=PROJECT.panels.map(p=>{ try{return validatePanel(p);}catch(e){return {name:'Corrupt',components:[],wires:[]};} }); } return true; } }catch(e){} return false; }
function projEnsure(){ if(!PROJECT){ PROJECT={name:'Project', panels:[JSON.parse(JSON.stringify(PANEL))], active:0}; } }
function projSaveActive(){ if(PROJECT){ PROJECT.panels[PROJECT.active]=JSON.parse(JSON.stringify(PANEL)); projPersist(); } }
function projSwitch(i){ if(!PROJECT||i<0||i>=PROJECT.panels.length)return; projSaveActive(); PROJECT.active=i;
  PANEL=validatePanel(JSON.parse(JSON.stringify(PROJECT.panels[i]))); restoreUid(); sel=null;selWire=null;selSet=[];netHi=null;
  _hist=[];_histFwd=[];_lastSnap=JSON.stringify(PANEL);_histLock=true; persist(); _histLock=false; applyEnc(); if(typeof applyView==='function')applyView(); render(); renderInspector(); renderTabs(); }
function projAdd(){ projEnsure(); projSaveActive(); PROJECT.panels.push({name:'Panel '+(PROJECT.panels.length+1),backdrop:null,components:[],wires:[]}); projSwitch(PROJECT.panels.length-1); }
function projRename(){ projEnsure(); const n=prompt('Panel name:',PANEL.name||''); if(n===null)return; PANEL.name=n; PROJECT.panels[PROJECT.active].name=n; persist(); projPersist(); render(); renderTabs(); }
function projClose(i){ if(!PROJECT||PROJECT.panels.length<=1){ toast('A project needs at least one panel'); return; }
  if(!confirm('Remove this panel from the project?'))return; PROJECT.panels.splice(i,1); if(PROJECT.active>=PROJECT.panels.length)PROJECT.active=PROJECT.panels.length-1; projSwitch(PROJECT.active); }
function renderTabs(){ const bar=$('#tabbar'); if(!bar)return;
  if(!PROJECT){ bar.style.display='none'; return; } bar.style.display='flex';
  bar.innerHTML=PROJECT.panels.map((p,i)=>'<div class="tab'+(i===PROJECT.active?' on':'')+'" data-i="'+i+'">'+esc(p.name||('Panel '+(i+1)))+'<span class="tabx" data-x="'+i+'">\u00d7</span></div>').join('')
    +'<button class="tab tabadd" id="tab-add">+ Panel</button>';
  bar.querySelectorAll('.tab[data-i]').forEach(el=>el.onclick=ev=>{ if(ev.target.classList.contains('tabx'))return; projSwitch(+el.dataset.i); });
  bar.querySelectorAll('.tabx').forEach(el=>el.onclick=ev=>{ ev.stopPropagation(); projClose(+el.dataset.x); });
  const ta=$('#tab-add'); if(ta)ta.onclick=projAdd; }
function toggleProject(){ if(PROJECT){ projSaveActive(); PROJECT=null; try{localStorage.removeItem('acy1_project');}catch(e){} renderTabs(); toast('Project mode off (single panel)'); }
  else { projEnsure(); projPersist(); renderTabs(); toast('Project mode on \u2014 add panels as tabs'); } }
function followLink(name){ if(PROJECT){ const i=PROJECT.panels.findIndex(p=>(p.name||'')===name); if(i>=0){ projSwitch(i); return; } } loadLibPanel(name); }

/* ---------- 11: copy / paste ---------- */
function copySel(){ const set=selSet.length?selSet:(sel?[sel]:[]); if(!set.length){toast('Select something to copy');return;}
  const ids=new Set(set.map(c=>c.id));
  clipboard={ comps:set.map(c=>JSON.parse(JSON.stringify(c))), wires:PANEL.wires.filter(w=>ids.has(w.a.split('|')[0])&&ids.has(w.b.split('|')[0])).map(w=>JSON.parse(JSON.stringify(w))) };
  toast(set.length+' copied'); }
function pasteSel(){ if(!clipboard){toast('Nothing copied');return;} const map={}; const news=[];
  clipboard.comps.forEach(c=>{ const nc=JSON.parse(JSON.stringify(c)); const oid=nc.id; nc.id=nid(nc.type); map[oid]=nc.id; nc.x=(nc.x||0)+30; nc.y=(nc.y||0)+30; PANEL.components.push(nc); news.push(nc); });
  clipboard.wires.forEach(w=>{ const [a,ta]=w.a.split('|'),[b,tb]=w.b.split('|'); if(map[a]&&map[b]) PANEL.wires.push({id:nid('w'),a:map[a]+'|'+ta,b:map[b]+'|'+tb,net:w.net,label:w.label}); });
  selSet=news; sel=null; selWire=null; persist(); render(); renderInspector(); toast(news.length+' pasted'); }

/* ---------- 12: command palette ---------- */
function commandList(){ const cmds=[
    {t:'Mode: Build',f:()=>setMode('build')},{t:'Mode: Simulate',f:()=>setMode('sim')},
    {t:'Draw wire',f:()=>setTool('wire')} ];
  PAL.forEach(tp=>cmds.push({t:'Place: '+T[tp].name,f:()=>setTool(tp)}));
  cmds.push({t:'Tools\u2026',f:openTools},{t:'Templates\u2026',f:openTemplates},{t:'Snapshots\u2026',f:openSnapshots},
    {t:'Terminal strip\u2026',f:terminalReport},{t:'Ladderize control circuit',f:ladderize},
    {t:'Export wire schedule (CSV)',f:exportWireCsv},{t:'Print troubleshooting worksheet',f:printWorksheet},
    {t:'Play / pause sequence',f:togglePlay},{t:'Undo',f:undo},{t:'Redo',f:redo},{t:'Copy',f:copySel},{t:'Paste',f:pasteSel},
    {t:'Toggle live voltages',f:()=>{showVolts=!showVolts;render();}},{t:'Toggle amps',f:()=>{showAmps=!showAmps;render();}},
    {t:'Toggle ortho wires',f:()=>{orthoWire=!orthoWire;render();}},{t:'Toggle grid snap',f:()=>{gridSnap=!gridSnap;toast(gridSnap?'Grid snap on':'Grid snap off');}},
    {t:'Project / panel tabs',f:toggleProject},{t:'New / clear panel',f:()=>$('#btnClear').click()});
  return cmds; }
function openPalette(){ openModal('Command palette',
    '<input id="cmd-in" placeholder="Type a command\u2026" autocomplete="off" style="width:100%;padding:9px;font-size:14px;background:var(--panel2);border:1px solid var(--accent);border-radius:7px;color:var(--txt)">'
    +'<div id="cmd-list" style="margin-top:8px;max-height:52vh;overflow:auto"></div>');
  const all=commandList(); const inp=$('#cmd-in'), list=$('#cmd-list');
  function draw(f){ const q=(f||'').toLowerCase(); const items=all.filter(c=>c.t.toLowerCase().includes(q));
    list.innerHTML=items.map((c,i)=>'<div class="cmd-item'+(i===0?' sel':'')+'" data-t="'+esc(c.t)+'">'+esc(c.t)+'</div>').join('');
    list.querySelectorAll('.cmd-item').forEach(el=>el.onclick=()=>{ const c=all.find(x=>x.t===el.dataset.t); closeModal(); if(c)c.f(); }); }
  draw(''); inp.oninput=()=>draw(inp.value);
  inp.onkeydown=e=>{ if(e.key==='Enter'){ const q=inp.value.toLowerCase(); const c=all.find(x=>x.t.toLowerCase().includes(q)); if(c){closeModal();c.f();} } if(e.key==='Escape')closeModal(); };
  if(typeof setTimeout!=='undefined')setTimeout(()=>{try{inp.focus();}catch(e){}},30); }

/* ---------- init ---------- */
function initExtras3(){ projRestore(); renderTabs();
  const bp=$('#btnPlay'); if(bp)bp.onclick=togglePlay;
  const ba=$('#btnAmps'); if(ba)ba.onclick=()=>{showAmps=!showAmps;ba.classList.toggle('on',showAmps);render();};
  const bg=$('#btnGrid'); if(bg)bg.onclick=()=>{gridSnap=!gridSnap;bg.classList.toggle('on',gridSnap);toast(gridSnap?'Grid snap on':'Grid snap off');};
  const bpr=$('#btnProj'); if(bpr)bpr.onclick=toggleProject;
  document.addEventListener('keydown',ev=>{ const tag=(ev.target&&ev.target.tagName)||''; if(/INPUT|TEXTAREA|SELECT/.test(tag)){ if((ev.ctrlKey||ev.metaKey)&&(ev.key==='k'||ev.key==='K')){ ev.preventDefault(); openPalette(); } return; }
    if((ev.ctrlKey||ev.metaKey)&&(ev.key==='k'||ev.key==='K')){ ev.preventDefault(); openPalette(); }
    else if((ev.ctrlKey||ev.metaKey)&&(ev.key==='c'||ev.key==='C')){ copySel(); }
    else if((ev.ctrlKey||ev.metaKey)&&(ev.key==='v'||ev.key==='V')){ pasteSel(); }
    else if(ev.key===' '&&mode==='sim'&&!_playing){ ev.preventDefault(); play(); }
    else if(ev.key===' '&&_playing){ ev.preventDefault(); stopPlay(); } }); }

/* =========================================================================
   ELECTRON WRANGLER — EXTRAS4 (features 38-49). fn decls hoist; state via var.
   ========================================================================= */
var showPhase=false, showTherm=false, cbSafe=false, _pointers={}, _pinch=null, scenario=null, _scenTimer=0;
var PHASE_COLOR={L1:'#b45309',L2:'#ea580c',L3:'#eab308',L:'#38bdf8'};


/* ---------- 3: short-circuit / coordination ---------- */
function nearestProtector(comp){ const key=(c,t)=>c.id+'|'+t; const adj={};
  const add=(a,b)=>{ (adj[a]=adj[a]||[]).push(b); (adj[b]=adj[b]||[]).push(a); };
  PANEL.wires.forEach(w=>{ if(!w.cut)add(w.a,w.b); });
  PANEL.components.forEach(c=>{ compDef(c).links(c).forEach(([x,y])=>add(key(c,x),key(c,y))); });
  const starts=termList(comp).map(t=>key(comp,t.id));
  const q=starts.map(s=>[s,0]); const seen=new Set(starts); const found=[];
  while(q.length){ const [n,dist]=q.shift(); const cid=n.split('|')[0]; const c=findComp(cid);
    if(c&&c!==comp&&['breaker','fuse','disc'].includes(c.type)){ if(!found.some(f=>f.c===c))found.push({c,dist}); }
    (adj[n]||[]).forEach(m=>{ if(!seen.has(m)){ seen.add(m); q.push([m,dist+1]); } }); }
  found.sort((a,b)=>a.dist-b.dist); return found; }
function boltedFault(comp){ const prot=nearestProtector(comp);
  if(!prot.length){ toast('No breaker/fuse between here and the source \u2014 unprotected!'); return; }
  const p=prot[0].c; if(p.type==='fuse')p.state='blown'; else if(p.type==='disc')p.state='open'; else p.state='tripped';
  solve(); render(); renderSimInspector();
  const sel2=prot.length>1?(' Upstream '+(prot[1].c.label||prot[1].c.type)+' held (good selectivity).'):'';
  toast('\u26a1 Bolted fault \u2192 '+(p.label||p.type)+' cleared it.'+sel2); }
function coordinationStudy(){ solve(); const prot=PANEL.components.filter(c=>['breaker','fuse','disc'].includes(c.type));
  const issues=[]; const key=(c,t)=>c.id+'|'+t; const uf=solve._uf;
  prot.forEach(p=>{ const proots=new Set(termList(p).map(t=>uf.find(key(p,t.id))));
    const downLoads=PANEL.components.filter(c=>(compDef(c).load||compDef(c).coil)&&termList(c).some(t=>proots.has(uf.find(key(c,t.id)))));
    const downProt=prot.filter(x=>x!==p&&termList(x).some(t=>proots.has(uf.find(key(x,t.id)))));
    issues.push({lvl:downProt.length?'ok':'info', msg:(p.label||p.type)+(p.amps?(' ('+p.amps+'A)'):'')+' protects '+downLoads.length+' load(s)'+(downProt.length?', with '+downProt.length+' downstream device(s) for selectivity':' \u2014 last device before the load'), ref:p.id}); });
  if(!issues.length) issues.push({lvl:'info',msg:'No protective devices in this panel.'});
  return {issues}; }

/* ---------- 4: component health + thermal ---------- */
function healthColor(h){ return h==='failed'?'#ef4444':h==='due'?'#f97316':h==='aging'?'#eab308':'#22c55e'; }
function tempColor(t){ t=+t||0; return t>=175?'#ef4444':t>=140?'#f97316':t>=100?'#eab308':'#22c55e'; }
function healthReport(){ const issues=[];
  PANEL.components.forEach(c=>{ if(c.health&&c.health!=='ok') issues.push({lvl:c.health==='failed'?'warn':'info',msg:(c.label||compDef(c).name)+': '+c.health.toUpperCase()+(c.serviced?(' \u00b7 last service '+c.serviced):''),ref:c.id});
    if(c.temp&&+c.temp>=140) issues.push({lvl:'warn',msg:(c.label||compDef(c).name)+': hot spot '+c.temp+'\u00b0F \u2014 investigate/torque',ref:c.id}); });
  if(!issues.length) issues.push({lvl:'ok',msg:'All components OK \u2014 no aging/overdue/hot items flagged.'});
  return {issues}; }

/* ---------- 5: PM checklist ---------- */
const PM_DEFAULT=['Lock out / tag out verified','Thermal scan of terminations','Torque check power lugs','Tighten control terminals','Inspect contactor tips','Test E-stop & safety string','Clean enclosure / check filters','Verify labels & schematic current'];
function openPM(){ PANEL.pm=PANEL.pm||PM_DEFAULT.map(t=>({text:t,done:false}));
  const rows=PANEL.pm.map((it,i)=>'<div class="pmrow"><label><input type="checkbox" data-i="'+i+'"'+(it.done?' checked':'')+'> '+esc(it.text)+'</label></div>').join('');
  openModal('PM checklist \u2014 '+esc(PANEL.name||''), rows
    +'<div style="margin-top:8px;display:flex;gap:6px"><input id="pm-add" placeholder="Add item\u2026" style="flex:1;background:var(--panel2);border:1px solid var(--edge);border-radius:6px;color:var(--txt);padding:6px"><button class="tbtn" id="pm-addb">Add</button></div>'
    +'<button class="tbtn" id="pm-print" style="width:100%;margin-top:8px">\ud83d\udda8 Print checklist</button>');
  (document.querySelector('#modal')||document).querySelectorAll('[data-i]').forEach(el=>el.onchange=()=>{ PANEL.pm[+el.dataset.i].done=el.checked; persist(); });
  $('#pm-addb').onclick=()=>{ const v=$('#pm-add').value.trim(); if(v){ PANEL.pm.push({text:v,done:false}); persist(); openPM(); } };
  $('#pm-print').onclick=()=>{ const w=window.open('','_blank'); if(!w)return;
    w.document.write('<!doctype html><meta charset=utf-8><title>PM \u2014 '+esc(PANEL.name||'')+'</title><style>body{font:14px Segoe UI,Arial;margin:26px}li{margin:8px 0}h1{font-size:18px}</style>'
      +'<h1>Preventive Maintenance \u2014 '+esc(PANEL.name||'')+'</h1><div>Date ______  Tech ______</div><ul>'
      +PANEL.pm.map(it=>'<li>\u2610 '+esc(it.text)+'</li>').join('')+'</ul>'); w.document.close(); setTimeout(()=>{try{w.print();}catch(e){}},300); }; }

/* ---------- 6: scenario library + scoring ---------- */
var SCEN=[
  {id:'trip',name:'Conveyor dead \u2014 no run',prompt:'The conveyor won\u2019t start and nothing is energized downstream. Find the fault.'},
  {id:'estop',name:'E-stop won\u2019t reset',prompt:'Operators report the line won\u2019t start after an E-stop event. Find what\u2019s open.'},
  {id:'ol',name:'Motor trips on start',prompt:'Motor tries to start then everything drops. Find the tripped protection.'},
  {id:'sp',name:'Motor hums, won\u2019t turn',prompt:'Motor buzzes/hums but will not rotate (classic symptom). Find the cause.'}
];
function scenarioPanel(kind){ const P={name:'Scenario',backdrop:null,components:[],wires:[]}; let u=1;
  const add=(t,x,y,e)=>{const d=T[t];const c=Object.assign({id:t+(u++),type:t,x,y,label:''},e||{});if(['disc','breaker','contactor','overload'].includes(t))c.poles=c.poles||3;if(d.sw&&!c.state)c.state=d.states[0];P.components.push(c);return c;};
  const w=(a,ta,b,tb,net)=>P.wires.push({id:'w'+(u++),a:a.id+'|'+ta,b:b.id+'|'+tb,net});
  const src=add('source',40,60,{phases:3,volts:'480V',label:'PWR'});
  const cb=add('breaker',170,60,{label:'CB1',state:'closed'});
  const ct=add('contactor',300,52,{label:'M1'});
  const ol=add('overload',430,56,{label:'OL1',state:'ok'});
  const mt=add('motor',570,150,{phases:3,label:'CONV',hp:5,volts:'480V'});
  for(let i=0;i<3;i++){w(src,'L'+(i+1),cb,'in'+i,'hot');w(cb,'out'+i,ct,'L'+(i+1),'hot');w(ct,'T'+(i+1),ol,'L'+(i+1),'hot');}
  w(ol,'T1',mt,'U','hot');w(ol,'T2',mt,'V','hot');w(ol,'T3',mt,'W','hot');
  const cs=add('source',40,300,{phases:1,volts:'120V',label:'CTRL'});
  const es=add('estop',150,290,{state:'closed',label:'ESTOP'});
  const stop=add('pbNC',240,290,{state:'closed',label:'STOP'});
  const start=add('pbNO',330,290,{state:'closed',label:'START'});
  w(cs,'L',es,'a','hot');w(es,'b',stop,'a','ctrl');w(stop,'b',start,'a','ctrl');w(start,'b',ct,'A1','ctrl');w(ct,'A2',cs,'N','ret');
  let answer=cb.id;
  if(kind==='trip'){ cb.state='tripped'; answer=cb.id; }
  else if(kind==='estop'){ es.state='open'; answer=es.id; }
  else if(kind==='ol'){ ol.state='tripped'; answer=ol.id; }
  else if(kind==='sp'){ P.wires=P.wires.filter(x=>x.a!==cb.id+'|out2'&&x.b!==cb.id+'|out2'); answer=cb.id; }
  return {panel:P, answer}; }
function startScenario(kind){ const def=SCEN.find(s=>s.id===kind); const sp=scenarioPanel(kind); const _prev=(scenario&&scenario.prev)?scenario.prev:JSON.stringify(PANEL);
  PANEL=validatePanel(sp.panel); restoreUid(); scenario={id:kind, answer:sp.answer, t0:Date.now(), done:false, prev:_prev};
  sel=null;selWire=null;selSet=[]; setMode('sim'); persist(); render(); renderSimInspector(); closeModal();
  toast('\u25b6 Scenario: '+def.name); }
function scenarioGuess(){ if(!scenario||!sel){ toast('Click the device you suspect first'); return; }
  if(scenario.done){ toast(scenario.done==='timeout'?'\u23f1 Time expired \u2014 Exit to retry':'Already solved \u2014 Exit for another'); return; }
  if(scenario.isSev){ const t=Math.round((Date.now()-scenario.t0)/1000);
    var A=scenario.answers||[[scenario.answer]], F=scenario.found||A.map(function(){return false;}); scenario.found=F;
    var hitIdx=-1; for(var _i=0;_i<A.length;_i++){ if(A[_i].indexOf(sel.id)>=0){ hitIdx=_i; break; } }
    if(hitIdx>=0 && F[hitIdx]){ var _lft=F.filter(function(x){return !x;}).length; toast('\u2705 Already found that one \u2014 '+_lft+' fault'+(_lft===1?'':'s')+' left'); renderSimInspector(); return; }
    if(hitIdx>=0){ F[hitIdx]=true; var _rem2=F.filter(function(x){return !x;}).length;
      if(_rem2===0){ scenario.done=true; scenario._solveT=t; _sevStop();
        let b=null; try{b=+localStorage.getItem('pt_sev_'+scenario.id)||null;}catch(e){}
        if(!b||t<b){ try{localStorage.setItem('pt_sev_'+scenario.id,t);}catch(e){} }
        try{localStorage.setItem('pt_sev_'+scenario.id+'_pass',(+localStorage.getItem('pt_sev_'+scenario.id+'_pass')||0)+1);}catch(e){}
        toast('\u2705 '+(A.length>1?('ALL '+A.length+' faults cleared'):'SEV cleared')+' in '+t+'s / '+scenario.limit+'s'+(b&&t<b?' \u2014 new best!':b?(' (best '+b+'s)'):'')); _sevHud(); }
      else { var _fn=A.length-_rem2; toast('\u2705 Fault '+_fn+' of '+A.length+' found \u2014 keep looking, '+_rem2+' left'); _sevHud(); } }
    else { if(scenario.guided){ sel._ruledOut=true;
        var _best=99; for(var _j=0;_j<A.length;_j++){ if(F[_j])continue; var _dd=_compDist(sel.id,A[_j][0]); if(_dd<_best)_best=_dd; }
        var _hot=_best<=1?'very close \ud83d\udd25':_best<=2?'close':_best<=4?'getting warmer':'cold \u2014 wrong area';
        var _rem=PANEL.components.filter(function(c){var dd=compDef(c);return !c._ruledOut&&(dd.sw||dd.load||dd.coil||dd.psu);}).length;
        toast('\u274c Ruled out (device is good). Nearest fault is '+_hot+' \u2014 '+_sevRemain()+'s, ~'+_rem+' suspects left'); render(); }
      else toast('\u274c Not a fault \u2014 '+_sevRemain()+'s left, keep tracing'); }
    renderSimInspector(); return; }
  const secs=Math.round((Date.now()-scenario.t0)/1000); const ok=Array.isArray(scenario.answer)?scenario.answer.indexOf(sel.id)>=0:sel.id===scenario.answer; if(ok)scenario.done=true;
  let best=null; try{ best=+localStorage.getItem('pt_scen_'+scenario.id)||null; }catch(e){}
  if(ok&&(!best||secs<best)){ try{localStorage.setItem('pt_scen_'+scenario.id,secs);}catch(e){} }
  toast(ok?('\u2705 Correct in '+secs+'s'+(best&&secs<best?' \u2014 new best!':best?(' (best '+best+'s)'):'')):'\u274c Not it \u2014 keep tracing');
  renderSimInspector(); }
function exitScenario(){ if(!scenario)return; if(typeof _sevStop==='function')_sevStop(); const prev=scenario.prev; scenario=null; sel=null;selWire=null;selSet=[]; if(typeof _sevHud==='function')_sevHud(); if(prev){ try{ PANEL=validatePanel(JSON.parse(prev)); restoreUid(); }catch(e){} } persist(); render(); renderSimInspector(); toast('← Exited scenario — your panel is back'); }
function openScenarios(){ let best={}; SCEN.forEach(s=>{try{best[s.id]=localStorage.getItem('pt_scen_'+s.id);}catch(e){}});
  openModal('Training scenarios', SCEN.map(s=>'<div class="suspect" style="cursor:pointer" data-s="'+s.id+'"><b>'+esc(s.name)+'</b>'+(best[s.id]?' <span style="color:var(--ok)">\u00b7 best '+esc(String(best[s.id]))+'s</span>':'')+'<br><span class="hint">'+esc(s.prompt)+'</span></div>').join(''));
  (document.querySelector('#modal')||document).querySelectorAll('[data-s]').forEach(el=>el.onclick=()=>startScenario(el.dataset.s)); }

/* ---------- 6b: Sev Event trainer (timed) ---------- */
var CATS={power:{name:'\u26a1 Power & Protection',col:'#f59e0b'},open:{name:'\U0001F50C Open Circuits & Loose Wires',col:'#3b82f6'},motor:{name:'\U0001F300 Motor Faults',col:'#a855f7'},vdrop:{name:'\U0001F4C9 Voltage Drop / High-Resistance',col:'#14b8a6'},safety:{name:'\U0001F6E1 Safety Circuits',col:'#ef4444'},controls:{name:'\U0001F9E0 Controls & PLC I/O',col:'#22c55e'},building:{name:'\U0001F3E0 Building / Residential',col:'#f97316'},multi:{name:'\U0001F3AF Compound \u2014 find ALL faults',col:'#e879f9'},custom:{name:'\U0001F4CB My Calls',col:'#94a3b8'}};
var CAT_ORDER=['power','motor','open','vdrop','safety','controls','building','multi','custom'];
function _stars(n){return '\u2605'.repeat(n)+'\u2606'.repeat(Math.max(0,3-n));}
var _sevGuided=false; try{_sevGuided=localStorage.getItem('pt_guided')==='1';}catch(e){}
const AET={"RANKS":[{"lvl":1,"name":"Apprentice","xp":0},{"lvl":2,"name":"Journeyman","xp":150},{"lvl":3,"name":"Junior Tech","xp":400},{"lvl":4,"name":"Technician","xp":800},{"lvl":5,"name":"Senior Tech","xp":1400},{"lvl":6,"name":"Controls Tech","xp":2200},{"lvl":7,"name":"Automation Specialist","xp":3200},{"lvl":8,"name":"Lead Technician","xp":4500},{"lvl":9,"name":"Controls Engineer","xp":6200},{"lvl":10,"name":"Automation Master","xp":8500}],"XP":{"module_open":5,"quiz_correct":10,"quiz_perfect":40,"module_done":60,"flashcard":3,"flash_graduate":25,"sim_use":15,"exam_pass":300,"exam_ace":150,"track_done":250,"daily_visit":20},"FLASHCARDS":[{"f":"Ohm's Law","b":"V = I x R  (Volts = Amps x Ohms). Power: P = V x I = I&sup2; x R = V&sup2; / R"},{"f":"Three-phase power","b":"P = &#8730;3 x V(line) x I(line) x PF  (watts). &#8730;3 &approx; 1.732"},{"f":"Synchronous motor speed","b":"Ns (RPM) = 120 x f / poles.  60Hz, 4-pole = 1800 RPM synchronous"},{"f":"Motor slip","b":"Slip % = (Ns - Nfl) / Ns x 100.  Typical 2-5% at full load"},{"f":"VFD V/Hz ratio","b":"Constant V/Hz keeps motor flux steady. 460V / 60Hz &approx; 7.67 V/Hz"},{"f":"4-20 mA scaling","b":"% = (mA - 4) / 16 x 100.  EU = min + (%/100) x (max - min).  4mA = live zero"},{"f":"MTBF","b":"Mean Time Between Failures = total operating time / number of failures"},{"f":"MTTR","b":"Mean Time To Repair = total downtime / number of repairs"},{"f":"Availability","b":"A = MTBF / (MTBF + MTTR).  Uptime as a fraction of total time"},{"f":"OEE","b":"Overall Equipment Effectiveness = Availability x Performance x Quality. World-class &ge; 85%"},{"f":"PLC scan cycle","b":"1) Read inputs  2) Solve logic (top-to-bottom, left-to-right)  3) Write outputs  4) Housekeeping/comms"},{"f":"XIC vs XIO","b":"XIC (Examine If Closed) = TRUE when bit = 1.  XIO (Examine If Open) = TRUE when bit = 0"},{"f":"TON timer","b":"Timer On-Delay: accumulates while input is TRUE; DN bit sets when ACC reaches PRE"},{"f":"Seal-in (3-wire control)","b":"An aux contact of the run relay wired parallel to the momentary Start PB keeps the coil energized"},{"f":"NPN vs PNP sensor","b":"NPN = sinking (switches load to 0V / ground).  PNP = sourcing (switches load to +V)"},{"f":"RTD vs thermocouple","b":"RTD: resistance changes with temp (Pt100, precise, lower range). TC: voltage from dissimilar-metal junction (wide range, less precise)"},{"f":"Pascal's Law","b":"Pressure in an enclosed fluid transmits equally in all directions.  Force = Pressure x Area"},{"f":"Pneumatic cylinder force","b":"Force = Pressure x Piston Area.  Extend uses full bore area; retract loses the rod area"},{"f":"PID terms","b":"P reacts to present error, I eliminates steady-state offset (past), D dampens rate of change (future)"},{"f":"Directional valve notation","b":"x/y valve: x = ports, y = positions.  5/2 = 5 ports, 2 positions (typical double-acting cylinder)"},{"f":"LOTO","b":"Lockout/Tagout (OSHA 1910.147): isolate, lock, tag, and verify zero energy before servicing"},{"f":"Arc-flash standard","b":"NFPA 70E governs electrical safety and arc-flash PPE / boundaries in the workplace"},{"f":"ISO 13849 PL","b":"Performance Levels PL a (lowest) to PL e (highest) quantify safety-function reliability"},{"f":"E-stop categories","b":"Cat 0 = immediate removal of power. Cat 1 = controlled stop, then power removed"},{"f":"SCCR","b":"Short-Circuit Current Rating: max fault current a panel can safely withstand (UL 508A)"},{"f":"Ethernet/IP vs PROFINET","b":"Ethernet/IP = CIP over standard Ethernet (Rockwell). PROFINET = Siemens industrial Ethernet"},{"f":"Modbus RTU vs TCP","b":"RTU = serial (RS-485). TCP = Modbus frames over Ethernet. Simple, widely supported"},{"f":"MQTT QoS","b":"0 = fire-and-forget, 1 = at least once, 2 = exactly once. Sparkplug B standardizes SCADA topics"},{"f":"Half-split troubleshooting","b":"Test at the midpoint of a suspect path; each good/bad result halves the search space"},{"f":"True-RMS meter","b":"Required to accurately measure the non-sinusoidal (chopped) output of a VFD"}],"TRACKS":[{"id":"found","name":"Foundations","icon":"&#9889;","color":"#e94560","desc":"Power protection and open-circuit faults - breakers, fuses, disconnects, and broken conductors. The first things every tech must own.","mods":[0,1,2,3]},{"id":"field","name":"Field Devices & Drives","icon":"&#128225;","color":"#f39c12","desc":"Sensors, instrumentation, motors, VFDs, and fluid power - the muscles and senses of a machine.","mods":[4,5,6]},{"id":"systems","name":"Systems & Control","icon":"&#128421;","color":"#5dade2","desc":"HMI/SCADA, industrial networks, robotics, and PID process control - tying it all together.","mods":[7,8,9,10]},{"id":"safety","name":"Safety & Advanced","icon":"&#128737;","color":"#27ae60","desc":"Machine safety, advanced PLC programming, and IIoT / Industry 4.0.","mods":[11,13,14]},{"id":"reliab","name":"Reliability & Career","icon":"&#127942;","color":"#9b59b6","desc":"Residential wiring and compound multi-fault calls - applying diagnostic discipline when the circuit is unfamiliar or more than one thing is broken.","mods":[12,15,16,17,18]}],"GLOSSARY":[{"t":"AET","d":"Automation Engineering Technology - applied discipline of industrial automation systems"},{"t":"PLC","d":"Programmable Logic Controller - ruggedized industrial computer for real-time control"},{"t":"HMI","d":"Human-Machine Interface - operator panel/screen for machine interaction"},{"t":"SCADA","d":"Supervisory Control And Data Acquisition - plant-wide monitoring/control system"},{"t":"VFD","d":"Variable Frequency Drive - controls AC motor speed by varying frequency and voltage"},{"t":"OPC-UA","d":"Open Platform Communications Unified Architecture - vendor-neutral industrial data exchange"},{"t":"IIoT","d":"Industrial Internet of Things - connecting equipment to networks for data/analytics"},{"t":"MQTT","d":"Message Queuing Telemetry Transport - lightweight pub/sub protocol for IoT"},{"t":"Ladder Logic","d":"Graphical PLC programming language resembling relay wiring diagrams"},{"t":"Structured Text","d":"Text-based PLC language (IEC 61131-3), similar to Pascal"},{"t":"AOI","d":"Add-On Instruction - reusable custom PLC logic block (Rockwell)"},{"t":"UDT","d":"User-Defined Type - custom data structure grouping related tags"},{"t":"FBD","d":"Function Block Diagram - graphical PLC language using connected blocks"},{"t":"SFC","d":"Sequential Function Chart - state-machine PLC language for sequences"},{"t":"XIC","d":"Examine If Closed - ladder instruction TRUE when bit=1"},{"t":"XIO","d":"Examine If Open - ladder instruction TRUE when bit=0"},{"t":"OTE","d":"Output Energize - ladder output ON when rung true, OFF when false"},{"t":"TON","d":"Timer On-Delay - accumulates while input true, DN bit sets at preset"},{"t":"CTU","d":"Count Up - increments on each false-to-true transition"},{"t":"NPN","d":"Sinking sensor/output - switches load to 0V (ground)"},{"t":"PNP","d":"Sourcing sensor/output - switches load to +V (supply)"},{"t":"4-20 mA","d":"Standard analog signal: 4mA=zero (live zero for fault detection), 20mA=full scale"},{"t":"RTD","d":"Resistance Temperature Detector - precise temp sensor (Pt100 common)"},{"t":"Thermocouple","d":"Temperature sensor using junction of dissimilar metals (J/K/T types)"},{"t":"Encoder","d":"Position/speed feedback device - incremental (A/B/Z) or absolute"},{"t":"PPR","d":"Pulses Per Revolution - encoder resolution specification"},{"t":"V/Hz","d":"Volts per Hertz ratio - maintained constant in VFD to preserve motor flux"},{"t":"IGBT","d":"Insulated-Gate Bipolar Transistor - switching device in VFD inverter section"},{"t":"DC Bus","d":"Internal DC voltage section of a VFD (capacitor bank, ~650V for 480V input)"},{"t":"FRL","d":"Filter-Regulator-Lubricator - pneumatic air preparation unit"},{"t":"DCV","d":"Directional Control Valve - controls air/oil flow direction (3/2, 5/2, 5/3)"},{"t":"Pascal's Law","d":"Pressure in enclosed fluid is transmitted equally: F = P x A"},{"t":"PID","d":"Proportional-Integral-Derivative controller for closed-loop process control"},{"t":"SP/PV/CV","d":"Setpoint / Process Variable / Control Variable (output) in a control loop"},{"t":"ISA-5.1","d":"Standard for P&ID instrument tag and symbol conventions"},{"t":"P&ID","d":"Piping and Instrumentation Diagram - process engineering drawing"},{"t":"LOTO","d":"Lockout/Tagout - OSHA 1910.147 procedure for controlling hazardous energy"},{"t":"NFPA 70E","d":"Standard for electrical safety / arc-flash protection in the workplace"},{"t":"NFPA 79","d":"Electrical standard for industrial machinery (panel design)"},{"t":"ISO 13849","d":"Safety standard defining Performance Levels (PL a-e) and Categories (B,1-4)"},{"t":"Performance Level","d":"ISO 13849 safety integrity measure: PL a (lowest) to PL e (highest)"},{"t":"E-Stop","d":"Emergency Stop - immediate machine stop (Category 0 or 1)"},{"t":"IEC 62443","d":"Standard series for industrial automation cybersecurity"},{"t":"SCCR","d":"Short-Circuit Current Rating - max fault current a panel can safely withstand"},{"t":"MTBF","d":"Mean Time Between Failures = Uptime / Number of failures"},{"t":"MTTR","d":"Mean Time To Repair = Downtime / Number of repairs"},{"t":"OEE","d":"Overall Equipment Effectiveness = Availability x Performance x Quality"},{"t":"FFT","d":"Fast Fourier Transform - converts time-domain vibration to frequency spectrum"},{"t":"ISA CCST","d":"Certified Control Systems Technician - industry credential (Levels I-III)"},{"t":"SACA","d":"Smart Automation Certification Alliance - Industry 4.0 credentials"},{"t":"Ethernet/IP","d":"Industrial Ethernet protocol (CIP over TCP/UDP), Allen-Bradley standard"},{"t":"PROFINET","d":"Industrial Ethernet protocol, Siemens standard"},{"t":"Modbus","d":"Simple serial/TCP industrial protocol (RTU=serial, TCP=Ethernet)"},{"t":"RPI","d":"Requested Packet Interval - cyclic I/O exchange rate in Ethernet/IP (ms)"},{"t":"DLR","d":"Device Level Ring - fault-tolerant ring topology for Ethernet/IP devices"},{"t":"TCP/IP","d":"Transmission Control Protocol / Internet Protocol - foundation of all Ethernet"},{"t":"Scan Cycle","d":"PLC execution loop: read inputs, solve logic, write outputs, housekeeping"},{"t":"Seal-in","d":"Auxiliary contact in parallel with Start PB to maintain motor coil circuit"},{"t":"Megohmmeter","d":"Tests insulation resistance at high DC voltage (500V/1000V) in megohms"},{"t":"True RMS","d":"Meter that accurately measures non-sinusoidal waveforms (required for VFD output)"},{"t":"CAT III/IV","d":"IEC safety categories for test equipment (III=distribution, IV=origin)"},{"t":"Sparkplug B","d":"Industrial MQTT specification standardizing topic/payload for SCADA"},{"t":"Slip","d":"The small difference between an induction motor's synchronous speed and its actual rotor speed; without slip no torque is produced"},{"t":"Synchronous Speed","d":"The rotating-magnetic-field speed of an AC motor = 120 x frequency / number of poles (e.g. 1800 RPM for a 4-pole on 60 Hz)"},{"t":"RMS","d":"Root Mean Square - the equivalent DC value that does the same heating work as an AC waveform; what a meter displays for AC"},{"t":"Power Factor","d":"Cosine of the phase angle between voltage and current; how much current does real work versus just magnetizing (low PF = wasted current)"},{"t":"KVL","d":"Kirchhoff's Voltage Law - the voltage drops around any closed loop sum to zero"},{"t":"KCL","d":"Kirchhoff's Current Law - current into a node equals current out of it"},{"t":"Ohm's Law","d":"V = I x R - the relationship between voltage, current, and resistance; the most-used equation in troubleshooting"},{"t":"Live Zero","d":"The 4 mA lower end of a 4-20 mA loop, so that 0 mA unmistakably signals a broken wire or dead transmitter"},{"t":"Quadrature","d":"Two encoder channels (A and B) 90 degrees out of phase; their phase order gives direction, their rate gives speed"},{"t":"Absolute Encoder","d":"An encoder that reports its exact position even after power loss, requiring no re-homing"},{"t":"Incremental Encoder","d":"An encoder that outputs pulse trains counted to track relative position, speed, and direction"},{"t":"Input Image Table","d":"The memory snapshot of all inputs a PLC reads at the start of each scan and uses throughout the program scan"},{"t":"Last-State-Wins","d":"When one output bit is written on multiple rungs, the last rung executed in a scan determines its value"},{"t":"Sinking","d":"An NPN output/sensor that switches the negative (return) side and sinks current into the input card"},{"t":"Sourcing","d":"A PNP output/sensor that switches the positive side and sources current to the load or input card"},{"t":"OTL/OTU","d":"Output Latch / Unlatch instructions that set or clear a bit and hold it until explicitly changed"},{"t":"TOF","d":"Timer Off-Delay - keeps its output on for a preset time after the rung goes false"},{"t":"RTO","d":"Retentive Timer On-delay - accumulates time and retains it across power cycles until reset"},{"t":"CTD","d":"Count-Down counter - decrements on each false-to-true rung transition"},{"t":"State Machine","d":"A program structure where the machine is always in exactly one defined state with defined transitions - predictable and easy to troubleshoot"},{"t":"ISA-101","d":"The standard for high-performance HMI graphics: calm gray normal, color reserved for abnormal conditions"},{"t":"ISA-18.2","d":"The alarm-management standard that defines the alarm lifecycle and fights alarm floods through rationalization"},{"t":"Alarm Flood","d":"An overwhelming burst of alarms from a single event that hides the true root cause from the operator"},{"t":"Tag","d":"The named link between an HMI/SCADA object and a real value in a PLC"},{"t":"OT","d":"Operational Technology - the control-system networks and devices that run the process, valuing determinism and uptime"},{"t":"Zones and Conduits","d":"The IEC 62443 concept of grouping assets into security zones and tightly controlling the connections (conduits) between them"},{"t":"Edge Computing","d":"Processing data on or near the machine for fast local decisions and continued operation if the network drops"},{"t":"Publish/Subscribe","d":"The MQTT messaging model where devices publish to topics on a broker and clients subscribe to what they need, decoupling them"},{"t":"Broker","d":"The central MQTT server that receives published messages and routes them to subscribers"},{"t":"TCP (robot)","d":"Tool Center Point - the working tip of the robot's tool, the reference for programmed points and linear moves"},{"t":"Base Frame","d":"The fixed coordinate frame at the robot's mounting foot"},{"t":"Singularity","d":"A robot pose where the inverse-kinematics math breaks down and an axis would need near-infinite speed"},{"t":"Cobot","d":"Collaborative robot - designed with power-and-force limiting to work safely near people (ISO/TS 15066)"},{"t":"Proportional (P)","d":"The PID term that reacts to present error; fast but leaves a steady-state offset"},{"t":"Integral (I)","d":"The PID term that reacts to accumulated past error and eliminates steady-state offset"},{"t":"Derivative (D)","d":"The PID term that reacts to the rate of change of error, damping overshoot but amplifying noise"},{"t":"Open-Loop","d":"Control that commands an output with no measurement of the result (e.g. a fixed-time toaster)"},{"t":"Closed-Loop","d":"Feedback control that measures the result and self-corrects toward the setpoint"},{"t":"Hierarchy of Controls","d":"The risk-reduction order: eliminate/design-out, then engineering/guarding, then administrative, then PPE"},{"t":"Voltage Drop Method","d":"Measuring the small voltage across a connection under load to find high resistance an ohm test misses"},{"t":"Live-Dead-Live","d":"Verifying a meter on a known source before and after testing, to trust that a 'dead' reading is real"},{"t":"Availability","d":"Uptime / (uptime + downtime) - combines reliability (MTBF) and repair speed (MTTR)"},{"t":"Vibration Signature","d":"The characteristic frequency of a fault: 1x imbalance, 1x/2x misalignment, harmonics looseness, high-freq bearings"},{"t":"RCM","d":"Reliability-Centered Maintenance - choosing the maintenance strategy per asset based on criticality and failure modes"},{"t":"Commissioning","d":"The disciplined bottom-up checkout (wiring, I/O, functions, integrated) that proves a system before production"}]};
const AET_TRACK_CATS={found:['power','open'],field:['motor','vdrop'],systems:['controls'],safety:['safety'],reliab:['building','multi']};

var SEV=[
  /* ===== SEV 3 — basic / new-tech drills (one obvious fault, generous clock) ===== */
  {id:'sev-t-breaker', cat:'power', diff:1, kind:'tripped breaker', limit:240, panel:'Standard 12-Belt Induction Power \u2014 30A (M-16-00264 IND30 sh061-063)',
   name:'Belt panel dead \u2014 obvious trip', symptom:'A 12-belt induction panel is completely dead. Something obvious tripped upstream. Find and identify the tripped breaker.',
   find:function(P){return _sevSet(P,{type:'breaker',state:'tripped'});}},
  {id:'sev-t-estop', cat:'safety', diff:1, kind:'E-stop pressed', limit:240, panel:'LS4000 \u2014 E-Stop Safety Chain + Run Enable (rep.)',
   name:'Someone left an E-stop pressed', symptom:'The line won\u2019t enable. Walk the safety chain and find the pressed / open E-stop.',
   find:function(P){return _sevSet(P,{type:'estop',state:'open'});}},
  {id:'sev-t-disc', cat:'power', diff:1, kind:'disconnect open', limit:210, panel:'LS4000 Induction \u2014 6-Belt Power Panel (rep.)',
   name:'Disconnect bumped open', symptom:'One induction belt is dead while others run. A disconnect got switched off. Find the open disconnect.',
   find:function(P){return _sevSet(P,{type:'disc',state:'open'});}},
  {id:'sev-t-loose', cat:'open', diff:1, kind:'loose wire', limit:240, panel:'DCP Vision IR Item-Detection Panel (M-16-00264 DCP_VIS sh2-3)',
   name:'Loose wire \u2014 device dead', symptom:'A device on the vision panel went dark. A conductor worked loose at a termination. Find the dead device / open connection.',
   find:function(P){return _sevCut(P,{type:'light'});}},

  /* ===== SEV 2 — major (must trace) ===== */
  {id:'sev-ol', cat:'motor', diff:2, kind:'overload tripped', limit:210, panel:'LS4000 Induction \u2014 6-Belt Power Panel (rep.)',
   name:'Belt motor keeps dropping', symptom:'Induction belt motor tries to start then the whole belt drops out. Find the tripped motor protection.',
   find:function(P){return _sevSet(P,{type:'overload',state:'tripped'});}},
  {id:'sev-pull', cat:'safety', diff:2, kind:'pull-cord latched', limit:200, panel:'Standard Induction I/O \u2014 E-Stop Safety Loop (M-16-00264 INDIO sh063/130)',
   name:'Induction safety loop open', symptom:'Induction station safety loop is broken \u2014 the safety relay will not pull in. Find the latched pull-cord.',
   find:function(P){return _sevSet(P,{type:'pullcord',state:'open'});}},
  {id:'sev-gate', cat:'safety', diff:2, kind:'guard open', limit:240, panel:'LS4000 Safety Gate Junction Box \u2014 6-gate safety loop (M-16-00264 SAFEGATE sh01121-27)',
   name:'Guard gate fault', symptom:'A guard gate reads open on the safety controller and the zone will not enable. Find the open gate switch.',
   find:function(P){return _sevSet(P,{type:'sensor',state:'open'});}},
  {id:'sev-disc', cat:'power', diff:2, kind:'disconnect open', limit:220, panel:'LS4000 LSM 480VAC VFD Drive Panel (M-16-00264 LSM480 sh061/067)',
   name:'LSM drive lost power', symptom:'The LSM 480V VFD drive is completely dark \u2014 no incoming power at the drive. Find the open disconnect.',
   find:function(P){return _sevSet(P,{type:'disc',state:'open'});}},
  {id:'sev-failcon', cat:'motor', diff:2, kind:'failed contactor', limit:240, panel:'LS4000 Induction \u2014 6-Belt Power Panel (rep.)',
   name:'Motor won\u2019t pull in', symptom:'Control voltage is present and the coil is called, but the motor never starts. The contactor has failed open (burned tips / open coil). Find the failed device.',
   find:function(P){return _sevFault(P,{type:'contactor'});}},
  {id:'sev-cut-ctrl', cat:'controls', diff:2, kind:'open control wire', limit:270, panel:'ACY1 13XP33 CC566 \u2014 E-STOP Safety Chain (Hytrol 2000/2303/5000)',
   name:'Contactor won\u2019t seal in', symptom:'The starter drops out as soon as you release START. There is an open in the control string feeding the contactor coil. Find the affected device.',
   find:function(P){return _sevCut(P,{type:'contactor',term:'A1'})||_sevCut(P,{type:'relay'});}},
  {id:'sev-hiz-light', cat:'vdrop', diff:2, kind:'high-resistance', limit:270, panel:'CP82 Main Power Distribution (M-16-00264 p.82060-61)',
   name:'Dim light / weak circuit', symptom:'A device runs weak and voltage sags under load \u2014 classic high-resistance (loose/corroded) connection. Use the meter to find the voltage drop, then identify the bad device.',
   find:function(P){return _sevHiZ(P,{type:'light'});}},

  /* ===== SEV 1 — critical / deep dive (complex, subtle, tight) ===== */
  {id:'sev-main', cat:'power', diff:2, kind:'feeder tripped', limit:180, panel:'ACY1 13XP33-2100 \u2014 CC566 460V MPCB Feeders to Remote Panels',
   name:'Remote panel dead \u2014 no 460V', symptom:'A remote conveyor panel is completely dead \u2014 no 460V downstream. Find the tripped feeder breaker.',
   find:function(P){return _sevSet(P,{type:'breaker',state:'tripped',pick:'last'});}},
  {id:'sev-singlephase', cat:'motor', diff:3, kind:'single-phasing', limit:240, panel:'Standard 12-Belt Induction Power \u2014 60A (M-16-00264 IND12 sh061-063)',
   name:'Motor hums, won\u2019t turn', symptom:'Motor buzzes/hums, won\u2019t rotate, draws high current and heats up \u2014 textbook single-phasing. One phase conductor is open. Find the lost phase / affected motor.',
   find:function(P){return _sevPhase(P,{});}},
  {id:'sev-fuse', cat:'power', diff:2, kind:'blown fuse', limit:180, panel:'Standard 12-Belt Induction Power \u2014 60A (M-16-00264 IND12 sh061-063)',
   name:'One induction belt dead', symptom:'A single induction belt on the 60A panel is dead while the rest run. Find the blown branch fuse.',
   find:function(P){return _sevSet(P,{type:'fuse',state:'blown'});}},
  {id:'sev-hiz-vfd', cat:'vdrop', diff:3, kind:'high-resistance', limit:300, panel:'LS4000 LSM 480VAC VFD Drive Panel (M-16-00264 LSM480 sh061/067)',
   name:'VFD undervolt / motor sluggish', symptom:'The LSM drive nuisance-trips on undervoltage and the motor is sluggish. A resistive joint on an incoming phase is dropping voltage under load. Meter the phases and find the bad connection.',
   find:function(P){return _sevHiZ(P,{type:'disc'})||_sevHiZ(P,{type:'breaker'});}},
  {id:'sev-cp83', cat:'controls', diff:3, kind:'open field device', limit:300, panel:'CP83 Beckhoff I/O Rack + Interposing Relays (M-16-00264 CP83 sh83169-83192)',
   name:'CP83 sorter fault \u2014 input dropped', symptom:'CP83 sorter faulted and won\u2019t clear. A field device on a Beckhoff input card has gone open-circuit. Trace the input chain and find the open field switch.',
   find:function(P){return _sevSet(P,{type:'sensor',state:'open'});}},
  {id:'sev-cp83-relay', cat:'controls', diff:3, kind:'failed relay', limit:300, panel:'CP83 Beckhoff I/O Rack + Interposing Relays (M-16-00264 CP83 sh83169-83192)',
   name:'CP83 output dead \u2014 beacon out', symptom:'A CP83 interposing-relay output is dead \u2014 the driven beacon / device never energizes though the PLC commands it. Find the failed interposing relay.',
   find:function(P){return _sevFault(P,{type:'relay'});}},
  {id:'sev-cp83-cut', cat:'open', diff:3, kind:'broken conductor', limit:330, panel:'CP83 Beckhoff I/O Rack + Interposing Relays (M-16-00264 CP83 sh83169-83192)',
   name:'CP83 input channel dead', symptom:'One CP83 input channel reads permanently open. The field switch tests good \u2014 the fault is a broken conductor between the device and the input card. Trace it and find the affected device.',
   find:function(P){return _sevCut(P,{type:'sensor'});}},
  {id:'sev-psu', cat:'power', diff:3, kind:'lost supply input', limit:270, panel:'DCP 24VDC Distributed Control \u2014 3x PS + monitor relays (M-16-00264 DCP_PS24 sh061)',
   name:'24VDC branch lost', symptom:'A 24VDC branch is dead and its monitor relay dropped. One of the parallel supplies lost its incoming AC feed. Find the supply that\u2019s dark.',
   find:function(P){return _sevCut(P,{type:'psu',term:'Lin'});}},
  {id:'sev-safety-deep', cat:'safety', diff:3, kind:'one channel open', limit:300, panel:'LS4000 E-Stop Junction Box \u2014 dual-channel loop (M-16-00264 ESTOPJB sh121)',
   name:'Dual-channel safety won\u2019t reset', symptom:'The safety relay won\u2019t reset even though the E-stops look closed. This is a dual-channel loop \u2014 only ONE channel is open. Find the device breaking that channel.',
   find:function(P){return _sevSet(P,{type:'estop',state:'open',pick:'last'});}}
  ,{id:'m-power-safety', cat:'multi', diff:3, kind:'compound', limit:330, panel:'ACY1 13XP33 CC566 \u2014 E-STOP Safety Chain (Hytrol 2000/2303/5000)',
   name:'Line dead \u2014 more than one fault', symptom:'The line is dead and reset does nothing. There is MORE THAN ONE fault \u2014 do not stop at the first. Find every fault before the clock runs out.',
   finds:[ {fn:function(P){return _sevSet(P,{type:'estop',state:'open'});}, kind:'E-stop pressed'},
           {fn:function(P){return _sevSet(P,{type:'breaker',state:'tripped'});}, kind:'tripped breaker'} ]}
  ,{id:'m-two-belts', cat:'multi', diff:2, kind:'compound', limit:300, panel:'Standard 12-Belt Induction Power \u2014 60A (M-16-00264 IND12 sh061-063)',
   name:'Two belts dead', symptom:'Two induction belts are down while the rest run. Find BOTH blown fuses \u2014 do not stop at the first.',
   finds:[ {fn:function(P){return _sevSet(P,{type:'fuse',state:'blown',pick:0});}, kind:'blown fuse'},
           {fn:function(P){return _sevSet(P,{type:'fuse',state:'blown',pick:3});}, kind:'blown fuse'} ]}
  ,{id:'m-motor-double', cat:'multi', diff:3, kind:'compound', limit:330, panel:'LS4000 Induction \u2014 6-Belt Power Panel (rep.)',
   name:'Motor won\u2019t run \u2014 double fault', symptom:'A belt motor is dead. You will find one protection tripped \u2014 but it STILL won\u2019t run after that. There are TWO faults. Find both.',
   finds:[ {fn:function(P){return _sevSet(P,{type:'overload',state:'tripped'});}, kind:'overload tripped'},
           {fn:function(P){return _sevFault(P,{type:'contactor'});}, kind:'failed contactor'} ]}
  ,{id:'m-cp83-double', cat:'multi', diff:3, kind:'compound', limit:360, panel:'CP83 Beckhoff I/O Rack + Interposing Relays (M-16-00264 CP83 sh83169-83192)',
   name:'CP83 \u2014 multiple faults', symptom:'CP83 is faulted with more than one problem \u2014 a dead interposing-relay output AND a dropped field input. Find every fault.',
   finds:[ {fn:function(P){return _sevFault(P,{type:'relay'});}, kind:'failed relay'},
           {fn:function(P){return _sevSet(P,{type:'sensor',state:'open'});}, kind:'open field device'} ]}
  ,{id:'r-light-dead', cat:'building', diff:1, kind:'tripped breaker', limit:200, panel:'Residential \u2014 Lighting Load Center + 3-Way Circuit (120V)',
   name:'Hallway light dead \u2014 both switches', symptom:'A homeowner says the hallway light will not come on from EITHER 3-way switch. The receptacle on the same panel still works. Find why the lighting circuit is dead.',
   find:function(P){return _sevSet(P,{type:'breaker',state:'tripped',label:'BR1'});}}
  ,{id:'r-3way-oneside', cat:'building', diff:2, kind:'broken conductor', limit:280, panel:'Residential \u2014 Lighting Load Center + 3-Way Circuit (120V)',
   name:'3-way light works from only ONE switch', symptom:'The hall light works from switch S2 but NOT from S1 \u2014 or it behaves backwards. Classic 3-way traveler problem. Find the open conductor.',
   find:function(P){return _sevCut(P,{type:'sw3',label:'S1',term:'T1'});}}
  ,{id:'r-dead-recept', cat:'building', diff:1, kind:'tripped breaker', limit:180, panel:'Residential \u2014 Lighting Load Center + 3-Way Circuit (120V)',
   name:'Dead receptacle', symptom:'A wall receptacle has no power (tester shows nothing hot-to-neutral). The lights on the panel still work. Find why RCPT1 is dead.',
   find:function(P){return _sevSet(P,{type:'breaker',state:'tripped',label:'BR2'});}}
  ,{id:'r-lost-leg', cat:'building', diff:2, kind:'lost a leg', limit:300, panel:'Residential \u2014 120/240 V Split-Phase Load Center',
   name:'Half the house is dead \u2014 lost a leg', symptom:'Half the 120V circuits are dead AND the 240V water heater will not heat, but the other half of the panel works fine. Classic split-phase lost-leg. Find the open leg.',
   find:function(P){return _sevCut(P,{type:'busbar',label:'L1',term:'in'});}}
  ,{id:'r-wh-noheat', cat:'building', diff:2, kind:'lost 240V leg', limit:300, panel:'Residential \u2014 120/240 V Split-Phase Load Center',
   name:'240V water heater won\u2019t heat', symptom:'The electric water heater is stone cold. Its 2-pole breaker is ON and the 120V circuits are fine \u2014 but one of its two hot legs is open. Find it.',
   find:function(P){return _sevCut(P,{type:'heater',term:'a'});}}
  ,{id:'r-gfci-trip', cat:'building', diff:2, kind:'GFCI tripped', limit:240, panel:'GFCI-Protected Bathroom / Garage Circuit (120V)',
   name:'Garage & patio outlets dead \u2014 breaker is ON', symptom:'The garage and patio receptacles are dead, but the branch breaker is ON and not tripped. Everything downstream of one device is out. Find what tripped and what protects these outlets.',
   find:function(P){return _sevSet(P,{type:'gfci',state:'tripped'});}}
  ,{id:'r-4way-trav', cat:'building', diff:3, kind:'broken conductor', limit:320, panel:'Residential \u2014 3-Way / 4-Way Stairway Light (120V)',
   name:'Stairway light works from only some switch positions', symptom:'A 3-way/4-way stairway light (3 switch locations) only comes on in certain switch combinations \u2014 one traveler between the middle 4-way and a 3-way is open. Find the broken traveler.',
   find:function(P){return _sevCut(P,{type:'sw4',term:'A1'});}}
  ,{id:'r-afci-trip', cat:'building', diff:2, kind:'AFCI tripped', limit:260, panel:'Residential \u2014 AFCI-Protected Bedroom Circuit (120V)',
   name:'Bedroom keeps going dark \u2014 breaker looks fine', symptom:'A bedroom light and both bedroom receptacles keep going dead. The panel breaker for that room is a special one with its own TEST button, and it has snapped to the middle TRIPPED position. Find and reset the protective device.',
   find:function(P){return _sevSet(P,{type:'afci',state:'tripped'});}}
  ,{id:'r-longrun-vdrop', cat:'building', diff:2, kind:'long-run voltage drop', limit:280, panel:'Residential \u2014 Detached Garage Sub-Feed (long run, 120V)',
   name:'Garage lights dim & tools bog down at the far end', symptom:'The detached-garage light glows weak and power tools bog down out there, but the breaker is on and nothing is tripped. Voltage reads fine at the panel yet sags out at the garage under load. Find where the volts are being lost.',
   find:function(P){return _sevHiZ(P,{type:'run'});}}
  ,{id:'r-mwbc-openneutral', cat:'building', diff:3, kind:'MWBC open shared neutral', limit:340, panel:'Residential \u2014 Kitchen MWBC (shared neutral, 120/240V)',
   name:'Kitchen lights go crazy \u2014 one blazes, one barely glows', symptom:'On a shared-neutral kitchen circuit, one counter light suddenly blazes super-bright (then pops) while the other on the same handle-tie breaker goes dim, and they change TOGETHER when a load switches. Nothing is tripped. Meter across each light and figure out what failed.',
   find:function(P){return _sevCut(P,{type:'run',term:'in'});}}
  ,{id:'i-vfd-notenabled', cat:'motor', diff:2, kind:'drive not enabled', limit:260, panel:'LS4000 LSM 480VAC VFD Drive Panel (M-16-00264 LSM480 sh061/067)',
   name:'LSM linear motor dead \u2014 VFD shows no fault', symptom:'The LSM linear motor will not move and the VFD is powered with no fault code. The disconnect is on and 480 V is at the drive. Something is keeping the drive from being ENABLED to run \u2014 find it.',
   find:function(P){return _sevSet(P,{type:'selector',state:'open'});}}
  ,{id:'i-stator-open', cat:'open', diff:3, kind:'single-phasing', limit:300, panel:'LS4000 LSM Motor Wiring \u2014 3x Stator (JB 4130207) (M-16-00264 LSMWIRE sh061)',
   name:'LSM stator hums, will not pull \u2014 one leg open', symptom:'One of the three paralleled LSM stator motors just hums, gets hot, and makes no torque while the others run fine. Classic single-phasing from an open motor lead at the junction box. Find the open stator conductor.',
   find:function(P){return _sevCut(P,{type:'motor',term:'U'});}}
  ,{id:'i-rail-vdrop', cat:'vdrop', diff:2, kind:'high-resistance', limit:280, panel:'DCP 75VDC Conductor Rail Power (M-16-00264 DCP_CR sh061/131)',
   name:'Robots brown out at the far end of the rail', symptom:'Drive units lose charge and reset at the far end of the 75 VDC conductor rail while the near end is fine. The supplies read a solid 75 V at the panel, but the rail voltage sags badly under load out on the floor. Find where the volts are being lost.',
   find:function(P){return _sevHiZ(P,{type:'breaker'});}}
  ,{id:'i-ctlpwr-open', cat:'controls', diff:2, kind:'tripped breaker', limit:240, panel:'CP82 Main Power Distribution (M-16-00264 p.82060-61)',
   name:'Whole line dead on controls \u2014 drives still show voltage', symptom:'Every contactor, PLC and control device on the line is dead, yet the drive sections still read incoming voltage at CP82. It is as if only the control power went away. Find what feeds the 120 V control bus and why it is open.',
   find:function(P){return _sevSet(P,{type:'breaker',label:'CONTROL',state:'tripped'});}}
  ,{id:'i-phasemon-trip', cat:'motor', diff:3, kind:'phase-monitor trip', limit:300, panel:'CP82 Main Power Distribution (M-16-00264 p.82060-61)',
   name:'Line will not start \u2014 3-phase OK light is out', symptom:'The whole line refuses to enable and the 3-PHASE OK relay light on CP82 is dark, even though the main disconnect is closed and there is voltage at the panel. The phase-loss monitor has dropped out. Find why the monitor sees a bad incoming supply.',
   find:function(P){return _sevCut(P,{type:'phaseMon',term:'L1'});}}
  ,{id:'a-2200-main-trip', cat:'power', diff:2, kind:'tripped breaker', limit:240, panel:'ACY1 13XP33 2200 — CC566 120VAC Control Power',
   name:'CC566 120VAC main breaker CB1001 tripped', symptom:'Everything on the CC566 120VAC strip died at once — the RECP1005 receptacle, alarm horn AH1007, and all indicator IOPs 1009–1021 are dark. The transformer secondary shows voltage at its output. No single branch looks bad. Trace the main distribution path to find why every downstream branch lost supply at the same instant.',
   find:function(P){return _sevSet(P,{type:'breaker',label:'CB1001',state:'tripped'});}}
  ,{id:'a-2300-ups-trip', cat:'controls', diff:2, kind:'tripped breaker', limit:250, panel:'ACY1 13XP33 2300 — CC566 24VDC UPS & Control Power',
   name:'CB7003 UPS-feed breaker tripped — PLC/network branch dead', symptom:'The PLC7005 power light is off and all three Ethernet switches plus the HMI lost power — the control network is down. Cabinet lighting LT7023 and the panel fan are still running, so 24VDC itself is present. Trace the 24VDC path from CB7001 toward the UPS branch to find what isolated the PLC and network loads.',
   find:function(P){return _sevSet(P,{type:'breaker',label:'CB7003',state:'tripped'});}}
  ,{id:'a-5100-br1-trip', cat:'motor', diff:2, kind:'tripped breaker', limit:240, panel:'ACY1 13XP33-5100 — CC566 E24 24VDC Motor Power Branches',
   name:'CB5101 Branch-1 20A breaker tripped — Zone-A/B motor cards dead', symptom:'All conveyor zones fed by E24 Branch 1 (Zone-A and Zone-B Branch-1 motor cards) stopped, while Branch 2 zones keep moving. The 24VDC supply indicator is healthy and the PL5104 plug terminal downstream of CB5101 shows no voltage. Find the open in the Branch-1 distribution and restore motor-card power.',
   find:function(P){return _sevSet(P,{type:'breaker',label:'CB5101',state:'tripped'});}}
  ,{id:'a-4000-mpcb-trip', cat:'power', diff:3, kind:'tripped breaker', limit:300, panel:'ACY1 13XP33 4000-4003 — Remote Shipping Panel (CC566-## 460VAC/Safety)',
   name:'MPCB5022 tripped — VFD has no input power but the control circuit looks healthy', symptom:'MTR5023 at the remote shipping panel will not run. The PCS5244 E-stop is clear, safety relay SR5212 is energized, and contactor CR5217 is sealed in. VFD5022 shows no active fault and its ENABLE signal is present — yet the motor is stopped. The control circuit looks completely healthy. Trace the 460VAC power path between the contactor output and the VFD input to find the fault.',
   find:function(P){return _sevSet(P,{type:'breaker',label:'MPCB5022',state:'tripped'});}}
  ,{id:'a-vfdlane-runen', cat:'controls', diff:2, kind:'drive not enabled', limit:240, panel:'ACY1 13XP33 CC566 — VFD Lane (from Hytrol 13XP33-5000)',
   name:'RUN EN selector open — VFD enable signal missing', symptom:'MTR5023 on the CC566 VFD lane will not run. VFD5022 has 460VAC input power, all disconnects and MPCB5022 are closed, and the drive shows no fault — it is simply idle. The 24VDC control source reads normal. Investigate why the drive is not receiving its run-enable and restore conveyor operation.',
   find:function(P){return _sevSet(P,{type:'selector',label:'RUN EN',state:'open'});}}
  ,{id:'f-dcp-diode-open', cat:'open', diff:3, kind:'failed diode', limit:300, panel:'DCP 75VDC Conductor Rail Power (M-16-00264 DCP_CR sh061/131)',
   name:'Conductor rail completely dead — all three supplies look fine', symptom:'The 75 VDC conductor rail is dead — every robot unit on the line has gone dark and lost charge. Metering the three PSU outputs at their Vp terminals shows a solid 75 V on each, and the 30A CB and disconnect are both closed. Something between the supplies and the breaker is not passing power.',
   find:function(P){return _sevFault(P,{type:'diode',label:'D06119'});}}
  ,{id:'f-lsm-reactor-open', cat:'open', diff:2, kind:'reactor winding open', limit:260, panel:'LS4000 LSM 480VAC VFD Drive Panel (M-16-00264 LSM480 sh061/067)',
   name:'LSM drive completely dark — disconnect and fuses all good', symptom:'The LSM 480V VFD is completely dark with no incoming-power indication. The DS06103 disconnect is confirmed closed and the incoming service is healthy at the disconnect input terminals. Upstream fusing and the source breaker are fine. Power is not reaching the drive input terminals.',
   find:function(P){return _sevFault(P,{type:'reactor',label:'RE06118'});}}
  ,{id:'f-safegate-sol-cut', cat:'safety', diff:2, kind:'open control wire', limit:240, panel:'LS4000 Safety Gate Junction Box — 6-gate safety loop (M-16-00264 SAFEGATE sh01121-27)',
   name:'Gate 1 lock will not release — safety relay is energized', symptom:'All six gate sensors read closed, the CR0112158 safety relay has energized, and its output contact shows 24 VDC on the source side. Gates 2–6 all release and their locks click off normally. Gate 1 lock solenoid never actuates and the gate cannot be opened, even though the solenoid hardware looks intact.',
   find:function(P){return _sevCut(P,{type:'solenoid',term:'A1',label:'Gate1 Lock'});}}
  ,{id:'f-cp83-plc-branch', cat:'controls', diff:1, kind:'tripped breaker', limit:200, panel:'CP83 PLC Panel — 24VDC Distribution + E-Stop Slave (M-16-00264 CP83 sh83080/83130)',
   name:'AB ControlLogix PLC lost 24VDC — rest of panel running', symptom:'The AB ControlLogix PLC in CP83 has gone dark and lost all I/O. The 24VDC main breaker CB8308002 is on and the rest of the panel (Beckhoff, port server, lamps) all have power. Only the PLC is dead. Find and restore the PLC branch power.',
   find:function(P){return _sevSet(P,{type:'breaker',state:'tripped',label:'CB8308003'});}}
  ,{id:'n-profibus-repcut', cat:'controls', diff:2, kind:'repeater supply open', limit:270, panel:'LS4000 Profibus Networks — repeater power + topology (M-16-00264 PROFIBUS sh02-07)',
   name:'One Profibus segment down — adjacent segments healthy', symptom:'The PLC reports all remote I/O on NET-02A offline, but NET-01B, NET-2B, NET-03 and NET-04 keep communicating. The REP NET-02A repeater on the topology panel is dark — its power LED is off — while the 24VDC breaker reads ON and the shared bus still has 24 V. Trace the individual power feed to REP NET-02A and find the open conductor.',
   find:function(P){return _sevCut(P,{type:'netdev',label:'NET-02A',term:'L+'});}}
  ,{id:'n-repeater-tbcut', cat:'power', diff:2, kind:'loose wire', limit:250, panel:'LS4000 Profibus Repeater Box (M-16-00264 REPEATER sh061)',
   name:'Repeater box dead — CB is ON, no fault code', symptom:'The Profibus repeater box REP06107 is completely dark — no power LED, no segment activity. You open the box and check CB06103: the handle is ON, no trip flag, physically closed. Yet the repeater has no power, even though 24VDC is confirmed on the upstream supply. Trace the supply path into the box and find the open conductor ahead of the breaker.',
   find:function(P){return _sevCut(P,{type:'tstrip',label:'TB10',term:'R1'});}}
  ,{id:'n-clkpulse-sync', cat:'controls', diff:2, kind:'open field device', limit:260, panel:'LS4000 Clock Pulse Unit — 9 Photoeyes to PLC (M-16-00264 CLKPULSE sh140)',
   name:'Clock pulse missing — sync input permanently off', symptom:'The conveyor clock-pulse controller is reporting lost sync to the PLC. All eight zone photoeye indicators are lit and item detection looks normal, but the dedicated sync-clock input on card TB17D reads permanently dark. The sync signal feeds straight from one photoeye to the input card with no junction box. Identify the sync photoeye and find why its output is open.',
   find:function(P){return _sevSet(P,{type:'sensor',state:'open',label:'PE-SYNC'});}}
  ,{id:'n-vis-supply', cat:'power', diff:2, kind:'lost supply input', limit:260, panel:'DCP Vision IR Item-Detection Panel (M-16-00264 DCP_VIS sh2-3)',
   name:'Vision panel — total 24VDC blackout, breaker ON', symptom:'The DCP Vision IR panel is completely dead: the PWR-ON pilot is off, both IR arrays are dark, and both zone pilots are out. The 120VAC breaker CB14001 is ON and not tripped. The 24VDC supply has AC coming in but is putting out zero volts. Trace the AC feed from the breaker output to the supply input terminal and find the open conductor.',
   find:function(P){return _sevCut(P,{type:'psu',term:'Lin'});}}
  ,{id:'z-ls4-6belt-fuse-f52', cat:'power', diff:2, kind:'blown fuse', limit:240, panel:'LS4000 15A 6-Belt Induction Power Panel (M-16-00264 p.062)',
   name:'Belt 5 dead — single-phase fuse open', symptom:'BELT 5 (J06249) is not running while all the other belts on the fused-disconnect panel run normally. The disconnect DS06103 shows no indication and passes voltage. Locate the blown branch fuse in the F5.x group and get the belt back.',
   find:function(P){return _sevSet(P,{type:'fuse',label:'F5.2',state:'blown'});}}
  ,{id:'z-ls4-dcp24-psu-vp-cut', cat:'controls', diff:2, kind:'psu output open', limit:260, panel:'LS4000 DCP — 24VDC Control Power (rep.)',
   name:'All 24V control devices dead — PSU DC output wire open', symptom:'The DCP belt photoeye (PE1) and the 24VDC-ON pilot are dead and the divert control is unresponsive — no 24VDC anywhere on terminal strip TB24. Input breaker CB1 is closed and 120VAC is confirmed at the PSU input, and the supply looks alive. Trace the 24V output side to find where the supply is interrupted.',
   find:function(P){return _sevCut(P,{type:'psu',term:'Vp',label:'PS1'});}}
  ,{id:'d2-feeder-one-of-fifteen', cat:'power', diff:2, kind:'feeder tripped', limit:250, panel:'DCP Induction Power Distribution — 15x 30A Feeders (M-16-00264 DCP_PWR sh5-8)',
   name:'One DCP belt dead — find the tripped feeder', symptom:'DCP-IND-08 has stopped while the other fourteen DCP induction motors on the same distribution wall keep running. The 30A main feeder shows no fault. Something tripped at the branch level for that one drive — narrow down which of the fifteen branch breakers is out and identify it.',
   find:function(P){return _sevSet(P,{type:'breaker',label:'CBR208071',state:'tripped'});}}
  ,{id:'d2-dcp-loose-disc', cat:'vdrop', diff:3, kind:'high-resistance', limit:300, panel:'DCP Induction Power Distribution — 15x 30A Feeders (M-16-00264 DCP_PWR sh5-8)',
   name:'DCP-IND-09 running hot — undervoltage on one feeder', symptom:'DCP-IND-09 is turning but drawing high current, running warm, and nuisance-tripping on low voltage, while all fourteen other DCP induction motors run fine. The fault is a resistive joint in the power path to that single feeder. Meter under load to find where the volts are being lost and identify the bad device.',
   find:function(P){return _sevHiZ(P,{type:'disc',label:'DS06103-IND09'});}}
  ,{id:'d2-ind12-lug-l1-group0', cat:'vdrop', diff:3, kind:'high-resistance', limit:300, panel:'Standard 12-Belt Induction Power — 60A (M-16-00264 IND12 sh061-063)',
   name:'Six belts running hot — loose lug at the fuse group', symptom:'The first six belts (J06204–J06229) are running but pulling elevated current on one phase and running warm, while the second group of six runs fine. A high-resistance joint at the first fuse group is dragging the voltage down under load. Meter the fuse bank and find the bad connection.',
   find:function(P){return _sevHiZ(P,{type:'fuse',label:'FU06200 25A-L1',pick:0});}}
  ,{id:'d2-ind30-cut-phase-u', cat:'open', diff:3, kind:'broken conductor', limit:300, panel:'Standard 12-Belt Induction Power — 30A (M-16-00264 IND30 sh061-063)',
   name:'Belt J06304 hums, will not run — open phase at the motor', symptom:'Belt J06304 buzzes loudly and pulls high current but will not turn, while the other belts run normally. Its branch breaker is not tripped and voltage is present at the panel. A conductor has come off at the motor terminal box, dropping one of the three phases. Find the open lead and identify the affected motor.',
   find:function(P){return _sevCut(P,{type:'motor',label:'J06304',term:'U'});}}
  ,{id:'np-therm-1', cat:'motor', diff:2, kind:'motor overtemp trip', limit:260, panel:'Conveyor Motor Thermal Protection — 480VAC (Klixon/PTC)',
   name:'Conveyor motor stopped — thermal overtemp open', symptom:'The conveyor motor has stopped and will not restart, yet the contactor coil is de-energized even though the run command is present and the branch breaker is closed with 480VAC at the panel. The motor housing is hot to the touch. A protective device wired in series with the contactor coil has opened on temperature. Find the open device and identify it.',
   find:function(P){return _sevSet(P,{type:'overtemp',label:'TH1 Klixon',state:'open'});}}
  ,{id:'np-guard-1', cat:'safety', diff:2, kind:'guard-lock gate open', limit:260, panel:'Guard-Locked Gate Safety Panel — 24VDC Conveyor Enable',
   name:'Conveyor will not enable — guard-lock gate not made', symptom:'The conveyor will not start and the safety relay will not reset. 24VDC control power is present and the stop button is released, but the dual-channel guard-lock interlock on the access gate is not satisfied, so the safety relay stays dropped and the motor contactor never pulls in. Confirm the gate interlock and identify the open device.',
   find:function(P){return _sevSet(P,{type:'guardlock',label:'GL1 Gate',state:'open'});}}
  ,{id:'np-guard-2', cat:'safety', diff:1, kind:'safety stop button pressed', limit:200, panel:'Guard-Locked Gate Safety Panel — 24VDC Conveyor Enable',
   name:'Conveyor dead — stop button in the safety string', symptom:'The conveyor is dead and the safety relay will not reset. 24VDC control power is confirmed and the guard-lock gate is closed, but a normally-closed stop pushbutton in the safety string is open, breaking the relay reset circuit. Find the open pushbutton and identify it.',
   find:function(P){return _sevSet(P,{type:'pbNC',label:'PB1 Stop',state:'open'});}}
  ,{id:'an-indio-pullcord-cut', cat:'safety', diff:3, kind:'broken conductor', limit:300,
   panel:'Standard Induction I/O \u2014 E-Stop Safety Loop (M-16-00264 INDIO sh063/130)',
   name:'Safety relay won\u2019t reset \u2014 pullcords look fine',
   symptom:'The INDIO safety relay SR refuses to energize even after clearing the J13010 LCP E-stop. Both pullcords are in the normal cord-in position \u2014 neither is latched. You can measure 24\u00a0V at the Right Pullcord input terminal, but SR coil A1 reads zero. Find the open conductor between the last device in the loop and the safety relay.',
   find:function(P){return _sevCut(P,{type:'pullcord',label:'Right',term:'b'});}}
  ,{id:'an-cp83plc-horn-dead', cat:'controls', diff:2, kind:'broken conductor', limit:250,
   panel:'CP83 PLC Panel \u2014 24VDC Distribution + E-Stop Slave (M-16-00264 CP83 sh83080/83130)',
   name:'AH alarm horn silent after E-stop reset',
   symptom:'The CP83 safety relay CR8313001 clears and seals in normally after pressing PB8313114. The sorter enable delay runs and the enable output goes active. But the AH alarm horn never sounds when the relay pulls in. Voltage is confirmed on SR output terminal 24. Trace the horn circuit to find why AH stays silent.',
   find:function(P){return _sevCut(P,{type:'horn',term:'a'});}}
  ,{id:'an-cp83-outcard-off', cat:'controls', diff:2, kind:'output card offline', limit:260,
   panel:'CP83 Beckhoff I/O Rack + Interposing Relays (M-16-00264 CP83 sh83169-83192)',
   name:'All CP83 output relays dropped \u2014 Sorter Beacon green dark',
   symptom:'All six interposing relays on the CP83 output section (E-Stop Slave CR8313001 through Induction Ready CR8313540) dropped simultaneously. The Sorter Status Beacon red is lit but green is dark; all five indicator lamps are dark. Breaker CB8598006 is ON, the Beckhoff coupler shows power, and the relay coil supply rail is present at the terminal strip. Find the module whose state killed every output channel at once.',
   find:function(P){return _sevSet(P,{type:'plcOutCard',state:'off'});}}
  ,{id:'an-cp83-stk-green-cut', cat:'controls', diff:2, kind:'broken conductor', limit:240,
   panel:'CP83 Beckhoff I/O Rack + Interposing Relays (M-16-00264 CP83 sh83169-83192)',
   name:'Sorter Beacon green segment dark \u2014 relay and card look fine',
   symptom:'The Sorter Status Beacon shows RED but the GREEN Sorter Running segment is dark. Relay CR8313464 is visibly sealed in, its contact 14 reads 24\u00a0V, and the PLC output card shows the channel energized. All other CP83 indicators are normal. Trace why the green segment is not lighting.',
   find:function(P){return _sevCut(P,{type:'stacklight',term:'G'});}}
  ,{id:'an-cp83-timer-failed', cat:'controls', diff:3, kind:'failed timer', limit:280,
   panel:'CP83 PLC Panel \u2014 24VDC Distribution + E-Stop Slave (M-16-00264 CP83 sh83080/83130)',
   name:'Sorter enable never comes on \u2014 on-delay timer output dead',
   symptom:'After the E-stop loop is reset the CR8313001 slave relay seals in and the AH horn sounds, so the safety string is good. The TD8313106 on-delay timer even shows energized \u2014 its status LED is lit. But the Sorter Enable output to CP41 never goes active, so the sorter will not start. The timer looks like it is running yet nothing passes through it. Figure out why the enable stays dead.',
   find:function(P){return _sevFault(P,{type:'timerON'});}},

  /* ===== New-equipment panels: USS Destacker, CP49 Pick Station, Max Reach MR3 ===== */
  {id:'a-uss-estop', cat:'safety', diff:2, kind:'E-stop pressed', limit:220, panel:'OSL/ARSAW USS Tote Destacker MCP (480V Servo + 24VDC Safety)',
   name:'Destacker servo will not enable', symptom:'The USS tote destacker is dead \u2014 the Kinetix servo never enables and the green status light is out, though 480V is present at the drive. Walk the E-stop safety string feeding the safety relay and find the open device.',
   find:function(P){return _sevSet(P,{type:'estop',state:'open'});}},
  {id:'a-uss-cb-trip', cat:'power', diff:1, kind:'tripped breaker', limit:210, panel:'OSL/ARSAW USS Tote Destacker MCP (480V Servo + 24VDC Safety)',
   name:'Whole destacker MCP dead', symptom:'The entire destacker control panel is dark \u2014 no servo, no 24V control, no PLC. Something tripped upstream of both the drive and the power supply. Find the tripped breaker.',
   find:function(P){return _sevSet(P,{type:'breaker',state:'tripped'});}},
  {id:'b-cp49-estop', cat:'safety', diff:2, kind:'E-stop pressed', limit:220, panel:'CP49 OSL Pick Station MCP (48VDC MDR Rollers + Pick-to-Light)',
   name:'All pick-station rollers stopped', symptom:'Every MDR zone roller on the CP49 pick station has stopped at once while control power is still up. The 48V roller contactor dropped out. Trace the safety string that drives the contactor coil and find the open E-stop.',
   find:function(P){return _sevSet(P,{type:'estop',state:'open'});}},
  {id:'b-cp49-lights-off', cat:'controls', diff:2, kind:'output card offline', limit:250, panel:'CP49 OSL Pick Station MCP (48VDC MDR Rollers + Pick-to-Light)',
   name:'Pick-to-light lamps all dark', symptom:'None of the pick-to-light lamps illuminate even though the rollers run and the PLC is online. The output card feeding the pick lights has dropped offline. Confirm the card state and common supply.',
   find:function(P){return _sevSet(P,{type:'plcOutCard',state:'off'});}},
  {id:'c-mr3-estop', cat:'safety', diff:3, kind:'E-stop pressed', limit:240, panel:'Max Reach MR3 Telescopic Truck Loader (Dual VFD + 120V MCR Control)',
   name:'Truck loader completely dead', symptom:'The Max Reach extendable loader will not run \u2014 belt and telescope drives are both dead, the amber beacon is out and the 24V logic supply is down. The master control relay (MCR) dropped out. Walk the 120V control string (E-stop and stop button) that holds in the MCR and find the open device.',
   find:function(P){return _sevSet(P,{type:'estop',state:'open'});}},
  {id:'c-mr3-belt-trip', cat:'motor', diff:2, kind:'tripped breaker', limit:220, panel:'Max Reach MR3 Telescopic Truck Loader (Dual VFD + 120V MCR Control)',
   name:'Belt drive dead, telescope still works', symptom:'The Max Reach conveyor belt will not run, but the telescope extend/retract still functions and control power is healthy. Only the belt drive lost incoming power. Find the tripped branch breaker feeding the belt VFD.',
   find:function(P){return _sevSet(P,{type:'breaker',state:'tripped',label:'Belt'});}}
];
function _sevPick(P,spec){ var cs=P.components.filter(function(c){return c.type===spec.type&&(!spec.label||String(c.label||'').toLowerCase().indexOf(String(spec.label).toLowerCase())>=0);});
  if(!cs.length)return null; return spec.pick==='last'?cs[cs.length-1]:(typeof spec.pick==='number'?cs[spec.pick]:cs[0]); }
function _sevSet(P,spec){ var cands=P.components.filter(function(c){return c.type===spec.type&&(!spec.label||String(c.label||'').toLowerCase().indexOf(String(spec.label).toLowerCase())>=0)&&c.state!==spec.state;});
  if(!cands.length){ cands=P.components.filter(function(c){return c.type===spec.type;}); }
  if(!cands.length)return null;
  var c=spec.pick==='last'?cands[cands.length-1]:(typeof spec.pick==='number'?cands[spec.pick]:cands[0]);
  if(!c)return null; c.state=spec.state; return c.id; }
function _sevFault(P,spec){ var c=_sevPick(P,spec); if(!c)return null; c.fault=true; return c.id; }
function _sevHiZ(P,spec){ var c=_sevPick(P,spec); if(!c)return null; c.hiZ=true; return c.id; }
function _sevCut(P,spec){ var comp=_sevPick(P,spec); if(!comp)return null;
  var w=P.wires.find(function(w){ var ea=w.a.split('|'),eb=w.b.split('|');
    return (ea[0]===comp.id&&(!spec.term||ea[1]===spec.term))||(eb[0]===comp.id&&(!spec.term||eb[1]===spec.term)); });
  if(!w)return null; w.cut=true;
  var ids=[w.a.split('|')[0], w.b.split('|')[0]]; return ids.filter(function(x,i){return ids.indexOf(x)===i;}); }
function _sevPhase(P,spec){ spec=spec||{}; var m=_sevPick(P,{type:'motor',label:spec.label,pick:spec.pick});
  if(!m)return null;
  var w=P.wires.find(function(w){ var ea=w.a.split('|'),eb=w.b.split('|');
    return (ea[0]===m.id&&['U','V','W'].indexOf(ea[1])>=0)||(eb[0]===m.id&&['U','V','W'].indexOf(eb[1])>=0); });
  if(!w)return null; w.cut=true;
  var ids=[w.a.split('|')[0], w.b.split('|')[0], m.id]; return ids.filter(function(x,i){return ids.indexOf(x)===i;}); }
function _fmtClock(s){ s=Math.max(0,s|0); return (s/60|0)+':'+String(s%60).padStart(2,'0'); }
function _sevRemain(){ if(!scenario||!scenario.limit)return null; return Math.max(0, scenario.limit-Math.floor((Date.now()-scenario.t0)/1000)); }
function _sevStop(){ if(_scenTimer){ clearInterval(_scenTimer); _scenTimer=0; } }
function _sevHud(){ var el=document.getElementById('sev-hud');
  if(!scenario||!scenario.isSev){ if(el)el.parentNode.removeChild(el); return; }
  if(!el){ el=document.createElement('div'); el.id='sev-hud';
    el.style.cssText='position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:9999;background:#141414;border:2px solid '+((CATS[scenario.cat]||{}).col||'#ef4444')+';border-radius:10px;padding:8px 16px;color:#eee;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.55);text-align:center;pointer-events:none';
    document.body.appendChild(el); }
  var r=_sevRemain(), done=scenario.done, clock;
  if(done==='timeout') clock='<span style="color:#ef4444">\u23f1 TIME EXPIRED</span>';
  else if(done) clock='<span style="color:#22c55e">\u2705 SOLVED '+(scenario._solveT|0)+'s</span>';
  else clock='<span style="color:'+(r<=15?'#ef4444':r<=45?'#f59e0b':'#22c55e')+'">'+_fmtClock(r)+'</span>';
  el.innerHTML='<div style="color:'+((CATS[scenario.cat]||{}).col||'#ef4444')+';font-weight:800;letter-spacing:.5px">\U0001F6A8 TROUBLE CALL \u00b7 '+esc((CATS[scenario.cat]||{}).name||'')+' <span style=\'color:#fbbf24\'>'+_stars(scenario.diff||1)+'</span></div>'
    +'<div style="margin:2px 0 3px;font-weight:600">'+esc(scenario.name)+'</div>'
    +'<div style="font-size:24px;font-weight:800;line-height:1">'+clock+'</div>'
    +((scenario.answers&&scenario.answers.length>1)?('<div style="font-size:12px;font-weight:700;color:#fbbf24;margin-top:3px">Faults found: '+(scenario.found||[]).filter(function(x){return x;}).length+' / '+scenario.answers.length+'</div>'):'')
    +'<div style="font-size:11px;color:#aaa;max-width:440px;margin-top:5px">'+esc(scenario.symptom)+'</div>'; }
function _sevTick(){ if(!scenario||!scenario.isSev||scenario.done){ _sevStop(); return; }
  var r=_sevRemain(); _sevHud();
  if(r<=0){ scenario.done='timeout'; _sevStop();
    try{localStorage.setItem('pt_sev_'+scenario.id+'_fail',(+localStorage.getItem('pt_sev_'+scenario.id+'_fail')||0)+1);}catch(e){}
    toast('\u23f1 TIME! Response clock expired'); _sevReveal(false); } }
function startSev(id){ var def=_allCalls().find(function(s){return s.id===id;}); if(!def)return; _sevInjectCSS();
  var lib=window.PANEL_LIBRARY||{}, base=lib[def.panel];
  if(!base){ toast('Panel not found: '+def.panel); return; }
  var _prev=(scenario&&scenario.prev)?scenario.prev:JSON.stringify(PANEL);
  _sevStop();
  var P; try{ P=validatePanel(JSON.parse(JSON.stringify(base))); }catch(e){ toast('Could not load panel'); return; }
  var answers=[], fkinds=[];
  if(def.finds){ for(var _fi=0;_fi<def.finds.length;_fi++){ var _r=def.finds[_fi].fn(P); if(!_r){ toast('Could not stage this call on '+def.panel); return; } answers.push(Array.isArray(_r)?_r:[_r]); fkinds.push(def.finds[_fi].kind); } }
  else { var answer=def.find(P); if(!answer){ toast('Could not stage this call on '+def.panel); return; } answers.push(Array.isArray(answer)?answer:[answer]); fkinds.push(def.kind); }
  PANEL=P; restoreUid();
  scenario={id:id, answers:answers, faultKinds:fkinds, found:answers.map(function(){return false;}), answer:answers[0], t0:Date.now(), done:false, prev:_prev, cat:def.cat, diff:def.diff, kind:def.kind, limit:def.limit, symptom:def.symptom, name:def.name, isSev:true, guided:_sevGuided};
  sel=null;selWire=null;selSet=[]; setMode('sim'); persist(); render(); renderSimInspector(); closeModal();
  _sevHud(); _scenTimer=setInterval(_sevTick,1000);
  if(_sevGuided)_sevGuideStart();
  toast('\U0001F6A8 CALL: '+def.name+' \u2014 clock running!'); }
function openSevEvents(){ var ALL=_allCalls(); var meta={};
  ALL.forEach(function(s){ try{ meta[s.id]={best:localStorage.getItem('pt_sev_'+s.id),pass:+localStorage.getItem('pt_sev_'+s.id+'_pass')||0,fail:+localStorage.getItem('pt_sev_'+s.id+'_fail')||0}; }catch(e){ meta[s.id]={}; } });
  function card(s){ var m=meta[s.id]||{}; var col=(CATS[s.cat]||{}).col||'#888';
    var stars='<span style="color:#fbbf24;font-size:11px">'+_stars(s.diff||1)+'</span>';
    var kind=(s.finds&&s.finds.length>1)?' <span style="display:inline-block;font-size:10px;padding:0 6px;border-radius:8px;border:1px solid '+col+';color:'+col+';font-weight:700">'+s.finds.length+' faults</span>':(s.kind?' <span style="display:inline-block;font-size:10px;padding:0 6px;border-radius:8px;border:1px solid var(--edge);color:var(--dim)">'+esc(s.kind)+'</span>':'');
    var stat=''; if(m.best)stat+=' <span style="color:var(--ok)">\u00b7 best '+esc(String(m.best))+'s</span>';
    if(m.pass||m.fail)stat+=' <span class="hint">('+(m.pass||0)+'\u2705 / '+(m.fail||0)+'\u274c)</span>';
    var del=s.custom?'<button class="tbtn" data-del="'+s.id+'" style="float:right;padding:0 7px;line-height:1.4" title="Delete">\u2715</button>':'';
    return '<div class="suspect" style="cursor:pointer;border-left:3px solid '+col+';padding-left:8px" data-sev="'+s.id+'">'+del+stars+kind+' <b>'+esc(s.name)+'</b> <span class="hint">\u00b7 '+_fmtClock(s.limit)+' target</span>'+stat+'<br><span class="hint">'+esc(s.symptom)+'</span></div>'; }
  function solvedCount(cat){ var t=ALL.filter(function(s){return s.cat===cat;}); var done=t.filter(function(s){return (meta[s.id]||{}).pass;}).length; return done+'/'+t.length; }
  var body='<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">'
    +'<button class="tbtn" id="sev-new" style="flex:1">\u2795 New call (from a ticket)</button>'
    +'<button class="tbtn" id="sev-report" style="flex:1">\U0001F4CA Report card</button>'
    +'<button class="tbtn" id="sev-progress" style="flex:1">\ud83c\udf93 Progression</button>'
    +'<label class="hint" style="display:flex;align-items:center;gap:5px;cursor:pointer"><input type="checkbox" id="sev-guided"'+(_sevGuided?' checked':'')+'> \ud83e\udded Guided mode</label></div>';
  body+='<div class="hint" style="margin-bottom:8px">Pick a call. A real panel loads with a hidden fault and a response clock starts \u2014 trace it, click your suspect, then <b>Check</b>. Guided mode rules out good devices &amp; gives warmer/colder hints. Time out or give up to see a full fault-&amp;-fix walkthrough. Grouped by <b>fault type</b>; \u2605 = difficulty.</div>';
  CAT_ORDER.forEach(function(cat){ var list=ALL.filter(function(s){return s.cat===cat;}); if(!list.length)return;
    var c=CATS[cat]||{name:cat,col:'#888'};
    body+='<div style="font-weight:700;margin:12px 0 3px;color:'+c.col+'">'+esc(c.name)+' <span class="hint" style="font-weight:400">\u00b7 '+solvedCount(cat)+' cleared</span></div>';
    list.sort(function(a,b){return (a.diff||1)-(b.diff||1);});
    body+=list.map(card).join(''); });
  openModal('\U0001F6E0 Trouble Call board', body);
  var root=document.querySelector('#modal')||document;
  var _n=root.querySelector('#sev-new'); if(_n)_n.onclick=function(){ openNewCall(null); };
  var _rc=root.querySelector('#sev-report'); if(_rc)_rc.onclick=function(){ openReportCard(); };
  var _pg=root.querySelector('#sev-progress'); if(_pg)_pg.onclick=function(){ openProgression(); };
  var _g=root.querySelector('#sev-guided'); if(_g)_g.onchange=function(){ _sevGuided=this.checked; try{localStorage.setItem('pt_guided',_sevGuided?'1':'0');}catch(e){} };
  root.querySelectorAll('[data-del]').forEach(function(el){ el.onclick=function(ev){ ev.stopPropagation(); _deleteCustom(el.dataset.del); }; });
  root.querySelectorAll('[data-sev]').forEach(function(el){ el.onclick=function(){ startSev(el.dataset.sev); }; }); }

function openReportCard(){ var ALL=_allCalls(); var meta={};
  ALL.forEach(function(x){ try{ meta[x.id]={best:+localStorage.getItem('pt_sev_'+x.id)||null,pass:+localStorage.getItem('pt_sev_'+x.id+'_pass')||0,fail:+localStorage.getItem('pt_sev_'+x.id+'_fail')||0}; }catch(e){ meta[x.id]={pass:0,fail:0}; } });
  var cleared=ALL.filter(function(x){return (meta[x.id]||{}).pass;});
  var totPass=0,totFail=0,bests=[]; ALL.forEach(function(x){ var m=meta[x.id]||{}; totPass+=m.pass||0; totFail+=m.fail||0; if(m.best)bests.push(m.best); });
  var pct=ALL.length?Math.round(cleared.length/ALL.length*100):0;
  var avgBest=bests.length?Math.round(bests.reduce(function(a,b){return a+b;},0)/bests.length):0;
  var rank=cleared.length?_ptRank(_progressStats().xp).rank.name:'Unrated';
  var catRows=''; var certs=[];
  CAT_ORDER.forEach(function(cat){ var list=ALL.filter(function(x){return x.cat===cat;}); if(!list.length)return;
    var c=CATS[cat]||{name:cat,col:'#888'}; var done=list.filter(function(x){return (meta[x.id]||{}).pass;}).length;
    var p=Math.round(done/list.length*100); if(done===list.length)certs.push(c.name);
    catRows+='<div style="margin:7px 0"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span style="color:'+c.col+';font-weight:700">'+esc(c.name)+'</span><span class="hint">'+done+'/'+list.length+(done===list.length?' \u2705':'')+'</span></div>'
      +'<div style="height:9px;border-radius:5px;background:var(--edge);overflow:hidden"><div style="height:100%;width:'+p+'%;background:'+c.col+'"></div></div></div>';
  });
  var badges=[];
  if(cleared.length>=1)badges.push(['\ud83d\ude80','First Responder','Cleared your first call']);
  if(cleared.length>=10)badges.push(['\ud83c\udfaf','Sharpshooter','10+ calls cleared']);
  if(cleared.length===ALL.length&&ALL.length)badges.push(['\ud83c\udfc6','Board Complete','Every call cleared']);
  var multi=ALL.filter(function(x){return x.cat==='multi';}); if(multi.length&&multi.every(function(x){return (meta[x.id]||{}).pass;}))badges.push(['\ud83e\udde9','Compound Master','All compound calls cleared']);
  if(bests.length>=3&&avgBest&&avgBest<90)badges.push(['\u26a1','Speed Demon','Avg best under 1:30']);
  var clean=cleared.filter(function(x){return !(meta[x.id]||{}).fail;}).length; if(clean>=5)badges.push(['\ud83d\udcaf','Clean Sweep','5+ cleared with no misses']);
  var safetyList=ALL.filter(function(x){return x.cat==='safety';});
  var safetyPerfect=safetyList.length&&safetyList.every(function(x){var m=meta[x.id]||{};return m.pass>0&&m.fail===0;});
  if(safetyPerfect)badges.push(['\ud83d\udee1','Safety Perfect','All safety calls cleared with zero misses']);
  var hard3=ALL.filter(function(x){return (x.diff||1)===3;});
  if(hard3.length&&hard3.every(function(x){return (meta[x.id]||{}).pass;}))badges.push(['\ud83d\udd25','Hard Case','All \u2605\u2605\u2605 calls cleared']);
  var gradCount=0; try{ var _fs2=JSON.parse(localStorage.getItem('pt_flash')||'{}'); Object.keys(_fs2).forEach(function(k){if(_fs2[k]>=6)gradCount++;}); }catch(e){}
  if(gradCount>=50)badges.push(['\ud83d\udcda','Night School','50+ flashcards graduated']);
  certs.forEach(function(nm){ badges.push(['\ud83c\udf96','\u200b'+nm+' Certified',nm+' fully cleared']); });
  var badgeHtml=badges.length?badges.map(function(b){ return '<div style="display:flex;align-items:center;gap:8px;padding:6px 9px;border:1px solid var(--edge);border-radius:9px;background:var(--panel2,rgba(255,255,255,.03))"><span style="font-size:20px">'+b[0]+'</span><div><div style="font-weight:700;font-size:12px">'+esc(b[1])+'</div><div class="hint" style="font-size:10px">'+esc(b[2])+'</div></div></div>'; }).join(''):'<div class="hint">No badges yet \u2014 clear a call to start earning them.</div>';
  var body='<div style="border:2px solid var(--acc,#3b82f6);border-radius:12px;padding:14px;margin-bottom:12px;text-align:center;background:linear-gradient(180deg,rgba(59,130,246,.10),transparent)">'
    +'<div class="hint" style="letter-spacing:2px;font-size:10px">RME \u00b7 ELECTRON WRANGLER</div>'
    +'<div style="font-weight:800;font-size:18px;margin:2px 0">Trouble-Call Report Card</div>'
    +'<div style="display:flex;justify-content:center;gap:22px;margin:10px 0 4px;flex-wrap:wrap">'
    +'<div><div style="font-size:30px;font-weight:800;color:var(--acc,#3b82f6);line-height:1">'+pct+'%</div><div class="hint" style="font-size:10px">complete</div></div>'
    +'<div><div style="font-size:30px;font-weight:800;line-height:1">'+cleared.length+'<span style="font-size:15px;color:var(--dim)">/'+ALL.length+'</span></div><div class="hint" style="font-size:10px">calls cleared</div></div>'
    +'<div><div style="font-size:30px;font-weight:800;color:var(--ok);line-height:1">'+(avgBest?_fmtClock(avgBest):'\u2014')+'</div><div class="hint" style="font-size:10px">avg best time</div></div>'
    +'</div>'
    +'<div style="font-weight:700;font-size:13px;margin-top:4px">Rank: <span style="color:var(--acc,#3b82f6)">'+esc(rank)+'</span></div>'
    +'<div class="hint" style="font-size:11px">'+totPass+' \u2705 solves \u00b7 '+totFail+' \u274c misses</div>'
    +'</div>'
    +'<div style="font-weight:700;margin:4px 0 2px">Mastery by fault type</div>'+catRows
    +'<div style="font-weight:700;margin:14px 0 6px">Badges</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:7px">'+badgeHtml+'</div>'
    +'<div style="margin-top:14px;display:flex;gap:8px"><button class="tbtn" id="rc-print" style="flex:1">\ud83d\udda8 Print</button>'
    +'<button class="tbtn" id="rc-board" style="flex:1">\ud83d\udee0 Back to board</button></div>';
  openModal('\U0001F4CA Report card', body);
  var root=document.querySelector('#modal')||document;
  var _p=root.querySelector('#rc-print'); if(_p)_p.onclick=function(){ try{window.print();}catch(e){} };
  var _b=root.querySelector('#rc-board'); if(_b)_b.onclick=function(){ closeModal(); openSevEvents(); }; }

/* ---------- 6c: reveal walkthrough + guided mode + custom calls ---------- */
var FIXMAP={
  'tripped breaker':{why:'The breaker is tripped, so its poles are open and everything downstream is dead.',fix:'Find WHY it tripped (downstream short / overload / ground fault) BEFORE resetting. Meter for a fault, clear it, then reset the breaker and confirm it holds.'},
  'feeder tripped':{why:'A feeder breaker tripped — the remote panel it supplies lost all incoming power.',fix:'Isolate the downstream fault first (megger / visual), then reset the feeder. If it trips again, do not keep resetting — find the short.'},
  'disconnect open':{why:'The disconnect is open, breaking power to everything past it.',fix:'Verify it is not open for a reason (LOTO / another tech). If clear, close it and confirm downstream comes alive.'},
  'E-stop pressed':{why:'An E-stop is latched open, so the safety string is broken and the machine cannot enable.',fix:'Confirm the area is clear, twist/pull to release the E-stop, then reset the safety relay and re-enable.'},
  'blown fuse':{why:'The branch fuse is open, so that single branch is dead while the rest of the panel runs.',fix:'Find the cause of the blow (short / overload on that branch), correct it, then replace with a fuse of the correct type AND rating.'},
  'overload tripped':{why:'The motor overload tripped on excess current, dropping the starter.',fix:'Let it cool, check actual motor amps vs the heater/overload setting, inspect for mechanical bind or a single-phase condition, then reset.'},
  'failed contactor':{why:'The contactor is failed open (burned/pitted tips or an open coil) — control calls for it but the power contacts never make.',fix:'Verify coil voltage IS present at A1/A2. If coil is good but tips do not pass power, replace the contactor.'},
  'failed relay':{why:'The interposing relay is failed open (open coil or burned contacts) — the PLC output energizes but the relay never passes the signal/power on to the field.',fix:'Confirm the coil is being driven (LED / coil voltage). If driven but the output contact will not make, replace the relay.'},
  'pull-cord latched':{why:'A pull-cord safety switch is latched open, breaking the induction safety loop.',fix:'Walk the cord, find the pulled/latched switch, verify cable tension, reset it, then reset the safety relay.'},
  'guard open':{why:'A guard/gate switch reads open, so the safety controller holds the zone disabled.',fix:'Re-close and re-align the guard so the switch actuates fully; confirm both channels make, then reset.'},
  'drive not enabled':{why:'The VFD has input power but its RUN/ENABLE command is missing, so it holds the motor stopped and correctly shows no fault — it is simply not being told to run. A selector switch, run-permissive interlock, or a break anywhere in the enable-signal string keeps the drive\'s enable input de-energized; the drive waits indefinitely.',fix:'Confirm the drive has power and no active fault, then check its ENABLE/RUN input: the AUTO/MAN selector position, the run-permissive/interlock string, and the enable terminal wiring. Restore the enable signal and the drive runs. If enable IS present at the terminal but it still will not go, check the drive start-source/parameter config.'},
  'high-resistance':{why:'A connection has gone high-resistance (loose lug / corrosion). It still passes current, so nothing looks dead — but voltage sags under load and the device runs weak or nuisance-trips.',fix:'Meter voltage DROP across suspect joints under load. The bad one drops significant voltage. De-energize, clean/re-torque the termination, look for heat discoloration.'},
  'single-phasing':{why:'One of the three phases feeding the motor is open (blown fuse / loose lug / open pole). The motor gets only two phases: it hums, will not start, overheats and draws high current.',fix:'Find the open phase — check fuses, lugs and poles per leg with a meter. Restore all three phases and inspect the motor for damage before running.'},
  'GFCI tripped':{why:'A GFCI protects everything wired to its LOAD terminals. It sensed a ground-fault imbalance (or was test-tripped) and opened its hot AND neutral, killing its own face and every downstream receptacle \u2014 while its LINE side and the branch breaker stay live. That is why the breaker looks fine but the outlets are dead.',fix:'Find the GFCI protecting the circuit (often in a bathroom, garage, or the first box in the run), clear/​inspect the downstream fault or wet device, then press RESET. Confirm the button latches and downstream power returns.'},
  'AFCI tripped':{why:'An AFCI (arc-fault) breaker watches for the high-frequency signature of arcing \u2014 a loose termination arcing in series, or damaged insulation arcing line-to-neutral. When it sees that pattern (or a real overload/short, or a shared-neutral wiring error) it snaps to the mid TRIPPED position and the whole branch goes dead, even though it is not a plain overload.',fix:'Reset it once (push fully OFF, then ON). If it holds, the trip was a transient. If it trips again, unplug/isolate loads and disconnect the branch, then hunt the arc source: re-torque every backstabbed/loose device termination, look for pinched or nail-nicked cable, and confirm the AFCI neutral pigtail lands on ITS terminal (a shared/crossed neutral is the #1 nuisance-trip cause). Reconnect one section at a time to localize it.'},
  'long-run voltage drop':{why:'This is voltage drop over distance, not a fault. Every foot of conductor has resistance; on a long run to a detached structure that resistance is in SERIES with the load, so under load the wire itself eats a share of the volts (Vdrop = I x Rwire). The panel reads ~120V at no load, but out at the garage it sags well below 120V the moment a real load draws current \u2014 lights dim, motors bog and run hot. Undersized wire (#14 where #12/#10 was needed) or too long a run is the usual cause; NEC targets <=3% drop on a branch, <=5% total.',fix:'Meter volts at the panel breaker, then at the far end WITH the load running \u2014 the difference is the drop. If it exceeds ~3-5%, the run is undersized or too long: upsize the conductor (e.g. #14->#12 or #10), shorten the run, or reduce the load. Also rule out a loose/corroded lug adding series resistance before blaming length.'},
  'MWBC open shared neutral':{why:'A multiwire branch circuit (MWBC) runs two hots on OPPOSITE 120 V legs but shares ONE neutral. With the neutral intact each load sits at 120 V and the shared neutral only carries the DIFFERENCE of the two currents. If that shared neutral opens, the two loads are no longer returned to neutral \u2014 they are now in SERIES across the full 240 V between the legs. The 240 V divides between them by resistance, so the small/high-resistance load hogs most of the voltage (over-voltage \u2014 it blazes then burns out) while the big/low-resistance load starves (under-voltage \u2014 it goes dim). The tell-tale is that both misbehave TOGETHER and the neutral itself floats to a live, shock-hazard voltage.',fix:'Meter across EACH load: one reads well above 120 V, the other well below, and they sum to ~240 V \u2014 that is the open-neutral signature (a good circuit reads 120 V on each). Then meter neutral-to-ground: a healthy shared neutral is ~0 V; a floating one reads live. Find the open neutral \u2014 a loose neutral lug, a broken/backed-out splice, or a neutral pigtail that was cut while a device was changed \u2014 and re-land/torque it. NEVER work an MWBC neutral hot; the handle-tie breaker is there so you kill BOTH legs first.'},
  'lost a leg':{why:'One of the two 240V service legs is open (blown main lug, a failed half of a 2-pole, or an open feeder). Every 120V circuit on that leg dies and every 240V load loses half its supply, while the OTHER leg keeps working \u2014 that split symptom is the giveaway.',fix:'Meter each leg to neutral (both should read ~120V). The dead leg reads 0. Trace that leg back \u2014 lug, breaker pole, or feeder \u2014 restore it and confirm 240V leg-to-leg returns.'},
  'lost 240V leg':{why:'A 240V load needs both hot legs to operate. One leg is open, so the load sees only one terminal energized — it cannot develop voltage across itself and will not run, even though its 2-pole breaker looks on.',fix:'Meter both legs at the appliance to neutral, then leg-to-leg (should be 240V). Find the open pole/conductor on the dead leg and restore it.'},
  'phase-monitor trip':{why:'A three-phase monitor relay is watching the incoming supply and has detected a lost, low, or reversed leg. To protect the motors it dropped its output contact, so nothing downstream will enable and the 3-phase-OK indicator is out \u2014 the monitor itself is fine, it is reporting a real supply problem.',fix:'Meter all three legs at the monitor input (L1-L2, L2-L3, L1-L3) \u2014 they should be balanced. Find the missing or low leg upstream (blown line fuse, open disconnect pole, loose lug, utility loss). Restore it and the monitor resets on its own.'},
  'failed diode':{why:'The OR-diode that combines the three parallel PSU outputs onto the common DC bus has failed open. Each PSU output reads a normal 75 V because the supplies themselves are healthy, but the diode passes no current forward, so the breaker input and the conductor rail see 0 V.',fix:'Confirm all three PSU outputs are present (about 75 VDC each). Then meter across the diode: the anode should read ~75 V and, if it conducts, the cathode should too. A dead cathode with a healthy anode confirms the diode is open. De-energize, replace it, and re-verify rail voltage at the panel breaker output and at the far end of the rail before returning to service.'},
  'reactor winding open':{why:'The line reactor ahead of the drive has an open internal winding on one or more phases. Voltage is present at the reactor input from the disconnect, but no current passes through to the output, so the VFD input is de-energized and the drive stays dark.',fix:'With the disconnect OPEN and LOTO applied, check continuity across each reactor phase input-to-output. An open winding reads infinite on that phase while the others may check good. Replace the reactor, then confirm balanced three-phase voltage at all three VFD input terminals before running the drive.'},
  'repeater supply open':{why:'Each network repeater gets its own individual 24VDC wire from a shared breaker. One of those wires broke or came loose, so that single repeater lost power and its bus segment went offline — while every other repeater, fed by its own separate wire from the same breaker, stayed alive. Only the segment on the broken feed drops; the adjacent ones look perfectly healthy.',fix:'Identify the dark repeater from its power LED or the topology map. At that repeater, verify 24VDC at its L+ terminal; if it is missing, ring the feed back to the breaker — check the terminal-strip landings and the wire itself for a break, nick, or loose lug, then re-terminate.'},
  'psu output open':{why:'The power supply is healthy and its AC input is present, but the DC output conductor (the wire off the supply +V terminal to the control terminal strip) is broken or un-landed. The whole 24 V control bus goes dead while the input side meters normal and the supply LED may still be lit — which steers a tech toward the loads instead of the output lug.',fix:'Meter the supply AC input (about 120 VAC) — healthy. Then probe the supply +V to -V directly at its output terminals (about 24 VDC) — also healthy. Then probe the terminal strip to ground: 0 V confirms the break is between the supply output and the strip. Re-land or replace that output conductor, torque the lug, and confirm 24 V returns across the control devices.'},
  'failed timer':{why:'The on-delay timer energizes and its status LED lights when its input is made, but its OUTPUT contact has failed open \u2014 so nothing passes from the timer to the downstream circuit even though the timer looks like it is working.',fix:'Do not trust the status LED alone. Meter across the timer output terminals: with the timer input made and the delay elapsed, the output contact should close and pass supply voltage. If the LED is lit but the output stays open, the timer module has failed internally \u2014 replace it. Confirm the preset/mode is correct before condemning the unit.'},
  'output card offline':{why:'The PLC output card state dropped to OFF (module fault, watchdog timeout, or the PLC scan dropped the enable bit), so all channels open simultaneously even though coil supply voltage is present on the common terminal.',fix:'Confirm all output bits read TRUE in the PLC scan table. If the program commands ON but channels are dead, check the card common supply pin and any onboard fuse. Power-cycle or replace the module if the commanded state is correct but outputs stay open.'},
  'compound':{why:'More than one independent fault is active simultaneously. Each fault may mask the others — fixing the first does not restore the system.',fix:'Work fault-by-fault: restore partial circuit function after each fix to confirm it, then trace the next symptom. Do not stop at the first find.'},
  'motor overtemp trip':{why:'A thermal protector (Klixon/PTC) wired in series with the contactor coil opened because the motor windings or bearings overheated, dropping the coil and stopping the motor.',fix:'Let the motor cool and confirm the protector auto-resets (or reset it). Then find the ROOT cause of the overheat: check for a jammed/overloaded conveyor, blocked cooling, high ambient, failing bearings, or a phase-imbalance drawing high current. Do not jumper the protector.'},
  'guard-lock gate open':{why:'The dual-channel guard-lock interlock on the access gate is not made, so the safety relay cannot reset and the motor contactor never energizes. The gate is open, unlocked, or one channel has failed.',fix:'Confirm the gate is fully closed and the guard-lock solenoid is commanded locked. Meter both interlock channels (they must agree). A single-channel discrepancy faults the relay — check for a damaged switch, misaligned actuator, or broken channel wire.'},
  'safety stop button pressed':{why:'A normally-closed stop pushbutton in the safety string is open, breaking the safety-relay reset circuit so the conveyor cannot start.',fix:'Locate the actuated (or failed-open) stop button along the string and release/twist-reset it. If none is physically pressed, meter each NC button in series to find the open contact or a broken wire between buttons.'},
  'lost supply input':{why:'A power supply lost its incoming AC feed, so its DC output branch went dead and the monitor relay dropped.',fix:'Meter AC voltage at the supply\'s AC input terminals (Lin/Nin or L/N). Both should read nominal line voltage; if either reads zero the feed is open. Trace upstream: check for a tripped breaker, blown fuse, or open disconnect on that supply\'s dedicated feed, then test wire continuity from the protection device output to the supply input. Once AC is restored, verify the DC output is within spec (e.g. 24 VDC +/-5%) before reconnecting loads.'},
  'open field device':{why:'A field device on a PLC input has gone open-circuit, so its channel reads permanently off and the logic faults.',fix:'First verify the device has correct supply voltage at its power terminals (typically 24 VDC). Then probe its output/signal terminal: it should switch between 0 V and supply voltage when actuated. No switching on a healthy supply means the device has failed — replace it. If the supply reads zero, chase the feed wiring back to the terminal strip for an open conductor or blown protection device.'},
  'one channel open':{why:'This is a dual-channel safety loop — both channels must complete their circuit path for the safety relay to energize and latch. One channel is broken: the E-stop buttons and guards all visually appear closed, but a single device on ONE channel is not making contact. The safety relay sees the discrepancy and refuses to reset.',fix:'With all E-stops released and guards closed, probe each channel independently with a meter: trace continuity or 24 VDC from the feed through to the relay\'s channel input terminals. The good channel reads complete; the bad channel is open. Walk device-by-device on the failed channel — common culprits: a button spring-return not fully seated, a contact gap too wide for the actuator\'s travel, or a device reinstalled out of alignment on only one channel. Restore full contact make and confirm the relay energizes and latches.'},
  'loose wire':{why:'A conductor worked loose at a termination, opening the circuit to a device that then went dead.',fix:'Find the open termination, re-land and torque the conductor. Check for a broken/nicked strand under the lug.'},
  'open control wire':{why:'There is an open in the control wiring feeding the coil or solenoid, so the controlled device (contactor, valve, lock) never energizes and stays de-energized regardless of what the logic commands.',fix:'Ring out the control string from the source to the coil. Find and re-land the open conductor / connection.'},
  'broken conductor':{why:'The conductor in the circuit path is broken — each device or termination at either end tests good, but no continuity passes through the run itself. In industrial circuits this is typically a wire between a field device and an I/O card terminal; in switching circuits it is a traveler between two switch locations.',fix:'Ring out the run end-to-end. Find the break (often at a terminal or a flex point) and repair/re-pull the conductor.'}
};
function _sevInjectCSS(){ if(document.getElementById('sev-css'))return; var st=document.createElement('style'); st.id='sev-css';
  st.textContent='.compbox.ruledout{opacity:.3;filter:grayscale(1)} .sev-reveal-hit{outline:3px dashed #fbbf24}'; document.head.appendChild(st); }
function _defState(t){ return ({breaker:'tripped',disc:'open',estop:'open',overload:'tripped',fuse:'blown',pullcord:'open',sensor:'open',pbNC:'open',pbNO:'closed',guardlock:'open',selector:'open'})[t]||'open'; }
function _sevBuildFind(spec){ return function(P){
  if(spec.mode==='fault') return _sevFault(P,{type:spec.type,pick:spec.pick});
  if(spec.mode==='hiz') return _sevHiZ(P,{type:spec.type,pick:spec.pick});
  if(spec.mode==='cut') return _sevCut(P,{type:spec.type,term:spec.term});
  if(spec.mode==='phase') return _sevPhase(P,{});
  return _sevSet(P,{type:spec.type,state:spec.state||_defState(spec.type),pick:spec.pick}); }; }
function _specManifest(base,spec){ var _save=PANEL; try{ var P=validatePanel(JSON.parse(JSON.stringify(base))); PANEL=P; solve();
    var lb=P.components.filter(function(c){return c._on;}).length, wb=P.wires.filter(function(w){return w._live;}).length;
    var v0={}; P.wires.forEach(function(w){v0[w.id]=w._dispV;});
    var ans=_sevBuildFind(spec)(P); if(ans==null)return false; solve();
    var la=P.components.filter(function(c){return c._on;}).length, wa=P.wires.filter(function(w){return w._live;}).length;
    if(P.components.some(function(c){return c.hiZ;})) return P.wires.some(function(w){return v0[w.id]!=null&&w._dispV!=null&&w._dispV<v0[w.id]-1;});
    return (la<lb)||(wa<wb); } finally { PANEL=_save; } }
function _bestPick(base,spec){ var cnt=base.components.filter(function(c){return c.type===spec.type;}).length; if(spec.mode==='phase')cnt=1;
  for(var i=0;i<Math.max(1,cnt);i++){ var s2=Object.assign({},spec,{pick:i}); if(_specManifest(base,s2)) return i; }
  return null; }
function _customCalls(){ var a=[]; try{ a=JSON.parse(localStorage.getItem('pt_customcalls')||'[]'); }catch(e){ a=[]; }
  return (Array.isArray(a)?a:[]).map(function(cc){ cc.find=_sevBuildFind(cc.spec||{}); cc.custom=true; cc.cat=cc.cat||'custom'; return cc; }); }
function _saveCustom(list){ try{ localStorage.setItem('pt_customcalls', JSON.stringify(list.map(function(cc){ return {id:cc.id,name:cc.name,symptom:cc.symptom,panel:cc.panel,cat:cc.cat,diff:cc.diff,limit:cc.limit,kind:cc.kind,spec:cc.spec}; }))); }catch(e){} }
function _allCalls(){ return SEV.concat(_customCalls()); }
function _compAdj(){ var g={}; PANEL.wires.forEach(function(w){ if(w.cut)return; var a=w.a.split('|')[0],b=w.b.split('|')[0]; (g[a]=g[a]||{})[b]=1; (g[b]=g[b]||{})[a]=1; }); return g; }
function _compDist(from,to){ if(from===to)return 0; var g=_compAdj(), q=[[from,0]], seen={}; seen[from]=1;
  while(q.length){ var it=q.shift(); var nb=g[it[0]]||{}; for(var k in nb){ if(seen[k])continue; if(k===to)return it[1]+1; seen[k]=1; q.push([k,it[1]+1]); } } return 99; }
function _sevGuideStart(){ var dead=PANEL.components.find(function(c){ var d=compDef(c); return (d.load||d.coil)&&!c._on; });
  if(dead){ flash(dead.id); toast('\ud83e\udded Guided: start at "'+(dead.label||compDef(dead).name)+'" \u2014 it\u2019s dead. Trace its supply back.'); }
  else toast('\ud83e\udded Guided: nothing is fully dead \u2014 this is a weak/voltage-drop fault. Meter along the circuit.'); }
function _classifyTicket(txt){ txt=String(txt||'').toLowerCase();
  var R=[
   [/single.?phas|hums?|won'?t (turn|rotate|spin)|buzz/,{cat:'motor',mode:'phase',type:'motor',kind:'single-phasing'}],
   [/overload|ol trip|heater/,{cat:'motor',mode:'set',type:'overload',kind:'overload tripped'}],
   [/contactor|starter (won'?t|wont) (pull|seal)/,{cat:'motor',mode:'fault',type:'contactor',kind:'failed contactor'}],
   [/e.?stop/,{cat:'safety',mode:'set',type:'estop',kind:'E-stop pressed'}],
   [/pull.?cord/,{cat:'safety',mode:'set',type:'pullcord',kind:'pull-cord latched'}],
   [/gate|guard|interlock/,{cat:'safety',mode:'set',type:'sensor',kind:'guard open'}],
   [/dual.?channel|two.?channel/,{cat:'safety',mode:'set',type:'estop',kind:'one channel open'}],
   [/dim|voltage drop|under.?volt|weak|high.?resist|corrod|hot (lug|joint|connection)/,{cat:'vdrop',mode:'hiz',type:'light',kind:'high-resistance'}],
   [/loose|broke|open (wire|conductor|circuit)|no continuity/,{cat:'open',mode:'cut',type:'light',kind:'loose wire'}],
   [/fuse/,{cat:'power',mode:'set',type:'fuse',kind:'blown fuse'}],
   [/disconnect|disco\b|switched off/,{cat:'power',mode:'set',type:'disc',kind:'disconnect open'}],
   [/power supply|psu|24 ?v(dc)?|d\.?c\.? (supply|power)/,{cat:'power',mode:'cut',type:'psu',term:'Lin',kind:'lost supply input'}],
   [/plc|beckhoff|i\/o|input (card|channel|drop)|sensor|photo.?eye/,{cat:'controls',mode:'set',type:'sensor',kind:'open field device'}],
   [/relay/,{cat:'controls',mode:'fault',type:'relay',kind:'failed relay'}],
   [/breaker|trip|mccb|mpcb|mcb|no power|dead|won'?t start/,{cat:'power',mode:'set',type:'breaker',kind:'tripped breaker'}]
  ];
  for(var i=0;i<R.length;i++){ if(R[i][0].test(txt)) return R[i][1]; }
  return {cat:'power',mode:'set',type:'breaker',kind:'tripped breaker'}; }
function _sevReveal(gaveUp){ if(!scenario||!scenario.isSev)return;
  if(!scenario.done) scenario.done=gaveUp?'gaveup':scenario.done||true; _sevStop();
  var A=scenario.answers||[[scenario.answer]];
  var allIds=[]; A.forEach(function(g){ g.forEach(function(id){ if(allIds.indexOf(id)<0)allIds.push(id); }); });
  var comps=allIds.map(function(id){return findComp(id);}).filter(Boolean);
  var primary=comps.find(function(c){return c.fault||c.hiZ||(c.state&&['tripped','open','blown'].indexOf(c.state)>=0);})||comps[0];
  if(primary){ sel=primary; selWire=null; selSet=[]; }
  var multi=A.length>1, faultHtml='';
  for(var _fi=0;_fi<A.length;_fi++){ var _k=(scenario.faultKinds&&scenario.faultKinds[_fi])||scenario.kind;
    var _fx=FIXMAP[_k]||{why:'',fix:''};
    var _cs=A[_fi].map(function(id){return findComp(id);}).filter(Boolean);
    var _pri=_cs.find(function(c){return c.fault||c.hiZ||(c.state&&['tripped','open','blown'].indexOf(c.state)>=0);})||_cs[0];
    var _where=_cs.map(function(c){return '<b>'+esc(c.label||compDef(c).name)+'</b>';}).join(' / ');
    var _fstate=_pri?(_pri.fault?'faulted / open':_pri.hiZ?'high-resistance':_pri.state||''):'';
    faultHtml+='<div style="margin:8px 0;padding-top:6px;border-top:1px solid #2a2f37">'
      +(multi?'<div style="font-weight:700;color:'+((CATS[scenario.cat]||{}).col||'#888')+'">Fault '+(_fi+1)+' of '+A.length+'</div>':'')
      +'<div style="margin:4px 0"><b>Where:</b> '+_where+(_fstate?' \u2014 <span style="color:var(--warn)">'+esc(_fstate)+'</span>':'')+'</div>'
      +'<div style="margin:4px 0"><b>Why it caused the symptom:</b><br>'+esc(_fx.why)+'</div>'
      +'<div style="margin:4px 0"><b>The fix:</b><br>'+esc(_fx.fix)+'</div></div>';
  }
  var body='<div style="border-left:3px solid '+((CATS[scenario.cat]||{}).col||'#888')+';padding-left:10px">'
    +'<div style="font-weight:800;font-size:15px;margin-bottom:2px">'+esc(scenario.name)+'</div>'
    +'<div class="hint" style="margin-bottom:8px">'+esc((CATS[scenario.cat]||{}).name||'')+(multi?(' \u00b7 '+A.length+' faults'):(' \u00b7 '+esc(scenario.kind||'')))+'</div>'
    +faultHtml
    +'<div class="hint" style="margin-top:8px">The faulted device is now selected on the panel \u2014 close this to see it. Use <b>Meter</b> / <b>Trace</b> to walk the path yourself.</div>'
    +'</div>'
    +'<div style="margin-top:12px;display:flex;gap:8px"><button class="tbtn" id="rv-retry" style="flex:1">\ud83d\udd01 Retry this call</button>'
    +'<button class="tbtn" id="rv-board" style="flex:1">\ud83d\udee0 Back to board</button></div>';
  openModal('\ud83d\udd27 Fault revealed \u2014 '+(gaveUp?'gave up':scenario.done==='timeout'?'time expired':'solved'), body);
  render(); renderSimInspector();
  var _r=document.getElementById('rv-retry'); if(_r)_r.onclick=function(){ var id=scenario.id; closeModal(); startSev(id); };
  var _b=document.getElementById('rv-board'); if(_b)_b.onclick=function(){ closeModal(); openSevEvents(); };
  _sevHud(); }

/* ================= AET PROGRESSION SHELL ================= */
function _ptCallXP(x, pass, fail){ if(pass<=0) return 0; var d=+x.diff||1; var xp=60+(d-1)*40; if(fail===0) xp+=40; return xp; }
function _flashState(){ try{ return JSON.parse(localStorage.getItem('pt_flash')||'{}'); }catch(e){ return {}; } }
function _saveFlash(o){ try{ localStorage.setItem('pt_flash', JSON.stringify(o)); }catch(e){} }
function _flashDeck(){ var d=AET.FLASHCARDS.map(function(c,i){ return {k:'f'+i, front:c.f, back:c.b, tag:'concept'}; });
  AET.GLOSSARY.forEach(function(g,i){ d.push({k:'g'+i, front:g.t, back:g.d, tag:'term'}); }); return d; }
function _progressStats(){ var ALL=_allCalls(); var xp=0, cleared=0, clean=0;
  ALL.forEach(function(x){ var pass=+localStorage.getItem('pt_sev_'+x.id+'_pass')||0, fail=+localStorage.getItem('pt_sev_'+x.id+'_fail')||0;
    if(pass>0){ cleared++; if(fail===0)clean++; xp+=_ptCallXP(x,pass,fail); } });
  var fs=_flashState(), grad=0; Object.keys(fs).forEach(function(k){ if(fs[k]>=6)grad++; }); xp+=grad*AET.XP.flash_graduate;
  var tracks=AET.TRACKS.map(function(t){ var cats=AET_TRACK_CATS[t.id]||[];
    var list=ALL.filter(function(x){ return cats.indexOf(x.cat)>=0; });
    var done=list.filter(function(x){ return (+localStorage.getItem('pt_sev_'+x.id+'_pass')||0)>0; }).length;
    var complete=list.length>0 && done===list.length; return {t:t, cats:cats, total:list.length, done:done, complete:complete}; });
  tracks.forEach(function(tk){ if(tk.complete) xp+=AET.XP.track_done; });
  return {xp:xp, cleared:cleared, clean:clean, total:ALL.length, grad:grad, tracks:tracks}; }
function _ptRank(xp){ var r=AET.RANKS[0], nxt=null;
  for(var i=0;i<AET.RANKS.length;i++){ if(xp>=AET.RANKS[i].xp) r=AET.RANKS[i]; }
  nxt=AET.RANKS[r.lvl]||null; return {rank:r, next:nxt}; }
function openProgression(){ var st=_progressStats(); var rk=_ptRank(st.xp);
  var toNext=rk.next?(rk.next.xp-st.xp):0, span=rk.next?(rk.next.xp-rk.rank.xp):1, prog=rk.next?Math.max(0,Math.min(100,Math.round((st.xp-rk.rank.xp)/span*100))):100;
  var head='<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">'
    +'<div style="width:64px;height:64px;border-radius:50%;background:conic-gradient(var(--accent) '+prog+'%, var(--edge) 0);display:flex;align-items:center;justify-content:center">'
    +'<div style="width:50px;height:50px;border-radius:50%;background:var(--panel,#12161c);display:flex;flex-direction:column;align-items:center;justify-content:center"><b style="font-size:15px">'+rk.rank.lvl+'</b><span class="hint" style="font-size:8px">LVL</span></div></div>'
    +'<div style="flex:1"><div style="font-size:18px;font-weight:800">'+esc(rk.rank.name)+'</div>'
    +'<div class="hint" style="font-size:12px">'+st.xp+' XP'+(rk.next?' \u00b7 '+toNext+' XP to '+esc(rk.next.name):' \u00b7 MAX RANK')+'</div>'
    +'<div style="height:8px;border-radius:5px;background:var(--edge);overflow:hidden;margin-top:5px"><div style="height:100%;width:'+prog+'%;background:var(--accent)"></div></div></div></div>';
  var stats='<div style="display:flex;gap:8px;margin-bottom:12px">'
    +[['Calls cleared',st.cleared+'/'+st.total],['Clean clears',st.clean],['Cards mastered',st.grad+'/'+_flashDeck().length],['Tracks done',st.tracks.filter(function(t){return t.complete;}).length+'/'+st.tracks.length]]
      .map(function(s){ return '<div style="flex:1;text-align:center;padding:8px;border:1px solid var(--edge);border-radius:9px;background:var(--panel2,rgba(255,255,255,.03))"><div style="font-size:17px;font-weight:800">'+s[1]+'</div><div class="hint" style="font-size:10px">'+s[0]+'</div></div>'; }).join('')+'</div>';
  var tracks='<div style="font-weight:700;margin:4px 0 6px">\ud83d\udee4 Skill Tracks <span class="hint" style="font-weight:400">\u2014 AET curriculum, proven on the panel</span></div>';
  st.tracks.forEach(function(tk){ var t=tk.t; var p=tk.total?Math.round(tk.done/tk.total*100):0;
    tracks+='<div style="margin:7px 0;padding:8px 10px;border:1px solid var(--edge);border-radius:9px;background:var(--panel2,rgba(255,255,255,.03))">'
      +'<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:700;color:'+t.color+'">'+t.icon+' '+esc(t.name)+(tk.complete?' \u2705':'')+'</span><span class="hint" style="font-size:11px">'+tk.done+'/'+tk.total+' calls</span></div>'
      +'<div class="hint" style="font-size:10.5px;margin:3px 0 5px">'+esc(t.desc)+'</div>'
      +'<div style="height:7px;border-radius:5px;background:var(--edge);overflow:hidden"><div style="height:100%;width:'+p+'%;background:'+t.color+'"></div></div></div>'; });
  var btns='<div style="display:flex;gap:8px;margin-top:12px">'
    +'<button class="tbtn" id="prog-flash" style="flex:1">\ud83c\udccf Flashcards ('+_flashDeck().length+')</button>'
    +'<button class="tbtn" id="prog-gloss" style="flex:1">\ud83d\udcd6 Glossary ('+AET.GLOSSARY.length+')</button>'
    +'<button class="tbtn" id="prog-board" style="flex:1">\u2b05 Back to board</button></div>';
  openModal('\ud83c\udf93 Progression \u2014 '+esc(rk.rank.name), head+stats+tracks+btns);
  var root=$('#modal')||document; function bind(id,fn){ var e=root.querySelector('#'+id); if(e)e.onclick=fn; }
  bind('prog-flash', function(){ openFlashcards(); });
  bind('prog-gloss', function(){ openGlossaryRef(); });
  bind('prog-board', function(){ openSevEvents(); }); }
function openFlashcards(){ var deck=_flashDeck(); var fs=_flashState();
  deck.forEach(function(c){ c.box=fs[c.k]||1; });
  var due=deck.filter(function(c){ return c.box<6; }).sort(function(a,b){ return a.box-b.box; });
  if(!due.length){ openModal('\ud83c\udccf Flashcards', '<div class="hint" style="padding:14px;text-align:center">\ud83c\udf89 Every card mastered! Reset a card by reviewing again later.</div><div style="display:flex;gap:8px;margin-top:10px"><button class="tbtn" id="fc-reset" style="flex:1">\u21bb Review all again</button><button class="tbtn" id="fc-back" style="flex:1">\u2b05 Back</button></div>');
    var r0=$('#modal')||document; var rb=r0.querySelector('#fc-reset'); if(rb)rb.onclick=function(){ _saveFlash({}); openFlashcards(); };
    var bb=r0.querySelector('#fc-back'); if(bb)bb.onclick=function(){ openProgression(); }; return; }
  var queue=due.slice(0,20), i=0, flipped=false, got=0;
  function render(){ if(i>=queue.length){ openModal('\ud83c\udccf Flashcards \u2014 done', '<div class="hint" style="padding:14px;text-align:center">Session complete \u2014 <b>'+got+'</b> of '+queue.length+' marked <b>Got it</b>.<br>Mastered cards earn '+AET.XP.flash_graduate+' XP each.</div><div style="display:flex;gap:8px;margin-top:10px"><button class="tbtn" id="fc-more" style="flex:1">\ud83c\udccf More cards</button><button class="tbtn" id="fc-done" style="flex:1">\ud83c\udf93 Progression</button></div>');
      var rd=$('#modal')||document; var m=rd.querySelector('#fc-more'); if(m)m.onclick=function(){ openFlashcards(); };
      var dn=rd.querySelector('#fc-done'); if(dn)dn.onclick=function(){ openProgression(); }; return; }
    var c=queue[i];
    var card='<div style="text-align:center;margin-bottom:6px" class="hint">Card '+(i+1)+' of '+queue.length+' \u00b7 box '+c.box+'/6 \u00b7 '+c.tag+'</div>'
      +'<div id="fc-card" style="min-height:120px;padding:20px;border:1px solid var(--edge);border-radius:12px;background:var(--panel2,rgba(255,255,255,.03));display:flex;align-items:center;justify-content:center;text-align:center;cursor:pointer">'
      +(flipped?'<div style="font-size:14px;line-height:1.5">'+c.back+'</div>':'<div style="font-size:18px;font-weight:700">'+esc(c.front)+'</div>')+'</div>';
    var ctrl = flipped
      ? '<div style="display:flex;gap:8px;margin-top:10px"><button class="tbtn" id="fc-again" style="flex:1">\u21ba Again</button><button class="tbtn" id="fc-got" style="flex:1;border-color:#22c55e">\u2713 Got it</button></div>'
      : '<div style="display:flex;gap:8px;margin-top:10px"><button class="tbtn" id="fc-flip" style="flex:2">\ud83d\udd04 Flip</button><button class="tbtn" id="fc-quit" style="flex:1">\u2b05 Done</button></div>';
    openModal('\ud83c\udccf Flashcards', card+ctrl);
    var r=$('#modal')||document;
    var cd=r.querySelector('#fc-card'); if(cd)cd.onclick=function(){ if(!flipped){ flipped=true; render(); } };
    var fl=r.querySelector('#fc-flip'); if(fl)fl.onclick=function(){ flipped=true; render(); };
    var qt=r.querySelector('#fc-quit'); if(qt)qt.onclick=function(){ openProgression(); };
    var ag=r.querySelector('#fc-again'); if(ag)ag.onclick=function(){ var s=_flashState(); s[c.k]=1; _saveFlash(s); flipped=false; i++; render(); };
    var gt=r.querySelector('#fc-got'); if(gt)gt.onclick=function(){ var s=_flashState(); s[c.k]=Math.min(6,(s[c.k]||1)+1); _saveFlash(s); got++; flipped=false; i++; render(); };
  }
  render(); }
function openGlossaryRef(){ var q='';
  function draw(){ var list=AET.GLOSSARY.filter(function(g){ return !q || g.t.toLowerCase().indexOf(q)>=0 || g.d.toLowerCase().indexOf(q)>=0; });
    var rows=list.map(function(g){ return '<div style="padding:7px 0;border-bottom:1px solid var(--edge)"><b style="color:var(--accent)">'+esc(g.t)+'</b><div class="hint" style="font-size:12px;line-height:1.45">'+g.d+'</div></div>'; }).join('')||'<div class="hint" style="padding:12px;text-align:center">No terms match \u201c'+esc(q)+'\u201d.</div>';
    openModal('\ud83d\udcd6 AET Glossary ('+list.length+')', '<input id="gl-q" placeholder="\ud83d\udd0e search terms & definitions\u2026" value="'+esc(q)+'" style="width:100%;padding:8px;margin-bottom:8px;background:var(--panel,#12161c);color:inherit;border:1px solid var(--edge);border-radius:7px"><div style="max-height:52vh;overflow:auto">'+rows+'</div><button class="tbtn" id="gl-back" style="margin-top:10px;width:100%">\u2b05 Back to progression</button>');
    var r=$('#modal')||document; var qi=r.querySelector('#gl-q'); if(qi){ qi.oninput=function(){ q=this.value.toLowerCase(); draw(); var q2=(($('#modal')||document).querySelector('#gl-q')); if(q2){ q2.focus(); try{ q2.setSelectionRange(q.length,q.length); }catch(e){} } }; }
    var bb=r.querySelector('#gl-back'); if(bb)bb.onclick=function(){ openProgression(); }; }
  draw(); }

function openNewCall(edit){ var lib=window.PANEL_LIBRARY||{}; var names=Object.keys(lib).sort();
  var e=edit||{name:'',symptom:'',panel:names[0]||'',cat:'custom',diff:2,limit:240,kind:'',spec:{mode:'set',type:''}};
  var catOpts=Object.keys(CATS).map(function(k){return '<option value="'+k+'"'+(e.cat===k?' selected':'')+'>'+esc(CATS[k].name)+'</option>';}).join('');
  var modeOpts=[['set','Trip / open (breaker, disc, E-stop, fuse\u2026)'],['fault','Failed-open device (contactor, relay)'],['hiz','High-resistance / voltage drop'],['cut','Loose / broken conductor'],['phase','Single-phase a motor']]
    .map(function(m){return '<option value="'+m[0]+'"'+(e.spec.mode===m[0]?' selected':'')+'>'+esc(m[1])+'</option>';}).join('');
  var panelOpts=names.map(function(n){return '<option value="'+esc(n)+'"'+(e.panel===n?' selected':'')+'>'+esc(n)+'</option>';}).join('');
  function typeOpts(panel,sel){ var p=lib[panel]; if(!p)return '<option value="">(pick a panel)</option>';
    var ts={}; p.components.forEach(function(c){ ts[c.type]=(ts[c.type]||0)+1; });
    return Object.keys(ts).sort().map(function(t){return '<option value="'+t+'"'+(sel===t?' selected':'')+'>'+t+' ('+ts[t]+')</option>';}).join(''); }
  var L='display:block;font-weight:600;margin:8px 0 2px;font-size:12px', I='width:100%;padding:5px;background:var(--panel,#1a1a1a);color:inherit;border:1px solid var(--edge);border-radius:5px';
  var body='<label style="'+L+'">Call name</label><input id="nc-name" style="'+I+'" value="'+esc(e.name)+'">'
    +'<label style="'+L+'">Symptom / paste the ticket here</label><textarea id="nc-sym" rows="3" style="'+I+'">'+esc(e.symptom)+'</textarea>'
    +'<button class="tbtn" id="nc-classify" style="margin-top:6px">\ud83e\udde0 Suggest fault from ticket text</button>'
    +'<label style="'+L+'">Panel</label><select id="nc-panel" style="'+I+'">'+panelOpts+'</select>'
    +'<div style="display:flex;gap:8px"><div style="flex:1"><label style="'+L+'">Fault type</label><select id="nc-mode" style="'+I+'">'+modeOpts+'</select></div>'
    +'<div style="flex:1"><label style="'+L+'">Target device</label><select id="nc-type" style="'+I+'">'+typeOpts(e.panel,e.spec.type)+'</select></div></div>'
    +'<div style="display:flex;gap:8px"><div style="flex:1"><label style="'+L+'">Category</label><select id="nc-cat" style="'+I+'">'+catOpts+'</select></div>'
    +'<div style="flex:1"><label style="'+L+'">Difficulty</label><select id="nc-diff" style="'+I+'"><option value="1"'+(e.diff==1?' selected':'')+'>\u2605 easy</option><option value="2"'+(e.diff==2?' selected':'')+'>\u2605\u2605 medium</option><option value="3"'+(e.diff==3?' selected':'')+'>\u2605\u2605\u2605 hard</option></select></div>'
    +'<div style="flex:1"><label style="'+L+'">Time limit (s)</label><input id="nc-limit" type="number" style="'+I+'" value="'+(+e.limit||240)+'"></div></div>'
    +'<div style="margin-top:14px;display:flex;gap:8px"><button class="tbtn" id="nc-save" style="flex:2">\ud83d\udcbe Save call</button>'
    +'<button class="tbtn" id="nc-cancel" style="flex:1">Cancel</button></div>'
    +'<div id="nc-msg" class="hint" style="margin-top:6px"></div>';
  openModal(edit?'\u270f Edit call':'\u2795 New trouble call', body);
  var $m=function(id){return document.getElementById(id);};
  $m('nc-panel').onchange=function(){ $m('nc-type').innerHTML=typeOpts(this.value,''); };
  $m('nc-classify').onclick=function(){ var g=_classifyTicket($m('nc-sym').value); $m('nc-cat').value=g.cat; $m('nc-mode').value=g.mode;
    var opts=typeOpts($m('nc-panel').value, g.type); $m('nc-type').innerHTML=opts; if([].slice.call($m('nc-type').options).some(function(o){return o.value===g.type;})) $m('nc-type').value=g.type;
    if(!$m('nc-name').value) $m('nc-name').value=g.kind.charAt(0).toUpperCase()+g.kind.slice(1);
    $m('nc-msg').textContent='Suggested: '+g.kind+' \u2014 adjust the target device if needed.'; };
  $m('nc-cancel').onclick=function(){ openSevEvents(); };
  $m('nc-save').onclick=function(){ var mode=$m('nc-mode').value, type=$m('nc-type').value, panel=$m('nc-panel').value;
    if(!type&&mode!=='phase'){ $m('nc-msg').textContent='Pick a target device.'; return; }
    var g=_classifyTicket($m('nc-sym').value);
    var spec={mode:mode, type:mode==='phase'?'motor':type}; if(mode==='cut'&&type==='psu')spec.term='Lin';
    var _bp=_bestPick(lib[panel],spec); if(_bp!=null)spec.pick=_bp;
    var kind=$m('nc-name').value?g.kind:g.kind;
    var cc={id:edit?edit.id:('cc-'+Date.now()), name:$m('nc-name').value||'Custom call', symptom:$m('nc-sym').value||'Find the fault.',
      panel:panel, cat:$m('nc-cat').value, diff:+$m('nc-diff').value||2, limit:+$m('nc-limit').value||240, kind:kind, spec:spec };
    var P; try{ P=validatePanel(JSON.parse(JSON.stringify(lib[panel]))); }catch(err){ $m('nc-msg').textContent='Bad panel.'; return; }
    var ans=_sevBuildFind(spec)(P); if(ans==null){ $m('nc-msg').textContent='That fault can\u2019t be staged on this panel (no '+spec.type+'). Pick another device/panel.'; return; }
    if(_bp==null){ $m('nc-msg').textContent='\u26a0 Warning: that fault stages but doesn\u2019t visibly change this panel (target may feed nothing modeled). Saved anyway \u2014 consider another device.'; }
    var list=_customCalls(); var ix=list.findIndex(function(x){return x.id===cc.id;}); if(ix>=0)list[ix]=cc; else list.push(cc);
    _saveCustom(list); openSevEvents(); toast('\ud83d\udcbe Saved: '+cc.name); }; }
function _deleteCustom(id){ var list=_customCalls().filter(function(c){return c.id!==id;}); _saveCustom(list); openSevEvents(); }

/* ---------- 7: colorblind-safe ---------- */
function applyCb(){ const st=document.getElementById('stage'); if(st)st.classList.toggle('cbsafe',cbSafe);
  const b=$('#btnCb'); if(b){b.classList.toggle('on',cbSafe); b.setAttribute('aria-pressed',cbSafe?'true':'false');}
  try{localStorage.setItem('pt_cb',cbSafe?'1':'0');}catch(e){} }

/* ---------- 9: touch pinch-zoom ---------- */
function _rect(){ return svg.getBoundingClientRect(); }
function initPinch(){
  svg.addEventListener('pointerdown',e=>{ _pointers[e.pointerId]={x:e.clientX,y:e.clientY}; try{ svg.setPointerCapture(e.pointerId); }catch(_){} },true);
  svg.addEventListener('pointermove',e=>{ if(_pointers[e.pointerId])_pointers[e.pointerId]={x:e.clientX,y:e.clientY};
    const ids=Object.keys(_pointers); if(ids.length>=2){ if(typeof drag!=='undefined'&&drag&&typeof persist==='function')persist(); panning=null; drag=null;
      const p=_pointers[ids[0]], q=_pointers[ids[1]]; const dist=Math.hypot(p.x-q.x,p.y-q.y); const r=_rect();
      const mx=(p.x+q.x)/2-r.left, my=(p.y+q.y)/2-r.top;
      if(_pinch){ const nk=Math.max(.25,Math.min(4,view.k*(dist/_pinch.d)));
        view.x=mx-(mx-view.x)*(nk/view.k); view.y=my-(my-view.y)*(nk/view.k); view.k=nk; _pinch.d=dist; render(); }
      else _pinch={d:dist}; } },true);
  const end=e=>{ delete _pointers[e.pointerId]; if(Object.keys(_pointers).length<2)_pinch=null; try{ svg.releasePointerCapture(e.pointerId); }catch(_){} };
  svg.addEventListener('pointerup',end,true); svg.addEventListener('pointercancel',end,true); }

/* ---------- 10: read-aloud ---------- */
function speak(lines){ if(typeof speechSynthesis==='undefined'){ toast('Speech not supported in this browser'); return; }
  speechSynthesis.cancel(); const arr=[].concat(lines);
  arr.forEach(t=>{ const u=new SpeechSynthesisUtterance(String(t).replace(/<[^>]+>/g,'')); u.rate=0.98; speechSynthesis.speak(u); }); }

/* ---------- 11: library manager ---------- */
function userLib(){ try{ return JSON.parse(localStorage.getItem('pt_userlib')||'{}'); }catch(e){ return {}; } }
function saveUserLib(o){ try{ localStorage.setItem('pt_userlib',JSON.stringify(o)); }catch(e){ if(typeof toast==='function') toast('Library save failed'); } }
function saveToLibrary(){ const n=prompt('Save current panel to your library as:',PANEL.name||''); if(!n)return; const o=userLib(); o[n]=JSON.parse(JSON.stringify({name:n,backdrop:PANEL.backdrop,components:PANEL.components,wires:PANEL.wires})); saveUserLib(o); toast('Saved to library: '+n); openLibraryManager(); }
function openLibraryManager(){ const lib=window.PANEL_LIBRARY||{}, mine=userLib();
  const row=(k,src)=>'<div class="suspect" style="cursor:pointer;display:flex;justify-content:space-between;gap:8px" data-k="'+esc(k)+'" data-src="'+src+'"><span>'+esc(k)+'</span><span class="hint">'+src+(src==='mine'?' \u00b7 <b data-del="'+esc(k)+'" style="color:var(--bad)">delete</b>':'')+'</span></div>';
  const body='<input id="lib-q" placeholder="Search panels\u2026" style="width:100%;padding:8px;margin-bottom:8px;background:var(--panel2);border:1px solid var(--edge);border-radius:7px;color:var(--txt)">'
    +'<div style="display:flex;gap:6px;margin-bottom:8px"><button class="tbtn" id="lib-save" style="flex:1">\ud83d\udcbe Save current</button><button class="tbtn" id="lib-imp" style="flex:1">\ud83d\udcc2 Import files</button></div>'
    +'<div id="lib-list">'+Object.keys(lib).map(k=>row(k,'built-in')).join('')+Object.keys(mine).map(k=>row(k,'mine')).join('')+'</div>'
    +'<input type="file" id="lib-files" accept=".json,application/json" multiple style="display:none">';
  openModal('Panel library ('+(Object.keys(lib).length+Object.keys(mine).length)+')', body);
  const filt=()=>{ const q=($('#lib-q').value||'').toLowerCase(); $('#lib-list').querySelectorAll('[data-k]').forEach(el=>{ el.style.display=el.dataset.k.toLowerCase().includes(q)?'':'none'; }); };
  $('#lib-q').oninput=filt;
  $('#lib-save').onclick=saveToLibrary; $('#lib-imp').onclick=()=>$('#lib-files').click();
  $('#lib-files').onchange=e=>{ const fs=[...e.target.files]; const o=userLib(); let n=0; let pend=fs.length;
    fs.forEach(f=>{ const r=new FileReader(); r.onload=()=>{ try{ const p=JSON.parse(r.result); validatePanel(p); const nm=p.name||f.name.replace(/\.panel\.json$|\.json$/,''); o[nm]=p; n++; }catch(err){} if(--pend===0){ saveUserLib(o); toast(n+' panel(s) imported'); openLibraryManager(); } }; r.readAsText(f); }); e.target.value=''; };
  $('#lib-list').querySelectorAll('[data-k]').forEach(el=>el.onclick=ev=>{ if(ev.target.dataset.del){ const o=userLib(); delete o[ev.target.dataset.del]; saveUserLib(o); openLibraryManager(); return; }
    const k=el.dataset.k; const src=el.dataset.src; const p=src==='mine'?userLib()[k]:lib[k];
    PANEL=validatePanel(JSON.parse(JSON.stringify(p))); restoreUid(); sel=null;selWire=null; persist(); applyEnc(); if(typeof applyView==='function')applyView(); render(); renderInspector(); closeModal(); toast('Loaded: '+k); }); }

/* ---------- 12: QR-scan to open ---------- */
function scanQR(){ if(typeof BarcodeDetector==='undefined'){ openModal('QR scan','<div class="hint">This browser has no built-in QR scanner (needs Chrome/Edge on Android or a recent desktop). Use \ud83d\udd17 Copy share link instead.</div>'); return; }
  openModal('Scan a panel QR','<video id="qr-vid" playsinline style="width:100%;border-radius:8px;background:#000"></video><div class="hint" style="margin-top:6px">Point the camera at a Electron Wrangler QR code.</div>');
  const vid=$('#qr-vid'); const det=new BarcodeDetector({formats:['qr_code']}); let stream=null, stop=false;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ closeModal(); toast('Camera unavailable in this context'); return; }
  navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(s=>{ stream=s; vid.srcObject=s; vid.play();
    const scan=async()=>{ if(stop)return; try{ const codes=await det.detect(vid); if(codes&&codes.length){ const raw=codes[0].rawValue;
      stop=true; if(stream)stream.getTracks().forEach(t=>t.stop());
      const h=raw.indexOf('#'); location.hash=h>=0?raw.slice(h):raw; if(typeof applyHash==='function'&&applyHash()){ sel=null;selWire=null; applyEnc(); render(); renderInspector(); } closeModal(); toast('Loaded from QR'); return; } }catch(e){}
      requestAnimationFrame(scan); }; requestAnimationFrame(scan);
  }).catch(()=>{ $('#toolout')&&($('#toolout').innerHTML=''); openModal('Scan a panel QR','<div class="hint" style="color:var(--warn)">Camera access denied or unavailable.</div>'); });
  const m=$('#modal'); if(m){ const bg=m.querySelector('.modal-bg'); if(bg)bg.addEventListener('click',()=>{stop=true;if(stream)stream.getTracks().forEach(t=>t.stop());},{once:true}); } }

/* ---------- init ---------- */
function initExtras4(){ try{cbSafe=localStorage.getItem('pt_cb')==='1';}catch(e){} applyCb();
  const bc=$('#btnCb'); if(bc)bc.onclick=()=>{cbSafe=!cbSafe;applyCb();render();};
  initPinch(); }
