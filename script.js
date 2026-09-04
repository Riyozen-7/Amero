```javascript
/* ============================================
   AMERO — Premium Brand Website
   JavaScript — Cart, Checkout, Product Gallery
   ============================================ */


/* ============================================
   PRODUCT DATA
   ============================================ */

const products = [
  {
    id: 1,
    name: 'Premium Old Money Seersucker Striped Shirt',
    desc: 'Chest 46 · Length 28 · Old-money striped seersucker weave. Quality 9.5/10.',
    price: 750,
    icon: 'fa-solid fa-shirt',

    // Add your product photos here
    images: [
      'images/old2/front.jpg',
      'images/old2/back.jpg',
      'images/old2/close.jpg'
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

    images: [
      'images/tsh1/front.jpg',
      'images/tsh1/back.jpg',
      'images/tsh1/close.jpg'
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

    images: [
      'images/tsh2/front.jpg',
      'images/tsh2/back.jpg',
      'images/tsh2/close.jpg'
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

    images: [
      'images/product-4/front.jpg',
      'images/product-4/back.jpg',
      'images/product-4/close.jpg'
    ],

    sizes: [
      { size: 'M', stock: 1 },
      { size: 'L', stock: 1 },
      { size: 'XL', stock: 1 }
    ],
  },
];


const CURRENCY = '৳';


/* ============================================
   STATE
   ============================================ */

let cart = [];

const selectedSizes = {};

let galleryProductId = null;
let galleryImageIndex = 0;


/* ============================================
   HELPER — GET FIRST PRODUCT IMAGE
   ============================================ */

function getProductImage(product) {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }

  return null;
}


/* ============================================
   STOCK
   ============================================ */

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


/* ============================================
   DOM REFERENCES
   ============================================ */

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


/* ============================================
   PRODUCT GALLERY STYLES
   ============================================ */

const galleryStyles = document.createElement('style');

galleryStyles.textContent = `
  .product-img {
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }

  .product-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.35s ease;
  }

  .product-img:hover img {
    transform: scale(1.04);
  }

  .view-product-hint {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.75);
    color: white;
    padding: 7px 13px;
    border-radius: 20px;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
  }

  .product-gallery-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.88);
    z-index: 9999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .product-gallery-modal.active {
    display: flex;
  }

  .gallery-box {
    width: min(900px, 95vw);
    max-height: 95vh;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .gallery-main {
    width: 100%;
    height: min(70vh, 650px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gallery-main img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 12px;
  }

  .gallery-close {
    position: absolute;
    top: -10px;
    right: -5px;
    width: 42px;
    height: 42px;
    border: none;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 2;
  }

  .gallery-close:hover {
    background: rgba(255,255,255,0.28);
  }

  .gallery-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    color: white;
    font-size: 22px;
    cursor: pointer;
  }

  .gallery-arrow:hover {
    background: rgba(255,255,255,0.3);
  }

  .gallery-prev {
    left: 10px;
  }

  .gallery-next {
    right: 10px;
  }

  .gallery-thumbnails {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    overflow-x: auto;
    max-width: 100%;
    padding: 5px;
  }

  .gallery-thumb {
    width: 65px;
    height: 65px;
    flex-shrink: 0;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    padding: 0;
    background: transparent;
    cursor: pointer;
  }

  .gallery-thumb.active {
    border-color: white;
  }

  .gallery-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .gallery-title {
    color: white;
    font-size: 18px;
    margin-top: 12px;
    text-align: center;
  }

  @media (max-width: 600px) {
    .gallery-main {
      height: 65vh;
    }

    .gallery-arrow {
      width: 40px;
      height: 40px;
    }

    .gallery-prev {
      left: 0;
    }

    .gallery-next {
      right: 0;
    }

    .gallery-thumb {
      width: 55px;
      height: 55px;
    }
  }
`;

document.head.appendChild(galleryStyles);


/* ============================================
   CREATE GALLERY MODAL
   ============================================ */

const galleryModal = document.createElement('div');

galleryModal.className = 'product-gallery-modal';

galleryModal.innerHTML = `
  <div class="gallery-box">

    <button class="gallery-close" onclick="closeGallery()" aria-label="Close">
      &times;
    </button>

    <div class="gallery-main">
      <button class="gallery-arrow gallery-prev" onclick="previousGalleryImage()" aria-label="Previous image">
        &#10094;
      </button>

      <img id="galleryMainImage" src="" alt="Product image">

      <button class="gallery-arrow gallery-next" onclick="nextGalleryImage()" aria-label="Next image">
        &#10095;
      </button>
    </div>

    <div class="gallery-thumbnails" id="galleryThumbnails"></div>

    <div class="gallery-title" id="galleryTitle"></div>

  </div>
`;

document.body.appendChild(galleryModal);


/* ============================================
   OPEN PRODUCT GALLERY
   ============================================ */

function openGallery(productId) {
  const product = products.find(p => p.id === productId);

  if (!product || !product.images || product.images.length === 0) {
    return;
  }

  galleryProductId = productId;
  galleryImageIndex = 0;

  updateGallery();

  galleryModal.classList.add('active');

  document.body.style.overflow = 'hidden';
}


/* ============================================
   UPDATE GALLERY
   ============================================ */

function updateGallery() {
  const product = products.find(p => p.id === galleryProductId);

  if (!product || !product.images || product.images.length === 0) {
    return;
  }

  const mainImage = document.getElementById('galleryMainImage');
  const thumbnails = document.getElementById('galleryThumbnails');
  const title = document.getElementById('galleryTitle');

  mainImage.src = product.images[galleryImageIndex];
  mainImage.alt = product.name;

  title.textContent = product.name;

  thumbnails.innerHTML = product.images.map((image, index) => `
    <button
      class="gallery-thumb ${index === galleryImageIndex ? 'active' : ''}"
      onclick="selectGalleryImage(${index})"
      aria-label="View image ${index + 1}"
    >
      <img src="${image}" alt="${product.name} image ${index + 1}">
    </button>
  `).join('');
}


/* ============================================
   SELECT GALLERY IMAGE
   ============================================ */

function selectGalleryImage(index) {
  const product = products.find(p => p.id === galleryProductId);

  if (!product) return;

  if (index < 0 || index >= product.images.length) return;

  galleryImageIndex = index;

  updateGallery();
}


/* ============================================
   NEXT IMAGE
   ============================================ */

function nextGalleryImage() {
  const product = products.find(p => p.id === galleryProductId);

  if (!product || !product.images.length) return;

  galleryImageIndex =
    (galleryImageIndex + 1) % product.images.length;

  updateGallery();
}


/* ============================================
   PREVIOUS IMAGE
   ============================================ */

function previousGalleryImage() {
  const product = products.find(p => p.id === galleryProductId);

  if (!product || !product.images.length) return;

  galleryImageIndex =
    (galleryImageIndex - 1 + product.images.length) %
    product.images.length;

  updateGallery();
}


/* ============================================
   CLOSE GALLERY
   ============================================ */

function closeGallery() {
  galleryModal.classList.remove('active');

  document.body.style.overflow = '';

  galleryProductId = null;
  galleryImageIndex = 0;
}


/* ============================================
   CLOSE GALLERY WHEN CLICKING BACKGROUND
   ============================================ */

galleryModal.addEventListener('click', function(e) {
  if (e.target === galleryModal) {
    closeGallery();
  }
});


/* ============================================
   KEYBOARD CONTROLS FOR GALLERY
   ============================================ */

document.addEventListener('keydown', function(e) {
  if (!galleryModal.classList.contains('active')) return;

  if (e.key === 'Escape') {
    closeGallery();
  }

  if (e.key === 'ArrowRight') {
    nextGalleryImage();
  }

  if (e.key === 'ArrowLeft') {
    previousGalleryImage();
  }
});


/* ============================================
   RENDER PRODUCTS
   ============================================ */

function renderProducts() {

  productsGrid.innerHTML = products.map(p => {

    if (!selectedSizes[p.id]) {

      const firstAvailable =
        p.sizes.find(
          s => stockRemaining(p.id, s.size) > 0
        );

      selectedSizes[p.id] =
        firstAvailable
          ? firstAvailable.size
          : p.sizes[0].size;
    }


    /* ---------- SIZE CHIPS ---------- */

    const chips = p.sizes.map(s => {

      const remaining =
        stockRemaining(p.id, s.size);

      const isSelected =
        selectedSizes[p.id] === s.size;

      return `
        <button
          class="size-chip${isSelected ? ' selected' : ''}"
          onclick="selectSize(${p.id}, '${s.size}')"
          ${remaining <= 0 ? 'disabled' : ''}
        >
          ${s.size}
        </button>
      `;

    }).join('');


    /* ---------- STOCK ---------- */

    const anyStockLeft =
      p.sizes.some(
        s => stockRemaining(p.id, s.size) > 0
      );


    /* ---------- PRODUCT IMAGE ---------- */

    const firstImage = getProductImage(p);

    const media = firstImage
      ? `
        <img
          src="${firstImage}"
          alt="${p.name}"
          loading="lazy"
        >

        ${
          p.images.length > 1
            ? `<span class="view-product-hint">
                 View ${p.images.length} photos
               </span>`
            : ''
        }
      `
      : `<i class="${p.icon}"></i>`;


    /* ---------- PRODUCT CARD ---------- */

    return `
      <div class="product-card" data-id="${p.id}">

        <div
          class="product-img"
          onclick="openGallery(${p.id})"
          role="button"
          tabindex="0"
          aria-label="View ${p.name}"
          onkeydown="if(event.key === 'Enter') openGallery(${p.id})"
        >
          ${media}
        </div>

        <div class="product-info">

          <span class="stock-badge">
            Only 1 piece per size
          </span>

          <h3 class="product-name">
            ${p.name}
          </h3>

          <p class="product-desc">
            ${p.desc}
          </p>

          <span class="size-label">
            Size
          </span>

          <div class="size-chips">
            ${chips}
          </div>

          <div class="product-bottom">

            <span class="product-price">
              ${CURRENCY}${p.price.toFixed(0)}
            </span>

            <button
              class="btn btn-primary btn-sm"
              onclick="addToCart(${p.id})"
              ${anyStockLeft ? '' : 'disabled'}
            >
              ${anyStockLeft ? 'Add to Cart' : 'Sold Out'}
            </button>

          </div>

        </div>

      </div>
    `;

  }).join('');
}


/* ============================================
   SELECT SIZE
   ============================================ */

function selectSize(productId, size) {

  selectedSizes[productId] = size;

  renderProducts();
}


/* ============================================
   ADD TO CART
   ============================================ */

function addToCart(productId) {

  const product =
    products.find(p => p.id === productId);

  if (!product) return;


  const size =
    selectedSizes[productId];

  if (!size) return;


  if (stockRemaining(productId, size) <= 0) {
    return;
  }


  const existing =
    cart.find(
      item =>
        item.id === productId &&
        item.size === size
    );


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

      // Cart uses the first product image
      img: getProductImage(product),

      qty: 1

    });

  }


  updateCart();

  renderProducts();


  /* Scroll to cart */

  document
    .getElementById('cart')
    .scrollIntoView({
      behavior: 'smooth'
    });
}


/* ============================================
   REMOVE FROM CART
   ============================================ */

function removeFromCart(productId, size) {

  cart = cart.filter(
    item =>
      !(
        item.id === productId &&
        item.size === size
      )
  );

  updateCart();

  renderProducts();
}


/* ============================================
   CHANGE QUANTITY
   ============================================ */

function changeQty(productId, size, delta) {

  const item =
    cart.find(
      i =>
        i.id === productId &&
        i.size === size
    );

  if (!item) return;


  if (
    delta > 0 &&
    stockRemaining(productId, size) <= 0
  ) {
    return;
  }


  item.qty += delta;


  if (item.qty <= 0) {

    removeFromCart(productId, size);

    return;
  }


  updateCart();

  renderProducts();
}


/* ============================================
   UPDATE CART UI
   ============================================ */

function updateCart() {

  const totalItems =
    cart.reduce(
      (sum, item) => sum + item.qty,
      0
    );


  navCartCount.textContent =
    totalItems;


  /* ---------- EMPTY CART ---------- */

  if (cart.length === 0) {

    cartEmptyEl.classList.add('visible');

    cartItemsEl.style.display = 'none';

  } else {

    cartEmptyEl.classList.remove('visible');

    cartItemsEl.style.display = 'flex';
  }


  /* ---------- CART ITEMS ---------- */

  cartItemsEl.innerHTML =
    cart.map(item => {

      const media = item.img

        ? `
          <img
            src="${item.img}"
            alt="${item.name}"
            style="
              width:100%;
              height:100%;
              object-fit:cover;
              border-radius:inherit;
            "
          >
        `

        : `<i class="${item.icon}"></i>`;


      const canIncrease =
        stockRemaining(
          item.id,
          item.size
        ) > 0;


      return `

        <div
          class="cart-item"
          data-id="${item.id}"
          data-size="${item.size}"
        >

          <div class="cart-item-img">
            ${media}
          </div>


          <div class="cart-item-details">

            <div class="cart-item-name">
              ${item.name} — Size ${item.size}
            </div>

            <div class="cart-item-price">
              ${CURRENCY}${item.price.toFixed(0)} each
            </div>

            <div class="cart-item-subtotal">
              Subtotal:
              ${CURRENCY}${(item.price * item.qty).toFixed(0)}
            </div>

          </div>


          <div class="cart-item-actions">

            <button
              class="qty-btn"
              onclick="changeQty(${item.id}, '${item.size}', -1)"
              aria-label="Decrease quantity"
            >
              &minus;
            </button>


            <span class="cart-item-qty">
              ${item.qty}
            </span>


            <button
              class="qty-btn"
              onclick="changeQty(${item.id}, '${item.size}', 1)"
              aria-label="Increase quantity"
              ${canIncrease ? '' : 'disabled'}
            >
              +
            </button>


            <button
              class="remove-btn"
              onclick="removeFromCart(${item.id}, '${item.size}')"
              aria-label="Remove item"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>

          </div>

        </div>

      `;

    }).join('');


  /* ---------- BILLING ---------- */

  updateBilling();
}


/* ============================================
   UPDATE BILLING
   ============================================ */

function updateBilling() {

  const subtotal =
    cart.reduce(
      (sum, item) =>
        sum + item.price * item.qty,
      0
    );


  const taxRate = 0.08;

  const tax =
    subtotal * taxRate;

  const shipping =
    subtotal > 0 ? 0 : 0;

  const total =
    subtotal + tax + shipping;


  billingSubtotal.textContent =
    `${CURRENCY}${subtotal.toFixed(0)}`;

  billingTax.textContent =
    `${CURRENCY}${tax.toFixed(0)}`;

  billingShipping.textContent =
    subtotal > 0
      ? 'Free'
      : `${CURRENCY}0`;

  billingTotal.textContent =
    `${CURRENCY}${total.toFixed(0)}`;
}


/* ============================================
   CHECKOUT FORM
   ============================================ */

checkoutForm.addEventListener(
  'submit',
  function(e) {

    e.preventDefault();


    /* ---------- VALIDATION ---------- */

    const name =
      document.getElementById('custName');

    const email =
      document.getElementById('custEmail');

    const address =
      document.getElementById('custAddress');


    let valid = true;


    /* ---------- NAME ---------- */

    if (name.value.trim() === '') {

      name.classList.add('error');

      document
        .getElementById('errName')
        .classList.add('visible');

      valid = false;

    } else {

      name.classList.remove('error');

      document
        .getElementById('errName')
        .classList.remove('visible');
    }


    /* ---------- EMAIL ---------- */

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(
        email.value.trim()
      )
    ) {

      email.classList.add('error');

      document
        .getElementById('errEmail')
        .classList.add('visible');

      valid = false;

    } else {

      email.classList.remove('error');

      document
        .getElementById('errEmail')
        .classList.remove('visible');
    }


    /* ---------- ADDRESS ---------- */

    if (address.value.trim() === '') {

      address.classList.add('error');

      document
        .getElementById('errAddress')
        .classList.add('visible');

      valid = false;

    } else {

      address.classList.remove('error');

      document
        .getElementById('errAddress')
        .classList.remove('visible');
    }


    if (!valid) return;


    /* ---------- SHOW CONFIRMATION ---------- */

    document
      .getElementById('confirmName')
      .textContent =
      name.value.trim();


    document
      .getElementById('confirmEmail')
      .textContent =
      email.value.trim();


    checkoutForm.style.display =
      'none';


    document
      .getElementById('orderConfirmation')
      .classList.add('visible');


    /* ---------- RESET CART ---------- */

    cart = [];

    updateCart();
  }
);


/* ============================================
   RESET CHECKOUT
   ============================================ */

function resetCheckout() {

  checkoutForm.reset();

  checkoutForm.style.display =
    'flex';


  document
    .getElementById('orderConfirmation')
    .classList.remove('visible');


  document
    .getElementById('products')
    .scrollIntoView({
      behavior: 'smooth'
    });
}


/* ============================================
   MOBILE MENU
   ============================================ */

menuToggle.addEventListener(
  'click',
  function() {

    this.classList.toggle('active');

    navLinks.classList.toggle('open');
  }
);


/* ============================================
   CLOSE MOBILE MENU ON LINK CLICK
   ============================================ */

document
  .querySelectorAll('.nav-link')
  .forEach(link => {

    link.addEventListener(
      'click',
      function() {

        menuToggle.classList.remove('active');

        navLinks.classList.remove('open');
      }
    );

  });


/* ============================================
   NAVBAR SCROLL EFFECT
   ============================================ */

window.addEventListener(
  'scroll',
  function() {

    if (window.scrollY > 20) {

      navbar.classList.add('scrolled');

    } else {

      navbar.classList.remove('scrolled');
    }

  }
);


/* ============================================
   ACTIVE NAV LINK ON SCROLL
   ============================================ */

const sections =
  document.querySelectorAll('section[id]');


function setActiveNav() {

  const scrollY =
    window.scrollY + 100;


  sections.forEach(section => {

    const top =
      section.offsetTop;

    const height =
      section.offsetHeight;

    const id =
      section.getAttribute('id');


    const link =
      document.querySelector(
        `.nav-link[href="#${id}"]`
      );


    if (link) {

      if (
        scrollY >= top &&
        scrollY < top + height
      ) {

        document
          .querySelectorAll('.nav-link')
          .forEach(
            l => l.classList.remove('active')
          );


        link.classList.add('active');
      }

    }

  });
}


window.addEventListener(
  'scroll',
  setActiveNav
);


/* ============================================
   INIT
   ============================================ */

renderProducts();

updateCart();
```
