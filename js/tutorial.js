/* Tutoriel guidé : bulles contextuelles, activable depuis le menu principal. */
(function () {
  'use strict';

  var PREF_KEY = 'cd_tuto_enabled';
  var overlay, highlight, card, stepLabel, textEl;
  var steps = [
    {
      sel: '#water-box',
      text: '<b>L’EAU EST VITALE.</b> La caravane consomme 1 unité tous les 20 km. Si l’eau tombe à 0 en route, le voyage s’arrête… pour toujours.'
    },
    {
      sel: '#food-box',
      text: '<b>LA NOURRITURE AUSSI.</b> Surveille ces deux jauges en haut de l’écran : eau 💧 et vivres 🍖 doivent toujours rester au-dessus de zéro.'
    },
    {
      sel: '#gold',
      text: '<b>VOTRE OR 💰</b> sert à acheter marchandises et provisions. Il est aussi affiché en permanence dans le panneau du marché.'
    },
    {
      before: function () { if (typeof openPanel === 'function') openPanel(); tab = 'm'; if (typeof ui === 'function') ui(); },
      sel: '#panel .supply-row',
      text: '<b>RAVITAILLEZ-VOUS ICI.</b> Avant chaque départ, achetez assez d’eau et de nourriture pour la distance à parcourir (1 unité / 20 km).'
    },
    {
      sel: '#panel table',
      text: '<b>ACHETEZ BAS, VENDEZ HAUT.</b> Les flèches <span style="color:#1a7a1a">▲ vertes</span> signalent un bon prix, les <span style="color:#c62828">▼ rouges</span> un prix défavorable. Le prix d’achat est à gauche, celui de vente à droite.'
    },
    {
      before: function () { tab = 'c'; if (typeof ui === 'function') ui(); },
      sel: '#tc',
      text: '<b>LES CONTRATS 📜</b> rapportent de l’or et de la réputation. Acceptez-en un, puis livrez la marchandise avant la date limite.'
    },
    {
      before: function () { if (typeof closePanel === 'function') closePanel(); },
      sel: '#cv',
      text: '<b>PRÊT À PARTIR ?</b> Cliquez sur une ville de la carte puis sur « Voyager ▶ », ou double-cliquez directement dessus. Sur mobile, pincez deux doigts pour zoomer. Bon voyage, marchand !'
    }
  ];

  var index = 0;
  var running = false;
  var savedSpeed = 1;

  function readPref() {
    var cb = document.getElementById('tuto-enabled');
    if (!cb) return false;
    var saved = null;
    try { saved = localStorage.getItem(PREF_KEY); } catch (e) {}
    if (saved === null) saved = '1';
    cb.checked = saved === '1';
    return cb.checked;
  }

  function build() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    highlight = document.createElement('div');
    highlight.id = 'tutorial-highlight';
    card = document.createElement('div');
    card.id = 'tutorial-card';
    card.innerHTML =
      '<span id="tutorial-step"></span>' +
      '<p id="tutorial-text"></p>' +
      '<div class="tuto-buttons">' +
        '<button type="button" id="tutorial-skip">Passer</button>' +
        '<button type="button" id="tutorial-next">Suivant ▶</button>' +
      '</div>';
    overlay.appendChild(highlight);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    stepLabel = document.getElementById('tutorial-step');
    textEl = document.getElementById('tutorial-text');
    // Empêche le clic sur les boutons du tutoriel de remonter au document :
    // le gestionnaire global fermerait le panneau du marché.
    card.addEventListener('click', function (e) { e.stopPropagation(); });
    document.getElementById('tutorial-next').addEventListener('click', next);
    document.getElementById('tutorial-skip').addEventListener('click', finish);
    window.addEventListener('resize', function () { if (running) position(); });
  }

  function position() {
    var step = steps[index];
    var target = document.querySelector(step.sel);
    if (!target) { next(); return; }
    var r = target.getBoundingClientRect();
    if (r.width < 2 && r.height < 2) { next(); return; }

    var pad = 6;
    highlight.style.left = Math.max(0, r.left - pad) + 'px';
    highlight.style.top = Math.max(0, r.top - pad) + 'px';
    highlight.style.width = (r.width + pad * 2) + 'px';
    highlight.style.height = (r.height + pad * 2) + 'px';

    var cw = card.offsetWidth || 340;
    var ch = card.offsetHeight || 130;
    var left = Math.max(10, Math.min(window.innerWidth - cw - 10, r.left));
    var top = r.bottom + 14;
    if (top + ch > window.innerHeight - 10) top = Math.max(10, r.top - ch - 14);
    card.style.left = left + 'px';
    card.style.top = top + 'px';
  }

  function show() {
    var step = steps[index];
    if (step.before) step.before();
    stepLabel.textContent = 'Étape ' + (index + 1) + ' / ' + steps.length;
    textEl.innerHTML = step.text;
    document.getElementById('tutorial-next').textContent =
      (index === steps.length - 1) ? 'Terminer ✓' : 'Suivant ▶';
    overlay.style.display = 'block';
    position();
  }

  function next() {
    index++;
    if (index >= steps.length) { finish(); return; }
    show();
  }

  function finish() {
    running = false;
    if (overlay) overlay.style.display = 'none';
    speed = savedSpeed;
    if (typeof ui === 'function') ui();
  }

  window.startTutorial = function () {
    var cb = document.getElementById('tuto-enabled');
    if (!cb || !cb.checked) return;
    build();
    index = 0;
    running = true;
    savedSpeed = (typeof speed !== 'undefined' && speed) ? speed : 1;
    speed = 0; // met le jeu en pause pendant la lecture
    show();
  };

  document.addEventListener('keydown', function (e) {
    if (!running) return;
    if (e.key === 'Escape') { finish(); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      var cb = document.getElementById('tuto-enabled');
      if (!cb) return;
      readPref();
      cb.addEventListener('change', function () {
        try { localStorage.setItem(PREF_KEY, cb.checked ? '1' : '0'); } catch (e) {}
      });
    });
  } else {
    readPref();
    var cb = document.getElementById('tuto-enabled');
    if (cb) cb.addEventListener('change', function () {
      try { localStorage.setItem(PREF_KEY, cb.checked ? '1' : '0'); } catch (e) {}
    });
  }
}());
