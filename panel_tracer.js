/* ACY1 RME — Panel Path Tracer  |  offline, single-graph electrical simulator */
'use strict';
const VERSION='1.0';
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
      return [{id:'L',x:54,y:14,rail:'hot'},{id:'N',x:54,y:30,rail:'ret'}]; },
    body:c=>`<rect class="sym fillbody" x="4" y="4" width="46" height="36" rx="4"/>
      <text x="27" y="19" class="comp-label">${esc(c.volts||'480V')}</text>
      <text x="27" y="31" class="comp-sub">${(c.phases||1)===3?'3Ø':'1Ø'} SRC</text>`,
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
let showWireNo=false, meterMode=false, probes=[], hoverComp=null, hoverData=null, quiz=null, bootSim=false;
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
  comps.forEach(c=>{c._coilOn=false;c._on=false;c._energT={};});
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
    // recompute coils
    changed=false;
    comps.forEach(c=>{ const d=compDef(c);
      if(d.coil){ const {a1,a2}=d.coil;
        const on = a2===null ? isHot(key(c,a1)) : (isHot(key(c,a1))&&isRet(key(c,a2))) || (isRet(key(c,a1))&&isHot(key(c,a2)));
        if(!!c._coilOn!==!!on){c._coilOn=on;changed=true;}
      }
      if(d.timer){ const inOn=isHot(key(c,'IN')); c._coilOn=inOn;
        if(!_playing){ if(!!c._out!==!!inOn){c._out=inOn;changed=true;} } }
      });
    // stash for post
    solve._uf=uf; solve._hot=hot; solve._ret=ret; solve._isHot=isHot; solve._isRet=isRet; solve._key=key;
  }
  if(changed && typeof console!=='undefined') console.warn('panel-tracer: solver did not converge after 12 iterations (oscillating circuit?)');
  const {_isHot,_isRet,_key}=solve;
  // per-node phase tracking (single-phasing detection)
  const _puf=solve._uf, _phaseOf={};
  comps.forEach(c=>{ if(c.type==='source'){ const ph=c.phases||1; termList(c).forEach(t=>{ if(t.rail==='hot'){ const r=_puf.find(_key(c,t.id)); (_phaseOf[r]=_phaseOf[r]||new Set()).add(ph===3?t.id:'L'); } }); } });
  solve._phaseOf=_phaseOf; const _phasesAt=k=>_phaseOf[_puf.find(k)]||new Set();
  phaseMap=_phaseOf;
  // energized terminals + load on-states
  comps.forEach(c=>{ const d=compDef(c);
    termList(c).forEach(t=>{ const k=_key(c,t.id); c._energT[t.id]= _isHot(k); });
    if(d.load){ const ph=c.phases||(c.type==='motor'?3:1);
      if(c.type==='motor'&&ph===3){ const mp=new Set(); ['U','V','W'].forEach(t=>_phasesAt(_key(c,t)).forEach(p=>mp.add(p)));
        c._nPhases=mp.size; c._singlePhase=(mp.size===2); c._on=(mp.size>=3); }
      else { const ts=termList(c); const a=ts[0].id,b=ts[1].id;
        c._on=( _isHot(_key(c,a))&&_isRet(_key(c,b)) )||( _isRet(_key(c,a))&&_isHot(_key(c,b)) ); }
    }
    if(d.coil) c._on=c._coilOn;
    if(d.timer) c._on=!!c._out;
  });
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
  comps.forEach(c=>{ if(c.type==='source'){ const nv=_nv(c.volts); termList(c).forEach(t=>{ if(t.rail==='hot'){ const r=_vuf.find(_key(c,t.id)); hotV[r]=Math.max(hotV[r]||0,nv); } }); } });
  solve._hotV=hotV;
  PANEL.wires.forEach(w=>{ if(w.cut){w._v=null;return;}
    w._v = _isHot(w.a)?(hotV[_vuf.find(w.a)]||0) : _isRet(w.a)?0 : _isHot(w.b)?(hotV[_vuf.find(w.b)]||0) : _isRet(w.b)?0 : null;
    const _wp=_phasesAt(w.a); w._phase=_wp.size===1?[...__setget(_wp)][0]:(_wp.size>1?'mix':null); });
  // display voltages with high-resistance drop (separate graph: hi-Z links are resistive, not shorts)
  { const g=new UF();
    PANEL.wires.forEach(w=>{ if(!w.cut)g.union(w.a,w.b); });
    comps.forEach(c=>{ if(c.hiZ)return; compDef(c).links(c).forEach(([x,y])=>g.union(_key(c,x),_key(c,y))); });
    const V={}; comps.forEach(c=>{ if(c.type==='source'){ const nv=_nv(c.volts); termList(c).forEach(t=>{ const r=g.find(_key(c,t.id)); if(t.rail==='hot')V[r]=Math.max(V[r]||0,nv); if(t.rail==='ret')V[r]=0; }); } });
    let ch=true,pass=0; while(ch&&pass++<24){ ch=false; comps.forEach(c=>{ if(!c.hiZ)return; compDef(c).links(c).forEach(([x,y])=>{ const ra=g.find(_key(c,x)),rb=g.find(_key(c,y)); const va=V[ra]||0,vb=V[rb]||0;
      if(va*0.55>(V[rb]||0)+0.5){V[rb]=va*0.55;ch=true;} if(vb*0.55>(V[ra]||0)+0.5){V[ra]=vb*0.55;ch=true;} }); }); }
    PANEL.wires.forEach(w=>{ if(w.cut){w._dispV=null;return;} const r=g.find(w.a); w._dispV=(V[r]!=null)?Math.round(V[r]):w._v; }); }
  updateFooter();
}
function __setget(s){ return Array.from(s); }
class UF{ constructor(){this.p={};} find(x){if(this.p[x]===undefined)this.p[x]=x; while(this.p[x]!==x){this.p[x]=this.p[this.p[x]];x=this.p[x];} return x;} union(a,b){this.p[this.find(a)]=this.find(b);} }

