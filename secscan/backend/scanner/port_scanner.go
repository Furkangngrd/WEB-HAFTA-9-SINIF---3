package scanner

import (
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	"secscan/models"
)

// PortScanner — Goroutine ile hızlı port taraması
type PortScanner struct{}

func (s *PortScanner) Name() string { return "Port Scanner" }

func (s *PortScanner) Scan(target string) models.ModuleResult {
	start := time.Now()
	host := extractHost(target)

	// Yaygın portlar
	ports := []struct {
		port    int
		service string
		risk    string
	}{
		{21, "FTP", "high"},
		{22, "SSH", "medium"},
		{23, "Telnet", "critical"},
		{25, "SMTP", "medium"},
		{53, "DNS", "low"},
		{80, "HTTP", "info"},
		{110, "POP3", "medium"},
		{143, "IMAP", "medium"},
		{443, "HTTPS", "info"},
		{445, "SMB", "critical"},
		{993, "IMAPS", "low"},
		{995, "POP3S", "low"},
		{1433, "MSSQL", "critical"},
		{1521, "Oracle", "critical"},
		{3306, "MySQL", "critical"},
		{3389, "RDP", "high"},
		{5432, "PostgreSQL", "critical"},
		{5900, "VNC", "high"},
		{6379, "Redis", "critical"},
		{8080, "HTTP-Alt", "medium"},
		{8443, "HTTPS-Alt", "low"},
		{27017, "MongoDB", "critical"},
	}

	var findings []models.Finding
	var mu sync.Mutex
	var wg sync.WaitGroup

	for _, p := range ports {
		wg.Add(1)
		go func(port int, service, risk string) {
			defer wg.Done()
			addr := fmt.Sprintf("%s:%d", host, port)
			conn, err := net.DialTimeout("tcp", addr, 2*time.Second)
			if err == nil {
				conn.Close()
				severity := risk
				if port == 80 || port == 443 {
					severity = "info"
				}
				mu.Lock()
				findings = append(findings, models.Finding{
					Module:   "Port Scanner",
					Severity: severity,
					Title:    fmt.Sprintf("Port %d/%s açık", port, service),
					Detail:   fmt.Sprintf("Port %d (%s) dışarıya açık durumda", port, service),
					Fix:      fmt.Sprintf("Port %d gerekli değilse firewall ile kapatın", port),
				})
				mu.Unlock()
			}
		}(p.port, p.service, p.risk)
	}

	wg.Wait()

	score := 100
	for _, f := range findings {
		switch f.Severity {
		case "critical":
			score -= 15
		case "high":
			score -= 10
		case "medium":
			score -= 5
		}
	}
	if score < 0 {
		score = 0
	}

	return models.ModuleResult{
		Name:     "Port Scanner",
		Status:   "completed",
		Score:    score,
		Findings: findings,
		Duration: float64(time.Since(start).Milliseconds()),
	}
}

func extractHost(url string) string {
	host := url
	host = strings.TrimPrefix(host, "http://")
	host = strings.TrimPrefix(host, "https://")
	host = strings.Split(host, "/")[0]
	host = strings.Split(host, ":")[0]
	return host
}
