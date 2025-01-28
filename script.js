
const API_URL = 'https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889';
const CURRENCY_FORMATTER = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
});

// DOM Elements
const cartItemsContainer = document.querySelector('.cart-items');
const cartTotalsContainer = document.querySelector('.cart-totals');
const checkoutButton = document.querySelector('.checkout-btn');
const loaderOverlay = createLoader();

// Cart State
let cartState = {
    items: [],
    originalTotalPrice: 0,
    currency: 'INR'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
});

// Create Loader
function createLoader() {
    const overlay = document.createElement('div');
    overlay.className = 'loader-overlay';
    overlay.innerHTML = `
        <div class="loader"></div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

// Initialize Cart
async function initializeCart() {
    showLoader();
    try {
        // Try to get cart from localStorage first
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cartState = JSON.parse(savedCart);
            renderCart();
        }

        // Fetch fresh data from API
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Update cart state
        cartState = data;
        saveCartToLocalStorage();
        renderCart();
    } catch (error) {
        console.error('Error fetching cart:', error);
        showError('Failed to load cart data');
    } finally {
        hideLoader();
    }
}

// Render Cart
function renderCart() {
    renderCartItems();
    renderCartTotals();
}

// Render Cart Items
function renderCartItems() {
    const cartHeader = `
        <div class="cart-header">
            <div class="product-col">Product</div>
            <div class="price-col">Price</div>
            <div class="quantity-col">Quantity</div>
            <div class="subtotal-col">Subtotal</div>
        </div>
    `;

    const cartItems = cartState.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="product-col">
                <img src="${item.image}" alt="${item.title}" class="product-img">
                <div class="product-info">
                    <span class="product-name">${item.title}</span>
                    <p class="product-description">${item.product_description}</p>
                </div>
            </div>
            <div class="price-col">${formatCurrency(item.price)}</div>
            <div class="quantity-col">
                <input type="number" 
                       value="${item.quantity}" 
                       min="1" 
                       class="quantity-input"
                       onchange="updateQuantity(${item.id}, this.value)">
            </div>
            <div class="subtotal-col">
                <span>${formatCurrency(item.final_line_price)}</span>
                <button class="remove-btn" onclick="confirmRemoveItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    cartItemsContainer.innerHTML = cartHeader + cartItems;
}

// Render Cart Totals
function renderCartTotals() {
    const subtotal = calculateSubtotal();
    const total = subtotal; // Add tax or shipping if needed

    cartTotalsContainer.innerHTML = `
        <h2>Cart Totals</h2>
        <div class="totals-row">
            <span>Subtotal</span>
            <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="totals-row">
            <span>Total</span>
            <span class="total-amount">${formatCurrency(total)}</span>
        </div>
        <button class="checkout-btn" onclick="handleCheckout()">Check Out</button>
    `;
}

// Update Quantity
function updateQuantity(itemId, newQuantity) {
    const item = cartState.items.find(item => item.id === itemId);
    if (item) {
        item.quantity = parseInt(newQuantity);
        item.final_line_price = item.price * item.quantity;
        saveCartToLocalStorage();
        renderCart();
    }
}

// Remove Item
function confirmRemoveItem(itemId) {
    showModal({
        title: 'Remove Item',
        message: 'Are you sure you want to remove this item from your cart?',
        onConfirm: () => removeItem(itemId)
    });
}

function removeItem(itemId) {
    cartState.items = cartState.items.filter(item => item.id !== itemId);
    saveCartToLocalStorage();
    renderCart();
}

// Modal
function showModal({ title, message, onConfirm }) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-actions">
                <button class="btn-cancel">Cancel</button>
                <button class="btn-confirm">Confirm</button>
            </div>
        </div>
    `;

    modal.querySelector('.btn-cancel').onclick = () => modal.remove();
    modal.querySelector('.btn-confirm').onclick = () => {
        onConfirm();
        modal.remove();
    };

    document.body.appendChild(modal);
}

// Checkout Handler
function handleCheckout() {
    if (cartState.items.length === 0) {
        showError('Your cart is empty');
        return;
    }
    
    // Add our checkout logic here
    console.log('Proceeding to checkout with items:', cartState.items);
    showModal({
        title: 'Checkout',
        message: 'Proceeding to checkout...',
        onConfirm: () => {
            // Redirect to checkout page or handle checkout process
            window.location.href = '/checkout';
        }
    });
}

// Utility Functions
function calculateSubtotal() {
    return cartState.items.reduce((sum, item) => sum + item.final_line_price, 0);
}

function formatCurrency(amount) {
    return CURRENCY_FORMATTER.format(amount);
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cartState));
}

function showLoader() {
    loaderOverlay.style.display = 'flex';
}

function hideLoader() {
    loaderOverlay.style.display = 'none';
}

function showError(message) {
    const errorToast = document.createElement('div');
    errorToast.className = 'error-toast';
    errorToast.textContent = message;
    document.body.appendChild(errorToast);
    setTimeout(() => errorToast.remove(), 3000);
}

