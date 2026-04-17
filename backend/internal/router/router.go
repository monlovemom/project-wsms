package router

import (
	"backend/internal/handlers"
	"backend/internal/middleware"
	repository "backend/internal/repositories"
	"database/sql"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(db *sql.DB) *gin.Engine {
	r := gin.Default()

	userRepo := repository.NewUserRepository(db)
	userHandler := handlers.NewUserHandler(userRepo)

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"http://localhost",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/health", func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "Unhealthy"})
			return
		}

		c.JSON(200, gin.H{"status": "Health"})
	})

	// public
	r.POST("/register", userHandler.Register)
	r.POST("/login", userHandler.Login)

	// auth
	api := r.Group("/api")
	api.Use(middleware.Auth())
	{
		api.GET("/me", userHandler.GetMe)

	}

	// admin
	admin := r.Group("/api")
	admin.Use(middleware.Auth(), middleware.RoleRequired("admin"))
	{
		admin.GET("/users", userHandler.GetAllUsers)
	}

	return r
}
