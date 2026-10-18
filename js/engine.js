// --- CONSTANTES DU JEU ---
const G=[
  ['Nourriture',10,'🌾'],['Bois',14,'🌲'],['Tissu',20,'🧵'],['Fer',26,'⛏️'],
  ['Épices',55,'🌶️'],['Soie',75,'🧣'],['Gemmes',110,'💎'],['Armes',65,'⚔️'],['Artefact',220,'🏺'],
  ['Pain',90,'🍞'],['Festin',240,'🍯'],['Tapis',320,'🎭'],['Bijou',480,'💍']
];
const N_GOODS = G.length;
const N_NAT = 9;
const RECIPES=[
  {out:9,  inputs:{0:2,1:1},  fee:15, desc:'2 Nourriture + 1 Bois'},
  {out:10, inputs:{4:2,0:1},  fee:40, desc:'2 Épices + 1 Nourriture'},
  {out:11, inputs:{5:2,2:1},  fee:50, desc:'2 Soie + 1 Tissu'},
  {out:12, inputs:{6:2,3:1},  fee:80, desc:'2 Gemmes + 1 Fer'}
];
const SUPPLY_MAX = 100;
const SUPPLY_START = 20;
const SUPPLY_RATE = 0.05;
const BI={désert:{c:'#d8b25c',p:[4,6],d:[0,1]},forêt:{c:'#6f9a4a',p:[1,0],d:[3,7]},côtière:{c:'#5a9ab0',p:[5,0],d:[3,1]},montagne:{c:'#9a8f86',p:[3,6],d:[0,2]},plaine:{c:'#a9bf5a',p:[0,2],d:[4,5]}};
const SZ=['village','bourg','cité','métropole'],SF=[.6,1,1.5,2.2],TS={plaine:1,forêt:.8,montagne:.55,désert:.7,côte:.95},TT=Object.keys(TS);
const U=[['cap','Capacité','+15 charges, +1 chameau de bât',120],['spd','Vitesse','+15 % de vitesse',150],['grd','Gardes','+1 garde anti-bandits',100],['neg','Négociation','-4 % achat / +4 % vente',140],['sc','Éclaireurs','révèle routes, villes, événements',130]];
const EVN={fest:'🎉 Festival',fam:'🌾 Famine',war:'⚔️ Guerre',epi:'☣️ Épidémie'};

// --- ÉTAT GLOBAL ---
var S = null;
var TOTAL=100, DIFF=1;
var speed=1, tab='m', sel=null, last=0;
var meta=JSON.parse(localStorage.getItem('cd_meta')||'{"ren":0}'), scores=JSON.parse(localStorage.getItem('cd_hs')||'[]');
var AC=null, SND=true, MG=null, NB=null, MUS=true, mt=0, ms=0, hk=0, DP=[], nb=0;
var TX=null, TR=null, CD=1, CV=[1,0];

var bgMusic = new Audio('assets/audio/musique_fond.mp3');
bgMusic.loop = true; // La musique tourne en boucle
bgMusic.volume = 0.3; // Volume à 30% (ajustez entre 0 et 1)

// --- CAMÉRA (Zoom fixe centré sur la caravane) ---
var camera = { x: 0, y: 0, zoom: 2.5 }; // Zoom à 250%
var mousePos = { x: -1000, y: -1000 };
var isMouseOver = false;

// --- CHARGEMENT IMAGES ---
var imgFondCarte = new Image(); imgFondCarte.src = 'assets/images/fond_carte.jpg'; 
var imgVillage = new Image(); imgVillage.src = 'assets/images/village.png';
var imgBourg = new Image(); imgBourg.src = 'assets/images/bourg.png';
var imgCite = new Image(); imgCite.src = 'assets/images/cite.png';
var imgMetropole = new Image(); imgMetropole.src = 'assets/images/metropole.webp';

// --- RACCOURCIS & OUTILS ---
const $=i=>document.getElementById(i),R=Math.random,ri=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=a=>a[ri(0,a.length-1)],cl=(v,a,b)=>Math.min(b,Math.max(a,v));
const ref=(c,g)=>(g==8?5:30)*SF[c.sz];
function eq(c,g){let m=c.p.includes(g)?2.2:c.d.includes(g)?.3:1;const e=c.ev&&c.ev.t;if(e=='fam'&&g==0)m=.08;if(e=='war'&&(g==7||g==3))m=.1;return ref(c,g)*m}
function price(c,g){ if(g >= N_NAT) return G[g][1] * (0.85 + c.sz * 0.15); return G[g][1]*cl(.4+.6/Math.max(c.s[g]/ref(c,g),.05),.4,2.8)*(g==8?c.am:1); }
const buyP=(c,g)=>Math.max(1,Math.round(price(c,g)*1.06*(1-.04*S.up.neg)*(1-(c.rep||0)/1200)));
const sellP=(c,g)=>Math.max(1,Math.round(price(c,g)*.94*(1+.04*S.up.neg)*(c.ev&&c.ev.t=='fest'?1.3:1)*(1+(c.rep||0)/1200)));
const cap=()=>20+15*S.up.cap,load=()=>S.inv.reduce((a,b)=>a+b,0);
const cargoV=()=>S.inv.reduce((a,n,g)=>a+n*G[g][1],0);
const wealth=()=>Math.round(S.gold+cargoV()+S.spent);
const ucost=k=>Math.round(U.find(u=>u[0]==k)[3]*Math.pow(1.65,S.up[k]));
const scost=()=>Math.round(350*Math.pow(1.8,S.subs.length));
function log(t,c){S.log.unshift([t,c||'']);S.log.length=Math.min(S.log.length,40)}

function getPhaseInfo(){
  const t = S ? S.t : 0.3;
  if(t < 0.08) return {icon:'🌄', label:'Aube',  night:true};
  if(t < 0.20) return {icon:'🌅', label:'Matin', night:false};
  if(t < 0.55) return {icon:'☀️', label:'Jour',  night:false};
  if(t < 0.70) return {icon:'🌤️', label:'Après-midi', night:false};
  if(t < 0.82) return {icon:'🌆', label:'Crépuscule', night:false};
  if(t < 0.94) return {icon:'🌙', label:'Nuit',  night:true};
  return {icon:'🌌', label:'Nuit profonde', night:true};
}
function isNight(){ return getPhaseInfo().night; }
function getAmbient(t){
  const pts = [{t:0, c:[255,160,110], a:0.16},{t:0.1, c:[255,200,140], a:0.06},{t:0.22, c:[255,240,200], a:0},{t:0.62, c:[255,240,200], a:0},{t:0.74, c:[255,140,80], a:0.14},{t:0.84, c:[100,80,140], a:0.28},{t:0.92, c:[25,35,80], a:0.46},{t:1, c:[25,35,80], a:0.46}];
  for(let i=0;i<pts.length-1;i++){ if(t >= pts[i].t && t <= pts[i+1].t){ const f=(t-pts[i].t)/(pts[i+1].t-pts[i].t); return { c: pts[i].c.map((v,j)=>Math.round(v+(pts[i+1].c[j]-v)*f)), a: pts[i].a + (pts[i+1].a - pts[i].a)*f }; } }
  return {c:[25,35,80], a:0.46};
}
function fogRadius(){ return 3 + 2*(S.up.sc||0); }
function computeFog(){
  if(!S) return;
  const radius = fogRadius(), best = {};
  S.C.forEach(start => { if(!start.seen) return; const q = [[start.id, 0]], vis = new Set([start.id]); while(q.length){ const [id, d] = q.shift(); if(best[id] === undefined || d < best[id]) best[id] = d; if(d >= radius) continue; S.C[id].adj.forEach(x => { if(!vis.has(x.to)){ vis.add(x.to); q.push([x.to, d+1]); } }); } });
  S.C.forEach(c => { c.rumeur = c.seen || (best[c.id] !== undefined); });
}
const visibleCity = c => !!(c.seen || c.rumeur);

