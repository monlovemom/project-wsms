package configs

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort     string
	DatabaseURL string
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	return &Config{
		AppPort:     getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
