const DB_KEYS = {
  categories: 'pos_categories',
  menuItems: 'pos_menu_items',
  runningBills: 'pos_running_bills',
  orders: 'pos_orders',
  sales: 'pos_sales',
  settings: 'pos_settings',
  tables: 'pos_tables'
};

const defaults = {
  categories: [
    { id: 'c1', name: 'BBQ' },
    { id: 'c2', name: 'Burgers' },
    { id: 'c3', name: 'Beverages' }
  ],
  menuItems: [
    { id: 'm1', name: 'Chicken Boti', categoryId: 'c1', price: 850 },
    { id: 'm2', name: 'Zinger Burger', categoryId: 'c2', price: 650 },
    { id: 'm3', name: 'Mint Margarita', categoryId: 'c3', price: 280 }
  ],
  runningBills: [],
  orders: [],
  sales: [],
  settings: {
    branding: { restaurantName: 'My Restaurant', footer: 'Thanks for visiting!' },
    masters: { taxFlat: 0, servicePercent: 0 },
    deliveryZones: ['Zone A', 'Zone B']
  },
  tables: Array.from({ length: 18 }, (_, i) => ({ id: `T${i + 1}`, label: `Table ${i + 1}` }))
};

function get(key) {
  return JSON.parse(localStorage.getItem(DB_KEYS[key]) || 'null');
}

function set(key, value) {
  localStorage.setItem(DB_KEYS[key], JSON.stringify(value));
}

export function initDB() {
  Object.keys(defaults).forEach((k) => {
    if (!get(k)) set(k, defaults[k]);
  });
}

export const db = {
  all: () => Object.fromEntries(Object.keys(DB_KEYS).map((k) => [k, get(k)])),
  get,
  set,
  push(key, value) {
    const arr = get(key) || [];
    arr.push(value);
    set(key, arr);
  }
};

export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
