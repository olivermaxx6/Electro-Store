-- Check existing databases
SHOW DATABASES;

-- Check existing users
SELECT User, Host FROM mysql.user WHERE User = 'electro_user';

-- Drop user if exists (to recreate)
DROP USER IF EXISTS 'electro_user'@'localhost';

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS electro_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with password
CREATE USER 'electro_user'@'localhost' IDENTIFIED BY 'ElectroStore2024!';

-- Grant privileges
GRANT ALL PRIVILEGES ON electro_store.* TO 'electro_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify user creation
SELECT User, Host FROM mysql.user WHERE User = 'electro_user';

-- Show databases again
SHOW DATABASES;
