// --- UI & RENDU HTML ---
function pop(t,c){ 
  if(c=='g'){ ding(988,.04); setTimeout(()=>ding(1319,.035),90); } 
  if(navigator.vibrate) try{ navigator.vibrate(c=='g'?15:[10,30,10]); }catch(e){} 
  
  const e = document.createElement('div'); 
  e.className = 'pop '+c; 
  e.textContent = t; 
  
  // On récupère la position du chameau (ou le centre de l'écran par défaut)
  const pos = window.camelScreenPos || { x: cv.clientWidth/2, y: cv.clientHeight/2 };
  
  // On ajoute un petit décalage aléatoire pour que les chiffres ne se superposent pas
  const offsetX = (Math.random() - 0.5) * 40;
  const offsetY = (Math.random() - 0.5) * 20;
  
  e.style.left = (pos.x + offsetX) + 'px';
  e.style.top = (pos.y + offsetY - 20) + 'px'; // -20 pour que ça apparaisse juste au-dessus du chameau
  
  $('pops').appendChild(e); 
  setTimeout(()=>e.remove(), 1200); 
}
function renderContracts(){
  if(!S || !S.contracts) return '';
  return S.contracts.map((c,i) => {
    if(c.state === 'empty'){ return '<div class="contract-card empty">⏳ Nouveau contrat dans '+Math.max(0, (c.regenDay||0) - S.day)+' j</div>'; }
    const dest = S.C[c.city], good = G[c.g], have = S.inv[c.g], daysLeft = c.exp - S.day, isActive = c.state === 'active', atDest = S.cur === c.city, canDeliver = isActive && atDest && have >= c.n;
    let card = '<div class="contract-card '+(isActive?'active':'offer')+'"><div class="contract-line1"><b>📜 Livrer '+c.n+'× '+good[2]+' '+good[0]+'</b><span class="contract-days '+(daysLeft<5?'urgent':'')+'">J'+c.exp+' ('+daysLeft+'j)</span></div><div class="contract-line2">à <b>'+dest.name+'</b> <small>('+SZ[dest.sz]+')</small></div><div class="contract-line3">💰 '+c.rew+' or · ⭐ +'+c.repRew+' rép.</div>';
    if(isActive){ card += '<div class="contract-progress">Stock : '+have+' / '+c.n+(atDest?' <b>(vous y êtes !)</b>':'')+'</div><div class="contract-actions"><button '+(canDeliver?'':'disabled')+' onclick="deliverContract('+i+')">Livrer</button><button onclick="abandonContract('+i+')">Abandonner</button></div>'; } 
    else { card += '<div class="contract-actions"><button onclick="acceptContract('+i+')">Accepter</button></div>'; }
    return card + '</div>';
  }).join('');
}

function htmlAteliers(){
  const city = S.C[S.cur]; let h = '';
  if(city.sz < 1) h += '<p class="r">⚠️ Ateliers disponibles uniquement à partir des bourgs.</p>';
  else h += '<p style="margin:0 0 8px;font-size:12.5px;color:#5a3a10">Transformez vos marchandises en produits de luxe.</p>';
  RECIPES.forEach((r, i) => {
    const out = G[r.out], check = canCraft(r), unitSell = sellP(city, r.out); let totalCost = r.fee, inputsStr = [];
    for(const g in r.inputs){ const need = r.inputs[g], own = S.inv[+g], avgBuy = S.stats.bought[+g] > 0 ? S.stats.spentOn[+g]/S.stats.bought[+g] : G[+g][1]; totalCost += avgBuy * need; inputsStr.push('<span class="'+(own >= need ? 'g' : 'r')+'">'+need+'× '+G[+g][2]+' '+G[+g][0]+'</span>'); }
    const profit = Math.round(unitSell - totalCost);
    h += '<div class="recipe"><div class="recipe-title">'+out[2]+' '+out[0]+'</div><div class="recipe-formula">'+inputsStr.join(' + ')+' + <b>'+r.fee+' or</b> frais</div><div class="recipe-price">Vente ici : ~'+unitSell+' or · '+(profit >= 0 ? '<span class="g">marge +'+profit+'</span>' : '<span class="r">marge '+profit+'</span>')+'</div><button '+(check.ok?'':'disabled')+' onclick="craft('+i+')">'+(check.ok ? '🔨 Fabriquer' : '⚠️ '+check.reason)+'</button></div>';
  });
  return h;
}

