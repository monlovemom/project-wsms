package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type WeatherHandler struct{}

func NewWeatherHandler() *WeatherHandler {
	return &WeatherHandler{}
}

// GET /api/weather
func (h *WeatherHandler) GetWeather(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"city_name":           "Chiang Mai",
		"temp":                32.5,
		"weather_description": "partly cloudy",
		"temp_min":            31.0,
		"temp_max":            34.0,
	})
}
