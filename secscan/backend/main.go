package main

import (
	"log"
	"secscan/handlers"
	"secscan/scanner"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://frontend:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Scanner manager
	sm := scanner.NewManager()

	// Handler
	h := handlers.NewHandler(sm)

	// Routes
	api := r.Group("/api")
	{
		api.POST("/scan", h.StartScan)
		api.GET("/scan/:id", h.GetScan)
		api.GET("/scan/:id/pdf", h.GetPDF)
	}

	// SSE stream
	r.GET("/stream", h.Stream)

	// Health
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	log.Println("🚀 SecScan Backend: http://localhost:8080")
	r.Run(":8080")
}
