// Sample product data
const products = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    price: 15000,
    stock: 50,
    image: "https://via.placeholder.com/150?text=Paracetamol"
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    price: 25000,
    stock: 30,
    image: "https://via.placeholder.com/150?text=Amoxicillin"
  },
  {
    id: 3,
    name: "Vitamin C 500mg",
    price: 20000,
    stock: 100,
    image: "https://via.placeholder.com/150?text=Vitamin+C"
  },
  {
    id: 4,
    name: "Omeprazole 20mg",
    price: 30000,
    stock: 25,
    image: "https://via.placeholder.com/150?text=Omeprazole"
  },
  {
    id: 5,
    name: "Cetirizine 10mg",
    price: 18000,
    stock: 40,
    image: "https://via.placeholder.com/150?text=Cetirizine"
  },
  {
    id: 6,
    name: "Ibuprofen 400mg",
    price: 22000,
    stock: 35,
    image: "https://via.placeholder.com/150?text=Ibuprofen"
  }
];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const addressModal = document.getElementById('addressModal');
const receiptModal = document.getElementById('receiptModal');
const addressForm = document.getElementById('addressForm');
const receiptContent = document.getElementById('receiptContent');
const printReceiptBtn = document.getElementById('printReceiptBtn');
const finishBtn = document.getElementById('finishBtn');

// Cart state
let cart = [];

// Initialize the app
function init() {
  renderProducts(products);
  loadCart();
  setupEventListeners();
}

// Render products to the page
function renderProducts(productsToRender) {
  productsGrid.innerHTML = '';
  
  productsToRender.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    const inCart = cart.find(item => item.id === product.id);
    const availableStock = product.stock - (inCart ? inCart.quantity : 0);
    
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-price">Rp ${product.price.toLocaleString()}</p>
      <p class="product-stock">Stok: ${availableStock}</p>
      <button class="add-to-cart" data-id="${product.id}" ${availableStock <= 0 ? 'disabled' : ''}>
        ${availableStock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
      </button>
    `;
    
    productsGrid.appendChild(productCard);
  });
}

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('apotek_medicare_cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    renderCart();
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('apotek_medicare_cart', JSON.stringify(cart));
}

// Render cart items
function renderCart() {
  cartItems.innerHTML = '';
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Keranjang belanja kosong</p>';
    cartTotal.textContent = 'Rp 0';
    checkoutBtn.disabled = true;
    return;
  }
  
  let total = 0;
  
  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    const itemTotal = product.price * item.quantity;
    total += itemTotal;
    
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    
    cartItem.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${product.name}</div>
        <div class="cart-item-price">Rp ${product.price.toLocaleString()} x ${item.quantity}</div>
      </div>
      <div class="cart-item-total">Rp ${itemTotal.toLocaleString()}</div>
      <div class="cart-item-actions">
        <div class="cart-item-quantity">
          <button class="decrease-quantity" data-id="${product.id}">-</button>
          <span>${item.quantity}</span>
          <button class="increase-quantity" data-id="${product.id}" ${item.quantity >= product.stock ? 'disabled' : ''}>+</button>
        </div>
        <button class="remove-item" data-id="${product.id}"><i class="fas fa-trash"></i></button>
      </div>
    `;
    
    cartItems.appendChild(cartItem);
  });
  
  cartTotal.textContent = `Rp ${total.toLocaleString()}`;
  checkoutBtn.disabled = false;
  
  // Re-render products to update stock availability
  renderProducts(products);
}

