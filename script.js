// ==============================
// Data menu
// ==============================
const FALLBACK_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
    <rect width="400" height="260" fill="#F3E6D6"/>
    <circle cx="200" cy="110" r="45" fill="#C9B39C"/>
    <rect x="130" y="160" width="140" height="14" rx="7" fill="#C9B39C"/>
  </svg>
`);

const MENU = [
  {
    id: "es-kopi-susu",
    nama: "Es Kopi Susu",
    deskripsi: "Kopi susu dengan rasa seimbang dan nikmat.",
    harga: 18000,
    kategori: "Kopi",
    gambar: "https://images.pexels.com/photos/10320332/pexels-photo-10320332.jpeg?auto=compress&cs=tinysrgb&w=500",
    addons: [{ id: "extra-shot", nama: "Extra Shot", harga: 3000 }],
  },
  {
    id: "cappuccino",
    nama: "Cappuccino",
    deskripsi: "Perpaduan espresso dengan susu berbusa.",
    harga: 22000,
    kategori: "Kopi",
    gambar: "https://images.pexels.com/photos/186860/pexels-photo-186860.jpeg?auto=compress&cs=tinysrgb&w=500",
    addons: [{ id: "extra-shot", nama: "Extra Shot", harga: 3000 }],
  },
  {
    id: "es-latte",
    nama: "Es Latte",
    deskripsi: "Espresso dengan susu dingin yang lembut.",
    harga: 20000,
    kategori: "Kopi",
    gambar: "https://images.pexels.com/photos/302896/pexels-photo-302896.jpeg?auto=compress&cs=tinysrgb&w=500",
    addons: [{ id: "extra-shot", nama: "Extra Shot", harga: 3000 }],
  },
  {
    id: "chocolate",
    nama: "Chocolate",
    deskripsi: "Minuman cokelat manis dan creamy.",
    harga: 20000,
    kategori: "Non Kopi",
    gambar: "https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg?auto=compress&cs=tinysrgb&w=500",
    addons: [{ id: "whipped-cream", nama: "Whipped Cream", harga: 4000 }],
  },
  {
    id: "matcha-latte",
    nama: "Matcha Latte",
    deskripsi: "Latte dengan matcha premium.",
    harga: 23000,
    kategori: "Non Kopi",
    gambar: "https://images.pexels.com/photos/5946970/pexels-photo-5946970.jpeg?auto=compress&cs=tinysrgb&w=500",
    addons: [{ id: "oat-milk", nama: "Oat Milk", harga: 5000 }],
  },
  {
    id: "croissant",
    nama: "Croissant",
    deskripsi: "Croissant renyah dengan mentega.",
    harga: 15000,
    kategori: "Snack",
    gambar: "https://images.pexels.com/photos/19296861/pexels-photo-19296861.jpeg?auto=compress&cs=tinysrgb&w=500",
    addons: [],
  },
  {
    id: "chicken-sandwich",
    nama: "Chicken Sandwich",
    deskripsi: "Sandwich ayam dengan sayuran segar.",
    harga: 25000,
    kategori: "Makanan",
    gambar: "https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=500",
    addons: [{ id: "extra-cheese", nama: "Extra Cheese", harga: 4000 }],
  },
  {
    id: "french-fries",
    nama: "French Fries",
    deskripsi: "Kentang goreng renyah dan gurih.",
    harga: 15000,
    kategori: "Snack",
    gambar: "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=500",
    addons: [{ id: "cheese-sauce", nama: "Cheese Sauce", harga: 3000 }],
  },
];

const TAX_RATE = 0.10;

// ==============================
// Penyimpanan bersama (localStorage) — dipakai di semua halaman
// ==============================
const CART_KEY = "borcelle-pos-cart";
const CUSTOMER_KEY = "borcelle-pos-customer";

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
}

function saveCart(data) {
  localStorage.setItem(CART_KEY, JSON.stringify(data));
}

function loadCustomerName() {
  return localStorage.getItem(CUSTOMER_KEY) || "";
}

function saveCustomerName(name) {
  localStorage.setItem(CUSTOMER_KEY, name);
}

let cart = loadCart(); // { menuId, nama, harga, addons: [{id,nama,harga}], qty }

// ==============================
// Util
// ==============================
function formatRupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ==============================
// Cart Drawer — ada di semua halaman
// ==============================
const cartToggle = document.getElementById("cartToggle");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartClose = document.getElementById("cartClose");
const cartCountEl = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const cartCustomerLabelEl = document.getElementById("cartCustomerLabel");
const subtotalValueEl = document.getElementById("subtotalValue");
const taxValueEl = document.getElementById("taxValue");
const totalValueEl = document.getElementById("totalValue");
const checkoutBtn = document.getElementById("checkoutBtn");
const cartClearBtn = document.getElementById("cartClear");

function openCart() {
  if (cartDrawer) cartDrawer.classList.add("open");
  if (cartOverlay) cartOverlay.classList.add("show");
}

function closeCart() {
  if (cartDrawer) cartDrawer.classList.remove("open");
  if (cartOverlay) cartOverlay.classList.remove("show");
}

if (cartToggle) {
  cartToggle.addEventListener("click", () => {
    renderCart();
    openCart();
  });
}
if (cartClose) cartClose.addEventListener("click", closeCart);
if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

function calcTotals() {
  let subtotal = 0;
  cart.forEach(line => {
    const addonsTotal = (line.addons || []).reduce((s, a) => s + a.harga, 0);
    subtotal += (line.harga + addonsTotal) * line.qty;
  });
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

function renderCart() {
  if (!cartItemsEl) return; // aman jika elemen keranjang tidak ada di halaman ini

  const totalQty = cart.reduce((sum, l) => sum + l.qty, 0);
  if (cartCountEl) cartCountEl.textContent = totalQty;

  // Nama pelanggan yang tersimpan (diisi dari halaman Pelanggan)
  if (cartCustomerLabelEl) {
    const name = loadCustomerName();
    cartCustomerLabelEl.textContent = name
      ? `Atas nama: ${escapeHtml(name)}`
      : "Nama pelanggan belum diisi";
  }

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty" id="cartEmpty">Belum ada pesanan. Yuk tambahkan menu favoritmu.</p>`;
  } else {
    cartItemsEl.innerHTML = cart.map((line, index) => `
      <div class="cart-line">
        <span class="cart-line-qty">${line.qty}x</span>
        <div class="cart-line-info">
          <div class="cart-line-name">
            <span>${escapeHtml(line.nama)}</span>
            <span class="cart-line-price">${formatRupiah(line.harga * line.qty)}</span>
          </div>
          ${(line.addons || []).map(a => `
            <div class="cart-line-addon">
              <span>+ ${escapeHtml(a.nama)}</span>
              <span>${formatRupiah(a.harga * line.qty)}</span>
            </div>
          `).join("")}
          <button type="button" data-index="${index}" class="line-remove-btn">Hapus</button>
        </div>
      </div>
    `).join("");

    cartItemsEl.querySelectorAll(".line-remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        cart.splice(Number(btn.getAttribute("data-index")), 1);
        saveCart(cart);
        renderCart();
      });
    });
  }

  const { subtotal, tax, total } = calcTotals();
  if (subtotalValueEl) subtotalValueEl.textContent = formatRupiah(subtotal);
  if (taxValueEl) taxValueEl.textContent = formatRupiah(tax);
  if (totalValueEl) totalValueEl.textContent = formatRupiah(total);
  if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
}

