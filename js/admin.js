// Admin JavaScript - LOCALSTORAGE ONLY VERSION
let productsData = JSON.parse(localStorage.getItem('products')) || [];
let settings = JSON.parse(localStorage.getItem('adminSettings')) || {
  websiteTitle: "ÉLITE MENS",
  websiteTagline: "LUXURY APPAREL",
  deliveryFee: 2,
  qrCodeUrl: "images/qr-code.png",
  telegramToken: "8378831399:AAEVsOsJiu1UHpzEIZKIwauioI0rB6xwFcE",
  telegramChatId: "1968030249",
  adminPassword: "2394"
};

// Order Management
let currentDeletionType = null;
let currentDeletionParams = null;
let currentIndividualOrderToDelete = null;

// Initialize admin
document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  initializeProductsWithBackup();
  renderAdminProducts();
  renderSoldOutProducts();
  renderOrders();
  setupSizeSelection();
  initializeDeletionStats();
  initializeMobileMenu();
});

// ==================== PRODUCTS EXPORT/IMPORT ====================

// Export products to JSON file
function exportProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (products.length === 0) {
        showAdminMessage('No products to export!', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-backup-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAdminMessage(`Exported ${products.length} products successfully!`, 'success');
}

// Import products from JSON file
function importProducts(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
        showAdminMessage('File too large! Maximum size is 1MB.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const products = JSON.parse(e.target.result);
            
            // Validate the products data structure
            if (!Array.isArray(products)) {
                throw new Error('Invalid file format: Expected array of products');
            }
            
            // Basic validation for product structure
            const isValid = products.every(product => 
                product && 
                typeof product.title === 'string' &&
                typeof product.price === 'number'
            );
            
            if (!isValid) {
                throw new Error('Invalid product data structure');
            }
            
            if (confirm(`This will replace all current products with ${products.length} new products. Continue?`)) {
                // Save to localStorage
                localStorage.setItem('products', JSON.stringify(products));
                
                // Update the current products data
                productsData = products;
                
                // Refresh the displays
                renderAdminProducts();
                renderSoldOutProducts();
                
                // Reset the file input
                event.target.value = '';
                
                showAdminMessage(`Successfully imported ${products.length} products!`, 'success');
            }
            
        } catch (error) {
            console.error('Import error:', error);
            showAdminMessage('Error importing products: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function() {
        showAdminMessage('Error reading file', 'error');
    };
    
    reader.readAsText(file);
}

// Initialize products with backup check
function initializeProductsWithBackup() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // If no products exist, check if we have a backup in URL parameters
    if (products.length === 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const productsParam = urlParams.get('products');
        
        if (productsParam) {
            try {
                const importedProducts = JSON.parse(decodeURIComponent(productsParam));
                if (Array.isArray(importedProducts)) {
                    localStorage.setItem('products', JSON.stringify(importedProducts));
                    showAdminMessage('Products loaded from backup URL!', 'success');
                }
            } catch (error) {
                console.error('Error loading products from URL:', error);
            }
        }
    }
}

// Setup size selection functionality
function setupSizeSelection() {
  const sizeRadios = document.querySelectorAll('input[name="size"]');
  const customSizeInput = document.getElementById('customSize');
  
  sizeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'custom') {
        customSizeInput.disabled = false;
        customSizeInput.focus();
      } else {
        customSizeInput.disabled = true;
        customSizeInput.value = '';
      }
    });
  });
}

// Show section
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Remove active class from all nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Show selected section
  document.getElementById(sectionId).classList.add('active');
  
  // Activate corresponding nav item
  const navItem = document.querySelector(`[href="#${sectionId}"]`);
  if (navItem) {
    navItem.classList.add('active');
  }
  
  // Close mobile menu on section change
  closeMobileMenu();
  
  // If showing orders, render them and update stats
  if (sectionId === 'orders') {
    renderOrders();
    updateDeletionStats();
  }
  
  // If showing reports, calculate them
  if (sectionId === 'reports') {
    showReports();
  }
}

