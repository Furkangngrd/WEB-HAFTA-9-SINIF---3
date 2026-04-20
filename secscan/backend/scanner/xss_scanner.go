package scanner

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"secscan/models"
)

// XSSScanner — Reflected XSS testi
type XSSScanner struct{}

func (s *XSSScanner) Name() string { return "XSS Scanner" }

func (s *XSSScanner) Scan(target string) models.ModuleResult {
	start := time.Now()

	if !strings.HasPrefix(target, "http") {
		target = "https://" + target
	}

	var findings []models.Finding
	score := 100

	// XSS test payload'ları
	payloads := []struct {
		payload string
		name    string
	}{
		{`<script>alert(1)</script>`, "Basic script injection"},
		{`"><img src=x onerror=alert(1)>`, "Image onerror injection"},
		{`'><svg onload=alert(1)>`, "SVG onload injection"},
		{`javascript:alert(1)`, "JavaScript protocol"},
		{`<body onload=alert(1)>`, "Body onload injection"},
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	// Parametreli URL test
	testParams := []string{"q", "search", "query", "s", "keyword", "id", "name", "page", "redirect", "url", "next", "data", "input"}

	for _, param := range testParams {
		for _, p := range payloads {
			testURL := fmt.Sprintf("%s/?%s=%s", target, param, url.QueryEscape(p.payload))
			resp, err := client.Get(testURL)
			if err != nil {
				continue
			}

			body, err := io.ReadAll(io.LimitReader(resp.Body, 1024*100)) // 100KB limit
			resp.Body.Close()
			if err != nil {
				continue
			}

			// Payload yansıtılmış mı kontrol et (unescaped)
			if strings.Contains(string(body), p.payload) {
				findings = append(findings, models.Finding{
					Module:   "XSS Scanner",
					Severity: "high",
					Title:    fmt.Sprintf("Reflected XSS: %s parametresinde", param),
					Detail:   fmt.Sprintf("Payload (%s) encode edilmeden yansıtıldı: %s", p.name, testURL),
					Fix:      "Tüm kullanıcı girdilerini HTML encode edin ve CSP header ekleyin",
				})
				score -= 15
				break // Bu parametre için yeterli
			}
		}
	}

	// CSP kontrolü (header scanner ile çakışmaması için basit)
	resp, err := client.Get(target)
	if err == nil {
		csp := resp.Header.Get("Content-Security-Policy")
		if csp == "" {
			findings = append(findings, models.Finding{
				Module:   "XSS Scanner",
				Severity: "medium",
				Title:    "CSP header eksik (XSS riski artırır)",
				Detail:   "Content-Security-Policy başlığı bulunamadı",
				Fix:      "CSP ekleyin: Content-Security-Policy: default-src 'self'; script-src 'self'",
			})
			score -= 10
		} else if strings.Contains(csp, "unsafe-inline") {
			findings = append(findings, models.Finding{
				Module:   "XSS Scanner",
				Severity: "medium",
				Title:    "CSP 'unsafe-inline' içeriyor",
				Detail:   "CSP politikası 'unsafe-inline' izin veriyor, XSS riski devam ediyor",
				Fix:      "CSP'den 'unsafe-inline' kaldırın, nonce veya hash kullanın",
			})
			score -= 5
		}
		io.Copy(io.Discard, resp.Body)
		resp.Body.Close()
	}

	if score < 0 {
		score = 0
	}

	return models.ModuleResult{
		Name:     "XSS Scanner",
		Status:   "completed",
		Score:    score,
		Findings: findings,
		Duration: float64(time.Since(start).Milliseconds()),
	}
}
