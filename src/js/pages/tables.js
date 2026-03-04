import { db } from '../storage.js';

export function renderTables() {
  const tables = db.get('tables') || [];
  const running = db.get('runningBills') || [];
  const busy = new Set(running.filter((r) => r.orderType === 'dining' && r.tableNo).map((r) => r.tableNo));

  return `<div class="panel"><h3>Dining Tables</h3>
    <div class="table-grid">
      ${tables
        .map((t) => `<div class="table-box ${busy.has(t.id) ? 'busy' : ''}">
          <strong>${t.label}</strong><br/><span class="muted">${busy.has(t.id) ? 'Occupied' : 'Available'}</span>
        </div>`)
        .join('')}
    </div></div>`;
}
