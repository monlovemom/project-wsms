package services

import (
	"context"

	"backend/internal/models"
	repository "backend/internal/repositories"
)

type QuotaService struct {
	QuotaRepo *repository.QuotaRepository
}

func NewQuotaService(quotaRepo *repository.QuotaRepository) *QuotaService {
	return &QuotaService{QuotaRepo: quotaRepo}
}

func (s *QuotaService) LogUsage(ctx context.Context, userID int) error {
	return s.QuotaRepo.UpsertUsageQuota(ctx, userID)
}

func (s *QuotaService) GetMyUsage(ctx context.Context, userID int) (*models.UsageQuota, error) {
	return s.QuotaRepo.GetQuotaByUserToday(ctx, userID)
}

func (s *QuotaService) GetMyUsageSummary(ctx context.Context, userID int) (*models.UsageQuota, error) {
	return s.QuotaRepo.GetQuotaByUserToday(ctx, userID)
}

func (s *QuotaService) GetMyRecentUsage(ctx context.Context, userID int, limit int) ([]models.UsageRequest, error) {
	return s.QuotaRepo.GetRecentUsageByUser(ctx, userID, limit)
}