function newGame(){
 const a=['Al','Bel','Cor','Dun','El','Far','Gor','Hal','Isk','Kar','Lum','Mor','Nar','Os','Pel','Ras','Sol','Tar','Val'],b=['a','e','i','o','u','ia','ar','en'],d=['dor','mir','ton','ex','heim','bad','gard','ria','vik','sa'];
 const n=ri(12,22),C=[],used=new Set();let t=0;
 while(C.length<n&&t++<4000){const x=.05+R()*.9,y=.08+R()*.84;if(C.every(c=>Math.hypot((c.x-x)*1.6,c.y-y)>.13))C.push({x,y})}
 C.forEach((c,i)=>{let nm;do nm=pick(a)+pick(b)+pick(d);while(used.has(nm));used.add(nm);
  Object.assign(c,{id:i,name:nm,b:pick(Object.keys(BI)),sz:ri(0,3),am:.6+R()*1.2,ev:null,q:null,seen:false,rumeur:false,s:Array(N_GOODS).fill(0),adj:[],rep:0});
  const B=BI[c.b];c.p=[...B.p];c.d=[...B.d];if(R()<.5)c.p.push(ri(0,7));if(R()<.4)c.d.push(ri(0,7));if(R()<.4)c.p.push(8);else c.d.push(8);
  c.p=c.p.filter(g=>!c.d.includes(g)); for(let g=0;g<N_NAT;g++)c.s[g]=eq(c,g)*(.7+R()*.6);
 });
 const E=[],dist=(p,q)=>Math.hypot((p.x-q.x)*1.6,p.y-q.y),has=(i,j)=>E.some(e=>(e.a==i&&e.b==j)||(e.a==j&&e.b==i));
 const add=(i,j)=>{const p=C[i],q=C[j];const ter=R()<.5?pick(TT):({désert:'désert',forêt:'forêt',côtière:'côte',montagne:'montagne',plaine:'plaine'})[R()<.5?p.b:q.b];
  const e={a:i,b:j,d:Math.round(dist(p,q)*170),t:ter,dg:cl(Math.round((ri(1,3)+(ter=='montagne'||ter=='désert'?1:0)+(R()<.2?1:0))*DIFF),1,5)};E.push(e);p.adj.push({to:j,e});q.adj.push({to:i,e})};
 const inT=new Set([0]);while(inT.size<C.length){let best=null;inT.forEach(i=>C.forEach((c,j)=>{if(!inT.has(j)){const dd=dist(C[i],c);if(!best||dd<best[0])best=[dd,i,j]}}));add(best[1],best[2]);inT.add(best[2])}
 C.forEach((c,i)=>C.map((o,j)=>[dist(c,o),j]).filter(x=>x[1]!=i).sort((x,y)=>x[0]-y[0]).slice(0,2).forEach(x=>{if(R()<.6&&!has(i,x[1])&&x[0]<.4)add(i,x[1])}));
 const cur=ri(0,C.length-1);C[cur].seen=true;C[cur].rumeur=true;
 S={C,E,cur,day:0,t:0.25,gold:Math.round(150*(1+.15*meta.ren)),inv:Array(N_GOODS).fill(0), water:SUPPLY_START, food:SUPPLY_START, up:{cap:0,spd:0,grd:0,neg:0,sc:0},subs:[],travel:null,path:[],km:0,log:[],spent:0,slow:0,over:false,
    stats:{bought:Array(N_GOODS).fill(0),sold:Array(N_GOODS).fill(0),spentOn:Array(N_GOODS).fill(0),earnedOn:Array(N_GOODS).fill(0),bestTrade:0,bestTradeInfo:null,totalProfit:0,deals:0,contractsDone:0,contractsFailed:0,crafted:0,ambushes:0,repelled:0,shortcuts:0,waterBought:0, foodBought:0, deaths:0}};
 S.contracts = [genContract(), genContract(), genContract()];
 computeFog(); sel=null; $('end').style.display='none'; $('dead').style.display='none';
 log('Votre caravane quitte '+C[cur].name+'. Bonne route, marchand !');
 autoSave(); ui();
}

function hops(){const o=S.travel?S.travel.from:S.cur,h={[o]:0},q=[o];while(q.length){const i=q.shift();S.C[i].adj.forEach(x=>{if(!(x.to in h)){h[x.to]=h[i]+1;q.push(x.to)}})}return h}
const known=(c,h)=>c.seen||(c.rumeur && h[c.id]<=S.up.sc);
const rk=(e,h)=>Math.min(h[e.a],h[e.b])<=S.up.sc;

function go(id){
  if(S.travel||S.over||id==S.cur)return;
  const D={},P={},q=new Set(S.C.map(c=>c.id));S.C.forEach(c=>D[c.id]=1e9);D[S.cur]=0;
  while(q.size){let u=null;q.forEach(i=>{if(u==null||D[i]<D[u])u=i});q.delete(u);S.C[u].adj.forEach(x=>{const nd=D[u]+x.e.d;if(nd<D[x.to]){D[x.to]=nd;P[x.to]=u}})}
  const path=[];for(let i=id;i!=S.cur;i=P[i])path.unshift(i);S.path=path;leg();
}
function leg(){const to=S.path.shift(),e=S.C[S.cur].adj.find(x=>x.to==to).e;S.travel={e,from:S.cur,to,pos:0,distSinceCheck:0};log('➡️ Départ vers '+S.C[to].name+' ('+e.d+' km, '+e.t+')');ui()}

