/* ============================================
   AMERO — Premium Brand Website
   JavaScript — Cart, Checkout, Interactions
   ============================================ */

// ---------- PRODUCT DATA ----------
// To add a new product later: copy one of these objects, give it a new
// unique id, and fill in name/desc/price/img/sizes.
// img: set to a path like 'images/shirt-1.jpg' once you upload photos —
// until then it falls back to the icon shown below.
const products = [
  {
    id: 1,
    name: 'Premium Old Money Seersucker Striped Shirt',
    desc: 'Chest 46 · Length 28 · Old-money striped seersucker weave. Quality 9.5/10.',
    price: 750,
    icon: 'fa-solid fa-shirt',
    img: images/front1.jpg.jpeg,
    sizes: [
      { size: 'L/XXL', stock: 1 },
    ],
  },
  {
    id: 2,
    name: 'Premium Puff-Printed T-Shirt',
    desc: '280 GSM · 100% premium feel puff-print tee.',
    price: 450,
    icon: 'fa-solid fa-shirt',
    img: images/front.jpg.jpeg,
    sizes: [
      { size: 'M', stock: 1 },
      { size: 'L', stock: 1 },
      { size: 'XL', stock: 1 },
    ],
  },
  {
    id: 3,
    name: 'Premium Puff-Printed T-Shirt — Design II',
    desc: '280 GSM · 100% premium feel puff-print tee.',
    price: 450,
    icon: 'fa-solid fa-shirt',
    img: images/font.jpg.jpeg,
    sizes: [
      { size: 'M', stock: 1 },
      { size: 'L', stock: 1 },
      { size: 'XL', stock: 1 },
    ],
  },
  {
    id: 4,
    name: 'Premium Puff-Printed T-Shirt — Spider-Man',
    desc: '280 GSM · 100% premium feel puff-print tee, Spider-Man design.',
    price: 450,
    icon: 'fa-solid fa-shirt',
    img: null,
    sizes: [
      { size: 'M', stock: 1 },
      { size: 'L', stock: 1 },
      { size: 'XL', stock: 1 },
    ],
  },
];

const CURRENCY = '৳';

// ---------- STATE ----------
let cart = []; // each item: { id, size, name, desc, price, icon, img, qty }
const selectedSizes = {}; // productId -> currently chosen size (before adding to cart)

function stockRemaining(productId, size) {
  const product = products.find(p => p.id === productId);
  const sizeInfo = product.sizes.find(s => s.size === size);
  const inCart = cart
    .filter(item => item.id === productId && item.size === size)
    .reduce((sum, item) => sum + item.qty, 0);
  return sizeInfo.stock - inCart;
}

// ---------- DOM REFERENCES ----------
const productsGrid    = document.getElementById('productsGrid');
const cartItemsEl     = document.getElementById('cartItems');
const cartEmptyEl     = document.getElementById('cartEmpty');
const navCartCount    = document.getElementById('navCartCount');
const billingSubtotal = document.getElementById('billingSubtotal');
const billingTax      = document.getElementById('billingTax');
const billingShipping = document.getElementById('billingShipping');
const billingTotal    = document.getElementById('billingTotal');
const checkoutForm    = document.getElementById('checkoutForm');
const menuToggle      = document.getElementById('menuToggle');
const navLinks        = document.getElementById('navLinks');
const navbar          = document.getElementById('navbar');

// ============================================
// RENDER PRODUCTS
// ============================================
function renderProducts() {
  productsGrid.innerHTML = products.map(p => {
    if (!selectedSizes[p.id]) {
      const firstAvailable = p.sizes.find(s => stockRemaining(p.id, s.size) > 0);
      selectedSizes[p.id] = firstAvailable ? firstAvailable.size : p.sizes[0].size;
    }

    const chips = p.sizes.map(s => {
      const remaining = stockRemaining(p.id, s.size);
      const isSelected = selectedSizes[p.id] === s.size;
      return `<button
        class="size-chip${isSelected ? ' selected' : ''}"
        onclick="selectSize(${p.id}, '${s.size}')"
        ${remaining <= 0 ? 'disabled' : ''}
      >${s.size}</button>`;
    }).join('');

    const anyStockLeft = p.sizes.some(s => stockRemaining(p.id, s.size) > 0);
    const media = p.img
      ? `<img src="${p.img}" alt="${p.name}">`
      : `<i class="${p.icon}"></i>`;

    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-img">${media}</div>
        <div class="product-info">
          <span class="stock-badge">Only 1 piece per size</span>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          <span class="size-label">Size</span>
          <div class="size-chips">${chips}</div>
          <div class="product-bottom">
            <span class="product-price">${CURRENCY}${p.price.toFixed(0)}</span>
            <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id})" ${anyStockLeft ? '' : 'disabled'}>
              ${anyStockLeft ? 'Add to Cart' : 'Sold Out'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function selectSize(productId, size) {
  selectedSizes[productId] = size;
  renderProducts();
}

// ============================================
// CART FUNCTIONS
// ============================================
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const size = selectedSizes[productId];
  if (stockRemaining(productId, size) <= 0) return;

  const existing = cart.find(item => item.id === productId && item.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      size,
      name: product.name,
      desc: product.desc,
      price: product.price,
      icon: product.icon,
      img: product.img,
      qty: 1,
    });
  }

  updateCart();
  renderProducts(); // reflect updated stock on the size chips

  // Brief visual feedback — scroll to cart
  document.getElementById('cart').scrollIntoView({ behavior: 'smooth' });
}