/* ---------- ideal-path diagnostic ---------- */
function diagnose(loadComp){
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
    else if(['estop','pbNO','pbNC','selector','sensor'].includes(c.type)) ideal=[['a','b']];
    else if(c.type==='vfd') ideal=[['L1','U'],['L2','V'],['L3','W']];
    else if(c.type==='plcOut') ideal=[['c','out']];
    else if(c.type==='term') ideal=[['a','b'],['a','t'],['a','bt']];
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
  const suspects=[], seenC=new Set(); let anyPath=false, totLen=0;
  for(const tid of starts){
    const start=key(loadComp, tid);
    const q=[[start,[]]], seen=new Set([start]); let path=null;
    while(q.length){ const [n,pth]=q.shift();
      if(srcSet.has(n)){ path=pth; break; }
      (adj[n]||[]).forEach(e=>{ if(!seen.has(e.n)){seen.add(e.n); q.push([e.n, pth.concat([e.el])]); } });
    }
    if(!path){ continue; }
    anyPath=true; totLen+=path.length;
    path.forEach(el=>{ if(el.kind==='wire'){ if(el.w.cut && !seenC.has('w:'+el.w.id)){ seenC.add('w:'+el.w.id); suspects.push({label:'Cut wire',why:'broken',ref:{wire:el.w.id}}); } }
      else { const c=el.c, kk='c:'+c.id; if(seenC.has(kk))return; const st=broken(c, el.contact); if(st){ seenC.add(kk); suspects.push({label:(c.label?c.label+' — ':'')+compDef(c).name, why:st, ref:{comp:c.id}}); } } });
  }
  if(!anyPath) return {ok:false, msg:'No wired path from this load back to a power source. Check wiring.', suspects:[]};
  return {ok:true, dead:!loadComp._on, suspects, pathLen:totLen};
}
function broken(c,contact){ if(c.fault)return 'faulted/open';
  if(c.type==='breaker'&&c.state==='tripped')return 'TRIPPED';
  if(c.type==='breaker'&&c.state==='open')return 'switched OFF';
  if(c.type==='disc'&&c.state==='open')return 'disconnected';
  if(c.type==='fuse'&&c.state==='blown')return 'BLOWN';
  if(c.type==='overload'&&c.state==='tripped')return 'OL TRIPPED';
  if(c.type==='estop'&&c.state==='open')return 'E-STOP pressed';
  if(c.type==='pbNC'&&c.state==='open')return 'stop pressed';
  if(c.type==='pbNO'&&c.state==='open')return 'not started';
  if(['selector','sensor'].includes(c.type)&&c.state==='open')return 'contact open';
  if(c.type==='contactor'&&!c._coilOn)return 'coil not energized';
  if(c.type==='relay'){ if(contact==='NC'){ return c._coilOn?'coil energized (NC contact open)':null; } return c._coilOn?null:'coil not energized'; }
  if(c.type==='vfd'&&!c._coilOn)return 'drive not enabled';
  if(c.type==='plcOut'&&c.state!=='on')return 'PLC output OFF';
  return null;
}

