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

func (h *WeatherHandler) GetWeather(c *gin.Context) {
	province := strings.TrimSpace(c.Query("province"))
	lang := strings.ToLower(strings.TrimSpace(c.DefaultQuery("lang", "th")))
	if lang != "en" {
		lang = "th"
	}

	if province == "" {
		items, err := h.repo.GetAll(lang)
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

	weather, err := h.repo.GetLatestByProvince(province, lang)
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
