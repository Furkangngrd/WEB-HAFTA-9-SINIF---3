// Örnek zaafiyetli uygulama — OWASP analiz için
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // A05 - Security Misconfiguration

const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'test' });

// A03 - SQL Injection
app.get('/user/:id', (req, res) => {
  db.query("SELECT * FROM users WHERE id=" + req.params.id, (err, result) => {
    res.json(result);
  });
});

// A03 - XSS (Reflected)
app.get('/search', (req, res) => {
  res.send('<h1>Sonuç: ' + req.query.q + '</h1>');
});

// A02 - Weak Secret
app.post('/login', (req, res) => {
  const token = jwt.sign({ user: req.body.username }, 'secret123');
  res.json({ token });
});

// A10 - SSRF
app.post('/fetch-url', (req, res) => {
  axios.get(req.body.url).then(r => res.send(r.data));
});

// A07 - Hardcoded password
app.post('/admin', (req, res) => {
  if (req.body.password == 'admin123') {
    res.json({ admin: true });
  }
});

app.listen(3000);
// Loglama yok — A09
