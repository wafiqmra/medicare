const express = require('express');
const router = express.Router();
const path = require('path');

// Sample promo data
const promos = [
    {
        id: 'P001',
        name: 'Vitamin C 500mg',
        category: 'vitamin',
        originalPrice: 75000,
        discountPrice: 60000,
        discountPercent: 20,
        image: '/images/promo/vitamin-c.jpg',
        validUntil: '2023-12-31',
        description: 'Meningkatkan daya tahan tubuh dengan vitamin C dosis tinggi'
    },
    {
        id: 'P002',
        name: 'Paracetamol 500mg',
        category: 'obat-bebas',
        originalPrice: 25000,
        discountPrice: 20000,
        discountPercent: 20,
        image: '/images/promo/paracetamol.jpg',
        validUntil: '2023-11-30',
        description: 'Obat penurun panas dan pereda nyeri'
    },
    {
        id: 'P003',
        name: 'Masker Medis 50pcs',
        category: 'alat-kesehatan',
        originalPrice: 50000,
        discountPrice: 40000,
        discountPercent: 20,
        image: '/images/promo/masker.jpg',
        validUntil: '2023-10-31',
        description: 'Masker medis 3 ply dengan kualitas tinggi'
    },
    {
        id: 'P004',
        name: 'Omeprazole 20mg',
        category: 'obat-keras',
        originalPrice: 120000,
        discountPrice: 100000,
        discountPercent: 17,
        image: '/images/promo/omeprazole.jpg',
        validUntil: '2023-12-15',
        description: 'Obat maag dengan resep dokter'
    }
];

// Promo page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/promoobat.html'));
});

// API endpoint for promos
router.get('/api/promos', (req, res) => {
    const { category, sort } = req.query;
    
    // Filter by category if specified
    let filteredPromos = promos;
    if (category && category !== 'all') {
        filteredPromos = promos.filter(promo => promo.category === category);
    }
    
    // Sort promos
    switch(sort) {
        case 'newest':
            filteredPromos.sort((a, b) => new Date(b.validUntil) - new Date(a.validUntil));
            break;
        case 'discount':
            filteredPromos.sort((a, b) => b.discountPercent - a.discountPercent);
            break;
        case 'price-low':
            filteredPromos.sort((a, b) => a.discountPrice - b.discountPrice);
            break;
        case 'price-high':
            filteredPromos.sort((a, b) => b.discountPrice - a.discountPrice);
            break;
        default:
            // Default sorting (newest)
            filteredPromos.sort((a, b) => new Date(b.validUntil) - new Date(a.validUntil));
    }
    
    res.json(filteredPromos);
});

module.exports = router;