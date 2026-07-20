-- Add visibility flag to promotions so admins can hide/show campaigns to clients
ALTER TABLE promotions ADD COLUMN active INTEGER NOT NULL DEFAULT 1;
