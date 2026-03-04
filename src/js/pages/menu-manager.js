import { db, uid } from '../storage.js';

export function renderMenuManager() {
  const categories = db.get('categories') || [];
  const items = db.get('menuItems') || [];

  return `<div class="grid-2">
    <div class="panel">
      <h3>Categories</h3>
      <div class="row"><input id="new-category-name" placeholder="Category name"/><button data-action="add-category">Add</button></div>
      <ul>${categories.map((c) => `<li>${c.name}</li>`).join('')}</ul>
    </div>
    <div class="panel">
      <h3>Items</h3>
      <div class="row"><input id="new-item-name" placeholder="Item name"/>
        <input id="new-item-price" type="number" placeholder="Price"/>
        <select id="new-item-category">${categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
        <button data-action="add-item">Add</button></div>
      <table class="list-table"><thead><tr><th>Name</th><th>Category</th><th>Price</th></tr></thead>
      <tbody>${items
        .map((i) => `<tr><td>${i.name}</td><td>${categories.find((c) => c.id === i.categoryId)?.name || '-'}</td><td>${i.price}</td></tr>`)
        .join('')}</tbody></table>
    </div>
  </div>`;
}

export function addCategory(name) {
  const arr = db.get('categories');
  arr.push({ id: uid(), name });
  db.set('categories', arr);
}

export function addItem({ name, price, categoryId }) {
  const arr = db.get('menuItems');
  arr.push({ id: uid(), name, price: Number(price), categoryId });
  db.set('menuItems', arr);
}
