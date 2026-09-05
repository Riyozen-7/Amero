/* ============================================
   AMERO — Premium Brand Website
   JavaScript — Cart, Checkout, Interactions
   ============================================ */
 
// ---------- PRODUCT DATA ----------
const products = [
  {
    id: 1,
    name: 'Premium Old Money Seersucker Striped Shirt',
    desc: 'Chest 46 · Length 28 · Old-money striped seersucker weave. Quality 9.5/10.',
    price: 750,
    icon: 'fa-solid fa-shirt',
    img: 'images/product-1/front.jpg.jpeg',
    images: [
      'images/product-1/front.jpg.jpeg',
      'images/product-1/back.jpg.jpeg',
      'images/product-1/side.jpg.jpeg'
    ],
    sizes: [
      { size: 'L/XXL', stock: 1 }
    ],
  },
  {
    id: 2,
    name: 'Premium Puff-Printed T-Shirt',
    desc: '280 GSM · 100% premium feel puff-print tee.',
    price: 450,
    icon: 'fa-solid fa-shirt',
    img: 'images/product-2/front.jpg.jpeg',
    images: [
      'images/product-2/front.jpg.jpeg',
      'images/product-2/back.jpg.jpeg',
      'images/product-2/side.jpg.jpeg'
    ],
    sizes: [
      { size: 'M', stock: 1 },
      { size: 'L', stock: 1 },
      { size: 'XL', stock: 1 }
    ],
  },
  {
    id: 3,
    name: 'Premium Puff-Printed T-Shirt — Design II',
    desc: '280 GSM · 100% premium feel puff-print tee.',
    price: 450,
    icon: 'fa-solid fa-shirt',
    img: 'images/product-3/front.jpg.jpeg',
    images: [
      'images/product-3/front.jpg.jpeg',
      'images/product-3/back.jpg.jpeg',
      'images/product-3/side.jpg.jpeg'
    ],
    sizes: [
      { size: 'M', stock: 1 },
      { size: 'L', stock: 1 },
      { size: 'XL', stock: 1 }
    ],
  },
  {
    id: 4,
    name: 'Premium Puff-Printed T-Shirt — Spider-Man',
    desc: '280 GSM · 100% premium feel puff-print tee, Spider-Man design.',
    price: 450,
    icon: 'fa-solid fa-shirt',
    img: 'images/product-4/front.jpg',
    images: [
      'images/product-4/front.jpg',
      'images/product-4/back.jpg',
      'images/product-4/side.jpg'
    ],
    sizes: [
      { size: 'M', stock: 1 },
      { size: 'L', stock: 1 },
      { size: 'XL', stock: 1 }
    ],
  },
];
 
const CURRENCY = '৳';
 
// Delivery fees by area — used for the cart's displayed total.
// Matches the options in the checkout form's "Delivery Area" select.
const DELIVERY_FEES = {
  '': 0,
  chittagong: 70,
  outside: 120,
};
 
// ---------- STATE ----------
let cart = [];
const selectedSizes = {};
let selectedDeliveryArea = ''; // kept in sync with the checkout form's select
 
