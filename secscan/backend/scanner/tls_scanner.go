package scanner

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"net"
	"strings"
	"time"

	"secscan/models"
)

// TLSScanner — TLS/SSL yapılandırmasını kontrol eder
type TLSScanner struct{}

func (s *TLSScanner) Name() string { return "TLS Analyzer" }

func (s *TLSScanner) Scan(target string) models.ModuleResult {
	start := time.Now()
	host := extractHost(target)

	var findings []models.Finding
	score := 100

	// TLS bağlantısı kur
	conn, err := tls.DialWithDialer(
		&net.Dialer{Timeout: 10 * time.Second},
		"tcp",
		host+":443",
		&tls.Config{InsecureSkipVerify: true},
	)
	if err != nil {
		findings = append(findings, models.Finding{
			Module:   "TLS Analyzer",
			Severity: "critical",
			Title:    "TLS/SSL bağlantısı kurulamadı",
			Detail:   fmt.Sprintf("Hedef (%s:443) TLS desteklemiyor: %s", host, err.Error()),
			Fix:      "HTTPS sertifikası kurun (Let's Encrypt ücretsiz sertifika sağlar)",
		})
		return models.ModuleResult{
			Name:     "TLS Analyzer",
			Status:   "completed",
			Score:    0,
			Findings: findings,
			Duration: float64(time.Since(start).Milliseconds()),
		}
	}
	defer conn.Close()

	state := conn.ConnectionState()

	// TLS versiyonu kontrolü
	switch state.Version {
	case tls.VersionTLS13:
		// En iyi
	case tls.VersionTLS12:
		findings = append(findings, models.Finding{
			Module:   "TLS Analyzer",
			Severity: "info",
			Title:    "TLS 1.2 kullanılıyor",
			Detail:   "TLS 1.2 güvenli ama TLS 1.3'e yükseltme önerilir",
			Fix:      "TLS 1.3 desteği ekleyin",
		})
	case tls.VersionTLS11:
		findings = append(findings, models.Finding{
			Module:   "TLS Analyzer",
			Severity: "high",
			Title:    "TLS 1.1 kullanılıyor (deprecated!)",
			Detail:   "TLS 1.1 artık güvenli kabul edilmiyor",
			Fix:      "Minimum TLS 1.2'ye yükseltin",
		})
		score -= 20
	case tls.VersionTLS10:
		findings = append(findings, models.Finding{
			Module:   "TLS Analyzer",
			Severity: "critical",
			Title:    "TLS 1.0 kullanılıyor (ciddi risk!)",
			Detail:   "TLS 1.0 bilinen açıklara sahip (POODLE, BEAST)",
			Fix:      "Minimum TLS 1.2'ye yükseltin",
		})
		score -= 30
	}

	// Sertifika kontrolü
	if len(state.PeerCertificates) > 0 {
		cert := state.PeerCertificates[0]

		// Süre kontrolü
		if time.Now().After(cert.NotAfter) {
			findings = append(findings, models.Finding{
				Module:   "TLS Analyzer",
				Severity: "critical",
				Title:    "SSL sertifikası süresi dolmuş!",
				Detail:   fmt.Sprintf("Sertifika %s tarihinde sona ermiş", cert.NotAfter.Format("2006-01-02")),
				Fix:      "Sertifikayı yenileyin",
			})
			score -= 25
		} else if time.Until(cert.NotAfter) < 30*24*time.Hour {
			findings = append(findings, models.Finding{
				Module:   "TLS Analyzer",
				Severity: "high",
				Title:    "SSL sertifikası 30 gün içinde sona erecek",
				Detail:   fmt.Sprintf("Sertifika %s tarihinde sona erecek", cert.NotAfter.Format("2006-01-02")),
				Fix:      "Sertifikayı yenileyin veya auto-renew ayarlayın",
			})
			score -= 10
		}

		// İssuer kontrolü
		issuer := cert.Issuer.CommonName
		if cert.Issuer.CommonName == cert.Subject.CommonName {
			findings = append(findings, models.Finding{
				Module:   "TLS Analyzer",
				Severity: "high",
				Title:    "Self-signed sertifika tespit edildi",
				Detail:   fmt.Sprintf("İssuer: %s — Güvenilir CA tarafından imzalanmamış", issuer),
				Fix:      "Let's Encrypt veya güvenilir CA'dan sertifika alın",
			})
			score -= 15
		}

		// Subject kontrolü
		if cert.Subject.CommonName != host && !matchesSAN(cert, host) {
			findings = append(findings, models.Finding{
				Module:   "TLS Analyzer",
				Severity: "high",
				Title:    "Sertifika domain uyumsuzluğu",
				Detail:   fmt.Sprintf("Sertifika: %s, Hedef: %s", cert.Subject.CommonName, host),
				Fix:      "Doğru domain için sertifika alın",
			})
			score -= 15
		}
	}

	if score < 0 {
		score = 0
	}

	return models.ModuleResult{
		Name:     "TLS Analyzer",
		Status:   "completed",
		Score:    score,
		Findings: findings,
		Duration: float64(time.Since(start).Milliseconds()),
	}
}

func matchesSAN(cert *x509.Certificate, host string) bool {
	for _, name := range cert.DNSNames {
		if name == host {
			return true
		}
		if strings.HasPrefix(name, "*.") {
			domain := strings.TrimPrefix(name, "*.")
			hostParts := strings.SplitN(host, ".", 2)
			if len(hostParts) == 2 && hostParts[1] == domain {
				return true
			}
		}
	}
	return false
}