/* ---------- RENDER ---------- */
function render(){
  if(mode==='sim') solve();
  const W=svg.clientWidth,H=svg.clientHeight;
  if(W<=0||H<=0) return;
  svg.setAttribute('viewBox',`${-view.x/view.k} ${-view.y/view.k} ${W/view.k} ${H/view.k}`);
  if(viewMode==='phys'){ svg.innerHTML=physBody(); return; }
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
    const cls=['compbox']; if(sel===c||selSet.indexOf(c)>=0)cls.push('sel'); if(mode==='sim'&&anyEnerg(c)&&!c._singlePhase)cls.push('energized'); if(c.fault)cls.push('faulted'); if(hoverData&&hoverData.comps.has(c.id))cls.push('hoverpath'); if(mode==='sim'&&c._singlePhase)cls.push('singlephase');
    let body=d.body(c);
    // live overlays in sim
    if(mode==='sim'){
      if(c.type==='motor'&&c._on) body=body.replace('motorbody','motorbody spin').replace('class="comp-label motorM"','class="comp-label motorM lit"');
      else if(c.type==='motor'&&c._singlePhase) body=body.replace('motorbody','motorbody hum');
      if(c.type==='light'&&c._on) body=body.replace('lampbody','lampbody lit');
      if((c.type==='contactor'||c.type==='relay')&&c._coilOn) body=body.replace('coilind','coilind lit');
      if(compDef(c).timer&&c._out) body=body.replace('coilind','coilind lit');
    }
    s+=`<g class="${cls.join(' ')}" data-comp="${c.id}" transform="translate(${c.x},${c.y})">
      <rect class="selrect" x="-6" y="-6" width="${d.w+12}" height="${d.h+12}" rx="6"/>
      ${body}
      <text x="${d.w/2}" y="-9" class="comp-label">${c.label&&!['contactor','relay','vfd','term','plcIn','plcOut'].includes(c.type)?esc(c.label):''}</text>`;
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
    pl.innerHTML=esc(nm)+' <small>&#183; ACY1 RME</small>'; } }
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
let drag=null, panning=null;
svg.addEventListener('pointerdown',ev=>{
  const term=ev.target.closest('.term'), comp=ev.target.closest('.compbox'), wire=ev.target.closest('[data-wire]');
  const linkEl=ev.target.closest('[data-link]');
  if(linkEl){ followLink(linkEl.dataset.link); return; }
  const pinEl=ev.target.closest('[data-pin]');
  if(pinEl){ const pn=(PANEL.pins||[])[+pinEl.dataset.pin]; if(pn&&pn.comp){ sel=findComp(pn.comp); selWire=null; selSet=[]; renderInspector(); render(); flash(pn.comp); } return; }
  if(mode==='build'&&pinMode){ const p=toWorld(ev); const lbl=prompt('Pin label / linked component tag (blank = none):','');
    if(lbl!==null){ PANEL.pins=PANEL.pins||[]; const lc=PANEL.components.find(c=>(c.label||'').toLowerCase()===lbl.trim().toLowerCase()); PANEL.pins.push({x:Math.round(p.x),y:Math.round(p.y),comp:lc?lc.id:null,label:lbl}); persist(); render(); } return; }
  if(mode==='sim'&&logMode&&term){ logMeasure(term.dataset.comp+'|'+term.dataset.term); return; }
  if(mode==='sim'&&(meterMode||contMode)&&term){ addProbe(term.dataset.comp+'|'+term.dataset.term); return; }
  if(tool==='wire'||wireStart){ if(term){ handleWireClick(term.dataset.comp,term.dataset.term); return; } }
  if(mode==='build'&&tool&&T[tool]){ const p=toWorld(ev); addComponent(tool,p.x,p.y); return; }
  if(term && mode==='build'){ handleWireClick(term.dataset.comp,term.dataset.term); return; }
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
  if(marquee){ const p=toWorld(ev); marquee.x1=p.x; marquee.y1=p.y; render(); return; }
  if(drag){ const p=toWorld(ev); let nx=Math.round(p.x-drag.dx), ny=Math.round(p.y-drag.dy);
    if(gridSnap){ nx=Math.round(nx/GRID)*GRID; ny=Math.round(ny/GRID)*GRID; }
    if(drag.phys){ drag.c.phys=drag.c.phys||{w:56,h:60}; drag.c.phys.x=nx; drag.c.phys.y=ny; } else { drag.c.x=nx; drag.c.y=ny; } render(); }
  else if(panning){ view.x=panning.vx+(ev.clientX-panning.x); view.y=panning.vy+(ev.clientY-panning.y); render(); }
});
function clearDrag(){ if(drag)persist();
  if(marquee){ const x0=Math.min(marquee.x0,marquee.x1),y0=Math.min(marquee.y0,marquee.y1),x1=Math.max(marquee.x0,marquee.x1),y1=Math.max(marquee.y0,marquee.y1);
    selSet=PANEL.components.filter(c=>{const d=compDef(c);const cx=c.x+d.w/2,cy=c.y+d.h/2;return cx>=x0&&cx<=x1&&cy>=y0&&cy<=y1;});
    marquee=null; sel=null; selWire=null; renderInspector(); }
  drag=null; panning=null; svg.style.cursor=''; render(); }
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
  if(!c){ box.innerHTML=`<h3>Simulate</h3>
    <button class="tbtn" id="sim-dead" style="width:100%;margin-bottom:6px">🔎 What's dead? (whole panel)</button>
    <button class="tbtn ${meterMode?'on':''}" id="sim-meter" style="width:100%;margin-bottom:6px">🔌 Meter probe ${meterMode?'(ON — click 2 terminals)':''}</button>
    <button class="tbtn" id="sim-quiz" style="width:100%;margin-bottom:6px">🎓 ${quiz?'End quiz':'Quiz me (inject hidden fault)'}</button>
    <button class="tbtn ${showVolts?'on':''}" id="sim-volts" style="width:100%;margin-bottom:6px">⚡ ${showVolts?'Hide':'Show'} live voltages</button>
    <button class="tbtn ${logMode?'on':''}" id="sim-log" style="width:100%;margin-bottom:6px">📝 ${logMode?'Logging as-found (ON)':'As-found meter log'}</button>
    <button class="tbtn ${contMode?'on':''}" id="sim-cont" style="width:100%;margin-bottom:6px">🔌 ${contMode?'Continuity (ON — dead test)':'Continuity / ohmmeter (dead)'}</button>
    <button class="tbtn ${showPhase?'on':''}" id="sim-phase" style="width:100%;margin-bottom:6px">Φ ${showPhase?'Hide phases':'Show L1/L2/L3 phases'}</button>
    <button class="tbtn ${showTherm?'on':''}" id="sim-therm" style="width:100%;margin-bottom:6px">🌡 ${showTherm?'Hide thermal':'Thermal overlay'}</button>
    <div id="simextra"></div>
    <div class="hint">Click any device to operate it.<br>• Breakers/E-stops/buttons cycle open⇄closed<br>• Blow fuses & trip breakers to inject faults<br>• Click a <b>dead load</b> to diagnose<br>• Hover a device to highlight its live path</div>`;
    $('#sim-dead').onclick=showPanelReport;
    $('#sim-meter').onclick=()=>{meterMode=!meterMode;contMode=false;probes=[];render();renderSimInspector();};
    $('#sim-quiz').onclick=()=>{ if(quiz){quizEnd();} else {startQuiz();} };
    $('#sim-volts').onclick=()=>{showVolts=!showVolts;render();renderSimInspector();};
    $('#sim-log').onclick=()=>{logMode=!logMode;render();renderSimInspector();};
    $('#sim-cont').onclick=()=>{contMode=!contMode;meterMode=false;probes=[];render();renderSimInspector();};
    $('#sim-phase').onclick=()=>{showPhase=!showPhase;render();renderSimInspector();};
    $('#sim-therm').onclick=()=>{showTherm=!showTherm;render();renderSimInspector();};
    if(meterMode) renderMeter(); if(quiz) renderQuiz(); if(logMode) renderLog(); if(contMode) renderCont();
    if(scenario&&!scenario.done){ const _d=$('#simextra'); if(_d)_d.innerHTML+='<div class="hint" style="margin-top:8px;color:var(--accent)">'+esc((SCEN.find(x=>x.id===scenario.id)||{}).prompt||'')+' — click your suspect, then a device panel → Check.</div>'; }
    return; }
  const d=compDef(c); let h=`<h3>${c.label?esc(c.label)+' — ':''}${d.name}</h3>`;
  if(d.sw){ const cur=c.state; const cls=(cur==='closed'||cur==='ok'||cur==='on')?'closed':(cur==='tripped'||cur==='blown')?'fault':'open';
    h+=`<button class="statebtn ${cls}" id="sim-toggle">State: ${esc(cur.toUpperCase())} — click to change</button>`; }
  // fault injection universal
  h+=`<button class="statebtn ${c.fault?'fault':''}" id="sim-fault">${c.fault?'⚠ FAULTED (open) — clear':'Inject fault (open device)'}</button>`;
  h+=`<button class="statebtn ${c.hiZ?'fault':''}" id="sim-hiz">${c.hiZ?'⚠ HIGH-RESISTANCE — clear':'Inject high-resistance (voltage drop)'}</button>`;
  h+=`<button class="tbtn" id="sim-bolt" style="width:100%">⚡ Bolted fault here → trips protection</button>`;
  if(scenario&&!scenario.done) h+=`<button class="tbtn" id="sim-scen" style="width:100%;margin-top:6px">🎯 Check: is this the scenario fault?</button>`;
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
  const _sc=$('#sim-scen'); if(_sc)_sc.onclick=scenarioGuess;
  const dg=$('#sim-diag'); if(dg)dg.onclick=()=>runDiag(c);
}
function runDiag(c){ const r=diagnose(c); const box=$('#diag');
  if(c._singlePhase){ box.innerHTML=`<div class="hint" style="color:var(--warn)">SINGLE-PHASING: only 2 of 3 phases present at the motor — it will hum/overheat but not turn. Check for a blown fuse, open pole, or loose lead on the missing phase.</div>`; return; }
  if(!r.ok){ box.innerHTML=`<div class="hint" style="color:var(--warn)">${r.msg}</div>`; return; }
  if(!r.suspects.length){ box.innerHTML=`<div class="hint">Path is intact & every device is closed — check upstream source voltage or the load itself.</div>`; return; }
  box.innerHTML=`<div class="hint" style="margin:6px 0">${r.suspects.length} break(s) in the path to source — closest first:</div>`+
    r.suspects.map((s,i)=>`<div class="suspect" data-i="${i}"><b>${i+1}. ${esc(s.label)}</b><br>${s.why}</div>`).join('')+
    `<button class="tbtn" id="diag-walk" style="width:100%;margin-top:6px">▶ Walk me through it</button><div id="walkout"></div>`;
  const _wb=box.querySelector('#diag-walk'); if(_wb)_wb.onclick=()=>{ const steps=guidedWalk(c); $('#walkout').innerHTML=steps.map(t=>`<div class="suspect" style="cursor:default;border-color:var(--accent)">${esc(t)}</div>`).join('')+`<button class="tbtn" id="walk-say" style="width:100%;margin-top:6px">\ud83d\udd0a Read aloud</button>`; const _sa=$('#walk-say'); if(_sa)_sa.onclick=()=>speak(steps); };
  box.querySelectorAll('.suspect[data-i]').forEach(el=>el.onclick=()=>{ const s=r.suspects[+el.dataset.i];
    if(s.ref.comp){sel=findComp(s.ref.comp);render();flash(s.ref.comp);renderSimInspector();}
    if(s.ref.wire){selWire=PANEL.wires.find(w=>w.id===s.ref.wire);render();} });
}
function flash(id){ const g=svg.querySelector(`[data-comp="${id}"]`); if(g){g.classList.add('faulted');setTimeout(()=>render(),1200);} }

