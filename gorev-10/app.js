/**
 * Görev 10 — Security Headers ile A+ (Helmet)
 */
const express = require('express');
const helmet = require('helmet');

const app = express();

// ✅ Helmet — tüm güvenlik başlıkları
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: false  // CSP varken gereksiz
}));

// ✅ Ek güvenlik başlıkları (Helmet'in kapsamadıkları)
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  // Server bilgisini gizle
  res.removeHeader('X-Powered-By');
  next();
});

app.get('/', (req, res) => {
  res.send(`
    <html>
    <head><title>Security Headers A+</title>
    <style>
      body { font-family: Arial; background: #0d1117; color: #c9d1d9; padding: 2rem; }
      .header-list { background: #161b22; padding: 1rem; border-radius: 8px; }
      .header { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #30363d; }
      .pass { color: #3fb950; }
      h1 { color: #58a6ff; }
    </style>
    </head>
    <body>
      <h1>🛡️ Security Headers — A+ Skoru</h1>
      <div class="header-list">
        <div class="header"><span>Content-Security-Policy</span><span class="pass">✅ Set</span></div>
        <div class="header"><span>Strict-Transport-Security</span><span class="pass">✅ Set</span></div>
        <div class="header"><span>X-Content-Type-Options</span><span class="pass">✅ nosniff</span></div>
        <div class="header"><span>X-Frame-Options</span><span class="pass">✅ DENY</span></div>
        <div class="header"><span>Referrer-Policy</span><span class="pass">✅ strict-origin-when-cross-origin</span></div>
        <div class="header"><span>Permissions-Policy</span><span class="pass">✅ Set</span></div>
        <div class="header"><span>Cross-Origin-Opener-Policy</span><span class="pass">✅ same-origin</span></div>
        <div class="header"><span>Cross-Origin-Resource-Policy</span><span class="pass">✅ same-origin</span></div>
        <div class="header"><span>Cross-Origin-Embedder-Policy</span><span class="pass">✅ require-corp</span></div>
      </div>
      <p style="margin-top:1rem;color:#8b949e">DevTools → Network → Response Headers ile doğrulayın</p>
    </body>
    </html>
  `);
});

// Headers endpoint (debug)
app.get('/check-headers', (req, res) => {
  res.json({
    message: 'Response headers kontrol edin',
    note: 'DevTools → Network tabında bu isteğin response headers kısmına bakın'
  });
});

app.listen(3000, () => {
  console.log('🛡️ Security Headers App: http://localhost:3000');
  console.log('A+ skor için tüm başlıklar aktif');
});
