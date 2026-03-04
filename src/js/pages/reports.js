import { db } from '../storage.js';

export function renderReports() {
  const sales = db.get('sales') || [];
  const rows = sales
    .map(
      (o) => `<tr><td>${new Date(o.createdAt).toLocaleString()}</td><td>${o.id.slice(-6)}</td><td>${o.orderType}</td><td>${o.items.length}</td><td>${o.totals.grandTotal.toFixed(0)}</td></tr>`
    )
    .join('');
  const total = sales.reduce((s, x) => s + x.totals.grandTotal, 0);

  return `<div class="panel"><h3>Sales Reports</h3>
  <p><strong>Total Revenue:</strong> PKR ${total.toFixed(0)}</p>
  <table class="list-table"><thead><tr><th>Date</th><th>Order</th><th>Type</th><th>Items</th><th>Total</th></tr></thead>
  <tbody>${rows || '<tr><td colspan="5" class="muted">No paid orders yet.</td></tr>'}</tbody></table></div>`;
}