function rollTravelEvent(T){
  const war = [S.C[T.from], S.C[T.to]].some(c => c.ev && c.ev.t=='war');
  const nightExtra = isNight() ? 1 : 0;
  const dg = T.e.dg + (war?2:0) + nightExtra;
  const pAmbush = (0.03 + 0.015*dg) * (0.5 + 0.5*DIFF);
  const x = R();
  if(x < pAmbush){
    const gd = S.up.grd;
    const pRepel = gd / (gd + dg*1.2 + 0.5);
    if(R() < pRepel){
      S.stats.repelled = (S.stats.repelled||0) + 1; swordClash(0.10); log('🛡️ Une bande de brigands est repoussée par vos gardes !','g');
    } else {
      S.stats.ambushes = (S.stats.ambushes||0) + 1; swordClash(0.18);
      const lossGold = Math.round(S.gold * (0.10 + R()*0.15) * Math.min(1.4, DIFF)); S.gold = Math.max(0, S.gold - lossGold);
      let lossGoods = 0, lossName = ''; const owned = [];
      for(let g=0;g<N_GOODS;g++) if(S.inv[g] > 0) owned.push(g);
      if(owned.length > 0){ const g = pick(owned); const qte = Math.max(1, Math.floor(S.inv[g] * (0.15 + R()*0.20))); S.inv[g] -= qte; lossGoods = qte; lossName = G[g][0]; }
      let msg = '🗡️ Embuscade ! -'+lossGold+' or'; if(lossGoods > 0) msg += ', -'+lossGoods+' '+lossName; log(msg, 'r'); pop('-'+lossGold, 'r'); ui.travelFlash = performance.now();
    }
  } else {
    const y = R();
    if(y < 0.06){ S.stats.shortcuts = (S.stats.shortcuts||0) + 1; T.pos = Math.min(T.e.d - 1, T.pos + T.e.d * 0.15); log('🧭 Vous découvrez un raccourci ! (+15 % du trajet)','g'); }
    else if(y < 0.13){ const g = ri(0,7); const n = Math.min(6, cap() - load()); const p = Math.round(G[g][1] * 0.55); if(n > 0 && S.gold >= p*n){ S.gold -= p*n; S.inv[g] += n; S.stats.bought[g] += n; S.stats.spentOn[g] += p*n; log('🧳 Marchand ambulant : '+n+'× '+G[g][2]+' '+G[g][0]+' à '+(p*n)+' or.','g'); } else log('🧳 Vous croisez un marchand ambulant.'); }
    else if(y < 0.22){ if(S.slow <= 0){ S.slow = 3; log('⛈️ Intempéries : vitesse -50 % pendant 3 jours','r'); } }
    else if(y < 0.28){ const o = ri(40, 180 + S.day*2); S.gold += o; log('💎 Cache abandonnée : +'+o+' or !','g'); pop('+'+o,'g'); }
  }
}

function step(dt){
  if(S.over) return;
  S.t += dt * 0.10 * (speed || 1) * 0.3;
  if(S.travel){
    const T = S.travel, nightBonus = isNight() ? 1.25 : 1;
    const v = 18 * (1 + 0.15*S.up.spd) * TS[T.e.t] * (S.slow>0?.5:1) * nightBonus;
    const dist = v * dt;
    T.pos += dist; S.km += dist;
    S.water -= dist * SUPPLY_RATE; S.food -= dist * SUPPLY_RATE;
    if(checkDeath()) return;

    T.distSinceCheck = (T.distSinceCheck || 0) + dist;
    while(T.distSinceCheck >= 20 && !S.over){
      T.distSinceCheck -= 20;
      rollTravelEvent(T);
      if(T.pos >= T.e.d) break;
    }

    if(T.pos >= T.e.d){
      S.cur = T.to; S.travel = null;
      const c = S.C[S.cur]; c.seen = true;
      log('📍 Arrivée à ' + c.name); computeFog();
      if(!c.q && R()<.3 && c.sz>0){ const g = ri(0,7), n = ri(4,10); c.q = {g, n, rew:Math.round(n*G[g][1]*2), exp:S.day+15}; log('📜 Quête à '+c.name+' : '+n+'× '+G[g][0]+' pour '+c.q.rew+' or'); }
      checkAutoDeliveries();
      if(S.water < 8 || S.food < 8) log('⚠️ Provisions faibles ! Achetez eau/nourriture ici.','r');
      if(S.path.length && !(c.ev && 0)) leg(); else ui();
    }
  }
  while(S.t >= 1 && !S.over){ S.t -= 1; dayTick(); }
}

function dayTick(){
  S.day++; if(S.slow>0) S.slow--;
  S.C.forEach(c => {
    for(let g=0;g<N_NAT;g++) c.s[g] = Math.max(0, c.s[g] + (eq(c,g)-c.s[g])*.06 + (R()-.5)*.6);
    if(c.ev && --c.ev.left <= 0){ log('Fin : '+EVN[c.ev.t]+' à '+c.name); c.ev = null; }
    if(c.q && c.q.exp < S.day) c.q = null;
  });
  if(R()<.12){ const c = pick(S.C); if(!c.ev){ const t=pick(['fest','fam','war','epi']); c.ev={t,left:ri(8,14)}; log(EVN[t]+' à '+c.name+' !', t=='fest'?'g':'r'); } }
  S.subs.forEach(s => {
    if(++s.t >= s.cyc){
      s.t = 0; const A = S.C[s.a], B = S.C[s.b]; let m = 5;
      for(let g=0;g<8;g++) m = Math.max(m, price(B,g)-price(A,g), price(A,g)-price(B,g));
      if(R()<.15) log('🐫 Sous-caravane pillée.','r');
      else{ const p = Math.round(m*(12+3*S.up.cap)*.5); S.gold += p; log('🐫 Sous-caravane : +'+p+' or','g'); pop('+'+p,'g'); }
    }
  });
  tickContracts();
  if(S.day%10===0) autoSave();
  ui(); if(S.day >= TOTAL && !S.over) finish();
}

function checkDeath(){
  if(!S || S.over) return false;
  if(S.water <= 0 || !isFinite(S.water)){ S.water = 0; gameOver('water'); return true; }
  if(S.food <= 0 || !isFinite(S.food)){ S.food = 0; gameOver('food'); return true; }
  return false;
}

function gameOver(cause){
  bgMusic.pause();
  if(S.over) return; S.over = true; S.travel = null; S.stats.deaths = (S.stats.deaths||0) + 1;
  if(AC && SND){ try{ const t0 = AC.currentTime; [392, 330, 262, 196].forEach((f, i) => { tone(f, t0 + i*0.22, 0.5, 'sine', 0.12); }); setTimeout(() => { if(AC && SND) noise(0.5, 0.08); }, 900); }catch(e){} }
  document.body.classList.add('shake'); setTimeout(() => document.body.classList.remove('shake'), 700);
  const data = cause === 'water' ? { icon:'💧', title:'MORT DE SOIF', reason:'Plus une seule goutte d\'eau dans les outres…', lore:'Les chameaux titubent. Le soleil implacable dessèche les gorges. La caravane s\'effondre dans les dunes.' } : { icon:'🍖', title:'MORT DE FAIM', reason:'Les provisions sont vides depuis trop longtemps…', lore:'Les bêtes refusent d\'avancer. Les estomacs crient famine. La caravane s\'arrête, puis s\'éteint, à jamais.' };
  const emojis = cause === 'water' ? ['💧','💧','💦'] : ['🍖','🥖','🦴']; let particles = '';
  for(let i = 0; i < 16; i++){ const left = 5 + Math.random()*90; const delay = (Math.random()*3).toFixed(2); const dur = (2.5 + Math.random()*2).toFixed(2); const size = (20 + Math.random()*24).toFixed(0); const em = emojis[Math.floor(Math.random()*emojis.length)]; particles += '<span class="drop" style="left:'+left+'%;animation-duration:'+dur+'s;animation-delay:'+delay+'s;font-size:'+size+'px">'+em+'</span>'; }
  const score = wealth(); const cityName = S.C[S.cur] ? S.C[S.cur].name : 'lieu inconnu';
  const html = particles + '<div class="box"><div class="skull">'+data.icon+'</div><h1>'+data.title+'</h1><div class="reason">'+data.reason+'</div><div class="lore">'+data.lore+'</div><div class="stats">Jour fatal : <b>J'+S.day+'</b> · Ville la plus proche : <b>'+cityName+'</b><br>Or : <b>'+Math.round(S.gold)+'</b> · Cargaison : <b>'+Math.round(cargoV())+'</b><br>Distance parcourue : <b>'+Math.round(S.km)+' km</b><br>Score final : <b>'+score+'</b></div><button onclick="restartAfterDeath()">🔄 Nouvelle caravane</button><button onclick="deadToMenu()">☰ Menu</button></div>';
  const dEl = $('dead'); dEl.innerHTML = html;
  dEl.style.position = 'fixed'; dEl.style.top = '0'; dEl.style.left = '0'; dEl.style.right = '0'; dEl.style.bottom = '0'; dEl.style.zIndex = '100'; dEl.style.display = 'flex'; dEl.style.alignItems = 'center'; dEl.style.justifyContent = 'center'; dEl.style.background = 'radial-gradient(circle at 50% 50%, #2a0808 0%, #000 75%)'; dEl.style.overflow = 'hidden';
  try{ localStorage.removeItem('cd_save'); }catch(e){}
}