// Add new product
function addNewProduct() {
  const title = document.getElementById('productTitle').value.trim();
  const price = Number(document.getElementById('productPrice').value);
  const category = document.getElementById('productCategory').value;
  const image = document.getElementById('productImage').value.trim();
  const description = document.getElementById('productDescription').value.trim();
  
  // Get selected size
  const selectedSize = document.querySelector('input[name="size"]:checked');
  let size = '';
  
  if (selectedSize) {
    if (selectedSize.value === 'custom') {
      size = document.getElementById('customSize').value.trim();
    } else {
      size = selectedSize.value;
    }
  }
  
  if(!title || !price || !image || !description) {
    alert('Please fill all required fields');
    return;
  }
  
  const newId = productsData.length ? Math.max(...productsData.map(p => p.id)) + 1 : 1;
  const newProduct = {
    id: newId,
    title,
    price,
    category,
    img: image,
    description,
    size: size,
    inStock: true
  };
  
  productsData.push(newProduct);
  localStorage.setItem('products', JSON.stringify(productsData));
  renderAdminProducts();
  
  // Clear form
  document.getElementById('productTitle').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productImage').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('customSize').value = '';
  
  // Reset size selection
  document.querySelector('input[name="size"][value=""]').checked = true;
  document.getElementById('customSize').disabled = true;
  
  showAdminMessage('Product added successfully!', 'success');
}

// Render in-stock products in admin
function renderAdminProducts() {
  const container = document.getElementById('adminProducts');
  const inStockProducts = productsData.filter(product => product.inStock);
  
  if(inStockProducts.length === 0) {
    container.innerHTML = '<div class="no-products">No products in stock</div>';
    return;
  }
  
  container.innerHTML = inStockProducts.map(product => `
    <div class="admin-product-card">
      <img src="${product.img}" alt="${product.title}" onerror="this.src='https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&h=400&fit=crop'">
      <h4>${product.title}</h4>
      <div class="price">$${product.price}</div>
      <div class="category">${product.category.toUpperCase()}</div>
      ${product.size ? `<div class="product-size">Size: ${product.size}</div>` : ''}
      <div class="stock-status in-stock">IN STOCK</div>
      <p>${product.description}</p>
      <div class="admin-product-actions">
        <button class="mark-sold-btn" onclick="markAsSoldOut(${product.id})">MARK AS SOLD OUT</button>
        <button class="delete-btn" onclick="deleteProduct(${product.id})">DELETE</button>
      </div>
    </div>
  `).join('');
}

// Render sold out products in admin
function renderSoldOutProducts() {
  const container = document.getElementById('soldOutProducts');
  const soldOutProducts = productsData.filter(product => !product.inStock);
  
  if(soldOutProducts.length === 0) {
    container.innerHTML = '<div class="no-products">No sold out products</div>';
    return;
  }
  
  container.innerHTML = soldOutProducts.map(product => `
    <div class="admin-product-card sold-out-card">
      <img src="${product.img}" alt="${product.title}" onerror="this.src='https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&h=400&fit=crop'">
      <h4>${product.title}</h4>
      <div class="price">$${product.price}</div>
      <div class="category">${product.category.toUpperCase()}</div>
      ${product.size ? `<div class="product-size">Size: ${product.size}</div>` : ''}
      <div class="stock-status out-of-stock">SOLD OUT</div>
      <p>${product.description}</p>
      <div class="admin-product-actions">
        <button class="restock-btn" onclick="restockProduct(${product.id})">RESTOCK</button>
        <button class="delete-btn" onclick="deleteProduct(${product.id})">DELETE</button>
      </div>
    </div>
  `).join('');
}

// Mark product as sold out
function markAsSoldOut(productId) {
  const product = productsData.find(p => p.id === productId);
  if (product) {
    product.inStock = false;
    localStorage.setItem('products', JSON.stringify(productsData));
    renderAdminProducts();
    renderSoldOutProducts();
    showAdminMessage('Product marked as sold out!', 'success');
  }
}

// Restock product
function restockProduct(productId) {
  const product = productsData.find(p => p.id === productId);
  if (product) {
    product.inStock = true;
    localStorage.setItem('products', JSON.stringify(productsData));
    renderAdminProducts();
    renderSoldOutProducts();
    showAdminMessage('Product restocked successfully!', 'success');
  }
}

