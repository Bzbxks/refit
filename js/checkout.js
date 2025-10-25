// checkout.js - LOCALSTORAGE ONLY VERSION (No Database)
// Telegram Configuration
const TELEGRAM_BOT_TOKEN = '8157696732:AAGI3oOMQ45PEEoO683kH5IH-bw4DzDcPIo';
const TELEGRAM_CHAT_ID = '7458534293';

let productsData = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedDelivery = '';
let currentOrder = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing checkout...');
    
    // Ensure cart is properly loaded
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            console.log('Cart loaded:', cart.length, 'items');
        } else {
            cart = [];
            console.log('No cart found, initializing empty cart');
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    renderCartItems();
    
    // Auto-focus first input
    const nameInput = document.getElementById('customerName');
    if(nameInput) {
        nameInput.focus();
        console.log('Auto-focused name input');
    }
    
    // Show cart status
    if (cart.length > 0) {
        showToast(`Cart loaded with ${cart.length} items`, 'info');
    }
});

// Render cart items with proper calculations
function renderCartItems(){
    const itemsList = document.getElementById('itemsList');
    let subtotal = 0;
    const deliveryFee = 2;
    
    console.log('Rendering cart items:', cart);
    
    // Check if cart exists and is valid
    if(!cart || cart.length === 0){
        itemsList.innerHTML = `
            <div style="text-align: center; color: var(--text-light); padding: 40px;">
                <p>Your cart is empty</p>
                <button class="secondary-btn" onclick="goHome()" style="margin-top: 15px;">
                    🏠 Continue Shopping
                </button>
            </div>
        `;
        document.getElementById('totalDisplay').textContent = `TOTAL: $0`;
        
        // Clear any existing cart data
        localStorage.removeItem('cart');
        return;
    }
    
    itemsList.innerHTML = '';
    cart.forEach(item => {
        // Validate item structure
        if (!item || !item.title || !item.price) {
            console.warn('Invalid cart item:', item);
            return;
        }
        
        const itemEl = document.createElement('div');
        itemEl.className = 'item-row';
        itemEl.innerHTML = `
            <span class="item-name">${item.title} ${item.size ? `(${item.size})` : ''}</span>
            <span class="item-price">
                $${item.price}
                <button class="remove-item-btn" onclick="removeCartItem(${item.id})" title="Remove item">✕</button>
            </span>
        `;
        itemsList.appendChild(itemEl);
        subtotal += item.price;
    });
    
    const total = subtotal + deliveryFee;
    
    // Update totals display
    document.getElementById('totalDisplay').textContent = `TOTAL: $${total}`;
    
    console.log('Cart totals - Subtotal:', subtotal, 'Total:', total);
}

// Remove individual item from cart
function removeCartItem(productId){
    console.log('Removing item:', productId);
    
    // Ensure cart is properly filtered and saved
    const initialLength = cart.length;
    cart = cart.filter(item => {
        const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
        const targetId = typeof productId === 'string' ? parseInt(productId) : productId;
        return itemId !== targetId;
    });
    
    if (cart.length < initialLength) {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        showToast('❌ Item removed from cart', 'error');
        console.log('Item removed successfully');
    } else {
        console.warn('Item not found in cart:', productId);
        showToast('Item not found in cart', 'warning');
    }
}

// Clear entire cart
function clearCart(){
    if(cart.length === 0) {
        showToast('CART IS ALREADY EMPTY!', 'warning');
        return;
    }
    
    if(confirm('ARE YOU SURE YOU WANT TO CLEAR YOUR ENTIRE CART?')) {
        const cartCount = cart.length;
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        showToast(`🗑️ ${cartCount} items cleared from cart!`, 'error');
        console.log('Cart cleared');
    }
}

