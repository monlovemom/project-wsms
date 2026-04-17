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