// Delete product with confirmation
function deleteProduct(productId) {
  const product = productsData.find(p => p.id === productId);
  
  if(!product) return;
  
  if(confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
    // Remove product from products data
    productsData = productsData.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(productsData));
    
    // Remove product from any active carts
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    renderAdminProducts();
    renderSoldOutProducts();
    showAdminMessage('Product deleted successfully!', 'success');
  }
}

// ==================== ORDER MANAGEMENT FUNCTIONS ====================

// Get all orders from localStorage
function getAllOrders() {
  return JSON.parse(localStorage.getItem('orders')) || [];
}

// Get all orders from localStorage (for deletion functions)
function getAllOrdersFromLocalStorage() {
  return JSON.parse(localStorage.getItem('orders')) || [];
}

// Render orders with individual delete buttons
function renderOrders() {
  const container = document.getElementById('ordersList');
  const orders = getAllOrders();
  
  if(orders.length === 0) {
    container.innerHTML = '<div class="no-orders">No orders yet</div>';
    return;
  }
  
  container.innerHTML = orders.map(order => {
    const orderId = order.orderId || order.id;
    const customerName = order.customer.name;
    const phone = order.customer.phone;
    const total = `$${order.total}`;
    const status = order.status || 'Pending';
    const delivery = order.delivery === 'jnt' ? 'J&T Express' : 'Virak Bunthan';
    const address = order.customer.address;
    const orderDate = new Date(order.timestamp).toLocaleString();
    const items = order.items.map(item => item.title).join(', ');
    
    return `
    <div class="order-item">
      <div class="order-header">
        <div class="order-id">Order #${orderId}</div>
        <div class="order-total">${total}</div>
        <div class="order-status ${status.toLowerCase()}">${status}</div>
      </div>
      <div class="order-customer">
        <strong>${customerName}</strong> • ${phone}
      </div>
      <div class="order-items">
        <strong>Items:</strong> ${items}
      </div>
      <div class="order-delivery">
        <strong>Delivery:</strong> ${delivery} • ${address}
      </div>
      <div class="order-time">
        <strong>Order Date:</strong> ${orderDate}
      </div>
      <div class="order-actions">
        <button class="status-btn pending" onclick="updateOrderStatus('${orderId}', 'Pending')" ${status === 'Pending' ? 'disabled' : ''}>Pending</button>
        <button class="status-btn processing" onclick="updateOrderStatus('${orderId}', 'Processing')" ${status === 'Processing' ? 'disabled' : ''}>Processing</button>
        <button class="status-btn delivered" onclick="updateOrderStatus('${orderId}', 'Delivered')" ${status === 'Delivered' ? 'disabled' : ''}>Delivered</button>
        <button class="delete-single-btn" onclick="showIndividualDeleteConfirmation('${orderId}')" title="Delete this order">
          🗑️ Delete
        </button>
      </div>
    </div>
    `;
  }).join('');
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
  const orders = getAllOrders();
  const orderIndex = orders.findIndex(order => order.orderId === orderId || order.id === orderId);
  
  if (orderIndex !== -1) {
    orders[orderIndex].status = newStatus;
    localStorage.setItem('orders', JSON.stringify(orders));
    renderOrders();
    showAdminMessage(`Order ${orderId} status updated to ${newStatus}`, 'success');
    return true;
  } else {
    showAdminMessage('Failed to update order status - order not found', 'error');
    return false;
  }
}

// ==================== ORDER DELETION FUNCTIONS ====================

// Initialize deletion statistics
function initializeDeletionStats() {
  updateDeletionStats();
}

// Update deletion statistics
function updateDeletionStats() {
  const orders = getAllOrdersFromLocalStorage();
  const now = new Date();
  
  // Orders from this week
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const weekOrders = orders.filter(order => {
    try {
      const orderDate = new Date(order.timestamp);
      return orderDate >= weekStart;
    } catch (e) {
      return false;
    }
  }).length;
  
  // Orders from this month
  const monthStart = new Date(now);
  monthStart.setDate(now.getDate() - 30);
  const monthOrders = orders.filter(order => {
    try {
      const orderDate = new Date(order.timestamp);
      return orderDate >= monthStart;
    } catch (e) {
      return false;
    }
  }).length;
  
  // Old orders (30+ days)
  const oldCutoff = new Date(now);
  oldCutoff.setDate(now.getDate() - 30);
  const oldOrders = orders.filter(order => {
    try {
      const orderDate = new Date(order.timestamp);
      return orderDate < oldCutoff;
    } catch (e) {
      return false;
    }
  }).length;
  
  document.getElementById('weekOrders').textContent = weekOrders;
  document.getElementById('monthOrders').textContent = monthOrders;
  document.getElementById('oldOrders').textContent = oldOrders;
}

