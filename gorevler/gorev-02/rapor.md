# Görev 2 — SQL Injection

## Amaç
SQL Injection açığını göstermek ve düzeltmek.

## Zaafiyetli Kod (vulnerable)
```js
app.get('/user/:id', (req, res) => {
  db.query("SELECT * FROM users WHERE id=" + req.params.id, (err, result) => {
    res.json(result);
  });
});
```

## Payload Örnekleri

| Payload | Etki |
|---------|------|
| `1 OR 1=1` | Tüm kayıtları döndürür |
| `1; DROP TABLE users--` | Tabloyu siler |
| `1 UNION SELECT username,password FROM users--` | Şifreleri çeker |
| `' OR '1'='1` | Login bypass |
| `1 AND SLEEP(5)--` | Blind SQLi (zaman tabanlı) |

## Adımlar

1. `npm install` ile bağımlılıkları kur
2. `node app.js` ile sunucuyu başlat
3. Tarayıcıdan `http://localhost:3000/user/1 OR 1=1` dene
4. Tüm kullanıcıların döndüğünü gör
5. `node app-safe.js` ile güvenli versiyonu çalıştır
6. Aynı payload'u tekrar dene — artık çalışmaz

## Savunma Yöntemleri
- Parametreli sorgular (prepared statements)
- ORM kullanımı (Sequelize, Prisma)
- Input validasyonu
- WAF kuralları

## Ekran Görüntüsü Açıklaması
> Zaafiyetli endpoint'e `1 OR 1=1` gönderildiğinde tüm kullanıcılar listelenir. Güvenli versiyonda aynı payload hata döndürür.
