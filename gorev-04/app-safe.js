/**
 * Görev 4 — CSRF Fix (GÜVENLİ) — csrf-csrf kütüphanesi ile
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { doubleCsrf } = require('csrf-csrf');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('csrf-secret'));
app.use(session({
  secret: 'session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { sameSite: 'strict', httpOnly: true }
}));

// ✅ CSRF koruması
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => 'csrf-super-secret-key',
  cookieName: '__csrf',
  cookieOptions: { sameSite: 'strict', secure: false, httpOnly: true },
  getTokenFromRequest: (req) => req.body._csrf || req.headers['x-csrf-token']
});

const users = { admin: { balance: 10000 } };

app.get('/', (req, res) => {
  req.session.user = 'admin';
  const csrfToken = generateToken(req, res);
  res.send(`
    <html>
    <body>
      <h1>Banka - Para Transferi (CSRF Korumalı)</h1>
      <p>Bakiye: ${users.admin.balance} TL</p>
      <form method="POST" action="/transfer">
        <input type="hidden" name="_csrf" value="${csrfToken}">
        <input name="to" placeholder="Alıcı">
        <input name="amount" type="number" placeholder="Miktar">
        <button>Transfer Et</button>
      </form>
    </body>
    </html>
  `);
});

// ✅ CSRF middleware aktif
app.post('/transfer', doubleCsrfProtection, (req, res) => {
  if (!req.session.user) return res.status(401).send('Giriş yapın');
  const amount = parseInt(req.body.amount);
  users.admin.balance -= amount;
  console.log(`✅ Güvenli Transfer: ${amount} TL -> ${req.body.to}`);
  res.send(`<h1>Transfer başarılı!</h1><p>${amount} TL ${req.body.to} hesabına gönderildi.</p><p>Kalan: ${users.admin.balance} TL</p><a href="/">Geri</a>`);
});

// CSRF hata yakalama
app.use((err, req, res, next) => {
  if (err.message === 'invalid csrf token' || err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('<h1>🚫 CSRF Token Geçersiz!</h1><p>Bu istek reddedildi.</p>');
  }
  next(err);
});

app.listen(3001, () => {
  console.log('✅ GÜVENLİ CSRF uygulaması: http://localhost:3001');
});
