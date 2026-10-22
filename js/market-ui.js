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
    const label = row.children[0] && row.children[0].textContent.toLowerCase();
    if (!label) return null;
    const item = G.find(function (good) { return label.includes(good[0].toLowerCase()); });
    return item ? Number(item[1]) : null;
  }

  function addBadge(cell, text) {
    if (!cell || cell.querySelector('.market-price-badge')) return;
    const badge = document.createElement('small');
    badge.className = 'market-price-badge';
    badge.textContent = text;
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
    const label = favorable
      ? (mode === 'buy' ? 'Bon achat' : 'Bonne vente')
      : unfavorable
        ? (mode === 'buy' ? 'Achat cher' : 'Vente faible')
        : 'Prix moyen';

    cell.classList.add(favorable ? 'market-price-good' : unfavorable ? 'market-price-bad' : 'market-price-neutral');
    addBadge(cell, label);
  }

  function updateMarketIndicators() {
    document.querySelectorAll('.panel-box table').forEach(function (table) {
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
    const panel = document.getElementById('panel');
    if (panel) new MutationObserver(scheduleUpdate).observe(panel, { childList: true, subtree: true });
  });
}());
