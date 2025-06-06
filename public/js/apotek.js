document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const productsContainer = document.getElementById('products');
    const checkoutForm = document.getElementById('checkout-form');
    const receiptContainer = document.getElementById('receipt');
    const printReceiptBtn = document.getElementById('print-receipt');
    const closeReceiptBtn = document.getElementById('close-receipt');
    const receiptModal = document.getElementById('receipt-modal');
    const cartCount = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartIcon = document.querySelector('.cart-icon');
    const sidebar = document.querySelector('.sidebar');
    
    let cart = [];
    
    // Initialize
    loadProducts();
    updateCartDisplay();
    
    // Toggle sidebar on mobile
    cartIcon.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Load products from server
    function loadProducts() {
        fetch('/apotek/products')
            .then(response => response.json())
            .then(products => {
                displayProducts(products);
            })
            .catch(error => console.error('Error:', error));
    }
    
    // Display products
    function displayProducts(products) {
        productsContainer.innerHTML = '';
        
        if (products.length === 0) {
            productsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-box-open"></i>
                    <p>Tidak ada produk tersedia</p>
                </div>
            `;
            return;
        }
        
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product';
            productElement.innerHTML = `
                <img src="${product.image_path || 'images/default-product.png'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description || 'No description available'}</p>
                <p class="price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <p class="stock">Stok: ${product.stock}</p>
                <div class="product-actions">
                    <input type="number" min="1" max="${product.stock}" value="1" class="quantity-input">
                    <button class="add-to-cart" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Tambah
                    </button>
                </div>
            `;
            
            productsContainer.appendChild(productElement);
        });
        
        // Add event listeners to all add-to-cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const quantityInput = this.previousElementSibling;
                const quantity = parseInt(quantityInput.value);
                
                addToCart(productId, quantity);
            });
        });
    }
    
    // Add item to cart
    function addToCart(productId, quantity) {
        fetch('/apotek/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, quantity })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert(data.error, 'error');
            } else {
                cart = data.cart;
                updateCartDisplay();
                showAlert('Produk telah ditambahkan ke keranjang', 'success');
                sidebar.classList.add('active'); // Show sidebar on mobile
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Terjadi kesalahan saat menambahkan ke keranjang', 'error');
        });
    }
    
    // Update cart display
    function updateCartDisplay() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Keranjang belanja kosong</p>
                </div>
            `;
            cartTotalElement.textContent = 'Rp 0';
            cartCount.textContent = '0';
            checkoutBtn.disabled = true;
            return;
        }
        
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        checkoutBtn.disabled = false;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image || 'images/default-product.png'}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Rp ${item.price.toLocaleString('id-ID')} x 
                    <input type="number" min="1" max="${item.stock}" value="${item.quantity}" 
                           data-id="${item.id}" class="cart-quantity"> = 
                    Rp ${itemTotal.toLocaleString('id-ID')}</p>
                </div>
                <button class="remove-from-cart" data-id="${item.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        cartTotalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;
        
        // Add event listeners to quantity inputs
        document.querySelectorAll('.cart-quantity').forEach(input => {
            input.addEventListener('change', function() {
                const productId = this.getAttribute('data-id');
                const quantity = parseInt(this.value);
                
                if (quantity < 1) {
                    this.value = 1;
                    return;
                }
                
                updateCartItem(productId, quantity);
            });
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                removeFromCart(productId);
            });
        });
    }
    
    // Update cart item quantity
    function updateCartItem(productId, quantity) {
        fetch('/apotek/update-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, quantity })
        })
        .then(response => response.json())
        .then(data => {
            cart = data.cart;
            updateCartDisplay();
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Terjadi kesalahan saat memperbarui keranjang', 'error');
        });
    }
    
    // Remove item from cart
    function removeFromCart(productId) {
        fetch('/apotek/remove-from-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId })
        })
        .then(response => response.json())
        .then(data => {
            cart = data.cart;
            updateCartDisplay();
            showAlert('Produk dihapus dari keranjang', 'info');
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Terjadi kesalahan saat menghapus dari keranjang', 'error');
        });
    }
    
    // Validate checkout form
    function validateCheckoutForm() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const shippingAddress = document.getElementById('shipping-address').value.trim();
        
        if (!name) {
            showAlert('Nama lengkap harus diisi', 'error');
            return false;
        }
        if (!email) {
            showAlert('Email harus diisi', 'error');
            return false;
        }
        if (!phone) {
            showAlert('Nomor telepon harus diisi', 'error');
            return false;
        }
        if (!address) {
            showAlert('Alamat harus diisi', 'error');
            return false;
        }
        if (!shippingAddress) {
            showAlert('Alamat pengiriman harus diisi', 'error');
            return false;
        }
        
        return true;
    }
    
    // Handle checkout form submission
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (cart.length === 0) {
            showAlert('Keranjang belanja kosong', 'error');
            return;
        }
        
        if (!validateCheckoutForm()) {
            return;
        }
        
        const formData = new FormData(this);
        const customerData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            shipping_address: formData.get('shipping-address')
        };
        
        // Add loading state
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        
        fetch('/apotek/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert(data.error, 'error');
            } else {
                showReceipt(data.orderId);
                cart = [];
                updateCartDisplay();
                checkoutForm.reset();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Terjadi kesalahan saat checkout', 'error');
        })
        .finally(() => {
            // Reset button state
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Checkout';
        });
    });
    
    // Show receipt
    function showReceipt(orderId) {
        fetch(`/apotek/order/${orderId}`)
            .then(response => response.json())
            .then(data => {
                const order = data.order;
                const items = data.items;
                
                let itemsHtml = '';
                let total = 0;
                
                items.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;
                    
                    itemsHtml += `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                            <td>Rp ${itemTotal.toLocaleString('id-ID')}</td>
                        </tr>
                    `;
                });
                
                receiptContainer.innerHTML = `
                    <div class="receipt-header">
                        <h2>Struk Pembelian</h2>
                        <h3>Medicare Pharmacy</h3>
                        <p>No. Pesanan: ${order.id}</p>
                        <p>Tanggal: ${new Date(order.order_date).toLocaleString('id-ID')}</p>
                    </div>
                    
                    <div class="customer-info">
                        <h4>Informasi Pelanggan</h4>
                        <p><strong>Nama:</strong> ${order.customer_name}</p>
                        <p><strong>Email:</strong> ${order.email}</p>
                        <p><strong>Telepon:</strong> ${order.phone}</p>
                        <p><strong>Alamat Pengiriman:</strong> ${order.shipping_address}</p>
                    </div>
                    
                    <table class="receipt-items">
                        <thead>
                            <tr>
                                <th>Produk</th>
                                <th>Qty</th>
                                <th>Harga</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="total-label">Total</td>
                                <td class="total-amount">Rp ${total.toLocaleString('id-ID')}</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <div class="receipt-footer">
                        <p>Terima kasih telah berbelanja di Medicare Pharmacy</p>
                        <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
                    </div>
                `;
                
                receiptModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Terjadi kesalahan saat memuat struk', 'error');
            });
    }
    
    // Print receipt
    printReceiptBtn.addEventListener('click', function() {
        window.print();
    });
    
    // Close receipt
    closeReceiptBtn.addEventListener('click', closeReceipt);
    
    // Close modal when clicking outside
    receiptModal.addEventListener('click', function(e) {
        if (e.target === receiptModal) {
            closeReceipt();
        }
    });
    
    function closeReceipt() {
        receiptModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Show alert message
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button class="close-alert">&times;</button>
        `;
        
        document.body.appendChild(alert);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 3000);
        
        // Close button
        alert.querySelector('.close-alert').addEventListener('click', () => {
            alert.remove();
        });
    }
});

// Add alert styles to CSS
const style = document.createElement('style');
style.textContent = `
    .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 250px;
        max-width: 350px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        transform: translateX(0);
        opacity: 1;
        transition: all 0.3s ease;
    }
    
    .alert-success {
        background-color: #2ecc71;
    }
    
    .alert-error {
        background-color: #e74c3c;
    }
    
    .alert-info {
        background-color: #3498db;
    }
    
    .close-alert {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 10px;
    }
    
    .fade-out {
        transform: translateX(100%);
        opacity: 0;
    }
`;
document.head.appendChild(style);