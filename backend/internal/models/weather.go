package models

import "time"

type WeatherData struct {
	Temperature float64   `json:"temperature"`
	Humidity    float64   `json:"humidity"`
	WindSpeed   float64   `json:"wind_speed"`
	Condition   string    `json:"condition"`
	Icon        *string   `json:"icon"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type WeatherResponse struct {
	Status   string      `json:"status"`
	Province string      `json:"province"`
	Data     WeatherData `json:"data"`
}

type WeatherListResponse struct {
	Status string        `json:"status"`
	Data   []WeatherItem `json:"data"`
	Total  int           `json:"total"`
}

type WeatherItem struct {
	Province string      `json:"province"`
	Data     WeatherData `json:"data"`
}

// Forecast models

type ForecastDay struct {
	Date      string  `json:"date"`
	TempMin   float64 `json:"temp_min"`
	TempMax   float64 `json:"temp_max"`
	Humidity  float64 `json:"humidity"`
	WindSpeed float64 `json:"wind_speed"`
	Condition string  `json:"condition"`
	Icon      string  `json:"icon"`
}

type WeatherForecastResponse struct {
	Status   string        `json:"status"`
	Province string        `json:"province"`
	Current  WeatherData   `json:"current"`
	Forecast []ForecastDay `json:"forecast"`
}

type WeatherForecastItem struct {
	Province string        `json:"province"`
	Current  WeatherData   `json:"current"`
	Forecast []ForecastDay `json:"forecast"`
}

type WeatherForecastListResponse struct {
	Status string                `json:"status"`
	Data   []WeatherForecastItem `json:"data"`
	Total  int                   `json:"total"`
}