// Select delivery method
function selectDelivery(type){
    selectedDelivery = type;
    document.querySelectorAll('.delivery-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    event.target.closest('.delivery-option').classList.add('selected');
    
    console.log('Delivery method selected:', type);
    showToast(`${type === 'jnt' ? 'J&T Express' : 'Virak Bunthan'} selected`, 'info');
}

// Validate and show QR modal
function validateAndShowQR(){
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('deliveryAddress').value.trim();
    
    // Validation
    if(!name) {
        showToast('Please enter your full name', 'error');
        document.getElementById('customerName').focus();
        return;
    }
    
    if(!phone) {
        showToast('Please enter your phone number', 'error');
        document.getElementById('customerPhone').focus();
        return;
    }
    
    if(!address) {
        showToast('Please enter your delivery address', 'error');
        document.getElementById('deliveryAddress').focus();
        return;
    }
    
    if(!selectedDelivery) {
        showToast('Please select a delivery method', 'error');
        return;
    }
    
    if(cart.length === 0){
        showToast('YOUR CART IS EMPTY!', 'warning');
        return;
    }
    
    console.log('Form validation passed');
    
    // Calculate total
    let subtotal = 0;
    cart.forEach(item => subtotal += item.price);
    const total = subtotal + 2; // Delivery fee
    
    // Store order data temporarily
    currentOrder = {
        customer: { name, phone, address },
        delivery: selectedDelivery,
        total: total,
        subtotal: subtotal,
        items: [...cart],
        timestamp: new Date().toISOString(),
        orderId: 'EM' + Date.now().toString().slice(-6)
    };
    
    // Show total in modal
    document.getElementById('paymentTotal').textContent = `Total: $${total}`;
    
    // Show QR modal
    document.getElementById('qrModal').style.display = 'flex';
    
    console.log('Order prepared:', currentOrder);
    showToast('Order validated successfully!', 'success');
}

// Confirm Receipt Upload
async function confirmUpload(){
    const fileInput = document.getElementById('receiptFile');
    const files = fileInput.files;
    
    if(files.length === 0){
        showToast('PLEASE UPLOAD PAYMENT RECEIPT!', 'error');
        return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    for (let file of files) {
        if (file.size > maxSize) {
            showToast('File too large! Maximum size is 5MB', 'error');
            return;
        }
    }
    
    console.log('Starting receipt upload process...');
    
    // Show loading state
    showLoading(true);
    const confirmBtn = document.querySelector('.confirm-btn');
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = 'UPLOADING...';
    confirmBtn.disabled = true;
    
    try {
        // Process order
        await processOrderWithReceipt(files);
        console.log('Order processed successfully');
    } catch (error) {
        console.error('Order processing error:', error);
        showToast('Error processing order. Please try again.', 'error');
    } finally {
        // Reset button state
        showLoading(false);
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }
}

// Process order with receipt
async function processOrderWithReceipt(receiptFiles){
    console.log('Processing order with receipt...');
    
    if (!currentOrder) {
        throw new Error('No current order found');
    }
    
    const order = {
        ...currentOrder,
        receiptFiles: receiptFiles.length,
        status: 'pending'
    };
    
    // MARK PRODUCTS AS SOLD OUT
    console.log('Marking products as sold out...');
    order.items.forEach(item => {
        const product = productsData.find(p => p.id === item.id);
        if (product) {
            product.inStock = false; // Mark as sold out
            console.log(`Marked product as sold out: ${product.title}`);
        }
    });
    
    // Save updated products data
    localStorage.setItem('products', JSON.stringify(productsData));
    
    // Save order to localStorage (no database)
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    console.log('Order saved to local storage');
    
    // Send Telegram notification with receipt (optional)
    await sendTelegramNotificationWithReceipt(order, receiptFiles);
    
    // Clear cart
    localStorage.removeItem('cart');
    cart = [];
    
    // Hide QR modal and show success
    document.getElementById('qrModal').style.display = 'none';
    document.getElementById('successModal').style.display = 'flex';
    
    console.log('Order process completed successfully');
    showToast('🎉 Order completed successfully!', 'success');
}

// Send Telegram notification with receipt (Optional - can be removed)
async function sendTelegramNotificationWithReceipt(order, receiptFiles){
    const deliveryText = order.delivery === 'jnt' ? 'J&T Express' : 'Virak Bunthan';
    
    const message = `🛒 **NEW ORDER RECEIVED!** 🛒

👤 **Customer Information:**
• Name: ${order.customer.name}
• Phone: ${order.customer.phone}
• Delivery: ${deliveryText}
• Address: ${order.customer.address}

📦 **Order Items (${order.items.length} items):**
${order.items.map(item => `• ${item.title}${item.size ? ` (${item.size})` : ''} - $${item.price}`).join('\n')}

💰 **Order Summary:**
• Items Total: $${order.subtotal}
• Delivery Fee: $2
• **Grand Total: $${order.total}**

⏰ **Order Time:** ${new Date(order.timestamp).toLocaleString()}
🆔 **Order ID:** ${order.orderId}

📎 **Receipt uploaded (${receiptFiles.length} file${receiptFiles.length > 1 ? 's' : ''})**`;

    console.log('Sending Telegram notification...');
    
    try {
        // Send text message
        const messageResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        if (!messageResponse.ok) {
            throw new Error(`Telegram API error: ${messageResponse.status}`);
        }
        
        console.log('Telegram message sent successfully');
        
        // Send receipt files (optional)
        if(receiptFiles.length > 0) {
            for (let i = 0; i < Math.min(receiptFiles.length, 3); i++) {
                const formData = new FormData();
                formData.append('chat_id', TELEGRAM_CHAT_ID);
                formData.append('document', receiptFiles[i]);
                formData.append('caption', `Receipt ${i + 1} for Order ${order.orderId}`);
                
                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
                    method: 'POST',
                    body: formData
                });
                
                console.log(`Receipt file ${i + 1} sent`);
            }
        }
        
    } catch (error) {
        console.error('Telegram notification failed:', error);
        // Continue anyway - order is saved locally
    }
}

// Cancel Payment
function cancelPayment(){
    document.getElementById('qrModal').style.display = 'none';
    document.getElementById('receiptFile').value = '';
    console.log('Payment cancelled');
    showToast('Payment cancelled', 'info');
}

// Show Loading Overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
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

// Navigation functions
function goBack(){
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Going back, cart saved');
    window.history.back();
}

function goHome(){
    console.log('Going home');
    window.location.href = 'index.html';
}

// Export functions for global access
window.removeCartItem = removeCartItem;
window.clearCart = clearCart;
window.selectDelivery = selectDelivery;
window.validateAndShowQR = validateAndShowQR;
window.confirmUpload = confirmUpload;
window.cancelPayment = cancelPayment;
window.goBack = goBack;
window.goHome = goHome;