// ---------- STOCK ----------
function stockRemaining(productId, size) {
  const product = products.find(p => p.id === productId);
  if (!product) return 0;
 
  const sizeInfo = product.sizes.find(s => s.size === size);
  if (!sizeInfo) return 0;
 
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
const billingShipping = document.getElementById('billingShipping');
const billingTotal    = document.getElementById('billingTotal');
const checkoutForm    = document.getElementById('checkoutForm');
const menuToggle      = document.getElementById('menuToggle');
const navLinks        = document.getElementById('navLinks');
const navbar          = document.getElementById('navbar');
 
// ============================================
// PRODUCT IMAGE GALLERY
// ============================================
 
let galleryProductId = null;
let galleryIndex = 0;
 
const galleryModal = document.createElement('div');
galleryModal.id = 'productGalleryModal';
galleryModal.style.cssText = `
  display: none;
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0,0,0,0.9);
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
`;
 
galleryModal.innerHTML = `
  <div style="position: relative; width: min(900px, 95vw); max-height: 95vh; text-align: center;">
    <button id="galleryClose" style="position: absolute; right: 0; top: -45px; width: 40px; height: 40px; border: 0; border-radius: 50%; background: rgba(255,255,255,0.15); color: #fff; font-size: 28px; cursor: pointer;">&times;</button>
    <button id="galleryPrev" style="position: absolute; left: 5px; top: 45%; width: 45px; height: 45px; border: 0; border-radius: 50%; background: rgba(0,0,0,0.55); color: #fff; font-size: 24px; cursor: pointer;">&#10094;</button>
    <img id="galleryMain" src="" alt="" style="max-width: 100%; max-height: 72vh; object-fit: contain; border-radius: 12px;">
    <button id="galleryNext" style="position: absolute; right: 5px; top: 45%; width: 45px; height: 45px; border: 0; border-radius: 50%; background: rgba(0,0,0,0.55); color: #fff; font-size: 24px; cursor: pointer;">&#10095;</button>
    <div id="galleryThumbs" style="display: flex; gap: 8px; justify-content: center; overflow-x: auto; margin-top: 12px; padding: 4px;"></div>
    <div id="galleryName" style="color: #fff; margin-top: 10px; font-size: 16px;"></div>
  </div>
`;
 
document.body.appendChild(galleryModal);
 
function updateGallery() {
  const product = products.find(p => p.id === galleryProductId);
  if (!product || !product.images || product.images.length === 0) return;
 
  const main = document.getElementById('galleryMain');
  const thumbs = document.getElementById('galleryThumbs');
  const name = document.getElementById('galleryName');
 
  main.src = product.images[galleryIndex];
  main.alt = product.name;
  name.textContent = product.name;
 
  thumbs.innerHTML = product.images.map((src, i) => `
    <button onclick="selectGalleryImage(${i})" style="width:60px; height:60px; padding:0; border:2px solid ${i === galleryIndex ? '#fff' : 'transparent'}; background:none; border-radius:7px; overflow:hidden; cursor:pointer; flex:none;">
      <img src="${src}" alt="" style="width:100%; height:100%; object-fit:cover;">
    </button>
  `).join('');
}
 
function openGallery(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || !product.images || !product.images.length) return;
 
  galleryProductId = productId;
  galleryIndex = 0;
  updateGallery();
  galleryModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
 
function closeGallery() {
  galleryModal.style.display = 'none';
  document.body.style.overflow = '';
}
 
function selectGalleryImage(index) {
  const product = products.find(p => p.id === galleryProductId);
  if (!product) return;
  if (index < 0 || index >= product.images.length) return;
  galleryIndex = index;
  updateGallery();
}
 
function nextGalleryImage() {
  const product = products.find(p => p.id === galleryProductId);
  if (!product || !product.images.length) return;
  galleryIndex = (galleryIndex + 1) % product.images.length;
  updateGallery();
}
 
function previousGalleryImage() {
  const product = products.find(p => p.id === galleryProductId);
  if (!product || !product.images.length) return;
  galleryIndex = (galleryIndex - 1 + product.images.length) % product.images.length;
  updateGallery();
}
 
document.getElementById('galleryClose').addEventListener('click', closeGallery);
document.getElementById('galleryNext').addEventListener('click', nextGalleryImage);
document.getElementById('galleryPrev').addEventListener('click', previousGalleryImage);
 
galleryModal.addEventListener('click', function (e) {
  if (e.target === galleryModal) closeGallery();
});
 
document.addEventListener('keydown', function (e) {
  if (galleryModal.style.display !== 'flex') return;
  if (e.key === 'Escape') closeGallery();
  if (e.key === 'ArrowRight') nextGalleryImage();
  if (e.key === 'ArrowLeft') previousGalleryImage();
});
 
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
      return `<button class="size-chip${isSelected ? ' selected' : ''}" onclick="selectSize(${p.id}, '${s.size}')" ${remaining <= 0 ? 'disabled' : ''}>${s.size}</button>`;
    }).join('');
 
    const anyStockLeft = p.sizes.some(s => stockRemaining(p.id, s.size) > 0);
    const media = p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">` : `<i class="${p.icon}"></i>`;
    const imageCount = p.images ? p.images.length : 0;
 
    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-img" ${imageCount ? `onclick="openGallery(${p.id})" style="cursor:pointer;"` : ''}>
          ${media}
          ${imageCount > 1 ? `<span style="position:absolute; left:50%; bottom:10px; transform:translateX(-50%); background:rgba(0,0,0,.7); color:#fff; padding:6px 10px; border-radius:20px; font-size:12px; white-space:nowrap;">View ${imageCount} photos</span>` : ''}
        </div>
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
// ADD TO CART
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
      size: size,
      name: product.name,
      desc: product.desc,
      price: product.price,
      icon: product.icon,
      img: product.img,
      qty: 1,
    });
  }
 
  updateCart();
  renderProducts();
 
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
// UPDATE CART
// ============================================
function updateCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  navCartCount.textContent = totalItems;
 
  if (cart.length === 0) {
    cartEmptyEl.classList.add('visible');
    cartItemsEl.style.display = 'none';
  } else {
    cartEmptyEl.classList.remove('visible');
    cartItemsEl.style.display = 'flex';
  }
 
  cartItemsEl.innerHTML = cart.map(item => {
    const media = item.img
      ? `<img src="${item.img}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`
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
 
  updateBilling();
}
 
// ============================================
// UPDATE BILLING (no tax — subtotal + delivery only)
// ============================================
function updateBilling() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = subtotal > 0 ? (DELIVERY_FEES[selectedDeliveryArea] || 0) : 0;
  const total = subtotal + deliveryFee;
 
  billingSubtotal.textContent = `${CURRENCY}${subtotal.toFixed(0)}`;
  billingShipping.textContent = deliveryFee > 0 ? `${CURRENCY}${deliveryFee}` : 'Free';
  billingTotal.textContent = `${CURRENCY}${total.toFixed(0)}`;
}
 
