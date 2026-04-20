package scanner

import (
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	"secscan/models"

	"github.com/google/uuid"
)

// Scanner interface — tüm modüller bunu implemente eder
type Scanner interface {
	Name() string
	Scan(target string) models.ModuleResult
}

// Manager — tüm taramaları yönetir
type Manager struct {
	mu       sync.RWMutex
	results  map[string]*models.ScanResult
	scanners []Scanner
	events   chan models.SSEEvent
}

// NewManager — yeni manager oluştur
func NewManager() *Manager {
	m := &Manager{
		results: make(map[string]*models.ScanResult),
		events:  make(chan models.SSEEvent, 100),
	}
	// 7 scanner modülünü kaydet
	m.scanners = []Scanner{
		&PortScanner{},
		&HeaderScanner{},
		&TLSScanner{},
		&DirFuzzer{},
		&XSSScanner{},
		&SQLiScanner{},
		&CVEScanner{},
	}
	return m
}

// Events — SSE event kanalı
func (m *Manager) Events() <-chan models.SSEEvent {
	return m.events
}

// StartScan — yeni tarama başlat
func (m *Manager) StartScan(targetURL string) (*models.ScanResult, error) {
	// SSRF koruması
	if err := validateURL(targetURL); err != nil {
		return nil, err
	}

	id := uuid.New().String()[:8]
	result := &models.ScanResult{
		ID:        id,
		URL:       targetURL,
		Status:    "running",
		StartTime: time.Now(),
		Score:     100,
		Progress:  0,
		Findings:  []models.Finding{},
		ModuleResults: []models.ModuleResult{},
	}

	m.mu.Lock()
	m.results[id] = result
	m.mu.Unlock()

	// Arka planda taramayı başlat
	go m.runScan(result)

	return result, nil
}

// GetResult — sonuç getir
func (m *Manager) GetResult(id string) (*models.ScanResult, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	r, ok := m.results[id]
	return r, ok
}

// runScan — tüm modülleri sırayla çalıştır
func (m *Manager) runScan(result *models.ScanResult) {
	totalModules := len(m.scanners)

	for i, s := range m.scanners {
		// Progress güncelle
		progress := (i * 100) / totalModules
		m.mu.Lock()
		result.Progress = progress
		m.mu.Unlock()

		// SSE event gönder
		m.events <- models.SSEEvent{
			ScanID:   result.ID,
			Module:   s.Name(),
			Status:   "running",
			Progress: progress,
			Message:  fmt.Sprintf("%s taranıyor...", s.Name()),
		}

		// Modülü çalıştır
		moduleResult := s.Scan(result.URL)

		// Sonuçları kaydet
		m.mu.Lock()
		result.ModuleResults = append(result.ModuleResults, moduleResult)
		result.Findings = append(result.Findings, moduleResult.Findings...)

		// Her critical/high bulgu için puan düş
		for _, f := range moduleResult.Findings {
			switch f.Severity {
			case "critical":
				result.Score -= 15
			case "high":
				result.Score -= 10
			case "medium":
				result.Score -= 5
			case "low":
				result.Score -= 2
			}
		}
		if result.Score < 0 {
			result.Score = 0
		}
		m.mu.Unlock()

		// SSE event — modül tamamlandı
		m.events <- models.SSEEvent{
			ScanID:   result.ID,
			Module:   s.Name(),
			Status:   "completed",
			Progress: ((i + 1) * 100) / totalModules,
			Message:  fmt.Sprintf("%s tamamlandı (%d bulgu)", s.Name(), len(moduleResult.Findings)),
		}
	}

	// Tarama tamamlandı
	now := time.Now()
	m.mu.Lock()
	result.Status = "completed"
	result.Progress = 100
	result.EndTime = &now
	result.Grade = models.CalculateGrade(result.Score)
	m.mu.Unlock()

	m.events <- models.SSEEvent{
		ScanID:   result.ID,
		Module:   "all",
		Status:   "completed",
		Progress: 100,
		Message:  fmt.Sprintf("Tarama tamamlandı! Skor: %d (%s)", result.Score, result.Grade),
	}
}

// SSRF Koruması — private IP adresleri engelle
func validateURL(targetURL string) error {
	// URL parse
	if !strings.HasPrefix(targetURL, "http://") && !strings.HasPrefix(targetURL, "https://") {
		targetURL = "https://" + targetURL
	}

	// Host çıkar
	host := targetURL
	host = strings.TrimPrefix(host, "http://")
	host = strings.TrimPrefix(host, "https://")
	host = strings.Split(host, "/")[0]
	host = strings.Split(host, ":")[0]

	// IP çözümle
	ips, err := net.LookupIP(host)
	if err != nil {
		return fmt.Errorf("DNS çözümleme hatası: %s", host)
	}

	// Private IP kontrolü
	privateRanges := []struct {
		network *net.IPNet
		name    string
	}{
		{parseCIDR("127.0.0.0/8"), "Loopback"},
		{parseCIDR("10.0.0.0/8"), "Private (10.x)"},
		{parseCIDR("172.16.0.0/12"), "Private (172.16.x)"},
		{parseCIDR("192.168.0.0/16"), "Private (192.168.x)"},
		{parseCIDR("169.254.0.0/16"), "Link-local"},
		{parseCIDR("0.0.0.0/8"), "Unspecified"},
		{parseCIDR("::1/128"), "IPv6 Loopback"},
		{parseCIDR("fc00::/7"), "IPv6 Private"},
		{parseCIDR("fe80::/10"), "IPv6 Link-local"},
	}

	for _, ip := range ips {
		for _, pr := range privateRanges {
			if pr.network.Contains(ip) {
				return fmt.Errorf("SSRF engellendi: %s (%s — %s)", host, ip.String(), pr.name)
			}
		}
	}

	return nil
}

func parseCIDR(cidr string) *net.IPNet {
	_, network, _ := net.ParseCIDR(cidr)
	return network
}