// Setup event listeners
function setupEventListeners() {
  // Add to cart buttons
  productsGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      const productId = parseInt(e.target.getAttribute('data-id'));
      addToCart(productId);
    }
  });
  
  // Cart item actions
  cartItems.addEventListener('click', (e) => {
    if (e.target.classList.contains('decrease-quantity') || e.target.parentElement.classList.contains('decrease-quantity')) {
      const button = e.target.classList.contains('decrease-quantity') ? e.target : e.target.parentElement;
      const productId = parseInt(button.getAttribute('data-id'));
      updateCartItemQuantity(productId, -1);
    }
    
    if (e.target.classList.contains('increase-quantity') || e.target.parentElement.classList.contains('increase-quantity')) {
      const button = e.target.classList.contains('increase-quantity') ? e.target : e.target.parentElement;
      const productId = parseInt(button.getAttribute('data-id'));
      updateCartItemQuantity(productId, 1);
    }
    
    if (e.target.classList.contains('remove-item') || e.target.parentElement.classList.contains('remove-item')) {
      const button = e.target.classList.contains('remove-item') ? e.target : e.target.parentElement;
      const productId = parseInt(button.getAttribute('data-id'));
      removeFromCart(productId);
    }
  });
  
  // Search functionality
  searchBtn.addEventListener('click', searchProducts);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchProducts();
    }
  });
  
  // Checkout button
  checkoutBtn.addEventListener('click', () => {
    addressModal.style.display = 'flex';
  });
  
  // Address form submission
  addressForm.addEventListener('submit', (e) => {
    e.preventDefault();
    processCheckout();
  });
  
  // Modal close buttons
  document.querySelectorAll('.close-btn').forEach(button => {
    button.addEventListener('click', () => {
      addressModal.style.display = 'none';
      receiptModal.style.display = 'none';
    });
  });
  
  // Print receipt button
  printReceiptBtn.addEventListener('click', printReceipt);
  
  // Finish button
  finishBtn.addEventListener('click', () => {
    receiptModal.style.display = 'none';
    cart = [];
    saveCart();
    renderCart();
    renderProducts(products);
  });
}

// Add product to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  
  if (!product) return;
  
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    if (existingItem.quantity < product.stock) {
      existingItem.quantity += 1;
    }
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  
  saveCart();
  renderCart();
}

// Update cart item quantity
function updateCartItemQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  const product = products.find(p => p.id === productId);
  
  if (!item || !product) return;
  
  const newQuantity = item.quantity + change;
  
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  if (newQuantity > product.stock) {
    return;
  }
  
  item.quantity = newQuantity;
  saveCart();
  renderCart();
}

// Remove product from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
}

// Search products
function searchProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  if (searchTerm === '') {
    renderProducts(products);
    return;
  }
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm)
  );
  
  renderProducts(filteredProducts);
}

// Process checkout
function processCheckout() {
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  
  generateReceipt(name, phone, address);
  addressModal.style.display = 'none';
  receiptModal.style.display = 'flex';
}

// Generate receipt
function generateReceipt(name, phone, address) {
  let total = 0;
  const date = new Date();
  
  let itemsHtml = '';
  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    const itemTotal = product.price * item.quantity;
    total += itemTotal;
    
    itemsHtml += `
      <tr>
        <td>${product.name} x${item.quantity}</td>
        <td>Rp ${itemTotal.toLocaleString()}</td>
      </tr>
    `;
  });
  
  receiptContent.innerHTML = `
    <div class="receipt-header">
      <h3>Apotek Medicare</h3>
      <p>Jl. Kesehatan No. 123, Jakarta</p>
      <p>Telp: (021) 1234567</p>
    </div>
    
    <div class="receipt-details">
      <p><strong>No. Transaksi:</strong> ${date.getTime()}</p>
      <p><strong>Tanggal:</strong> ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
      <p><strong>Nama:</strong> ${name}</p>
      <p><strong>Telepon:</strong> ${phone}</p>
      <p><strong>Alamat:</strong> ${address}</p>
    </div>
    
    <table class="receipt-items">
      <thead>
        <tr>
          <th>Item</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <div class="receipt-total">
      <p>Total: Rp ${total.toLocaleString()}</p>
    </div>
    
    <div class="receipt-footer">
      <p>Terima kasih telah berbelanja di Apotek Medicare</p>
      <p>Obat akan segera dikirim ke alamat Anda</p>
    </div>
  `;
}

// Print receipt
function printReceipt() {
  const receipt = receiptContent.innerHTML;
  const originalContent = document.body.innerHTML;
  
  document.body.innerHTML = `
    <style>
      body {
        font-family: 'Courier New', Courier, monospace;
        padding: 20px;
      }
      .receipt {
        width: 80mm;
        margin: 0 auto;
      }
      .receipt-header {
        text-align: center;
        margin-bottom: 15px;
      }
      .receipt-items {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }
      .receipt-items th {
        text-align: left;
        padding: 5px 0;
        border-bottom: 1px dashed #000;
      }
      .receipt-items td {
        padding: 5px 0;
      }
      .receipt-total {
        text-align: right;
        font-weight: bold;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed #000;
      }
      .receipt-footer {
        margin-top: 20px;
        font-size: 12px;
        text-align: center;
      }
      @media print {
        @page {
          size: auto;
          margin: 0;
        }
        body {
          padding: 10px;
        }
      }
    </style>
    <div class="receipt">${receipt}</div>
  `;
  
  window.print();
  document.body.innerHTML = originalContent;
  renderCart();
}

// Initialize the application
init();