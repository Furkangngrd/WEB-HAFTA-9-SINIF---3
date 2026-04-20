/**
 * OWASP Top 10 Mapping Tool
 * Kaynak kodu analiz ederek OWASP kategorilerine eşler
 */
const fs = require('fs');
const path = require('path');

const OWASP_PATTERNS = {
  'A01 - Broken Access Control': [
    /admin.*without.*auth/gi,
    /req\.user.*role/gi,
    /bypass.*auth/gi
  ],
  'A02 - Cryptographic Failures': [
    /md5|sha1\(/gi,
    /secret.*=.*['"][a-zA-Z0-9]{3,20}['"]/gi,
    /password.*plain/gi
  ],
  'A03 - Injection': [
    /query\s*\(\s*["'`].*\+.*req\./gi,
    /exec\s*\(\s*req\./gi,
    /eval\s*\(/gi,
    /innerHTML\s*=\s*.*req\./gi,
    /res\.(send|write)\s*\(\s*req\.(query|body|params)/gi
  ],
  'A05 - Security Misconfiguration': [
    /cors\(\s*\{\s*origin\s*:\s*['"]\*['"]/gi,
    /debug\s*:\s*true/gi,
    /stack.*trace/gi
  ],
  'A07 - Auth Failures': [
    /password.*==\s*['"].*['"]/gi,
    /token.*expire.*never/gi
  ],
  'A09 - Logging Failures': [],
  'A10 - SSRF': [
    /axios\.get\s*\(\s*req\.(body|query)/gi,
    /fetch\s*\(\s*req\.(body|query)/gi,
    /http\.get\s*\(\s*req\.(body|query)/gi
  ]
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const findings = [];

  lines.forEach((line, idx) => {
    for (const [category, patterns] of Object.entries(OWASP_PATTERNS)) {
      for (const pattern of patterns) {
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          findings.push({
            line: idx + 1,
            category,
            code: line.trim().substring(0, 80),
            file: path.basename(filePath)
          });
        }
      }
    }
  });

  // A09 kontrolü: loglama yoksa uyar
  if (!/winston|morgan|pino|console\.log.*error/gi.test(content)) {
    findings.push({
      line: '-',
      category: 'A09 - Logging Failures',
      code: 'Loglama mekanizması bulunamadı',
      file: path.basename(filePath)
    });
  }

  return findings;
}

function printReport(findings) {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║           OWASP TOP 10 MAPPING RAPORU                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  if (findings.length === 0) {
    console.log('✅ Bilinen OWASP pattern bulunamadı.');
    return;
  }

  console.log(
    'Satır'.padEnd(8) +
    'Dosya'.padEnd(25) +
    'Kategori'.padEnd(35) +
    'Kod'
  );
  console.log('-'.repeat(100));

  findings.forEach(f => {
    console.log(
      String(f.line).padEnd(8) +
      f.file.padEnd(25) +
      f.category.padEnd(35) +
      f.code
    );
  });

  console.log(`\n📊 Toplam ${findings.length} bulgu tespit edildi.\n`);
}

// Ana çalıştırma
const targetDir = process.argv[2] || './sample';
if (!fs.existsSync(targetDir)) {
  console.log(`Klasör bulunamadı: ${targetDir}`);
  console.log('Örnek: node mapping-tool.js ./sample');
  process.exit(1);
}

const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.js'));
let allFindings = [];

files.forEach(file => {
  const findings = analyzeFile(path.join(targetDir, file));
  allFindings = allFindings.concat(findings);
});

printReport(allFindings);
