import { db } from '../storage.js';

export function renderRetrieve() {
  const rows = (db.get('runningBills') || [])
    .filter((o) => o.status !== 'PAID')
    .map(
      (o) => `<tr>
      <td>${o.id.slice(-6)}</td><td>${o.orderType}</td><td>${o.tableNo || '-'}</td>
      <td>${o.items.length}</td><td>${o.totals.grandTotal.toFixed(0)}</td>
      <td><button data-action="resume-order" data-id="${o.id}">Resume in POS</button></td>
    </tr>`
    )
    .join('');

  return `<div class="panel"><h3>Retrieve / Running Bills</h3>
    <table class="list-table"><thead><tr><th>ID</th><th>Type</th><th>Table</th><th>Items</th><th>Total</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6" class="muted">No running bills.</td></tr>'}</tbody></table></div>`;
}
