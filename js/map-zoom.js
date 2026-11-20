/* Contrôles de zoom de la carte : pincement sur tactile, molette sur ordinateur. */
(function () {
  'use strict';

  function initMapZoom() {
    const canvas = document.getElementById('cv');
    if (!canvas) return;
    if (canvas.dataset.zoomReady === '1') return;
    canvas.dataset.zoomReady = '1';

    // Le moteur de jeu possède déjà une caméra à 250 %. On modifie cette caméra
    // au lieu de réduire visuellement le canvas.
    const cameraRef = typeof camera !== 'undefined' ? camera : null;
    let zoom = cameraRef && Number.isFinite(cameraRef.zoom) ? cameraRef.zoom : 2.5;
    const minZoom = 1;
    const maxZoom = 2.5;
    const step = 0.2;

    function render() {
      zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
      if (cameraRef) cameraRef.zoom = zoom;
      canvas.style.transform = '';
      canvas.classList.toggle('map-is-zoomed', zoom !== 1);
    }

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

    // --- ORDINATEUR : molette de la souris pour zoomer / dézoomer ---
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoom = +(zoom + (e.deltaY < 0 ? step : -step)).toFixed(3);
      render();
    }, { passive: false });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMapZoom);
  } else {
    initMapZoom();
  }
}());