// Show delete confirmation for time-based deletion
function showDeleteConfirmation(type) {
  currentDeletionType = type;
  currentIndividualOrderToDelete = null;
  
  const orders = getOrdersToDelete(type);
  
  if (orders.length === 0) {
    showAdminMessage('No orders found for deletion', 'warning');
    return;
  }
  
  const modalContent = document.getElementById('deleteModalContent');
  let title = '';
  let description = '';
  
  switch(type) {
    case 'week':
      title = 'Delete Last Week\'s Orders';
      description = 'This will delete all orders from the past 7 days.';
      break;
    case 'month':
      title = 'Delete Last Month\'s Orders';
      description = 'This will delete all orders from the past 30 days.';
      break;
    case 'old':
      title = 'Delete Old Orders';
      description = 'This will delete all orders older than 30 days.';
      break;
  }
  
  modalContent.innerHTML = `
    <h3>${title}</h3>
    <p>${description}</p>
    <div class="warning-message">
      ⚠️ This action will delete <strong>${orders.length}</strong> orders and cannot be undone!
    </div>
    <div class="orders-preview">
      <h4>Orders to be deleted:</h4>
      ${orders.slice(0, 5).map(order => `
        <div class="order-preview-item">
          #${order.orderId || order.id} - ${order.customer.name} - $${order.total} - ${new Date(order.timestamp).toLocaleDateString()}
        </div>
      `).join('')}
      ${orders.length > 5 ? `<div class="order-preview-item">... and ${orders.length - 5} more orders</div>` : ''}
    </div>
  `;
  
  document.getElementById('deleteModal').style.display = 'flex';
}

// Show delete confirmation for status-based deletion
function showStatusDeleteConfirmation(status) {
  currentDeletionType = 'status';
  currentDeletionParams = { status: status, days: 30 };
  currentIndividualOrderToDelete = null;
  
  const orders = getOrdersToDelete('status', currentDeletionParams);
  
  if (orders.length === 0) {
    showAdminMessage(`No ${status.toLowerCase()} orders older than 30 days found`, 'warning');
    return;
  }
  
  const modalContent = document.getElementById('deleteModalContent');
  modalContent.innerHTML = `
    <h3>Delete ${status} Orders</h3>
    <p>This will delete all ${status.toLowerCase()} orders older than 30 days.</p>
    <div class="warning-message">
      ⚠️ This action will delete <strong>${orders.length}</strong> ${status.toLowerCase()} orders and cannot be undone!
    </div>
    <div class="orders-preview">
      <h4>Orders to be deleted:</h4>
      ${orders.slice(0, 5).map(order => `
        <div class="order-preview-item">
          #${order.orderId || order.id} - ${order.customer.name} - $${order.total} - ${new Date(order.timestamp).toLocaleDateString()}
        </div>
      `).join('')}
      ${orders.length > 5 ? `<div class="order-preview-item">... and ${orders.length - 5} more orders</div>` : ''}
    </div>
  `;
  
  document.getElementById('deleteModal').style.display = 'flex';
}

// Show delete confirmation for custom date range
function showCustomDeleteConfirmation() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  if (!startDate || !endDate) {
    showAdminMessage('Please select both start and end dates', 'error');
    return;
  }
  
  currentDeletionType = 'custom';
  currentDeletionParams = { startDate: new Date(startDate), endDate: new Date(endDate) };
  currentIndividualOrderToDelete = null;
  
  const orders = getOrdersToDelete('custom', currentDeletionParams);
  
  if (orders.length === 0) {
    showAdminMessage('No orders found in the selected date range', 'warning');
    return;
  }
  
  const modalContent = document.getElementById('deleteModalContent');
  modalContent.innerHTML = `
    <h3>Delete Orders in Date Range</h3>
    <p>This will delete all orders between ${startDate} and ${endDate}.</p>
    <div class="warning-message">
      ⚠️ This action will delete <strong>${orders.length}</strong> orders and cannot be undone!
    </div>
    <div class="orders-preview">
      <h4>Orders to be deleted:</h4>
      ${orders.slice(0, 5).map(order => `
        <div class="order-preview-item">
          #${order.orderId || order.id} - ${order.customer.name} - $${order.total} - ${new Date(order.timestamp).toLocaleDateString()}
        </div>
      `).join('')}
      ${orders.length > 5 ? `<div class="order-preview-item">... and ${orders.length - 5} more orders</div>` : ''}
    </div>
  `;
  
  document.getElementById('deleteModal').style.display = 'flex';
}