function finish(){
  bgMusic.pause();
  if(S.over) return; S.over = true;
  const sc = wealth(), gain = Math.floor(sc/2000);
  scores.push({s:sc, d:new Date().toLocaleDateString(), m:TOTAL+' j · '+DIFF});
  scores.sort((a,b)=>b.s-a.s); scores = scores.slice(0,8); localStorage.setItem('cd_hs', JSON.stringify(scores));
  meta.ren += gain; localStorage.setItem('cd_meta', JSON.stringify(meta));
  try{ localStorage.removeItem('cd_save'); }catch(e){}
  const cd = S.stats.contractsDone||0, cf = S.stats.contractsFailed||0, cr = S.stats.crafted||0, am = S.stats.ambushes||0, rp = S.stats.repelled||0;
  $('endb').innerHTML = '<h2>Fin du voyage</h2><p>Or : '+Math.round(S.gold)+'<br>Marchandises : '+Math.round(cargoV())+'<br>Améliorations : '+S.spent+'<br>Contrats livrés : '+cd+' / échoués : '+cf+'<br>Objets fabriqués : '+cr+'<br>Embuscades subies : '+am+' / repoussées : '+rp+'<br><b style="font-size:18px">Score : '+sc+'</b></p><p>Renom gagné : +'+gain+'</p><b>Meilleurs scores</b>'+scores.map((x,i)=>'<div>'+(i+1)+'. '+x.s+'</div>').join('')+'<p><button onclick="newGame()">Nouvelle partie</button> <button onclick="toMenu()">Menu principal</button></p>';
  $('end').style.display = 'flex';
}

// --- CANVAS & RENDU VISUEL ---
const cv = $('cv'), cx = cv.getContext('2d');

function tex(W,H){
  if(TX && TX.width==W && TX.height==H) return TX;
  TX = document.createElement('canvas'); TX.width = W; TX.height = H;
  const t = TX.getContext('2d');
  for(let i=0;i<W*H/60;i++){ t.fillStyle = 'rgba('+(90+ri(0,40))+',60,20,'+R()*.07+')'; t.fillRect(R()*W, R()*H, ri(1,3), ri(1,3)); }
  for(let i=0;i<8;i++){ const x = R()*W, y = R()*H, q = 30+R()*80; const gr = t.createRadialGradient(x,y,0,x,y,q); gr.addColorStop(0,'rgba(120,70,20,.13)'); gr.addColorStop(1,'rgba(120,70,20,0)'); t.fillStyle = gr; t.fillRect(x-q,y-q,q*2,q*2); }
  const v = t.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,W*.65); v.addColorStop(0,'rgba(60,30,5,0)'); v.addColorStop(1,'rgba(60,30,5,.45)'); t.fillStyle = v; t.fillRect(0,0,W,H);
  return TX;
}

