# Görev 7 — Nmap + ZAP Scan

## Amaç
Nmap ile port taraması ve OWASP ZAP ile web uygulama taraması yapmak.

## Nmap Komutları

### Temel Tarama
```bash
# Hızlı port taraması
nmap -sV -sC -T4 target.com

# Top 1000 port
nmap -sT -top-ports 1000 target.com

# Tüm portlar
nmap -p- target.com

# UDP taraması
nmap -sU -top-ports 100 target.com

# OS tespiti
nmap -O target.com

# Vulnerability scan (NSE)
nmap --script vuln target.com

# Agresif tarama
nmap -A -T4 target.com
```

### Nmap Çıktı Analizi

| Port | Servis | Versiyon | Risk |
|------|--------|----------|------|
| 22/tcp | SSH | OpenSSH 7.6 | Orta — Güncelle |
| 80/tcp | HTTP | Apache 2.4.29 | Yüksek — CVE kontrol et |
| 443/tcp | HTTPS | nginx 1.14.0 | Orta |
| 3306/tcp | MySQL | 5.7 | Kritik — Dışarıya açık! |
| 8080/tcp | HTTP | Tomcat 9.0 | Yüksek |

## OWASP ZAP Komutları

### ZAP CLI Scan
```bash
# Docker ile ZAP baseline scan
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t http://target.com -r report.html

# Full scan
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py \
  -t http://target.com -r full-report.html

# API scan
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-api-scan.py \
  -t http://target.com/api/swagger.json -f openapi -r api-report.html
```

### ZAP Bulgu Analizi

| Alert | Risk | Açıklama | Fix |
|-------|------|----------|-----|
| X-Frame-Options Missing | Medium | Clickjacking riski | helmet ekle |
| CSP Not Set | Medium | XSS riski artırır | CSP header ekle |
| Cookie No HttpOnly | Low | XSS ile çalınabilir | httpOnly: true |
| SQL Injection | High | Veri sızıntısı | Parametreli sorgu |

## Adımlar

1. Nmap kur: `sudo apt install nmap` veya `choco install nmap`
2. `nmap -sV -sC localhost` çalıştır
3. ZAP Docker: `docker pull ghcr.io/zaproxy/zaproxy:stable`
4. Baseline scan çalıştır
5. Raporu analiz et

## Ekran Görüntüsü Açıklaması
> Nmap çıktısında açık portlar, servis versiyonları ve NSE script sonuçları görünür. ZAP HTML raporunda risk seviyesine göre gruplandırılmış bulgular listelenir.