function htmlSupplies(city){
  const wp = 2 + city.sz * 1, fp = Math.round(3 + city.sz * 1.5), w = Math.floor(S.water), f = Math.floor(S.food), wMax = Math.min(Math.floor(S.gold/wp), 100 - w), fMax = Math.min(Math.floor(S.gold/fp), 100 - f);
  let h = '<div style="border:1.5px dashed #8b6a3a;border-radius:6px;padding:6px;margin-bottom:8px;background:#fdf6e3"><div style="font-weight:bold;color:#3b2a14;font-size:12.5px;margin-bottom:4px">🥤 Ravitaillement (indispensable en voyage)</div>';
  h += '<div class="supply-row"><span class="icon">💧</span><span class="label">Eau</span><span class="qty '+(w<5?'crit':'')+'">'+w+'/100</span><button '+(wMax>=1?'':'disabled')+' onclick="buyWater(1, S.C[S.cur])">+1</button><button '+(wMax>=10?'':'disabled')+' onclick="buyWater(10, S.C[S.cur])">+10</button><button '+(wMax>=1?'':'disabled')+' onclick="buyWater(999, S.C[S.cur])">Max</button><span style="font-size:11px;color:#8a6508;margin-left:4px">'+wp+' or/u</span></div>';
  h += '<div class="supply-row" style="margin-bottom:0"><span class="icon">🍖</span><span class="label">Nourriture</span><span class="qty '+(f<5?'crit':'')+'">'+f+'/100</span><button '+(fMax>=1?'':'disabled')+' onclick="buyFood(1, S.C[S.cur])">+1</button><button '+(fMax>=10?'':'disabled')+' onclick="buyFood(10, S.C[S.cur])">+10</button><button '+(fMax>=1?'':'disabled')+' onclick="buyFood(999, S.C[S.cur])">Max</button><span style="font-size:11px;color:#8a6508;margin-left:4px">'+fp+' or/u</span></div>';
  h += '<div style="font-size:10.5px;color:#8a7c66;margin-top:6px;font-style:italic">Consommation : 1 unité / 20 km · Voyage possible : <b>'+Math.floor(Math.min(w, f) * 20)+' km</b></div></div>';
  return h;
}

