-- Add normal user: seyid
-- Password: 1q2w3e
-- Note: Password will be hashed by PHP when first logging in

USE ftronlinedb;

INSERT INTO users (username, password, title, first_name, last_name, email, role, is_active) 
VALUES (
    'seyid',
    '$2y$10$vKzM8qH5xL.VbJzE7qK5GuZ8WxMjYwN9yL0lR9pQqFZc5FnJ2hMzW',  -- hashed: 1q2w3e
    'Dr.',
    'Seyid',
    'Turgut',
    'seyid@ftronline.com',
    'viewer',
    TRUE
);

-- Verify user was created
SELECT id, username, title, first_name, last_name, role FROM users WHERE username = 'seyid';
