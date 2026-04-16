package configs

import (
	"database/sql"

	_ "github.com/lib/pq"

	"time"
)

func NewPostgresDB(cfg *Config) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.DatabaseURL)

	if err != nil {
		return nil, err
	}

	db.SetMaxIdleConns(20)
	db.SetMaxOpenConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}
