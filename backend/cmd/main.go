package main

import (
	"backend/configs"
	"backend/internal/router"
	"log"
)

func main() {
	cfg := configs.LoadConfig()

	db, err := configs.NewPostgresDB(cfg)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	r := router.SetupRoutes(db)
	log.Println("Server running on port", cfg.AppPort)

	if err := r.Run(":" + cfg.AppPort); err != nil {
		log.Fatal(err)
	}
}
