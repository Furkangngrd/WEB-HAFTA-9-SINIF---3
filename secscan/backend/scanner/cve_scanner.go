package scanner

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"secscan/models"
)

// CVEScanner — bilinen CVE'leri kontrol eder
type CVEScanner struct{}

func (s *CVEScanner) Name() string { return "CVE Checker" }

func (s *CVEScanner) Scan(target string) models.ModuleResult {
	start := time.Now()

	if !strings.HasPrefix(target, "http") {
		target = "https://" + target
	}

	var findings []models.Finding
	score := 100

	client := &http.Client{Timeout: 10 * time.Second}

	// Header'lardan teknoloji tespiti
	resp, err := client.Get(target)
	if err != nil {
		return models.ModuleResult{
			Name:     "CVE Checker",
			Status:   "error",
			Score:    0,
			Findings: []models.Finding{{
				Module:   "CVE Checker",
				Severity: "info",
				Title:    "Hedef erişilemiyor",
				Detail:   err.Error(),
			}},
			Duration: float64(time.Since(start).Milliseconds()),
		}
	}
	io.Copy(io.Discard, resp.Body)
	resp.Body.Close()

	// Server header analizi
	server := resp.Header.Get("Server")
	powered := resp.Header.Get("X-Powered-By")

	// Bilinen zaafiyetli versiyonlar
	type knownCVE struct {
		tech   string
		cve    string
		desc   string
		sev    string
	}

	knownVulns := []struct {
		pattern string
		cves    []knownCVE
	}{
		{
			"Apache/2.4.49",
			[]knownCVE{
				{"Apache 2.4.49", "CVE-2021-41773", "Path traversal + RCE", "critical"},
			},
		},
		{
			"Apache/2.4.50",
			[]knownCVE{
				{"Apache 2.4.50", "CVE-2021-42013", "Path traversal bypass", "critical"},
			},
		},
		{
			"nginx/1.14",
			[]knownCVE{
				{"nginx 1.14", "CVE-2019-9511", "HTTP/2 DoS", "high"},
			},
		},
		{
			"PHP/7.4",
			[]knownCVE{
				{"PHP 7.4", "CVE-2024-2756", "Cookie bypass", "medium"},
			},
		},
		{
			"PHP/8.0",
			[]knownCVE{
				{"PHP 8.0", "CVE-2024-4577", "CGI argument injection", "critical"},
			},
		},
		{
			"Express",
			[]knownCVE{
				{"Express", "CVE-2024-29041", "Open redirect", "medium"},
			},
		},
		{
			"Microsoft-IIS/7",
			[]knownCVE{
				{"IIS 7", "CVE-2017-7269", "Buffer overflow RCE", "critical"},
			},
		},
		{
			"Microsoft-IIS/8",
			[]knownCVE{
				{"IIS 8", "CVE-2017-7269", "Buffer overflow", "high"},
			},
		},
	}

	serverInfo := server + " " + powered
	for _, vuln := range knownVulns {
		if strings.Contains(serverInfo, vuln.pattern) {
			for _, cve := range vuln.cves {
				findings = append(findings, models.Finding{
					Module:   "CVE Checker",
					Severity: cve.sev,
					Title:    fmt.Sprintf("%s — %s", cve.cve, cve.tech),
					Detail:   cve.desc,
					Fix:      fmt.Sprintf("%s'i en son sürüme güncelleyin", cve.tech),
				})
				switch cve.sev {
				case "critical":
					score -= 20
				case "high":
					score -= 15
				case "medium":
					score -= 8
				}
			}
		}
	}

	// Shodan API ile ek bilgi (opsiyonel, API key gerekir)
	host := extractHost(target)
	shodanFindings := checkShodan(client, host)
	findings = append(findings, shodanFindings...)

	if score < 0 {
		score = 0
	}

	return models.ModuleResult{
		Name:     "CVE Checker",
		Status:   "completed",
		Score:    score,
		Findings: findings,
		Duration: float64(time.Since(start).Milliseconds()),
	}
}

// checkShodan — Shodan'dan bilgi çeker (API key opsiyonel)
func checkShodan(client *http.Client, host string) []models.Finding {
	var findings []models.Finding

	// Shodan InternetDB (ücretsiz, API key gerektirmez)
	url := fmt.Sprintf("https://internetdb.shodan.io/%s", host)
	resp, err := client.Get(url)
	if err != nil {
		return findings
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return findings
	}

	var data struct {
		Ports []int    `json:"ports"`
		Vulns []string `json:"vulns"`
		CPEs  []string `json:"cpes"`
	}

	body, _ := io.ReadAll(resp.Body)
	if err := json.Unmarshal(body, &data); err != nil {
		return findings
	}

	// Bilinen CVE'ler
	for _, vuln := range data.Vulns {
		findings = append(findings, models.Finding{
			Module:   "CVE Checker",
			Severity: "high",
			Title:    fmt.Sprintf("Shodan: %s tespit edildi", vuln),
			Detail:   fmt.Sprintf("Shodan InternetDB'de %s için %s kaydı bulundu", host, vuln),
			Fix:      "İlgili yazılımı güncelleyin ve yamayı uygulayın",
		})
	}

	return findings
}
