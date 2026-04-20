/**
 * Görev 2 — SQL Injection Demo (ZAAFİYETLİ)
 */
const express = require('express');
const sqlite3 = require('better-sqlite3');

const app = express();
const db = new sqlite3(':memory:');

// Tablo oluştur ve örnek veri ekle
db.exec(`
  CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT);
  INSERT INTO users VALUES (1, 'admin', 'admin123', 'admin@test.com');
  INSERT INTO users VALUES (2, 'user1', 'pass456', 'user1@test.com');
  INSERT INTO users VALUES (3, 'user2', 'secret789', 'user2@test.com');
`);

// ❌ ZAAFİYETLİ — String concatenation ile SQL
app.get('/user/:id', (req, res) => {
  try {
    const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
    console.log('[VULNERABLE] Çalışan sorgu:', query);
    const rows = db.prepare(query).all();
    res.json({ query, results: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ ZAAFİYETLİ — Login
app.post('/login', express.json(), (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
  console.log('[VULNERABLE] Login sorgu:', query);
  try {
    const user = db.prepare(query).get();
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Giriş başarısız' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('⚠️  ZAAFİYETLİ uygulama: http://localhost:3000');
  console.log('Test: http://localhost:3000/user/1 OR 1=1');
});