// Show individual order deletion confirmation
function showIndividualDeleteConfirmation(orderId) {
  currentIndividualOrderToDelete = orderId;
  currentDeletionType = null;
  
  const orders = getAllOrdersFromLocalStorage();
  const order = orders.find(o => o.orderId === orderId || o.id === orderId);
  
  if (!order) {
    showAdminMessage('Order not found', 'error');
    return;
  }
  
  const modalContent = document.getElementById('deleteModalContent');
  modalContent.innerHTML = `
    <h3>🗑️ Delete Single Order</h3>
    <p>Are you sure you want to delete this order?</p>
    <div class="order-details">
      <div class="detail-row">
        <strong>Order ID:</strong> #${order.orderId || order.id}
      </div>
      <div class="detail-row">
        <strong>Customer:</strong> ${order.customer.name}
      </div>
      <div class="detail-row">
        <strong>Phone:</strong> ${order.customer.phone}
      </div>
      <div class="detail-row">
        <strong>Total:</strong> $${order.total}
      </div>
      <div class="detail-row">
        <strong>Status:</strong> <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
      </div>
      <div class="detail-row">
        <strong>Date:</strong> ${new Date(order.timestamp).toLocaleString()}
      </div>
      <div class="detail-row">
        <strong>Items:</strong> ${order.items.map(item => item.title).join(', ')}
      </div>
    </div>
    <div class="warning-message">
      ⚠️ This action cannot be undone! The order will be permanently deleted.
    </div>
  `;
  
  document.getElementById('deleteModal').style.display = 'flex';
}

// Get orders to delete based on type
function getOrdersToDelete(type, params = null) {
  const orders = getAllOrdersFromLocalStorage();
  
  switch(type) {
    case 'week':
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return orders.filter(order => {
        try {
          const orderDate = new Date(order.timestamp);
          return orderDate >= weekAgo;
        } catch (e) {
          return false;
        }
      });
      
    case 'month':
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return orders.filter(order => {
        try {
          const orderDate = new Date(order.timestamp);
          return orderDate >= monthAgo;
        } catch (e) {
          return false;
        }
      });
      
    case 'old':
      const oldCutoff = new Date();
      oldCutoff.setDate(oldCutoff.getDate() - 30);
      return orders.filter(order => {
        try {
          const orderDate = new Date(order.timestamp);
          return orderDate < oldCutoff;
        } catch (e) {
          return false;
        }
      });
      
    case 'status':
      const statusCutoff = new Date();
      statusCutoff.setDate(statusCutoff.getDate() - (params.days || 30));
      return orders.filter(order => {
        try {
          const orderDate = new Date(order.timestamp);
          return order.status === params.status && orderDate < statusCutoff;
        } catch (e) {
          return false;
        }
      });
      
    case 'custom':
      return orders.filter(order => {
        try {
          const orderDate = new Date(order.timestamp);
          return orderDate >= params.startDate && orderDate <= params.endDate;
        } catch (e) {
          return false;
        }
      });
      
    default:
      return [];
  }
}

