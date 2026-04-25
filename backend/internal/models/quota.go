package models

import "time"

type UsageQuota struct {
	ID              int       `json:"id"`
	UserID          int       `json:"user_id"`
	QuotaDate       time.Time `json:"quota_date"`
	UsedToday       int       `json:"used_today"`
	UsedThisMonth   int       `json:"used_this_month"`
	LastRequestAt   time.Time `json:"last_request_at"`
	ResetAt         time.Time `json:"reset_at"`
}