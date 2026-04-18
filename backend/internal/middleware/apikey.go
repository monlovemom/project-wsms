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

		userID, keyID, err := getUserIDByAPIKey(db, apiKey)
		if err == sql.ErrNoRows {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid api key"})
			return
		}
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "could not validate api key"})
			return
		}

		c.Set("user_id", userID)
		c.Set("api_key_id", keyID)
		c.Next()
	}
}

func getUserIDByAPIKey(db *sql.DB, apiKey string) (int, int, error) {
	query := `
		SELECT ak.user_id, ak.id
		FROM api_keys ak
		JOIN users u ON ak.user_id = u.id
		WHERE ak.key = $1
		  AND ak.is_active = true
		  AND u.is_active = true
	`

	var userID, keyID int
	err := db.QueryRow(query, apiKey).Scan(&userID, &keyID)
	if err != nil {
		return 0, 0, err
	}

	return userID, keyID, nil
}
