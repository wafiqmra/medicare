const express = require('express');
const router = express.Router();
const path = require('path');

// Sample order data (in a real app, this would come from a database)
const sampleOrders = {
    'ORD-123456': {
        id: 'ORD-123456',
        customer: {
            name: 'John Doe',
            phone: '+6281234567890'
        },
        items: [
            { name: 'Vitamin C 500mg', quantity: 2, price: 60000 },
            { name: 'Paracetamol 500mg', quantity: 1, price: 20000 }
        ],
        total: 140000,
        status: 'shipped',
        orderDate: '2023-10-15',
        estimatedDelivery: '2023-10-20',
        trackingNumber: 'JNE-123456789',
        trackingHistory: [
            { date: '2023-10-15 10:30', status: 'Pesanan diterima', location: 'Jakarta' },
            { date: '2023-10-16 14:15', status: 'Pesanan diproses', location: 'Jakarta' },
            { date: '2023-10-18 09:45', status: 'Dalam pengiriman', location: 'Jakarta' }
        ]
    },
    'ORD-789012': {
        id: 'ORD-789012',
        customer: {
            name: 'Jane Smith',
            phone: '+6289876543210'
        },
        items: [
            { name: 'Masker Medis', quantity: 5, price: 25000 }
        ],
        total: 25000,
        status: 'delivered',
        orderDate: '2023-10-10',
        deliveryDate: '2023-10-13',
        trackingNumber: 'JNE-987654321',
        trackingHistory: [
            { date: '2023-10-10 11:20', status: 'Pesanan diterima', location: 'Jakarta' },
            { date: '2023-10-11 08:45', status: 'Pesanan diproses', location: 'Jakarta' },
            { date: '2023-10-12 13:30', status: 'Dalam pengiriman', location: 'Jakarta' },
            { date: '2023-10-13 15:15', status: 'Pesanan diterima', location: 'Bandung' }
        ]
    }
};

// Track order page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/lacakpesanan.html'));
});

// API endpoint for order tracking
router.post('/api/track', (req, res) => {
    const { orderNumber, phoneNumber } = req.body;
    
    // Validate inputs
    if (!orderNumber || !phoneNumber) {
        return res.status(400).json({ error: 'Nomor pesanan dan nomor telepon harus diisi' });
    }
    
    // Find the order
    const order = sampleOrders[orderNumber];
    
    if (!order) {
        return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }
    
    // Verify phone number (last 4 digits for demo purposes)
    const lastFourDigits = phoneNumber.slice(-4);
    const customerLastFour = order.customer.phone.slice(-4);
    
    if (lastFourDigits !== customerLastFour) {
        return res.status(403).json({ error: 'Nomor telepon tidak sesuai dengan pesanan' });
    }
    
    // Return order tracking information
    res.json({
        success: true,
        order: {
            id: order.id,
            status: order.status,
            estimatedDelivery: order.estimatedDelivery,
            trackingNumber: order.trackingNumber,
            trackingHistory: order.trackingHistory
        }
    });
});

module.exports = router;