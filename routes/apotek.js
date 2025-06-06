const express = require('express');
const router = express.Router();
const db = require('../db');

// Ambil semua produk
router.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Tambah ke keranjang (simpan di session)
router.post('/add-to-cart', (req, res) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    
    const { productId, quantity } = req.body;
    
    db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
        if (err) throw err;
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = results[0];
        
        if (quantity > product.stock) {
            return res.status(400).json({ error: 'Not enough stock' });
        }
        
        // Cek apakah produk sudah ada di keranjang
        const existingItem = req.session.cart.find(item => item.id == productId);
        
        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            req.session.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: parseInt(quantity),
                image: product.image_path,
                stock: product.stock
            });
        }
        
        res.json({ success: true, cart: req.session.cart });
    });
});

// Hapus dari keranjang
router.post('/remove-from-cart', (req, res) => {
    const { productId } = req.body;
    
    if (!req.session.cart) {
        return res.json({ success: true, cart: [] });
    }
    
    req.session.cart = req.session.cart.filter(item => item.id != productId);
    res.json({ success: true, cart: req.session.cart });
});

// Update keranjang
router.post('/update-cart', (req, res) => {
    const { productId, quantity } = req.body;
    
    if (!req.session.cart) {
        return res.json({ success: true, cart: [] });
    }
    
    const item = req.session.cart.find(item => item.id == productId);
    
    if (item) {
        item.quantity = parseInt(quantity);
    }
    
    res.json({ success: true, cart: req.session.cart });
});

// Buat pesanan
router.post('/checkout', (req, res) => {
    const { name, email, phone, address, shipping_address } = req.body;
    const cart = req.session.cart || [];
    
    if (cart.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Hitung total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Mulai transaksi
    db.beginTransaction(err => {
        if (err) throw err;
        
        // 1. Simpan data pelanggan
        db.query(
            'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
            [name, email, phone, address],
            (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        throw err;
                    });
                }
                
                const customerId = result.insertId;
                
                // 2. Simpan pesanan
                db.query(
                    'INSERT INTO orders (customer_id, total_amount, shipping_address) VALUES (?, ?, ?)',
                    [customerId, total, shipping_address],
                    (err, result) => {
                        if (err) {
                            return db.rollback(() => {
                                throw err;
                            });
                        }
                        
                        const orderId = result.insertId;
                        const orderItems = [];
                        
                        // 3. Simpan item pesanan dan update stok
                        cart.forEach(item => {
                            db.query(
                                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                                [orderId, item.id, item.quantity, item.price],
                                (err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            throw err;
                                        });
                                    }
                                    
                                    // Update stok produk
                                    db.query(
                                        'UPDATE products SET stock = stock - ? WHERE id = ?',
                                        [item.quantity, item.id],
                                        (err) => {
                                            if (err) {
                                                return db.rollback(() => {
                                                    throw err;
                                                });
                                            }
                                            
                                            orderItems.push(item);
                                            
                                            // Jika semua item sudah diproses
                                            if (orderItems.length === cart.length) {
                                                db.commit(err => {
                                                    if (err) {
                                                        return db.rollback(() => {
                                                            throw err;
                                                        });
                                                    }
                                                    
                                                    // Kosongkan keranjang
                                                    req.session.cart = [];
                                                    
                                                    res.json({ 
                                                        success: true, 
                                                        orderId,
                                                        total
                                                    });
                                                });
                                            }
                                        }
                                    );
                                }
                            );
                        });
                    }
                );
            }
        );
    });
});

// Ambil data pesanan untuk struk
router.get('/order/:id', (req, res) => {
    const orderId = req.params.id;
    
    db.query(`
        SELECT o.id, o.order_date, o.total_amount, o.shipping_address,
               c.name AS customer_name, c.email, c.phone, c.address
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?
    `, [orderId], (err, orderResults) => {
        if (err) throw err;
        
        if (orderResults.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        db.query(`
            SELECT oi.quantity, oi.price, p.name, p.description
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId], (err, itemResults) => {
            if (err) throw err;
            
            res.json({
                order: orderResults[0],
                items: itemResults
            });
        });
    });
});

module.exports = router;