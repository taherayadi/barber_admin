-- Add phone number to user accounts (captured at registration)
ALTER TABLE users ADD COLUMN phone TEXT NOT NULL DEFAULT '';
