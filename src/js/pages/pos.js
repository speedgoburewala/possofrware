import { db, uid } from '../storage.js';

export const posState = {
  orderType: 'dining',
  tableNo: '',
  customerName: '',
  customerPhone: '',
  cart: [],
  discount: 0,
  taxFlat: 0,
  servicePercent: 0,
  editingOrderId: null
};

function totals(state) {
  const subtotal = state.cart.reduce((s, x) => s + x.price * x.qty, 0);
  const discount = Number(state.discount || 0);
  const tax = Number(state.taxFlat || 0);
  const service = ((subtotal - discount + tax) * Number(state.servicePercent || 0)) / 100;
  const grandTotal = Math.max(0, subtotal - discount + tax + service);
  return { subtotal, discount, tax, service, grandTotal };
}

export function renderPOS() {
  const settings = db.get('settings');
  if (!posState.taxFlat && !posState.servicePercent) {
    posState.taxFlat = settings.masters.taxFlat;
    posState.servicePercent = settings.masters.servicePercent;
  }
  const categories = db.get('categories') || [];
  const items = db.get('menuItems') || [];
  const t = totals(posState);

  return `<div class="grid-2">
    <div class="panel">
      <div class="tabs">
        ${['dining', 'takeaway', 'delivery'].map((x) => `<button class="${posState.orderType === x ? 'active' : ''}" data-pos-type="${x}">${x}</button>`).join('')}
      </div>
      <div class="row">
        <input id="pos-search" placeholder="Search item..." />
        <select id="pos-category-filter"><option value="">All Categories</option>${categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
      </div>
      <div class="row" style="margin-top:8px">
        <input id="manual-item-name" placeholder="Manual item name" />
        <input id="manual-item-price" type="number" placeholder="Price" />
        <button data-action="add-manual-item" class="secondary">Add Manual</button>
      </div>
      <div class="menu-grid" id="menu-grid" style="margin-top:10px">
        ${items
          .map((i) => `<div class="menu-item-card"><div class="space-between"><strong>${i.name}</strong><span>${i.price}</span></div>
          <span class="tag">${categories.find((c) => c.id === i.categoryId)?.name || '-'}</span>
          <div style="margin-top:8px"><button data-action="add-menu-item" data-id="${i.id}">Add</button></div></div>`)
          .join('')}
      </div>
    </div>
    <div class="panel">
      <div class="row">
        <input id="table-no" placeholder="Table No (Dining)" value="${posState.tableNo}" ${posState.orderType !== 'dining' ? 'disabled' : ''}/>
        <input id="customer-name" placeholder="Customer" value="${posState.customerName}"/>
        <input id="customer-phone" placeholder="Phone" value="${posState.customerPhone}"/>
      </div>
      <h3>Cart ${posState.editingOrderId ? `<span class="tag">Editing ${posState.editingOrderId.slice(-6)}</span>` : ''}</h3>
      <div class="cart-list">
      ${posState.cart
        .map(
          (c) => `<div class="cart-item">
            <div class="space-between"><span class="title">${c.name}</span>
            <button class="danger" data-action="remove-item" data-id="${c.id}">x</button></div>
            <div class="row"><button data-action="qty-minus" data-id="${c.id}" class="secondary">-</button><span>${c.qty}</span><button data-action="qty-plus" data-id="${c.id}" class="secondary">+</button><span>PKR ${c.price}</span></div>
            <textarea placeholder="Note" data-action="note-item" data-id="${c.id}">${c.note || ''}</textarea>
          </div>`
        )
        .join('') || '<p class="muted">No items in cart.</p>'}
      </div>
      <div class="row">
        <input id="discount-flat" type="number" placeholder="Discount PKR" value="${posState.discount}" />
        <input id="tax-flat" type="number" placeholder="Tax Flat" value="${posState.taxFlat}" />
        <input id="service-percent" type="number" placeholder="Service %" value="${posState.servicePercent}" />
      </div>
      <div class="totals">
        <div>Subtotal: <strong>${t.subtotal.toFixed(0)}</strong></div>
        <div>Discount: <strong>${t.discount.toFixed(0)}</strong></div>
        <div>Tax: <strong>${t.tax.toFixed(0)}</strong></div>
        <div>Service: <strong>${t.service.toFixed(0)}</strong></div>
        <div>Grand Total: <strong>${t.grandTotal.toFixed(0)}</strong></div>
      </div>
      <div class="row" style="margin-top:8px">
        <button data-action="save-running" class="secondary">Save Running</button>
        <button data-action="pay-print" class="success">Pay + Print</button>
        <button data-action="clear-cart" class="danger">Clear</button>
      </div>
    </div>
  </div>`;
}

export function addToCart(item) {
  const found = posState.cart.find((c) => c.menuItemId === item.id);
  if (found) found.qty += 1;
  else posState.cart.push({ id: uid(), menuItemId: item.id, name: item.name, price: item.price, qty: 1, note: '' });
}

export function computeTotals() {
  return totals(posState);
}

export function toOrder(status) {
  return {
    id: posState.editingOrderId || uid(),
    createdAt: new Date().toISOString(),
    orderType: posState.orderType,
    tableNo: posState.tableNo,
    customerName: posState.customerName,
    customerPhone: posState.customerPhone,
    items: posState.cart,
    totals: totals(posState),
    status
  };
}

export function resetPOS() {
  Object.assign(posState, {
    orderType: 'dining',
    tableNo: '',
    customerName: '',
    customerPhone: '',
    cart: [],
    discount: 0,
    taxFlat: 0,
    servicePercent: 0,
    editingOrderId: null
  });
}

export function loadOrder(order) {
  Object.assign(posState, {
    orderType: order.orderType,
    tableNo: order.tableNo || '',
    customerName: order.customerName || '',
    customerPhone: order.customerPhone || '',
    cart: order.items || [],
    discount: order.totals.discount || 0,
    taxFlat: order.totals.tax || 0,
    servicePercent: order.totals.subtotal ? (order.totals.service / (order.totals.subtotal - order.totals.discount + order.totals.tax)) * 100 : 0,
    editingOrderId: order.id
  });
}
