let products = JSON.parse(localStorage.getItem("zm_products") || "[]");
let cart = JSON.parse(localStorage.getItem("zm_cart") || "[]");
let orders = JSON.parse(localStorage.getItem("zm_orders") || "[]");
let currentUser = JSON.parse(localStorage.getItem("zm_user") || "null");
let users = JSON.parse(localStorage.getItem("zm_users") || "[]");
let lang = localStorage.getItem("zm_lang") || "en";

if (products.length === 0) {
  products = [
    {id:1,name:"iPhone 15 Pro",price:129900,image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692846357731",desc:"Titanium • A17 Pro",category:"electronics"},
    {id:2,name:"MacBook Pro M3",price:239900,image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp16-spaceblack-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290",desc:"Space Black • 48GB RAM",category:"electronics"},
    {id:3,name:"Samsung S24 Ultra",price:134999,image:"https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-ultra-sm-s928bztqins-539574-sm-s928bztqins-571363123?$650_519_PNG$",desc:"200MP Camera",category:"electronics"},
    {id:4,name:"Levi's Jeans",price:4999,image:"https://via.placeholder.com/400/000000/FFFFFF?text=Levi's+Jeans",desc:"Classic Fit",category:"fashion"}
  ];
  localStorage.setItem("zm_products", JSON.stringify(products));
}

function saveData() {
  localStorage.setItem("zm_products", JSON.stringify(products));
  localStorage.setItem("zm_cart", JSON.stringify(cart));
  localStorage.setItem("zm_orders", JSON.stringify(orders));
  localStorage.setItem("zm_users", JSON.stringify(users));
  localStorage.setItem("zm_user", JSON.stringify(currentUser));
}

function addToCart(id) {
  const item = cart.find(x => x.id === id);
  if (item) item.qty++; else cart.push({id, qty:1});
  saveData(); updateCartCount(); alert(lang === "ur" ? "کارٹ میں شامل ہو گیا!" : "Added to Cart!");
}

function updateCartCount() {
  const total = cart.reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll("#cart-count").forEach(el=>el.textContent=total);
}

function loadFeatured() {
  const div = document.getElementById("featured");
  if (!div) return;
  div.innerHTML = products.slice(0,8).map(p=>`
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover-grow" role="article">
      <img src="${p.image}" alt="${p.name}" class="w-full h-64 object-cover">
      <div class="p-6">
        <h3 class="text-xl font-bold">${p.name}</h3>
        <p class="text-gray-600 dark:text-gray-300">${p.desc}</p>
        <p class="text-3xl font-bold text-indigo-600 my-4">₹${p.price.toLocaleString()}</p>
        <button onclick="addToCart(${p.id})" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg">Add to Cart</button>
      </div>
    </div>`).join("");
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("zm_theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
}
function loadTheme() { if (localStorage.getItem("zm_theme") === "dark") document.documentElement.classList.add("dark"); }

function toggleLang() {
  lang = lang === "en" ? "ur" : "en";
  localStorage.setItem("zm_lang", lang);
  loadLang();
}
function loadLang() {
  document.querySelectorAll("[data-lang]").forEach(el => {
    const key = el.getAttribute("data-lang");
    el.textContent = lang === "ur" ? urdu[key] : english[key];
  });
}
const english = { welcome: "Welcome", shop: "Shop Now", cart: "Cart" };
const urdu = { welcome: "خوش آمدید", shop: "ابھی خریداری کریں", cart: "کارٹ" };

function acceptConsent() {
  localStorage.setItem("zm_consent", "accepted");
  document.getElementById("consent").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", ()=>{ updateCartCount(); loadTheme(); loadLang(); });
