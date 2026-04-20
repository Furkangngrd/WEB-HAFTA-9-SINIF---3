package scanner

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"secscan/models"
)

// HeaderScanner — HTTP güvenlik başlıklarını kontrol eder
type HeaderScanner struct{}

func (s *HeaderScanner) Name() string { return "Security Headers" }

func (s *HeaderScanner) Scan(target string) models.ModuleResult {
	start := time.Now()

	if !strings.HasPrefix(target, "http") {
		target = "https://" + target
	}

	var findings []models.Finding

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(target)
	if err != nil {
		return models.ModuleResult{
			Name:   "Security Headers",
			Status: "error",
			Score:  0,
			Findings: []models.Finding{{
				Module:   "Security Headers",
				Severity: "info",
				Title:    "Bağlantı hatası",
				Detail:   err.Error(),
			}},
			Duration: float64(time.Since(start).Milliseconds()),
		}
	}
	defer resp.Body.Close()
	io.Copy(io.Discard, resp.Body)

	// Kontrol edilecek başlıklar
	headers := []struct {
		name     string
		severity string
		fix      string
	}{
		{"Content-Security-Policy", "high", "CSP header ekleyin: default-src 'self'"},
		{"Strict-Transport-Security", "high", "HSTS ekleyin: max-age=31536000; includeSubDomains"},
		{"X-Content-Type-Options", "medium", "X-Content-Type-Options: nosniff ekleyin"},
		{"X-Frame-Options", "medium", "X-Frame-Options: DENY ekleyin"},
		{"Referrer-Policy", "low", "Referrer-Policy: strict-origin-when-cross-origin ekleyin"},
		{"Permissions-Policy", "low", "Permissions-Policy ekleyin"},
		{"X-XSS-Protection", "low", "X-XSS-Protection: 0 ekleyin (CSP varsa)"},
		{"Cross-Origin-Opener-Policy", "low", "COOP: same-origin ekleyin"},
		{"Cross-Origin-Resource-Policy", "low", "CORP: same-origin ekleyin"},
	}

	score := 100
	for _, h := range headers {
		val := resp.Header.Get(h.name)
		if val == "" {
			findings = append(findings, models.Finding{
				Module:   "Security Headers",
				Severity: h.severity,
				Title:    fmt.Sprintf("%s başlığı eksik", h.name),
				Detail:   fmt.Sprintf("%s HTTP güvenlik başlığı ayarlanmamış", h.name),
				Fix:      h.fix,
			})
			switch h.severity {
			case "high":
				score -= 15
			case "medium":
				score -= 8
			case "low":
				score -= 3
			}
		}
	}

	// Server header sızıntısı kontrolü
	if server := resp.Header.Get("Server"); server != "" {
		findings = append(findings, models.Finding{
			Module:   "Security Headers",
			Severity: "low",
			Title:    "Server header bilgi sızıntısı",
			Detail:   fmt.Sprintf("Server: %s — yazılım bilgisi görünür durumda", server),
			Fix:      "Server header'ı kaldırın veya maskelenin",
		})
		score -= 3
	}

	// X-Powered-By kontrolü
	if powered := resp.Header.Get("X-Powered-By"); powered != "" {
		findings = append(findings, models.Finding{
			Module:   "Security Headers",
			Severity: "medium",
			Title:    "X-Powered-By bilgi sızıntısı",
			Detail:   fmt.Sprintf("X-Powered-By: %s — framework bilgisi açık", powered),
			Fix:      "X-Powered-By header'ını kaldırın",
		})
		score -= 5
	}

	if score < 0 {
		score = 0
	}

	return models.ModuleResult{
		Name:     "Security Headers",
		Status:   "completed",
		Score:    score,
		Findings: findings,
		Duration: float64(time.Since(start).Milliseconds()),
	}
}
