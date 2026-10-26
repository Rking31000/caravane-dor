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
    const minZoom = 0.5;
    const maxZoom = 2.5;
    const step = 0.25;

    const controls = document.createElement('div');
    controls.id = 'map-zoom-controls';
    controls.setAttribute('aria-label', 'Contrôles de zoom de la carte');
    controls.innerHTML = '<button type="button" id="map-zoom-in" aria-label="Zoomer la carte">+</button>' +
      '<button type="button" id="map-zoom-out" aria-label="Dézoomer la carte">−</button>';
    canvasBox.appendChild(controls);

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

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMapZoom);
  } else {
    initMapZoom();
  }
}());
