/* Amélioration visuelle indépendante des mécaniques du marché. */
(function () {
  'use strict';

  function numberFromCell(cell) {
    if (!cell) return null;
    const match = cell.textContent.replace(/\s/g, '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
  }

  function headerIndex(cells, words) {
    return Array.from(cells).findIndex(function (cell) {
      const text = cell.textContent.toLowerCase();
      return words.some(function (word) { return text.includes(word); });
    });
  }

  function goodReferenceForRow(row) {
    if (typeof G === 'undefined') return null;
    const cell = row.children[0];
    // Repère fiable, indépendant de la langue affichée.
    if (cell && cell.getAttribute) {
      const idx = cell.getAttribute('data-good');
      if (idx !== null && idx !== undefined && G[Number(idx)]) return Number(G[Number(idx)][1]);
    }
    // Repli pour les anciennes sauvegardes / autres tableaux : noms FR et EN.
    const label = cell && cell.textContent.toLowerCase();
    if (!label) return null;
    const item = G.find(function (good) {
      const fr = good[0].toLowerCase();
      const en = (typeof I18N !== 'undefined' ? I18N.translate(good[0]) : good[0]).toLowerCase();
      return label.includes(fr) || label.includes(en);
    });
    return item ? Number(item[1]) : null;
  }

  function addBadge(cell, text, arrow) {
    if (!cell || cell.querySelector('.market-price-badge')) return;
    const badge = document.createElement('small');
    badge.className = 'market-price-badge';
    // La flèche est dessinée par le CSS (::before) : on ne la met pas aussi dans le texte.
    badge.textContent = text || '';
    cell.appendChild(badge);
  }

  function markPrice(cell, value, reference, mode) {
    if (!cell || value === null) return;
    cell.classList.remove('market-price-good', 'market-price-bad', 'market-price-neutral');

    if (reference === null) {
      cell.classList.add('market-price-neutral');
      addBadge(cell, mode === 'buy' ? 'Prix d’achat' : 'Prix de vente');
      return;
    }

    const ratio = value / reference;
    const favorable = mode === 'buy' ? ratio <= 0.85 : ratio >= 1.15;
    const unfavorable = mode === 'buy' ? ratio >= 1.15 : ratio <= 0.85;
    const label = ''; // Texte supprimé pour la discrétion
    const arrow = favorable ? '▲' : unfavorable ? '▼' : '';
    
    cell.classList.add(favorable ? 'market-price-good' : unfavorable ? 'market-price-bad' : 'market-price-neutral');
    addBadge(cell, label, arrow);
  }

  function updateMarketIndicators() {
    const scope = document.getElementById('panel') || document.querySelector('.panel-box');
    if (!scope) return;
    scope.querySelectorAll('table').forEach(function (table) {
      const header = table.querySelector('thead tr') || table.querySelector('tr');
      if (!header) return;
      const headers = header.children;
      const buyIndex = headerIndex(headers, ['achat', 'buy']);
      const sellIndex = headerIndex(headers, ['vente', 'sell']);
      if (buyIndex < 0 && sellIndex < 0) return;

      const rows = table.querySelectorAll('tbody tr').length
        ? table.querySelectorAll('tbody tr')
        : Array.from(table.querySelectorAll('tr')).slice(1);

      rows.forEach(function (row) {
        const cells = row.children;
        const reference = goodReferenceForRow(row);
        if (buyIndex >= 0) markPrice(cells[buyIndex], numberFromCell(cells[buyIndex]), reference, 'buy');
        if (sellIndex >= 0) markPrice(cells[sellIndex], numberFromCell(cells[sellIndex]), reference, 'sell');
      });
    });
  }

  let scheduled = false;
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      updateMarketIndicators();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    scheduleUpdate();
    const panel = document.getElementById('panel') || document.body;
    if (panel) new MutationObserver(scheduleUpdate).observe(panel, { childList: true, subtree: true });
  });
}());
