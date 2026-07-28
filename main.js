// ======================== ZENTROMALL – INTERNATIONAL STANDARD CORE ENGINE ========================
// Fully Automated • Responsive • Profit/Loss • Tracking • Barcode/QR Ready

// ---------- 1. Data State ----------
let products = JSON.parse(localStorage.getItem("zm_products") || "[]");
let cart     = JSON.parse(localStorage.getItem("zm_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("zm_wishlist") || "[]");
let orders   = JSON.parse(localStorage.getItem("zm_orders") || "[]");
let banners  = JSON.parse(localStorage.getItem("zm_banners") || "[]");
let currentUser = JSON.parse(localStorage.getItem("zm_user") || "null");

// Admin password bootstrap
if (!localStorage.getItem("zm_admin_pass")) {
    localStorage.setItem("zm_admin_pass", "asad123");
}

// ---------- 2. Default Seed (with costPrice for profit/loss) ----------
if (products.length === 0) {
    products = [
        {
            id: 1,
            name: "iPhone 15 Pro Max",
            price: 429999,
            costPrice: 385000,
            category: "Mobiles",
            sku: "ZM-IP15PM-256",
            barcode: "8901234567890",
            stock: 25,
            image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop",
            desc: "PTA Approved | 256GB | Natural Titanium | Official Apple Warranty | 1 Year",
            rating: 4.9
        },
        {
            id: 2,
            name: "Samsung Galaxy S24 Ultra",
            price: 389999,
            costPrice: 345000,
            category: "Mobiles",
            sku: "ZM-S24U-512",
            barcode: "8901234567891",
            stock: 30,
            image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop",
            desc: "1 Year Official Warranty | Titanium Gray | Galaxy AI | 512GB",
            rating: 4.8
        },
        {
            id: 3,
            name: "MacBook Pro 16\" M3 Max",
            price: 749999,
            costPrice: 680000,
            category: "Electronics",
            sku: "ZM-MBP16-M3",
            barcode: "8901234567892",
            stock: 12,
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
            desc: "16-inch Liquid Retina XDR | 36GB RAM | 1TB SSD | Space Black",
            rating: 5.0
        },
        {
            id: 4,
            name: "Apple Watch Ultra 2",
            price: 239999,
            costPrice: 205000,
            category: "Watches",
            sku: "ZM-AWU2-TIT",
            barcode: "8901234567893",
            stock: 40,
            image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=800&auto=format&fit=crop",
            desc: "Titanium Case | Cellular + GPS | Alpine Loop | 49mm",
            rating: 4.7
        },
        {
            id: 5,
            name: "Sony WH-1000XM5",
            price: 89999,
            costPrice: 72000,
            category: "Electronics",
            sku: "ZM-SONY-XM5",
            barcode: "8901234567894",
            stock: 55,
            image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop",
            desc: "Industry Leading Noise Cancelling | 30Hr Battery | Black",
            rating: 4.8
        },
        {
            id: 6,
            name: "Nike Air Max 270",
            price: 24999,
            costPrice: 16500,
            category: "Fashion",
            sku: "ZM-NK-AM270",
            barcode: "8901234567895",
            stock: 80,
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
            desc: "Original Nike | Lightweight | All-day Comfort | Multiple Colors",
            rating: 4.5
        }
    ];
    localStorage.setItem("zm_products", JSON.stringify(products));
}

// Consistent official WhatsApp (International format without +)
const whatsappNumber = "923018067880";

// ---------- 3. Core Utilities ----------
function saveData() {
    localStorage.setItem("zm_products", JSON.stringify(products));
    localStorage.setItem("zm_cart", JSON.stringify(cart));
    localStorage.setItem("zm_wishlist", JSON.stringify(wishlist));
    localStorage.setItem("zm_orders", JSON.stringify(orders));
    localStorage.setItem("zm_banners", JSON.stringify(banners));
    localStorage.setItem("zm_user", JSON.stringify(currentUser));
}

function formatPrice(price) {
    return "PKR " + Number(price || 0).toLocaleString("en-PK");
}

function formatNumber(n) {
    return Number(n || 0).toLocaleString("en-PK");
}

function showToast(message, type = "success") {
    const existing = document.querySelector(".zm-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `zm-toast fixed bottom-5 right-5 z-[9999] px-6 py-3.5 rounded-2xl text-white font-semibold shadow-2xl transition-all duration-300 transform translate-y-12 opacity-0 ${
        type === "success" ? "bg-emerald-600" : type === "error" ? "bg-rose-600" : "bg-indigo-600"
    }`;
    toast.innerHTML = `<div class="flex items-center gap-2"><i class="fa-solid ${type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-xmark" : "fa-info-circle"}"></i> ${message}</div>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove("translate-y-12", "opacity-0");
    });

    setTimeout(() => {
        toast.classList.add("translate-y-12", "opacity-0");
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function openWhatsApp(msg) {
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, "_blank");
}

function handleFileUpload(event, callback) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => callback(e.target.result);
    reader.readAsDataURL(file);
}

