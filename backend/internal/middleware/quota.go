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

		endpoint := c.FullPath()
		if endpoint == "" {
			endpoint = c.Request.URL.Path
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

		if quota.UsedPerMinute >= quota.ReqPerMinute {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded (per minute)",
				"plan":  quota.PlanName,
				"limit": quota.ReqPerMinute,
				"used":  quota.UsedPerMinute,
			})
			return
		}
		if quota.UsedPerDay >= quota.ReqPerDay {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "quota exceeded (per day)",
				"plan":  quota.PlanName,
				"limit": quota.ReqPerDay,
				"used":  quota.UsedPerDay,
			})
			return
		}
		if quota.UsedPerMonth >= quota.ReqPerMonth {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "quota exceeded (per month)",
				"plan":  quota.PlanName,
				"limit": quota.ReqPerMonth,
				"used":  quota.UsedPerMonth,
			})
			return
		}

		start := time.Now()

		defer func() {
			responseMS := float64(time.Since(start).Nanoseconds()) / 1e6
			statusCode := c.Writer.Status()
			if statusCode == 0 {
				statusCode = http.StatusOK
			}
			_ = saveAPIUsage(db, userID, endpoint, c.Request.Method, statusCode, responseMS, c.ClientIP())
		}()

		c.Next()
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

func saveAPIUsage(db *sql.DB, userID int, endpoint, method string, statusCode int, responseMS float64, ipAddress string) error {
	query := `
		INSERT INTO api_usage (user_id, endpoint, method, status_code, response_ms, ip_address)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := db.Exec(query, userID, endpoint, method, statusCode, responseMS, ipAddress)
	return err
}
