package services

import (
	"backend/internal/models"
	repository "backend/internal/repositories"
)

type WeatherService struct {
	repo *repository.WeatherRepository
}

func NewWeatherService(repo *repository.WeatherRepository) *WeatherService {
	return &WeatherService{repo: repo}
}

func (s *WeatherService) GetLatestByProvince(province string, lang string) (*models.WeatherResponse, error) {
	return s.repo.GetLatestByProvince(province, lang)
}

func (s *WeatherService) GetAll(lang string) ([]models.WeatherItem, error) {
	return s.repo.GetAll(lang)
}