function generateTrackingId() {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ZM-${t}-${r}`;
}

function generateSKU(name, category) {
    const prefix = (category || "GEN").substring(0, 3).toUpperCase();
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ZM-${prefix}-${code}`;
}

function generateBarcode() {
    // 13-digit EAN-like
    return "89" + Array.from({length: 11}, () => Math.floor(Math.random() * 10)).join("");
}

// ---------- 4. Auth Nav ----------
function setupNavAuth() {
    const navAuth = document.getElementById("navAuthLinks");
    if (!navAuth) return;

    if (currentUser) {
        navAuth.innerHTML = `
            <a href="profile.html" class="flex items-center gap-2 text-yellow-400 font-bold hover:underline">
                <i class="fa-solid fa-user-circle text-lg"></i>
                <span class="max-w-[110px] truncate">${currentUser.name || "Account"}</span>
            </a>
            <button onclick="logoutUser()" class="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg font-bold text-xs transition">
                Logout
            </button>`;
    } else {
        navAuth.innerHTML = `
            <a href="login.html" class="bg-yellow-400 hover:bg-yellow-300 text-black px-5 py-2 rounded-xl font-bold transition shadow-lg">Login</a>`;
    }
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem("zm_user");
    showToast("Logged out successfully");
    setTimeout(() => window.location.href = "login.html", 700);
}

// ---------- 5. Cart & Wishlist ----------
function addToCart(id, qty = 1) {
    const product = products.find(p => p.id === id);
    if (!product) {
        showToast("Product not found", "error");
        return;
    }
    if (product.stock !== undefined && product.stock < 1) {
        showToast("Out of stock", "error");
        return;
    }
    const item = cart.find(x => x.id === id);
    if (item) {
        item.qty += qty;
    } else {
        cart.push({ id, qty });
    }
    saveData();
    updateBadges();
    showToast("Added to cart");
}

function updateCartQty(id, change) {
    const item = cart.find(x => x.id === id);
    if (!item) return;
    item.qty += change;
    if (item.qty <= 0) {
        removeFromCart(id);
        return;
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
    showToast("Removed from cart", "error");
}

function toggleWishlist(id) {
    const index = wishlist.indexOf(id);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast("Removed from wishlist", "error");
    } else {
        wishlist.push(id);
        showToast("Added to wishlist");
    }
    saveData();
    updateBadges();
    if (typeof renderWishlist === "function") renderWishlist();
    if (typeof renderProducts === "function") renderProducts();
    if (typeof renderWishlistPage === "function") renderWishlistPage();
}

function updateBadges() {
    const totalCart = cart.reduce((s, i) => s + (i.qty || 0), 0);
    const totalWish = wishlist.length;
    document.querySelectorAll("#cart-count, .cart-badge, #cartCount").forEach(el => {
        if (el) el.textContent = totalCart;
    });
    document.querySelectorAll("#wishlist-count, .wishlist-badge, #wishlistCount").forEach(el => {
        if (el) el.textContent = totalWish;
    });
}

