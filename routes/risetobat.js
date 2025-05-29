const express = require('express');
const router = express.Router();
const path = require('path');

const dataObat = [
  { nama: "Paracetamol", fungsi: "Menurunkan demam dan mengurangi nyeri" },
  { nama: "Amoxicillin", fungsi: "Antibiotik untuk infeksi bakteri" },
  { nama: "Loratadine", fungsi: "Antihistamin untuk alergi" }
];

router.get('/', (req, res) => {
  let html = '<h2>Database Riset Obat</h2><ul>';
  dataObat.forEach(obat => {
    html += `<li><strong>${obat.nama}</strong>: ${obat.fungsi}</li>`;
  });
  html += '</ul><a href="/">Kembali ke Menu</a>';
  res.send(html);
});

module.exports = router;
