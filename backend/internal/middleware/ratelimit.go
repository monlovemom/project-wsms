package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type ipEntry struct {
	count     int
	expiresAt time.Time
}

func IPRateLimit(maxRequests int, window time.Duration) gin.HandlerFunc {
	var mu sync.Mutex
	clients := make(map[string]*ipEntry)

	go func() {
		for {
			time.Sleep(window)
			mu.Lock()
			now := time.Now()
			for ip, entry := range clients {
				if now.After(entry.expiresAt) {
					delete(clients, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return func(c *gin.Context) {
		ip := c.ClientIP()
		mu.Lock()

		entry, exists := clients[ip]
		now := time.Now()

		if !exists || now.After(entry.expiresAt) {
			clients[ip] = &ipEntry{count: 1, expiresAt: now.Add(window)}
			mu.Unlock()
			c.Next()
			return
		}

		if entry.count >= maxRequests {
			mu.Unlock()
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"status": "error",
				"error":  "rate limit exceeded, try again later",
			})
			return
		}

		entry.count++
		mu.Unlock()
		c.Next()
	}
}
