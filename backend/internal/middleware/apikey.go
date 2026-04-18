package middleware

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ApiKeyAuth(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("x-api-key")
		if apiKey == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing x-api-key"})
			return
		}

		userID, err := getUserIDByAPIKey(db, apiKey)
		if err == sql.ErrNoRows {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid api key"})
			return
		}
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "could not validate api key"})
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}

func getUserIDByAPIKey(db *sql.DB, apiKey string) (int, error) {
	query := `
		SELECT id
		FROM users
		WHERE api_key = $1
		  AND is_active = true
	`

	var userID int
	err := db.QueryRow(query, apiKey).Scan(&userID)
	if err != nil {
		return 0, err
	}

	return userID, nil
}
