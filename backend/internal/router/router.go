package router

import (
	"backend/internal/handlers"
	"backend/internal/middleware"
	repository "backend/internal/repositories"
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(db *sql.DB) *gin.Engine {
	r := gin.Default()

	userRepo := repository.NewUserRepository(db)
	userHandler := handlers.NewUserHandler(userRepo)
	weatherRepo := repository.NewWeatherRepository(db)
	weatherHandler := handlers.NewWeatherHandler(weatherRepo)

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"http://localhost",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "x-api-key"},
		AllowCredentials: true,
	}))

	r.GET("/health", func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "Unhealthy"})
			return
		}

		c.JSON(200, gin.H{"status": "Health"})
	})

	// POST /register (username + email + password)
	r.POST("/register", userHandler.Register)
	// POST /login (username + password)
	r.POST("/login", userHandler.Login)

	// auth
	api := r.Group("/api")
	api.Use(middleware.Auth())
	{
		// GET /me
		api.GET("/me", userHandler.GetMe)
		// POST /api/api-key
		api.POST("/api-key", userHandler.CreateAPIKey)
		// GET /api/api-key
		api.GET("/api-key", userHandler.GetAPIKey)
		// DELETE /api/api-key
		api.DELETE("/api-key", userHandler.DeleteAPIKey)
	}

	// admin
	admin := r.Group("/api")
	admin.Use(middleware.Auth(), middleware.RoleRequired("admin"))
	{
		// GET /api/users
		admin.GET("/users", userHandler.GetAllUsers)
	}

	// weather
	weather := r.Group("/api")
	weather.Use(middleware.ApiKeyAuth(db), middleware.PlanQuota(db))
	{
		// GET /api/weather?lang=th or /api/weather?lang=en
		// GET /api/weather?province=เชียงใหม่&lang=th or /api/weather?province=Chiang Mai&lang=en
		weather.GET("/weather", weatherHandler.GetWeather)
	}

	// public weather preview
	preview := r.Group("/api/public")
	preview.Use(middleware.IPRateLimit(10, time.Minute))
	{
		// GET /api/public/weather?lang=th or /api/public/weather?lang=en
		// GET /api/public/weather?province=เชียงใหม่&lang=th or /api/public/weather?province=Chiang Mai&lang=en
		preview.GET("/weather", weatherHandler.GetWeather)
	}

	return r
}