function bld(sz,x,y,r){
  let img = null;
  if (sz === 0) img = imgVillage; else if (sz === 1) img = imgBourg; else if (sz === 2) img = imgCite; else if (sz === 3) img = imgMetropole;
  if (img && img.complete && img.naturalWidth > 0) {
      cx.save(); cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.clip();
      const imgRatio = img.naturalWidth / img.naturalHeight;
      let dw = r * 2, dh = r * 2;
      if (imgRatio > 1) dw = (r * 2) * imgRatio; else dh = (r * 2) / imgRatio;
      cx.drawImage(img, x - dw/2, y - dh/2, dw, dh);
      cx.restore();
  } else {
      const s = r/12; cx.save(); cx.translate(x,y+3*s); cx.scale(s,s); cx.fillStyle = '#4a3010';
      const hs = (o,w,h) => { cx.beginPath(); cx.moveTo(o-w,4); cx.lineTo(o-w,4-h); cx.lineTo(o,4-h-w*.8); cx.lineTo(o+w,4-h); cx.lineTo(o+w,4); cx.closePath(); cx.fill(); };
      const tw = (o,w,h) => { cx.fillRect(o-w,4-h,w*2,h); for(let i=-1;i<=1;i++) cx.fillRect(o+i*w*.65-w*.28,4-h-2.5,w*.56,2.5); };
      if(sz==0) hs(0,5,5); else if(sz==1){ hs(-3.5,4,4); hs(4,3,7); } else if(sz==2){ tw(-5.5,3,10); tw(5.5,3,10); cx.fillRect(-5,-1,10,5); } else { tw(-7,2.6,9); tw(7,2.6,9); tw(0,3.4,13); cx.fillRect(-7,0,14,4); cx.beginPath(); cx.arc(0,-9,3.4,Math.PI,0); cx.fill(); }
      cx.fillStyle = '#f4e8c8'; cx.fillRect(-1,1.5,2,2.5); cx.restore();
  }
}
function guard(x,y,dir,mv,i){
  const t = performance.now()/1000, ph = mv?t*8+i:0;
  cx.save(); cx.translate(x, y+(mv?Math.sin(ph*2)*1.1:0)); cx.scale(.75*dir, .75); cx.lineCap='round';
  cx.strokeStyle='#5a3a1a'; cx.lineWidth=3; [[-8,0],[-5,Math.PI],[6,Math.PI],[9,0]].forEach(l => { const a=mv?Math.sin(ph+l[1])*.5:0; cx.beginPath(); cx.moveTo(l[0],-9); cx.lineTo(l[0]+Math.sin(a)*10,-9+Math.cos(a)*10); cx.stroke(); });
  cx.fillStyle='#6a4426'; cx.beginPath(); cx.ellipse(0,-14,12,5.5,0,0,7); cx.fill(); cx.strokeStyle='#6a4426'; cx.lineWidth=5; cx.beginPath(); cx.moveTo(9,-16); cx.lineTo(15,-24); cx.stroke(); cx.beginPath(); cx.ellipse(18,-25,5,2.6,-.5,0,7); cx.fill();
  cx.fillStyle='#8a2a2a'; cx.fillRect(-3,-27,7,12); cx.fillStyle='#e8c9a0'; cx.beginPath(); cx.arc(.5,-30,3.4,0,7); cx.fill(); cx.fillStyle='#9aa0a8'; cx.beginPath(); cx.arc(.5,-31.5,3.6,Math.PI,0); cx.fill();
  cx.strokeStyle='#3b2a10'; cx.lineWidth=1.3; cx.beginPath(); cx.moveTo(6,-12); cx.lineTo(8,-46); cx.stroke(); cx.fillStyle='#c0392b'; cx.beginPath(); cx.moveTo(8,-46); cx.lineTo(8,-40); cx.lineTo(15,-43); cx.closePath(); cx.fill(); cx.restore();
}
function camel(x,y,dir,mv,s,sk,o){
  const t = performance.now()/1000+(o||0)*.7; const ph = mv ? t*(S.slow>0?5:8) : 0;
  const br = Math.sin(t*2)*.6; const hb = mv ? Math.sin(ph*2)*1.5 : Math.sin(t*1.3)*1; const C = '#c8964f';
  cx.save(); cx.translate(x,y); cx.scale(s*dir,s); cx.beginPath(); cx.ellipse(0,1,20,4,0,0,7); cx.fillStyle='#0004'; cx.fill(); //cx.lineCap='round'; cx.strokeStyle='#8a5a22'; cx.lineWidth=1.3; cx.beginPath(); cx.moveTo(-14,-13); cx.lineTo(-29,-5); cx.stroke();
  const leg = (hx,o,c) => { const a = mv ? Math.sin(ph+o)*.55 : 0; const fx = hx+Math.sin(a)*11; const fy = -11+Math.cos(a)*11-(mv?Math.max(0,Math.cos(ph+o))*3:0); cx.strokeStyle=c; cx.lineWidth=3.4; cx.beginPath(); cx.moveTo(hx,-11); cx.lineTo(fx,fy); cx.stroke(); cx.fillStyle='#4a3010'; cx.beginPath(); cx.arc(fx,fy,1.8,0,7); cx.fill(); };
  leg(-5,Math.PI,'#9a6a2a'); leg(11,Math.PI,'#9a6a2a');
  cx.fillStyle=C; cx.beginPath(); cx.ellipse(0,-17,16,7.5+br*.3,0,0,7); cx.fill(); cx.beginPath(); cx.ellipse(-3,-24,5.5,5+br*.3,0,0,7); cx.fill();
  cx.fillStyle='#b03030'; cx.beginPath(); cx.roundRect(-9,-22,12,8,2); cx.fill(); cx.fillStyle='#f1c453'; cx.fillRect(-9,-16.5,12,1.5);
  for(let j=0;j<(sk||0);j++){ const sy = -26-(j==1?1.5:0); cx.fillStyle = j%2?'#c9ad74':'#dcc48c'; cx.beginPath(); cx.ellipse(-9+j*7.5,sy,4.6,4.4,0,0,7); cx.fill(); cx.strokeStyle='#6b5224'; cx.lineWidth=.9; cx.stroke(); cx.fillStyle='#6b5224'; cx.fillRect(-10+j*7.5,sy-4.6,2,1.4); }
  leg(-9,0,'#b98544'); leg(8,0,'#b98544');
  cx.strokeStyle=C; cx.lineWidth=5.5; cx.beginPath(); cx.moveTo(11,-19); cx.quadraticCurveTo(19,-24,21+hb*.5,-33+hb*.3); cx.stroke();
  cx.fillStyle=C; cx.beginPath(); cx.ellipse(24+hb*.5,-34+hb*.3,6,3.2,-.25,0,7); cx.fill(); cx.beginPath(); cx.ellipse(19.5+hb*.5,-37+hb*.3,1.4,2.2,-.3,0,7); cx.fill();
  cx.fillStyle='#2a1a08'; cx.beginPath(); cx.arc(24+hb*.5,-35+hb*.3,t%4<.12?.25:1,0,7); cx.fill();
  cx.strokeStyle='#8a5a22'; cx.lineWidth=1.8; cx.beginPath(); cx.moveTo(-15,-20); cx.quadraticCurveTo(-20,-16+Math.sin(t*3)*2,-19,-8+Math.sin(t*3+1)*2); cx.stroke(); cx.restore();
}

