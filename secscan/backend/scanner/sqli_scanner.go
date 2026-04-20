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

// SQLiScanner — SQL Injection testi
type SQLiScanner struct{}

func (s *SQLiScanner) Name() string { return "SQLi Scanner" }

func (s *SQLiScanner) Scan(target string) models.ModuleResult {
	start := time.Now()

	if !strings.HasPrefix(target, "http") {
		target = "https://" + target
	}

	var findings []models.Finding
	score := 100

	// SQL injection payloadları
	payloads := []struct {
		payload  string
		name     string
		errorSig []string // Hata imzaları
	}{
		{
			"' OR '1'='1",
			"Boolean-based blind",
			[]string{"sql", "mysql", "sqlite", "postgresql", "oracle", "syntax error", "unclosed quotation"},
		},
		{
			"1; DROP TABLE test--",
			"Stacked query",
			[]string{"sql", "mysql", "syntax", "error in your SQL"},
		},
		{
			"1 UNION SELECT NULL,NULL,NULL--",
			"UNION-based",
			[]string{"column", "union", "select", "mismatch"},
		},
		{
			"' AND SLEEP(2)--",
			"Time-based blind",
			[]string{"sql", "mysql", "syntax"},
		},
		{
			"1' ORDER BY 100--",
			"Order by enumeration",
			[]string{"unknown column", "order by", "out of range"},
		},
	}

	client := &http.Client{
		Timeout: 15 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	testParams := []string{"id", "user", "page", "cat", "category", "item", "product", "article", "search", "q"}

	for _, param := range testParams {
		for _, p := range payloads {
			testURL := fmt.Sprintf("%s/?%s=%s", target, param, url.QueryEscape(p.payload))

			startReq := time.Now()
			resp, err := client.Get(testURL)
			elapsed := time.Since(startReq)
			if err != nil {
				continue
			}

			body, err := io.ReadAll(io.LimitReader(resp.Body, 1024*50))
			resp.Body.Close()
			if err != nil {
				continue
			}

			bodyLower := strings.ToLower(string(body))

			// SQL hata mesajı kontrolü
			for _, sig := range p.errorSig {
				if strings.Contains(bodyLower, sig) {
					findings = append(findings, models.Finding{
						Module:   "SQLi Scanner",
						Severity: "critical",
						Title:    fmt.Sprintf("SQL Injection: %s (%s)", param, p.name),
						Detail:   fmt.Sprintf("Payload: %s — SQL hata mesajı tespit edildi", p.payload),
						Fix:      "Parametreli sorgular (prepared statements) kullanın. ORM kullanın.",
					})
					score -= 20
					break
				}
			}

			// Time-based kontrolü (2 saniyeden uzun sürdüyse)
			if strings.Contains(p.payload, "SLEEP") && elapsed > 2*time.Second {
				findings = append(findings, models.Finding{
					Module:   "SQLi Scanner",
					Severity: "critical",
					Title:    fmt.Sprintf("Time-based Blind SQLi: %s", param),
					Detail:   fmt.Sprintf("SLEEP payload'u %v sürdü — SQLi var", elapsed),
					Fix:      "Parametreli sorgular kullanın",
				})
				score -= 20
			}

			// 500 Internal Server Error
			if resp.StatusCode == 500 {
				findings = append(findings, models.Finding{
					Module:   "SQLi Scanner",
					Severity: "medium",
					Title:    fmt.Sprintf("500 hatası: %s parametresinde", param),
					Detail:   fmt.Sprintf("Payload: %s — Sunucu hatası döndü (olası SQLi)", p.payload),
					Fix:      "Hata mesajlarını gizleyin ve girdileri doğrulayın",
				})
				score -= 5
			}
		}
	}

	if score < 0 {
		score = 0
	}

	return models.ModuleResult{
		Name:     "SQLi Scanner",
		Status:   "completed",
		Score:    score,
		Findings: findings,
		Duration: float64(time.Since(start).Milliseconds()),
	}
}
