package models

import "time"

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

type User struct {
	ID        int       `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	Password  string    `json:"-" db:"password"`
	Email     string    `json:"email" db:"email"`
	PlanID    int       `json:"plan_id" db:"plan_id"`
	Role      Role      `json:"role" db:"role"`
	IsActive  bool      `json:"is_active" db:"is_active"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type APIKey struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Key       string    `json:"key"`
	Name      string    `json:"name"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateAPIKeyRequest struct {
	Name string `json:"name"`
}

type CreateUserRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email"    binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type ChangePlanRequest struct {
	PlanID int `json:"plan_id" binding:"required"`
}

type UserResponse struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	PlanName  string    `json:"plan_name"`
	Role      Role      `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

type DashboardStats struct {
	PlanName      string `json:"plan_name"`
	ReqPerDay     int    `json:"req_per_day"`
	ReqPerMonth   int    `json:"req_per_month"`
	UsedToday     int    `json:"used_today"`
	UsedThisMonth int    `json:"used_this_month"`
}

type Plan struct {
	ID                int    `json:"id"`
	PlanName          string `json:"plan_name"`
	ReqPerMinute      int    `json:"req_per_minute"`
	ReqPerDay         int    `json:"req_per_day"`
	ReqPerMonth       int    `json:"req_per_month"`
	Price             int    `json:"price"`
	HasUsageDashboard bool   `json:"has_usage_dashboard"`
	HasDataExport     bool   `json:"has_data_export"`
	SLAGuarantee      string `json:"sla_guarantee"`
	SupportLevel      string `json:"support_level"`
	IsActive          bool   `json:"is_active"`
}