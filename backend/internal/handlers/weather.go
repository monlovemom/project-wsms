package handlers

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"backend/internal/models"
	repository "backend/internal/repositories"
)

type WeatherHandler struct {
	repo *repository.WeatherRepository
}

func NewWeatherHandler(repo *repository.WeatherRepository) *WeatherHandler {
	return &WeatherHandler{repo: repo}
}

// GET /api/weather or GET /api/weather?city=Chiang Mai
func (h *WeatherHandler) GetWeather(c *gin.Context) {
	city := strings.TrimSpace(c.Query("city"))

	if city == "" {
		weatherList, err := h.repo.GetAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not get weather data"})
			return
		}

		if len(weatherList) == 0 {
			c.JSON(http.StatusOK, gin.H{"data": []models.WeatherResponse{}, "total": 0})
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": weatherList, "total": len(weatherList)})
		return
	}

	weather, err := h.repo.GetLatestByCity(city)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "weather data not found for city: " + city})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not get weather data"})
		return
	}

	c.JSON(http.StatusOK, weather)
}
