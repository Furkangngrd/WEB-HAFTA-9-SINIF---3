/**
 * Görev 3 — XSS Fix + CSP (GÜVENLİ)
 */
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const comments = [];

// HTML encoding fonksiyonu
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ✅ CSP Header Middleware
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "frame-ancestors 'none'; " +
    "form-action 'self'"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ✅ Reflected XSS — korumalı
app.get('/search', (req, res) => {
  const q = escapeHtml(req.query.q || '');
  res.send(`
    <html>
    <head><title>Arama (Güvenli)</title></head>
    <body>
      <h1>Arama Sonuçları (CSP Aktif)</h1>
      <p>Aranan: ${q}</p>
      <form><input name="q" value="${q}"><button>Ara</button></form>
    </body>
    </html>
  `);
});

// ✅ Stored XSS — korumalı
app.get('/comments', (req, res) => {
  const html = comments.map(c =>
    `<div class="comment"><b>${escapeHtml(c.name)}</b>: ${escapeHtml(c.text)}</div>`
  ).join('');
  res.send(`
    <html>
    <body>
      <h1>Yorumlar (CSP Aktif)</h1>
      ${html}
      <form method="POST" action="/comments">
        <input name="name" placeholder="İsim">
        <textarea name="text" placeholder="Yorum"></textarea>
        <button>Gönder</button>
      </form>
    </body>
    </html>
  `);
});

app.post('/comments', (req, res) => {
  comments.push({ name: req.body.name, text: req.body.text });
  res.redirect('/comments');
});

app.listen(3001, () => {
  console.log('✅ GÜVENLİ XSS+CSP uygulaması: http://localhost:3001');
  console.log('CSP inline script yürütmeyi engelleyecek');
});
