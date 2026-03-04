import { db } from '../storage.js';

export function renderDashboard() {
  const sales = db.get('sales') || [];
  const running = db.get('runningBills') || [];
  const totalSales = sales.reduce((s, o) => s + o.totals.grandTotal, 0);

  return `<div class="stat-grid">
    <div class="stat-card"><h3>Paid Orders</h3><p>${sales.length}</p></div>
    <div class="stat-card"><h3>Running Bills</h3><p>${running.length}</p></div>
    <div class="stat-card"><h3>Total Sales (PKR)</h3><p>${totalSales.toFixed(0)}</p></div>
    <div class="stat-card"><h3>Average Ticket</h3><p>${sales.length ? (totalSales / sales.length).toFixed(0) : 0}</p></div>
  </div>`;
}
