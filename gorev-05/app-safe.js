/**
 * Görev 5 — JWT GÜVENLİ
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// ✅ Güçlü secret (256-bit random)
const SECRET = crypto.randomBytes(64).toString('hex');

// ✅ Token blacklist
const revokedTokens = new Set();

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    // ✅ Expiration, issuer, audience, minimum payload
    const accessToken = jwt.sign(
      { sub: 'user-1', role: 'admin' },
      SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '15m',
        issuer: 'secscan-lab',
        audience: 'secscan-app'
      }
    );
    const refreshToken = jwt.sign(
      { sub: 'user-1', type: 'refresh' },
      SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    );
    res.json({ accessToken, refreshToken });
  } else {
    res.status(401).json({ error: 'Geçersiz kimlik' });
  }
});

app.get('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token gerekli' });

  // ✅ Revoked token kontrolü
  if (revokedTokens.has(token)) {
    return res.status(403).json({ error: 'Token iptal edilmiş' });
  }

  try {
    // ✅ Algorithm kısıtlaması + issuer/audience doğrulama
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ['HS256'],
      issuer: 'secscan-lab',
      audience: 'secscan-app'
    });
    res.json({ sub: decoded.sub, role: decoded.role });
  } catch (err) {
    res.status(403).json({ error: 'Geçersiz token', detail: err.message });
  }
});

// ✅ Token refresh
app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, SECRET, { algorithms: ['HS256'] });
    if (decoded.type !== 'refresh') throw new Error('Geçersiz token tipi');
    const newToken = jwt.sign(
      { sub: decoded.sub, role: 'admin' },
      SECRET,
      { algorithm: 'HS256', expiresIn: '15m', issuer: 'secscan-lab', audience: 'secscan-app' }
    );
    res.json({ accessToken: newToken });
  } catch (err) {
    res.status(403).json({ error: 'Refresh başarısız' });
  }
});

// ✅ Token revoke (logout)
app.post('/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) revokedTokens.add(token);
  res.json({ message: 'Çıkış yapıldı' });
});

app.listen(3001, () => {
  console.log('✅ GÜVENLİ JWT: http://localhost:3001');
});
