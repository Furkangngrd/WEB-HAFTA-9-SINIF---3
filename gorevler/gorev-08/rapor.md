# Görev 8 — Semgrep CI Pipeline

## Amaç
Semgrep SAST aracını GitHub Actions CI pipeline'ına entegre etmek.

## Semgrep Nedir?
- Static Application Security Testing (SAST) aracı
- Kaynak kodu güvenlik açıkları için tarar
- CI/CD entegrasyonu kolay
- 2000+ hazır kural

## Yerel Kullanım

```bash
# Kurulum
pip install semgrep

# Temel tarama
semgrep --config auto ./src

# OWASP kuralları ile
semgrep --config p/owasp-top-ten ./src

# JavaScript/Node.js kuralları
semgrep --config p/javascript ./src

# JSON çıktı
semgrep --config auto --json --output results.json ./src
```

## GitHub Actions Pipeline

Aşağıdaki `.github/workflows/semgrep.yml` dosyasını repo'ya ekleyin.

## Semgrep Bulgu Örnekleri

| Kural | Dosya | Satır | Açıklama |
|-------|-------|-------|----------|
| javascript.express.security.injection.tainted-sql-string | app.js | 15 | SQL injection |
| javascript.express.security.audit.xss.direct-response-write | app.js | 28 | XSS |
| javascript.jsonwebtoken.security.jwt-hardcode | auth.js | 10 | Hardcoded JWT secret |

## Adımlar
1. `pip install semgrep`
2. `semgrep --config auto .` çalıştır
3. Bulguları incele
4. `.github/workflows/semgrep.yml` oluştur
5. Git push ile CI tetikle

## Ekran Görüntüsü Açıklaması
> GitHub Actions sekmesinde Semgrep workflow'u çalışır. Bulgular sarı/kırmızı uyarılar olarak listelenir.
