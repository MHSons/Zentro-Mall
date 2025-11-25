/* main.js - product rendering, cart, checkout to WhatsApp, localStorage backed data */

// Utility
function $id(id){ return document.getElementById(id); }
function formatPrice(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

// Keys
const KEY_PRODUCTS = 'ehsan_products_v1';
const KEY_CART = 'ehsan_cart_v1';
const KEY_ORDERS = 'ehsan_orders_v1';
const KEY_ADMINS = 'ehsan_admins_v1';

// Defaults (only used on empty localStorage)
const DEFAULT_PRODUCTS = [
  { id:'p1', title:'Classic Cotton Shirt', price:2499, image:'assets/product1.jpg', qty:10, desc:'Comfortable cotton shirt.' },
  { id:'p2', title:'Formal Men Watch', price:4999, image:'assets/product2.jpg', qty:5, desc:'Elegant leather strap watch.' }
];

// Init data if missing
if(!localStorage.getItem(KEY_PRODUCTS)) localStorage.setItem(KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
if(!localStorage.getItem(KEY_ADMINS)){
  // default admin: username admin / pass 12345
  localStorage.setItem(KEY_ADMINS, JSON.stringify([{ username:'admin', password:'12345', role:'super' }]));
}

function loadProducts(){ return JSON.parse(localStorage.getItem(KEY_PRODUCTS) || '[]'); }
function saveProducts(list){ localStorage.setItem(KEY_PRODUCTS, JSON.stringify(list)); }

function getCart(){ return JSON.parse(localStorage.getItem(KEY_CART) || '{}'); }
function saveCart(cart){ localStorage.setItem(KEY_CART, JSON.stringify(cart)); updateCartBadge(); }
function clearCart(){ localStorage.removeItem(KEY_CART); updateCartBadge(); }

function saveOrder(order){
  const arr = JSON.parse(localStorage.getItem(KEY_ORDERS) || '[]');
  arr.push(order);
  localStorage.setItem(KEY_ORDERS, JSON.stringify(arr));
}

// Render products
function renderProducts(){
  const container = $id('products');
  container.innerHTML = '';
  const products = loadProducts();
  if(products.length === 0){
    container.innerHTML = '<div class="col-span-full p-6 bg-white rounded-xl text-center">No products available.</div>';
    return;
  }
  products.forEach(p=>{
    const col = document.createElement('div');
    col.className = 'product-card p-4';
    col.innerHTML = `
      <img src="${p.image}" alt="${p.title}" onerror="this.src='assets/product-placeholder.png'">
      <h3 class="mt-3 text-lg font-semibold">${p.title}</h3>
      <p class="text-sm text-gray-500">${p.desc || ''}</p>
      <div class="mt-3 flex items-center justify-between">
        <div class="font-bold">PKR ${formatPrice(p.price)}</div>
        <div class="flex items-center gap-2">
          <button class="add-btn px-3 py-1 rounded-md bg-blue-600 text-white" data-id="${p.id}">Add</button>
        </div>
      </div>
    `;
    container.appendChild(col);
  });

  // Add handlers
  document.querySelectorAll('.add-btn').forEach(b=>{
    b.addEventListener('click', ()=> {
      const id = b.dataset.id;
      const cart = getCart();
      cart[id] = (cart[id] || 0) + 1;
      saveCart(cart);
      showToast('Added to cart');
    });
  });
}

// Toast
function showToast(txt){
  let t = document.getElementById('site-toast');
  if(!t){ t = document.createElement('div'); t.id='site-toast'; t.className='fixed bottom-32 right-6 bg-black text-white px-4 py-2 rounded shadow-lg'; document.body.appendChild(t); }
  t.textContent = txt; t.style.opacity = '1';
  setTimeout(()=> t.style.opacity = '0', 1500);
}

// Cart panel creation
function buildCartPanel(){
  if(document.getElementById('cart-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'cart-panel';
  panel.className = 'fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-lg transform translate-x-full';
  panel.style.zIndex = 70;
  panel.innerHTML = `
    <div class="p-4 flex items-center justify-between border-b">
      <h3 class="text-lg font-bold">Your Cart</h3>
      <div>
        <button id="cart-clear" class="text-sm text-red-500 mr-3">Clear</button>
        <button id="close-cart" class="text-gray-500">Close</button>
      </div>
    </div>
    <div id="cart-items" class="p-4 space-y-3 overflow-auto" style="height: calc(100% - 160px)"></div>
    <div class="p-4 border-t">
      <div class="flex items-center justify-between mb-3"><div class="font-semibold">Total</div><div id="cart-total" class="font-bold">PKR 0</div></div>
      <button id="checkout-btn" class="w-full bg-green-600 text-white py-2 rounded">Checkout via WhatsApp</button>
    </div>
  `;
  document.body.appendChild(panel);

  $id('close-cart').addEventListener('click', ()=> panel.style.transform = 'translateX(100%)');
  $id('cart-clear').addEventListener('click', ()=> { if(confirm('Clear cart?')){ clearCart(); renderCartItems(); }});
  $id('checkout-btn').addEventListener('click', openCheckoutModal);
}

function openCart(){ const p = $id('cart-panel'); if(p) p.style.transform = 'translateX(0)'; renderCartItems(); }

function renderCartItems(){
  const container = $id('cart-items');
  const totalEl = $id('cart-total');
  const cart = getCart();
  container.innerHTML = '';
  const productList = loadProducts();
  const keys = Object.keys(cart);
  if(keys.length === 0){ container.innerHTML = '<div class="text-gray-500">Your cart is empty.</div>'; totalEl.textContent = 'PKR 0'; return; }
  let total = 0;
  keys.forEach(id=>{
    const qty = cart[id];
    const p = productList.find(x=>x.id===id) || {title:'Unknown', price:0, image:'assets/product-placeholder.png'};
    total += (p.price||0) * qty;
    const row = document.createElement('div');
    row.className = 'flex items-center gap-3';
    row.innerHTML = `
      <img src="${p.image}" class="w-14 h-14 object-cover rounded" onerror="this.src='assets/product-placeholder.png'">
      <div class="flex-1">
        <div class="font-semibold">${p.title}</div>
        <div class="text-sm text-gray-500">PKR ${formatPrice(p.price)}</div>
        <div class="mt-2 flex items-center gap-2">
          <button data-id="${id}" class="dec inline-block px-2 py-1 border rounded">-</button>
          <span class="px-2">${qty}</span>
          <button data-id="${id}" class="inc inline-block px-2 py-1 border rounded">+</button>
          <button data-id="${id}" class="remove text-sm text-red-500 ml-4">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(row);
  });
  totalEl.textContent = 'PKR ' + formatPrice(total);

  container.querySelectorAll('.inc').forEach(b=> b.addEventListener('click', ()=> { const id=b.dataset.id; const c=getCart(); c[id] = (c[id]||0)+1; saveCart(c); renderCartItems(); }));
  container.querySelectorAll('.dec').forEach(b=> b.addEventListener('click', ()=> { const id=b.dataset.id; const c=getCart(); c[id] = Math.max(0,(c[id]||0)-1); if(c[id]===0) delete c[id]; saveCart(c); renderCartItems(); }));
  container.querySelectorAll('.remove').forEach(b=> b.addEventListener('click', ()=> { const id=b.dataset.id; const c=getCart(); delete c[id]; saveCart(c); renderCartItems(); }));
  updateCartBadge();
}

function updateCartBadge(){
  const badge = $id('cart-badge');
  if(!badge) return;
  const count = Object.values(getCart()).reduce((s,n)=>s+n,0);
  badge.textContent = count;
}

// Checkout modal to collect customer details, transaction id, then open WhatsApp
function openCheckoutModal(){
  const modal = document.createElement('div');
  modal.id = 'checkout-modal';
  modal.className = 'fixed inset-0 bg-black/40 flex items-center justify-center z-80';
  modal.innerHTML = `
    <div class="bg-white rounded-xl p-6 w-11/12 sm:w-96">
      <h3 class="text-lg font-bold mb-3">Checkout - Enter details</h3>
      <input id="cust-name" class="w-full p-2 border rounded mb-3" placeholder="Full name (required)"/>
      <input id="cust-phone" class="w-full p-2 border rounded mb-3" placeholder="Phone (e.g. 0301...)" />
      <input id="cust-address" class="w-full p-2 border rounded mb-3" placeholder="Address" />
      <input id="cust-transaction" class="w-full p-2 border rounded mb-3" placeholder="Transaction ID (if paid online)"/>
      <div class="flex gap-2">
        <button id="do-checkout" class="flex-1 bg-green-600 text-white p-2 rounded">Send to WhatsApp</button>
        <button id="cancel-checkout" class="flex-1 bg-gray-200 p-2 rounded">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  $id('cancel-checkout').addEventListener('click', ()=> modal.remove());
  $id('do-checkout').addEventListener('click', doCheckout);
}

function doCheckout(){
  const name = $id('cust-name').value.trim();
  const phone = $id('cust-phone').value.trim();
  const address = $id('cust-address').value.trim();
  const tx = $id('cust-transaction').value.trim();
  if(!name || !phone){ alert('Please provide name and phone'); return; }

  const cart = getCart();
  const products = loadProducts();
  const items = Object.keys(cart).map(id => {
    const p = products.find(x=>x.id===id) || {title:'Unknown', price:0};
    return { id, title:p.title, qty:cart[id], price:p.price };
  });
  const total = items.reduce((s,i)=> s + (i.price||0) * i.qty, 0);

  // create order object
  const order = {
    id: 'ORD' + Date.now(),
    name, phone, address, transaction: tx,
    items, total,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  saveOrder(order);

  // create whatsapp message
  let msg = `New Order from website (Ehsan Collection)%0AOrder ID: ${order.id}%0AName: ${name}%0APhone: ${phone}%0AAddress: ${address}%0ATransaction ID: ${tx || 'N/A'}%0AItems:%0A`;
  items.forEach(it=>{
    msg += `- ${it.title} x${it.qty} = PKR ${formatPrice((it.price||0)*it.qty)}%0A`;
  });
  msg += `%0ATotal: PKR ${formatPrice(total)}%0A%0APlease confirm.`;

  // open whatsapp (international format without + e.g. 92...)
  const waNumber = '923018067880'; // change if need
  const url = `https://wa.me/${waNumber}?text=${msg}`;
  window.open(url, '_blank');

  // close modal, clear cart
  const modal = document.getElementById('checkout-modal');
  if(modal) modal.remove();
  clearCart();
  renderCartItems();
  alert('Order saved and WhatsApp opened. Admin will receive the message.');
}

// Init
window.addEventListener('DOMContentLoaded', ()=>{
  buildCartPanel();
  renderProducts();
  updateCartBadge();

  // Attach cart button at top
  const cartBtn = document.getElementById('cart-button');
  if(cartBtn) cartBtn.addEventListener('click', ()=> openCart());

  // Show admin top button if admin exists (always show link)
  const adminTop = document.getElementById('admin-top-btn');
  if(adminTop) adminTop.classList.remove('hidden');
});
