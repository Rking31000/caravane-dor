/* Amélioration visuelle indépendante des mécaniques du marché. */
(function () {
  'use strict';

  function numberFromCell(cell) {
    if (!cell) return null;
    const text = cell.textContent.replace(/\s/g, '').replace(',', '.');
    const match = text.match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
  }

  function headerIndex(cells, words) {
    return Array.from(cells).findIndex(function (cell) {
      const text = cell.textContent.toLowerCase();
      return words.some(function (word) { return text.includes(word); });
    });
  }

  function addBadge(cell, text) {
    if (!cell || cell.querySelector('.market-price-badge')) return;
    const badge = document.createElement('small');
    badge.className = 'market-price-badge';
    badge.textContent = text;
    cell.appendChild(badge);
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
        const buy = buyIndex >= 0 ? numberFromCell(cells[buyIndex]) : null;
        const sell = sellIndex >= 0 ? numberFromCell(cells[sellIndex]) : null;

        if (buy !== null && cells[buyIndex]) {
          cells[buyIndex].classList.remove('market-price-good', 'market-price-bad', 'market-price-neutral');
          const good = sell !== null && buy < sell;
          cells[buyIndex].classList.add(good ? 'market-price-good' : 'market-price-neutral');
          addBadge(cells[buyIndex], good ? 'Bon achat' : 'Prix d’achat');
        }

        if (sell !== null && cells[sellIndex]) {
          cells[sellIndex].classList.remove('market-price-good', 'market-price-bad', 'market-price-neutral');
          const good = buy !== null && sell > buy;
          cells[sellIndex].classList.add(good ? 'market-price-good' : 'market-price-neutral');
          addBadge(cells[sellIndex], good ? 'Bonne vente' : 'Prix de vente');
        }
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
