/* Fenêtre d'événement de route : message + récapitulatif, jeu en pause. */
(function () {
  'use strict';

  var queue = [], showing = false, savedSpeed = 1;
  var overlay, card;

  function tr(s) { return (typeof I18N !== 'undefined') ? I18N.translate(s) : s; }

  function build() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'event-popup';
    overlay.className = 'hidden';
    overlay.innerHTML =
      '<div class="event-card" role="dialog" aria-modal="true">' +
        '<div class="event-icon" id="event-icon"></div>' +
        '<h2 id="event-title"></h2>' +
        '<p id="event-message"></p>' +
        '<div id="event-effects"></div>' +
        '<button type="button" id="event-continue">Continuer ▶</button>' +
      '</div>';
    document.body.appendChild(overlay);
    card = overlay.querySelector('.event-card');

    document.getElementById('event-continue').addEventListener('click', function (e) {
      e.stopPropagation();
      next();
    });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) next(); });
    document.addEventListener('keydown', function (e) {
      if (!showing) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); next(); }
    });
  }

  function render(data) {
    document.getElementById('event-icon').textContent = data.icon || '✨';
    document.getElementById('event-title').textContent = tr(data.title);
    document.getElementById('event-message').innerHTML = tr(data.message);
    document.getElementById('event-continue').textContent = tr('Continuer ▶');

    var fx = document.getElementById('event-effects');
    fx.innerHTML = (data.effects || []).filter(Boolean).map(function (x) {
      var cls = x.indexOf('-') === 0 ? 'bad' : (x.indexOf('+') === 0 ? 'good' : '');
      return '<div class="event-effect ' + cls + '">' + tr(x) + '</div>';
    }).join('');

    card.className = 'event-card ' + (data.tone || '');
    overlay.classList.remove('hidden');
    showing = true;
  }

  function next() {
    overlay.classList.add('hidden');
    showing = false;
    if (queue.length) { render(queue.shift()); return; }
    speed = savedSpeed;
    if (typeof ui === 'function') ui();
  }

  window.showEventPopup = function (data) {
    if (!data) return;
    build();
    if (!showing && !queue.length) { savedSpeed = speed || 1; speed = 0; }
    if (showing) { queue.push(data); return; }
    render(data);
  };
}());