function ui(){
  if(!S) return;
  const ph = getPhaseInfo(); $('phase').textContent = ph.icon+' '+ph.label;
  const w = Math.floor(S.water), f = Math.floor(S.food);
  $('water').textContent = w; $('food').textContent = f;
  $('water-box').className = 'stat-box' + (w < 5 ? ' critical' : w < 12 ? ' low' : '');
  $('food-box').className = 'stat-box' + (f < 5 ? ' critical' : f < 12 ? ' low' : '');
  $('gold').textContent = Math.round(S.gold); $('wealth').textContent = wealth();
  $('day').textContent = S.day+'/'+TOTAL; $('km').textContent = Math.round(S.km); $('ren').textContent = meta.ren;
  $('barf').style.width = Math.min(100, (S.day + S.t)/TOTAL*100)+'%';
  $('sp').innerHTML = [0,1,2,5].map(v => '<button class="'+(speed==v?'on':'')+'" onclick="speed='+v+';ui()">'+(v?'x'+v:'⏸')+'</button>').join(' ');
  $('tm').className = tab=='m'?'on':''; $('ta').className = tab=='a'?'on':''; $('tu').className = tab=='u'?'on':''; $('tc').className = tab=='c'?'on':'';  $('ts').className = tab=='s'?'on':'';
  
  

  $('log').innerHTML = S.log.slice(0,7).map(l => '<div class="'+l[1]+'">'+l[0]+'</div>').join('');
  //$('contracts').innerHTML = renderContracts();

  const h = hops(), c = S.C[S.cur];   let html = '';
  if(tab == 'm'){
    if(S.travel){
      const pct = Math.round(S.travel.pos/S.travel.e.d*100), remainingKm = Math.round(S.travel.e.d - S.travel.pos), remainingUnits = (remainingKm * 0.05).toFixed(1), canFinish = S.water >= remainingKm*0.05 && S.food >= remainingKm*0.05;
      html = '<p>🐪 En route vers <b>'+S.C[S.travel.to].name+'</b>… ('+pct+' % — '+remainingKm+' km)</p><p style="color:'+(canFinish?'#3a7a2a':'#c0392b')+';font-weight:bold">'+(canFinish ? '✅ Provisions suffisantes' : '⚠️ Provisions INSUFFISANTES !')+'</p><p style="font-size:12px;color:#8a7c66">Reste à consommer : '+remainingUnits+' 💧 / '+remainingUnits+' 🍖</p>';
    } else {
      const rep = c.rep||0, repCls = rep>0?'g':rep<0?'r':'';
      html = '<b>'+c.name+'</b> — '+SZ[c.sz]+' '+c.b+(c.ev?' · '+EVN[c.ev.t]:'')+'<br><span class="'+repCls+'">⭐ Réputation : '+(rep>0?'+':'')+rep+'</span><br>Charge : '+load()+'/'+cap()+'<br>';
      if(S.travel || S.over || (c.ev && c.ev.t=='epi')) html += '<p class="r">Marché fermé.</p>';
      else html += htmlSupplies(c);
      const visibleIdx = []; for(let i=0;i<9;i++) visibleIdx.push(i); for(let i=9;i<G.length;i++){ if(S.inv[i] > 0 || c.s[i] > 0) visibleIdx.push(i); }
      html += '<table><tr><th>Bien</th><th>Stock</th><th>Achat</th><th>Vente</th><th>Sac</th><th></th></tr>';
      visibleIdx.forEach(i => { const g = G[i], r = i < 9 ? price(c,i)/g[1] : 1; html += '<tr><td>'+g[2]+' '+g[0]+'</td><td>'+Math.floor(c.s[i]||0)+'</td><td class="'+(r<.9?'g':r>1.3?'r':'')+'">'+buyP(c,i)+'</td><td>'+sellP(c,i)+'</td><td>'+S.inv[i]+'</td><td style="white-space:nowrap"><button onclick="buy('+i+',1)">+1</button> <button onclick="buy('+i+',10)">+10</button> <button onclick="sell('+i+',1)">−1</button> <button onclick="sell('+i+',999)">Tout</button></td></tr>'; });
      html += '</table>';
      if(c.q) html += '<p>📜 Quête : '+c.q.n+'× '+G[c.q.g][0]+' → '+c.q.rew+' or (jusqu\'au jour '+c.q.exp+') <button '+(S.inv[c.q.g]>=c.q.n?'':'disabled')+' onclick="deliver()">Livrer</button></p>';
    }
  }
  else if(tab == 'c'){ 
      html = '<h3 style="margin:0 0 10px">📜 Contrats de livraison</h3>' + renderContracts(); 
  }
  else if(tab == 'a'){ 
      html = htmlAteliers(); 
  }
  else if(tab == 'u'){ 
      html = U.map(u => '<p><b>'+u[1]+'</b> niv. '+S.up[u[0]]+' — '+u[2]+'<br><button '+(S.gold<ucost(u[0])||S.up[u[0]]>=10?'disabled':'')+' onclick="upg(\''+u[0]+'\')">Améliorer ('+ucost(u[0])+' or)</button></p>').join('')+'<p><b>Sous-caravanes</b> ('+S.subs.length+'/8)<br>'+S.subs.map(s => '<small>'+S.C[s.a].name+' ↔ '+S.C[s.b].name+'</small>').join('<br>')+'<br><button '+(S.gold<scost()||S.subs.length>=8?'disabled':'')+' onclick="addSub()">Recruter ('+scost()+' or)</button></p>'; 
  }
  else { 
      const st = S.stats; 
      html = '<h3>📊 Statistiques</h3><p><b>Commerce</b><br>Transactions : '+st.deals+'<br>Profit net : <b class="'+(st.totalProfit>=0?'g':'r')+'">'+(st.totalProfit>=0?'+':'')+Math.round(st.totalProfit)+' or</b></p><p><b>Provisions</b><br>💧 Eau achetée : '+(st.waterBought||0)+'<br>🍖 Nourriture achetée : '+(st.foodBought||0)+'<br>Morts par épuisement : <b class="r">'+(st.deaths||0)+'</b></p><p><b>Voyage</b><br>Distance : '+Math.round(S.km)+' km<br>Jours : '+S.day+'/'+TOTAL+'</p>'; 
  }

  $('panel').innerHTML = html;

  if(sel != null && visibleCity(S.C[sel])){ const s = S.C[sel], k = known(s, h), srep = s.rep||0; $('info').innerHTML = '<b>'+s.name+'</b> — '+SZ[s.sz]+', '+s.b+(k&&s.ev?' · '+EVN[s.ev.t]:'')+(srep?' · <span class="'+(srep>0?'g':'r')+'">⭐'+(srep>0?'+':'')+srep+'</span>':'')+'<br>'+(k?'Produit : '+s.p.map(g=>G[g][2]).join(' ')+' · Demande : '+s.d.map(g=>G[g][2]).join(' '):'<i>Ressources inconnues</i>')+' <button '+(S.travel||sel==S.cur?'disabled':'')+' onclick="go('+sel+')">Voyager ▶</button>'; } 
  else { $('info').textContent = 'Cliquez sur une ville pour l\'inspecter, double-cliquez pour y aller.'; }
  
  $('quick').innerHTML = (S.travel||S.over) ? '' : S.C[S.cur].adj.filter(x => visibleCity(S.C[x.to])).map(x => { const dist = x.e.d, need = (dist * 0.05).toFixed(1), hasEnough = S.water >= dist*0.05 && S.food >= dist*0.05; return '<button style="'+(hasEnough?'':'border-color:#c0392b;color:#c0392b')+'" onclick="sel='+x.to+';go('+x.to+')">▶ '+S.C[x.to].name+' ('+Math.ceil(dist/(18*(1+.15*S.up.spd)*TS[x.e.t]))+' j · '+need+'💧'+(hasEnough?'':' ⚠️')+')</button>'; }).join('');
}


