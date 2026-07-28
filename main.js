// ======================== ZENTROMALL - INTERNATIONAL STANDARD CORE ENGINE ========================

// 1. Data State Initialization
let products = JSON.parse(localStorage.getItem("zm_products") || "[]");
let cart = JSON.parse(localStorage.getItem("zm_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("zm_wishlist") || "[]");
let orders = JSON.parse(localStorage.getItem("zm_orders") || "[]");
let banners = JSON.parse(localStorage.getItem("zm_banners") || "[]");
let currentUser = JSON.parse(localStorage.getItem("zm_user") || "null");

// Admin Credentials Setup
if (!localStorage.getItem("zm_admin_pass")) {
    localStorage.setItem("zm_admin_pass", "asad123");
}

// Default Seed Data
if (products.length === 0) {
    products = [
        {
            id: 1,
            name: "iPhone 15 Pro Max",
            price: 429999,
            category: "Mobiles",
            image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80",
            desc: "PTA Approved | 256GB | Natural Titanium",
            rating: 4.9
        },
        {
            id: 2,
            name: "Samsung S24 Ultra",
            price: 389999,
            category: "Mobiles",
            image: "https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-ultra-sm-s928bztqins-539574-sm-s928bztqins-571363123?$650_519_PNG$",
            desc: "1 Year Official Warranty | Titanium Gray",
            rating: 4.8
        }
    ];
    localStorage.setItem("zm_products", JSON.stringify(products));
}

const whatsappNumber = "923018067880";

// ======================== Utility & Helper Functions ========================
function saveData() {
    localStorage.setItem("zm_products", JSON.stringify(products));
    localStorage.setItem("zm_cart", JSON.stringify(cart));
    localStorage.setItem("zm_wishlist", JSON.stringify(wishlist));
    localStorage.setItem("zm_orders", JSON.stringify(orders));
    localStorage.setItem("zm_banners", JSON.stringify(banners));
}

function formatPrice(price) {
    return "₨ " + Number(price).toLocaleString("en-PK");
}

// Toast Notification System
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-5 right-5 z-50 px-6 py-3 rounded-xl text-white font-medium shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0 ${
        type === "success" ? "bg-emerald-600" : "bg-rose-600"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove("translate-y-10", "opacity-0");
    }, 100);

    setTimeout(() => {
        toast.classList.add("translate-y-10", "opacity-0");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function openWhatsApp(msg) {
    const encoded = encodeURIComponent(msg);
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;
    window.open(waUrl, "_blank");
}

function handleFileUpload(event, callback) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => callback(e.target.result);
    reader.readAsDataURL(file);
}

// ======================== Cart & Wishlist Operations ========================
function addToCart(id, qty = 1) {
    const item = cart.find(x => x.id === id);
    if (item) {
        item.qty += qty;
    } else {
        cart.push({ id, qty });
    }
    saveData();
    updateBadges();
    showToast("Product added to cart!");
}

function removeFromCart(id) {
    cart = cart.filter(x => x.id !== id);
    saveData();
    updateBadges();
    if (typeof renderCart === "function") renderCart();
    showToast("Product removed from cart", "error");
}

function toggleWishlist(id) {
    const index = wishlist.indexOf(id);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast("Removed from wishlist", "error");
    } else {
        wishlist.push(id);
        showToast("Added to wishlist!");
    }
    saveData();
    updateBadges();
    if (typeof renderWishlist === "function") renderWishlist();
}

function updateBadges() {
    const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalWishlistCount = wishlist.length;

    document.querySelectorAll("#cart-count, .cart-badge").forEach(el => {
        if (el) el.textContent = totalCartCount;
    });

    document.querySelectorAll("#wishlist-count, .wishlist-badge").forEach(el => {
        if (el) el.textContent = totalWishlistCount;
    });
}

// ======================== Order Processing (Checkout) ========================
function placeOrder(e) {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const address = document.getElementById("address")?.value.trim();
    const city = document.getElementById("city")?.value.trim() || "Pakistan";

    if (!name || !phone || !address || cart.length === 0) {
        showToast("Please fill all required fields!", "error");
        return;
    }

    let total = 0;
    let orderItems = [];
    let msg = `🛍️ *NEW ORDER - ZENTROMALL*\n`;
    msg += `-----------------------------------\n`;
    msg += `👤 *Customer:* ${name}\n📞 *Phone:* ${phone}\n📍 *Address:* ${address}, ${city}\n`;
    msg += `-----------------------------------\n*ITEMS:* \n`;

    cart.forEach(item => {
        const p = products.find(x => x.id === item.id);
        if (p) {
            const subtotal = p.price * item.qty;
            total += subtotal;
            orderItems.push({ id: p.id, name: p.name, price: p.price, qty: item.qty });
            msg += `• ${p.name} (x${item.qty}) = ${formatPrice(subtotal)}\n`;
        }
    });

    msg += `-----------------------------------\n`;
    msg += `💰 *Grand Total:* ${formatPrice(total)}\n`;
    msg += `🚚 *Payment:* Cash on Delivery\n`;
    msg += `-----------------------------------\nThank you for shopping with us!`;

    const newOrder = {
        id: "ZM-" + Date.now().toString().slice(-6),
        date: new Date().toLocaleString("en-PK"),
        customer: { name, phone, address, city },
        items: orderItems,
        total,
        status: "Pending",
        userEmail: currentUser ? currentUser.email : "Guest"
    };

    orders.unshift(newOrder);
    cart = [];
    saveData();
    updateBadges();

    showToast("Order Placed Successfully!");
    setTimeout(() => {
        openWhatsApp(msg);
        window.location.href = "my-orders.html";
    }, 1000);
}

// ======================== Product Rendering Engine ========================
function createProductCard(p) {
    const isWishlisted = wishlist.includes(p.id);
    const isVideo = p.image?.startsWith("data:video") || p.image?.endsWith(".mp4") || p.image?.endsWith(".webm");

    return `
        <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between">
            <div class="relative group">
                ${
                    isVideo
                    ? `<video src="${p.image}" class="w-full h-56 object-cover" controls loop muted></video>`
                    : `<img src="${p.image || 'https://via.placeholder.com/400'}" alt="${p.name}" class="w-full h-56 object-cover group-hover:scale-105 transition duration-500" onerror="this.src='https://via.placeholder.com/400/333/fff?text=No+Image'">`
                }
                <button onclick="toggleWishlist(${p.id})" class="absolute top-3 right-3 p-2 bg-white/80 rounded-full shadow hover:bg-white transition">
                    <svg class="w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                </button>
            </div>
            
            <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <span class="text-xs text-indigo-400 uppercase font-semibold tracking-wider">${p.category || 'General'}</span>
                    <h3 class="text-lg font-bold text-white mt-1 hover:text-indigo-300 cursor-pointer" onclick="window.location.href='product-detail.html?id=${p.id}'">${p.name}</h3>
                    <p class="text-gray-300 text-sm mt-1 line-clamp-2">${p.desc || ""}</p>
                </div>
                
                <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                        <p class="text-xs text-gray-400">Price</p>
                        <p class="text-xl font-extrabold text-emerald-400">${formatPrice(p.price)}</p>
                    </div>
                    <button onclick="addToCart(${p.id})" class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition shadow-lg">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderProducts() {
    const featuredContainer = document.getElementById("featured");
    const allProductsContainer = document.getElementById("allProducts");

    if (featuredContainer) {
        featuredContainer.innerHTML = products.slice(0, 8).map(createProductCard).join("");
    }
    if (allProductsContainer) {
        allProductsContainer.innerHTML = products.map(createProductCard).join("");
    }
}

// ======================== Page Load Initialization ========================
document.addEventListener("DOMContentLoaded", () => {
    updateBadges();

    if (document.getElementById("featured") || document.getElementById("allProducts")) {
        renderProducts();
    }

    // Render Banners
    const bannerContainer = document.getElementById("bannerContainer");
    if (bannerContainer && banners.length > 0) {
        document.getElementById("topBanner")?.classList.remove("hidden");
        bannerContainer.innerHTML = banners.map(b => {
            if (b.media) {
                return b.media.startsWith("data:video") || b.media.endsWith(".mp4") || b.media.endsWith(".webm")
                    ? `<video src="${b.media}" class="inline-block h-20 mx-6 rounded-xl shadow-lg" loop muted playsinline autoplay></video>`
                    : `<img src="${b.media}" class="inline-block h-20 mx-6 rounded-xl shadow-lg object-cover">`;
            }
            return `<span class="inline-block mx-8 text-2xl font-bold tracking-wide">${b.text}</span>`;
        }).join("");
    }
});

console.log("🚀 ZentroMall Core Engine v2.0 Fully Loaded");
