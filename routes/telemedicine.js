const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/telemedicine.html'));
});

router.post('/', (req, res) => {
  const { nama, email, keluhan } = req.body;

  res.send(`
    <h2>Data Konsultasi Terkirim</h2>
    <p><strong>Nama:</strong> ${nama}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Keluhan:</strong> ${keluhan}</p>
    <a href="/telemedicine">Kembali</a>
  `);
});

module.exports = router;