function toggleLog() { const logBox = document.getElementById('log-container'); logBox.classList.toggle('closed'); document.getElementById('log-icon').textContent = logBox.classList.contains('closed') ? '▲' : '▼'; setTimeout(() => { TR = null; draw(); }, 320); }
function confirmNewGame(){ if(S && !S.over && !confirm('Abandonner la partie en cours et recommencer ?')) return; newGame(); }
function toMenu(){ speed=0;  bgMusic.pause(); $('end').style.display='none'; $('dead').style.display='none'; $('menu').style.display='flex'; menu(); }
function restartAfterDeath(){ $('dead').style.display='none'; newGame(); }
function deadToMenu(){ $('dead').style.display='none'; toMenu(); }
function giveUp(){ if(!S || S.over) return; if(!confirm('Abandonner la partie en cours ?')) return; S.over = true; try{ localStorage.removeItem('cd_save'); }catch(e){} $('endb').innerHTML = '<h2>🏳️ Partie abandonnée</h2><p>Or amassé : <b>' + Math.round(S.gold) + '</b><br>Jours : <b>' + S.day + '</b></p><p><button onclick="newGame()">🔄 Nouvelle caravane</button> <button onclick="toMenu()">☰ Menu</button></p>'; $('end').style.display='flex'; }

// Variables pour le menu
const DL=[['Facile',.5,'Routes calmes, bandits rares et cléments'],['Normal',1,'Danger équilibré'],['Difficile',1.6,'Routes très dangereuses, bandits cruels']], DY=[50,100,150,200];

