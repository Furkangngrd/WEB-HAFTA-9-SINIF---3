/**
 * Görev 6 — OAuth 2.0 + PKCE Demo (Google Login)
 */
const express = require('express');
const crypto = require('crypto');
const session = require('express-session');
require('dotenv').config();

const app = express();
app.use(session({
  secret: 'oauth-session-secret',
  resave: false,
  saveUninitialized: true
}));

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/auth/callback';

// PKCE helper fonksiyonları
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

// Ana sayfa
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head><title>OAuth + PKCE Demo</title>
    <style>
      body { font-family: Arial; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a2e; color: white; }
      .container { text-align: center; padding: 2rem; background: #16213e; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
      .btn { display: inline-flex; align-items: center; gap: 10px; padding: 12px 24px; background: #4285f4; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; text-decoration: none; }
      .btn:hover { background: #3367d6; }
    </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 OAuth 2.0 + PKCE Demo</h1>
        <p>Google hesabınızla güvenli giriş yapın</p>
        <a href="/auth/login" class="btn">🔑 Google ile Giriş Yap</a>
      </div>
    </body>
    </html>
  `);
});

// OAuth başlat — PKCE ile
app.get('/auth/login', (req, res) => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString('hex');

  // Session'a kaydet
  req.session.codeVerifier = codeVerifier;
  req.session.state = state;

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'offline');

  console.log('PKCE code_verifier:', codeVerifier);
  console.log('PKCE code_challenge:', codeChallenge);
  console.log('State:', state);

  res.redirect(authUrl.toString());
});

// Callback — code ile token al
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  // State doğrulama
  if (state !== req.session.state) {
    return res.status(403).send('State mismatch - olası CSRF saldırısı!');
  }

  try {
    // Token exchange — PKCE code_verifier ile
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
        code_verifier: req.session.codeVerifier // PKCE
      })
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      return res.status(400).json(tokens);
    }

    // Kullanıcı bilgilerini al
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const user = await userRes.json();

    // Session temizle
    delete req.session.codeVerifier;
    delete req.session.state;

    res.send(`
      <html>
      <head><title>Giriş Başarılı</title>
      <style>
        body { font-family: Arial; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a2e; color: white; }
        .card { text-align: center; padding: 2rem; background: #16213e; border-radius: 12px; max-width: 400px; }
        img { border-radius: 50%; width: 80px; height: 80px; }
        .info { margin: 10px 0; padding: 8px; background: #0f3460; border-radius: 6px; }
      </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ Giriş Başarılı!</h1>
          <img src="${user.picture || ''}" alt="avatar">
          <div class="info"><strong>Ad:</strong> ${user.name}</div>
          <div class="info"><strong>Email:</strong> ${user.email}</div>
          <div class="info"><strong>ID:</strong> ${user.id}</div>
          <hr>
          <details>
            <summary>Token Bilgileri</summary>
            <pre style="text-align:left;font-size:11px;overflow:auto">${JSON.stringify(tokens, null, 2)}</pre>
          </details>
          <a href="/" style="color:#4285f4">← Ana Sayfa</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('🔐 OAuth + PKCE Demo: http://localhost:3000');
  console.log('Not: .env dosyasına GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET ekleyin');
});
