package repository

import (
	"crypto/rand"
	"database/sql"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"

	"backend/internal/models"
)

type UserRepository struct {
	DB *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{DB: db}
}

func (r *UserRepository) CreateUser(req models.CreateUserRequest) (*models.UserResponse, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	query := `
		INSERT INTO users (username, email, password, is_active, created_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, username, email, plan_id, role, api_key, is_active, created_at
	`

	var user models.UserResponse
	err = r.DB.QueryRow(query,
		req.Username,
		req.Email,
		string(hashed),
		true,
		time.Now(),
	).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PlanID,
		&user.Role,
		&user.APIKey,
		&user.IsActive,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func generateAPIKey() string {
	b := make([]byte, 32)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

func (r *UserRepository) GenerateAPIKey(userID int) (string, error) {
	apiKey := generateAPIKey()

	query := `UPDATE users SET api_key = $1 WHERE id = $2 AND is_active = true RETURNING api_key`

	var key string
	err := r.DB.QueryRow(query, apiKey, userID).Scan(&key)
	if err != nil {
		return "", err
	}
	return key, nil
}

func (r *UserRepository) DeleteAPIKey(userID int) error {
	query := `UPDATE users SET api_key = NULL WHERE id = $1 AND is_active = true`

	res, err := r.DB.Exec(query, userID)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *UserRepository) GetAPIKey(userID int) (*string, error) {
	query := `SELECT api_key FROM users WHERE id = $1 AND is_active = true`

	var apiKey *string
	err := r.DB.QueryRow(query, userID).Scan(&apiKey)
	if err != nil {
		return nil, err
	}
	return apiKey, nil
}

func (r *UserRepository) GetUserByUsername(username string) (*models.User, error) {
	query := `
		SELECT id, username, email, password, plan_id, role, api_key, is_active, created_at
		FROM users WHERE username = $1
	`

	var user models.User
	err := r.DB.QueryRow(query, username).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.PlanID,
		&user.Role,
		&user.APIKey,
		&user.IsActive,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) GetUserByID(id int) (*models.UserResponse, error) {
	query := `
		SELECT id, username, email, plan_id, role, api_key, is_active, created_at
		FROM users WHERE id = $1
	`

	var user models.UserResponse
	err := r.DB.QueryRow(query, id).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PlanID,
		&user.Role,
		&user.APIKey,
		&user.IsActive,
		&user.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) GetAllUsers() ([]models.UserResponse, error) {
	query := `
		SELECT id, username, email, plan_id, role, api_key, is_active, created_at
		FROM users
	`

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.UserResponse
	for rows.Next() {
		var user models.UserResponse
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.Email,
			&user.PlanID,
			&user.Role,
			&user.APIKey,
			&user.IsActive,
			&user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}
