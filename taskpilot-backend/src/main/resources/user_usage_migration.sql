-- SQL Migration for UserDailyUsage
-- TaskPilot AI - Premium Gating Update

ALTER TABLE user_daily_usage DROP COLUMN IF EXISTS ai_requests_count;
ALTER TABLE user_daily_usage DROP COLUMN IF EXISTS documents_processed_count;
ALTER TABLE user_daily_usage DROP COLUMN IF EXISTS voice_commands_count;

-- Rename remaining columns for consistency with renamed entity fields
ALTER TABLE user_daily_usage RENAME COLUMN emails_sent_count TO emails_used;
ALTER TABLE user_daily_usage RENAME COLUMN meetings_scheduled_count TO meetings_used;
ALTER TABLE user_daily_usage RENAME COLUMN tasks_created_count TO tasks_used;
