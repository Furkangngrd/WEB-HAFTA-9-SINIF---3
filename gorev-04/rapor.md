# Görev 4 — CSRF Koruması

## Amaç
Cross-Site Request Forgery açığını göstermek ve csurf middleware ile engellemek.

## CSRF Nedir?
Kullanıcının oturum açtığı bir sitede, başka bir siteden istek göndererek işlem yaptırmak.

## Saldırı Senaryosu

1. Kullanıcı `bank.com`'da oturum açmış
2. Saldırgan `evil.com` sayfasında gizli form:
```html
<form action="http://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="hacker">
  <input type="hidden" name="amount" value="10000">
</form>
<script>document.forms[0].submit()</script>
```
3. Kullanıcı `evil.com`'u ziyaret edince para transferi gerçekleşir

## Adımlar

1. `npm install && node app.js`
2. `http://localhost:3000` — zaafiyetli form
3. `evil.html` dosyasını tarayıcıda aç — CSRF saldırısı
4. `node app-safe.js` — csurf korumalı
5. evil.html artık çalışmaz (403 Forbidden)

## Savunma
- CSRF token (csurf middleware)
- SameSite cookie
- Double submit cookie
- Origin header kontrolü

## Ekran Görüntüsü Açıklaması
> Güvenli versiyonda form'a CSRF token eklenir. Token olmadan gönderilen istekler 403 ile reddedilir.
