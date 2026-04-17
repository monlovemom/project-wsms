package models

import "time"

type WeatherResponse struct {
	CityName           string    `json:"city_name" db:"city_name"`
	Temp               float64   `json:"temp" db:"temp"`
	WeatherDescription string    `json:"weather_description" db:"weather_description"`
	TempMin            float64   `json:"temp_min" db:"temp_min"`
	TempMax            float64   `json:"temp_max" db:"temp_max"`
	RecordedAt         time.Time `json:"recorded_at" db:"recorded_at"`
}
