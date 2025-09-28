-- Check existing databases
SHOW DATABASES;

-- Check existing users
SELECT User, Host FROM mysql.user WHERE User = 'django_user';

-- Drop user if exists (to recreate)
DROP USER IF EXISTS 'django_user'@'localhost';

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS myproject CHARACTER SET utf8mb4;

-- Create user with password
CREATE USER 'django_user'@'localhost' IDENTIFIED BY 'DjangoPass123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON myproject.* TO 'django_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify user creation
SELECT User, Host FROM mysql.user WHERE User = 'django_user';

-- Show databases again
SHOW DATABASES;