/* ---------- palette / modes ---------- */
const PAL=['source','disc','breaker','fuse','contactor','overload','relay','timerON','timerOFF','vfd','motor','light','estop','pbNO','pbNC','selector','sensor','plcIn','plcOut','term'];
function buildPalette(){ $('#palette').innerHTML=PAL.map(t=>`<button data-t="${t}"><svg viewBox="0 0 ${T[t].w} ${T[t].h}">${T[t].body(demoStub(t))}</svg>${T[t].name}</button>`).join('');
  $('#palette').querySelectorAll('button').forEach(b=>b.onclick=()=>setTool(b.dataset.t)); }
function demoStub(t){const c={type:t,label:'',poles:3,phases:3,state:T[t].states?T[t].states[0]:undefined,volts:'480V'};return c;}
function setTool(t){ tool=(t==='wire')?'wire':t; wireStart=null;
  $('#palette').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  $('#btnWire').classList.toggle('on',t==='wire');
  svg.className.baseVal=(t==='wire')?'wire':(t&&T[t])?'place':''; }
$('#btnWire').onclick=()=>setTool(tool==='wire'?null:'wire');
function setMode(m){ if(typeof _playing!=='undefined'&&_playing&&typeof stopPlay==='function')stopPlay(); mode=m; wireStart=null;tool=null;setTool(null); meterMode=false; probes=[]; hoverComp=null; hoverData=null; logMode=false; showVolts=false; pinMode=false; selSet=[]; marquee=null; netHi=null; if(quiz) quizEnd();
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
$('#opacity').oninput=()=>render();
$('#btnAI').onclick=()=>{ const msg=`AI EXTRACT (hybrid workflow)\n\n`+
  `1. Load your panel drawing with 🖼 Drawing (photo, PDF page, or sketch).\n`+
  `2. Send that same image to Aki in chat and say: "extract this panel to Panel Tracer JSON".\n`+
  `3. Aki returns a .panel.json (components + wires with x/y positions).\n`+
  `4. Click 📂 Load to import it — it drops on top of your traced backdrop; nudge parts to line up.\n\n`+
  `Aki reads the drawing (schematic symbols or physical layout), identifies breakers, contactors, `+
  `fuses, relays, motors, wiring nets, and builds the graph automatically. You then correct/wire the rest by hand.`;
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
  const tag='<text x="'+(w/2)+'" y="'+(h+12)+'" class="comp-sub" style="fill:#c9d1d9">'+esc(c.label||c.type)+'</text>';
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
function physBody(){ autoPhys();
  let s='<defs>'
    +'<linearGradient id="pan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d4650"/><stop offset=".5" stop-color="#2c333c"/><stop offset="1" stop-color="#222831"/></linearGradient>'
    +'<pattern id="perf" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="1.7" fill="#05070a" opacity=".5"/><circle cx="6" cy="5.2" r="1.3" fill="#4a535f" opacity=".55"/></pattern>'
    +'<linearGradient id="rail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d959f"/><stop offset=".28" stop-color="#c8d0d8"/><stop offset=".55" stop-color="#828a94"/><stop offset="1" stop-color="#565d67"/></linearGradient></defs>';
  s+='<rect x="-3000" y="-2200" width="9000" height="6400" fill="url(#pan)"/><rect x="-3000" y="-2200" width="9000" height="6400" fill="url(#perf)"/>';
  s+='<rect x="30" y="8" width="1080" height="82" rx="6" fill="#20252c" stroke="#3a424d"/><text x="46" y="24" class="comp-sub" style="fill:#8b949e;text-anchor:start">ENCLOSURE DOOR \u2014 OPERATORS</text>';
  RAILS.forEach(y=>{ s+='<rect x="20" y="'+(y-9)+'" width="1100" height="11" rx="2" fill="url(#rail)" opacity=".85"/>'
    +'<line x1="20" y1="'+(y-8)+'" x2="1120" y2="'+(y-8)+'" stroke="#eef2f5" stroke-width=".5" opacity=".35"/>'; });
  if(sel&&sel.phys){ const cx=sel.phys.x+sel.phys.w/2, cy=sel.phys.y+sel.phys.h/2;
    wiredNeighbors(sel).forEach(n=>{ if(n.phys)s+='<line x1="'+cx+'" y1="'+cy+'" x2="'+(n.phys.x+n.phys.w/2)+'" y2="'+(n.phys.y+n.phys.h/2)+'" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="5 3" opacity=".75"/>'; }); }
  PANEL.components.forEach(c=>{ const p=c.phys; const cls=['compbox','physmod'];
    if(sel===c)cls.push('sel'); if(mode==='sim'&&anyEnerg(c))cls.push('energized'); if(c.fault)cls.push('faulted');
    s+='<g class="'+cls.join(' ')+'" data-comp="'+c.id+'" transform="translate('+p.x+','+p.y+')"><rect class="selrect" x="-5" y="-5" width="'+(p.w+10)+'" height="'+(p.h+10)+'" rx="6"/>'+physModule(c)+'</g>'; });
  return s;
}
function physInfo(c){ if(!c)return''; const nb=wiredNeighbors(c).map(n=>n.label||n.id);
  const bad=broken(c);
  return '<div class="hint" style="margin:0 0 8px;padding:8px;border:1px solid var(--edge);border-radius:6px;background:var(--panel2)">'
    +'<b>'+esc(c.label||c.type)+'</b> \u2014 '+compDef(c).name+'<br>'
    +'Live: <b style="color:'+(anyEnerg(c)?'var(--live)':'var(--dim)')+'">'+(anyEnerg(c)?'ENERGIZED':'\u2014')+'</b>'
    +(bad?' \u00b7 <span style="color:var(--warn)">'+bad+'</span>':'')+'<br>'
    +'<span style="color:var(--dim)">Wired to:</span> '+(nb.map(esc).join(', ')||'(nothing)')+'</div>'; }
function applyView(){ const dim=(viewMode==='phys'||mode==='sim'); const l=document.getElementById('left');
  if(l){ l.style.opacity=dim?'.4':'1'; l.style.pointerEvents=dim?'none':'auto'; } }

function initLibrary(){ const sel=$('#libsel'); if(!sel)return; const lib=window.PANEL_LIBRARY;
  if(!lib||!Object.keys(lib).length){ sel.style.display='none'; return; }
  sel.style.display='';
  sel.innerHTML='<option value="">▾ Panel library ('+Object.keys(lib).length+')</option>'+Object.keys(lib).map(k=>'<option value="'+esc(k)+'">'+esc(k)+'</option>').join('');
  sel.onchange=()=>{ const k=sel.value; if(!k){return;} PANEL=JSON.parse(JSON.stringify(lib[k]));
    restoreUid(); sel.selectedIndex=0; $('#stat').textContent=k;
    const s2=$('#libsel'); if(s2)s2.blur();
    persist(); applyEnc(); applyView(); render(); renderInspector(); toast('Loaded: '+k); };
}
/* ---------- init ---------- */
function init(){ $('#ver').textContent='v'+VERSION;
  const _h=applyHash();
  if(_h){ $('#stat').textContent=_h==='lib'?'shared (library)':'shared link'; }
  else if(!restore()){ PANEL=demoPanel(); $('#stat').textContent='demo panel'; } else { $('#stat').textContent='restored'; }
  try{encOn=localStorage.getItem('pt_enc')!=='0';}catch(e){}
  const be=$('#btnEnc'); if(be)be.onclick=()=>{encOn=!encOn;try{localStorage.setItem('pt_enc',encOn?'1':'0');}catch(e){}applyEnc();render();};
  const bv=$('#btnView'); if(bv)bv.onclick=()=>{ viewMode=viewMode==='phys'?'sch':'phys';
    bv.classList.toggle('on',viewMode==='phys'); bv.innerHTML=viewMode==='phys'?'&#128268; Schematic':'&#128452; Physical';
    sel=null;selWire=null; applyView(); render(); renderInspector(); };
  buildPalette(); setMode('build'); applyEnc(); applyView(); render(); renderInspector();
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
   PANEL TRACER — EXTRAS (features 1-13). All top-level fn decls hoist.
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
  if(ra===rb) return {v:0,txt:'0 V — same node'};
  const ha=isHot(a),hb=isHot(b),rta=isRet(a),rtb=isRet(b);
  const liveA=ha||rta, liveB=hb||rtb;
  if((ha&&rtb)||(rta&&hb)){ const nv=nomFor(ha?a:b); return {v:nv,txt:nv+' V (across the line)'}; }
  if(ha&&hb) return {v:0,txt:'~0 V (both HOT / same phase)'};
  if(rta&&rtb) return {v:0,txt:'0 V (both NEUTRAL/return)'};
  if(liveA&&!liveB){ const nv=nomFor(a); return {v:nv,txt:nv+' V (open circuit — B is dead)'}; }
  if(liveB&&!liveA){ const nv=nomFor(b); return {v:nv,txt:nv+' V (open circuit — A is dead)'}; }
  return {v:0,txt:'0 V (both de-energized)'};
}
function renderMeter(){ const box=$('#simextra'); if(!box)return; const r=probeVoltage();
  let h='<div class="hint" style="margin:8px 0 4px">Meter: click terminal <b style="color:#ff5b4a">A</b> then <b style="color:#38bdf8">B</b>.</div>';
  if(probes.length){ h+='<div class="hint">A: '+esc(probes[0])+'</div>'; }
  if(probes.length>1){ h+='<div class="hint">B: '+esc(probes[1])+'</div>'; }
  if(r){ h+='<div class="statebtn" style="margin-top:6px;color:var(--live);border-color:var(--live)">\u2301 '+esc(r.txt)+'</div>'; }
  if(probes.length){ h+='<button class="tbtn" id="mt-clr" style="width:100%">Clear probes</button>'; }
  box.innerHTML=h; const c=$('#mt-clr'); if(c)c.onclick=()=>{probes=[];render();renderSimInspector();};
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
  m=h.match(/#lib=([^&]+)(?:&s=(.+))?$/);
  if(m){ const lib=window.PANEL_LIBRARY; const name=decodeURIComponent(m[1]);
    if(lib&&lib[name]){ PANEL=JSON.parse(JSON.stringify(lib[name])); restoreUid();
      if(m[2]){ decodeURIComponent(m[2]).split(';').forEach(tok=>{ const mm=tok.match(/^(.+)~([^!]*)(!)?$/);
        if(mm){ const c=findComp(mm[1]); if(c){ if(mm[2])c.state=mm[2]; c.fault=!!mm[3]; } } }); }
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
    $('#toolout').innerHTML=r.issues.map(i=>'<div class="suspect" style="border-color:'+(i.lvl==='warn'?'var(--warn)':i.lvl==='ok'?'var(--ok)':'var(--edge)')+';cursor:'+(i.ref?'pointer':'default')+'" '+(i.ref?'data-ref="'+i.ref+'"':'')+'>'+esc(i.msg)+'</div>').join('');
    $('#toolout').querySelectorAll('[data-ref]').forEach(el=>el.onclick=()=>{ sel=findComp(el.dataset.ref); closeModal(); render(); flash(el.dataset.ref); renderInspector(); }); };
  $('#tk-lock').onclick=()=>{ const r=validateInterlocks();
    $('#toolout').innerHTML=r.issues.map(i=>'<div class="suspect" style="border-color:'+(i.lvl==='warn'?'var(--warn)':i.lvl==='ok'?'var(--ok)':'var(--edge)')+';cursor:'+(i.ref?'pointer':'default')+'" '+(i.ref?'data-ref="'+i.ref+'"':'')+'>'+esc(i.msg)+'</div>').join('');
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
    $('#toolout').innerHTML=r.issues.map(i=>'<div class="suspect" style="border-color:'+(i.lvl==='warn'?'var(--warn)':i.lvl==='ok'?'var(--ok)':'var(--edge)')+';cursor:'+(i.ref?'pointer':'default')+'" '+(i.ref?'data-ref="'+i.ref+'"':'')+'>'+esc(i.msg)+'</div>').join('');
    $('#toolout').querySelectorAll('[data-ref]').forEach(el=>el.onclick=()=>{ sel=findComp(el.dataset.ref); closeModal(); render(); flash(el.dataset.ref); renderInspector(); }); };
  $('#tk-wsched').onclick=exportWireCsv;
  $('#tk-work').onclick=printWorksheet;
  $('#tk-term').onclick=terminalReport;
  $('#tk-ladder').onclick=ladderize;
  $('#tk-snap').onclick=openSnapshots;
  $('#tk-coord').onclick=()=>{ const r=coordinationStudy();
    $('#toolout').innerHTML=r.issues.map(i=>'<div class="suspect" style="border-color:'+(i.lvl==='warn'?'var(--warn)':i.lvl==='ok'?'var(--ok)':'var(--edge)')+';cursor:'+(i.ref?'pointer':'default')+'" '+(i.ref?'data-ref="'+i.ref+'"':'')+'>'+esc(i.msg)+'</div>').join('');
    $('#toolout').querySelectorAll('[data-ref]').forEach(el=>el.onclick=()=>{ sel=findComp(el.dataset.ref); closeModal(); render(); flash(el.dataset.ref); renderInspector(); }); };
  $('#tk-health').onclick=()=>{ const r=healthReport();
    $('#toolout').innerHTML=r.issues.map(i=>'<div class="suspect" style="border-color:'+(i.lvl==='warn'?'var(--warn)':i.lvl==='ok'?'var(--ok)':'var(--edge)')+';cursor:'+(i.ref?'pointer':'default')+'" '+(i.ref?'data-ref="'+i.ref+'"':'')+'>'+esc(i.msg)+'</div>').join('');
    $('#toolout').querySelectorAll('[data-ref]').forEach(el=>el.onclick=()=>{ sel=findComp(el.dataset.ref); closeModal(); render(); flash(el.dataset.ref); renderInspector(); }); };
  $('#tk-pm').onclick=openPM;
  $('#tk-scen').onclick=openScenarios;
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
   PANEL TRACER — EXTRAS2 (features 14-25). All top-level fn decls hoist.
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
    +'<text x="'+(bx+7)+'" y="'+(by+35)+'" style="fill:#8b949e;font:8px sans-serif">ACY1 RME \u00b7 Panel Path Tracer</text>'
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
   PANEL TRACER — EXTRAS3 (features 26-37). fn decls hoist; state via var.
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
    +'<h1>ACY1 RME \u2014 Troubleshooting Worksheet</h1>'
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
function terminalReport(){ const terms=PANEL.components.filter(c=>c.type==='term');
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
   PANEL TRACER — EXTRAS4 (features 38-49). fn decls hoist; state via var.
   ========================================================================= */
var showPhase=false, contMode=false, showTherm=false, cbSafe=false, _pointers={}, _pinch=null, scenario=null, _scenTimer=0;
var PHASE_COLOR={L1:'#b45309',L2:'#ea580c',L3:'#eab308',L:'#38bdf8'};

/* ---------- 2: continuity / ohmmeter (dead test) ---------- */
function continuityCheck(){ if(probes.length<2)return null; const uf=new UF(); const key=(c,t)=>c.id+'|'+t;
  PANEL.wires.forEach(w=>{ if(!w.cut)uf.union(w.a,w.b); });
  PANEL.components.forEach(c=>{ compDef(c).links(c).forEach(([x,y])=>uf.union(key(c,x),key(c,y))); });
  const [a,b]=probes; if(uf.find(a)!==uf.find(b)) return {txt:'OPEN \u2014 no continuity (OL / \u221e \u03a9)', ok:false};
  const root=uf.find(a);
  const hiz=PANEL.components.some(c=>c.hiZ&&compDef(c).links(c).length&&termList(c).some(t=>uf.find(key(c,t.id))===root));
  return hiz?{txt:'CONTINUITY but HIGH RESISTANCE \u2014 suspect a loose/corroded connection', ok:false}
           :{txt:'CONTINUITY \u2014 good path (~0 \u03a9) \u2014 beep', ok:true}; }
function renderCont(){ const box=$('#simextra'); if(!box)return; const r=continuityCheck();
  let h='<div class="hint" style="margin:8px 0 4px">\ud83d\udd0c Dead test \u2014 assume power is <b>OFF/LOTO</b>. Click point <b style="color:#ff5b4a">A</b> then <b style="color:#38bdf8">B</b> to ring it out.</div>';
  if(probes.length) h+='<div class="hint">A: '+esc(probes[0])+'</div>';
  if(probes.length>1) h+='<div class="hint">B: '+esc(probes[1])+'</div>';
  if(r) h+='<div class="statebtn '+(r.ok?'closed':'open')+'" style="margin-top:6px">'+esc(r.txt)+'</div>';
  if(probes.length) h+='<button class="tbtn" id="ct-clr" style="width:100%">Clear</button>';
  box.innerHTML=h; const c=$('#ct-clr'); if(c)c.onclick=()=>{probes=[];render();renderSimInspector();}; }

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
  const p=prot[0].c; if(p.type==='fuse')p.state='blown'; else p.state='tripped';
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
function startScenario(kind){ const def=SCEN.find(s=>s.id===kind); const sp=scenarioPanel(kind);
  PANEL=validatePanel(sp.panel); restoreUid(); scenario={id:kind, answer:sp.answer, t0:Date.now(), done:false};
  sel=null;selWire=null;selSet=[]; setMode('sim'); persist(); render(); renderSimInspector(); closeModal();
  toast('\u25b6 Scenario: '+def.name); }
function scenarioGuess(){ if(!scenario||!sel){ toast('Click the device you suspect first'); return; }
  const secs=Math.round((Date.now()-scenario.t0)/1000); const ok=sel.id===scenario.answer; scenario.done=true;
  let best=null; try{ best=+localStorage.getItem('pt_scen_'+scenario.id)||null; }catch(e){}
  if(ok&&(!best||secs<best)){ try{localStorage.setItem('pt_scen_'+scenario.id,secs);}catch(e){} }
  toast(ok?('\u2705 Correct in '+secs+'s'+(best&&secs<best?' \u2014 new best!':best?(' (best '+best+'s)'):'')):'\u274c Not it \u2014 keep tracing');
  renderSimInspector(); }
function openScenarios(){ let best={}; SCEN.forEach(s=>{try{best[s.id]=localStorage.getItem('pt_scen_'+s.id);}catch(e){}});
  openModal('Training scenarios', SCEN.map(s=>'<div class="suspect" style="cursor:pointer" data-s="'+s.id+'"><b>'+esc(s.name)+'</b>'+(best[s.id]?' <span style="color:var(--ok)">\u00b7 best '+esc(String(best[s.id]))+'s</span>':'')+'<br><span class="hint">'+esc(s.prompt)+'</span></div>').join(''));
  (document.querySelector('#modal')||document).querySelectorAll('[data-s]').forEach(el=>el.onclick=()=>startScenario(el.dataset.s)); }

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
  openModal('Scan a panel QR','<video id="qr-vid" playsinline style="width:100%;border-radius:8px;background:#000"></video><div class="hint" style="margin-top:6px">Point the camera at a Panel Tracer QR code.</div>');
  const vid=$('#qr-vid'); const det=new BarcodeDetector({formats:['qr_code']}); let stream=null, stop=false;
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
