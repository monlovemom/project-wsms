package repository

import (
	"database/sql"
	"time"

	"backend/internal/models"
)

type UserRepository struct {
	DB *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{DB: db}
}

func (r *UserRepository) CreateUser(username, email, hashedPassword string) (*models.UserResponse, error) {
	query := `
		INSERT INTO users (username, email, password, is_active, created_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, username, email, (SELECT plan_name FROM plan WHERE id = plan_id), role, is_active, created_at
	`

	var user models.UserResponse
	err := r.DB.QueryRow(query,
		username,
		email,
		hashedPassword,
		true,
		time.Now(),
	).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PlanName,
		&user.Role,
		&user.IsActive,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) CreateAPIKey(userID int, key string, name string) (*models.APIKey, error) {
	query := `
		INSERT INTO api_keys (user_id, key, name, is_active, created_at)
		VALUES ($1, $2, $3, true, NOW())
		RETURNING id, user_id, key, name, is_active, created_at
	`

	var apiKey models.APIKey
	err := r.DB.QueryRow(query, userID, key, name).Scan(
		&apiKey.ID,
		&apiKey.UserID,
		&apiKey.Key,
		&apiKey.Name,
		&apiKey.IsActive,
		&apiKey.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &apiKey, nil
}

func (r *UserRepository) GetAPIKeys(userID int) ([]models.APIKey, error) {
	query := `
		SELECT id, user_id, key, name, is_active, created_at
		FROM api_keys
		WHERE user_id = $1 AND is_active = true
		ORDER BY created_at DESC
	`

	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var keys []models.APIKey
	for rows.Next() {
		var k models.APIKey
		err := rows.Scan(&k.ID, &k.UserID, &k.Key, &k.Name, &k.IsActive, &k.CreatedAt)
		if err != nil {
			return nil, err
		}
		keys = append(keys, k)
	}
	return keys, nil
}

func (r *UserRepository) GetAPIKeyByID(userID int, keyID int) (*models.APIKey, error) {
	query := `
		SELECT id, user_id, key, name, is_active, created_at
		FROM api_keys
		WHERE id = $1 AND user_id = $2 AND is_active = true
	`

	var k models.APIKey
	err := r.DB.QueryRow(query, keyID, userID).Scan(&k.ID, &k.UserID, &k.Key, &k.Name, &k.IsActive, &k.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &k, nil
}

func (r *UserRepository) DeleteAPIKey(userID int, keyID int) error {
	query := `DELETE FROM api_keys WHERE id = $1 AND user_id = $2`

	res, err := r.DB.Exec(query, keyID, userID)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *UserRepository) UpdateUserPlan(userID int, planID int) error {
	query := `UPDATE users SET plan_id = $1 WHERE id = $2`
	res, err := r.DB.Exec(query, planID, userID)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *UserRepository) GetPlanByID(planID int) (bool, error) {
	var exists bool
	err := r.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM plan WHERE id = $1 AND is_active = true)`, planID).Scan(&exists)
	return exists, err
}

func (r *UserRepository) GetUserByUsername(username string) (*models.User, error) {
	query := `
		SELECT id, username, email, password, plan_id, role, is_active, created_at
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
		SELECT u.id, u.username, u.email, p.plan_name, u.role, u.is_active, u.created_at
		FROM users u JOIN plan p ON u.plan_id = p.id WHERE u.id = $1
	`

	var user models.UserResponse
	err := r.DB.QueryRow(query, id).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PlanName,
		&user.Role,
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
		SELECT u.id, u.username, u.email, p.plan_name, u.role, u.is_active, u.created_at
		FROM users u JOIN plan p ON u.plan_id = p.id
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
			&user.PlanName,
			&user.Role,
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
