# Görev 5 — JWT Audit Checklist + Fix

## Amaç
JWT token güvenlik denetimi yapmak ve yaygın hataları düzeltmek.

## JWT Audit Checklist

| # | Kontrol | Risk | Durum |
|---|---------|------|-------|
| 1 | Algorithm 'none' kabul ediliyor mu? | Kritik | ❌ |
| 2 | Secret key yeterince güçlü mü? (min 256-bit) | Kritik | ❌ |
| 3 | Token expiration (exp) var mı? | Yüksek | ❌ |
| 4 | Issuer (iss) doğrulanıyor mu? | Orta | ❌ |
| 5 | Audience (aud) doğrulanıyor mu? | Orta | ❌ |
| 6 | Token refresh mekanizması var mı? | Yüksek | ❌ |
| 7 | Token blacklist/revoke var mı? | Orta | ❌ |
| 8 | Sensitive data payload'da mı? | Yüksek | ❌ |
| 9 | HTTPS zorunlu mu? | Kritik | ❌ |
| 10 | Token storage güvenli mi? | Yüksek | ❌ |

## Zaafiyetli Payload Örnekleri

### Algorithm None Attack
```json
// Header'ı değiştir
{"alg": "none", "typ": "JWT"}
// Signature'ı kaldır
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiYWRtaW4ifQ.
```

### Weak Secret Brute Force
```bash
# hashcat ile JWT secret kırma
hashcat -a 0 -m 16500 jwt.txt wordlist.txt
```

## Adımlar
1. `npm install && node app.js` — zaafiyetli
2. Login yapıp token al
3. jwt.io'da token'ı decode et — secret zayıf
4. `node app-safe.js` — güvenli
5. Audit checklist'i kontrol et

## Ekran Görüntüsü Açıklaması
> jwt.io'da token decode edilir, payload ve header görünür. Zaafiyetli versiyonda secret kısa ve tahmin edilebilir.
