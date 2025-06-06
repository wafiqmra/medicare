const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3001;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration
app.use(session({
  secret: 'rahasia-kesehatan',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Static files configuration (letakkan di awal)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// Authentication middleware
function requireLogin(req, res, next) {
  if (!req.session.username) {
    return res.redirect('/login');
  }
  next();
}

// ========== VIEW ROUTES ========== //
app.get('/', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/login', (req, res) => {
  if (req.session.username) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/register', (req, res) => {
  if (req.session.username) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'views/register.html'));
});

// ========== AUTHENTICATION ROUTES ========== //
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkQuery, [username], (err, results) => {
    if (err) return res.status(500).send('Error checking user.');
    if (results.length > 0) {
      return res.status(400).send('Username sudah terdaftar. <a href="/register">Coba lagi</a>');
    }

    const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(insertQuery, [username, password], (err) => {
      if (err) return res.status(500).send('Gagal menyimpan user.');
      res.redirect('/login');
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).send('Error saat login.');
    if (results.length > 0) {
      req.session.username = username;
      return res.redirect('/');
    }
    res.status(401).send('Login gagal. <a href="/login">Coba lagi</a>');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// ========== FEATURE ROUTES ========== //
const featureRouters = {
  '/apotek': require('./routes/apotek'),
  '/diagnosa': require('./routes/diagnosa'),
  '/telemedicine': require('./routes/telemedicine'),
  // '/risetobat': require('./routes/fungsiobat'),
  // '/uploadresep': require('./routes/uploadresep'),
  // '/promoobat': require('./routes/promoobat'),
  // '/lacakpesanan': require('./routes/lacakpesanan'),
  '/fungsiobat': require('./routes/fungsiobat')
};

// Daftarkan semua route fitur dengan requireLogin
Object.entries(featureRouters).forEach(([path, router]) => {
  app.use(path, requireLogin, router);
});

// Route untuk halaman apotek
app.get('/apotek', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views/apotek.html'));
});

// ========== ERROR HANDLING ========== //
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Terjadi kesalahan pada server');
});

// 404 handler (harus di bagian paling akhir)
app.use((req, res) => {
  res.status(404).send('Halaman tidak ditemukan');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});