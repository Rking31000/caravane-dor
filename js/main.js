function toggleLog() { const logBox = document.getElementById('log-container'); logBox.classList.toggle('closed'); document.getElementById('log-icon').textContent = logBox.classList.contains('closed') ? '▲' : '▼'; setTimeout(() => { TR = null; draw(); }, 320); }
function togglePanel(){
  const main = document.getElementById('main-container');
  const btn = document.getElementById('panel-tab');
  if(!main || !btn) return;
  const isClosed = main.classList.toggle('panel-closed');
  btn.textContent = isClosed ? '▶ Menu' : '◀ Menu';
  btn.title = isClosed ? 'Ouvrir le menu' : 'Fermer le menu';
  if(!isClosed && typeof draw === 'function') setTimeout(() => { TR = null; draw(); }, 150);
}
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