function menu(){
  const optd = document.getElementById('optd');
  const optt = document.getElementById('optt');
  const dd = document.getElementById('dd');
  const menuhs = document.getElementById('menuhs');

  if(optd) optd.innerHTML = DL.map(d => '<button class="'+(DIFF==d[1]?'on':'')+'" onclick="DIFF='+d[1]+';menu()">'+d[0]+'</button>').join('');
  if(dd) dd.textContent = DL.find(d=>d[1]==DIFF)[2];
  if(optt) optt.innerHTML = DY.map(v => '<button class="'+(TOTAL==v?'on':'')+'" onclick="TOTAL='+v+';menu()">'+v+' jours</button>').join('');
  if(menuhs) menuhs.innerHTML = '<small>Renom : '+meta.ren+' (+'+Math.round(meta.ren*15)+' % d\'or de départ)</small>'+(scores.length?'<br><small>Meilleur score : '+scores[0].s+'</small>':'');
}

function startGame(){ 
  ensureAudio(); 
  if (MUS) bgMusic.play(); // Lance la musique
  $('menu').style.display='none'; 
  speed=1; 
  newGame(); 
}

document.addEventListener('keydown', e => {
  if(e.ctrlKey || e.metaKey){ if(e.key==='s'){ e.preventDefault(); saveGame(); return; } if(e.key==='o'){ e.preventDefault(); loadGame(); return; } }
  if(!S || S.over) return; const k = e.key.toLowerCase();
  if(e.code==='Space'){ e.preventDefault(); speed=speed?0:1; ui(); }
  else if(k==='1') buy(sel??S.cur, 1); else if(k==='2') buy(sel??S.cur, 10); else if(k==='3') sell(sel??S.cur, 1); else if(k==='4') sell(sel??S.cur, 999);
  else if(k==='m'){ tab='m'; ui(); } else if(k==='a'){ tab='a'; ui(); } else if(k==='u'){ tab='u'; ui(); } else if(k==='s' && !e.ctrlKey && !e.metaKey){ tab='s'; ui(); }
  else if(k==='arrowright' || k==='arrowleft'){ if(S.travel) return; const here = S.C[S.cur].adj.filter(x => visibleCity(S.C[x.to])); if(!here.length) return; let idx = here.findIndex(a => a.to === sel); idx = (idx + (k==='arrowright'?1:-1) + here.length) % here.length; sel = here[idx].to; ui(); }
  else if(k==='enter' && sel!=null) go(sel);
  else if(k==='escape'){ sel=null; ui(); }
});

document.querySelectorAll('.tabs button').forEach(btn => { if(btn.id) btn.onclick = () => { tab = btn.id.substring(1); ui(); }; });

