CREATE DATABASE myproject CHARACTER SET utf8mb4;
CREATE USER 'django_user'@'localhost' IDENTIFIED BY 'DjangoPass123!';
GRANT ALL ON myproject.* TO 'django_user'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES;
