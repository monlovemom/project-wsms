package router

import (
	"backend/internal/handlers"
	"backend/internal/middleware"
	repository "backend/internal/repositories"
	"backend/internal/services"
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(db *sql.DB) *gin.Engine {
	r := gin.Default()

	userRepo := repository.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)
	weatherRepo := repository.NewWeatherRepository(db)
	weatherService := services.NewWeatherService(weatherRepo)
	weatherHandler := handlers.NewWeatherHandler(weatherService)

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

	r.GET("/api/provinces", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, name, name_en FROM provinces")
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var provinces []gin.H
		for rows.Next() {
			var id int
			var name, name_en string
			rows.Scan(&id, &name, &name_en)
			provinces = append(provinces, gin.H{"id": id, "name": name, "name_en": name_en})
		}
		c.JSON(200, provinces)
	})

	r.GET("/api/plans", userHandler.GetAllPlans)

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
		// GET /api/api-key
		api.GET("/api-key", userHandler.GetAPIKey)
		// GET /api/api-key/id
		api.GET("/api-key/:id", userHandler.GetAPIKeyByID)
		// POST /api/api-key
		api.POST("/api-key", userHandler.CreateAPIKey)
		// DELETE /api/api-key/id
		api.DELETE("/api-key/:id", userHandler.DeleteAPIKey)
		// PUT /api/plan (plan id 1 = free, 2 = pro, 3 = enterprise)
		api.PUT("/plan", userHandler.ChangePlan)

		api.GET("/dashboard-stats", userHandler.GetDashboardStats)
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