//const cv = $('cv');
function getCityAtMouse(mx, my) {
  const W = cv.clientWidth, H = cv.clientHeight;
  const ZW = W * camera.zoom, ZH = H * camera.zoom;
  let best = null, bd = 40;
  S.C.forEach(c => {
    if(!visibleCity(c)) return;
    const px = c.x * ZW - camera.x;
    const py = c.y * ZH - camera.y;
    const d = Math.hypot(px - mx, py - my);
    if(d < bd){ bd = d; best = c.id; }
  });
  return best;
}
cv.onclick = ev => { const r = cv.getBoundingClientRect(); const b = getCityAtMouse(ev.clientX - r.left, ev.clientY - r.top); if(b != null){ sel=b; ui(); } };
cv.onmousemove = ev => {
  const r = cv.getBoundingClientRect();
  const mx = ev.clientX - r.left;
  const my = ev.clientY - r.top;
  mousePos.x = mx; mousePos.y = my;
  isMouseOver = true;
  
  const t = $('tip');
  const b = getCityAtMouse(mx, my);
  
  // --- AJOUT : Changement du curseur ---
  if(b == null){ 
      t.style.display='none'; 
      cv.style.cursor = 'crosshair'; // Curseur par défaut de la carte
      return; 
  }
  cv.style.cursor = 'pointer'; // Curseur "main" quand on survole une ville
  // ------------------------------------
  
  const c = S.C[b], k = known(c, hops()), rep = c.rep||0;
  let h = '<h4>'+c.name+'</h4><small>'+SZ[c.sz]+' · '+c.b+(k&&c.ev?' · '+EVN[c.ev.t]:'')+'</small>';
  if(rep !== 0) h += '<div class="'+(rep>0?'g':'r')+'">⭐ Réputation : '+(rep>0?'+':'')+rep+'</div>';
  
  if(k){
    const avgBuy = g => S.stats.bought[g]>0 ? S.stats.spentOn[g]/S.stats.bought[g] : G[g][1];
    h += '<div style="border-top:1px solid #7a5420;margin-top:3px"><small>Bien</small><small>Achat / Vente</small></div>';
    G.forEach((g,i) => {
      const r = i < 9 ? price(c,i)/g[1] : 1, mine = S.inv[i], diff = mine>0 ? Math.round(sellP(c,i) - avgBuy(i)) : 0;
      h += '<div><span>'+g[2]+' '+g[0]+(mine?' <small style="opacity:.7">('+mine+')</small>':'')+'</span><b class="'+(r<.9?'g':r>1.3?'r':'')+'">'+buyP(c,i)+' / '+sellP(c,i)+(mine>0?' <small class="'+(diff>=0?'g':'r')+'">'+(diff>=0?'+':'')+diff+'</small>':'')+'</b></div>';
    });
    h += '<div style="margin-top:3px;border-top:1px solid #7a5420;padding-top:3px;font-size:11px">💧 '+(2 + c.sz)+' or/u · 🍖 '+Math.round(3 + c.sz*1.5)+' or/u</div>';
  } else h += '<br><i>Ville inconnue.</i>';
  
  t.innerHTML = h; t.style.display = 'block';
  t.style.left = Math.max(4, Math.min(mx+18, r.width-t.offsetWidth+4))+'px';
  t.style.top = Math.max(4, Math.min(my+8, r.height-t.offsetHeight+4))+'px';
};
cv.onmousemove = ev => {
  const r = cv.getBoundingClientRect();
  const mx = ev.clientX - r.left;
  const my = ev.clientY - r.top;
  mousePos.x = mx; mousePos.y = my;
  isMouseOver = true;
  
  const t = $('tip');
  const b = getCityAtMouse(mx, my);
  const road = getRoadAtMouse(mx, my);
  
  // Gestion du curseur
  if (b != null) {
      cv.style.cursor = 'pointer'; // Main sur les villes
  } else if (road != null) {
      cv.style.cursor = 'pointer'; // Main sur les routes
  } else {
      cv.style.cursor = 'crosshair'; // Viseur sinon
  }

  if (b == null) { 
      t.style.display = 'none'; 
      return; 
  }
  
  // (Le reste de la fonction d'origine pour l'infobulle des villes)
  const c = S.C[b], k = known(c, hops()), rep = c.rep||0;
  let h = '<h4>'+c.name+'</h4><small>'+SZ[c.sz]+' · '+c.b+(k&&c.ev?' · '+EVN[c.ev.t]:'')+'</small>';
  if(rep !== 0) h += '<div class="'+(rep>0?'g':'r')+'">⭐ Réputation : '+(rep>0?'+':'')+rep+'</div>';
  
  if(k){
    const avgBuy = g => S.stats.bought[g]>0 ? S.stats.spentOn[g]/S.stats.bought[g] : G[g][1];
    h += '<div style="border-top:1px solid #7a5420;margin-top:3px"><small>Bien</small><small>Achat / Vente</small></div>';
    G.forEach((g,i) => {
      const r = i < 9 ? price(c,i)/g[1] : 1, mine = S.inv[i], diff = mine>0 ? Math.round(sellP(c,i) - avgBuy(i)) : 0;
      h += '<div><span>'+g[2]+' '+g[0]+(mine?' <small style="opacity:.7">('+mine+')</small>':'')+'</span><b class="'+(r<.9?'g':r>1.3?'r':'')+'">'+buyP(c,i)+' / '+sellP(c,i)+(mine>0?' <small class="'+(diff>=0?'g':'r')+'">'+(diff>=0?'+':'')+diff+'</small>':'')+'</b></div>';
    });
    h += '<div style="margin-top:3px;border-top:1px solid #7a5420;padding-top:3px;font-size:11px">💧 '+(2 + c.sz)+' or/u · 🍖 '+Math.round(3 + c.sz*1.5)+' or/u</div>';
  } else h += '<br><i>Ville inconnue.</i>';
  
  t.innerHTML = h; t.style.display = 'block';
  t.style.left = Math.max(4, Math.min(mx+18, r.width-t.offsetWidth+4))+'px';
  t.style.top = Math.max(4, Math.min(my+8, r.height-t.offsetHeight+4))+'px';
};
cv.ondblclick = ev => { const r = cv.getBoundingClientRect(); const b = getCityAtMouse(ev.clientX - r.left, ev.clientY - r.top); if(b != null){ sel=b; go(b); $('tip').style.display='none'; ui(); } };
cv.addEventListener('wheel', ev => {
  ev.preventDefault();
  if(ev.deltaY < 0) camera.zoom = Math.min(5, camera.zoom + 0.2);
  else camera.zoom = Math.max(1, camera.zoom - 0.2);
  TR = null;
}, {passive: false});

