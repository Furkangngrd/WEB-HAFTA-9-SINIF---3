/**
 * Görev 3 — XSS Demo (ZAAFİYETLİ)
 */
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const comments = [];

// ❌ Reflected XSS
app.get('/search', (req, res) => {
  const q = req.query.q || '';
  res.send(`
    <html>
    <head><title>Arama</title></head>
    <body>
      <h1>Arama Sonuçları</h1>
      <p>Aranan: ${q}</p>
      <form><input name="q" value="${q}"><button>Ara</button></form>
    </body>
    </html>
  `);
});

// ❌ Stored XSS
app.get('/comments', (req, res) => {
  const html = comments.map(c => `<div class="comment"><b>${c.name}</b>: ${c.text}</div>`).join('');
  res.send(`
    <html>
    <body>
      <h1>Yorumlar</h1>
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

app.listen(3000, () => {
  console.log('⚠️  ZAAFİYETLİ XSS uygulaması: http://localhost:3000');
  console.log('Test: http://localhost:3000/search?q=<script>alert("XSS")</script>');
});