// Confirm and execute deletion
function confirmDeletion() {
  if (currentIndividualOrderToDelete) {
    confirmIndividualDeletion();
    return;
  }
  
  let deletedCount = 0;
  const orders = getAllOrdersFromLocalStorage();
  
  switch(currentDeletionType) {
    case 'week':
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      deletedCount = deleteOrdersByDateRange(weekAgo, new Date());
      break;
      
    case 'month':
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      deletedCount = deleteOrdersByDateRange(monthAgo, new Date());
      break;
      
    case 'old':
      deletedCount = deleteOrdersOlderThan(30);
      break;
      
    case 'status':
      deletedCount = deleteOrdersByStatusAndDate(currentDeletionParams.status, currentDeletionParams.days);
      break;
      
    case 'custom':
      deletedCount = deleteOrdersByDateRange(currentDeletionParams.startDate, currentDeletionParams.endDate);
      break;
  }
  
  closeDeleteModal();
  renderOrders();
  updateDeletionStats();
  showAdminMessage(`Successfully deleted ${deletedCount} orders`, 'success');
  
  // Reset deletion state
  currentDeletionType = null;
  currentDeletionParams = null;
}

// Confirm individual order deletion
function confirmIndividualDeletion() {
  if (!currentIndividualOrderToDelete) return;
  
  const success = deleteOrder(currentIndividualOrderToDelete);
  
  if (success) {
    showAdminMessage(`Order #${currentIndividualOrderToDelete} deleted successfully`, 'success');
    renderOrders();
    updateDeletionStats();
  } else {
    showAdminMessage('Failed to delete order', 'error');
  }
  
  closeDeleteModal();
  currentIndividualOrderToDelete = null;
}

// Delete order from localStorage
function deleteOrder(orderId) {
  const orders = getAllOrdersFromLocalStorage();
  const filteredOrders = orders.filter(order => order.orderId !== orderId && order.id !== orderId);
  localStorage.setItem('orders', JSON.stringify(filteredOrders));
  return filteredOrders.length < orders.length;
}

// Delete orders by date range
function deleteOrdersByDateRange(startDate, endDate) {
  const orders = getAllOrdersFromLocalStorage();
  const ordersToKeep = orders.filter(order => {
    try {
      const orderDate = new Date(order.timestamp);
      return orderDate < startDate || orderDate > endDate;
    } catch (e) {
      return true;
    }
  });
  
  const deletedCount = orders.length - ordersToKeep.length;
  localStorage.setItem('orders', JSON.stringify(ordersToKeep));
  return deletedCount;
}

// Delete orders older than specified days
function deleteOrdersOlderThan(days) {
  const orders = getAllOrdersFromLocalStorage();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const ordersToKeep = orders.filter(order => {
    try {
      const orderDate = new Date(order.timestamp);
      return orderDate >= cutoffDate;
    } catch (e) {
      return true;
    }
  });
  
  const deletedCount = orders.length - ordersToKeep.length;
  localStorage.setItem('orders', JSON.stringify(ordersToKeep));
  return deletedCount;
}

// Delete orders by status and date
function deleteOrdersByStatusAndDate(status, days) {
  const orders = getAllOrdersFromLocalStorage();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const ordersToKeep = orders.filter(order => {
    try {
      const orderDate = new Date(order.timestamp);
      const shouldDelete = order.status === status && orderDate < cutoffDate;
      return !shouldDelete;
    } catch (e) {
      return true;
    }
  });
  
  const deletedCount = orders.length - ordersToKeep.length;
  localStorage.setItem('orders', JSON.stringify(ordersToKeep));
  return deletedCount;
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById('deleteModal').style.display = 'none';
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  currentIndividualOrderToDelete = null;
  currentDeletionType = null;
  currentDeletionParams = null;
}

// ==================== REPORTS FUNCTIONS ====================

// Reports functionality
function showReports() {
  calculateReports();
  renderRecentOrders();
}

function calculateReports() {
  const orders = getAllOrders();
  
  // Total Orders
  document.getElementById('totalOrders').textContent = orders.length;
  
  // Total Revenue
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + order.total;
  }, 0);
  document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
  
  // Pending Orders
  const pendingOrders = orders.filter(order => order.status === 'Pending').length;
  document.getElementById('pendingOrders').textContent = pendingOrders;
  
  // Completed Orders (Delivered)
  const completedOrders = orders.filter(order => order.status === 'Delivered').length;
  document.getElementById('completedOrders').textContent = completedOrders;
}