if (cartClearBtn) {
  cartClearBtn.addEventListener("click", () => {
    cart = [];
    saveCart(cart);
    renderCart();
  });
}

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;
    const { total } = calcTotals();
    const name = loadCustomerName() || "Pelanggan";
    alert(`Checkout berhasil atas nama ${name}! Total pembayaran: ${formatRupiah(total)}`);
    cart = [];
    saveCart(cart);
    renderCart();
    closeCart();
  });
}

function addToCart(item, selectedAddons) {
  const addonKey = selectedAddons.map(a => a.id).sort().join(",");
  const existing = cart.find(line =>
    line.menuId === item.id &&
    (line.addons || []).map(a => a.id).sort().join(",") === addonKey
  );
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ menuId: item.id, nama: item.nama, harga: item.harga, addons: selectedAddons, qty: 1 });
  }
  saveCart(cart);
  renderCart();
}

// ==============================
// Halaman Menu (menu.html)
// ==============================
const menuGrid = document.getElementById("menuGrid");
if (menuGrid) {
  let activeCategory = "Semua";
  const catButtons = document.querySelectorAll(".cat-btn");

  function renderMenu() {
    const filtered = activeCategory === "Semua"
      ? MENU
      : MENU.filter(item => item.kategori === activeCategory);

    menuGrid.innerHTML = filtered.map(item => `
      <div class="menu-card" data-id="${item.id}">
        <img class="menu-card-img" src="${item.gambar}" alt="${escapeHtml(item.nama)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
        <div class="menu-card-body">
          <h3>${escapeHtml(item.nama)}</h3>
          <p class="desc">${escapeHtml(item.deskripsi)}</p>
          <div class="price">${formatRupiah(item.harga)}</div>
          ${item.addons.length ? `
            <div class="addon-check-list">
              ${item.addons.map(addon => `
                <label class="addon-check">
                  <input type="checkbox" class="addon-toggle" data-addon="${addon.id}">
                  ${escapeHtml(addon.nama)} (+${formatRupiah(addon.harga)})
                </label>
              `).join("")}
            </div>
          ` : ""}
          <button class="add-btn" data-id="${item.id}">+ Tambah</button>
        </div>
      </div>
    `).join("");

    menuGrid.querySelectorAll(".add-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const item = MENU.find(m => m.id === id);
        const card = btn.closest(".menu-card");
        const checkedAddonIds = Array.from(card.querySelectorAll(".addon-toggle:checked")).map(cb => cb.getAttribute("data-addon"));
        const selectedAddons = item.addons.filter(a => checkedAddonIds.includes(a.id));
        addToCart(item, selectedAddons);
        card.querySelectorAll(".addon-toggle").forEach(cb => cb.checked = false);
        openCart();
      });
    });
  }

  catButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      catButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-cat");
      renderMenu();
    });
  });

  renderMenu();
}