// Keep the cart's shipping/total in sync as soon as the customer
// picks a delivery area on the checkout form below.
const deliveryAreaEl = document.getElementById('deliveryArea');
if (deliveryAreaEl) {
  deliveryAreaEl.addEventListener('change', () => {
    selectedDeliveryArea = deliveryAreaEl.value;
    updateBilling();
  });
}
 
// ============================================
// CHECKOUT FORM — simple confirmation, no WhatsApp
// ============================================
checkoutForm.addEventListener('submit', function (e) {
  e.preventDefault();
 
  const name = document.getElementById('custName');
  const phone = document.getElementById('custPhone');
  const address = document.getElementById('custAddress');
  const deliveryArea = document.getElementById('deliveryArea');
 
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
 
  // Phone
  const phonePattern = /^01[3-9]\d{8}$/;
  const cleanPhone = phone.value.trim().replace(/\s+/g, '');
  if (!phonePattern.test(cleanPhone)) {
    phone.classList.add('error');
    document.getElementById('errPhone').classList.add('visible');
    valid = false;
  } else {
    phone.classList.remove('error');
    document.getElementById('errPhone').classList.remove('visible');
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
 
  // Delivery area
  if (!deliveryArea || deliveryArea.value === '') {
    if (deliveryArea) deliveryArea.classList.add('error');
    valid = false;
  } else if (deliveryArea) {
    deliveryArea.classList.remove('error');
  }
 
  if (!valid) return;
 
  if (cart.length === 0) {
    alert('Your cart is empty. Please add a product first.');
    return;
  }
 
  // Show a plain thank-you confirmation — no WhatsApp redirect.
  // You'll need to check in with the customer manually using the
  // name, phone, and address they entered above.
  document.getElementById('confirmName').textContent = name.value.trim();
  document.getElementById('confirmPhone').textContent = cleanPhone;
 
  checkoutForm.style.display = 'none';
  document.getElementById('orderConfirmation').classList.add('visible');
 
  cart = [];
  updateCart();
});
 
// ============================================
// RESET CHECKOUT
// ============================================
function resetCheckout() {
  checkoutForm.reset();
  checkoutForm.style.display = 'flex';
  selectedDeliveryArea = '';
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
// ACTIVE NAV LINK
// ============================================
const sections = document.querySelectorAll('section[id]');
 
function setActiveNav() {
  const scrollY = window.scrollY + 100;
 
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
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
 