function terr(ZW, ZH){
  const d = devicePixelRatio||1, K = S.C;
  if(TR && TR.k==K && TR.w==ZW && TR.h==ZH && TR.d==d) return TR.c;
  const c = document.createElement('canvas'); c.width = ZW*d; c.height = ZH*d; const t = c.getContext('2d'); t.scale(d,d);
  let a = K.length*7919 + Math.floor(K[0].x*1e5); const rnd = () => { a|=0; a=a+0x6D2B79F5|0; let q=Math.imul(a^a>>>15,1|a); q=q+Math.imul(q^q>>>7,61|q)^q; return ((q^q>>>14)>>>0)/4294967296; };
  
  if (imgFondCarte.complete && imgFondCarte.naturalWidth > 0) {
      t.drawImage(imgFondCarte, 0, 0, ZW, ZH);
      t.fillStyle = 'rgba(240, 223, 174, 0.4)'; t.fillRect(0, 0, ZW, ZH);
  } else {
      const g = t.createRadialGradient(ZW/2,ZH/2,ZH*.2,ZW/2,ZH/2,ZW*.7); g.addColorStop(0,'#efe4b6'); g.addColorStop(1,'#d6c088'); t.fillStyle=g; t.fillRect(0,0,ZW,ZH);
  }
  const WC = {désert:'#e8c46a', forêt:'#7fae5a', côtière:'#86bcd0', montagne:'#aaa196', plaine:'#bccf7c'};
  K.forEach(k => { const x=k.x*ZW, y=k.y*ZH, q=Math.min(ZW,ZH)*.2, gr=t.createRadialGradient(x,y,0,x,y,q); gr.addColorStop(0,WC[k.b]+'99'); gr.addColorStop(1,WC[k.b]+'00'); t.fillStyle=gr; t.fillRect(x-q,y-q,q*2,q*2); });
  t.globalAlpha=.55; t.drawImage(tex(ZW,ZH),0,0,ZW,ZH); t.globalAlpha=1; t.lineCap='round';
  const sc = Math.min(ZW,ZH)/900;
  
  const D = {
    pin:(x,y,s)=>{ t.fillStyle='#5a3a1a'; t.fillRect(x-s*.7,y,s*1.4,s*3); t.fillStyle='#2f6b3a'; for(let i=0;i<3;i++){ t.beginPath(); t.moveTo(x-s*(4-i),y-s*i*3.2+s); t.lineTo(x,y-s*(i*3.2+4)); t.lineTo(x+s*(4-i),y-s*i*3.2+s); t.closePath(); t.fill(); } },
    rnd:(x,y,s)=>{ t.fillStyle='#5a3a1a'; t.fillRect(x-s*.6,y,s*1.2,s*3); t.fillStyle='#4c9a48'; t.beginPath(); t.arc(x,y-s*1.5,s*3.2,0,7); t.fill(); t.fillStyle='#74c25f88'; t.beginPath(); t.arc(x-s,y-s*2.4,s*1.6,0,7); t.fill(); },
    plm:(x,y,s)=>{ t.strokeStyle='#7a5a2a'; t.lineWidth=s*1.1; t.beginPath(); t.moveTo(x,y+s*3); t.quadraticCurveTo(x+s,y-s*3,x+s*.5,y-s*7); t.stroke(); t.strokeStyle='#2f8a4a'; t.lineWidth=s*.9; for(let i=0;i<5;i++){ const an=-Math.PI/2+(i-2)*.7; t.beginPath(); t.moveTo(x+s*.5,y-s*7); t.quadraticCurveTo(x+s*.5+Math.cos(an)*s*4,y-s*8+Math.sin(an)*s*4,x+s*.5+Math.cos(an)*s*6,y-s*5+Math.sin(an)*s*6); t.stroke(); } },
    cac:(x,y,s)=>{ t.strokeStyle='#4a8a3a'; t.lineWidth=s*1.6; t.beginPath(); t.moveTo(x,y+s*3); t.lineTo(x,y-s*4); t.moveTo(x,y-s); t.lineTo(x-s*2.5,y-s); t.lineTo(x-s*2.5,y-s*3); t.moveTo(x,y); t.lineTo(x+s*2.5,y); t.lineTo(x+s*2.5,y-s*2); t.stroke(); },
    dun:(x,y,s)=>{ t.strokeStyle='#c28a2e'; t.lineWidth=s*.9; t.beginPath(); t.arc(x,y+s*4,s*5,Math.PI*1.15,Math.PI*1.85); t.stroke(); },
    mtn:(x,y,s)=>{ t.fillStyle='#8f867c'; t.beginPath(); t.moveTo(x-s*5,y+s*3); t.lineTo(x,y-s*6); t.lineTo(x+s*5,y+s*3); t.closePath(); t.fill(); t.fillStyle='#6e655c'; t.beginPath(); t.moveTo(x,y-s*6); t.lineTo(x+s*5,y+s*3); t.lineTo(x+s*1.5,y+s*3); t.closePath(); t.fill(); t.fillStyle='#f4efe4'; t.beginPath(); t.moveTo(x-s*1.9,y-s*2.2); t.lineTo(x,y-s*6); t.lineTo(x+s*1.9,y-s*2.2); t.lineTo(x+s*.5,y-s*1.4); t.lineTo(x-s*.7,y-s*2.4); t.closePath(); t.fill(); },
    grs:(x,y,s)=>{ t.strokeStyle='#5a8a3a'; t.lineWidth=1; [-2,0,2].forEach(i => { t.beginPath(); t.moveTo(x+i*s,y); t.lineTo(x+i*s*1.6,y-s*3); t.stroke(); }); }
  };
  
  // On a supprimé 'wav' (vagues) et remplacé par des palmiers et de l'herbe sur la côte
  const TP = {forêt:['pin','pin','pin','rnd'], plaine:['rnd','grs','grs','grs'], désert:['cac','plm','dun','dun'], montagne:['mtn','mtn','pin','mtn'], côtière:['plm','plm','grs','grs']};
  const items=[], far=(x,y,m)=>K.every(k=>Math.hypot(k.x*ZW-x,k.y*ZH-y)>m), s0=Math.max(.8,sc);
  
  // On a supprimé toute la génération des lacs (lakes)
  
  const density = Math.max(1500, 3200-sc*800);
  for(let i=0;i<ZW*ZH/density;i++){ 
      const x=20+rnd()*(ZW-40), y=30+rnd()*(ZH-50); 
      let b=null, bd=1e9; 
      K.forEach(k => { const q=Math.hypot(k.x*ZW-x,k.y*ZH-y); if(q<bd){ bd=q; b=k; } }); 
      if(bd<34*sc) continue; 
      const ty = TP[b.b]; 
      items.push([y, ty[Math.floor(rnd()*ty.length)], x, y, s0*(.8+rnd()*.5)]); 
  }
  items.sort((p,q)=>p[0]-q[0]).forEach(p => D[p[1]](p[2],p[3],p[4]));
  
  TR = {k:K, w:ZW, h:ZH, d, c}; return c;
}

