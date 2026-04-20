# Görev 10 — Security Headers (Helmet ile A+)

## Amaç
HTTP güvenlik başlıklarını helmet middleware ile yapılandırarak SecurityHeaders.com'dan A+ almak.

## Gerekli Security Headers

| Header | Değer | Açıklama |
|--------|-------|----------|
| Content-Security-Policy | default-src 'self' | XSS koruması |
| X-Content-Type-Options | nosniff | MIME sniffing engeli |
| X-Frame-Options | DENY | Clickjacking engeli |
| X-XSS-Protection | 0 | Eski XSS filter (CSP varken kapatılmalı) |
| Strict-Transport-Security | max-age=31536000; includeSubDomains | HTTPS zorunluluğu |
| Referrer-Policy | strict-origin-when-cross-origin | Referrer bilgisi kontrolü |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | API erişim kontrolü |
| Cross-Origin-Opener-Policy | same-origin | Cross-origin izolasyonu |
| Cross-Origin-Resource-Policy | same-origin | Kaynak paylaşım kontrolü |
| Cross-Origin-Embedder-Policy | require-corp | Embedding kontrolü |

## Adımlar

1. `npm install && node app.js`
2. `http://localhost:3000` açıp DevTools → Network → Headers kontrol et
3. https://securityheaders.com/ adresinde localhost test edilebilir (ngrok gerekli)
4. Tüm başlıkların doğru ayarlandığını gör

## Savunma
- Helmet middleware
- Manuel header ekleme
- Nginx/Apache config

## Ekran Görüntüsü Açıklaması
> SecurityHeaders.com'da A+ skor alınır. Tüm başlıklar yeşil olarak görünür.
