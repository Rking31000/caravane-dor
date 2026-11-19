function saveGame(){
  if(!S || S.over) return;
  try{
    localStorage.setItem('cd_save', JSON.stringify({
      S:{C:S.C, E:S.E, cur:S.cur, day:S.day, t:S.t, gold:S.gold, inv:S.inv, water:S.water, food:S.food, up:S.up, subs:S.subs, km:S.km, log:S.log, spent:S.spent, slow:S.slow, stats:S.stats, contracts:S.contracts},
      TOTAL, DIFF, meta
    }));
    log('💾 Partie sauvegardée.','g'); pop('💾','g');
  }catch(e){ log('⚠️ Erreur de sauvegarde.','r'); }
}
function fixSave(d){
  const St = d.S;
  if(!St.stats) St.stats = {};
  ['bought','sold','spentOn','earnedOn'].forEach(k => { if(!Array.isArray(St.stats[k])) St.stats[k] = Array(N_GOODS).fill(0); while(St.stats[k].length < N_GOODS) St.stats[k].push(0); });
  ['totalProfit','deals','bestTrade','contractsDone','contractsFailed','crafted','ambushes','repelled','shortcuts','waterBought','foodBought','deaths'].forEach(k => { if(typeof St.stats[k] !== 'number') St.stats[k] = 0; });
  if(!Array.isArray(St.inv)) St.inv = Array(N_GOODS).fill(0); while(St.inv.length < N_GOODS) St.inv.push(0);
  if(typeof St.water !== 'number' || !isFinite(St.water)) St.water = 20;
  if(typeof St.food !== 'number' || !isFinite(St.food)) St.food = 20;
  St.C.forEach(c => { if(!Array.isArray(c.s)) c.s = Array(N_GOODS).fill(0); while(c.s.length < N_GOODS) c.s.push(0); if(typeof c.rep !== 'number') c.rep = 0; if(typeof c.seen !== 'boolean') c.seen = false; if(typeof c.rumeur !== 'boolean') c.rumeur = false; });
  if(!Array.isArray(St.contracts) || St.contracts.length !== 3) St.contracts = [genContract(), genContract(), genContract()];
  if(typeof St.t !== 'number' || St.t < 0 || St.t >= 1) St.t = 0.25;
  return d;
}
function loadGame(){
  try{
    const raw = localStorage.getItem('cd_save');
    if(!raw){ log('Aucune sauvegarde trouvée.','r'); return; }
    if(S && !S.over && !confirm('Charger la sauvegarde ? La partie en cours sera perdue.')) return;
    const d = fixSave(JSON.parse(raw));
    S = Object.assign({travel:null, path:[], over:false}, d.S);
    TOTAL = d.TOTAL||100; DIFF = d.DIFF||1; meta = d.meta||meta;
    sel = null; $('end').style.display = 'none'; $('dead').style.display = 'none'; $('menu').style.display = 'none';
    camera.x = 0; camera.y = 0;
    computeFog(); log('📂 Partie chargée.','g'); pop('📂','g'); ui();
  }catch(e){ log('⚠️ Erreur de chargement.','r'); }
}
function autoSave(){
  if(S && !S.over) try{
    localStorage.setItem('cd_save', JSON.stringify({
      S:{C:S.C, E:S.E, cur:S.cur, day:S.day, t:S.t, gold:S.gold, inv:S.inv, water:S.water, food:S.food, up:S.up, subs:S.subs, km:S.km, log:S.log, spent:S.spent, slow:S.slow, stats:S.stats, contracts:S.contracts},
      TOTAL, DIFF, meta
    }));
  }catch(e){}
}