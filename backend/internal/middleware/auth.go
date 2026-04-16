package middleware

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(401, gin.H{"error": "unauthorized"})
			return
		}

		tokenStr := strings.TrimPrefix(header, "Bearer ")
		secret := os.Getenv("JWT_SECRET")

		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{"error": "invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"error": "invalid token claims"})
			return
		}

		c.Set("claims", claims)
		c.Next()
	}
}

func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		raw, exists := c.Get("claims")
		if !exists {
			c.AbortWithStatusJSON(403, gin.H{"error": "forbidden"})
			return
		}

		claims, ok := raw.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(403, gin.H{"error": "forbidden"})
			return
		}

		role, _ := claims["role"].(string)
		if role != "admin" {
			c.AbortWithStatusJSON(403, gin.H{"error": "Admin only JUBJUB"})
			return
		}

		c.Next()
	}
}
