package middleware

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type planQuota struct {
	PlanName      string
	ReqPerMinute  int
	ReqPerDay     int
	ReqPerMonth   int
	UsedPerMinute int
	UsedPerDay    int
	UsedPerMonth  int
}

func PlanQuota(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserIDFromContext(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		quota, err := getPlanQuotaUsage(db, userID)
		if err == sql.ErrNoRows {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "plan is inactive or user not found"})
			return
		}
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "could not validate quota"})
			return
		}

		if quota.UsedPerMinute >= quota.ReqPerMinute || quota.UsedPerDay >= quota.ReqPerDay || quota.UsedPerMonth >= quota.ReqPerMonth {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "quota exceeded",
				"plan":  quota.PlanName,
				"limits": gin.H{
					"req_per_minute": quota.ReqPerMinute,
					"req_per_day":    quota.ReqPerDay,
					"req_per_month":  quota.ReqPerMonth,
				},
				"used": gin.H{
					"req_per_minute": quota.UsedPerMinute,
					"req_per_day":    quota.UsedPerDay,
					"req_per_month":  quota.UsedPerMonth,
				},
			})
			return
		}

		start := time.Now()
		c.Next()

		responseMS := int(time.Since(start).Milliseconds())
		_ = saveAPIUsage(db, userID, c.FullPath(), c.Request.Method, c.Writer.Status(), responseMS, c.ClientIP())
	}
}

func getUserIDFromContext(c *gin.Context) (int, error) {
	if rawUserID, exists := c.Get("user_id"); exists {
		if userID, ok := rawUserID.(int); ok {
			return userID, nil
		}
	}

	rawClaims, exists := c.Get("claims")
	if !exists {
		return 0, fmt.Errorf("claims not found")
	}

	claims, ok := rawClaims.(jwt.MapClaims)
	if !ok {
		return 0, fmt.Errorf("invalid token claims")
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return 0, fmt.Errorf("invalid user_id in token")
	}

	return int(userIDFloat), nil
}

func getPlanQuotaUsage(db *sql.DB, userID int) (*planQuota, error) {
	query := `
		SELECT
			p.plan_name,
			p.req_per_minute,
			p.req_per_day,
			p.req_per_month,
			(SELECT COUNT(*) FROM api_usage WHERE user_id = $1 AND requested_at >= NOW() - INTERVAL '1 minute') AS used_per_minute,
			(SELECT COUNT(*) FROM api_usage WHERE user_id = $1 AND requested_at::date = CURRENT_DATE) AS used_per_day,
			(SELECT COUNT(*) FROM api_usage WHERE user_id = $1 AND DATE_TRUNC('month', requested_at) = DATE_TRUNC('month', NOW())) AS used_per_month
		FROM users u
		JOIN plan p ON p.id = u.plan_id
		WHERE u.id = $1
		  AND u.is_active = true
		  AND p.is_active = true
	`

	var quota planQuota
	err := db.QueryRow(query, userID).Scan(
		&quota.PlanName,
		&quota.ReqPerMinute,
		&quota.ReqPerDay,
		&quota.ReqPerMonth,
		&quota.UsedPerMinute,
		&quota.UsedPerDay,
		&quota.UsedPerMonth,
	)
	if err != nil {
		return nil, err
	}

	return &quota, nil
}

func saveAPIUsage(db *sql.DB, userID int, endpoint, method string, statusCode, responseMS int, ipAddress string) error {
	query := `
		INSERT INTO api_usage (user_id, endpoint, method, status_code, response_ms, ip_address)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := db.Exec(query, userID, endpoint, method, statusCode, responseMS, ipAddress)
	return err
}
