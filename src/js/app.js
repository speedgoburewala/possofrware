import { db, initDB } from './storage.js';
import { receiptHTML } from './receipt.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderPOS, posState, addToCart, toOrder, resetPOS, loadOrder } from './pages/pos.js';
import { renderTables } from './pages/tables.js';
import { renderRetrieve } from './pages/retrieve.js';
import { renderDeliveryBoard } from './pages/delivery-board.js';
import { renderReports } from './pages/reports.js';
import { renderSettings, mastersTab, brandingTab, backupTab } from './pages/settings.js';
import { renderMenuManager, addCategory, addItem } from './pages/menu-manager.js';

initDB();

const routes = {
  '#/dashboard': { title: 'Dashboard', render: renderDashboard },
  '#/pos': { title: 'POS', render: renderPOS },
  '#/tables': { title: 'Tables', render: renderTables },
  '#/retrieve': { title: 'Retrieve / Running Bills', render: renderRetrieve },
  '#/delivery': { title: 'Delivery Board', render: renderDeliveryBoard },
  '#/reports': { title: 'Reports', render: renderReports },
  '#/settings': { title: 'Settings', render: renderSettings },
  '#/menu-manager': { title: 'Menu Manager', render: renderMenuManager }
};

const nav = document.getElementById('main-nav');
const app = document.getElementById('app');

nav.innerHTML = Object.entries(routes)
  .map(([path, r]) => `<a href="${path}">${r.title}</a>`)
  .join('');

function upsertRunning(order) {
  const running = db.get('runningBills') || [];
  const idx = running.findIndex((x) => x.id === order.id);
  if (idx >= 0) running[idx] = order;
  else running.push(order);
  db.set('runningBills', running);
}

function removeRunning(id) {
  const running = db.get('runningBills') || [];
  db.set('runningBills', running.filter((x) => x.id !== id));
}

function renderRoute() {
  const current = routes[location.hash] ? location.hash : '#/dashboard';
  if (!routes[location.hash]) location.hash = current;
  document.getElementById('page-title').textContent = routes[current].title;
  app.innerHTML = routes[current].render();
  [...nav.querySelectorAll('a')].forEach((a) => a.classList.toggle('active', a.getAttribute('href') === current));
}

window.addEventListener('hashchange', renderRoute);
renderRoute();
setInterval(() => {
  document.getElementById('clock').textContent = new Date().toLocaleString();
}, 1000);

function rerenderPOS() {
  if (location.hash === '#/pos') renderRoute();
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;

  if (btn.dataset.posType) {
    posState.orderType = btn.dataset.posType;
    rerenderPOS();
    return;
  }

  if (action === 'add-menu-item') {
    const item = (db.get('menuItems') || []).find((m) => m.id === btn.dataset.id);
    if (item) addToCart(item);
    rerenderPOS();
  }

  if (action === 'add-manual-item') {
    const name = document.getElementById('manual-item-name').value.trim();
    const price = Number(document.getElementById('manual-item-price').value || 0);
    if (name && price > 0) {
      posState.cart.push({ id: `${Date.now()}`, menuItemId: null, name, price, qty: 1, note: '' });
      rerenderPOS();
    }
  }

  if (action === 'qty-plus' || action === 'qty-minus' || action === 'remove-item') {
    const item = posState.cart.find((c) => c.id === btn.dataset.id);
    if (!item) return;
    if (action === 'qty-plus') item.qty += 1;
    if (action === 'qty-minus') item.qty = Math.max(1, item.qty - 1);
    if (action === 'remove-item') posState.cart = posState.cart.filter((c) => c.id !== item.id);
    rerenderPOS();
  }

  if (action === 'save-running') {
    const order = toOrder('RUNNING');
    if (!order.items.length) return;
    upsertRunning(order);
    alert('Saved as running bill.');
  }

  if (action === 'pay-print') {
    const order = toOrder('PAID');
    if (!order.items.length) return;
    removeRunning(order.id);
    const sales = db.get('sales') || [];
    sales.push(order);
    db.set('sales', sales);
    const orders = db.get('orders') || [];
    orders.push(order);
    db.set('orders', orders);

    const settings = db.get('settings');
    const html = receiptHTML(order, settings, 'thermal');
    if (window.electronAPI?.printReceipt) window.electronAPI.printReceipt(html);
    else {
      const w = window.open('', '_blank');
      w.document.write(html);
      w.print();
    }

    resetPOS();
    renderRoute();
  }

  if (action === 'clear-cart') {
    resetPOS();
    rerenderPOS();
  }

  if (action === 'resume-order') {
    const order = (db.get('runningBills') || []).find((o) => o.id === btn.dataset.id);
    if (order) {
      loadOrder(order);
      location.hash = '#/pos';
    }
  }

  if (action === 'add-category') {
    const name = document.getElementById('new-category-name').value.trim();
    if (name) addCategory(name);
    renderRoute();
  }

  if (action === 'add-item') {
    addItem({
      name: document.getElementById('new-item-name').value.trim(),
      price: document.getElementById('new-item-price').value,
      categoryId: document.getElementById('new-item-category').value
    });
    renderRoute();
  }

  if (btn.dataset.settingsTab) {
    const s = db.get('settings');
    const content = document.getElementById('settings-content');
    const tabs = [...document.querySelectorAll('[data-settings-tab]')];
    tabs.forEach((t) => t.classList.toggle('active', t === btn));
    content.innerHTML = btn.dataset.settingsTab === 'masters' ? mastersTab(s) : btn.dataset.settingsTab === 'branding' ? brandingTab(s) : backupTab();
  }

  if (action === 'save-masters') {
    const s = db.get('settings');
    s.masters.taxFlat = Number(document.getElementById('set-tax-flat').value || 0);
    s.masters.servicePercent = Number(document.getElementById('set-service-percent').value || 0);
    db.set('settings', s);
    alert('Masters saved');
  }

  if (action === 'save-branding') {
    const s = db.get('settings');
    s.branding.restaurantName = document.getElementById('brand-name').value;
    s.branding.footer = document.getElementById('brand-footer').value;
    db.set('settings', s);
    alert('Branding saved');
  }

  if (action === 'backup-data') {
    const data = JSON.stringify(db.all(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pos-backup-${Date.now()}.json`;
    a.click();
  }

  if (action === 'restore-data') {
    const file = document.getElementById('restore-file').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      Object.entries(data).forEach(([k, v]) => db.set(k, v));
      alert('Data restored');
      renderRoute();
    };
    reader.readAsText(file);
  }
});

document.addEventListener('input', (e) => {
  if (location.hash !== '#/pos') return;

  if (e.target.id === 'discount-flat') posState.discount = Number(e.target.value || 0);
  if (e.target.id === 'tax-flat') posState.taxFlat = Number(e.target.value || 0);
  if (e.target.id === 'service-percent') posState.servicePercent = Number(e.target.value || 0);
  if (e.target.id === 'table-no') posState.tableNo = e.target.value;
  if (e.target.id === 'customer-name') posState.customerName = e.target.value;
  if (e.target.id === 'customer-phone') posState.customerPhone = e.target.value;

  if (e.target.dataset.action === 'note-item') {
    const item = posState.cart.find((c) => c.id === e.target.dataset.id);
    if (item) item.note = e.target.value;
  }

  if (['discount-flat', 'tax-flat', 'service-percent'].includes(e.target.id)) rerenderPOS();
});
