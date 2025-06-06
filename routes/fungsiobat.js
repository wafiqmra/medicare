const express = require('express');
const router = express.Router();
const db = require('../db');

// Tampilkan halaman fungsi obat
router.get('/', (req, res) => {
  res.sendFile('fungsiobat.html', { root: './views' });
});

// Endpoint ambil data dari database
router.get('/data', (req, res) => {
  const query = 'SELECT id, nama_obat, fungsi, cara_pakai FROM fungsi_obat';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Gagal ambil data fungsi_obat:', err);
      return res.status(500).json({ error: 'Gagal mengambil data dari database.' });
    }
    res.json(results);
  });
});

module.exports = router;
