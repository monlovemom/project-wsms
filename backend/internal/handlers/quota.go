package handlers

import (
	"net/http"

	"backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type QuotaHandler struct {
	QuotaService *services.QuotaService
}

func NewQuotaHandler(quotaService *services.QuotaService) *QuotaHandler {
	return &QuotaHandler{QuotaService: quotaService}
}

func getUserIDFromClaims(c *gin.Context) (int, bool) {
	rawClaims, exists := c.Get("claims")
	if !exists {
		return 0, false
	}

	claims, ok := rawClaims.(jwt.MapClaims)
	if !ok {
		return 0, false
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return 0, false
	}

	return int(userIDFloat), true
}

func (h *QuotaHandler) GetMyUsage(c *gin.Context) {
	userID, ok := getUserIDFromClaims(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	data, err := h.QuotaService.GetMyUsage(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}

func (h *QuotaHandler) GetMyUsageSummary(c *gin.Context) {
	userID, ok := getUserIDFromClaims(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	data, err := h.QuotaService.GetMyUsageSummary(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}