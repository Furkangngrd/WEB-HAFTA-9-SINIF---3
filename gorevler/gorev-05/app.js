/**
 * Görev 5 — JWT ZAAFİYETLİ
 */
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// ❌ Zayıf secret
const SECRET = 'secret123';

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    // ❌ Expiration yok, hassas veri payload'da
    const token = jwt.sign({
      user: username,
      role: 'admin',
      password: password,  // ❌ Şifre payload'da!
      email: 'admin@test.com'
    }, SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Geçersiz' });
  }
});

app.get('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token gerekli' });
  try {
    // ❌ Algorithm kısıtlaması yok
    const decoded = jwt.verify(token, SECRET);
    res.json(decoded);
  } catch (err) {
    res.status(403).json({ error: 'Geçersiz token' });
  }
});

app.listen(3000, () => {
  console.log('⚠️  ZAAFİYETLİ JWT: http://localhost:3000');
  console.log('POST /login body: {"username":"admin","password":"admin"}');
});
