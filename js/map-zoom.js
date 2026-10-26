/* Contrôles de zoom de la carte sur mobile et ordinateur. */
(function () {
  'use strict';

  function initMapZoom() {
    const canvasBox = document.querySelector('.canvas-box');
    const canvas = document.getElementById('cv');
    if (!canvasBox || !canvas || document.getElementById('map-zoom-controls')) return;

    let zoom = 1;
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
      canvas.style.transform = 'scale(' + zoom + ')';
      canvas.style.transformOrigin = 'right bottom';
      canvas.classList.toggle('map-is-zoomed', zoom !== 1);
      controls.querySelector('#map-zoom-in').disabled = zoom >= maxZoom;
      controls.querySelector('#map-zoom-out').disabled = zoom <= minZoom;
    }

    controls.querySelector('#map-zoom-in').addEventListener('click', function () {
      zoom = Math.min(maxZoom, +(zoom + step).toFixed(2));
      render();
    });
    controls.querySelector('#map-zoom-out').addEventListener('click', function () {
      zoom = Math.max(minZoom, +(zoom - step).toFixed(2));
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
