// main.js - FIXED FOR VERCEL
const TELEGRAM_BOT_TOKEN = '8157696732:AAGI3oOMQ45PEEoO683kH5IH-bw4DzDcPIo';
const TELEGRAM_CHAT_ID = '7458534293';

// Luxury Products Data
let productsData = JSON.parse(localStorage.getItem('products')) || [];

// ALWAYS LOAD DEFAULT PRODUCTS FOR VERCEL
function initializeProducts() {
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
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing store...');
  initializeProducts(); // Always initialize products
  renderProducts();
  updateCartBadge();
  setupSecretAdminAccess();
  
  setTimeout(() => {
    showToast('Welcome to Refit-Home! 🛍️', 'info');
  }, 1000);
});

// [REST OF YOUR EXISTING main.js CODE REMAINS THE SAME]
// ... (all your existing functions: renderProducts, filterProducts, addToCart, etc.)
