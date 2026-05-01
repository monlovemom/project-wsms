package handlers

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"backend/internal/models"
	"backend/internal/services"
)

type WeatherHandler struct {
	svc *services.WeatherService
}

func NewWeatherHandler(svc *services.WeatherService) *WeatherHandler {
	return &WeatherHandler{svc: svc}
}

func (h *WeatherHandler) GetWeather(c *gin.Context) {
	province := strings.TrimSpace(c.Query("province"))
	lang := strings.ToLower(strings.TrimSpace(c.DefaultQuery("lang", "th")))
	if lang != "en" {
		lang = "th"
	}

	if province == "" {
		items, err := h.svc.GetAll(lang)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "could not get weather data"})
			return
		}

		c.JSON(http.StatusOK, models.WeatherListResponse{
			Status: "ok",
			Data:   items,
			Total:  len(items),
		})
		return
	}

	weather, err := h.svc.GetLatestByProvince(province, lang)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "error": "weather data not found for province: " + province})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "could not get weather data"})
		return
	}

	c.JSON(http.StatusOK, weather)
}

// GetForecast returns current weather + 7-day mock forecast for a province.
func (h *WeatherHandler) GetForecast(c *gin.Context) {
	province := strings.TrimSpace(c.Query("province"))
	lang := strings.ToLower(strings.TrimSpace(c.DefaultQuery("lang", "th")))
	if lang != "en" {
		lang = "th"
	}

	if province == "" {
		items, err := h.svc.GetAllForecast(lang)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "could not get forecast data"})
			return
		}
		c.JSON(http.StatusOK, models.WeatherForecastListResponse{
			Status: "ok",
			Data:   items,
			Total:  len(items),
		})
		return
	}

	result, err := h.svc.GetForecast(province, lang)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "error": "weather data not found for province: " + province})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "error": "could not get forecast data"})
		return
	}

	c.JSON(http.StatusOK, result)
}
