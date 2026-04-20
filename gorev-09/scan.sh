#!/bin/bash
# Görev 9 — SBOM + Trivy Tarama Scripti

echo "╔══════════════════════════════════════╗"
echo "║     SBOM + TRIVY TARAMA             ║"
echo "╚══════════════════════════════════════╝"

PROJECT_DIR=${1:-.}

# SBOM oluştur
echo ""
echo "📦 [1/3] SBOM oluşturuluyor..."
if command -v npx &> /dev/null; then
  npx --yes @cyclonedx/cyclonedx-npm --output-file sbom.json
  echo "✅ SBOM oluşturuldu: sbom.json"
else
  echo "⚠️ npx bulunamadı, syft deneniyor..."
  syft $PROJECT_DIR -o cyclonedx-json > sbom.json 2>/dev/null || echo "❌ SBOM oluşturulamadı"
fi

# Trivy ile tarama
echo ""
echo "🔍 [2/3] Trivy filesystem taraması..."
if command -v trivy &> /dev/null; then
  trivy fs --severity HIGH,CRITICAL --format table $PROJECT_DIR
  trivy fs --severity HIGH,CRITICAL --format json --output trivy-results.json $PROJECT_DIR
  echo "✅ Trivy raporu: trivy-results.json"
else
  echo "⚠️ Trivy kurulu değil. Docker ile deneniyor..."
  docker run --rm -v $(pwd):/project aquasec/trivy:latest fs --severity HIGH,CRITICAL /project
fi

# npm audit
echo ""
echo "🔍 [3/3] npm audit çalıştırılıyor..."
if [ -f "$PROJECT_DIR/package.json" ]; then
  cd $PROJECT_DIR
  npm audit --json > npm-audit.json 2>/dev/null
  echo "✅ npm audit raporu: npm-audit.json"
  echo ""
  echo "📊 Özet:"
  npm audit 2>/dev/null | tail -5
else
  echo "⚠️ package.json bulunamadı"
fi

echo ""
echo "🏁 Tarama tamamlandı!"
