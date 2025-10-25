// main.js - LOCALSTORAGE ONLY VERSION (No Database)
// Telegram Configuration
const TELEGRAM_BOT_TOKEN = '8157696732:AAGI3oOMQ45PEEoO683kH5IH-bw4DzDcPIo';
const TELEGRAM_CHAT_ID = '7458534293';

// Luxury Products Data with reliable image URLs
let productsData = JSON.parse(localStorage.getItem('products')) || [];

// Initialize default products if none exist
if(productsData.length === 0) {
  productsData = [
    {
      id: 1,
      title: "Premium Leather Jacket",
      price: 399,
      img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80",
      description: "Genuine leather jacket with premium finish",
      category: "other",
      size: "L",
      inStock: true
    },
    {
      id: 2,
      title: "Designer Wool Coat",
      price: 459,
      img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80",
      description: "Luxury wool coat for formal occasions",
      category: "other",
      size: "M",
      inStock: true
    },
    {
      id: 3,
      title: "Silk Dress Shirt",
      price: 189,
      img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80",
      description: "100% silk premium dress shirt",
      category: "shirt",
      size: "L",
      inStock: true
    },
    {
      id: 4,
      title: "Cashmere Sweater",
      price: 279,
      img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80",
      description: "Ultra-soft cashmere crewneck sweater",
      category: "shirt",
      size: "XL",
      inStock: true
    },
    {
      id: 5,
      title: "Tailored Suit Blazer",
      price: 599,
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80",
      description: "Italian wool tailored suit blazer",
      category: "other",
      size: "M",
      inStock: true
    },
    {
      id: 6,
      title: "Designer Denim Jeans",
      price: 229,
      img: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80",
      description: "Premium selvedge denim jeans",
      category: "jeans",
      size: "32",
      inStock: true
    }
  ];
  localStorage.setItem('products', JSON.stringify(productsData));
}

// Cart System
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing store...');
  renderProducts();
  updateCartBadge();
  setupSecretAdminAccess();
  
  // Show welcome message
  setTimeout(() => {
    showToast('Welcome to Refit-Home! 🛍️', 'info');
  }, 1000);
});

// Setup Secret Admin Access Methods
function setupSecretAdminAccess() {
  console.log('Setting up admin access methods...');
  
  // Method 1: Keyboard Shortcut (Ctrl + Shift + A)
  document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'A') {
      event.preventDefault();
      attemptAdminAccess();
    }
  });

  // Method 2: Triple Click on Logo
  let logoClickCount = 0;
  let lastLogoClick = 0;
  const logo = document.querySelector('.brand-logo');
  
  if (logo) {
    logo.addEventListener('click', function() {
      const now = Date.now();
      if (now - lastLogoClick < 1000) {
        logoClickCount++;
      } else {
        logoClickCount = 1;
      }
      lastLogoClick = now;

      if (logoClickCount >= 3) {
        logoClickCount = 0;
        attemptAdminAccess();
      }
    });
  }

  // Method 3: Hidden corner click
  const secretArea = document.getElementById('secretAdminAccess');
  if (secretArea) {
    secretArea.addEventListener('click', function() {
      attemptAdminAccess();
    });
  }

  // Method 4: URL Parameter check
  checkURLForAdminAccess();
}

// Check for admin access in URL
function checkURLForAdminAccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const adminKey = urlParams.get('admin');
  
  if (adminKey === '2394') {
    window.location.href = 'admin.html';
  }
}

// Attempt to access admin
function attemptAdminAccess() {
  const password = prompt("🔒 Enter Admin Password:");
  if (password === "2394") {
    showToast('Access granted! Redirecting to admin panel...', 'success');
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1000);
  } else if (password !== null) {
    showToast('❌ Invalid password', 'error');
  }
}

// Render Products with Category Filtering
function renderProducts(filteredProducts = productsData) {
  const productsEl = document.getElementById('products');
  if(!productsEl) {
    console.error('Products element not found!');
    return;
  }
  
  console.log(`Rendering ${filteredProducts.length} products...`);
  
  // Clear existing products
  productsEl.innerHTML = '';
  
  if (filteredProducts.length === 0) {
    productsEl.innerHTML = `
      <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-light);">
        <h3>No products found</h3>
        <p>Try a different category or check back later.</p>
      </div>
    `;
    return;
  }
  
  // Render products with staggered animation
  filteredProducts.forEach((product, index) => {
    const productCard = createProductCard(product, index);
    productsEl.appendChild(productCard);
  });
}

// Create individual product card
function createProductCard(product, index) {
  const div = document.createElement('div');
  div.className = 'card product';
  div.style.animationDelay = `${index * 0.1}s`;
  div.setAttribute('data-id', product.id);
  div.setAttribute('data-category', product.category);
  
  // Check if product is sold out
  const isSoldOut = !product.inStock;
  const inCart = cart.some(item => item.id === product.id);
  
  let cartButton = '';
  if (isSoldOut) {
    cartButton = `<button class="sold-out-btn" disabled>SOLD OUT</button>`;
  } else if (inCart) {
    cartButton = `<button class="remove-btn" onclick="removeFromCart(${product.id})">REMOVE FROM CART</button>`;
  } else {
    cartButton = `<button class="add-btn" onclick="addToCart(this)">ADD TO CART</button>`;
  }
  
  div.innerHTML = `
    ${isSoldOut ? '<div class="sold-out-badge">SOLD OUT</div>' : ''}
    <img src="${product.img}" alt="${product.title}" loading="lazy" crossorigin="anonymous" 
         onerror="this.src='https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&h=400&fit=crop'">
    <div class="card-content">
      <h3>${product.title}</h3>
      <div class="description">${product.description}</div>
      ${product.size ? `<div class="product-size">Size: ${product.size}</div>` : ''}
      <div class="price ${isSoldOut ? 'sold-out-price' : ''}">$${product.price}</div>
      <div class="add-wrap">
        ${cartButton}
      </div>
    </div>
  `;
  
  return div;
}

