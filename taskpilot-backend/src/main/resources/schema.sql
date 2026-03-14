-- Weekly usage tracking fields for User entity
-- This file is auto-run by Spring Boot at startup via spring.sql.init.schema-locations

ALTER TABLE users ADD COLUMN IF NOT EXISTS tasks_created_this_week INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS meetings_created_this_week INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emails_sent_this_week INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_usage_reset_date DATE;