function updateCameraScroll() {
  if (!S || S.over || !isMouseOver) return;
  const W = cv.clientWidth, H = cv.clientHeight;
  const edge = 50, speed = 10;
  let dx = 0, dy = 0;
  if (mousePos.x < edge) dx = -speed; else if (mousePos.x > W - edge) dx = speed;
  if (mousePos.y < edge) dy = -speed; else if (mousePos.y > H - edge) dy = speed;
  if (dx !== 0 || dy !== 0) { camera.x += dx; camera.y += dy; }
}

function loop(t){
  const dt = Math.min((t-last)/1000, .2); last = t;
  if(S && speed && !S.over){ try { step(dt * speed * 0.3); } catch(e) { console.error(e); } try { checkDeath(); } catch(e) { console.error(e); } }
  try { draw(); } catch(e) { console.error(e); }
  // if(MUS && AC && MG && mt < AC.currentTime+.5) { try { sched(); } catch(e) {} }
  requestAnimationFrame(loop);
}
(function init(){
  try{
    const raw = localStorage.getItem('cd_save');
    if(raw && confirm('💾 Une sauvegarde existe. La charger ?')){
      const d = fixSave(JSON.parse(raw)); S = Object.assign({travel:null, path:[], over:false}, d.S);
      TOTAL = d.TOTAL||100; DIFF = d.DIFF||1; meta = d.meta||meta; computeFog(); $('menu').style.display = 'none';
    }
  }catch(e){ console.error(e); }
  menu(); if(!S) newGame();
  requestAnimationFrame(t => { last = t; loop(t); });
})();

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().then(() => {
        // On tente de forcer le mode paysage (fonctionne sur Android)
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(err => {
            console.log("Verrouillage paysage bloqué par le navigateur (normal sur iOS).");
          });
        }
      }).catch(err => {
        console.log("Erreur plein écran :", err.message);
      });
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      // On libère l'orientation
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    }
  }
}

// Quand on entre ou sort du plein écran, on redessine la carte à la nouvelle taille
document.addEventListener('fullscreenchange', () => {
  const btn = document.getElementById('btn-fullscreen');
  if (document.fullscreenElement) {
    btn.textContent = '🗗'; // Icône "Quitter le plein écran"
  } else {
    btn.textContent = '⛶'; // Icône "Plein écran"
  }
  
  // On attend un petit peu que le navigateur ait fini de redimensionner avant de redessiner
  setTimeout(() => {
    TX = null; // On vide le cache de la texture
    TR = null; // On vide le cache du terrain
    if(typeof draw === 'function') draw();
  }, 300);
});

// Force la carte à se redessiner quand on tourne le téléphone
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    TX = null; // Vide le cache de la texture
    TR = null; // Vide le cache du terrain
    if(typeof draw === 'function') draw(); // Redessine la carte
  }, 400); // On attend 0.4s que le téléphone ait fini de tourner
});