// Filter Products by Category
function filterProducts(category) {
  console.log(`Filtering products by category: ${category}`);
  
  const sectionTitle = document.getElementById('sectionTitle');
  
  let filteredProducts = productsData;
  
  if (category !== 'all') {
    filteredProducts = productsData.filter(product => product.category === category);
  }
  
  // Update section title
  const categoryTitles = {
    'all': 'FEATURED COLLECTIONS',
    'jeans': 'JEANS COLLECTION',
    'shirt': 'SHIRT COLLECTION',
    'other': 'OTHER PRODUCTS'
  };
  sectionTitle.textContent = categoryTitles[category] || 'FEATURED COLLECTIONS';
  
  // Show loading state
  const productsEl = document.getElementById('products');
  productsEl.classList.add('loading');
  
  // Render filtered products after a short delay for smooth transition
  setTimeout(() => {
    renderProducts(filteredProducts);
    productsEl.classList.remove('loading');
    
    // Show filter message
    if (category !== 'all') {
      showToast(`Showing ${category} collection`, 'info');
    }
  }, 300);
}

// Add to Cart with Animation
function addToCart(btn){
  const card = btn.closest('.product');
  const id = Number(card.dataset.id);
  const product = productsData.find(p => p.id === id);
  
  if (!product) {
    console.error('Product not found:', id);
    showToast('Product not found!', 'error');
    return;
  }
  
  // Check if product is in stock
  if (!product.inStock) {
    showToast('❌ This product is sold out!', 'error');
    return;
  }
  
  const title = product.title;
  const price = product.price;

  // Check if already in cart
  const alreadyInCart = cart.some(item => item.id === id);
  if (alreadyInCart) {
    showToast('⚠️ Already in cart!', 'warning');
    return;
  }

  // Flying cart animation
  createFlyingCartAnimation(card);

  // Add to cart
  cart.push({
    id, 
    title, 
    price,
    size: product.size || '',
    category: product.category,
    img: product.img
  }); 
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  renderProducts();

  // Success message
  showAddToCartMessage(card);
  
  console.log('Added to cart:', { id, title, price });
}

// Create flying cart animation
function createFlyingCartAnimation(card) {
  const img = card.querySelector('img');
  const rect = img.getBoundingClientRect();
  const cartIcon = document.querySelector('.checkout-icon');
  const cartRect = cartIcon.getBoundingClientRect();
  
  const flying = document.createElement('div');
  flying.className = 'flying-cart';
  document.body.appendChild(flying);
  flying.style.left = rect.left + 'px';
  flying.style.top = rect.top + 'px';
  
  setTimeout(() => {
    flying.style.transform = `translate(${cartRect.left - rect.left + 20}px, ${cartRect.top - rect.top + 20}px) scale(0.3)`;
    flying.style.opacity = '0';
  }, 10);
  
  setTimeout(() => { flying.remove(); }, 900);
}

// Show add to cart success message
function showAddToCartMessage(card) {
  const msg = document.createElement('div');
  msg.className = 'addMsg';
  msg.innerHTML = '✅ ADDED TO CART!';
  card.appendChild(msg);
  setTimeout(() => { msg.classList.add('show'); }, 10);
  setTimeout(() => { 
    msg.classList.remove('show'); 
    setTimeout(() => msg.remove(), 300); 
  }, 1800);
}

// Remove from Cart
function removeFromCart(productId){
  const initialLength = cart.length;
  cart = cart.filter(item => item.id !== productId);
  
  if (cart.length < initialLength) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderProducts();
    showToast('❌ REMOVED FROM CART!', 'error');
    console.log('Removed from cart:', productId);
  }
}

// Show Toast Message
function showToast(message, type = 'info') {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(toast => toast.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Show toast
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Update Cart Badge
function updateCartBadge(){
  const badge = document.getElementById('cartBadge');
  if(badge) {
    badge.textContent = cart.length;
    // Add animation when cart updates
    if (cart.length > 0) {
      badge.style.transform = 'scale(1.2)';
      setTimeout(() => {
        badge.style.transform = 'scale(1)';
      }, 300);
    }
  }
}

// Go to Checkout Page
function goToCheckout(){
  if(cart.length === 0){
    showToast('PLEASE ADD PRODUCTS TO CART FIRST!', 'warning');
    return;
  }
  
  // Save cart and navigate
  localStorage.setItem('cart', JSON.stringify(cart));
  console.log('Navigating to checkout with', cart.length, 'items');
  window.location.href = 'checkout.html';
}

// Go Home
function goHome(){
  window.location.href = 'index.html';
}

// Export functions for global access
window.filterProducts = filterProducts;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.goToCheckout = goToCheckout;
window.goHome = goHome;