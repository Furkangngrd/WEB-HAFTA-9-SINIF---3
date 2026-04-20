package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"secscan/models"
	"secscan/report"
	"secscan/scanner"

	"github.com/gin-gonic/gin"
)

// Handler — API handler'ları
type Handler struct {
	manager *scanner.Manager
}

// NewHandler — yeni handler oluştur
func NewHandler(m *scanner.Manager) *Handler {
	return &Handler{manager: m}
}

// StartScan — POST /api/scan
func (h *Handler) StartScan(c *gin.Context) {
	var req models.ScanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Geçersiz istek",
			"details": "URL alanı zorunludur. Örnek: {\"url\": \"https://example.com\"}",
		})
		return
	}

	result, err := h.manager.StartScan(req.URL)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error":   "Tarama başlatılamadı",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":      result.ID,
		"url":     result.URL,
		"status":  result.Status,
		"message": "Tarama başlatıldı",
	})
}

// GetScan — GET /api/scan/:id
func (h *Handler) GetScan(c *gin.Context) {
	id := c.Param("id")
	result, ok := h.manager.GetResult(id)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Tarama bulunamadı",
			"id":    id,
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetPDF — GET /api/scan/:id/pdf
func (h *Handler) GetPDF(c *gin.Context) {
	id := c.Param("id")
	result, ok := h.manager.GetResult(id)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tarama bulunamadı"})
		return
	}

	if result.Status != "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tarama henüz tamamlanmadı"})
		return
	}

	pdfBytes, err := report.GeneratePDF(result)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "PDF oluşturulamadı"})
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=secscan-report-%s.pdf", id))
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}

// Stream — GET /stream (SSE)
func (h *Handler) Stream(c *gin.Context) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Streaming desteklenmiyor"})
		return
	}

	// İlk bağlantı onayı
	fmt.Fprintf(c.Writer, "data: {\"type\":\"connected\",\"message\":\"SSE bağlantısı kuruldu\"}\n\n")
	flusher.Flush()

	events := h.manager.Events()
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	clientGone := c.Request.Context().Done()

	for {
		select {
		case <-clientGone:
			return
		case event := <-events:
			data, _ := json.Marshal(event)
			fmt.Fprintf(c.Writer, "data: %s\n\n", data)
			flusher.Flush()
		case <-ticker.C:
			// Keepalive
			fmt.Fprintf(c.Writer, ": keepalive\n\n")
			flusher.Flush()
		}
	}
	_ = io.Discard
}
