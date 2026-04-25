package repository

import (
	"context"
	"database/sql"
	"time"

	"backend/internal/models"
)

type QuotaRepository struct {
	DB *sql.DB
}

func NewQuotaRepository(db *sql.DB) *QuotaRepository {
	return &QuotaRepository{DB: db}
}

func (r *QuotaRepository) UpsertUsageQuota(ctx context.Context, userID int) error {
	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	now := time.Now()
	today := now.Format("2006-01-02")

	var id int
	var usedToday int
	var usedThisMonth int

	checkQuery := `
		SELECT id, used_today, used_this_month
		FROM usage_quota
		WHERE user_id = $1 AND quota_date = $2
		LIMIT 1
	`

	err = tx.QueryRowContext(ctx, checkQuery, userID, today).Scan(&id, &usedToday, &usedThisMonth)

	if err != nil {
		if err == sql.ErrNoRows {
			var monthTotal int

			monthQuery := `
				SELECT COALESCE(SUM(used_today), 0)
				FROM usage_quota
				WHERE user_id = $1
				AND DATE_TRUNC('month', quota_date) = DATE_TRUNC('month', $2::date)
			`

			if err := tx.QueryRowContext(ctx, monthQuery, userID, today).Scan(&monthTotal); err != nil {
				return err
			}

			insertQuery := `
				INSERT INTO usage_quota
					(user_id, quota_date, used_today, used_this_month, last_request_at, reset_at)
				VALUES
					($1, $2, $3, $4, $5, $6)
			`

			resetAt := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())

			if _, err := tx.ExecContext(
				ctx,
				insertQuery,
				userID,
				today,
				1,
				monthTotal+1,
				now,
				resetAt,
			); err != nil {
				return err
			}
		} else {
			return err
		}
	} else {
		updateQuery := `
			UPDATE usage_quota
			SET
				used_today = used_today + 1,
				used_this_month = used_this_month + 1,
				last_request_at = $1
			WHERE id = $2
		`

		if _, err := tx.ExecContext(ctx, updateQuery, now, id); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *QuotaRepository) GetQuotaByUserToday(ctx context.Context, userID int) (*models.UsageQuota, error) {
	query := `
		SELECT id, user_id, quota_date, used_today, used_this_month, last_request_at, reset_at
		FROM usage_quota
		WHERE user_id = $1 AND quota_date = CURRENT_DATE
		LIMIT 1
	`

	var q models.UsageQuota
	err := r.DB.QueryRowContext(ctx, query, userID).Scan(
		&q.ID,
		&q.UserID,
		&q.QuotaDate,
		&q.UsedToday,
		&q.UsedThisMonth,
		&q.LastRequestAt,
		&q.ResetAt,
	)

	if err == sql.ErrNoRows {
		now := time.Now()
		resetAt := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())

		return &models.UsageQuota{
			UserID:        userID,
			QuotaDate:     now,
			UsedToday:     0,
			UsedThisMonth: 0,
			LastRequestAt: time.Time{},
			ResetAt:       resetAt,
		}, nil
	}

	if err != nil {
		return nil, err
	}

	return &q, nil
}

func (r *QuotaRepository) GetRecentUsageByUser(ctx context.Context, userID int, limit int) ([]models.UsageRequest, error) {
	if limit <= 0 {
		limit = 10
	}

	query := `
		SELECT
			au.id,
			COALESCE(ak.name, '') AS api_key_name,
			COALESCE(au.endpoint, '') AS endpoint,
			COALESCE(au.method, '') AS method,
			COALESCE(au.status_code, 0) AS status_code,
			COALESCE(au.response_ms, 0) AS response_ms,
			au.requested_at
		FROM api_usage au
		LEFT JOIN api_keys ak ON ak.id = au.api_key_id
		WHERE au.user_id = $1
		ORDER BY au.requested_at DESC
		LIMIT $2
	`

	rows, err := r.DB.QueryContext(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.UsageRequest, 0)
	for rows.Next() {
		var item models.UsageRequest
		if err := rows.Scan(
			&item.ID,
			&item.APIKeyName,
			&item.Endpoint,
			&item.Method,
			&item.StatusCode,
			&item.ResponseMS,
			&item.RequestedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}
