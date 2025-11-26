/* cart_checkout.js
  - cart UI
  - coupon support (example coupons)
  - cross-tab sync & storage versioning
  - export/import cart json
*/

(() => {
  const STORE = window.App.StorageService;
  const CART_KEY = 'cart';
  const CART_VER = 'v1';
  // example coupons: code -> { type: 'percent'|'flat', value }
  const COUPONS = { 'WELCOME10': { type:'percent', value:10 }, 'FLAT200': { type:'flat', value:200 } };

  function readCart() { return STORE.get(CART_KEY, CART_VER) || []; }
  function writeCart(c) { STORE.set(CART_KEY, c, CART_VER); }

  const elCartArea = document.getElementById('cart-area');
  const elSummary = document.getElementById('summary-area');
  const btnClear = document.getElementById('btn-clear');
  const btnExport = document.getElementById('btn-export');
  const btnImport = document.getElementById('btn-import');

  function render() {
    const cart = readCart();
    if (!cart.length) {
      elCartArea.innerHTML = '<div class="empty">Your cart is empty. <a href="products.html">Shop now</a></div>';
      elSummary.innerHTML = '';
      return;
    }
    elCartArea.innerHTML = cart.map((item, idx) => {
      const img = item.image || 'data:image/svg+xml;base64,' + btoa(`<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120'><rect width='100%' height='100%' fill='#f3f3f3'/><text x='50%' y='50%' alignment-baseline='middle' text-anchor='middle' fill='#aaa'>No Image</text></svg>`);
      return `<div class="cart-row" data-idx="${idx}">
        <img src="${img}" alt="${item.title}" />
        <div class="info">
          <div style="font-weight:600">${item.title}</div>
          <div class="small">${item.qty} × ${window.App.currency(item.price)}</div>
        </div>
        <div>
          <input class="qty-input" type="number" min="1" value="${item.qty}" data-idx="${idx}" />
          <div style="margin-top:8px;text-align:right">
            <div style="font-weight:700">${window.App.currency(item.price * item.qty)}</div>
            <button class="btn secondary remove" data-idx="${idx}" style="margin-top:8px">Remove</button>
          </div>
        </div>
      </div>`;
    }).join('');

    // summary
    const subtotal = cart.reduce((s,i)=> s + i.price * i.qty, 0);
    const shipping = subtotal > 3000 ? 0 : 150; // example
    const couponCode = sessionStorage.getItem('ecom_coupon') || '';
    const coupon = couponCode && COUPONS[couponCode] ? COUPONS[couponCode] : null;
    let discount = 0;
    if (coupon) {
      if (coupon.type === 'percent') discount = subtotal * (coupon.value / 100);
      else discount = coupon.value;
    }
    const tax = Math.round((subtotal - discount) * 0.13);
    const total = Math.max(0, Math.round(subtotal - discount + shipping + tax));

    elSummary.innerHTML = `
      <div class="summary-inner">
        <div class="small">Items: ${cart.length}</div>
        <div>Subtotal: <strong>${window.App.currency(subtotal)}</strong></div>
        <div>Shipping: <strong>${window.App.currency(shipping)}</strong></div>
        <div>Tax (13%): <strong>${window.App.currency(tax)}</strong></div>
        <div>Discount: <strong>-${window.App.currency(discount)}</strong></div>
        <div style="margin-top:8px;font-size:18px">Total: <strong>${window.App.currency(total)}</strong></div>

        <div class="coupon">
          <input id="coupon-input" placeholder="Coupon code" value="${couponCode}" />
          <button id="apply-coupon" class="btn">Apply</button>
        </div>

        <div style="margin-top:10px">
          <button id="btn-place-order" class="btn">Place order</button>
        </div>
      </div>
    `;

    // wire summary events
    document.getElementById('apply-coupon').addEventListener('click', ()=> {
      const val = document.getElementById('coupon-input').value.trim().toUpperCase();
      if (!val) { sessionStorage.removeItem('ecom_coupon'); render(); return; }
      if (!COUPONS[val]) { alert('Invalid coupon'); return; }
      sessionStorage.setItem('ecom_coupon', val);
      alert('Coupon applied: ' + val);
      render();
    });

    document.getElementById('btn-place-order').addEventListener('click', () => {
      // save order into StorageService orders
      placeOrder(cart, total).then(orderId => {
        writeCart([]); // clear cart
        sessionStorage.removeItem('ecom_coupon');
        alert('Order placed: ' + orderId);
        // redirect to invoice page or show
        window.location.href = `checkout.html?order=${orderId}`;
      }).catch(err => {
        console.error(err);
        alert('Order failed: ' + err.message);
      });
    });

    // qty & remove events
    elCartArea.querySelectorAll('.qty-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = Number(e.target.dataset.idx);
        const q = Math.max(1, Number(e.target.value));
        const c = readCart();
        c[idx].qty = q;
        writeCart(c);
        render();
      });
    });
    elCartArea.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.target.dataset.idx);
        const c = readCart(); c.splice(idx,1);
        writeCart(c); render();
      });
    });
  }

  async function placeOrder(cart, total) {
    // simulate order creation and save to localStorage orders
    const orders = STORE.get('orders', 'v1') || [];
    const id = 'o_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
    const order = {
      id, items: cart, total, status: 'pending',
      createdAt: new Date().toISOString(),
      shippingAddress: JSON.parse(sessionStorage.getItem('ecom_shipping') || 'null') || null
    };
    orders.unshift(order);
    STORE.set('orders', orders, 'v1');
    return id;
  }

  // controls
  btnClear.addEventListener('click', ()=> {
    if (!confirm('Clear cart?')) return;
    writeCart([]);
    render();
  });

  btnExport.addEventListener('click', ()=> {
    const data = readCart();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'cart.json';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  btnImport.addEventListener('click', ()=> {
    const input = document.createElement('input'); input.type='file'; input.accept='application/json';
    input.onchange = async (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      const txt = await file.text();
      try {
        const arr = JSON.parse(txt);
        if (!Array.isArray(arr)) throw new Error('Invalid file');
        writeCart(arr);
        render();
        alert('Cart imported');
      } catch (err) { alert('Import failed: '+ err.message); }
    };
    input.click();
  });

  // initial render
  render();

  // cross-tab updates
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.indexOf('ecom_cart_v1_changed') !== -1) render();
  });
})();
