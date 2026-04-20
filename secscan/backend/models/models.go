package models

import "time"

// ScanRequest — POST /api/scan body
type ScanRequest struct {
	URL string `json:"url" binding:"required"`
}

// ScanResult — tarama sonucu
type ScanResult struct {
	ID          string         `json:"id"`
	URL         string         `json:"url"`
	Status      string         `json:"status"` // running, completed, error
	StartTime   time.Time      `json:"start_time"`
	EndTime     *time.Time     `json:"end_time,omitempty"`
	Score       int            `json:"score"`       // 0-100
	Grade       string         `json:"grade"`       // A+ - F
	Progress    int            `json:"progress"`    // 0-100
	Findings    []Finding      `json:"findings"`
	ModuleResults []ModuleResult `json:"module_results"`
}

// Finding — tek bir bulgu
type Finding struct {
	Module   string `json:"module"`
	Severity string `json:"severity"` // critical, high, medium, low, info
	Title    string `json:"title"`
	Detail   string `json:"detail"`
	Fix      string `json:"fix,omitempty"`
}

// ModuleResult — modül bazlı sonuç
type ModuleResult struct {
	Name     string    `json:"name"`
	Status   string    `json:"status"` // running, completed, error
	Score    int       `json:"score"`  // 0-100
	Findings []Finding `json:"findings"`
	Duration float64   `json:"duration_ms"`
}

// SSEEvent — Server-Sent Event
type SSEEvent struct {
	ScanID   string `json:"scan_id"`
	Module   string `json:"module"`
	Status   string `json:"status"`
	Progress int    `json:"progress"`
	Message  string `json:"message"`
}

// CalculateGrade — skora göre not hesapla
func CalculateGrade(score int) string {
	switch {
	case score >= 95:
		return "A+"
	case score >= 90:
		return "A"
	case score >= 80:
		return "B"
	case score >= 70:
		return "C"
	case score >= 60:
		return "D"
	default:
		return "F"
	}
}
