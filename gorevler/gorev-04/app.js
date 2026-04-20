/**
 * Görev 4 — CSRF Demo (ZAAFİYETLİ)
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'session-secret',
  resave: false,
  saveUninitialized: true
}));

// Sahte kullanıcı bakiyesi
const users = { admin: { balance: 10000 } };

app.get('/', (req, res) => {
  req.session.user = 'admin'; // Otomatik login
  res.send(`
    <html>
    <body>
      <h1>Banka - Para Transferi</h1>
      <p>Bakiye: ${users.admin.balance} TL</p>
      <form method="POST" action="/transfer">
        <input name="to" placeholder="Alıcı">
        <input name="amount" type="number" placeholder="Miktar">
        <button>Transfer Et</button>
      </form>
    </body>
    </html>
  `);
});

// ❌ CSRF koruması YOK
app.post('/transfer', (req, res) => {
  if (!req.session.user) return res.status(401).send('Giriş yapın');
  const amount = parseInt(req.body.amount);
  users.admin.balance -= amount;
  console.log(`⚠️ Transfer: ${amount} TL -> ${req.body.to}`);
  res.send(`<h1>Transfer başarılı!</h1><p>${amount} TL ${req.body.to} hesabına gönderildi.</p><p>Kalan: ${users.admin.balance} TL</p><a href="/">Geri</a>`);
});

app.listen(3000, () => {
  console.log('⚠️  ZAAFİYETLİ CSRF uygulaması: http://localhost:3000');
});
