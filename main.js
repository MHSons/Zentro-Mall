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

// Default Seed Data Initialization
if (products.length === 0) {
    products = [
        {
            id: 1,
            name: "iPhone 15 Pro Max",
            price: 429999,
            category: "Mobiles",
            image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop",
            desc: "PTA Approved | 256GB | Natural Titanium | Official Apple Warranty",
            rating: 4.9
        },
        {
            id: 2,
            name: "Samsung S24 Ultra",
            price: 389999,
            category: "Mobiles",
            image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop",
            desc: "1 Year Official Warranty | Titanium Gray | Galaxy AI Integrated",
            rating: 4.8
        },
        {
            id: 3,
            name: "MacBook Pro M3 Max",
            price: 749999,
            category: "Electronics",
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
            desc: "16-inch Liquid Retina XDR | 36GB RAM | 1TB SSD | Space Black",
            rating: 5.0
        },
        {
            id: 4,
            name: "Apple Watch Ultra 2",
            price: 239999,
            category: "Watches",
            image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=800&auto=format&fit=crop",
            desc: "Titanium Case | Cellular + GPS | Alpine Loop Strap",
            rating: 4.7
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
    localStorage.setItem("zm_user", JSON.stringify(currentUser));
}

function formatPrice(price) {
    return "PKR " + Number(price).toLocaleString("en-PK");
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

// ======================== User Auth Navigation Handler ========================
function setupNavAuth() {
    const navAuth = document.getElementById("navAuthLinks");
    if (!navAuth) return;

    if (currentUser) {
        navAuth.innerHTML = `
            <a href="profile.html" class="flex items-center gap-2 text-yellow-400 font-bold hover:underline">
                <i class="fa-solid fa-user-circle text-lg"></i>
                <span class="max-w-[100px] truncate">${currentUser.name || "Account"}</span>
            </a>
            <button onclick="logoutUser()" class="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg font-bold text-xs transition">
                Logout
            </button>
        `;
    }
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem("zm_user");
    showToast("Logged out successfully");
    setTimeout(() => window.location.href = "login.html", 800);
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

function updateCartQty(id, change) {
    const item = cart.find(x => x.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeFromCart(id);
            return;
        }
    }
    saveData();
    updateBadges();
    if (typeof renderCart === "function") renderCart();
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
    if (typeof renderProducts === "function") renderProducts();
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
        <div class="glass border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition duration-300 flex flex-col justify-between group">
            <div class="relative overflow-hidden">
                ${
                    isVideo
                    ? `<video src="${p.image}" class="w-full h-56 object-cover" controls loop muted></video>`
                    : `<img src="${p.image || 'https://via.placeholder.com/400'}" alt="${p.name}" class="w-full h-56 object-cover group-hover:scale-105 transition duration-500" onerror="this.src='https://via.placeholder.com/400/333/fff?text=No+Image'">`
                }
                <button onclick="toggleWishlist(${p.id})" class="absolute top-3 right-3 p-2.5 glass rounded-full shadow-lg hover:bg-white transition z-10">
                    <i class="fa-solid fa-heart ${isWishlisted ? 'text-red-500' : 'text-gray-400'} text-lg"></i>
                </button>
            </div>
            
            <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <span class="text-xs text-yellow-400 font-bold uppercase tracking-wider">${p.category || 'General'}</span>
                    <h3 class="text-lg font-bold text-white mt-1 hover:text-yellow-300 cursor-pointer transition line-clamp-1" onclick="window.location.href='product-detail.html?id=${p.id}'">${p.name}</h3>
                    <p class="text-gray-300 text-xs mt-1.5 line-clamp-2">${p.desc || ""}</p>
                </div>
                
                <div class="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                        <p class="text-[10px] uppercase text-gray-400">Price</p>
                        <p class="text-lg font-black text-yellow-400">${formatPrice(p.price)}</p>
                    </div>
                    <button onclick="addToCart(${p.id})" class="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-4 py-2 rounded-xl text-xs font-bold hover:brightness-110 transition shadow-md flex items-center gap-1.5">
                        <i class="fa-solid fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderProducts(filterCategory = "All", searchQuery = "") {
    const featuredContainer = document.getElementById("featured");
    const allProductsContainer = document.getElementById("allProducts");

    let filtered = products;

    if (filterCategory && filterCategory !== "All") {
        filtered = filtered.filter(p => p.category.toLowerCase() === filterCategory.toLowerCase());
    }

    if (searchQuery) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (featuredContainer) {
        featuredContainer.innerHTML = products.slice(0, 8).map(createProductCard).join("");
    }

    if (allProductsContainer) {
        if (filtered.length === 0) {
            allProductsContainer.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400 font-semibold">No products found matching your search.</div>`;
        } else {
            allProductsContainer.innerHTML = filtered.map(createProductCard).join("");
        }
    }
}

// ======================== Global Search & Dynamic Init ========================
document.addEventListener("DOMContentLoaded", () => {
    updateBadges();
    setupNavAuth();

    if (document.getElementById("featured") || document.getElementById("allProducts")) {
        renderProducts();
    }

    // Dynamic Banner Rendering
    const bannerContainer = document.getElementById("bannerContainer");
    if (bannerContainer && banners.length > 0) {
        document.getElementById("topBanner")?.classList.remove("hidden");
        bannerContainer.innerHTML = banners.map(b => {
            if (b.media) {
                return b.media.startsWith("data:video") || b.media.endsWith(".mp4") || b.media.endsWith(".webm")
                    ? `<video src="${b.media}" class="inline-block h-12 mx-6 rounded-lg shadow-lg" loop muted playsinline autoplay></video>`
                    : `<img src="${b.media}" class="inline-block h-12 mx-6 rounded-lg shadow-lg object-cover">`;
            }
            return `<span class="inline-block mx-8 text-sm md:text-base font-bold text-black">${b.text}</span>`;
        }).join("");
    }
});

console.log("🚀 ZentroMall Engine Active & Ready!");
