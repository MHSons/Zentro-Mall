// main.js — client-side logic for product rendering and cart (uses Tailwind classes)

const PRODUCTS = [
  {
    id: 'p1',
    title: 'Classic Cotton Shirt',
    price: 2499,
    currency: 'PKR',
    image: 'assets/product1.jpg',
    desc: 'Comfortable cotton shirt — perfect for daily wear.'
  },
  {
    id: 'p2',
    title: 'Formal Men Watch',
    price: 4999,
    currency: 'PKR',
    image: 'assets/product2.jpg',
    desc: 'Elegant design with leather strap.'
  },
  {
    id: 'p3',
    title: 'Wireless Earbuds',
    price: 3999,
    currency: 'PKR',
    image: 'assets/product3.jpg',
    desc: 'Long battery life and great sound.'
  },
  {
    id: 'p4',
    title: 'Running Sneakers',
    price: 3599,
    currency: 'PKR',
    image: 'assets/product4.jpg',
    desc: 'Breathable material, comfortable sole.'
  },
  {
    id: 'p5',
    title: 'Stylish Backpack',
    price: 2799,
    currency: 'PKR',
    image: 'assets/product5.jpg',
    desc: 'Water-resistant and roomy.'
  },
  {
    id: 'p6',
    title: 'Sunglasses',
    price: 1299,
    currency: 'PKR',
    image: 'assets/product6.jpg',
    desc: 'UV protected lens with modern frame.'
  }
];

// Utilities for price formatting
function formatPrice(price){
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// CART (stored in localStorage)
const CART_KEY = 'ehsan_cart_v1';
function getCart(){
  try{
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch(e){
    return {};
  }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function addToCart(productId, qty = 1){
  const cart = getCart();
  cart[productId] = (cart[productId] || 0) + qty;
  saveCart(cart);
}
function removeFromCart(productId){
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
}
function updateQty(productId, qty){
  const cart = getCart();
  if(qty <= 0) delete cart[productId]; else cart[productId] = qty;
  saveCart(cart);
}

// Render products into #products
function renderProducts(){
  const container = document.getElementById('products');
  if(!container) return;
  container.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card rounded-xl shadow';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}" class="rounded-lg mb-3" />
      <h3 class="text-lg font-semibold mb-1">${p.title}</h3>
      <p class="text-sm text-gray-500 mb-3">${p.desc}</p>
      <div class="flex items-center justify-between">
        <div class="text-lg font-bold">${p.currency} ${formatPrice(p.price)}</div>
        <button data-id="${p.id}" class="add-to-cart bg-blue-600 text-white px-4 py-2 rounded-lg">Add to Cart</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach handlers
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) =>{
      const id = btn.getAttribute('data-id');
      addToCart(id, 1);
      showToast('Added to cart');
    });
  });
}

// Simple toast
function showToast(text){
  let t = document.getElementById('site-toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'site-toast';
    t.className = 'fixed bottom-32 right-6 bg-black text-white px-4 py-2 rounded shadow-lg';
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.style.opacity = '1';
  setTimeout(()=>{ t.style.opacity = '0'; }, 1800);
}

// Cart UI (simple slide-over)
function buildCartUI(){
  let panel = document.getElementById('cart-panel');
  if(panel) return;
  panel = document.createElement('div');
  panel.id = 'cart-panel';
  panel.className = 'fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-lg transform translate-x-full transition-transform';
  panel.style.zIndex = 60;
  panel.innerHTML = `
    <div class="p-4 flex items-center justify-between border-b">
      <h3 class="text-lg font-bold">Your Cart</h3>
      <button id="close-cart" class="text-gray-500">Close</button>
    </div>
    <div id="cart-items" class="p-4 space-y-3 overflow-auto" style="height: calc(100% - 140px);"></div>
    <div class="p-4 border-t">
      <div class="flex items-center justify-between mb-3">
        <div class="font-semibold">Total</div>
        <div id="cart-total" class="font-bold">PKR 0</div>
      </div>
      <a id="checkout-btn" href="#" class="block text-center bg-green-600 text-white py-2 rounded">Checkout</a>
    </div>
  `;
  document.body.appendChild(panel);

  document.getElementById('close-cart').addEventListener('click', ()=>{
    panel.style.transform = 'translateX(100%)';
  });
}

function openCart(){
  const panel = document.getElementById('cart-panel');
  if(panel) panel.style.transform = 'translateX(0)';
  renderCartItems();
}

function renderCartItems(){
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if(!container) return;
  const cart = getCart();
  container.innerHTML = '';
  let total = 0;
  const keys = Object.keys(cart);
  if(keys.length === 0){
    container.innerHTML = '<div class="text-gray-500">Your cart is empty.</div>';
    totalEl.textContent = 'PKR 0';
    return;
  }
  keys.forEach(id =>{
    const qty = cart[id];
    const product = PRODUCTS.find(p=>p.id===id) || {title: 'Unknown', price:0, image: 'assets/product-placeholder.png'};
    total += product.price * qty;
    const row = document.createElement('div');
    row.className = 'flex items-center gap-3';
    row.innerHTML = `
      <img src="${product.image}" class="w-16 h-16 object-cover rounded" />
      <div class="flex-1">
        <div class="font-semibold">${product.title}</div>
        <div class="text-sm text-gray-500">PKR ${formatPrice(product.price)}</div>
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

  // Attach handlers
  container.querySelectorAll('.inc').forEach(b=> b.addEventListener('click', ()=>{ updateQty(b.getAttribute('data-id'), getCart()[b.getAttribute('data-id')] + 1); renderCartItems(); }));
  container.querySelectorAll('.dec').forEach(b=> b.addEventListener('click', ()=>{ const id=b.getAttribute('data-id'); const current=getCart()[id]; updateQty(id, Math.max(0, current-1)); renderCartItems(); }));
  container.querySelectorAll('.remove').forEach(b=> b.addEventListener('click', ()=>{ removeFromCart(b.getAttribute('data-id')); renderCartItems(); }));
}

function updateCartBadge(){
  const badge = document.getElementById('cart-badge');
  if(!badge) return;
  const cart = getCart();
  const count = Object.values(cart).reduce((s,n)=>s+n,0);
  badge.textContent = count;
}

// Init UI controls (cart button & whatsapp button is in HTML already)
function initUI(){
  // create Cart button
  let cb = document.getElementById('cart-button');
  if(!cb){
    cb = document.createElement('button');
    cb.id = 'cart-button';
    cb.className = 'fixed top-6 right-6 bg-white p-3 rounded-full shadow-lg';
    cb.innerHTML = 'Cart <span id="cart-badge" class="ml-2 inline-block bg-red-500 text-white text-xs px-2 py-0 rounded-full">0</span>';
    document.body.appendChild(cb);
  }
  cb.addEventListener('click', ()=>{ openCart(); });

  buildCartUI();
  updateCartBadge();
}

// on DOM ready
window.addEventListener('DOMContentLoaded', ()=>{
  renderProducts();
  initUI();
});

// Expose for debugging
window.EHSAN = { PRODUCTS, getCart, addToCart, removeFromCart, updateQty };
