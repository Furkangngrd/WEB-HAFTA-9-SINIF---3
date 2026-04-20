/**
 * Görev 2 — SQL Injection Fix (GÜVENLİ)
 */
const express = require('express');
const sqlite3 = require('better-sqlite3');

const app = express();
const db = new sqlite3(':memory:');

db.exec(`
  CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT);
  INSERT INTO users VALUES (1, 'admin', 'admin123', 'admin@test.com');
  INSERT INTO users VALUES (2, 'user1', 'pass456', 'user1@test.com');
  INSERT INTO users VALUES (3, 'user2', 'secret789', 'user2@test.com');
`);

// ✅ GÜVENLİ — Parametreli sorgu
app.get('/user/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Geçersiz ID' });
  }
  const stmt = db.prepare('SELECT id, username, email FROM users WHERE id = ?');
  const user = stmt.get(id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  }
});

// ✅ GÜVENLİ — Parametreli login
app.post('/login', express.json(), (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
  }
  const stmt = db.prepare('SELECT id, username, email FROM users WHERE username = ? AND password = ?');
  const user = stmt.get(username, password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Giriş başarısız' });
  }
});

app.listen(3001, () => {
  console.log('✅ GÜVENLİ uygulama: http://localhost:3001');
  console.log('Test: http://localhost:3001/user/1 OR 1=1 -> Hata verecek');
});
