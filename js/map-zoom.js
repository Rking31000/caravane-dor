/* Contrôles de zoom de la carte sur mobile et ordinateur. */
(function () {
  'use strict';

  function initMapZoom() {
    const canvasBox = document.querySelector('.canvas-box');
    const canvas = document.getElementById('cv');
    if (!canvasBox || !canvas || document.getElementById('map-zoom-controls')) return;

    // Le moteur de jeu possède déjà une caméra à 250 %. Les boutons
    // modifient cette caméra au lieu de réduire visuellement le canvas.
    const cameraRef = typeof camera !== 'undefined' ? camera : null;
    let zoom = cameraRef && Number.isFinite(cameraRef.zoom) ? cameraRef.zoom : 2.5;
    const minZoom = 1;
    const maxZoom = 2.5;
    const step = 0.25;

    const controls = document.createElement('div');
    controls.id = 'map-zoom-controls';
    controls.setAttribute('aria-label', 'Contrôles de zoom de la carte');
    controls.innerHTML = '<button type="button" id="map-zoom-in" aria-label="Zoomer la carte">+</button>' +
      '<button type="button" id="map-zoom-out" aria-label="Dézoomer la carte">−</button>';
    canvasBox.appendChild(controls);

    // Les contrôles de zoom se placent juste au-dessus de la ligne d'info et des
    // boutons de voyage, sinon ils les recouvrent (surtout sur téléphone en portrait).
    function placeControls() {
      const info = document.getElementById('info');
      if (!info) return;
      const offset = Math.round(canvasBox.getBoundingClientRect().bottom - info.getBoundingClientRect().top) + 12;
      controls.style.bottom = Math.max(12, offset) + 'px';
    }
    placeControls();
    window.addEventListener('resize', placeControls);
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(placeControls);
      ro.observe(canvasBox);
      const info = document.getElementById('info');
      const quick = document.getElementById('quick');
      if (info) ro.observe(info);
      if (quick) ro.observe(quick);
    }

    function render() {
      zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
      if (cameraRef) cameraRef.zoom = zoom;
      canvas.style.transform = '';
      canvas.classList.toggle('map-is-zoomed', zoom !== 1);
      controls.querySelector('#map-zoom-in').disabled = zoom >= maxZoom;
      controls.querySelector('#map-zoom-out').disabled = zoom <= minZoom;
    }

    controls.querySelector('#map-zoom-in').addEventListener('click', function () {
      zoom = +(zoom + step).toFixed(2);
      render();
    });

    controls.querySelector('#map-zoom-out').addEventListener('click', function () {
      zoom = +(zoom - step).toFixed(2);
      render();
    });

    // --- GESTE TACTILE : pincer / écarter deux doigts pour dézoomer / zoomer ---
    // Écarter les doigts = distance qui augmente = zoom avant.
    // Rapprocher les doigts = distance qui diminue = zoom arrière.
    let pinchDist = 0;
    let pinchZoom = zoom;
    canvas.style.touchAction = 'none'; // empêche le zoom natif de la page sur le canvas

    function touchDistance(e) {
      if (e.touches.length < 2) return 0;
      const a = e.touches[0], b = e.touches[1];
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        pinchDist = touchDistance(e);
        pinchZoom = zoom;
        e.preventDefault();
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', function (e) {
      if (e.touches.length === 2 && pinchDist > 0) {
        const d = touchDistance(e);
        if (d > 0) {
          zoom = +(pinchZoom * (d / pinchDist)).toFixed(3);
          render();
        }
        e.preventDefault();
      }
    }, { passive: false });

    function endPinch(e) {
      if (e.touches.length < 2) pinchDist = 0;
    }
    canvas.addEventListener('touchend', endPinch);
    canvas.addEventListener('touchcancel', endPinch);

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMapZoom);
  } else {
    initMapZoom();
  }
}());