function removeFromCart(productId, size) {
  cart = cart.filter(item => !(item.id === productId && item.size === size));
  updateCart();
  renderProducts();
}

function changeQty(productId, size, delta) {
  const item = cart.find(i => i.id === productId && i.size === size);
  if (!item) return;

  if (delta > 0 && stockRemaining(productId, size) <= 0) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId, size);
    return;
  }

  updateCart();
  renderProducts();
}

// ============================================
// UPDATE CART UI & BILLING
// ============================================
function updateCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  navCartCount.textContent = totalItems;

  // Toggle empty state
  if (cart.length === 0) {
    cartEmptyEl.classList.add('visible');
    cartItemsEl.style.display = 'none';
  } else {
    cartEmptyEl.classList.remove('visible');
    cartItemsEl.style.display = 'flex';
  }

  // Render items
  cartItemsEl.innerHTML = cart.map(item => {
    const media = item.img
      ? `<img src="${item.img}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`
      : `<i class="${item.icon}"></i>`;
    const canIncrease = stockRemaining(item.id, item.size) > 0;
    return `
    <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
      <div class="cart-item-img">${media}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name} — Size ${item.size}</div>
        <div class="cart-item-price">${CURRENCY}${item.price.toFixed(0)} each</div>
        <div class="cart-item-subtotal">Subtotal: ${CURRENCY}${(item.price * item.qty).toFixed(0)}</div>
      </div>
      <div class="cart-item-actions">
        <button class="qty-btn" onclick="changeQty(${item.id}, '${item.size}', -1)" aria-label="Decrease quantity">&minus;</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, '${item.size}', 1)" aria-label="Increase quantity" ${canIncrease ? '' : 'disabled'}>+</button>
        <button class="remove-btn" onclick="removeFromCart(${item.id}, '${item.size}')" aria-label="Remove item">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `;
  }).join('');

  // Billing
  updateBilling();
}

function updateBilling() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxRate  = 0.08;
  const tax      = subtotal * taxRate;
  const shipping = subtotal > 0 ? 0 : 0; // Free shipping
  const total    = subtotal + tax + shipping;

  billingSubtotal.textContent = `${CURRENCY}${subtotal.toFixed(0)}`;
  billingTax.textContent      = `${CURRENCY}${tax.toFixed(0)}`;
  billingShipping.textContent = subtotal > 0 ? 'Free' : `${CURRENCY}0`;
  billingTotal.textContent    = `${CURRENCY}${total.toFixed(0)}`;
}

// ============================================
// CHECKOUT FORM
// ============================================
checkoutForm.addEventListener('submit', function (e) {
  e.preventDefault();

  // Validate
  const name    = document.getElementById('custName');
  const email   = document.getElementById('custEmail');
  const address = document.getElementById('custAddress');
  let valid = true;

  // Name
  if (name.value.trim() === '') {
    name.classList.add('error');
    document.getElementById('errName').classList.add('visible');
    valid = false;
  } else {
    name.classList.remove('error');
    document.getElementById('errName').classList.remove('visible');
  }

  // Email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    email.classList.add('error');
    document.getElementById('errEmail').classList.add('visible');
    valid = false;
  } else {
    email.classList.remove('error');
    document.getElementById('errEmail').classList.remove('visible');
  }

  // Address
  if (address.value.trim() === '') {
    address.classList.add('error');
    document.getElementById('errAddress').classList.add('visible');
    valid = false;
  } else {
    address.classList.remove('error');
    document.getElementById('errAddress').classList.remove('visible');
  }

  if (!valid) return;

  // Show confirmation
  document.getElementById('confirmName').textContent  = name.value.trim();
  document.getElementById('confirmEmail').textContent = email.value.trim();

  checkoutForm.style.display = 'none';
  document.getElementById('orderConfirmation').classList.add('visible');

  // Reset cart
  cart = [];
  updateCart();
});

// Reset checkout to form view
function resetCheckout() {
  checkoutForm.reset();
  checkoutForm.style.display = 'flex';
  document.getElementById('orderConfirmation').classList.remove('visible');
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// MOBILE MENU
// ============================================
menuToggle.addEventListener('click', function () {
  this.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function () {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
window.addEventListener('scroll', function () {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ============================================
// ACTIVE NAV LINK ON SCROLL
// ============================================
const sections = document.querySelectorAll('section[id]');

function setActiveNav() {
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');

    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
}

window.addEventListener('scroll', setActiveNav);

// ============================================
// INIT
// ============================================
renderProducts();
updateCart();
