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

	if province == "" {
		items, err := h.repo.GetAll()
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

	weather, err := h.repo.GetLatestByProvince(province)
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