// ==============================
// Halaman Add-ons (addons.html)
// ==============================
const addonsGrid = document.getElementById("addonsGrid");
if (addonsGrid) {
  // Kumpulkan semua add-on unik beserta menu yang memilikinya
  const addonMap = new Map();
  MENU.forEach(item => {
    item.addons.forEach(addon => {
      if (!addonMap.has(addon.id)) {
        addonMap.set(addon.id, { nama: addon.nama, harga: addon.harga, menus: [] });
      }
      addonMap.get(addon.id).menus.push(item.nama);
    });
  });

  const addonEntries = Array.from(addonMap.values());

  addonsGrid.innerHTML = addonEntries.map(addon => `
    <div class="addon-card">
      <h3>${escapeHtml(addon.nama)}</h3>
      <div class="addon-price">+${formatRupiah(addon.harga)}</div>
      <p class="addon-applies">Tersedia untuk:</p>
      <ul class="addon-menu-list">
        ${addon.menus.map(m => `<li>${escapeHtml(m)}</li>`).join("")}
      </ul>
    </div>
  `).join("");
}

// ==============================
// Halaman Pelanggan (pelanggan.html)
// ==============================
const customerForm = document.getElementById("customerForm");
if (customerForm) {
  const nameInput = document.getElementById("customerNameInput");
  const feedbackEl = document.getElementById("customerFeedback");
  const currentNameEl = document.getElementById("customerCurrentName");

  function refreshCurrentCustomer() {
    const name = loadCustomerName();
    if (currentNameEl) currentNameEl.textContent = name || "Belum diisi";
  }

  nameInput.value = loadCustomerName();
  refreshCurrentCustomer();

  customerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    saveCustomerName(name);
    refreshCurrentCustomer();
    renderCart();

    if (feedbackEl) {
      feedbackEl.hidden = false;
      setTimeout(() => { feedbackEl.hidden = true; }, 2500);
    }
  });
}

// ==============================
// Init umum
// ==============================
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

renderCart();