// ---------- 6. Order Placement ----------
function placeOrder(e) {
    if (e) e.preventDefault();

    const name    = document.getElementById("name")?.value.trim();
    const phone   = document.getElementById("phone")?.value.trim();
    const address = document.getElementById("address")?.value.trim();
    const city    = document.getElementById("city")?.value.trim() || "Pakistan";

    if (!name || !phone || !address || cart.length === 0) {
        showToast("Please fill all required fields", "error");
        return;
    }

    let total = 0;
    let costTotal = 0;
    let orderItems = [];
    let msg = `🛍️ *NEW ORDER – ZENTROMALL*\n`;
    msg += `-----------------------------------\n`;
    msg += `👤 *Customer:* ${name}\n📞 *Phone:* ${phone}\n📍 *Address:* ${address}, ${city}\n`;
    msg += `-----------------------------------\n*ITEMS:*\n`;

    cart.forEach(item => {
        const p = products.find(x => x.id === item.id);
        if (p) {
            const sub = p.price * item.qty;
            const cSub = (p.costPrice || 0) * item.qty;
            total += sub;
            costTotal += cSub;
            orderItems.push({
                id: p.id,
                name: p.name,
                price: p.price,
                costPrice: p.costPrice || 0,
                qty: item.qty,
                sku: p.sku || ""
            });
            msg += `• ${p.name} (x${item.qty}) = ${formatPrice(sub)}\n`;
            if (p.stock !== undefined) p.stock = Math.max(0, p.stock - item.qty);
        }
    });

    const trackingId = generateTrackingId();
    msg += `-----------------------------------\n`;
    msg += `💰 *Grand Total:* ${formatPrice(total)}\n`;
    msg += `🚚 *Payment:* Cash on Delivery\n`;
    msg += `🔖 *Tracking:* ${trackingId}\n`;
    msg += `-----------------------------------\nThank you for shopping with ZentroMall!`;

    const newOrder = {
        id: "ZM-" + Date.now().toString().slice(-8),
        tracking_id: trackingId,
        date: new Date().toLocaleString("en-PK"),
        timestamp: Date.now(),
        customer: { name, phone, address, city },
        items: orderItems,
        total,
        costTotal,
        profit: total - costTotal,
        status: "Pending",
        userEmail: currentUser ? currentUser.email : "Guest"
    };

    orders.unshift(newOrder);
    cart = [];
    saveData();
    updateBadges();

    showToast("Order placed successfully!");
    setTimeout(() => {
        openWhatsApp(msg);
        window.location.href = "my-orders.html";
    }, 900);
}

// ---------- 7. Product Card Renderer ----------
function createProductCard(p) {
    const isWishlisted = wishlist.includes(p.id);
    const isVideo = p.image?.startsWith("data:video") || p.image?.endsWith(".mp4") || p.image?.endsWith(".webm");
    const outOfStock = p.stock !== undefined && p.stock < 1;

    return `
        <div class="glass border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition duration-300 flex flex-col justify-between group">
            <div class="relative overflow-hidden">
                ${isVideo
                    ? `<video src="${p.image}" class="w-full h-56 object-cover" controls loop muted playsinline></video>`
                    : `<img src="${p.image || 'https://via.placeholder.com/400/1e1b4b/fff?text=No+Image'}" alt="${p.name}" class="w-full h-56 object-cover group-hover:scale-105 transition duration-500" loading="lazy" onerror="this.src='https://via.placeholder.com/400/1e1b4b/fff?text=No+Image'">`
                }
                <button onclick="toggleWishlist(${p.id})" class="absolute top-3 right-3 p-2.5 glass rounded-full shadow-lg hover:bg-white/20 transition z-10" aria-label="Wishlist">
                    <i class="fa-solid fa-heart ${isWishlisted ? 'text-red-500' : 'text-gray-300'} text-lg"></i>
                </button>
                ${outOfStock ? `<span class="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">OUT OF STOCK</span>` : ""}
                ${p.sku ? `<span class="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded">${p.sku}</span>` : ""}
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <span class="text-xs text-yellow-400 font-bold uppercase tracking-wider">${p.category || "General"}</span>
                    <h3 class="text-lg font-bold text-white mt-1 hover:text-yellow-300 cursor-pointer transition line-clamp-1" onclick="window.location.href='product-detail.html?id=${p.id}'">${p.name}</h3>
                    <p class="text-gray-300 text-xs mt-1.5 line-clamp-2">${p.desc || ""}</p>
                    ${p.rating ? `<div class="flex items-center gap-1 mt-2 text-yellow-400 text-xs"><i class="fa-solid fa-star"></i> ${p.rating}</div>` : ""}
                </div>
                <div class="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                        <p class="text-[10px] uppercase text-gray-400">Price</p>
                        <p class="text-lg font-black text-yellow-400">${formatPrice(p.price)}</p>
                    </div>
                    <button onclick="addToCart(${p.id})" ${outOfStock ? "disabled" : ""} class="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-4 py-2 rounded-xl text-xs font-bold hover:brightness-110 transition shadow-md flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fa-solid fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>`;
}

