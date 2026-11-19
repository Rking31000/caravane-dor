function buyWater(n, city){
  if(!S || S.travel || S.over) return;
  const price = 2 + city.sz * 1;
  const maxAfford = Math.floor(S.gold / price);
  const maxSpace = 100 - Math.floor(S.water);
  const qty = Math.min(n, maxAfford, maxSpace);
  if(qty <= 0){ if(AC) tone(160, AC.currentTime, .15, 'sawtooth', .05); return; }
  const cost = Math.round(qty * price);
  S.gold -= cost; S.water += qty; S.stats.waterBought = (S.stats.waterBought||0) + qty;
  pop('+'+qty+' 💧','g'); ding(880,.04); log('Achat de '+qty+' eau pour '+cost+' or.','g'); ui();
}
function buyFood(n, city){
  if(!S || S.travel || S.over) return;
  const price = Math.round(3 + city.sz * 1.5);
  const maxAfford = Math.floor(S.gold / price);
  const maxSpace = 100 - Math.floor(S.food);
  const qty = Math.min(n, maxAfford, maxSpace);
  if(qty <= 0){ if(AC) tone(160, AC.currentTime, .15, 'sawtooth', .05); return; }
  const cost = Math.round(qty * price);
  S.gold -= cost; S.food += qty; S.stats.foodBought = (S.stats.foodBought||0) + qty;
  pop('+'+qty+' 🍖','g'); ding(880,.04); log('Achat de '+qty+' nourriture pour '+cost+' or.','g'); ui();
}
function buy(g,n){
  if(S.travel || S.over || (S.C[S.cur].ev && S.C[S.cur].ev.t=='epi')) return;
  const c = S.C[S.cur]; let k=0, sp=0;
  while(k<n && load()<cap() && (c.s[g]||0)>=1){
    const p = buyP(c,g); if(S.gold < p) break;
    S.gold -= p; sp += p; S.inv[g]++; c.s[g]--; k++; S.stats.bought[g]++; S.stats.spentOn[g] += p;
  }
  if(k){ pop('-'+sp,'r'); ding(1175,.035); setTimeout(()=>ding(880,.03),90); } ui();
}
function sell(g,n){
  if(S.travel || S.over || (S.C[S.cur].ev && S.C[S.cur].ev.t=='epi')) return;
  const c = S.C[S.cur]; let k=0, gn=0;
  const avgBuy = S.stats.bought[g]>0 ? S.stats.spentOn[g]/S.stats.bought[g] : G[g][1];
  while(k<n && S.inv[g]>0){
    const p = sellP(c,g); S.gold += p; gn += p; S.inv[g]--; c.s[g]++; k++; S.stats.sold[g]++; S.stats.earnedOn[g] += p;
    const profit = Math.round(p - avgBuy); S.stats.totalProfit += profit; S.stats.deals++;
    if(profit > S.stats.bestTrade){ S.stats.bestTrade = profit; S.stats.bestTradeInfo = {g, day:S.day, city:c.name, profit}; }
  }
  if(k) pop('+'+gn,'g'); ui();
}
function canCraft(r){
  if(S.C[S.cur].sz < 1) return {ok:false, reason:'Atelier nécessite un bourg ou plus'};
  let totalIn = 0;
  for(const g in r.inputs){ if(S.inv[+g] < r.inputs[g]) return {ok:false, reason:'Manque '+G[+g][0]}; totalIn += r.inputs[g]; }
  if(S.gold < r.fee) return {ok:false, reason:'Pas assez d\'or'};
  if(load() - totalIn + 1 > cap()) return {ok:false, reason:'Pas assez de place'};
  return {ok:true};
}
function craft(idx){
  if(S.travel || S.over || (S.C[S.cur].ev && S.C[S.cur].ev.t=='epi')) return;
  const r = RECIPES[idx], check = canCraft(r);
  if(!check.ok){ log('⚠️ '+check.reason+'.','r'); return; }
  for(const g in r.inputs) S.inv[+g] -= r.inputs[g];
  S.gold -= r.fee; S.inv[r.out] = (S.inv[r.out]||0) + 1; S.stats.crafted = (S.stats.crafted||0) + 1;
  ding(880,.05); setTimeout(()=>ding(1175,.05),100); log('🔨 '+G[r.out][2]+' '+G[r.out][0]+' fabriqué (frais '+r.fee+' or).','g'); pop('+1 '+G[r.out][2],'g'); ui();
}
function genContract(){
  const dest = pick(S.C.filter(c => c.id !== S.cur)), g = ri(0, 7);
  const n = Math.max(3, Math.round(cap() * (0.25 + R() * 0.45))) + dest.sz * 2;
  const rew = Math.round(G[g][1] * n * (1.8 + R() * 0.6) + S.day * 2);
  return { state: 'offer', g, n, city: dest.id, rew, exp: S.day + ri(15, 25) + dest.sz * 3, pen: Math.round(rew * 0.25), repRew: 5 + dest.sz * 3, repPen: 10 + dest.sz * 2, offerExpires: S.day + 30 };
}
function acceptContract(idx){
  const c = S.contracts[idx]; if(c.state !== 'offer') return;
  if(S.contracts.filter(x => x.state === 'active').length >= 3){ log('⚠️ 3 contrats actifs max.','r'); return; }
  c.state = 'active'; log('📜 Contrat accepté : '+c.n+'× '+G[c.g][0]+' à '+S.C[c.city].name+' avant J'+c.exp+'.','g'); ding(880,.05); ui();
}
function abandonContract(idx){
  const c = S.contracts[idx]; if(c.state !== 'active') return;
  if(!confirm('Abandonner ?\nPénalité : -'+c.pen+' or et -'+c.repPen+' réputation.')) return;
  S.gold = Math.max(0, S.gold - c.pen); S.C[c.city].rep = Math.max(-100, (S.C[c.city].rep||0) - c.repPen);
  log('📜 Contrat abandonné.','r'); pop('-'+c.pen,'r'); c.state = 'empty'; c.regenDay = S.day + ri(3, 6); ui();
}
function deliverContract(idx){
  const c = S.contracts[idx]; if(c.state !== 'active' || S.cur !== c.city || S.inv[c.g] < c.n) return;
  S.inv[c.g] -= c.n; S.gold += c.rew; S.C[c.city].rep = Math.min(100, (S.C[c.city].rep||0) + c.repRew); S.stats.contractsDone++;
  log('✅ Contrat livré : +'+c.rew+' or, +'+c.repRew+' rép. !','g'); pop('+'+c.rew,'g'); ding(1175,.05); setTimeout(()=>ding(1319,.05),100);
  c.state = 'empty'; c.regenDay = S.day + ri(4, 8); ui();
}
function tickContracts(){
  S.contracts.forEach(c => {
    if(c.state === 'active' && S.day > c.exp){
      S.gold = Math.max(0, S.gold - c.pen); S.C[c.city].rep = Math.max(-100, (S.C[c.city].rep||0) - c.repPen); S.stats.contractsFailed++;
      log('❌ Contrat expiré.','r'); pop('-'+c.pen,'r'); c.state = 'empty'; c.regenDay = S.day + ri(3, 5);
    }
    if(c.state === 'empty' && S.day >= (c.regenDay||0)) Object.assign(c, genContract());
    if(c.state === 'offer' && S.day > (c.offerExpires||0)) Object.assign(c, genContract());
  });
}
function checkAutoDeliveries(){
  if(!S || S.travel || S.over) return;
  S.contracts.forEach((c, i) => {
    if(c.state === 'active' && c.city === S.cur && S.inv[c.g] >= c.n){
      setTimeout(() => { if(S.contracts[i] && S.contracts[i].state === 'active' && S.contracts[i].city === S.cur && S.inv[S.contracts[i].g] >= S.contracts[i].n) deliverContract(i); }, 500);
    }
  });
}
// Fonctions manquantes réintégrées
function upg(k){ const p = ucost(k); if(S.gold < p || S.up[k] >= 10) return; S.gold -= p; S.spent += p; S.up[k]++; pop('-'+p,'r'); computeFog(); ui(); }
function addSub(){ const p = scost(); if(S.gold < p || S.subs.length >= 8) return; const e = pick(S.E); S.gold -= p; S.spent += p; S.subs.push({a:e.a, b:e.b, t:0, cyc:Math.round(e.d/12)+3}); log('🐫 Sous-caravane recrutée : '+S.C[e.a].name+' ↔ '+S.C[e.b].name); pop('-'+p,'r'); ui(); }
function deliver(){ const c = S.C[S.cur], q = c.q; if(S.travel || S.over || !q || S.inv[q.g] < q.n) return; S.inv[q.g] -= q.n; S.gold += q.rew; pop('+'+q.rew,'g'); log('📜 Quête accomplie à '+c.name+' : +'+q.rew+' or','g'); c.q = null; ui(); }