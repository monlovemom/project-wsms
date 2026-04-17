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

func (r *WeatherRepository) GetLatestByProvince(province string) (*models.WeatherResponse, error) {
	province = strings.TrimSpace(province)

	query := `
		SELECT
			p.name AS province_name,
			wl.temperature,
			wl.humidity,
			wl.wind_speed,
			wl.condition,
			wl.icon,
			wl.updated_at
		FROM provinces p
		JOIN weather_logs wl ON wl.province_id = p.id
		WHERE LOWER(p.name) = LOWER($1)
		ORDER BY wl.updated_at DESC
		LIMIT 1
	`

	var provinceName string
	var data models.WeatherData
	err := r.DB.QueryRow(query, province).Scan(
		&provinceName,
		&data.Temperature,
		&data.Humidity,
		&data.WindSpeed,
		&data.Condition,
		&data.Icon,
		&data.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &models.WeatherResponse{
		Status:   "ok",
		Province: provinceName,
		Data:     data,
	}, nil
}

func (r *WeatherRepository) GetAll() ([]models.WeatherItem, error) {
	query := `
		SELECT
			p.name AS province_name,
			wl.temperature,
			wl.humidity,
			wl.wind_speed,
			wl.condition,
			wl.icon,
			wl.updated_at
		FROM provinces p
		JOIN weather_logs wl ON wl.province_id = p.id
		ORDER BY wl.updated_at DESC
	`

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.WeatherItem
	for rows.Next() {
		var provinceName string
		var data models.WeatherData
		err := rows.Scan(
			&provinceName,
			&data.Temperature,
			&data.Humidity,
			&data.WindSpeed,
			&data.Condition,
			&data.Icon,
			&data.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, models.WeatherItem{
			Province: provinceName,
			Data:     data,
		})
	}

	return items, nil
}
