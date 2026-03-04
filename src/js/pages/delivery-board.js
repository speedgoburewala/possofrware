import { db } from '../storage.js';

export function renderDeliveryBoard() {
  const all = [...(db.get('runningBills') || []), ...(db.get('sales') || [])].filter((o) => o.orderType === 'delivery');
  const cards = all
    .map(
      (o) => `<div class="panel">
      <div class="space-between"><strong>#${o.id.slice(-6)}</strong><span class="tag">${o.status}</span></div>
      <p>${o.customerName || 'Walk-in delivery'} / ${o.customerPhone || '-'}</p>
      <p>Amount: PKR ${o.totals.grandTotal.toFixed(0)}</p>
    </div>`
    )
    .join('');

  return `<div><h3>Delivery Board</h3><div class="menu-grid">${cards || '<p class="muted">No delivery orders yet.</p>'}</div></div>`;
}