function renderProducts(filterCategory = "All", searchQuery = "") {
    const featuredContainer = document.getElementById("featured");
    const allProductsContainer = document.getElementById("allProducts");

    let filtered = [...products];

    if (filterCategory && filterCategory !== "All") {
        filtered = filtered.filter(p => (p.category || "").toLowerCase() === filterCategory.toLowerCase());
    }
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
            (p.name || "").toLowerCase().includes(q) ||
            (p.desc || "").toLowerCase().includes(q) ||
            (p.sku || "").toLowerCase().includes(q) ||
            (p.category || "").toLowerCase().includes(q)
        );
    }

    if (featuredContainer) {
        featuredContainer.innerHTML = products.slice(0, 8).map(createProductCard).join("");
    }
    if (allProductsContainer) {
        if (filtered.length === 0) {
            allProductsContainer.innerHTML = `<div class="col-span-full text-center py-16 text-gray-400 font-semibold glass rounded-3xl">No products found matching your search.</div>`;
        } else {
            allProductsContainer.innerHTML = filtered.map(createProductCard).join("");
        }
    }
}

// ---------- 8. Reports & Analytics Helpers (used by Admin) ----------
function getSalesReport() {
    const completed = orders.filter(o => o.status === "completed" || o.status === "complete" || o.status === "Completed");
    const pending   = orders.filter(o => o.status === "Pending" || o.status === "pending");

    let totalRevenue = 0;
    let totalCost = 0;
    let totalItemsSold = 0;

    orders.forEach(o => {
        totalRevenue += (o.total || 0);
        totalCost    += (o.costTotal || 0);
        (o.items || []).forEach(it => totalItemsSold += (it.qty || 0));
    });

    const profit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;

    let inventoryValue = 0;
    let inventoryCost  = 0;
    products.forEach(p => {
        const s = p.stock || 0;
        inventoryValue += s * (p.price || 0);
        inventoryCost  += s * (p.costPrice || 0);
    });

    return {
        totalOrders: orders.length,
        completedCount: completed.length,
        pendingCount: pending.length,
        totalRevenue,
        totalCost,
        profit,
        margin,
        totalItemsSold,
        inventoryValue,
        inventoryCost,
        productCount: products.length
    };
}

// ---------- 9. Global Init ----------
document.addEventListener("DOMContentLoaded", () => {
    updateBadges();
    setupNavAuth();

    if (document.getElementById("featured") || document.getElementById("allProducts")) {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get("category") || "All";
        renderProducts(cat);
    }

    const bannerContainer = document.getElementById("bannerContainer");
    if (bannerContainer && banners.length > 0) {
        document.getElementById("topBanner")?.classList.remove("hidden");
        bannerContainer.innerHTML = banners.map(b => {
            if (b.media) {
                return (b.media.startsWith("data:video") || b.media.endsWith(".mp4") || b.media.endsWith(".webm"))
                    ? `<video src="${b.media}" class="inline-block h-12 mx-6 rounded-lg shadow-lg" loop muted playsinline autoplay></video>`
                    : `<img src="${b.media}" class="inline-block h-12 mx-6 rounded-lg shadow-lg object-cover" alt="banner">`;
            }
            return `<span class="inline-block mx-8 text-sm md:text-base font-bold text-black">${b.text || ""}</span>`;
        }).join("");
    }
});

console.log("🚀 ZentroMall International Standard Engine Ready");
