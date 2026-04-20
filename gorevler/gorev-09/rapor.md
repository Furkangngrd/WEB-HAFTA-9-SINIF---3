# Görev 9 — SBOM + Trivy Scan

## Amaç
Software Bill of Materials (SBOM) oluşturmak ve Trivy ile zafiyet taraması yapmak.

## SBOM Nedir?
Yazılımda kullanılan tüm bileşenlerin (dependencies) listesi. CVE taraması için gerekli.

## Komutlar

### SBOM Oluşturma (CycloneDX)
```bash
# Node.js projesi için
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# veya syft ile
syft . -o cyclonedx-json > sbom.json
```

### Trivy Tarama
```bash
# Kurulum
# Linux:
sudo apt install trivy
# macOS:
brew install trivy
# Docker:
docker pull aquasec/trivy

# Filesystem scan
trivy fs --severity HIGH,CRITICAL .

# Docker image scan
trivy image node:18

# SBOM scan
trivy sbom sbom.json

# JSON çıktı
trivy fs --format json --output trivy-results.json .

# HTML rapor
trivy fs --format template --template "@/contrib/html.tpl" --output report.html .
```

## Trivy Çıktı Analizi

| Kütüphane | Versiyon | CVE | Severity | Fix |
|-----------|----------|-----|----------|-----|
| express | 4.17.1 | CVE-2024-29041 | HIGH | 4.19.2'ye güncelle |
| jsonwebtoken | 8.5.1 | CVE-2022-23529 | CRITICAL | 9.0.0'a güncelle |
| lodash | 4.17.20 | CVE-2021-23337 | HIGH | 4.17.21'e güncelle |
| axios | 0.21.1 | CVE-2021-3749 | HIGH | 1.6.0'a güncelle |

## CVE Fix İşlemi
```bash
# Otomatik güncelleme
npm audit fix

# Zorla güncelleme
npm audit fix --force

# Manuel güncelleme
npm install express@latest jsonwebtoken@latest lodash@latest axios@latest
```

## Adımlar
1. Trivy kur
2. `trivy fs --severity HIGH,CRITICAL .` çalıştır
3. CVE'leri listele
4. `npm audit fix` ile düzelt
5. Tekrar tarama yaparak doğrula

## Ekran Görüntüsü Açıklaması
> Trivy CLI çıktısında tablo halinde CVE'ler, severity ve fix versiyonları görünür.
