// ======================== ZENTROMALL - FINAL ADVANCED MAIN.JS 2025 ========================
let products = JSON.parse(localStorage.getItem("zm_products") || "[]");
let cart = JSON.parse(localStorage.getItem("zm_cart") || "[]");
let orders = JSON.parse(localStorage.getItem("zm_orders") || "[]");
let banners = JSON.parse(localStorage.getItem("zm_banners") || "[]");

// ڈیفالٹ ایڈمن پاس ورڈ اور پروڈکٹس
if (!localStorage.getItem("zm_admin_pass")) localStorage.setItem("zm_admin_pass", "asad123");
if (products.length === 0) {
  products = [
    {id:1, name:"iPhone 15 Pro Max", price:429999, image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80", desc:"PTA Approved"},
    {id:2, name:"Samsung S24 Ultra", price:389999, image:"https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-ultra-sm-s928bztqins-539574-sm-s928bztqins-571363123?$650_519_PNG$", desc:"1 Year Warranty"}
  ];
  localStorage.setItem("zm_products", JSON.stringify(products));
}

// تمہارا WhatsApp نمبر (ضروری!)
const whatsappNumber = "923018067880"; // ← یہاں اپنا نمبر ڈالو بھائی!

// ======================== Utility Functions ========================
function saveData() {
  localStorage.setItem("zm_products", JSON.stringify(products));
  localStorage.setItem("zm_cart", JSON.stringify(cart));
  localStorage.setItem("zm_orders", JSON.stringify(orders));
  localStorage.setItem("zm_banners", JSON.stringify(banners));
}

function formatPrice(p) {
  return "₨" + Number(p).toLocaleString("en-PK");
}

function openWhatsApp(msg) {
  const encoded = encodeURIComponent(msg);
  window.location.href = `whatsapp://send?phone=${whatsappNumber}&text=${encoded}`;
  setTimeout(() => window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank'), 800);
}

function handleImageUpload(event, callback) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => callback(e.target.result);
  reader.readAsDataURL(file);
}

// ======================== Cart Functions ========================
function addToCart(id) {
  const item = cart.find(x => x.id === id);
  if (item) item.qty++;
  else cart.push({id, qty: 1});
  saveData();
  updateCartCount();
  alert("Added to Cart!");
}

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll("#cart-count, #mobile-cart-count").forEach(el => {
    if (el) el.textContent = total;
  });
}

// ======================== Order Function (Checkout) ========================
function placeOrder(e) {
  e.preventDefault();
  const name = document.getElementById("name")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const address = document.getElementById("address")?.value.trim();

  if (!name || !phone || !address || cart.length === 0) {
    alert("Please fill all fields and add items!");
    return;
  }

  let total = 0;
  let msg = `*New Order - ZentroMall*\n\n`;
  msg += `Name: ${name}\nPhone: ${phone}\nAddress: ${address}\n\n*Items:*\n`;

  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    if (p) {
      total += p.price * item.qty;
      msg += `• ${p.name} × ${item.qty} = ${formatPrice(p.price * item.qty)}\n`;
    }
  });

  msg += `\n*Total: ${formatPrice(total)}*\nCash on Delivery | Pakistan Wide\nThank you!`;

  // آرڈر سیو کرو
  orders.push({
    date: new Date().toLocaleString("en-PK"),
    customer: {name, phone, address},
    items: cart.map(c => ({...c, name: products.find(p => p.id === c.id)?.name || "Unknown"})),
    total,
    status: "pending",
    tracking_id: ""
  });
  saveData();

  // کارٹ خالی کرو
  cart = [];
  localStorage.setItem("zm_cart", "[]");
  updateCartCount();

  alert("Order Placed! Sending to WhatsApp...");
  openWhatsApp(msg);
}

// ======================== Page Load ========================
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  // پروڈکٹس رینڈر کرو
  if (document.getElementById("featured") || document.getElementById("allProducts")) {
    renderProducts();
  }

  // نیا بینر سسٹم (Image + Video + Text)
  const bannerContainer = document.getElementById("bannerContainer");
  if (bannerContainer && banners.length > 0) {
    document.getElementById("topBanner")?.classList.remove("hidden");
    bannerContainer.innerHTML = banners.map(b => {
      if (b.media) {
        return b.media.startsWith("data:video")
          ? `<video src="${b.media}" class="inline-block h-24 mx-10 rounded-lg shadow-lg" loop muted playsinline></video>`
          : `<img src="${b.media}" class="inline-block h-24 mx-10 rounded-lg shadow-lg object-cover">`;
      } else {
        return `<span class="inline-block mx-12 text-4xl font-bold drop-shadow-lg">${b.text}</span>`;
      }
    }).join("") + "&nbsp;".repeat(30);
  }
});

// ======================== Render Products (Video + Image Support) ========================
function renderProducts() {
  const productHTML = p => `
    <div class="bg-white text-black rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition duration-300">
      ${p.image?.startsWith("data:video")
        ? `<video src="${p.image}" class="w-full h-64 object-cover" controls loop muted></video>`
        : `<img src="${p.image || 'https://via.placeholder.com/400'}" class="w-full h-64 object-cover" onerror="this.src='https://via.placeholder.com/400/333/fff?text=No+Image'">`
      }
      <div class="p-6">
        <h3 class="text-xl font-bold mb-2">${p.name}</h3>
        <p class="text-gray-600 text-sm">${p.desc || ""}</p>
        <p class="text-3xl font-bold text-green-600 my-4">${formatPrice(p.price)}</p>
        <button onclick="addToCart(${p.id})" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition">
          Add to Cart
        </button>
      </div>
    </div>`;

  const featured = document.getElementById("featured");
  const allProducts = document.getElementById("allProducts");

  if (featured) featured.innerHTML = products.slice(0, 12).map(productHTML).join("");
  if (allProducts) allProducts.innerHTML = products.map(productHTML).join("");
}

console.log("ZentroMall Engine Loaded - FINAL VERSION 2025 - By Asad Bhai");
