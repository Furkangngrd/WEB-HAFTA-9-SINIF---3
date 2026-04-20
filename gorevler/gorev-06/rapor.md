# Görev 6 — OAuth 2.0 + PKCE Demo

## Amaç
OAuth 2.0 + PKCE akışını Google login ile göstermek.

## OAuth 2.0 + PKCE Akışı

```
1. Client → code_verifier oluşturur (random string)
2. Client → code_challenge = SHA256(code_verifier) → base64url
3. Client → Authorization Server'a yönlendirir (code_challenge ile)
4. Kullanıcı → Google'da login olur
5. Authorization Server → Client'a authorization_code döner
6. Client → Token endpoint'e code + code_verifier gönderir
7. Server → code_verifier'ı doğrular, access_token verir
```

## Google OAuth Kurulumu

1. https://console.cloud.google.com → API & Services → Credentials
2. OAuth 2.0 Client ID oluştur
3. Redirect URI: `http://localhost:3000/auth/callback`
4. Client ID ve Secret'ı `.env`'e yaz

## Adımlar

1. `.env` dosyasını düzenle (Google credentials)
2. `npm install && node app.js`
3. `http://localhost:3000` → "Google ile Giriş" butonuna tıkla
4. Google login sayfasına yönlendirilirsin
5. Başarılı giriş sonrası profil bilgileri görünür

## Neden PKCE?
- Authorization code intercept saldırısını engeller
- Public client'lar (SPA, mobil) için zorunlu
- Secret gerektirmez

## Ekran Görüntüsü Açıklaması
> Google login sayfası açılır, kullanıcı giriş yapar, callback'te profil bilgileri (ad, email, resim) gösterilir.
