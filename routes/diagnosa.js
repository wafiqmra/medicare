const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/diagnosa.html'));
});

router.post('/', (req, res) => {
  const keluhan = req.body.keluhan.toLowerCase();
  let hasil = "Keluhan tidak dikenali, silakan konsultasi lebih lanjut.";

  if (keluhan.includes("batuk")) hasil = "Kemungkinan infeksi saluran pernapasan.";
  else if (keluhan.includes("sakit kepala")) hasil = "Kemungkinan migrain atau tekanan darah tinggi.";

  res.send(`<h2>Hasil Diagnosa</h2><p>${hasil}</p><a href="/diagnosa">Kembali</a>`);
});

module.exports = router;
