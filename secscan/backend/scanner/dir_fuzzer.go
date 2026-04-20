package scanner

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"secscan/models"
)

// DirFuzzer — yaygın dizin ve dosyaları tarar
type DirFuzzer struct{}

func (s *DirFuzzer) Name() string { return "Directory Fuzzer" }

func (s *DirFuzzer) Scan(target string) models.ModuleResult {
	start := time.Now()

	if !strings.HasPrefix(target, "http") {
		target = "https://" + target
	}
	target = strings.TrimSuffix(target, "/")

	// Yaygın hassas dizin/dosyalar
	paths := []struct {
		path     string
		severity string
		desc     string
	}{
		{"/.env", "critical", "Ortam değişkenleri dosyası (şifreler, API key'ler)"},
		{"/.git/config", "critical", "Git repository yapılandırması"},
		{"/.git/HEAD", "critical", "Git repository HEAD referansı"},
		{"/wp-admin", "medium", "WordPress admin paneli"},
		{"/wp-login.php", "medium", "WordPress login sayfası"},
		{"/admin", "medium", "Admin paneli"},
		{"/administrator", "medium", "Admin paneli"},
		{"/phpmyadmin", "high", "phpMyAdmin veritabanı yönetimi"},
		{"/server-status", "high", "Apache server durumu"},
		{"/server-info", "high", "Apache server bilgisi"},
		{"/.htaccess", "medium", "Apache yapılandırma dosyası"},
		{"/.htpasswd", "critical", "Apache şifre dosyası"},
		{"/robots.txt", "info", "Robots.txt dosyası"},
		{"/sitemap.xml", "info", "Sitemap dosyası"},
		{"/backup", "high", "Yedek dosyaları"},
		{"/backup.zip", "critical", "Yedek arşivi"},
		{"/database.sql", "critical", "Veritabanı dump dosyası"},
		{"/config.php", "high", "PHP yapılandırma dosyası"},
		{"/api/swagger.json", "medium", "API dokümantasyonu"},
		{"/api/docs", "low", "API dokümantasyonu"},
		{"/.DS_Store", "low", "macOS dizin metadata dosyası"},
		{"/crossdomain.xml", "medium", "Flash cross-domain policy"},
		{"/debug", "medium", "Debug endpoint'i"},
		{"/test", "low", "Test endpoint'i"},
		{"/actuator", "high", "Spring Boot actuator"},
		{"/actuator/health", "medium", "Spring Boot health"},
		{"/console", "high", "Konsol erişimi"},
		{"/graphql", "low", "GraphQL endpoint"},
	}

	var findings []models.Finding
	score := 100

	client := &http.Client{
		Timeout: 5 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	for _, p := range paths {
		url := target + p.path
		resp, err := client.Get(url)
		if err != nil {
			continue
		}
		io.Copy(io.Discard, resp.Body)
		resp.Body.Close()

		if resp.StatusCode == 200 || resp.StatusCode == 301 || resp.StatusCode == 302 || resp.StatusCode == 403 {
			severity := p.severity
			title := fmt.Sprintf("%s erişilebilir (%d)", p.path, resp.StatusCode)

			if resp.StatusCode == 403 {
				severity = "info"
				title = fmt.Sprintf("%s var ama erişim engelli (403)", p.path)
			}

			findings = append(findings, models.Finding{
				Module:   "Directory Fuzzer",
				Severity: severity,
				Title:    title,
				Detail:   p.desc,
				Fix:      fmt.Sprintf("%s erişimini engelleyin veya kaldırın", p.path),
			})

			switch severity {
			case "critical":
				score -= 15
			case "high":
				score -= 10
			case "medium":
				score -= 5
			}
		}
	}

	if score < 0 {
		score = 0
	}

	return models.ModuleResult{
		Name:     "Directory Fuzzer",
		Status:   "completed",
		Score:    score,
		Findings: findings,
		Duration: float64(time.Since(start).Milliseconds()),
	}
}
