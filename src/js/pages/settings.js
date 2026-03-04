import { db } from '../storage.js';

export function renderSettings() {
  const s = db.get('settings');
  return `<div class="panel">
    <h3>Settings</h3>
    <div class="tabs">
      <button data-settings-tab="masters" class="active">Masters</button>
      <button data-settings-tab="branding">Branding</button>
      <button data-settings-tab="backup">Backup/Restore</button>
    </div>
    <div id="settings-content">${mastersTab(s)}</div>
  </div>`;
}

export function mastersTab(s) {
  return `<div class="row"><div><label>Default Tax Flat (PKR)</label><input id="set-tax-flat" type="number" value="${s.masters.taxFlat}"/></div>
    <div><label>Default Service %</label><input id="set-service-percent" type="number" value="${s.masters.servicePercent}"/></div>
    <div style="align-self:end"><button data-action="save-masters">Save Masters</button></div></div>`;
}

export function brandingTab(s) {
  return `<div><label>Restaurant Name</label><input id="brand-name" value="${s.branding.restaurantName}"/>
    <label>Receipt Footer</label><input id="brand-footer" value="${s.branding.footer}"/>
    <div style="margin-top:8px"><button data-action="save-branding">Save Branding</button></div></div>`;
}

export function backupTab() {
  return `<div class="row"><button data-action="backup-data">Backup Local Data</button>
    <input id="restore-file" type="file" accept="application/json"/>
    <button data-action="restore-data" class="secondary">Restore</button></div>`;
}
