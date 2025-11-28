// ZentroMall Pakistan – FINAL 100% WORKING (28 Nov 2025)
let products = JSON.parse(localStorage.getItem("zm_products") || "[]");
let cart = JSON.parse(localStorage.getItem("zm_cart") || "[]");
let orders = JSON.parse(localStorage.getItem("zm_orders") || "[]");
let currentUser = JSON.parse(localStorage.getItem("zm_user") || "null");
let wishlist = JSON.parse(localStorage.getItem("zm_wishlist") || "[]");

// Admin password
if (!localStorage.getItem("zm_admin_pass")) {
  localStorage.setItem("zm_admin_pass", "asad123"); // ← Change kar lo
}

// Apna WhatsApp Number
const whatsappNumber = "923001234567"; // ←←←← APNA NUMBER YAHAN DAALO

// Default Pakistani Products (PKR)
if (products.length === 0) {
  products = [
    {id:1, name:"iPhone 15 Pro", price:359999, image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80", desc:"PTA Approved", category:"mobile"},
    {id:2, name:"Samsung S24 Ultra", price:389999, image:"https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-ultra-sm-s928bztqins-539574-sm-s928bztqins-571363123?$650_519_PNG$", desc:"Official Warranty", category:"mobile"},
    {id:3, name:"AirPods Pro 2", price:67999, image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90", desc:"Noise Cancellation", category:"accessory"},
    {id:4, name:"Ray-Ban Sunglasses", price:14999, image:"https://via.placeholder.com/600x600/000/fff?text=Ray-Ban", desc:"UV Protection", category:"fashion"}
  ];
  localStorage.setItem("zm_products", JSON.stringify(products));
}

function saveData() {
  localStorage.setItem("zm_products", JSON.stringify(products));
  localStorage.setItem("zm_cart", JSON.stringify(cart));
  localStorage.setItem("zm_orders", JSON.stringify(orders));
  localStorage.setItem("zm_wishlist", JSON.stringify(wishlist));
}

// PKR Format
function formatPrice(price) {
  return "₨" + price.toLocaleString("en-PK");
}

// 100% Working WhatsApp
function openWhatsAppWithMessage(message) {
  const encoded = encodeURIComponent(message);
  const mobile = `whatsapp://send?phone=${whatsappNumber}&text=${encoded}`;
  const web = `https://wa.me/${whatsappNumber}?text=${encoded}`;
  window.location.href = mobile;
  setTimeout(() => window.open(web, '_blank'), 1000);
}

// Add to Cart
function addToCart(id) {
  const item = cart.find(x => x.id === id);
  if (item) item.qty++; else cart.push({id, qty:1});
  saveData(); updateCartCount();
  alert("کارٹ میں شامل ہو گیا!");
}

function updateCartCount() {
  const total = cart.reduce((s,i) => s + i.qty, 0);
  document.querySelectorAll("#cart-count").forEach(el => el.textContent = total);
}

// Image Upload → Base64 (Admin ke liye)
function handleImageUpload(event, callback) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    callback(e.target.result);
  };
  reader.readAsDataURL(file);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});
