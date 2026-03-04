export function receiptHTML(order, settings, mode = 'thermal') {
  const width = mode === 'thermal' ? '280px' : '100%';
  const rows = order.items
    .map(
      (i) => `<tr><td>${i.name}${i.note ? `<br/><small>${i.note}</small>` : ''}</td><td>${i.qty}</td><td>${(i.price * i.qty).toFixed(0)}</td></tr>`
    )
    .join('');

  return `<!doctype html><html><head><style>
      body{font-family:Arial;padding:10px;max-width:${width};margin:auto}
      h2,h3,p{margin:4px 0}
      table{width:100%;border-collapse:collapse}
      td,th{border-bottom:1px dashed #bbb;padding:4px;text-align:left;font-size:12px}
      .right{text-align:right}
    </style></head><body>
      <h2>${settings.branding.restaurantName}</h2>
      <p>Order #${order.id.slice(-6)} | ${order.orderType.toUpperCase()}</p>
      <p>${new Date(order.createdAt).toLocaleString()}</p>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Amt</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="right">Subtotal: ${order.totals.subtotal.toFixed(0)}</p>
      <p class="right">Discount: -${order.totals.discount.toFixed(0)}</p>
      <p class="right">Tax: ${order.totals.tax.toFixed(0)}</p>
      <p class="right">Service: ${order.totals.service.toFixed(0)}</p>
      <h3 class="right">Grand Total: ${order.totals.grandTotal.toFixed(0)}</h3>
      <p>${settings.branding.footer}</p>
    </body></html>`;
}