function renderRecentOrders() {
  const container = document.getElementById('recentOrdersList');
  const orders = getAllOrders();
  
  if (orders.length === 0) {
    container.innerHTML = '<div class="no-orders">No orders yet</div>';
    return;
  }
  
  // Show last 10 orders
  const recentOrders = orders.slice(-10).reverse();
  
  container.innerHTML = recentOrders.map(order => `
    <div class="order-item">
      <div class="order-header">
        <div class="order-id">Order #${order.orderId || order.id}</div>
        <div class="order-total">$${order.total}</div>
        <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
      </div>
      <div class="order-customer">
        <strong>${order.customer.name}</strong> • ${order.customer.phone}
      </div>
      <div class="order-items">
        <strong>Items:</strong> ${order.items.map(item => item.title).join(', ')}
      </div>
      <div class="order-time">
        <strong>Order Date:</strong> ${new Date(order.timestamp).toLocaleString()}
      </div>
    </div>
  `).join('');
}

// Export to CSV function
function exportToCSV() {
  const orders = getAllOrders();
  
  if (orders.length === 0) {
    alert('No orders to export!');
    return;
  }
  
  // Create CSV header
  let csv = 'OrderID,CustomerName,Phone,Address,Total,Status,Delivery,OrderDate,Items\n';
  
  // Add order data
  orders.forEach(order => {
    const row = [
      order.orderId || order.id,
      `"${order.customer.name}"`,
      `"${order.customer.phone}"`,
      `"${order.customer.address}"`,
      order.total,
      order.status,
      order.delivery === 'jnt' ? 'J&T Express' : 'Virak Bunthan',
      `"${new Date(order.timestamp).toLocaleString()}"`,
      `"${order.items.map(item => item.title).join(', ')}"`
    ].join(',');
    
    csv += row + '\n';
  });
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Store_Orders_Export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  showAdminMessage('Store Orders exported to CSV successfully!', 'success');
}

// Clear all orders function
function clearAllOrders() {
  if (confirm('Are you sure you want to clear ALL orders? This action cannot be undone!')) {
    localStorage.removeItem('orders');
    renderOrders();
    showReports();
    showAdminMessage('All orders cleared successfully!', 'success');
    return true;
  }
  return false;
}

// ==================== SETTINGS FUNCTIONS ====================

// Load settings
function loadSettings() {
  document.getElementById('websiteTitle').value = settings.websiteTitle;
  document.getElementById('websiteTagline').value = settings.websiteTagline;
  document.getElementById('deliveryFee').value = settings.deliveryFee;
  document.getElementById('qrCodeUrl').value = settings.qrCodeUrl;
  document.getElementById('telegramToken').value = settings.telegramToken;
  document.getElementById('telegramChatId').value = settings.telegramChatId;
  document.getElementById('adminPassword').value = settings.adminPassword;
}

// Save settings
function saveSettings() {
  settings.websiteTitle = document.getElementById('websiteTitle').value;
  settings.websiteTagline = document.getElementById('websiteTagline').value;
  settings.deliveryFee = Number(document.getElementById('deliveryFee').value);
  settings.qrCodeUrl = document.getElementById('qrCodeUrl').value;
  settings.telegramToken = document.getElementById('telegramToken').value;
  settings.telegramChatId = document.getElementById('telegramChatId').value;
  settings.adminPassword = document.getElementById('adminPassword').value;
  
  localStorage.setItem('adminSettings', JSON.stringify(settings));
  showAdminMessage('Settings saved successfully!', 'success');
}

// Show admin message
function showAdminMessage(message, type = 'success') {
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#ff9800' : '#ff6b6b'};
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `;
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.style.opacity = '0';
    messageDiv.style.transition = 'opacity 0.3s ease';
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}


function initializeMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.getElementById('mobileOverlay');
    const sidebarClose = document.getElementById('sidebarClose');
    
    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
            overlay.style.display = sidebar.classList.contains('mobile-open') ? 'block' : 'none';
            document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
        });
        
        overlay.addEventListener('click', function() {
            closeMobileMenu();
        });
        
        if (sidebarClose) {
            sidebarClose.addEventListener('click', function() {
                closeMobileMenu();
            });
        }
    }
}

// Close mobile menu
function closeMobileMenu() {
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar) {
        sidebar.classList.remove('mobile-open');
    }
    if (overlay) {
        overlay.style.display = 'none';
    }
    document.body.style.overflow = '';
}