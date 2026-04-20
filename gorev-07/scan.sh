#!/bin/bash
# Görev 7 — Nmap + ZAP Tarama Scripti

TARGET=${1:-"localhost"}
OUTPUT_DIR="./scan-results"
mkdir -p $OUTPUT_DIR

echo "╔══════════════════════════════════════╗"
echo "║     NMAP + ZAP TARAMA ARACI         ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "Hedef: $TARGET"
echo ""

# --- NMAP TARAMA ---
echo "🔍 [1/4] Nmap SYN Scan başlatılıyor..."
nmap -sV -sC -T4 -oN $OUTPUT_DIR/nmap-basic.txt -oX $OUTPUT_DIR/nmap-basic.xml $TARGET
echo "✅ Nmap temel tarama tamamlandı"

echo "🔍 [2/4] Nmap Vulnerability Script Scan..."
nmap --script vuln -oN $OUTPUT_DIR/nmap-vuln.txt $TARGET
echo "✅ Nmap vulnerability tarama tamamlandı"

# --- ZAP TARAMA ---
echo "🔍 [3/4] ZAP Baseline Scan başlatılıyor..."
docker run --rm -v $(pwd)/$OUTPUT_DIR:/zap/wrk:rw \
  ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t http://$TARGET -r zap-baseline-report.html -J zap-baseline.json
echo "✅ ZAP baseline tarama tamamlandı"

echo "🔍 [4/4] ZAP Full Scan başlatılıyor..."
docker run --rm -v $(pwd)/$OUTPUT_DIR:/zap/wrk:rw \
  ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py \
  -t http://$TARGET -r zap-full-report.html -J zap-full.json
echo "✅ ZAP full tarama tamamlandı"

echo ""
echo "📊 Raporlar: $OUTPUT_DIR/"
echo "   - nmap-basic.txt"
echo "   - nmap-vuln.txt"
echo "   - zap-baseline-report.html"
echo "   - zap-full-report.html"
