package repository

import (
	"backend/internal/models"
	"database/sql"
	"strings"
)

type WeatherRepository struct {
	DB *sql.DB
}

func NewWeatherRepository(db *sql.DB) *WeatherRepository {
	return &WeatherRepository{DB: db}
}

func (r *WeatherRepository) GetLatestByCity(city string) (*models.WeatherResponse, error) {
	city = strings.TrimSpace(city)

	query := `
		SELECT
			l.name AS city_name,
			ws.temp,
			ws.weather_description,
			ws.temp_min,
			ws.temp_max,
			TO_TIMESTAMP(ws.recorded_at) AS recorded_at
		FROM location l
		JOIN weather_snapshot ws ON ws.location_id = l.id
		WHERE LOWER(l.name) = LOWER($1)
		ORDER BY ws.recorded_at DESC
		LIMIT 1
	`

	var weather models.WeatherResponse
	err := r.DB.QueryRow(query, city).Scan(
		&weather.CityName,
		&weather.Temp,
		&weather.WeatherDescription,
		&weather.TempMin,
		&weather.TempMax,
		&weather.RecordedAt,
	)
	if err != nil {
		return nil, err
	}

	return &weather, nil
}

func (r *WeatherRepository) GetAll() ([]models.WeatherResponse, error) {
	query := `
		SELECT
			l.name AS city_name,
			ws.temp,
			ws.weather_description,
			ws.temp_min,
			ws.temp_max,
			TO_TIMESTAMP(ws.recorded_at) AS recorded_at
		FROM location l
		JOIN weather_snapshot ws ON ws.location_id = l.id
		ORDER BY ws.recorded_at DESC
	`

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var weatherList []models.WeatherResponse
	for rows.Next() {
		var weather models.WeatherResponse
		err := rows.Scan(
			&weather.CityName,
			&weather.Temp,
			&weather.WeatherDescription,
			&weather.TempMin,
			&weather.TempMax,
			&weather.RecordedAt,
		)
		if err != nil {
			return nil, err
		}
		weatherList = append(weatherList, weather)
	}

	return weatherList, nil
}
