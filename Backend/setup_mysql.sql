-- Create database for Electro Store
CREATE DATABASE IF NOT EXISTS electro_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user for Electro Store
CREATE USER IF NOT EXISTS 'electro_user'@'localhost' IDENTIFIED BY 'ElectroStore2024!';

-- Grant all privileges on electro_store database to electro_user
GRANT ALL PRIVILEGES ON electro_store.* TO 'electro_user'@'localhost';

-- Flush privileges to ensure changes take effect
FLUSH PRIVILEGES;

-- Show databases to confirm creation
SHOW DATABASES;

-- Show users to confirm user creation
SELECT User, Host FROM mysql.user WHERE User = 'electro_user';