function getRoadAtMouse(mx, my) {
  const W = cv.clientWidth, H = cv.clientHeight;
  const ZW = W * camera.zoom, ZH = H * camera.zoom;
  for (let i = 0; i < S.E.length; i++) {
    const e = S.E[i];
    const a = S.C[e.a], b = S.C[e.b];
    if(!visibleCity(a) || !visibleCity(b)) continue;
    
    const A = [a.x * ZW - camera.x, a.y * ZH - camera.y];
    const B = [b.x * ZW - camera.x, b.y * ZH - camera.y];
    
    // Distance du point (souris) au segment de droite (route)
    const dx = B[0] - A[0], dy = B[1] - A[1];
    const l2 = dx*dx + dy*dy;
    if (l2 === 0) continue;
    let t = ((mx - A[0]) * dx + (my - A[1]) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = A[0] + t * dx;
    const projY = A[1] + t * dy;
    
    // Si la souris est à moins de 20 pixels de la route
    if (Math.hypot(mx - projX, my - projY) < 20) {
      return e;
    }
  }
  return null;
}

function draw(){
  if(!S) return;
  const W = Math.max(1, cv.clientWidth||400), H = Math.max(1, cv.clientHeight||Math.round(W*.66)), dpr = devicePixelRatio||1;
  if(cv.width!==W*dpr || cv.height!==H*dpr){ cv.width=W*dpr; cv.height=H*dpr; }
  cx.setTransform(dpr,0,0,dpr,0,0);
  
  // 1. NETTOYAGE DE L'ÉCRAN
  cx.clearRect(0, 0, W, H);
  cx.fillStyle = '#e9d9b0'; cx.fillRect(0,0,W,H);

  const ZW = W * camera.zoom, ZH = H * camera.zoom;
  
  // 2. CENTRAGE AUTOMATIQUE SUR LA CARAVANE
  let targetX = 0, targetY = 0;
  if(S.travel){
      const T = S.travel, A = [S.C[T.from].x, S.C[T.from].y], B = [S.C[T.to].x, S.C[T.to].y], f = T.pos/T.e.d;
      targetX = (A[0] + (B[0]-A[0])*f) * ZW;
      targetY = (A[1] + (B[1]-A[1])*f) * ZH;
  } else {
      targetX = S.C[S.cur].x * ZW;
      targetY = S.C[S.cur].y * ZH;
  }
  
  camera.x = targetX - W/2;
  camera.y = targetY - H/2;
  camera.x = Math.max(0, Math.min(camera.x, ZW - W));
  camera.y = Math.max(0, Math.min(camera.y, ZH - H));

  cx.drawImage(terr(ZW, ZH), -camera.x, -camera.y, ZW, ZH);

  // 3. AMBIANCE JOUR/NUIT
  const amb = getAmbient(S.t);
  if(amb.a > 0.01){
    cx.fillStyle = 'rgba('+amb.c[0]+','+amb.c[1]+','+amb.c[2]+','+amb.a+')';
    cx.fillRect(0,0,W,H);
  }

  const h = hops();
  const P = c => [c.x * ZW - camera.x, c.y * ZH - camera.y];
  
    // 4. DESSIN DES ROUTES (STYLE CHEMIN DE TERRE)
  S.E.forEach(e => {
    const a = S.C[e.a], b = S.C[e.b]; if(!visibleCity(a) || !visibleCity(b)) return;
    const[A,B] = [P(a), P(b)];
    
    // Détection du survol pour l'effet lumineux
    const dx = B[0] - A[0], dy = B[1] - A[1];
    const l2 = dx*dx + dy*dy;
    let isHovered = false;
    if (l2 > 0) {
        let t = ((mousePos.x - A[0]) * dx + (mousePos.y - A[1]) * dy) / l2;
        t = Math.max(0, Math.min(1, t));
        if (Math.hypot(mousePos.x - (A[0] + t*dx), mousePos.y - (A[1] + t*dy)) < 20) isHovered = true;
    }

    cx.lineCap = 'round';
    cx.lineJoin = 'round';

    // 1. La bordure (terre sombre)
    cx.beginPath();
    cx.moveTo(A[0], A[1]);
    cx.lineTo(B[0], B[1]);
    cx.strokeStyle = isHovered ? '#8a6a4a' : '#4a2f1a';
    cx.lineWidth = 9 * camera.zoom;
    cx.stroke();

    // 2. Le centre du chemin (sable/terre claire)
    cx.beginPath();
    cx.moveTo(A[0], A[1]);
    cx.lineTo(B[0], B[1]);
    cx.strokeStyle = isHovered ? '#f4e8c8' : '#b88a55';
    cx.lineWidth = 6 * camera.zoom;
    cx.stroke();

    // 3. Les ornières (traces de roues)
    // On calcule la perpendiculaire pour décaler les lignes
    const len = Math.sqrt(l2);
    if (len > 0) {
        const nx = -dy / len;
        const ny = dx / len;
        const offset = 1.8 * camera.zoom;
        
        cx.strokeStyle = isHovered ? '#c9ad74' : '#7a5c30';
        cx.lineWidth = 1.2 * camera.zoom;
        cx.setLineDash([3 * camera.zoom, 3 * camera.zoom]); // Pointillés pour simuler la terre retournée

        // Ornière 1
        cx.beginPath();
        cx.moveTo(A[0] + nx*offset, A[1] + ny*offset);
        cx.lineTo(B[0] + nx*offset, B[1] + ny*offset);
        cx.stroke();

        // Ornière 2
        cx.beginPath();
        cx.moveTo(A[0] - nx*offset, A[1] - ny*offset);
        cx.lineTo(B[0] - nx*offset, B[1] - ny*offset);
        cx.stroke();
        
        cx.setLineDash([]);
    }
  });

  // 5. DESSIN DES VILLES
  S.C.forEach(c => {
    if(!visibleCity(c)) return;
    const[x,y] = P(c);
    const r = (9 + c.sz*3) * camera.zoom;
    const explored = c.seen;
    const bc = explored ? BI[c.b].c : '#8a7c66';

    cx.beginPath(); cx.arc(x,y,r,0,7); cx.fillStyle = explored ? '#f4e8c8' : '#dcd0b0'; cx.fill();
    cx.lineWidth = 2.5 * camera.zoom; cx.strokeStyle = bc; cx.stroke();

    if(explored){
      bld(c.sz, x, y, r);
      const rep = c.rep||0;
      if(rep !== 0){
        const col = rep>0 ? '#2f6a1f' : '#a02020';
        cx.font='bold '+(9*camera.zoom)+'px Georgia';
        const rt = (rep>0?'+':'')+rep, rw = cx.measureText(rt).width+6;
        cx.fillStyle='#f4e8c8ee'; cx.strokeStyle=col; cx.lineWidth=1.2;
        cx.beginPath(); cx.roundRect(x+r-2*camera.zoom, y-r-6*camera.zoom, rw, 11*camera.zoom, 3); cx.fill(); cx.stroke();
        cx.fillStyle=col; cx.fillText(rt, x+r-2*camera.zoom+rw/2, y-r+2*camera.zoom);
      }
      
      cx.save();
      cx.font = 'bold ' + (11 * camera.zoom) + 'px Georgia';
      cx.textAlign = 'center';
      cx.textBaseline = 'middle'; 
      
      const nw = cx.measureText(c.name).width + (14 * camera.zoom);
      const nh = 16 * camera.zoom;
      const ny = y + r + (8 * camera.zoom); 
      
      cx.fillStyle = '#f1e4bd'; 
      cx.strokeStyle = '#6b4a1e'; 
      cx.lineWidth = 1.5;
      cx.beginPath(); cx.roundRect(x - nw/2, ny - nh/2, nw, nh, 6 * camera.zoom); cx.fill(); cx.stroke();
      cx.fillStyle = '#3b2a14'; cx.fillText(c.name, x, ny);
      cx.restore();
    }
  });

  // 6. DESSIN DE LA CARAVANE
  let pos;  
  window.camelScreenPos = pos;
  if(S.travel){ const T = S.travel, A = P(S.C[T.from]), B = P(S.C[T.to]), f = T.pos/T.e.d; pos = [A[0]+(B[0]-A[0])*f, A[1]+(B[1]-A[1])*f]; }  
 
  else { pos = P(S.C[S.cur]); }
  

  const bob = S.travel && speed ? Math.sin(performance.now()/110)*2*camera.zoom : 0;
  const dir = S.travel ? (P(S.C[S.travel.to])[0] < P(S.C[S.travel.from])[0] ? -1 : 1) : CD; CD = dir;
  if(S.travel){ const a = P(S.C[S.travel.from]), b = P(S.C[S.travel.to]), l = Math.hypot(b[0]-a[0], b[1]-a[1]) || 1; CV = [(b[0]-a[0])/l, (b[1]-a[1])/l]; }

  const scaleBase = Math.min(ZW/1000, ZH/640);
  cx.save(); cx.translate(pos[0],pos[1]); cx.scale(scaleBase*1.15, scaleBase*1.15); cx.translate(-pos[0],-pos[1]);
  const mv = !!(S.travel && speed), nf = Math.min(8, 1+S.up.cap), GP = [[60,3],[-34*nf-66,3],[-26*nf,-22],[-26*nf-14,21],[29,-25]], ng = Math.min(S.up.grd,5);
  const tot = Math.ceil(Math.min(1, load()/cap())*nf*3-.001), E = [{y:pos[1]+8+bob, f:()=>camel(pos[0], pos[1]+8+bob, dir, mv, .75, 0, 0)}];
  for(let j=0;j<nf;j++){ const d = 38+32*j, fx = pos[0]-CV[0]*d, fy = pos[1]+8-CV[1]*d*.6; E.push({y:fy, f:()=>camel(fx, fy, dir, mv, .5, Math.max(0,Math.min(3,tot-3*j)), j+1)}); }
  E.sort((p,q)=>p.y-q.y).forEach(e => e.f());
  cx.restore();
  
    // 7. DESSIN DU TEXTE DE LA ROUTE (PAR-DESSUS TOUT)
  const hoveredRoad = getRoadAtMouse(mousePos.x, mousePos.y);
  if (hoveredRoad) {
      const a = S.C[hoveredRoad.a], b = S.C[hoveredRoad.b];
      if (rk(hoveredRoad, h)) {
          const A = P(a), B = P(b);
          
          // Texte centré au milieu de la ligne droite
          const mx = (A[0] + B[0]) / 2;
          const my = (A[1] + B[1]) / 2;
          
          const tx = hoveredRoad.d + 'km  ' + '☠'.repeat(hoveredRoad.dg);
          
          cx.save();
          cx.font = (13 * camera.zoom) + 'px Georgia';
          cx.textAlign = 'center';
          cx.textBaseline = 'middle';
          
          const tw = cx.measureText(tx).width + 16 * camera.zoom;
          const th = 20 * camera.zoom;
          cx.fillStyle = '#f4e8c8ee'; 
          cx.strokeStyle = '#5a3a10';
          cx.lineWidth = 2;
          cx.beginPath(); 
          cx.roundRect(mx - tw/2, my - th/2, tw, th, 5 * camera.zoom); 
          cx.fill(); 
          cx.stroke();
          
          cx.fillStyle = '#8a6508'; 
          cx.fillText(tx, mx, my);
          cx.restore();
      }
  }
  
  // 8. UI FIXE (Cadre, boussole, titre)
  cx.textAlign='center'; cx.strokeStyle='#5a3a10'; cx.lineWidth=3; cx.strokeRect(2,2,W-4,H-4);
  cx.save(); cx.translate(W-40,H-40); cx.strokeStyle='#5a3a10'; cx.fillStyle='#5a3a10'; cx.lineWidth=1.4; cx.beginPath(); cx.arc(0,0,18,0,7); cx.stroke(); cx.restore();
  cx.font='italic bold 15px Georgia'; cx.lineWidth=3; cx.strokeStyle='#f4e8c8cc'; cx.strokeText('Carte des Routes Marchandes', W/2, 31); cx.fillStyle='#5a3a10'; cx.fillText('Carte des Routes Marchandes', W/2, 31);

  if(mv && performance.now()>nb){ nb = performance.now() + (S.slow>0?630:393); hoof(hk^=1); }
}
document.addEventListener('click', ensureAudio);
function ensureAudio(){ if(!AC) try{ AC = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} if(AC && AC.state=='suspended') AC.resume(); if(AC && !MG){ MG = AC.createGain(); MG.gain.value=.5; MG.connect(AC.destination); mt=AC.currentTime+.1; } }
function ding(f,v){ if(!SND||!AC) return; const o=AC.createOscillator(), g=AC.createGain(), t=AC.currentTime; o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+.9); o.connect(g); g.connect(AC.destination); o.start(); o.stop(t+.9); }
const mf=m=>440*Math.pow(2,(m-69)/12), CH=[[50,53,57],[46,50,53],[48,52,55],[50,53,57],[50,53,57],[46,50,53],[48,52,55],[45,49,52]], ML=[[74,0,77,0,81,0,77,74],[74,0,77,0,82,0,81,77],[76,0,79,0,84,0,79,76],[74,77,81,0,86,0,81,77],[74,0,77,81,0,81,77,74],[70,0,74,77,0,82,77,74],[72,0,76,79,0,84,79,76],[69,73,76,81,0,76,73,69]];
function tone(f,t,d,ty,v,lp,a){ if(!AC||!MG) return; const o=AC.createOscillator(), g=AC.createGain(), fl=AC.createBiquadFilter(); o.type=ty; o.frequency.value=f; fl.type='lowpass'; fl.frequency.value=lp||8000; g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(v,t+(a||.015)); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(fl); fl.connect(g); g.connect(MG); o.start(t); o.stop(t+d+.05); }
function swordClash(intensity){ if(!AC || !SND) return; const t0 = AC.currentTime, v = intensity || 0.12; [0, 0.055, 0.115].forEach(delay => { const t = t0 + delay, vv = v * (1 - delay*4); [2380, 3180, 4020, 5150, 6280].forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = f * (0.95 + Math.random()*0.10); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vv * (0.45 / (i+1)), t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14 + i*0.025); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + 0.30); }); }); }
function noise(dur,vol){ if(!AC||!SND) return; const t=AC.currentTime, sr=AC.sampleRate, buf=AC.createBuffer(1,Math.floor(sr*dur),sr), d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2); const s=AC.createBufferSource(); s.buffer=buf; const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=300; const g=AC.createGain(); g.gain.setValueAtTime(vol||0.06,t); g.gain.exponentialRampToValueAtTime(.001,t+dur); s.connect(f); f.connect(g); g.connect(AC.destination); s.start(t); s.stop(t+dur); }
function perc(t,k){ if(!AC||!MG) return; const o=AC.createOscillator(), g=AC.createGain(); o.frequency.setValueAtTime(k?150:95,t); o.frequency.exponentialRampToValueAtTime(45,t+.15); g.gain.setValueAtTime(k?.2:.35,t); g.gain.exponentialRampToValueAtTime(.001,t+.25); o.connect(g); g.connect(MG); o.start(t); o.stop(t+.3); }
function shk(t){ if(!AC||!MG) return; if(!NB){ NB=AC.createBuffer(1,AC.sampleRate*.05|0,AC.sampleRate); const d=NB.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(R()*2-1)*(1-i/d.length); } const s=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain(); s.buffer=NB; f.type='highpass'; f.frequency.value=5000; g.gain.value=.05; s.connect(f); f.connect(g); g.connect(MG); s.start(t); }
function play(s,t){ const b=(s>>3)%8, e=s%8, c=CH[b], n=ML[b][e]; if(e==0) c.forEach(x=>tone(mf(x),t,2.1,'sawtooth',.03,900,.5)); if(e%2==0) tone(mf(c[0]-12),t,.4,'triangle',.16,500); if(n){ tone(mf(n),t,.55,'square',.04,2200); tone(mf(n+12),t,.3,'triangle',.02,3000); } if(e==0||e==4) perc(t,0); if(e==3||e==6) perc(t,1); if(e%2) shk(t); }
function sched(){ if(!AC||!MG) return; if(!MUS){ mt=AC.currentTime+.1; return; } let safety = 0; while(mt<AC.currentTime+.3 && safety < 20){ play(ms,mt); mt+=.278; ms++; safety++; } }

