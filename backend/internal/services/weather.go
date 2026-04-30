package services

import (
	"backend/internal/models"
	repository "backend/internal/repositories"
	"math"
	"time"
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

// GetForecast returns the current weather from DB + 7-day mock forecast.
func (s *WeatherService) GetForecast(province string, lang string) (*models.WeatherForecastResponse, error) {
	current, err := s.repo.GetLatestByProvince(province, lang)
	if err != nil {
		return nil, err
	}

	// Mock conditions vary by language
	type condIcon struct{ cond, icon string }
	var pool []condIcon
	if lang == "en" {
		pool = []condIcon{
			{"Sunny", "01d"},
			{"Partly Cloudy", "02d"},
			{"Cloudy", "03d"},
			{"Overcast", "04d"},
			{"Light Rain", "10d"},
			{"Thunderstorm", "11d"},
			{"Hazy", "50d"},
		}
	} else {
		pool = []condIcon{
			{"แดดจัด", "01d"},
			{"มีเมฆบางส่วน", "02d"},
			{"มีเมฆ", "03d"},
			{"มีเมฆมาก", "04d"},
			{"ฝนเล็กน้อย", "10d"},
			{"พายุฝนฟ้าคะนอง", "11d"},
			{"หมอกควัน", "50d"},
		}
	}

	// Use a simple deterministic seed from province name so results are
	// consistent per province rather than random on every request.
	seed := 0
	for _, ch := range province {
		seed += int(ch)
	}

	base := current.Data.Temperature
	forecast := make([]models.ForecastDay, 7)
	now := time.Now()

	for i := 0; i < 7; i++ {
		// Vary temperature ±3 °C with a sine-like pattern
		offset := math.Sin(float64(seed+i)*0.7) * 3
		tMin := math.Round((base-3+offset)*10) / 10
		tMax := math.Round((base+3+offset)*10) / 10
		hum := math.Round((current.Data.Humidity+float64((seed+i)%10)-5)*10) / 10
		if hum < 30 {
			hum = 30
		}
		if hum > 100 {
			hum = 100
		}
		wind := math.Round((current.Data.WindSpeed+float64((seed+i*2)%6)-3)*10) / 10
		if wind < 0 {
			wind = 0
		}

		ci := pool[(seed+i)%len(pool)]

		forecast[i] = models.ForecastDay{
			Date:      now.AddDate(0, 0, i+1).Format("2006-01-02"),
			TempMin:   tMin,
			TempMax:   tMax,
			Humidity:  hum,
			WindSpeed: wind,
			Condition: ci.cond,
			Icon:      ci.icon,
		}
	}

	return &models.WeatherForecastResponse{
		Status:   "ok",
		Province: current.Province,
		Current:  current.Data,
		Forecast: forecast,
	}, nil
}
