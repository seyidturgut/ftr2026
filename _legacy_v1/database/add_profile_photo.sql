-- Add profile_photo column to users table
-- Store only the file path/URL, not the actual image data

USE ftronlinedb;

ALTER TABLE users 
ADD COLUMN profile_photo VARCHAR(255) NULL AFTER email,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Verify column was added
DESCRIBE users;