// --- NOUVEAU SON DE PAS (Sourd et feutré) ---
function hoof(k){
  if(!SND || !AC) return;
  const t = AC.currentTime;
  
  // Le "thud" grave
  const o = AC.createOscillator();
  const g = AC.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(k ? 90 : 75, t); // Fréquences très basses
  o.frequency.exponentialRampToValueAtTime(30, t + 0.1);
  g.gain.setValueAtTime(0.6, t);
  g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
  o.connect(g); g.connect(MG || AC.destination);
  o.start(t); o.stop(t + 0.2);

  // Le frottement du sable
  const sr = AC.sampleRate;
  const len = Math.floor(sr * 0.08);
  const buffer = AC.createBuffer(1, len, sr);
  const data = buffer.getChannelData(0);
  for(let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  
  const src = AC.createBufferSource();
  src.buffer = buffer;
  const filter = AC.createBiquadFilter();
  filter.type = 'lowpass'; // Étouffé
  filter.frequency.value = 400; 
  const g2 = AC.createGain();
  g2.gain.setValueAtTime(0.4, t);
  g2.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  
  src.connect(filter); filter.connect(g2); g2.connect(MG || AC.destination);
  src.start(t);
}

function toggleMusic() {
  MUS = !MUS;
  const btn = document.getElementById('btn-music');
  if (btn) btn.textContent = MUS ? '🎵' : '🔇';
  
  if (MUS) {
    if (S && !S.over) bgMusic.play().catch(e => console.log("Lecture bloquée"));
  } else {
    bgMusic.pause();
  }
}