package services

import (
	"crypto/rand"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"backend/internal/models"
	repository "backend/internal/repositories"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrAccountDisabled    = errors.New("account is disabled")
	ErrMaxAPIKeys         = errors.New("maximum 5 api keys allowed")
	ErrInvalidPlan        = errors.New("invalid plan_id")
)

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) Register(req models.CreateUserRequest) (*models.UserResponse, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	return s.repo.CreateUser(req.Username, req.Email, string(hashed))
}

func (s *UserService) Login(req models.LoginRequest) (string, *models.UserResponse, error) {
	user, err := s.repo.GetUserByUsername(req.Username)
	if err != nil {
		return "", nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return "", nil, ErrInvalidCredentials
	}

	if !user.IsActive {
		return "", nil, ErrAccountDisabled
	}

	token, err := generateJWT(user)
	if err != nil {
		return "", nil, fmt.Errorf("could not generate token: %w", err)
	}

	userResp, err := s.repo.GetUserByID(user.ID)
	if err != nil {
		return "", nil, fmt.Errorf("could not get user: %w", err)
	}

	return token, userResp, nil
}

func (s *UserService) GetUserByID(id int) (*models.UserResponse, error) {
	return s.repo.GetUserByID(id)
}

func (s *UserService) GetAllUsers() ([]models.UserResponse, error) {
	return s.repo.GetAllUsers()
}

func (s *UserService) CreateAPIKey(userID int, name string) (*models.APIKey, error) {
	keys, err := s.repo.GetAPIKeys(userID)
	if err != nil {
		return nil, fmt.Errorf("could not check api keys: %w", err)
	}
	if len(keys) >= 5 {
		return nil, ErrMaxAPIKeys
	}

	if name == "" {
		name = "default"
	}

	key := generateAPIKeyString()
	return s.repo.CreateAPIKey(userID, key, name)
}

func (s *UserService) GetAPIKeys(userID int) ([]models.APIKey, error) {
	return s.repo.GetAPIKeys(userID)
}

func (s *UserService) GetAPIKeyByID(userID int, keyID int) (*models.APIKey, error) {
	return s.repo.GetAPIKeyByID(userID, keyID)
}

func (s *UserService) DeleteAPIKey(userID int, keyID int) error {
	return s.repo.DeleteAPIKey(userID, keyID)
}

func (s *UserService) ChangePlan(userID int, planID int) (*models.UserResponse, error) {
	exists, err := s.repo.GetPlanByID(planID)
	if err != nil {
		return nil, fmt.Errorf("could not verify plan: %w", err)
	}
	if !exists {
		return nil, ErrInvalidPlan
	}

	if err := s.repo.UpdateUserPlan(userID, planID); err != nil {
		return nil, fmt.Errorf("could not update plan: %w", err)
	}

	return s.repo.GetUserByID(userID)
}

func generateJWT(user *models.User) (string, error) {
	secret := os.Getenv("JWT_SECRET")

	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"plan_id":  user.PlanID,
		"role":     user.Role,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func generateAPIKeyString() string {
	b := make([]byte, 32)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}
