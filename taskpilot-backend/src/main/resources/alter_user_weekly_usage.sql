-- Weekly usage tracking fields for User entity
-- Run this migration to add weekly usage limit fields to the users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS tasks_created_this_week INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS meetings_created_this_week INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emails_sent_this_week INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_usage_reset_date DATE;

-- Reset all existing users' weekly counters
UPDATE users SET 
    tasks_created_this_week = 0,
    meetings_created_this_week = 0,
    emails_sent_this_week = 0,
    last_usage_reset_date = CURRENT_DATE;
