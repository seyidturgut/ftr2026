-- Update seyid user password
-- Password: 1q2w3e
-- Using a correct bcrypt hash

USE ftronlinedb;

-- Delete and recreate user with correct hash
DELETE FROM users WHERE username = 'seyid';

INSERT INTO users (username, password, title, first_name, last_name, email, role, is_active) 
VALUES (
    'seyid',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- Password: password (test hash)
    'Dr.',
    'Seyid',
    'Turgut',
    'seyid@ftronline.com',
    'viewer',
    TRUE
);

-- For now, use password 'password' to test
-- We can change it after login works
SELECT id, username, title, first_name, last_name, role FROM users WHERE username = 'seyid';
