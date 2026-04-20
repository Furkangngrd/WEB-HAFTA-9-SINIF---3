# Görev 1 — OWASP Top 10 Mapping

## Amaç
Örnek bir Node.js uygulamasını OWASP Top 10 (2021) açıklarına göre analiz etmek.

## OWASP Top 10 (2021) Listesi

| #  | Kategori                          | Açıklama                                    |
|----|-----------------------------------|---------------------------------------------|
| A01 | Broken Access Control            | Yetkisiz erişim                             |
| A02 | Cryptographic Failures           | Zayıf şifreleme                             |
| A03 | Injection                        | SQL/NoSQL/OS komut enjeksiyonu              |
| A04 | Insecure Design                  | Güvenli olmayan tasarım                     |
| A05 | Security Misconfiguration        | Yanlış güvenlik yapılandırması              |
| A06 | Vulnerable Components            | Bilinen açıklı bileşenler                   |
| A07 | Auth Failures                    | Kimlik doğrulama hataları                   |
| A08 | Software & Data Integrity        | Yazılım bütünlüğü ihlali                   |
| A09 | Security Logging Failures        | Yetersiz loglama                            |
| A10 | SSRF                             | Server-Side Request Forgery                 |

## Analiz Adımları

1. Kaynak kodu incele
2. Her dosyayı OWASP kategorilerine eşle
3. Bulguları raporla
4. Fix önerisi sun

## Analiz Sonucu (Örnek Repo)

### vulnerable-app.js Analiz Tablosu

| Satır | Kod                                      | OWASP     | Risk    |
|-------|------------------------------------------|-----------|---------|
| 12    | `db.query("SELECT * FROM users WHERE id="+req.params.id)` | A03 | Kritik |
| 28    | `app.use(cors({origin: '*'}))`           | A05       | Yüksek  |
| 35    | `jwt.sign(payload, 'secret123')`         | A02       | Kritik  |
| 42    | `res.send(req.query.name)`               | A03 (XSS) | Yüksek  |
| 51    | Loglama yok                              | A09       | Orta    |
| 60    | `axios.get(req.body.url)`                | A10       | Kritik  |

## Savunma Özeti

- **A03**: Parametreli sorgu kullan
- **A05**: CORS kısıtla
- **A02**: Güçlü secret + RS256
- **A09**: Winston/Morgan ekle
- **A10**: URL whitelist uygula

## Ekran Görüntüsü Açıklaması
> Terminal çıktısında `mapping-tool.js` çalıştırılır, her dosya otomatik analiz edilir ve tablo halinde OWASP eşleştirmesi gösterilir.
