const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'rahasia-kesehatan',
  resave: false,
  saveUninitialized: true
}));

// Middleware untuk proteksi login
function requireLogin(req, res, next) {
  if (!req.session.username) {
    return res.redirect('/login');
  }
  next();
}

// Halaman utama - hanya bisa diakses kalau sudah login
app.get('/', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Halaman register
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/register.html'));
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkQuery, [username], (err, results) => {
    if (err) return res.send('Error checking user.');
    if (results.length > 0) {
      return res.send('Username sudah terdaftar. <a href="/register">Coba lagi</a>');
    }

    const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(insertQuery, [username, password], (err) => {
      if (err) return res.send('Gagal menyimpan user.');
      res.redirect('/login');
    });
  });
});

// Halaman login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) return res.send('Error saat login.');
    if (results.length > 0) {
      req.session.username = username;
      res.redirect('/');
    } else {
      res.send('Login gagal. <a href="/login">Coba lagi</a>');
    }
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

const apotekRouter = require('./routes/apotek');
app.use('/apotek', requireLogin, apotekRouter);


// Routing terproteksi
app.use('/diagnosa', requireLogin, require('./routes/diagnosa'));
app.use('/telemedicine', requireLogin, require('./routes/telemedicine'));
app.use('/risetobat', requireLogin, require('./routes/risetobat'));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
